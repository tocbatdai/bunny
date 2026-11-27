// Sound shared by every zone: the on/off setting, short tones, background music and the
// iPhone/iPad unlock dance. Zones call startMusic()/stopMusic(); the music keeps that wish
// across the app going to the background and coming back.
import { store } from "./dom.js";

let on = store.get("sound", true);
export const soundOn = () => on;

let audio = null;
function ctx() {
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
  if (!audio) audio = new AC();
  // iOS leaves the context "interrupted" after locking the screen or switching apps, not just "suspended".
  if (audio.state !== "running") audio.resume().catch(() => {});
  return audio;
}

// iPhone/iPad (Safari) mute Web Audio when the device is in silent mode, and older versions only
// allow sound after something is played inside a touch. On every touch until sound works:
//  - ask for the "playback" audio session (iOS 17+), which ignores the silent switch like a video;
//  - on older iOS, loop a silent <audio> clip, which switches the session to playback the same way;
//  - play a 1-sample silent buffer and prime speech, which unlocks both for later use.
const isIOS = /iP(hone|od|ad)/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
let unlocked = false, silentClip = null;
function silentWavUrl() {
  const rate = 8000, n = rate / 2, buf = new ArrayBuffer(44 + n), v = new DataView(buf);
  const text = (o, s) => [...s].forEach((ch, i) => v.setUint8(o + i, ch.charCodeAt(0)));
  text(0, "RIFF"); v.setUint32(4, 36 + n, true); text(8, "WAVEfmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true);
  v.setUint16(22, 1, true); v.setUint32(24, rate, true); v.setUint32(28, rate, true); v.setUint16(32, 1, true); v.setUint16(34, 8, true);
  text(36, "data"); v.setUint32(40, n, true); new Uint8Array(buf, 44).fill(128);
  return URL.createObjectURL(new Blob([buf], { type: "audio/wav" }));
}
export function unlockAudio() {
  if (!on) return;
  try { if (navigator.audioSession) navigator.audioSession.type = "playback"; } catch {}
  if (isIOS && !navigator.audioSession) {
    if (!silentClip) { silentClip = new Audio(silentWavUrl()); silentClip.loop = true; silentClip.setAttribute("playsinline", ""); }
    if (silentClip.paused) silentClip.play().catch(() => {});
  }
  const c = ctx(); if (!c) return;
  if (!unlocked) {
    const s = c.createBufferSource(); s.buffer = c.createBuffer(1, 1, 22050); s.connect(c.destination); s.start(0);
    try { if ("speechSynthesis" in window) speechSynthesis.speak(new SpeechSynthesisUtterance("")); } catch {}
    unlocked = true;
  }
}
for (const ev of ["touchend", "pointerup", "click", "keydown"]) document.addEventListener(ev, () => { if (!audio || audio.state !== "running" || (silentClip && silentClip.paused)) unlockAudio(); }, { capture: true, passive: true });

export function tone(freq, { dur = 0.45, vol = 0.02, delay = 0, type = "sine", slide = 0 } = {}) {
  if (!on) return;
  const c = ctx(); if (!c) return;
  const t = c.currentTime + delay, o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(freq * slide, t + dur * 0.6);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur + 0.05);
}
// The shared AudioContext (created on first use), for zones that build their own audio graph.
export const audioContext = () => ctx();

// A xylophone-like note: a sine with two quickly fading overtones.
export function pling(freq, { vol = 0.2, dur = 1.3 } = {}) {
  if (!on) return;
  const c = ctx(); if (!c) return;
  const t = c.currentTime, out = c.createGain();
  out.gain.setValueAtTime(0.0001, t); out.gain.exponentialRampToValueAtTime(vol, t + 0.006); out.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  out.connect(c.destination);
  for (const [mult, gain, decay] of [[1, 1, dur], [3.98, 0.28, 0.35], [9.2, 0.08, 0.12]]) {
    const o = c.createOscillator(), g = c.createGain();
    o.type = "sine"; o.frequency.value = freq * mult;
    g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    o.connect(g); g.connect(out); o.start(t); o.stop(t + dur + 0.05);
  }
}

export const fanfare = () => [659.25, 783.99, 987.77, 1318.51].forEach((f, i) => tone(f, { dur: 0.3, vol: 0.05, delay: i * 0.12 }));

/* ----------------------------------------------------------------- music */
const MELODY = [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 783.99, 698.46, 523.25, 587.33, 659.25, 587.33];
let musicWanted = false, musicTimer = null, note = 0;
function musicStep() {
  if (!on || !musicWanted || document.hidden) { musicTimer = null; return; }
  // While iOS has sound interrupted, time stands still: skip notes instead of piling them up.
  if (!audio || audio.state !== "running") { musicTimer = setTimeout(musicStep, 560); return; }
  tone(MELODY[note % MELODY.length]);
  if (note % 4 === 0) tone(MELODY[(note + 4) % MELODY.length] / 2, { dur: 0.7, vol: 0.008 });
  note++; musicTimer = setTimeout(musicStep, 560);
}
const pauseMusic = () => { clearTimeout(musicTimer); musicTimer = null; };
export function startMusic() { musicWanted = true; pauseMusic(); musicStep(); }
export function stopMusic() { musicWanted = false; pauseMusic(); }

// In the background: no music, and give the audio session back so nothing keeps playing.
// Back in front: music resumes if a zone wanted it (the next touch re-unlocks sound if iOS interrupted it).
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    pauseMusic();
    if (silentClip) silentClip.pause();
    try { if (navigator.audioSession) navigator.audioSession.type = "auto"; } catch {}
  } else if (musicWanted) {
    try { if (navigator.audioSession && on) navigator.audioSession.type = "playback"; } catch {}
    pauseMusic(); musicStep();
  }
});

/* ---------------------------------------------------------- on/off buttons */
const buttons = new Set();
function renderButtons() {
  for (const b of buttons) {
    b.textContent = on ? "🔊" : "🔇";
    b.setAttribute("aria-pressed", String(on));
    b.setAttribute("aria-label", on ? "Tắt âm thanh" : "Bật âm thanh");
  }
}
function toggleSound() {
  on = !on; store.set("sound", on); renderButtons();
  if (on) { unlockAudio(); if (musicWanted) { pauseMusic(); musicStep(); } }
  else { pauseMusic(); if (silentClip) silentClip.pause(); try { speechSynthesis.cancel(); } catch {} }
}
export function bindSoundButton(btn) {
  buttons.add(btn); renderButtons();
  btn.addEventListener("click", toggleSound);
}
