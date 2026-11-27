// Nhà âm nhạc – Bé Khám Phá Âm Thanh.
//   #/am-nhac       pick a toy: the xylophone or the fun mic
//   #/am-nhac/dan   xylophone: play freely, or follow a song (the next bar to tap lights up)
//   #/am-nhac/mic   fun mic (see mic.js)
// Notes are synthesised (no sound files). Songs are traditional public-domain melodies, notes only.
import { $ } from "../../shared/dom.js";
import { pling, unlockAudio, bindSoundButton } from "../../shared/sound.js";
import { showPraise, hidePraise } from "../../shared/praise.js";
import { navigate, back } from "../../router.js";
import { showMic, hideMic } from "./mic.js";

// C4..C5, one colour per bar.
const BARS = [
  [261.63, "#ef5350", "Đô"], [293.66, "#ff9f43", "Rê"], [329.63, "#ffd54f", "Mi"], [349.23, "#8bc34a", "Fa"],
  [392.0, "#26a69a", "Son"], [440.0, "#42a5f5", "La"], [493.88, "#7986cb", "Si"], [523.25, "#ab82d6", "Đô cao"],
];
// [bar, beats]; one beat = BEAT seconds when the song is played to listen.
const q = (bars, last = 2) => bars.map((b, i) => [b, i === bars.length - 1 ? last : 1]);
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
  closeXylo(); hideMic();
  if (toy === "dan") openXylo();
  else if (toy === "mic") showMic();
  else if (toy) navigate("am-nhac", { replace: true });
}
export function leave() {
  closeXylo(); hideMic();
  $("#music").hidden = true;
}

/* ------------------------------------------------------------------ menu */
const XYLO_ART = `<svg viewBox="0 0 200 160" aria-hidden="true">
  <path d="M20 52L182 70M20 118L182 100" stroke="#a1704a" stroke-width="12" stroke-linecap="round"/>
  ${BARS.slice(0, 6).map(([, c], i) => `<rect x="${26 + i * 26}" y="${30 + i * 5}" width="20" height="${104 - i * 10}" rx="7" fill="${c}" stroke="#4a3f55" stroke-width="4"/>`).join("")}
  <path d="M120 150L160 18" stroke="#a1704a" stroke-width="7" stroke-linecap="round"/><circle cx="162" cy="14" r="11" fill="#ef5350" stroke="#4a3f55" stroke-width="4"/></svg>`;
const MIC_ART = `<svg viewBox="0 0 200 160" aria-hidden="true">
  <path d="M100 112V146M72 148H128" stroke="#4a3f55" stroke-width="8" stroke-linecap="round"/>
  <path d="M60 78Q60 120 100 120Q140 120 140 78" fill="none" stroke="#4a3f55" stroke-width="7" stroke-linecap="round"/>
  <rect x="74" y="14" width="52" height="92" rx="26" fill="#ab82d6" stroke="#4a3f55" stroke-width="5"/>
  <path d="M76 44H124M76 60H124M76 76H124M92 16V104M108 16V104" stroke="#d9c8f5" stroke-width="4"/>
  <rect x="74" y="14" width="52" height="92" rx="26" fill="none" stroke="#4a3f55" stroke-width="5"/>
  <path d="M30 40Q20 60 30 80M44 48Q38 60 44 72M170 40Q180 60 170 80M156 48Q162 60 156 72" fill="none" stroke="#ff9f43" stroke-width="5" stroke-linecap="round"/></svg>`;
$("#music-menu").innerHTML = `
  <button class="music-pick" type="button" data-go="dan">${XYLO_ART}<span>Đàn</span></button>
  <button class="music-pick" type="button" data-go="mic">${MIC_ART}<span>Mic vui</span></button>`;
$("#music-menu").addEventListener("click", (e) => {
  const b = e.target.closest("[data-go]"); if (!b) return;
  unlockAudio(); navigate("am-nhac/" + b.dataset.go);
});
$("#music-home-btn").addEventListener("click", () => back(""));
for (const id of ["#music-sound", "#xylo-sound", "#mic-sound"]) bindSoundButton($(id));

/* ------------------------------------------------------------- xylophone */
const keys = $("#xylo-keys");
keys.innerHTML = BARS.map(([, c, name], i) =>
  `<button class="bar" type="button" data-i="${i}" style="--c:${c};--i:${i}" aria-label="${name}"></button>`).join("");
const bars = [...keys.children];

function openXylo() {
  $("#xylo").hidden = false; document.body.style.overflow = "hidden";
  pickSong(null);
}
function closeXylo() {
  stopDemo(); held.clear();
  if ($("#xylo").hidden) return;
  $("#xylo").hidden = true; hidePraise(); document.body.style.overflow = "";
}
$("#xylo-back").addEventListener("click", () => back("am-nhac"));

