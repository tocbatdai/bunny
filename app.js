// Bé Vẽ Vui — colouring app for toddlers.
// Each picture's colouring areas are pre-computed (tools/build.html), so opening a picture is:
// fetch line art + area map, decode, draw. A tap paints one pre-indexed pixel list and redraws
// only that area's rectangle, which keeps it smooth on low-end phones and tablets.
import { drawings, categories } from "./data/drawings.js";
import { pagePaths, decodeAreas, indexAreas } from "./src/pages.js";

const COLORS = [
  ["#ef5350", "Đỏ"], ["#ff9f43", "Cam"], ["#ffd54f", "Vàng"], ["#8bc34a", "Xanh lá"],
  ["#26a69a", "Xanh ngọc"], ["#42a5f5", "Xanh dương"], ["#ab82d6", "Tím"], ["#f48fb1", "Hồng"],
  ["#a1887f", "Nâu"], ["#ffc4a3", "Màu da"], ["#ffffff", "Trắng"], ["#333333", "Đen"],
];
const MIN_REQUIRED_SHARE = 0.0005;           // smaller inner areas (~18x18 px on 800x800) are not needed for 100%
const HOLD_MS = 800;                         // reset button hold time
const SNAP_RADIUS = 10;                       // a tap on a line snaps to the nearest area (px)

const $ = (s) => document.querySelector(s);
const store = {
  get(k, fallback) { try { const v = localStorage.getItem("bvv:" + k); return v === null ? fallback : JSON.parse(v); } catch { return fallback; } },
  set(k, v) { try { localStorage.setItem("bvv:" + k, JSON.stringify(v)); } catch {} },
  del(k) { try { localStorage.removeItem("bvv:" + k); } catch {} },
};

const state = {
  category: store.get("category", "all"),
  color: store.get("color", 0),
  sound: store.get("sound", true),
  drawing: null,   // catalogue entry being coloured
  page: null,      // loaded page data (see openPicture)
  loadToken: 0,
};

/* ------------------------------------------------------------------ home */
function renderTabs() {
  $("#tabs").innerHTML = categories.map((c) =>
    `<button class="tab" type="button" data-cat="${c.id}" aria-pressed="${c.id === state.category}"><span class="tab-icon" aria-hidden="true">${c.icon}</span>${c.name}</button>`).join("");
}
function renderGrid() {
  const list = drawings.filter((d) => state.category === "all" || d.category === state.category);
  $("#grid").innerHTML = list.map((d) =>
    `<button class="card" type="button" data-id="${d.id}"><img src="${pagePaths(d).thumb}" alt="" width="320" height="320" loading="lazy" decoding="async"><span>${d.name}</span></button>`).join("");
}
$("#tabs").addEventListener("click", (e) => {
  const b = e.target.closest("[data-cat]"); if (!b) return;
  state.category = b.dataset.cat; store.set("category", state.category);
  renderTabs(); renderGrid(); window.scrollTo(0, 0);
});
$("#grid").addEventListener("click", (e) => {
  const card = e.target.closest("[data-id]"); if (card) openPicture(card.dataset.id);
});

// Optional real full screen for browsers (the installed app is already full screen).
const fsTarget = document.documentElement;
const canFullscreen = !!(fsTarget.requestFullscreen || fsTarget.webkitRequestFullscreen) && !matchMedia("(display-mode: fullscreen), (display-mode: standalone)").matches;
if (canFullscreen) $("#fullscreen-btn").hidden = false;
$("#fullscreen-btn").addEventListener("click", () => {
  const active = document.fullscreenElement || document.webkitFullscreenElement;
  try {
    const p = active ? (document.exitFullscreen || document.webkitExitFullscreen).call(document) : (fsTarget.requestFullscreen || fsTarget.webkitRequestFullscreen).call(fsTarget);
    if (p && p.catch) p.catch(() => {});
  } catch {}
});

