# 🧐 Aristocratify

**"Hark! Transform thy modern blather into the most pompous of medieval aristocratic English."**

Aristocratify is a sophisticated Chrome Extension designed specifically for WhatsApp Web. It sits silently next to your message composer and, with a single click, rewrites your "stupid" modern text into a grand, verbose, and thoroughly aristocratic masterpiece using AI.

---

## 🏰 What it Does
Aristocratify intercepts your current draft, sends it to a local backend powered by **OpenRouter (Google Gemini 2.0 Flash)**, and replaces it in-place. It preserves your ability to edit the result before hitting send.

---

## 🏗️ How it Works (Under the Hood)

### 1. The Adapter Pattern
WhatsApp uses a complex, stateful editor (Lexical/React). You can't just change the `value` of the textbox. Aristocratify uses a **Layered Heuristic** engine to find the exact DOM node responsible for your draft, even as WhatsApp updates its UI.

### 2. Physical Signal Simulation (V6 Engine)
Modern web frameworks "protect" their text state. If a script simply deletes the text, React immediately restores it from memory. 

To bypass this, we built a **Keyboard Simulation Logic**:
- **Selection**: We dispatch a physical `Ctrl+A` electronic signal to the browser.
- **Atomic Deletion**: We dispatch a physical `Backspace` signal.
- **Reconciliation Delay**: We introduce a 50ms "breathing period" to allow React to flush its internal state and accept that the box is empty.
- **Simulated Paste**: We dispatch a `ClipboardEvent` containing the AI's rewrite. The browser treats this as a legitimate user action, ensuring the text stays in place and the framework synchronizes correctly.

### 3. Privacy-First Architecture
- **In-Memory Transformation**: The extension never stores your messages. 
- **User Agency**: The extension *never* sends the message for you. It only rewrites the draft, leaving you in total control of the "Send" button.

---

## 🚀 Getting Started (How-To)

### 1. Prerequisites
- **Node.js** installed on your machine.
- An **OpenRouter API Key** (you can get one at [openrouter.ai](https://openrouter.ai/)).

### 2. Backend Setup
1. Open the project folder in your terminal.
2. Create a file named `.env` in the root directory.
3. Add your key to the file:
   ```env
   OPENROUTER_API_KEY=your_key_here
   ```
4. Install dependencies and start the server:
   ```bash
   npm install
   node server.js
   ```
   *The backend must be running for the extension to work!*

### 3. Extension Installation
1. Open Chrome and go to `chrome://extensions`.
2. Toggle **Developer mode** (top right).
3. Click **Load unpacked**.
4. Select the `aristocratify` project folder.

### 4. Go For It!
1. Open [web.whatsapp.com](https://web.whatsapp.com).
2. Type something in a chat.
3. Click the 🧐 button that appears above your text.
4. **Behold the transformation.**

---

## 📜 Repository Baseline
This project was built with a strict **Constitution of Quality**:
- **Zero-Ambiguity State Machine**: The button only appears when there is text to rewrite.
- **Framework Resilience**: Designed to withstand the constant DOM changes of WhatsApp.
- **Aesthetic Integration**: Styled to feel like an organic part of the WhatsApp interface.

---
*Built with utmost diligence and a touch of madness.* 🎩✨
