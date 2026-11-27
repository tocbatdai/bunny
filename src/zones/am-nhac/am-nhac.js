// Nhà âm nhạc – Bé Khám Phá Âm Thanh.
//   #/am-nhac       pick a toy: the piano or the fun mic
//   #/am-nhac/dan   piano: play freely, or follow a song (the next key to press lights up)
//   #/am-nhac/mic   fun mic (see mic.js)
// Notes are synthesised (no sound files). Songs are traditional public-domain melodies, notes only.
import { $ } from "../../shared/dom.js";
import { piano, unlockAudio, bindSoundButton } from "../../shared/sound.js";
import { showPraise, hidePraise } from "../../shared/praise.js";
import { navigate, back } from "../../router.js";
import { showMic, hideMic } from "./mic.js";

// White keys C4..C5 (indexes 0..7, each with a colour strip), then the black keys (8..12).
const WHITE = [
  [261.63, "#ef5350", "Đô"], [293.66, "#ff9f43", "Rê"], [329.63, "#ffd54f", "Mi"], [349.23, "#8bc34a", "Fa"],
  [392.0, "#26a69a", "Son"], [440.0, "#42a5f5", "La"], [493.88, "#7986cb", "Si"], [523.25, "#ab82d6", "Đô cao"],
];
const BLACK = [   // [frequency, white key it sits after, name]
  [277.18, 0, "Đô thăng"], [311.13, 1, "Rê thăng"], [369.99, 3, "Fa thăng"], [415.3, 4, "Son thăng"], [466.16, 5, "La thăng"],
];
const FREQ = [...WHITE.map((w) => w[0]), ...BLACK.map((b) => b[0])];

// Songs use white keys only. [key, beats]; one beat = BEAT seconds when the song plays for listening.
const q = (keys, last = 2) => keys.map((k, i) => [k, i === keys.length - 1 ? last : 1]);
const SONGS = [
  { icon: "⭐", label: "Bài ngôi sao", notes: [
    ...q([0, 0, 4, 4, 5, 5, 4]), ...q([3, 3, 2, 2, 1, 1, 0]), ...q([4, 4, 3, 3, 2, 2, 1]),
    ...q([4, 4, 3, 3, 2, 2, 1]), ...q([0, 0, 4, 4, 5, 5, 4]), ...q([3, 3, 2, 2, 1, 1, 0])] },
  { icon: "🐑", label: "Bài chú cừu", notes: [
    ...q([2, 1, 0, 1, 2, 2, 2]), ...q([1, 1, 1]), ...q([2, 4, 4]),
    ...q([2, 1, 0, 1, 2, 2, 2, 2, 1, 1, 2, 1, 0], 3)] },
  { icon: "🐮", label: "Bài nông trại", notes: [
    ...q([3, 3, 3, 0, 1, 1, 0]), ...q([5, 5, 4, 4, 3]), ...q([0, 3, 3, 3, 0, 1, 1, 0]), ...q([5, 5, 4, 4, 3], 3)] },
];
const BEAT = 0.42;
const PRAISE = ["Bé chơi đàn hay quá!", "Hoan hô! Bé là nhạc sĩ nhí!", "Tuyệt vời! Bé chơi hết bài rồi!"];

const state = { song: null, step: 0, demo: 0 };

/* ------------------------------------------------------------- zone API */
export function show([toy]) {
  $("#music").hidden = false;
  closePiano(); hideMic();
  if (toy === "dan") openPiano();
  else if (toy === "mic") showMic();
  else if (toy) navigate("am-nhac", { replace: true });
}
export function leave() {
  closePiano(); hideMic();
  $("#music").hidden = true;
}