/* ----------------------------------------------------------------- sound */
let audio = null, musicTimer = null, note = 0;
const MELODY = [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 783.99, 698.46, 523.25, 587.33, 659.25, 587.33];
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
function unlockAudio() {
  if (!state.sound) return;
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
// In the background: no music, and give the audio session back so nothing keeps playing.
// Back in front: music resumes (the next touch re-unlocks sound if iOS interrupted it).
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stopMusic();
    if (silentClip) silentClip.pause();
    try { if (navigator.audioSession) navigator.audioSession.type = "auto"; } catch {}
  } else if (!$("#paint").hidden && $("#praise").hidden) {
    try { if (navigator.audioSession && state.sound) navigator.audioSession.type = "playback"; } catch {}
    startMusic();
  }
});
function tone(freq, { dur = 0.45, vol = 0.02, delay = 0, type = "sine", slide = 0 } = {}) {
  if (!state.sound) return;
  const c = ctx(); if (!c) return;
  const t = c.currentTime + delay, o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(freq * slide, t + dur * 0.6);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur + 0.05);
}
const popSound = (i) => tone(392 + i * 28, { dur: 0.22, vol: 0.07, slide: 1.6, type: "triangle" });
function musicStep() {
  if (!state.sound || $("#paint").hidden || document.hidden) return;
  // While iOS has sound interrupted, time stands still: skip notes instead of piling them up.
  if (!audio || audio.state !== "running") { musicTimer = setTimeout(musicStep, 560); return; }
  tone(MELODY[note % MELODY.length]);
  if (note % 4 === 0) tone(MELODY[(note + 4) % MELODY.length] / 2, { dur: 0.7, vol: 0.008 });
  note++; musicTimer = setTimeout(musicStep, 560);
}
const stopMusic = () => { clearTimeout(musicTimer); musicTimer = null; };
const startMusic = () => { stopMusic(); if (state.sound) musicStep(); };
function renderSound() {
  for (const b of [$("#sound-btn"), $("#home-sound")]) {
    b.textContent = state.sound ? "🔊" : "🔇";
    b.setAttribute("aria-pressed", String(state.sound));
    b.setAttribute("aria-label", state.sound ? "Tắt âm thanh" : "Bật âm thanh");
  }
}
function toggleSound() {
  state.sound = !state.sound; store.set("sound", state.sound); renderSound();
  if (state.sound) { unlockAudio(); if (!$("#paint").hidden) startMusic(); } else { stopMusic(); if (silentClip) silentClip.pause(); }
}
$("#sound-btn").addEventListener("click", toggleSound);
$("#home-sound").addEventListener("click", toggleSound);

/* --------------------------------------------------------------- palette */
function renderPalette() {
  $("#palette").innerHTML = COLORS.map(([hex, name], i) =>
    `<button class="swatch" type="button" role="radio" style="background:${hex}" data-i="${i}" aria-checked="${i === state.color}" aria-label="${name}"></button>`).join("");
}
$("#palette").addEventListener("click", (e) => {
  const b = e.target.closest("[data-i]"); if (!b) return;
  state.color = +b.dataset.i; store.set("color", state.color);
  $("#palette").querySelectorAll(".swatch").forEach((s) => s.setAttribute("aria-checked", String(s === b)));
  tone(523 + state.color * 30, { dur: 0.15, vol: 0.04, type: "triangle" });
});

/* ------------------------------------------------------- open / close */
const canvas = $("#canvas"), g2d = canvas.getContext("2d", { willReadFrequently: false });

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => (img.decode ? img.decode().catch(() => {}) : Promise.resolve()).then(() => resolve(img));
    img.onerror = () => reject(new Error("image " + src));
    img.src = src;
  });
}

