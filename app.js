/**
 * AuraVoice Studio — Client-Side Application Controller
 * Connects securely to backend proxy (/api/models, /api/voices, /api/tts, /api/status)
 * Never hardcodes API keys in the frontend.
 */

// ==========================================
// Curated Default Fallback Voices & Presets
// ==========================================
const CURATED_VOICES = [
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

const MODEL_SPECS = {
  eleven_multilingual_v2: {
    name: "Eleven Multilingual v2",
    languages: "29 Languages",
    latency: "High-Fidelity Standard (~350ms)",
    bestFor: "Audiobooks, Storytelling, Emotional Depth & Nuance"
  },
  eleven_flash_v2_5: {
    name: "Eleven Flash v2.5",
    languages: "32 Languages",
    latency: "Ultra-Low Latency (~75ms)",
    bestFor: "Real-time Conversational Agents & Interactive Apps"
  },
  eleven_turbo_v2_5: {
    name: "Eleven Turbo v2.5",
    languages: "32 Languages",
    latency: "Fast Turnaround (~150ms)",
    bestFor: "General Narration, High Throughput, Video Dubbing"
  },
  eleven_monolingual_v1: {
    name: "Eleven English v1",
    languages: "English Only",
    latency: "Classic Speed",
    bestFor: "Legacy English Voiceover & Traditional Character Acting"
  }
};

const SAMPLE_SCRIPTS = {
  scifi: "We crossed the event horizon just as the stellar core began to collapse. All sensors went blind, save for the rhythmic pulse of our sub-light drive echo-locating into the deep unknown. If anyone receives this transmission... the theories were right. Space is not empty; it sings.",
  documentary: "High above the canopy of the Monteverde cloud forest, dawn arrives not with sudden light, but with a slow, iridescent mist. Millions of undiscovered organisms awaken to greet a canopy that has stood untouched for millennia.",
  audiobook: "The clockwork raven perched upon the obsidian mantelpiece clicked twice, its ruby eyes catching the dying amber embers. Lord Ravenscroft picked up the unbroken seal, knowing that once broken, the empire would never sleep again.",
  podcast: "Welcome back to Tech Horizon! Today we're diving deep into the future of synthetic intelligence, neural speech generation, and how real-time generative models are redefining human communication across the globe.",
  motivational: "The difference between ordinary and extraordinary is that little extra courage when the storm hits. Every champion was once a contender that simply refused to surrender."
};

// ==========================================
// Application State (Zero Hardcoded Keys)
// ==========================================
const state = {
  serverConfigured: false,
  serverValid: false,
  serverMessage: "",
  isKeyId: false,
  demoMode: localStorage.getItem("elevenlabs_demo_mode") === "true",

  voices: [...CURATED_VOICES],
  models: [],
  selectedVoiceId: CURATED_VOICES[0].voice_id,
  selectedModel: "eleven_multilingual_v2",

  voiceSettings: {
    stability: 0.50,
    similarity_boost: 0.75,
    style: 0.00,
    use_speaker_boost: true
  },

  currentAudioUrl: null,
  currentAudioBlob: null,
  currentAudioText: "",
  isPlaying: false,
  isSynthesizing: false,
  playbackSpeed: 1.0,

  history: JSON.parse(localStorage.getItem("auravoice_history") || "[]")
};

// ==========================================
// Web Audio API & Visualizer Setup
// ==========================================
let audioContext = null;
let analyserNode = null;
let audioSourceNode = null;
let animationFrameId = null;

// ==========================================
// DOM Element References
// ==========================================
const elements = {
  // Navigation & Settings
  apiKeyStatusBtn: document.getElementById("apiKeyStatusBtn"),
  openSettingsBtn: document.getElementById("openSettingsBtn"),
  settingsModal: document.getElementById("settingsModal"),
  closeSettingsModalBtn: document.getElementById("closeSettingsModalBtn"),
  cancelSettingsBtn: document.getElementById("cancelSettingsBtn"),
  saveApiKeyBtn: document.getElementById("saveApiKeyBtn"),
  apiKeyInput: document.getElementById("apiKeyInput"),
  toggleApiKeyVisibilityBtn: document.getElementById("toggleApiKeyVisibilityBtn"),
  syncVoicesBtn: document.getElementById("syncVoicesBtn"),
  demoModeToggle: document.getElementById("demoModeToggle"),
  sidebarConfigKeyBtn: document.getElementById("sidebarConfigKeyBtn"),

  // Input & Presets
  textInput: document.getElementById("textInput"),
  pasteTextBtn: document.getElementById("pasteTextBtn"),
  clearTextBtn: document.getElementById("clearTextBtn"),
  charCount: document.getElementById("charCount"),
  wordCount: document.getElementById("wordCount"),
  estTime: document.getElementById("estTime"),
  presetChips: document.querySelectorAll(".preset-chips .chip"),

  // Controls & Dropdowns
  modelSelect: document.getElementById("modelSelect"),
  voiceSelect: document.getElementById("voiceSelect"),
  previewVoiceSampleBtn: document.getElementById("previewVoiceSampleBtn"),
  toggleAdvancedSettingsBtn: document.getElementById("toggleAdvancedSettingsBtn"),
  advancedSettingsPanel: document.getElementById("advancedSettingsPanel"),

  // Sliders
  stabilityRange: document.getElementById("stabilityRange"),
  stabilityVal: document.getElementById("stabilityVal"),
  similarityRange: document.getElementById("similarityRange"),
  similarityVal: document.getElementById("similarityVal"),
  styleRange: document.getElementById("styleRange"),
  styleVal: document.getElementById("styleVal"),
  speakerBoostToggle: document.getElementById("speakerBoostToggle"),

  // CTA Action Buttons
  generatePlayBtn: document.getElementById("generatePlayBtn"),
  stopPlaybackBtn: document.getElementById("stopPlaybackBtn"),

  // Audio Player & Visualizer
  playerCard: document.getElementById("playerCard"),
  nativeAudioPlayer: document.getElementById("nativeAudioPlayer"),
  waveformCanvas: document.getElementById("waveformCanvas"),
  nowPlayingTitle: document.getElementById("nowPlayingTitle"),
  nowPlayingMeta: document.getElementById("nowPlayingMeta"),
  downloadAudioBtn: document.getElementById("downloadAudioBtn"),
  playPauseAudioBtn: document.getElementById("playPauseAudioBtn"),
  progressTrack: document.getElementById("progressTrack"),
  progressBar: document.getElementById("progressBar"),
  progressHandle: document.getElementById("progressHandle"),
  currentTime: document.getElementById("currentTime"),
  totalDuration: document.getElementById("totalDuration"),
  volumeSlider: document.getElementById("volumeSlider"),
  volumeIcon: document.getElementById("volumeIcon"),
  speedButtons: document.querySelectorAll(".speed-btn"),

  // Sidebar Specs & History
  specModelName: document.getElementById("specModelName"),
  specModelLang: document.getElementById("specModelLang"),
  specModelLatency: document.getElementById("specModelLatency"),
  specModelBestFor: document.getElementById("specModelBestFor"),
  historyList: document.getElementById("historyList"),
  clearHistoryBtn: document.getElementById("clearHistoryBtn"),

  // Toasts
  toastContainer: document.getElementById("toastContainer")
};

// ==========================================
// Application Bootstrap
// ==========================================
document.addEventListener("DOMContentLoaded", async () => {
  setupEventListeners();
  initCanvasVisualizer();
  renderHistory();

  // Populate sample text if empty
  if (!elements.textInput.value) {
    elements.textInput.value = SAMPLE_SCRIPTS.scifi;
    updateTextStats();
  }

  // Check Backend Status & Load Voices/Models
  await checkServerStatus();
  await loadAvailableModels();
  await loadAvailableVoices();
});

// ==========================================
// Server Status & API Verification
// ==========================================
async function checkServerStatus() {
  try {
    const res = await fetch("/api/status");
    if (!res.ok) throw new Error("Status endpoint unavailable");
    const data = await res.json();

    state.serverConfigured = data.configured;
    state.serverValid = data.valid;
    state.serverMessage = data.message || "";
    state.isKeyId = Boolean(data.isKeyId);

    updateStatusBadge();
  } catch (err) {
    console.warn("Could not fetch server status:", err);
    updateStatusBadge();
  }
}

function updateStatusBadge() {
  elements.demoModeToggle.checked = state.demoMode;

  if (state.serverValid) {
    elements.apiKeyStatusBtn.className = "status-pill configured";
    elements.apiKeyStatusBtn.querySelector(".status-label").textContent = "Connected (ElevenLabs)";
  } else if (state.isKeyId) {
    elements.apiKeyStatusBtn.className = "status-pill not-configured";
    elements.apiKeyStatusBtn.querySelector(".status-label").textContent = "Key ID (Requires sk_ Key)";
  } else if (state.demoMode) {
    elements.apiKeyStatusBtn.className = "status-pill demo-active";
    elements.apiKeyStatusBtn.querySelector(".status-label").textContent = "Demo Mode (Active)";
  } else if (state.serverConfigured) {
    elements.apiKeyStatusBtn.className = "status-pill not-configured";
    elements.apiKeyStatusBtn.querySelector(".status-label").textContent = "Key Invalid / Check Key";
  } else {
    elements.apiKeyStatusBtn.className = "status-pill not-configured";
    elements.apiKeyStatusBtn.querySelector(".status-label").textContent = "API Key Required";
  }
}

// ==========================================
// Dynamic Model & Voice Fetching
// ==========================================
async function loadAvailableModels() {
  try {
    const res = await fetch("/api/models");
    const data = await res.json();

    if (data.models && Array.isArray(data.models) && data.models.length > 0) {
      state.models = data.models;
      populateModelDropdown(data.models);
    }
  } catch (err) {
    console.warn("Using default models:", err);
  }
}

function populateModelDropdown(models) {
  elements.modelSelect.innerHTML = "";

  models.forEach(m => {
    // Only include models that can do TTS
    if (m.can_do_text_to_speech !== false) {
      const opt = document.createElement("option");
      opt.value = m.model_id;
      const desc = m.description ? ` (${m.description.substring(0, 38)}...)` : "";
      opt.textContent = `${m.name || m.model_id}${desc}`;
      if (m.model_id === state.selectedModel) opt.selected = true;
      elements.modelSelect.appendChild(opt);
    }
  });

  // If previous selected model not in list, select first
  if (!elements.modelSelect.value && elements.modelSelect.options.length > 0) {
    elements.modelSelect.selectedIndex = 0;
    state.selectedModel = elements.modelSelect.value;
  }

  updateModelSpecs(state.selectedModel);
}

async function loadAvailableVoices() {
  try {
    const res = await fetch("/api/voices");
    const data = await res.json();

    if (data.voices && Array.isArray(data.voices) && data.voices.length > 0) {
      state.voices = data.voices;
      populateVoiceDropdown(data.voices);
    }

    if (data.error && state.isKeyId) {
      console.warn("ElevenLabs notice:", data.error);
    }
  } catch (err) {
    console.warn("Using fallback curated voices:", err);
    populateVoiceDropdown(CURATED_VOICES);
  }
}

function populateVoiceDropdown(voices) {
  elements.voiceSelect.innerHTML = "";

  voices.forEach(voice => {
    const id = voice.voice_id || voice.id;
    const opt = document.createElement("option");
    opt.value = id;
    const gender = voice.labels?.gender || "Voice";
    const accent = voice.labels?.accent || "Natural";
    opt.textContent = `${voice.name} — (${gender}, ${accent})`;
    if (id === state.selectedVoiceId) opt.selected = true;
    elements.voiceSelect.appendChild(opt);
  });

  if (!elements.voiceSelect.value && elements.voiceSelect.options.length > 0) {
    elements.voiceSelect.selectedIndex = 0;
    state.selectedVoiceId = elements.voiceSelect.value;
  }
}

function updateModelSpecs(modelKey) {
  const spec = MODEL_SPECS[modelKey] || {
    name: modelKey,
    languages: "Multilingual",
    latency: "Optimized Neural Speech",
    bestFor: "Real-time Narration & Dialogue"
  };

  elements.specModelName.textContent = spec.name;
  elements.specModelLang.textContent = spec.languages;
  elements.specModelLatency.textContent = spec.latency;
  elements.specModelBestFor.textContent = spec.bestFor;
}

// ==========================================
// Text Narration Trigger (Play Button)
// ==========================================
async function handleGenerateAndPlay() {
  const text = elements.textInput.value.trim();
  if (!text) {
    showToast("Please enter or paste some text first!", "warning");
    elements.textInput.focus();
    return;
  }

  // If Demo Mode is explicitly on
  if (state.demoMode && !state.serverValid) {
    handleDemoSpeechSynthesis(text);
    return;
  }

  setSynthesizingState(true);

  try {
    const selectedVoiceObj = state.voices.find(v => (v.voice_id || v.id) === state.selectedVoiceId) || { name: "Neural Voice" };
    showToast(`Synthesizing with ${selectedVoiceObj.name}...`, "info");

    const response = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: text,
        voice_id: state.selectedVoiceId,
        model_id: state.selectedModel,
        voice_settings: state.voiceSettings
      })
    });

    if (!response.ok) {
      let errJson = null;
      try { errJson = await response.json(); } catch(e) {}
      const errMsg = errJson?.error || errJson?.detail?.message || `HTTP ${response.status}: Synthesis failed`;
      throw new Error(errMsg);
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    playGeneratedAudio(audioUrl, audioBlob, text);

    // Save to session history
    const modelSpec = MODEL_SPECS[state.selectedModel] || { name: state.selectedModel };
    addHistoryItem({
      id: Date.now().toString(),
      text: text,
      voiceName: selectedVoiceObj.name,
      modelName: modelSpec.name,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      audioBlobUrl: audioUrl
    });

    showToast("Narration synthesized & playing!", "success");
  } catch (err) {
    console.error("TTS Synthesis Error:", err);

    if (err.message.includes("API key ID used as API key") || err.message.includes("api_key_id_used_as_api_key")) {
      showToast("ElevenLabs secret keys start with 'sk_...'. Key ID was detected instead.", "warning");
      openSettingsModal();
    } else if (err.message.includes("401") || err.message.toLowerCase().includes("invalid_api_key")) {
      showToast(`Authentication Error: ${err.message}`, "error");
      openSettingsModal();
    } else {
      showToast(`Synthesis failed: ${err.message}`, "error");
    }

    // Offer instant fallback if user wants to hear speech immediately
    if (!state.serverValid) {
      showToast("Playing preview via Interactive Demo Voice...", "info");
      handleDemoSpeechSynthesis(text);
    }
  } finally {
    setSynthesizingState(false);
  }
}