/* ------------------------------------------------------------------ menu */
const PIANO_ART = `<svg viewBox="0 0 200 160" aria-hidden="true">
  <rect x="14" y="22" width="172" height="124" rx="16" fill="#4a3f55"/>
  <rect x="24" y="34" width="152" height="18" rx="6" fill="#6c5bd6"/>
  ${WHITE.slice(0, 7).map(([, c], i) => `<rect x="${26 + i * 21.4}" y="60" width="19" height="76" rx="5" fill="#fff"/><rect x="${26 + i * 21.4}" y="124" width="19" height="12" rx="4" fill="${c}"/>`).join("")}
  ${[0, 1, 3, 4, 5].map((i) => `<rect x="${39 + i * 21.4}" y="60" width="12" height="44" rx="3" fill="#2b2433"/>`).join("")}
  <path d="M150 14Q160 2 168 10M168 10V26" fill="none" stroke="#ff9f43" stroke-width="5" stroke-linecap="round"/><circle cx="163" cy="27" r="6" fill="#ff9f43"/></svg>`;
const MIC_ART = `<svg viewBox="0 0 200 160" aria-hidden="true">
  <path d="M100 112V146M72 148H128" stroke="#4a3f55" stroke-width="8" stroke-linecap="round"/>
  <path d="M60 78Q60 120 100 120Q140 120 140 78" fill="none" stroke="#4a3f55" stroke-width="7" stroke-linecap="round"/>
  <rect x="74" y="14" width="52" height="92" rx="26" fill="#ab82d6" stroke="#4a3f55" stroke-width="5"/>
  <path d="M76 44H124M76 60H124M76 76H124M92 16V104M108 16V104" stroke="#d9c8f5" stroke-width="4"/>
  <rect x="74" y="14" width="52" height="92" rx="26" fill="none" stroke="#4a3f55" stroke-width="5"/>
  <path d="M30 40Q20 60 30 80M44 48Q38 60 44 72M170 40Q180 60 170 80M156 48Q162 60 156 72" fill="none" stroke="#ff9f43" stroke-width="5" stroke-linecap="round"/></svg>`;
$("#music-menu").innerHTML = `
  <button class="music-pick" type="button" data-go="dan">${PIANO_ART}<span>Đàn piano</span></button>
  <button class="music-pick" type="button" data-go="mic">${MIC_ART}<span>Mic vui</span></button>`;
$("#music-menu").addEventListener("click", (e) => {
  const b = e.target.closest("[data-go]"); if (!b) return;
  unlockAudio(); navigate("am-nhac/" + b.dataset.go);
});
$("#music-home-btn").addEventListener("click", () => back(""));
for (const id of ["#music-sound", "#piano-sound", "#mic-sound"]) bindSoundButton($(id));

/* ----------------------------------------------------------------- piano */
const keyboard = $("#piano-keys");
keyboard.innerHTML =
  WHITE.map(([, c, name], i) => `<button class="key white" type="button" data-i="${i}" style="--c:${c}" aria-label="${name}"></button>`).join("") +
  BLACK.map(([, after, name], j) => `<button class="key black" type="button" data-i="${8 + j}" style="--pos:${after + 1}" aria-label="${name}"></button>`).join("");
const keys = [...keyboard.children];

function openPiano() {
  $("#piano").hidden = false; document.body.style.overflow = "hidden";
  pickSong(null);
}
function closePiano() {
  stopDemo(); held.clear();
  if ($("#piano").hidden) return;
  $("#piano").hidden = true; hidePraise(); document.body.style.overflow = "";
}
$("#piano-back").addEventListener("click", () => back("am-nhac"));

function renderSongPicks() {
  $("#song-picks").innerHTML = [`<button class="tab song-pick" type="button" data-s="" aria-pressed="${state.song === null}" aria-label="Chơi tự do">🎵</button>`,
    ...SONGS.map((s, i) => `<button class="tab song-pick" type="button" data-s="${i}" aria-pressed="${state.song === i}" aria-label="${s.label}">${s.icon}</button>`)].join("");
}
function pickSong(i) {
  stopDemo();
  state.song = i; state.step = 0;
  renderSongPicks();
  $("#piano-listen").hidden = i === null;
  keyboard.classList.toggle("song-mode", i !== null);
  markNext();
}
$("#song-picks").addEventListener("click", (e) => {
  const b = e.target.closest("[data-s]"); if (!b) return;
  unlockAudio(); pickSong(b.dataset.s === "" ? null : +b.dataset.s);
});
function markNext() {
  const song = SONGS[state.song], next = song ? song.notes[state.step][0] : -1;
  keys.forEach((k, i) => k.classList.toggle("next", i === next));
}

