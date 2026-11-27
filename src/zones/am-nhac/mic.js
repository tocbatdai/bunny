// Mic vui: an animal on a stage dances to the child's voice; 🔴 records 5 seconds, then the
// recording plays back as it is (🙂), as a mouse (🐭, faster and higher), a bear (🐻, slower and
// lower) or with an echo (🏔️).
// Privacy: the sound stays in memory on this device, is never sent anywhere, and is dropped when
// the child leaves this screen. The microphone is switched off as soon as recording ends (and
// before anything plays, so the speaker never feeds back into the mic).
import { $ } from "../../shared/dom.js";
import { audioContext, unlockAudio, soundOn, tone } from "../../shared/sound.js";
import { back } from "../../router.js";
import { ANIMALS } from "../nhan-biet/animals.js";

const RECORD_SECONDS = 5;
const VOICES = [
  { id: "thuong", icon: "🙂", label: "Giọng của bé", rate: 1 },
  { id: "chuot", icon: "🐭", label: "Giọng chuột", rate: 1.7 },
  { id: "gau", icon: "🐻", label: "Giọng gấu", rate: 0.62 },
  { id: "vong", icon: "🏔️", label: "Giọng vọng", rate: 1, echo: true },
];
const PERFORMERS = ["meo", "ech", "ga", "khi", "lon", "cho", "rong", "ho", "vit"].map((id) => ANIMALS.find((a) => a.id === id)).filter(Boolean);

const m = {
  mode: "off",          // off | asking | listen | rec | ready | play
  stream: null, source: null, analyser: null, proc: null,
  chunks: [], buffer: null, player: null, playAnalyser: null,
  raf: 0, recTimer: 0, recStart: 0, level: 0, performer: 0, sparkleAt: 0,
};

/* ------------------------------------------------------------- open / close */
export function showMic() {
  $("#mic").hidden = false; document.body.style.overflow = "hidden";
  drawPerformer();
  setMode(m.buffer ? "ready" : "off");
}
export function hideMic() {
  if ($("#mic").hidden) return;
  stopPlayback(); stopMic();
  m.buffer = null; m.chunks = [];
  $("#mic").hidden = true; document.body.style.overflow = "";
  $("#mic-msg").hidden = true;
}
document.addEventListener("visibilitychange", () => { if (document.hidden && m.stream) { stopMic(); setMode(m.buffer ? "ready" : "off"); } });

/* ---------------------------------------------------------------- controls */
function setMode(mode) {
  m.mode = mode;
  const c = $("#mic-controls");
  if (mode === "off" || mode === "asking") {
    c.innerHTML = `<button class="round-btn big primary" type="button" data-act="mic-on" aria-label="Bật mic"${mode === "asking" ? " disabled" : ""}>🎤</button>`;
  } else if (mode === "listen") {
    c.innerHTML = `<button class="round-btn big rec-btn" type="button" data-act="rec" aria-label="Thu giọng ${RECORD_SECONDS} giây">🔴</button>`;
  } else if (mode === "rec") {
    c.innerHTML = `<button class="round-btn big rec-btn recording" type="button" disabled aria-label="Đang thu"><span class="rec-ring" aria-hidden="true"></span>🔴</button>`;
  } else {
    c.innerHTML = VOICES.map((v) => `<button class="round-btn big voice-btn" type="button" data-act="play" data-v="${v.id}" aria-label="${v.label}">${v.icon}</button>`).join("")
      + `<button class="round-btn big primary" type="button" data-act="mic-on" aria-label="Thu lại">🎤</button>`;
  }
  $("#mic-stage").classList.toggle("live", mode === "listen" || mode === "rec" || mode === "play");
}
$("#mic-controls").addEventListener("click", (e) => {
  const b = e.target.closest("[data-act]"); if (!b || b.disabled) return;
  unlockAudio();
  if (b.dataset.act === "mic-on") startMic();
  else if (b.dataset.act === "rec") startRecording();
  else play(VOICES.find((v) => v.id === b.dataset.v), b);
});
$("#mic-back").addEventListener("click", () => back("am-nhac"));

function say(text) {
  const p = $("#mic-msg");
  p.textContent = text; p.hidden = !text;
}

/* --------------------------------------------------------------- performer */
function drawPerformer() { $("#mic-star").innerHTML = PERFORMERS[m.performer].svg(); $("#mic-star").setAttribute("aria-label", "Đổi bạn hát: " + PERFORMERS[m.performer].name); }
$("#mic-star").addEventListener("click", () => {
  m.performer = (m.performer + 1) % PERFORMERS.length; drawPerformer();
  if (m.mode !== "rec") tone(523 + m.performer * 30, { dur: 0.15, vol: 0.05, type: "triangle", slide: 1.4 });
});

/* --------------------------------------------------------------- microphone */
async function startMic() {
  stopPlayback(); say("");
  const md = navigator.mediaDevices;
  if (!md || !md.getUserMedia || !window.isSecureContext) { say("🙊 Máy này chưa dùng được micro."); return; }
  setMode("asking");
  try {
    try { if (navigator.audioSession) navigator.audioSession.type = "play-and-record"; } catch {}
    m.stream = await md.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: true, autoGainControl: true } });
  } catch (err) {
    try { if (navigator.audioSession) navigator.audioSession.type = "playback"; } catch {}
    setMode(m.buffer ? "ready" : "off");
    say(err && err.name === "NotFoundError" ? "🙊 Không tìm thấy micro." : "🙊 Nhờ bố mẹ cho phép dùng micro nhé.");
    return;
  }
  if ($("#mic").hidden) { stopMic(); return; }   // left the screen while the permission prompt was open
  const c = audioContext();
  m.source = c.createMediaStreamSource(m.stream);
  m.analyser = c.createAnalyser(); m.analyser.fftSize = 1024;
  m.source.connect(m.analyser);
  // Recording: copy raw samples while m.mode is "rec" (the processor's output is silence).
  m.proc = c.createScriptProcessor(4096, 1, 1);
  m.proc.onaudioprocess = (e) => { if (m.mode === "rec") m.chunks.push(new Float32Array(e.inputBuffer.getChannelData(0))); };
  m.source.connect(m.proc); m.proc.connect(c.destination);
  setMode("listen");
  animate();
}

