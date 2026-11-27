// Ngôi nhà hội họa – Bé Vẽ Vui: the colouring zone.
//   #/ve        gallery of pictures by category
//   #/ve/<id>   colouring one picture
// Each picture's colouring areas are pre-computed (tools/build.html), so opening a picture is:
// fetch line art + area map, decode, draw. A tap paints one pre-indexed pixel list and redraws
// only that area's rectangle, which keeps it smooth on low-end phones and tablets.
import { drawings, categories } from "../../../data/drawings.js";
import { pagePaths, decodeAreas, indexAreas, COLORS } from "../../pages.js";
import { $, store, loadImage } from "../../shared/dom.js";
import { tone, unlockAudio, startMusic, stopMusic } from "../../shared/sound.js";
import { showPraise, hidePraise } from "../../shared/praise.js";
import { navigate, back } from "../../router.js";

const MIN_REQUIRED_SHARE = 0.0005;           // smaller inner areas (~18x18 px on 800x800) are not needed for 100%
const HOLD_MS = 800;                         // reset button hold time
const SNAP_RADIUS = 10;                       // a tap on a line snaps to the nearest area (px)
const PRAISE = ["Bé tô màu đẹp quá!", "Hoan hô! Bé giỏi lắm!", "Tuyệt vời! Bé là họa sĩ nhí!", "Đẹp quá! Thưởng bé một tràng pháo tay!"];

const state = {
  category: store.get("category", "all"),
  color: store.get("color", 0),
  drawing: null,   // catalogue entry being coloured
  page: null,      // loaded page data (see openPicture)
  loadToken: 0,
};
const pictureList = () => drawings.filter((d) => state.category === "all" || d.category === state.category);

/* ------------------------------------------------------------- zone API */
export function show([id]) {
  $("#home").hidden = false;
  if (id) openPicture(id); else closePicture();
}
export function leave() {
  closePicture();
  $("#home").hidden = true;
}

/* -------------------------------------------------------------- gallery */
function renderTabs() {
  $("#tabs").innerHTML = categories.map((c) =>
    `<button class="tab" type="button" data-cat="${c.id}" aria-pressed="${c.id === state.category}"><span class="tab-icon" aria-hidden="true">${c.icon}</span>${c.name}</button>`).join("");
}
function renderGrid() {
  $("#grid").innerHTML = pictureList().map((d) =>
    `<button class="card" type="button" data-id="${d.id}"><img src="${pagePaths(d).thumb}" alt="" width="320" height="320" loading="lazy" decoding="async"><span>${d.name}</span></button>`).join("");
}
$("#tabs").addEventListener("click", (e) => {
  const b = e.target.closest("[data-cat]"); if (!b) return;
  state.category = b.dataset.cat; store.set("category", state.category);
  renderTabs(); renderGrid(); window.scrollTo(0, 0);
});
$("#grid").addEventListener("click", (e) => {
  const card = e.target.closest("[data-id]"); if (!card) return;
  unlockAudio();                           // unlock audio inside the tap
  navigate("ve/" + card.dataset.id);
});

/* -------------------------------------------------------------- palette */
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
const popSound = (i) => tone(392 + i * 28, { dur: 0.22, vol: 0.07, slide: 1.6, type: "triangle" });

/* ------------------------------------------------------- open / close */
const canvas = $("#canvas"), g2d = canvas.getContext("2d", { willReadFrequently: false });

async function openPicture(id) {
  const d = drawings.find((x) => x.id === id);
  if (!d) { navigate("ve", { replace: true }); return; }
  const token = ++state.loadToken;
  hidePraise(); cancelHold();
  state.drawing = d; state.page = null;
  $("#paint").hidden = false; document.body.style.overflow = "hidden";
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
  $("#paint").hidden = true; hidePraise(); document.body.style.overflow = "";
  stopMusic(); cancelHold();
}
$("#home-btn").addEventListener("click", () => back("ve"));
$("#gallery-home").addEventListener("click", () => back(""));

/* ---------------------------------------------------------------- paint */
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
  if (!p.praised && isFinished()) { p.praised = true; setTimeout(praise, 350); }
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

function praise() {
  if (!state.page) return;
  showPraise(PRAISE[Math.floor(Math.random() * PRAISE.length)], {
    onStay: startMusic,
    onNext: () => {
      const list = pictureList(), i = list.findIndex((d) => d.id === state.drawing?.id);
      navigate("ve/" + list[(i + 1) % list.length].id, { replace: true });
    },
  });
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

/* ------------------------------------------------------------------ start */
renderTabs(); renderGrid(); renderPalette();