// ==========================================
// Interactive Demo Mode Fallback
// ==========================================
function handleDemoSpeechSynthesis(text) {
  if (!('speechSynthesis' in window)) {
    setSynthesizingState(false);
    showToast("Speech synthesis is not supported in this browser.", "error");
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);

  const browserVoices = window.speechSynthesis.getVoices();
  if (browserVoices.length > 0) {
    const selectedVoiceObj = state.voices.find(v => (v.voice_id || v.id) === state.selectedVoiceId);
    const preferFemale = selectedVoiceObj?.labels?.gender === "female";
    const foundVoice = browserVoices.find(v => (preferFemale ? /female|zira|samantha|karen|victoria/i.test(v.name) : /male|david|alex|daniel/i.test(v.name))) || browserVoices[0];
    if (foundVoice) utterance.voice = foundVoice;
  }

  utterance.rate = state.playbackSpeed;
  utterance.pitch = 1.0;

  utterance.onstart = () => {
    setSynthesizingState(false);
    state.isPlaying = true;
    updatePlayerUIForPlayback("AuraVoice — Interactive Narration", "Simulated speech synthesis (Web Speech Engine)");
    startSimulatedVisualizer();
  };

  utterance.onend = () => {
    state.isPlaying = false;
    updatePlayerUIPause();
    stopSimulatedVisualizer();
  };

  utterance.onerror = (e) => {
    setSynthesizingState(false);
    state.isPlaying = false;
    updatePlayerUIPause();
    stopSimulatedVisualizer();
  };

  window.speechSynthesis.speak(utterance);
}