function press(i, fromChild = true) {
  const key = keys[i];
  piano(FREQ[i]);
  key.classList.remove("down"); void key.offsetWidth; key.classList.add("down");
  flyNote(key, i < 8 ? WHITE[i][1] : "#4a3f55");
  if (!fromChild) return;
  stopDemo();
  const song = SONGS[state.song];
  if (!song || song.notes[state.step][0] !== i) return;   // another key still plays, the song just waits
  state.step++;
  if (state.step < song.notes.length) { markNext(); return; }
  keys.forEach((k) => k.classList.remove("next"));
  const done = state.song;
  setTimeout(() => {
    if ($("#piano").hidden || state.song !== done) return;
    showPraise(PRAISE[Math.floor(Math.random() * PRAISE.length)], {
      stayIcon: "🔁", stayLabel: "Chơi lại bài này",
      onStay: () => pickSong(done),
      onNext: () => pickSong((done + 1) % SONGS.length),
      onClose: () => { if (!$("#piano").hidden) pickSong(done); },
    });
  }, 900);
}
keyboard.addEventListener("animationend", (e) => e.target.classList.remove("down"));

function flyNote(key, colour) {
  const area = $("#piano-area"), a = area.getBoundingClientRect(), r = key.getBoundingClientRect();
  const portrait = r.width > r.height;
  const n = document.createElement("span");
  n.className = "note-fly"; n.textContent = Math.random() < 0.5 ? "♪" : "♫";
  n.style.left = (r.left - a.left + (portrait ? r.width * 0.75 : r.width / 2)) + "px";
  n.style.top = (r.top - a.top + (portrait ? r.height / 2 : r.height * 0.3)) + "px";
  n.style.color = colour;
  n.addEventListener("animationend", () => n.remove());
  area.appendChild(n);
  setTimeout(() => n.remove(), 1500);   // also when animations are turned off
}

// Many fingers at once, and sliding a finger along the keyboard plays each key it enters.
const held = new Map();   // pointerId -> key index (-1 off the keys)
keyboard.addEventListener("pointerdown", (e) => {
  const k = e.target.closest(".key"); if (!k || (e.pointerType === "mouse" && e.button !== 0)) return;
  e.preventDefault();
  try { k.releasePointerCapture(e.pointerId); } catch {}
  unlockAudio();
  held.set(e.pointerId, +k.dataset.i); press(+k.dataset.i);
});
$("#piano-area").addEventListener("pointermove", (e) => {
  if (!held.has(e.pointerId)) return;
  const el = document.elementFromPoint(e.clientX, e.clientY), k = el && el.closest ? el.closest(".key") : null;
  const i = k ? +k.dataset.i : -1;
  if (i !== held.get(e.pointerId)) { held.set(e.pointerId, i); if (i >= 0) press(i); }
});
for (const ev of ["pointerup", "pointercancel"]) $("#piano-area").addEventListener(ev, (e) => held.delete(e.pointerId));
keyboard.addEventListener("click", (e) => { if (e.detail === 0) { const k = e.target.closest(".key"); if (k) press(+k.dataset.i); } });   // keyboard

// 👂 plays the song; any key press stops it.
function stopDemo() { clearTimeout(state.demo); state.demo = 0; $("#piano-listen").classList.remove("playing"); }
$("#piano-listen").addEventListener("click", () => {
  const song = SONGS[state.song]; if (!song) return;
  if (state.demo) { stopDemo(); return; }
  unlockAudio();
  $("#piano-listen").classList.add("playing");
  let k = 0;
  const step = () => {
    if (k >= song.notes.length) { stopDemo(); markNext(); return; }
    const [key, beats] = song.notes[k++];
    press(key, false);
    state.demo = setTimeout(step, beats * BEAT * 1000);
  };
  step();
});
