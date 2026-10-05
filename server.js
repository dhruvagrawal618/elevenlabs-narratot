/**
 * AuraVoice — Secure Backend Proxy & Static File Server
 * Keeps ElevenLabs API key secure on the backend and proxies TTS, Voices, and Models.
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Simple .env parser
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...values] = trimmed.split('=');
        if (key) {
          const val = values.join('=').trim().replace(/(^['"]|['"]$)/g, '');
          process.env[key.trim()] = val;
        }
      }
    });
  }
}

loadEnv();

let API_KEY = process.env.ELEVENLABS_API_KEY || '';
const PORT = process.env.PORT || 5173;

// Helper to make HTTPS requests to ElevenLabs
function makeElevenLabsRequest(path, method = 'GET', body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const key = API_KEY.trim();
    const reqHeaders = {
      'xi-api-key': key,
      'User-Agent': 'AuraVoice-Studio/1.0',
      ...headers
    };

    if (body && typeof body === 'object' && !Buffer.isBuffer(body)) {
      body = JSON.stringify(body);
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(body);
    }

    const options = {
      hostname: 'api.elevenlabs.io',
      port: 443,
      path: path,
      method: method,
      headers: reqHeaders
    };

    const req = https.request(options, (res) => {
      resolve(res);
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (body) {
      req.write(body);
    }
    req.end();
  });
}

// Fallback models when key is invalid or offline
const FALLBACK_MODELS = [
  {
    model_id: "eleven_multilingual_v2",
    name: "Eleven Multilingual v2",
    description: "29 Languages, Best Quality & Nuance",
    can_do_text_to_speech: true
  },
  {
    model_id: "eleven_flash_v2_5",
    name: "Eleven Flash v2.5",
    description: "32 Languages, ~75ms Ultra-Low Latency",
    can_do_text_to_speech: true
  },
  {
    model_id: "eleven_turbo_v2_5",
    name: "Eleven Turbo v2.5",
    description: "32 Languages, High Speed & Natural Tone",
    can_do_text_to_speech: true
  },
  {
    model_id: "eleven_monolingual_v1",
    name: "Eleven English v1",
    description: "Classic English Legacy Model",
    can_do_text_to_speech: true
  }
];

// Fallback curated voices
const FALLBACK_VOICES = [
  {
    voice_id: "21m00Tcm4TlvDq8ikWAM",
    name: "Rachel",
    category: "premade",
    labels: { accent: "American", gender: "female", age: "young", description: "Calm, warm, articulate narration" },
    preview_url: "https://storage.googleapis.com/eleven-public-cdn/audio/voices/rachel.mp3"
  },
  {
    voice_id: "pNInz6obpgDQGcFmaJgB",
    name: "Adam",
    category: "premade",
    labels: { accent: "American", gender: "male", age: "middle aged", description: "Deep, resonant, confident voiceover" },
    preview_url: "https://storage.googleapis.com/eleven-public-cdn/audio/voices/adam.mp3"
  },
  {
    voice_id: "EXAVITQu4vr4xnSDxMaL",
    name: "Bella",
    category: "premade",
    labels: { accent: "American", gender: "female", age: "young", description: "Soft, engaging, expressive narrative" },
    preview_url: "https://storage.googleapis.com/eleven-public-cdn/audio/voices/bella.mp3"
  },
  {
    voice_id: "ErXwobaYiN019PkySvjV",
    name: "Antoni",
    category: "premade",
    labels: { accent: "American", gender: "male", age: "young", description: "Energetic, dramatic, storytelling" },
    preview_url: "https://storage.googleapis.com/eleven-public-cdn/audio/voices/antoni.mp3"
  },
  {
    voice_id: "XB0fDUnXU5powFXDhCwa",
    name: "Charlotte",
    category: "premade",
    labels: { accent: "Swedish/English", gender: "female", age: "middle aged", description: "Seductive, mysterious, elegant" },
    preview_url: "https://storage.googleapis.com/eleven-public-cdn/audio/voices/charlotte.mp3"
  },
  {
    voice_id: "JBFqnCBsd6RMkjVDRZzb",
    name: "George",
    category: "premade",
    labels: { accent: "British", gender: "male", age: "middle aged", description: "Warm raspy British storyteller" },
    preview_url: "https://storage.googleapis.com/eleven-public-cdn/audio/voices/george.mp3"
  },
  {
    voice_id: "TxGEqnHWrfWFTfGW9XjX",
    name: "Josh",
    category: "premade",
    labels: { accent: "American", gender: "male", age: "young", description: "Deep, natural conversational podcast tone" },
    preview_url: "https://storage.googleapis.com/eleven-public-cdn/audio/voices/josh.mp3"
  },
  {
    voice_id: "AZnzlk1XvdvUeBnXmlld",
    name: "Domi",
    category: "premade",
    labels: { accent: "American", gender: "female", age: "young", description: "Strong, decisive, journalistic" },
    preview_url: "https://storage.googleapis.com/eleven-public-cdn/audio/voices/domi.mp3"
  },
  {
    voice_id: "MF3mGyEYCl7XYWbV9V6O",
    name: "Elli",
    category: "premade",
    labels: { accent: "American", gender: "female", age: "young", description: "Gentle, friendly, conversational" },
    preview_url: "https://storage.googleapis.com/eleven-public-cdn/audio/voices/elli.mp3"
  },
  {
    voice_id: "VR6AewLTigWG4xSOukaG",
    name: "Arnold",
    category: "premade",
    labels: { accent: "American", gender: "male", age: "middle aged", description: "Authoritative, crisp, cinematic" },
    preview_url: "https://storage.googleapis.com/eleven-public-cdn/audio/voices/arnold.mp3"
  }
];

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg'
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost:5173'}`);
  const pathname = parsedUrl.pathname;

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, xi-api-key');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API Route: Status & Verification
  if (pathname === '/api/status' && req.method === 'GET') {
    res.setHeader('Content-Type', 'application/json');
    const isConfigured = Boolean(API_KEY && API_KEY.trim().length > 0);
    const isSecretFormat = API_KEY.trim().startsWith('sk_');
    const isKeyIdFormat = /^[0-9a-fA-F]{32,64}$/.test(API_KEY.trim());

    if (!isConfigured) {
      res.writeHead(200);
      return res.end(JSON.stringify({
        configured: false,
        valid: false,
        message: 'No ElevenLabs API key found in server environment (.env).'
      }));
    }

    try {
      const testRes = await makeElevenLabsRequest('/v1/user');
      let data = '';
      testRes.on('data', chunk => data += chunk);
      testRes.on('end', () => {
        if (testRes.statusCode === 200) {
          res.writeHead(200);
          res.end(JSON.stringify({
            configured: true,
            valid: true,
            message: 'Connected to ElevenLabs API successfully.',
            maskedKey: API_KEY.slice(0, 4) + '...' + API_KEY.slice(-4)
          }));
        } else {
          let parsed;
          try { parsed = JSON.parse(data); } catch(e) { parsed = { message: data }; }
          const errorMsg = parsed.detail?.message || parsed.message || 'ElevenLabs authentication failed';
          
          res.writeHead(200);
          res.end(JSON.stringify({
            configured: true,
            valid: false,
            error: errorMsg,
            isKeyId: isKeyIdFormat || errorMsg.includes('API key ID used as API key'),
            message: errorMsg,
            maskedKey: API_KEY.slice(0, 4) + '...' + API_KEY.slice(-4)
          }));
        }
      });
    } catch (err) {
      res.writeHead(200);
      res.end(JSON.stringify({
        configured: true,
        valid: false,
        error: err.message,
        message: 'Unable to connect to ElevenLabs API servers.'
      }));
    }
    return;
  }

  // API Route: Get Models
  if (pathname === '/api/models' && req.method === 'GET') {
    res.setHeader('Content-Type', 'application/json');
    if (!API_KEY) {
      res.writeHead(200);
      return res.end(JSON.stringify({ models: FALLBACK_MODELS, source: 'fallback' }));
    }

    try {
      const modelsRes = await makeElevenLabsRequest('/v1/models');
      let data = '';
      modelsRes.on('data', chunk => data += chunk);
      modelsRes.on('end', () => {
        if (modelsRes.statusCode === 200) {
          try {
            const json = JSON.parse(data);
            const models = Array.isArray(json) ? json : (json.models || FALLBACK_MODELS);
            res.writeHead(200);
            return res.end(JSON.stringify({ models: models, source: 'elevenlabs' }));
          } catch(e) {
            res.writeHead(200);
            return res.end(JSON.stringify({ models: FALLBACK_MODELS, source: 'fallback' }));
          }
        } else {
          res.writeHead(200);
          return res.end(JSON.stringify({ models: FALLBACK_MODELS, source: 'fallback' }));
        }
      });
    } catch(err) {
      res.writeHead(200);
      return res.end(JSON.stringify({ models: FALLBACK_MODELS, source: 'fallback' }));
    }
    return;
  }

  // API Route: Get Voices
  if (pathname === '/api/voices' && req.method === 'GET') {
    res.setHeader('Content-Type', 'application/json');
    if (!API_KEY) {
      res.writeHead(200);
      return res.end(JSON.stringify({ voices: FALLBACK_VOICES, source: 'fallback' }));
    }

    try {
      const voicesRes = await makeElevenLabsRequest('/v1/voices');
      let data = '';
      voicesRes.on('data', chunk => data += chunk);
      voicesRes.on('end', () => {
        if (voicesRes.statusCode === 200) {
          try {
            const json = JSON.parse(data);
            res.writeHead(200);
            return res.end(JSON.stringify({ voices: json.voices || FALLBACK_VOICES, source: 'elevenlabs' }));
          } catch(e) {
            res.writeHead(200);
            return res.end(JSON.stringify({ voices: FALLBACK_VOICES, source: 'fallback' }));
          }
        } else {
          let errDetail = 'Failed to fetch voices from ElevenLabs';
          try {
            const parsed = JSON.parse(data);
            errDetail = parsed.detail?.message || parsed.message || errDetail;
          } catch(e) {}
          res.writeHead(200);
          return res.end(JSON.stringify({ voices: FALLBACK_VOICES, source: 'fallback', error: errDetail }));
        }
      });
    } catch (err) {
      res.writeHead(200);
      return res.end(JSON.stringify({ voices: FALLBACK_VOICES, source: 'fallback', error: err.message }));
    }
    return;
  }

  // API Route: Text-to-Speech (TTS Proxy)
  if (pathname === '/api/tts' && req.method === 'POST') {
    let bodyData = '';
    req.on('data', chunk => bodyData += chunk);
    req.on('end', async () => {
      try {
        const payload = JSON.parse(bodyData);
        const { text, voice_id, model_id, voice_settings } = payload;

        if (!text || !text.trim()) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Text content is required for speech synthesis.' }));
        }

        const voice = voice_id || '21m00Tcm4TlvDq8ikWAM';
        const model = model_id || 'eleven_multilingual_v2';
        const ttsPath = `/v1/text-to-speech/${voice}?output_format=mp3_44100_128`;

        const requestBody = {
          text: text,
          model_id: model,
          voice_settings: voice_settings || {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true
          }
        };

        const ttsRes = await makeElevenLabsRequest(ttsPath, 'POST', requestBody, {
          'Accept': 'audio/mpeg'
        });

        if (ttsRes.statusCode === 200) {
          res.writeHead(200, {
            'Content-Type': 'audio/mpeg',
            'Transfer-Encoding': 'chunked',
            'Cache-Control': 'no-cache'
          });
          ttsRes.pipe(res);
        } else {
          let errData = '';
          ttsRes.on('data', chunk => errData += chunk);
          ttsRes.on('end', () => {
            let errorMsg = `ElevenLabs TTS failed with status ${ttsRes.statusCode}`;
            let parsedErr = null;
            try {
              parsedErr = JSON.parse(errData);
              errorMsg = parsedErr.detail?.message || parsedErr.message || errorMsg;
            } catch(e) {}

            res.writeHead(ttsRes.statusCode, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              error: errorMsg,
              detail: parsedErr,
              status: ttsRes.statusCode
            }));
          });
        }
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message || 'Internal server error processing TTS' }));
      }
    });
    return;
  }

  // API Route: Update Server Key
  if (pathname === '/api/config-key' && req.method === 'POST') {
    let bodyData = '';
    req.on('data', chunk => bodyData += chunk);
    req.on('end', () => {
      try {
        const { key } = JSON.parse(bodyData);
        if (typeof key === 'string') {
          API_KEY = key.trim();
          // Update .env file securely
          const envPath = path.join(__dirname, '.env');
          fs.writeFileSync(envPath, `ELEVENLABS_API_KEY=${API_KEY}\nPORT=${PORT}\n`, 'utf8');

          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({
            success: true,
            message: 'Server API key updated successfully.'
          }));
        }
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid key payload' }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // Static File Serving
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);

  // Security check: ensure path is within directory
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  // Never serve .env or .git files
  if (filePath.includes('.env') || filePath.includes('.git')) {
    res.writeHead(403);
    return res.end('Access Denied');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Internal Server Error');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`AuraVoice Server running at http://localhost:${PORT}`);
});