// ==========================================
// Audio Playback & Web Audio Controls
// ==========================================
function playGeneratedAudio(audioUrl, blob, text) {
  state.currentAudioUrl = audioUrl;
  state.currentAudioBlob = blob;
  state.currentAudioText = text;

  const audio = elements.nativeAudioPlayer;
  audio.src = audioUrl;
  audio.playbackRate = state.playbackSpeed;
  audio.volume = parseFloat(elements.volumeSlider.value);

  setupAudioContext(audio);

  const voiceObj = state.voices.find(v => (v.voice_id || v.id) === state.selectedVoiceId) || { name: "ElevenLabs Voice" };
  const modelSpec = MODEL_SPECS[state.selectedModel] || { name: state.selectedModel };

  elements.nowPlayingTitle.textContent = `${voiceObj.name} — Narration`;
  elements.nowPlayingMeta.textContent = `${modelSpec.name} • ${text.substring(0, 50)}...`;
  elements.downloadAudioBtn.disabled = false;
  elements.playPauseAudioBtn.disabled = false;
  elements.stopPlaybackBtn.disabled = false;

  audio.play()
    .then(() => {
      state.isPlaying = true;
      updatePlayerUIForPlayback();
      if (audioContext && audioContext.state === "suspended") {
        audioContext.resume();
      }
      startWaveformAnimation();
    })
    .catch(err => {
      console.warn("Autoplay notice:", err);
      state.isPlaying = false;
      updatePlayerUIPause();
    });
}

