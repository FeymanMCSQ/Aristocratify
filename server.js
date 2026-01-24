require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Invariant: No message logging in production (docs/00-constitution.md)
// We only log metadata for debugging if needed.

app.post('/rewrite', async (req, res) => {
    console.log(`[Server] Incoming request: ${req.method} ${req.path}`);
    const { text, mode, intensity } = req.body;

    if (!text || !mode) {
        console.warn(`[Server] Invalid input received: text=${!!text}, mode=${mode}`);
        return res.status(400).json({
            error: { code: 'INVALID_INPUT', message: 'Text and mode are required.' }
        });
    }

    console.log(`[Server] Processing rewrite request (Length: ${text.length}, Mode: ${mode})`);

    // System prompt as defined in docs/03-api-contract.md
    const systemPrompt = `Rewrite the user’s message into pompous aristocratic medieval English.
Preserve meaning, names, emojis, URLs, and structure.
Do not add facts.
Make it long winded and obnoxious and pompous.
Output only the rewritten message.`;

    try {
        console.log(`[Server] Calling OpenRouter AI...`);
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://github.com/aristocratify', // Required by OpenRouter
                'X-Title': 'Aristocratify'
            },
            body: JSON.stringify({
                model: 'google/gemini-2.0-flash-001',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: text }
                ],
                temperature: 0.7
            })
        });

        console.log(`[Server] OpenRouter response status: ${response.status}`);

        if (!response.ok) {
            const errorData = await response.json();
            console.error('[Server] OpenRouter Error Data:', JSON.stringify(errorData));
            return res.status(500).json({
                error: { code: 'PROVIDER_ERROR', message: 'AI provider failed.' }
            });
        }

        const data = await response.json();
        const rewrittenText = data.choices[0].message.content.trim();
        console.log(`[Server] Rewrite successful. Output length: ${rewrittenText.length}`);

        // Success response schema (docs/03-api-contract.md)
        res.json({ text: rewrittenText });

    } catch (error) {
        console.error('[Server] Critical Failure:', error);
        res.status(500).json({
            error: { code: 'INTERNAL_ERROR', message: 'Internal server error.' }
        });
    }
});

app.listen(PORT, () => {
    console.log(`Aristocratify Backend running at http://localhost:${PORT}`);
});