async function openPicture(id) {
  const d = drawings.find((x) => x.id === id); if (!d) return;
  unlockAudio();                           // unlock audio inside the tap
  const token = ++state.loadToken;
  state.drawing = d; state.page = null;
  if ($("#paint").hidden) {
    if (!(history.state && history.state.paint)) history.pushState({ paint: true }, "");
    $("#paint").hidden = false; document.body.style.overflow = "hidden";
  }
  $("#paint-title").textContent = d.name;
  const paths = pagePaths(d);
  canvas.hidden = true;
  $("#placeholder").src = paths.thumb; $("#placeholder").hidden = false;
  renderUndo(); startMusic();

  try {
    const [img, buf] = await Promise.all([loadImage(paths.art), fetch(paths.areas).then((r) => { if (!r.ok) throw new Error("areas " + r.status); return r.arrayBuffer(); })]);
    if (token !== state.loadToken) return;
    const areas = decodeAreas(buf), { w, h } = areas;
    canvas.width = w; canvas.height = h;
    g2d.fillStyle = "#fff"; g2d.fillRect(0, 0, w, h); g2d.drawImage(img, 0, 0, w, h);
    const base = g2d.getImageData(0, 0, w, h), shade = new Float32Array(w * h), b = base.data;
    // shade = how much of the paint shows through the line art (multiply), 0..1
    for (let i = 0, k = 0; i < shade.length; i++, k += 4) shade[i] = Math.min(1, (b[k] * 299 + b[k + 1] * 587 + b[k + 2] * 114) / 1000 / 235);
    const index = indexAreas(areas);
    state.page = {
      w, h, labels: areas.labels, ...index, base, shade, out: new ImageData(new Uint8ClampedArray(b), w, h),
      required: requiredAreas(areas, index), fills: new Map(), undo: [], praised: false,
    };
    const saved = store.get("page:" + d.id, null);
    if (saved) {
      for (const [areaId, colorIndex] of Object.entries(saved)) if (COLORS[colorIndex]) paintArea(+areaId, colorIndex, false);
      state.page.praised = isFinished();
    }
    g2d.putImageData(state.page.out, 0, 0);
    canvas.hidden = false; $("#placeholder").hidden = true;
  } catch (err) {
    console.error(err);
    if (token === state.loadToken) $("#paint-title").textContent = d.name + " 😢";
  }
}

function closePicture() {
  state.loadToken++; state.page = null; state.drawing = null;
  $("#paint").hidden = true; $("#praise").hidden = true; document.body.style.overflow = "";
  stopMusic(); cancelHold();
  if (reloadOnHome) location.reload();
}
let reloadOnHome = false;
// Home button, Esc and the phone's Back button all go through history, so they behave the same.
const goHome = () => { if (history.state && history.state.paint) history.back(); else closePicture(); };
window.addEventListener("popstate", () => { if (!$("#paint").hidden) closePicture(); });
$("#home-btn").addEventListener("click", goHome);
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (!$("#praise").hidden) $("#praise").hidden = true; else if (!$("#paint").hidden) goHome();
});

/* --------------------------------------------------------------- paint */
function paintArea(id, colorIndex, draw = true) {
  const p = state.page, { pixels, offsets, box, shade } = p, o = p.out.data, base = p.base.data;
  if (colorIndex === null) {
    p.fills.delete(id);
    for (let n = offsets[id]; n < offsets[id + 1]; n++) { const k = pixels[n] * 4; o[k] = base[k]; o[k + 1] = base[k + 1]; o[k + 2] = base[k + 2]; }
  } else {
    p.fills.set(id, colorIndex);
    const hex = COLORS[colorIndex][0], r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), bl = parseInt(hex.slice(5, 7), 16);
    for (let n = offsets[id]; n < offsets[id + 1]; n++) { const i = pixels[n], k = i * 4, s = shade[i]; o[k] = r * s; o[k + 1] = g * s; o[k + 2] = bl * s; }
  }
  if (draw) { const k = id * 4; g2d.putImageData(p.out, 0, 0, box[k], box[k + 1], box[k + 2] - box[k] + 1, box[k + 3] - box[k + 1] + 1); }
}

function areaAt(x, y) {
  const { w, h, labels } = state.page;
  const px = Math.floor(x), py = Math.floor(y);
  if (px < 0 || py < 0 || px >= w || py >= h) return 0;
  if (labels[py * w + px]) return labels[py * w + px];
  let best = 0, bestD = Infinity;
  for (let dy = -SNAP_RADIUS; dy <= SNAP_RADIUS; dy++) for (let dx = -SNAP_RADIUS; dx <= SNAP_RADIUS; dx++) {
    const xx = px + dx, yy = py + dy, dist = dx * dx + dy * dy;
    if (xx < 0 || yy < 0 || xx >= w || yy >= h || dist >= bestD) continue;
    const id = labels[yy * w + xx]; if (id) { best = id; bestD = dist; }
  }
  return best;
}