function setupAudioContext(audioElement) {
  try {
    if (!audioContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioContext = new AudioCtx();
      analyserNode = audioContext.createAnalyser();
      analyserNode.fftSize = 256;
      analyserNode.smoothingTimeConstant = 0.8;

      audioSourceNode = audioContext.createMediaElementSource(audioElement);
      audioSourceNode.connect(analyserNode);
      analyserNode.connect(audioContext.destination);
    }
  } catch (err) {
    console.warn("Web Audio API setup warning:", err);
  }
}

function setSynthesizingState(loading) {
  state.isSynthesizing = loading;
  if (loading) {
    elements.generatePlayBtn.classList.add("loading");
    elements.generatePlayBtn.disabled = true;
  } else {
    elements.generatePlayBtn.classList.remove("loading");
    elements.generatePlayBtn.disabled = false;
  }
}

function updatePlayerUIForPlayback(title, meta) {
  elements.playerCard.classList.add("playing");
  elements.playPauseAudioBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
  elements.stopPlaybackBtn.disabled = false;
  if (title) elements.nowPlayingTitle.textContent = title;
  if (meta) elements.nowPlayingMeta.textContent = meta;
}

function updatePlayerUIPause() {
  elements.playerCard.classList.remove("playing");
  elements.playPauseAudioBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
}