function renderSongPicks() {
  $("#song-picks").innerHTML = [`<button class="tab song-pick" type="button" data-s="" aria-pressed="${state.song === null}" aria-label="Chơi tự do">🎵</button>`,
    ...SONGS.map((s, i) => `<button class="tab song-pick" type="button" data-s="${i}" aria-pressed="${state.song === i}" aria-label="${s.label}">${s.icon}</button>`)].join("");
}
function pickSong(i) {
  stopDemo();
  state.song = i; state.step = 0;
  renderSongPicks();
  $("#xylo-listen").hidden = i === null;
  keys.classList.toggle("song-mode", i !== null);
  markNext();
}
$("#song-picks").addEventListener("click", (e) => {
  const b = e.target.closest("[data-s]"); if (!b) return;
  unlockAudio(); pickSong(b.dataset.s === "" ? null : +b.dataset.s);
});
function markNext() {
  const song = SONGS[state.song], next = song ? song.notes[state.step][0] : -1;
  bars.forEach((b, i) => b.classList.toggle("next", i === next));
}

function hit(i, fromChild = true) {
  const bar = bars[i];
  pling(BARS[i][0]);
  bar.classList.remove("hit"); void bar.offsetWidth; bar.classList.add("hit");
  flyNote(bar);
  if (!fromChild) return;
  stopDemo();
  const song = SONGS[state.song];
  if (!song || song.notes[state.step][0] !== i) return;   // a different bar still plays, the song just waits
  state.step++;
  if (state.step < song.notes.length) { markNext(); return; }
  bars.forEach((b) => b.classList.remove("next"));
  const done = state.song;
  setTimeout(() => {
    if ($("#xylo").hidden || state.song !== done) return;
    showPraise(PRAISE[Math.floor(Math.random() * PRAISE.length)], {
      stayIcon: "🔁", stayLabel: "Chơi lại bài này",
      onStay: () => pickSong(done),
      onNext: () => pickSong((done + 1) % SONGS.length),
      onClose: () => { if (!$("#xylo").hidden) pickSong(done); },
    });
  }, 900);
}
keys.addEventListener("animationend", (e) => e.target.classList.remove("hit"));

function flyNote(bar) {
  const area = $("#xylo-area"), a = area.getBoundingClientRect(), r = bar.getBoundingClientRect();
  const n = document.createElement("span");
  n.className = "note-fly"; n.textContent = Math.random() < 0.5 ? "♪" : "♫";
  n.style.left = (r.left - a.left + r.width / 2) + "px"; n.style.top = (r.top - a.top + Math.min(r.height, r.width) / 2) + "px";
  n.style.color = bar.style.getPropertyValue("--c");
  n.addEventListener("animationend", () => n.remove());
  area.appendChild(n);
  setTimeout(() => n.remove(), 1500);   // also when animations are turned off
}

// Many fingers at once, and sliding a finger across the bars plays each bar it enters.
const held = new Map();   // pointerId -> bar index (-1 between bars)
keys.addEventListener("pointerdown", (e) => {
  const b = e.target.closest(".bar"); if (!b || (e.pointerType === "mouse" && e.button !== 0)) return;
  e.preventDefault();
  try { b.releasePointerCapture(e.pointerId); } catch {}
  unlockAudio();
  held.set(e.pointerId, +b.dataset.i); hit(+b.dataset.i);
});
$("#xylo-area").addEventListener("pointermove", (e) => {
  if (!held.has(e.pointerId)) return;
  const el = document.elementFromPoint(e.clientX, e.clientY), b = el && el.closest ? el.closest(".bar") : null;
  const i = b ? +b.dataset.i : -1;
  if (i !== held.get(e.pointerId)) { held.set(e.pointerId, i); if (i >= 0) hit(i); }
});
for (const ev of ["pointerup", "pointercancel"]) $("#xylo-area").addEventListener(ev, (e) => held.delete(e.pointerId));
keys.addEventListener("click", (e) => { if (e.detail === 0) { const b = e.target.closest(".bar"); if (b) hit(+b.dataset.i); } });   // keyboard

// 👂 plays the song from the bar the child is on; any tap stops it.
function stopDemo() { clearTimeout(state.demo); state.demo = 0; $("#xylo-listen").classList.remove("playing"); }
$("#xylo-listen").addEventListener("click", () => {
  const song = SONGS[state.song]; if (!song) return;
  if (state.demo) { stopDemo(); return; }
  unlockAudio();
  $("#xylo-listen").classList.add("playing");
  let k = 0;
  const step = () => {
    if (k >= song.notes.length) { stopDemo(); markNext(); return; }
    const [bar, beats] = song.notes[k++];
    hit(bar, false);
    state.demo = setTimeout(step, beats * BEAT * 1000);
  };
  step();
});