let saveTimer = null;
function savePage() {
  clearTimeout(saveTimer);
  const id = state.drawing.id, fills = state.page.fills;
  saveTimer = setTimeout(() => { if (fills.size) store.set("page:" + id, Object.fromEntries(fills)); else store.del("page:" + id); }, 400);
}

// One finger at a time: a palm or a second finger on the picture is ignored.
const fingers = new Set();
canvas.addEventListener("pointerdown", (e) => {
  fingers.add(e.pointerId);
  if (!state.page || fingers.size > 1 || (e.pointerType === "mouse" && e.button !== 0)) return;
  const r = canvas.getBoundingClientRect(), p = state.page;
  const id = areaAt((e.clientX - r.left) * p.w / r.width, (e.clientY - r.top) * p.h / r.height);
  if (!id) return;
  const prev = p.fills.has(id) ? p.fills.get(id) : null;
  if (prev === state.color) { tone(330, { dur: 0.12, vol: 0.03 }); return; }
  p.undo.push([id, prev]); if (p.undo.length > 100) p.undo.shift();
  paintArea(id, state.color); popSound(state.color); savePage(); renderUndo();
  if (!p.praised && isFinished()) { p.praised = true; setTimeout(showPraise, 350); }
});
for (const ev of ["pointerup", "pointercancel", "pointerleave"]) canvas.addEventListener(ev, (e) => fingers.delete(e.pointerId));

// Praise only when the picture is 100% coloured: every area a child can see and tap. Not needed:
// the background (areas touching the page border) and specks smaller than MIN_REQUIRED_SHARE,
// which are gaps between lines rather than parts of the picture.
// The build's "targets" (big inner areas) are always required, even on pictures whose
// main shape touches the border.
function requiredAreas({ w, h, areaCount, targets }, { offsets, box }) {
  const ids = new Set(targets), min = w * h * MIN_REQUIRED_SHARE;
  for (let id = 1; id <= areaCount; id++) {
    const k = id * 4, edge = box[k] === 0 || box[k + 1] === 0 || box[k + 2] === w - 1 || box[k + 3] === h - 1;
    if (!edge && offsets[id + 1] - offsets[id] >= min) ids.add(id);
  }
  return ids;
}
function isFinished() {
  const { required, fills } = state.page; if (!required.size) return false;
  for (const id of required) if (!fills.has(id)) return false;
  return true;
}

/* ----------------------------------------------------------- undo / reset */
function renderUndo() { $("#undo-btn").disabled = !(state.page && state.page.undo.length); }
$("#undo-btn").addEventListener("click", () => {
  const p = state.page; if (!p || !p.undo.length) return;
  const [id, prev] = p.undo.pop();
  paintArea(id, prev); savePage(); renderUndo(); tone(440, { dur: 0.2, vol: 0.05, slide: 0.6, type: "triangle" });
});

// The timer decides; the animation frame only draws the progress ring.
let holdStart = 0, holdFrame = 0, holdTimer = 0;
const resetBtn = $("#reset-btn");
function cancelHold() { cancelAnimationFrame(holdFrame); clearTimeout(holdTimer); holdStart = 0; resetBtn.style.setProperty("--p", 0); }
resetBtn.addEventListener("pointerdown", (e) => {
  e.preventDefault(); if (!state.page) return;
  holdStart = performance.now();
  const ring = (now) => { if (!holdStart) return; resetBtn.style.setProperty("--p", Math.min(1, (now - holdStart) / HOLD_MS)); holdFrame = requestAnimationFrame(ring); };
  holdFrame = requestAnimationFrame(ring);
  holdTimer = setTimeout(() => { cancelHold(); clearPicture(); }, HOLD_MS);
});
for (const ev of ["pointerup", "pointerleave", "pointercancel"]) resetBtn.addEventListener(ev, () => {
  if (holdStart && performance.now() - holdStart < HOLD_MS * 0.6) {   // quick tap: explain instead of erasing
    resetBtn.classList.remove("shake"); void resetBtn.offsetWidth; resetBtn.classList.add("shake");
    $("#hint").hidden = false; clearTimeout(resetBtn.hintTimer); resetBtn.hintTimer = setTimeout(() => { $("#hint").hidden = true; }, 1600);
  }
  cancelHold();
});
resetBtn.addEventListener("contextmenu", (e) => e.preventDefault());
function clearPicture() {
  const p = state.page; if (!p) return;
  p.out.data.set(p.base.data); p.fills.clear(); p.undo = []; p.praised = false;
  g2d.putImageData(p.out, 0, 0); savePage(); renderUndo(); $("#hint").hidden = true;
  tone(660, { dur: 0.35, vol: 0.05, slide: 0.5, type: "triangle" });
}