function stopCurrentPlayback() {
  if (window.speechSynthesis && window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    stopSimulatedVisualizer();
  }

  const audio = elements.nativeAudioPlayer;
  audio.pause();
  audio.currentTime = 0;
  state.isPlaying = false;
  updatePlayerUIPause();
  elements.progressBar.style.width = "0%";
  elements.progressHandle.style.left = "0%";
  elements.currentTime.textContent = "0:00";
  elements.stopPlaybackBtn.disabled = true;
}

// ==========================================
// Canvas Waveform Visualizer
// ==========================================
let isVisualizerRunning = false;
let simulatedVisInterval = null;

function initCanvasVisualizer() {
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  drawIdleVisualizer();
}

function resizeCanvas() {
  const canvas = elements.waveformCanvas;
  const container = canvas.parentElement;
  if (container) {
    canvas.width = container.clientWidth * window.devicePixelRatio;
    canvas.height = container.clientHeight * window.devicePixelRatio;
  }
}

function drawIdleVisualizer() {
  const canvas = elements.waveformCanvas;
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);
  ctx.beginPath();
  ctx.strokeStyle = "rgba(139, 92, 246, 0.25)";
  ctx.lineWidth = 2 * window.devicePixelRatio;
  ctx.moveTo(0, h / 2);
  ctx.lineTo(w, h / 2);
  ctx.stroke();
}

function startWaveformAnimation() {
  if (isVisualizerRunning) return;
  isVisualizerRunning = true;

  const canvas = elements.waveformCanvas;
  const ctx = canvas.getContext("2d");

  function renderFrame() {
    if (!state.isPlaying) {
      isVisualizerRunning = false;
      drawIdleVisualizer();
      return;
    }

    animationFrameId = requestAnimationFrame(renderFrame);

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    if (analyserNode) {
      const bufferLength = analyserNode.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserNode.getByteFrequencyData(dataArray);

      const barCount = 48;
      const step = Math.floor(bufferLength / barCount);
      const barWidth = (w / barCount) * 0.65;
      const spacing = (w / barCount) * 0.35;

      for (let i = 0; i < barCount; i++) {
        const val = dataArray[i * step] / 255.0;
        const barHeight = Math.max(val * (h * 0.85), 4 * window.devicePixelRatio);
        const x = i * (barWidth + spacing) + spacing / 2;
        const y = (h - barHeight) / 2;

        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        gradient.addColorStop(0, "#c084fc");
        gradient.addColorStop(0.5, "#8b5cf6");
        gradient.addColorStop(1, "#06b6d4");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, y, barWidth, barHeight, 4 * window.devicePixelRatio);
        } else {
          ctx.rect(x, y, barWidth, barHeight);
        }
        ctx.fill();
      }
    }
  }

  renderFrame();
}

function startSimulatedVisualizer() {
  const canvas = elements.waveformCanvas;
  const ctx = canvas.getContext("2d");
  isVisualizerRunning = true;

  if (simulatedVisInterval) clearInterval(simulatedVisInterval);

  simulatedVisInterval = setInterval(() => {
    if (!state.isPlaying) {
      clearInterval(simulatedVisInterval);
      drawIdleVisualizer();
      return;
    }

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const barCount = 44;
    const barWidth = (w / barCount) * 0.65;
    const spacing = (w / barCount) * 0.35;

    for (let i = 0; i < barCount; i++) {
      const val = 0.2 + Math.random() * 0.75;
      const barHeight = Math.max(val * (h * 0.8), 4 * window.devicePixelRatio);
      const x = i * (barWidth + spacing) + spacing / 2;
      const y = (h - barHeight) / 2;

      const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
      gradient.addColorStop(0, "#06b6d4");
      gradient.addColorStop(0.5, "#6366f1");
      gradient.addColorStop(1, "#ec4899");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(x, y, barWidth, barHeight, 4 * window.devicePixelRatio);
      } else {
        ctx.rect(x, y, barWidth, barHeight);
      }
      ctx.fill();
    }
  }, 70);
}

