# AuraVoice — ElevenLabs AI Narration Studio 🎙️✨

An ultra-modern, high-fidelity text-to-speech studio built with **HTML5, CSS3, JavaScript**, and a secure **Node.js API Proxy Server** that communicates with the **ElevenLabs API**.

---

## 🔒 Security Architecture (Zero Hardcoded Keys)

To keep your ElevenLabs credentials safe:
- **No Hardcoded Keys in Frontend**: Neither `index.html` nor `app.js` contain secret API keys.
- **Backend Environment (`.env`)**: Keys are loaded by `server.js` on the server-side via `.env` (`ELEVENLABS_API_KEY=...`).
- **`.gitignore` Protection**: `.env` is automatically ignored from git commits.
- **Proxy Endpoints**:
  - `GET /api/status`: Validates ElevenLabs authentication without exposing the secret key string.
  - `GET /api/models`: Dynamically fetches ElevenLabs speech synthesis models.
  - `GET /api/voices`: Dynamically fetches ElevenLabs voices from your account library.
  - `POST /api/tts`: Streams the binary audio directly from ElevenLabs to the browser player.
  - `POST /api/config-key`: Allows updating the key securely from the UI into `.env` without server restarts.

---

## ✨ Studio Features

- **Text Narration Input**:
  - High-capacity narration textarea supporting any text, story, or dialogue.
  - Real-time character count, word count, and estimated duration tracker.
  - 1-click **Paste from Clipboard** and **Clear** controls.
  - Quick **Preset Sample Prompts** (*Sci-Fi Odyssey, Nature Documentary, Gothic Mystery, Tech Podcast, Motivational Quote*).
- **Dynamic Model Selection Dropdown**:
  - Connected to `GET /api/models` for live ElevenLabs models (*Eleven Multilingual v2, Eleven Flash v2.5, Eleven Turbo v2.5, Eleven English v1*).
  - Live model specs widget displaying latency, languages, and ideal use cases.
- **Dynamic Voice Selection Dropdown**:
  - Connected to `GET /api/voices` for live account and curated voices.
  - Audio sample preview button to check timbre before generating.
- **Voice Customization Sliders**:
  - Stability, Clarity & Similarity Boost, Style Exaggeration, and Speaker Boost.
- **Real-Time Canvas Waveform Visualizer**:
  - Powered by the **Web Audio API** (`AnalyserNode`), rendering reactive gradient frequency bars during playback.
- **Interactive Audio Player**:
  - Scrubber progress track, Play/Pause, Stop, variable speed (`0.75x`, `1.0x`, `1.25x`, `1.5x`), volume slider, and **Download MP3** button.
- **Session History Reel**:
  - Saves your generated narrations with timestamps and instant replay buttons.

---

## 🚀 How to Run

1. Start the backend server:
   ```bash
   node server.js
   ```
2. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

---

## 🔑 ElevenLabs Key Configuration

Your key is stored in `.env`:
```env
ELEVENLABS_API_KEY=your_key_here
PORT=5173
```

> **Note on ElevenLabs Secret Keys:**  
> ElevenLabs secret keys begin with **`sk_...`** (generated at [elevenlabs.io/app/settings/api-keys](https://elevenlabs.io/app/settings/api-keys)).  
> If an API Key ID (public identifier) is used, the app will alert you and guide you to rotate or generate an `sk_` secret key.
