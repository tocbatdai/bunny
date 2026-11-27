// Thế Giới Của Bé – the home screen (#/): a world scene where each house is a zone.
// Tap a house: it bounces, says its name, then opens. Sleeping houses ("coming soon") wobble
// and say so instead.
import { $ } from "../../shared/dom.js";
import { tone, unlockAudio } from "../../shared/sound.js";
import { sayVietnamese } from "../../shared/voice.js";
import { navigate } from "../../router.js";
import { HOUSES, worldSvg } from "./world.js";

const OPEN_DELAY = 650;      // let the bounce play before the zone opens
const portrait = matchMedia("(orientation: portrait)");
let drawnPortrait = null, opening = 0;

function draw() {
  if (drawnPortrait === portrait.matches) return;
  drawnPortrait = portrait.matches;
  $("#world-scene").innerHTML = worldSvg(drawnPortrait);
}
portrait.addEventListener("change", () => { if (!$("#world").hidden) draw(); });

export function show() {
  clearTimeout(opening); opening = 0;
  draw();
  $("#world").hidden = false;
  document.body.style.overflow = "hidden";
}
export function leave() {
  clearTimeout(opening); opening = 0;
  $("#world").hidden = true;
  document.body.style.overflow = "";
}

function tapHouse(el) {
  const h = HOUSES.find((x) => x.id === el.dataset.house); if (!h || opening) return;
  unlockAudio();
  const anim = h.route ? "bounce" : "wobble";
  el.classList.remove("bounce", "wobble"); void el.getBoundingClientRect(); el.classList.add(anim);
  sayVietnamese(h.say);
  if (!h.route) { tone(330, { dur: 0.25, vol: 0.05, slide: 0.7, type: "triangle" }); return; }
  [523.25, 659.25, 783.99].forEach((f, i) => tone(f, { dur: 0.22, vol: 0.05, delay: i * 0.09, type: "triangle" }));
  opening = setTimeout(() => { opening = 0; navigate(h.route); }, OPEN_DELAY);
}
$("#world-scene").addEventListener("click", (e) => { const el = e.target.closest("[data-house]"); if (el) tapHouse(el); });
$("#world-scene").addEventListener("keydown", (e) => {
  if (e.key !== "Enter" && e.key !== " ") return;
  const el = e.target.closest("[data-house]"); if (el) { e.preventDefault(); tapHouse(el); }
});
$("#world-scene").addEventListener("animationend", (e) => e.target.classList.remove("bounce", "wobble"));