function stopSimulatedVisualizer() {
  if (simulatedVisInterval) {
    clearInterval(simulatedVisInterval);
    simulatedVisInterval = null;
  }
  drawIdleVisualizer();
}

// ==========================================
// History Management
// ==========================================
function addHistoryItem(item) {
  state.history.unshift(item);
  if (state.history.length > 20) state.history.pop();
  localStorage.setItem("auravoice_history", JSON.stringify(state.history));
  renderHistory();
}

function renderHistory() {
  const container = elements.historyList;
  if (!state.history || state.history.length === 0) {
    container.innerHTML = `
      <div class="empty-history-state">
        <i class="fa-solid fa-waveform-lines"></i>
        <p>No narrations yet</p>
        <span>Generations in this session will be saved here for instant replay & download</span>
      </div>
    `;
    return;
  }

  container.innerHTML = "";
  state.history.forEach((item, index) => {
    const el = document.createElement("div");
    el.className = "history-item";
    el.innerHTML = `
      <div class="history-item-top">
        <span class="history-voice-badge">
          <i class="fa-solid fa-user-voice"></i> ${item.voiceName}
        </span>
        <span class="history-time">${item.timestamp}</span>
      </div>
      <p class="history-snippet">${escapeHtml(item.text)}</p>
      <div class="history-item-actions">
        <button class="btn-history-play" data-index="${index}">
          <i class="fa-solid fa-play"></i> Replay
        </button>
        <button class="btn-history-download" data-index="${index}">
          <i class="fa-solid fa-download"></i> MP3
        </button>
      </div>
    `;
    container.appendChild(el);
  });

  // Replay handlers
  container.querySelectorAll(".btn-history-play").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.dataset.index, 10);
      const item = state.history[idx];
      if (item && item.audioBlobUrl) {
        elements.nativeAudioPlayer.src = item.audioBlobUrl;
        setupAudioContext(elements.nativeAudioPlayer);
        elements.nowPlayingTitle.textContent = `${item.voiceName} — Replay`;
        elements.nowPlayingMeta.textContent = `${item.modelName} • ${item.text.substring(0, 40)}...`;
        elements.downloadAudioBtn.disabled = false;
        elements.playPauseAudioBtn.disabled = false;
        elements.stopPlaybackBtn.disabled = false;
        elements.nativeAudioPlayer.play();
        state.isPlaying = true;
        updatePlayerUIForPlayback();
        startWaveformAnimation();
      } else {
        showToast("Audio resource expired from session storage.", "warning");
      }
    });
  });

  // Download handlers
  container.querySelectorAll(".btn-history-download").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.dataset.index, 10);
      const item = state.history[idx];
      if (item && item.audioBlobUrl) {
        downloadAudioFile(item.audioBlobUrl, `elevenlabs-${item.voiceName.toLowerCase()}-${Date.now()}.mp3`);
      }
    });
  });
}

// ==========================================
// Text Metrics & Preset Utilities
// ==========================================
function updateTextStats() {
  const text = elements.textInput.value;
  const chars = text.length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  elements.charCount.textContent = `${chars.toLocaleString()} / 5,000 chars`;
  elements.wordCount.textContent = `${words.toLocaleString()} words`;

  const estSeconds = Math.round((words / 150) * 60);
  elements.estTime.innerHTML = `<i class="fa-regular fa-clock"></i> ~${estSeconds} sec`;
}

// ==========================================
// Settings Modal & API Key Sync
// ==========================================
function openSettingsModal() {
  elements.settingsModal.classList.add("open");
  elements.settingsModal.setAttribute("aria-hidden", "false");
  elements.apiKeyInput.focus();
}

function closeSettingsModal() {
  elements.settingsModal.classList.remove("open");
  elements.settingsModal.setAttribute("aria-hidden", "true");
}