function stopMic() {
  clearTimeout(m.recTimer);
  if (m.proc) { m.proc.onaudioprocess = null; try { m.proc.disconnect(); } catch {} }
  if (m.source) { try { m.source.disconnect(); } catch {} }
  if (m.stream) for (const t of m.stream.getTracks()) t.stop();
  m.stream = m.source = m.analyser = m.proc = null;
  try { if (navigator.audioSession && soundOn()) navigator.audioSession.type = "playback"; } catch {}
}

function startRecording() {
  if (!m.stream) return;
  m.chunks = []; m.recStart = performance.now();
  setMode("rec");
  m.recTimer = setTimeout(finishRecording, RECORD_SECONDS * 1000);
}

function finishRecording() {
  const chunks = m.chunks; m.chunks = [];
  stopMic();
  const c = audioContext(), total = chunks.reduce((n, ch) => n + ch.length, 0);
  if (!total) { setMode("off"); say("🙊 Chưa nghe thấy gì, bé thử lại nhé."); return; }
  const data = new Float32Array(total);
  let o = 0; for (const ch of chunks) { data.set(ch, o); o += ch.length; }
  // Trim silence at both ends so playback starts right away.
  const loud = (i) => Math.abs(data[i]) > 0.02;
  let a = 0, b = total - 1;
  while (a < total && !loud(a)) a++;
  while (b > a && !loud(b)) b--;
  const pad = Math.floor(c.sampleRate * 0.08);
  a = Math.max(0, a - pad); b = Math.min(total - 1, b + pad);
  if (b - a < c.sampleRate * 0.15) { setMode("off"); say("🙊 Chưa nghe thấy gì, bé hát to hơn nhé."); return; }
  m.buffer = c.createBuffer(1, b - a + 1, c.sampleRate);
  m.buffer.copyToChannel(data.subarray(a, b + 1), 0);
  setMode("ready");
  play(VOICES[0], $("#mic-controls [data-v='thuong']"));
}

/* ---------------------------------------------------------------- playback */
function play(voice, btn) {
  if (!m.buffer) return;
  stopPlayback();
  const c = audioContext();
  const src = c.createBufferSource(), out = c.createGain();
  src.buffer = m.buffer; src.playbackRate.value = voice.rate;
  out.gain.value = soundOn() ? 1 : 0;
  m.playAnalyser = c.createAnalyser(); m.playAnalyser.fftSize = 1024;
  src.connect(out);
  let tail = 0.1;
  if (voice.echo) {
    const delay = c.createDelay(1), fb = c.createGain();
    delay.delayTime.value = 0.28; fb.gain.value = 0.45;
    src.connect(delay); delay.connect(fb); fb.connect(delay); delay.connect(out);
    tail = 1.8;
  }
  out.connect(m.playAnalyser); m.playAnalyser.connect(c.destination);
  m.player = { src, out, btn, timer: 0 };
  if (btn) btn.classList.add("playing");
  setMode("play"); markPlaying(btn);
  src.start();
  const len = m.buffer.duration / voice.rate + tail;
  m.player.timer = setTimeout(() => { stopPlayback(); setMode("ready"); }, len * 1000);
  animate();
}
function markPlaying(btn) {
  for (const b of $("#mic-controls").querySelectorAll(".voice-btn")) b.classList.toggle("playing", b.dataset.v === (btn && btn.dataset.v));
}
function stopPlayback() {
  const p = m.player; m.player = null;
  if (!p) return;
  clearTimeout(p.timer);
  try { p.src.stop(); } catch {}
  try { p.out.disconnect(); } catch {}
  m.playAnalyser = null;
}

/* --------------------------------------------------------------- animation */
// Loudness (RMS) of the mic, or of the playback, moves the performer and lights the stage.
const samples = new Float32Array(1024);
function animate() {
  cancelAnimationFrame(m.raf);
  const tick = (now) => {
    const an = m.playAnalyser || m.analyser;
    if ($("#mic").hidden || !an) { m.level = 0; apply(0); return; }
    an.getFloatTimeDomainData(samples);
    let sum = 0; for (let i = 0; i < samples.length; i++) sum += samples[i] * samples[i];
    const lvl = Math.min(1, Math.sqrt(sum / samples.length) * 7);
    m.level = Math.max(lvl, m.level * 0.86);
    apply(m.level);
    if (m.level > 0.35 && now - m.sparkleAt > 140) { m.sparkleAt = now; sparkle(); }
    if (m.mode === "rec") $("#mic-controls").style.setProperty("--p", Math.min(1, (now - m.recStart) / (RECORD_SECONDS * 1000)));
    m.raf = requestAnimationFrame(tick);
  };
  m.raf = requestAnimationFrame(tick);
}
function apply(level) { $("#mic-stage").style.setProperty("--lvl", level.toFixed(3)); }

const BITS = ["⭐", "✨", "🎵", "💖", "🎶"];
function sparkle() {
  const s = document.createElement("span");
  s.textContent = BITS[Math.floor(Math.random() * BITS.length)];
  s.style.left = (15 + Math.random() * 70) + "%";
  s.addEventListener("animationend", () => s.remove());
  $("#mic-sparkles").appendChild(s);
  setTimeout(() => s.remove(), 1600);
}
