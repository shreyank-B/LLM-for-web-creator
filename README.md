# ARCA AI Website Generator ✨

ARCA is a state-of-the-art, AI-powered website generator that builds beautiful, responsive interfaces from natural language descriptions. Built for growth, not for the hassle.

## Features
- **Instant Generation**: Describe your vision, and ARCA writes the HTML, CSS, and JS.
- **Tri-Model Support**: Powered by Google Gemini 2.0 Flash, OpenAI GPT-4o, and Groq Llama 3.3.
- **Premium UI Environment**: A deeply immersive, animated glassmorphism interface.
- **Responsive Previews**: Switch instantly between Desktop, Tablet, and Mobile viewing modes.
- **1-Click Export**: Download single-file HTML or complete ZIP packages comprising HTML/CSS/JS.
- **Fully Responsive App**: The entire ARCA workspace stacks gracefully for smartphone use on the go.

## Quick Start (Local Setup)

The architecture leverages a lightweight Node.js Server (`proxy.js`) to process external AI API calls without revealing your secure API keys inside the client-side browser, while standard static hosting covers the UI (`index.html`).

### 1. Launching on Windows 
Simply double-click the `start_arca.bat` file in this directory. 
- It will automatically launch the backend proxy.
- It will automatically open the generator in your default browser.

### 2. Launching Manually (Any OS)
1. Open a terminal and run the proxy server:
   ```bash
   node proxy.js
   ```
2. Open `index.html` in your favorite web browser (or serve the folder using `npx serve .`).

## Deployment (Public Domain)
To launch ARCA online:
1. Host the `proxy.js` file on a Node.js-compatible service (e.g., Render, Railway, Vercel Functions).
2. Inside `index.html`, update the `localhost:3001` fetch endpoints to point to your new proxy URL.
3. Host `index.html` natively on any free static CDNs (e.g., Vercel, Netlify, GitHub Pages) and link your custom domain!

Enjoy generating your websites with ARCA!