async function handleSaveSettings() {
  const newKey = elements.apiKeyInput.value.trim();
  const demo = elements.demoModeToggle.checked;

  state.demoMode = demo;
  localStorage.setItem("elevenlabs_demo_mode", demo ? "true" : "false");

  if (newKey) {
    elements.saveApiKeyBtn.disabled = true;
    elements.saveApiKeyBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Saving to server...';

    try {
      const res = await fetch("/api/config-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: newKey })
      });

      if (!res.ok) throw new Error("Could not update key on server");

      showToast("API Key securely saved to server environment (.env)!", "success");
      elements.apiKeyInput.value = ""; // clear from input for security

      await checkServerStatus();
      await loadAvailableModels();
      await loadAvailableVoices();
    } catch (err) {
      showToast(`Error saving key: ${err.message}`, "error");
    } finally {
      elements.saveApiKeyBtn.disabled = false;
      elements.saveApiKeyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Save & Connect';
      closeSettingsModal();
    }
  } else {
    updateStatusBadge();
    closeSettingsModal();
    showToast(demo ? "Demo Mode activated!" : "Settings updated.", "info");
  }
}

// ==========================================
// Event Listeners Binding
// ==========================================
function setupEventListeners() {
  elements.textInput.addEventListener("input", updateTextStats);

  elements.pasteTextBtn.addEventListener("click", async () => {
    try {
      const text = await navigator.clipboard.readText();
      elements.textInput.value = text;
      updateTextStats();
      showToast("Pasted text from clipboard!", "info");
    } catch (err) {
      showToast("Clipboard access denied or unsupported.", "warning");
    }
  });

  elements.clearTextBtn.addEventListener("click", () => {
    elements.textInput.value = "";
    updateTextStats();
    elements.textInput.focus();
  });

  // Preset Chips
  elements.presetChips.forEach(chip => {
    chip.addEventListener("click", () => {
      const presetKey = chip.dataset.preset;
      if (SAMPLE_SCRIPTS[presetKey]) {
        elements.textInput.value = SAMPLE_SCRIPTS[presetKey];
        updateTextStats();
        showToast(`Loaded ${chip.textContent.trim()} preset!`, "info");
      }
    });
  });

  // Model & Voice Selects
  elements.modelSelect.addEventListener("change", (e) => {
    state.selectedModel = e.target.value;
    updateModelSpecs(state.selectedModel);
  });

  elements.voiceSelect.addEventListener("change", (e) => {
    state.selectedVoiceId = e.target.value;
  });

  // Preview Voice Sample
  elements.previewVoiceSampleBtn.addEventListener("click", () => {
    const voice = state.voices.find(v => (v.voice_id || v.id) === state.selectedVoiceId);
    const sample = voice?.preview_url || voice?.sampleUrl;
    if (sample) {
      const previewAudio = new Audio(sample);
      previewAudio.play().catch(() => showToast("Audio sample preview playback failed.", "warning"));
      showToast(`Playing timbre sample for ${voice.name}...`, "info");
    } else {
      showToast("Audio sample preview unavailable for this voice.", "warning");
    }
  });

  // Advanced Voice Settings Toggle
  elements.toggleAdvancedSettingsBtn.addEventListener("click", () => {
    const isExpanded = elements.toggleAdvancedSettingsBtn.getAttribute("aria-expanded") === "true";
    elements.toggleAdvancedSettingsBtn.setAttribute("aria-expanded", !isExpanded);
    elements.advancedSettingsPanel.classList.toggle("collapsed", isExpanded);
  });

  // Sliders
  elements.stabilityRange.addEventListener("input", (e) => {
    const val = parseInt(e.target.value, 10);
    elements.stabilityVal.textContent = `${val}%`;
    state.voiceSettings.stability = val / 100;
  });

  elements.similarityRange.addEventListener("input", (e) => {
    const val = parseInt(e.target.value, 10);
    elements.similarityVal.textContent = `${val}%`;
    state.voiceSettings.similarity_boost = val / 100;
  });

  elements.styleRange.addEventListener("input", (e) => {
    const val = parseInt(e.target.value, 10);
    elements.styleVal.textContent = `${val}%`;
    state.voiceSettings.style = val / 100;
  });

  elements.speakerBoostToggle.addEventListener("change", (e) => {
    state.voiceSettings.use_speaker_boost = e.target.checked;
  });

  // Play / Generate Main CTA Button
  elements.generatePlayBtn.addEventListener("click", handleGenerateAndPlay);
  elements.stopPlaybackBtn.addEventListener("click", stopCurrentPlayback);

  // Native Audio Player Events
  const audio = elements.nativeAudioPlayer;

  audio.addEventListener("timeupdate", () => {
    if (audio.duration) {
      const progress = (audio.currentTime / audio.duration) * 100;
      elements.progressBar.style.width = `${progress}%`;
      elements.progressHandle.style.left = `${progress}%`;
      elements.currentTime.textContent = formatTime(audio.currentTime);
      elements.totalDuration.textContent = formatTime(audio.duration);
    }
  });

  audio.addEventListener("ended", () => {
    state.isPlaying = false;
    updatePlayerUIPause();
  });

  audio.addEventListener("pause", () => {
    if (!audio.seeking) {
      state.isPlaying = false;
      updatePlayerUIPause();
    }
  });

  audio.addEventListener("play", () => {
    state.isPlaying = true;
    updatePlayerUIForPlayback();
    startWaveformAnimation();
  });

  // Play/Pause Button
  elements.playPauseAudioBtn.addEventListener("click", () => {
    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  });

  // Scrubber Click & Seek
  elements.progressTrack.addEventListener("click", (e) => {
    if (!audio.duration) return;
    const rect = elements.progressTrack.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = Math.min(Math.max(clickX / rect.width, 0), 1);
    audio.currentTime = percent * audio.duration;
  });

  // Volume Slider
  elements.volumeSlider.addEventListener("input", (e) => {
    audio.volume = parseFloat(e.target.value);
    if (audio.volume === 0) {
      elements.volumeIcon.className = "fa-solid fa-volume-xmark volume-icon";
    } else if (audio.volume < 0.5) {
      elements.volumeIcon.className = "fa-solid fa-volume-low volume-icon";
    } else {
      elements.volumeIcon.className = "fa-solid fa-volume-high volume-icon";
    }
  });

  // Speed Controls
  elements.speedButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      elements.speedButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.playbackSpeed = parseFloat(btn.dataset.speed);
      audio.playbackRate = state.playbackSpeed;
    });
  });

  // Download Current Audio
  elements.downloadAudioBtn.addEventListener("click", () => {
    if (state.currentAudioBlob) {
      const voiceObj = state.voices.find(v => (v.voice_id || v.id) === state.selectedVoiceId) || { name: "voice" };
      const filename = `auravoice-${voiceObj.name.toLowerCase()}-${Date.now()}.mp3`;
      downloadAudioFile(state.currentAudioUrl, filename);
    } else {
      showToast("No audio file available for download.", "warning");
    }
  });

  // History Clear
  elements.clearHistoryBtn.addEventListener("click", () => {
    state.history = [];
    localStorage.removeItem("auravoice_history");
    renderHistory();
    showToast("History cleared.", "info");
  });

  // Settings Modal Open/Close
  elements.openSettingsBtn.addEventListener("click", openSettingsModal);
  elements.apiKeyStatusBtn.addEventListener("click", openSettingsModal);
  elements.sidebarConfigKeyBtn.addEventListener("click", openSettingsModal);
  elements.closeSettingsModalBtn.addEventListener("click", closeSettingsModal);
  elements.cancelSettingsBtn.addEventListener("click", closeSettingsModal);

  elements.settingsModal.addEventListener("click", (e) => {
    if (e.target === elements.settingsModal) closeSettingsModal();
  });

  // Toggle API Key visibility
  elements.toggleApiKeyVisibilityBtn.addEventListener("click", () => {
    const isPass = elements.apiKeyInput.type === "password";
    elements.apiKeyInput.type = isPass ? "text" : "password";
    elements.toggleApiKeyVisibilityBtn.innerHTML = isPass ? '<i class="fa-regular fa-eye-slash"></i>' : '<i class="fa-regular fa-eye"></i>';
  });

  // Sync Voices
  elements.syncVoicesBtn.addEventListener("click", async () => {
    elements.syncVoicesBtn.disabled = true;
    elements.syncVoicesBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Fetching...';
    await loadAvailableVoices();
    elements.syncVoicesBtn.disabled = false;
    elements.syncVoicesBtn.innerHTML = '<i class="fa-solid fa-arrows-rotate"></i> Fetch Voices';
    showToast("Voices synced from server!", "success");
  });

  // Save Settings
  elements.saveApiKeyBtn.addEventListener("click", handleSaveSettings);
}

// ==========================================
// Helpers & Utilities
// ==========================================
function formatTime(seconds) {
  if (isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function downloadAudioFile(url, filename) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToast("Audio download started!", "success");
}

function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;

  let icon = "fa-circle-info";
  if (type === "success") icon = "fa-circle-check";
  if (type === "warning") icon = "fa-triangle-exclamation";
  if (type === "error") icon = "fa-circle-exclamation";

  toast.innerHTML = `
    <i class="fa-solid ${icon} toast-icon"></i>
    <span>${message}</span>
  `;

  elements.toastContainer.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      if (toast.parentElement) toast.parentElement.removeChild(toast);
    }, 300);
  }, 4200);
}