/* ---------------------------------------------------------------- praise */
const PRAISE = ["Bé tô màu đẹp quá!", "Hoan hô! Bé giỏi lắm!", "Tuyệt vời! Bé là họa sĩ nhí!", "Đẹp quá! Thưởng bé một tràng pháo tay!"];
function showPraise() {
  if (!state.page) return;
  const msg = PRAISE[Math.floor(Math.random() * PRAISE.length)];
  $("#praise-text").textContent = msg;
  const bits = ["🎉", "⭐", "💖", "🌈", "✨", "🎈"];
  $("#confetti").innerHTML = Array.from({ length: 24 }, (_, i) => `<span style="--x:${Math.random() * 100}%;--d:${(Math.random() * 0.6).toFixed(2)}s">${bits[i % bits.length]}</span>`).join("");
  $("#praise").hidden = false;
  stopMusic();
  [659.25, 783.99, 987.77, 1318.51].forEach((f, i) => tone(f, { dur: 0.3, vol: 0.05, delay: i * 0.12 }));
  if (state.sound) sayVietnamese(msg);
}

// Speech must use a Vietnamese voice. Setting only lang="vi-VN" is not enough: Chrome on
// Android/Windows often keeps the default (English) voice, which mangles Vietnamese. So pick a
// Vietnamese voice explicitly, and stay silent if the device has none (text + fanfare still show).
let viVoice = null, speaking = null;
function findVietnameseVoice() {
  if (!("speechSynthesis" in window)) return null;
  const score = (v) => (/natural|online/i.test(v.name) ? 4 : 0) + (/google/i.test(v.name) ? 2 : 0) + (v.localService ? 1 : 0);
  const vi = speechSynthesis.getVoices().filter((v) => /^vi([-_]|$)/i.test(v.lang || ""));
  viVoice = vi.sort((a, b) => score(b) - score(a))[0] || null;
  return viVoice;
}
if ("speechSynthesis" in window) {
  findVietnameseVoice();   // voices load asynchronously in Chrome/Edge
  try { speechSynthesis.addEventListener("voiceschanged", findVietnameseVoice); } catch { speechSynthesis.onvoiceschanged = findVietnameseVoice; }
}
function sayVietnamese(text) {
  if (!("speechSynthesis" in window)) return;
  const voice = viVoice || findVietnameseVoice(); if (!voice) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.voice = voice; u.lang = voice.lang.replace("_", "-"); u.rate = 0.9; u.pitch = 1.1;
    speaking = u;   // keep a reference: Chrome can drop an utterance that gets garbage-collected
    u.onend = u.onerror = () => { if (speaking === u) speaking = null; };
    // Chrome sometimes ignores speak() called right after cancel(), so give it a moment.
    setTimeout(() => { if (speaking === u) speechSynthesis.speak(u); }, 60);
  } catch {}
}
function hidePraise() { $("#praise").hidden = true; speaking = null; try { speechSynthesis.cancel(); } catch {} }
$("#praise-stay").addEventListener("click", () => { hidePraise(); startMusic(); });
$("#praise-next").addEventListener("click", () => {
  hidePraise();
  const list = drawings.filter((d) => state.category === "all" || d.category === state.category);
  const i = list.findIndex((d) => d.id === state.drawing?.id);
  openPicture(list[(i + 1) % list.length].id);
});

/* ------------------------------------------------------------------ start */
renderTabs(); renderGrid(); renderPalette(); renderSound();
// Offline + install support. Skipped on localhost so development always sees fresh files.
if ("serviceWorker" in navigator && (location.hostname !== "localhost" || location.search.includes("sw=1"))) {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  // A new version took over: reload to use it, but never in the middle of colouring (wait for Home).
  const hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!hadController) return;
    if ($("#paint").hidden) location.reload(); else reloadOnHome = true;
  });
}
