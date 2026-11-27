// Ngôi nhà ghép hình – Bé Ghép Hình.
//   #/ghep-hinh        pick a picture (and how many pieces)
//   #/ghep-hinh/<id>   the puzzle
// Pictures are the colouring pages, coloured (with the child's own colours where there are some).
// Pieces start small in a tray beside or under the board; dragging one makes it full size, and
// dropping it near its place snaps it in. A wrong drop just sends it back: no score, no losing.
import { drawings } from "../../../data/drawings.js";
import { pagePaths } from "../../pages.js";
import { $, store } from "../../shared/dom.js";
import { tone, unlockAudio, startMusic, stopMusic, bindSoundButton } from "../../shared/sound.js";
import { showPraise, hidePraise } from "../../shared/praise.js";
import { colouredPicture } from "../../shared/picture.js";
import { navigate, back } from "../../router.js";

const LEVELS = [
  { n: 2, cols: 2, rows: 1 },
  { n: 3, cols: 3, rows: 1 },
  { n: 4, cols: 2, rows: 2 },
  { n: 6, cols: 3, rows: 2 },
];
const GAP = 14;                 // px between board, tray and screen edges
const SNAP = 0.45;              // drop within this share of a piece's size from its place to snap in
const PRAISE = ["Bé ghép giỏi quá!", "Hoan hô! Bức tranh hoàn thành rồi!", "Tuyệt vời! Bé ghép đúng hết rồi!", "Giỏi lắm! Thưởng bé một tràng pháo tay!"];

const state = {
  level: LEVELS.some((l) => l.n === store.get("puzzle-level", 2)) ? store.get("puzzle-level", 2) : 2,
  drawing: null,
  token: 0,
  url: null,          // object URL of the coloured picture
  pic: null,          // { w, h } of the picture
  pieces: [],         // { el, col, row, slot, placed }
  geo: null,          // board and tray geometry in px, see layout()
  done: false,
};
const level = () => LEVELS.find((l) => l.n === state.level);
const area = $("#puzzle-area"), board = $("#puzzle-board");

/* ------------------------------------------------------------- zone API */
export function show([id]) {
  $("#puzzle-home").hidden = false;
  if (id) openPuzzle(id); else { closePuzzle(); renderGrid(); }   // the child may have coloured more pictures meanwhile
}
export function leave() {
  closePuzzle();
  $("#puzzle-home").hidden = true;
}

/* ---------------------------------------------------------------- picker */
function renderLevels() {
  $("#puzzle-levels").innerHTML = LEVELS.map((l) =>
    `<button class="tab" type="button" data-n="${l.n}" aria-pressed="${l.n === state.level}"><span class="tab-icon" aria-hidden="true">🧩</span>${l.n} mảnh</button>`).join("");
}
function renderGrid() {
  // Pictures the child has coloured come first, marked with a palette.
  const mine = (d) => store.get("page:" + d.id, null) !== null;
  const list = [...drawings.filter(mine), ...drawings.filter((d) => !mine(d))];
  $("#puzzle-grid").innerHTML = list.map((d) =>
    `<button class="card" type="button" data-id="${d.id}">${mine(d) ? `<span class="card-badge" aria-label="Tranh bé đã tô">🎨</span>` : ""}<img src="${pagePaths(d).thumb}" alt="" width="320" height="320" loading="lazy" decoding="async"><span>${d.name}</span></button>`).join("");
}
$("#puzzle-levels").addEventListener("click", (e) => {
  const b = e.target.closest("[data-n]"); if (!b) return;
  state.level = +b.dataset.n; store.set("puzzle-level", state.level);
  renderLevels(); tone(523 + state.level * 40, { dur: 0.15, vol: 0.04, type: "triangle" });
});
$("#puzzle-grid").addEventListener("click", (e) => {
  const card = e.target.closest("[data-id]"); if (!card) return;
  unlockAudio();
  navigate("ghep-hinh/" + card.dataset.id);
});
$("#puzzle-home-btn").addEventListener("click", () => back(""));
$("#puzzle-back").addEventListener("click", () => back("ghep-hinh"));
bindSoundButton($("#puzzle-home-sound"));
bindSoundButton($("#puzzle-sound"));

/* ------------------------------------------------------- open / close */
async function openPuzzle(id) {
  const d = drawings.find((x) => x.id === id);
  if (!d) { navigate("ghep-hinh", { replace: true }); return; }
  const token = ++state.token;
  hidePraise(); clearPieces();
  state.drawing = d; state.done = false;
  $("#puzzle").hidden = false; document.body.style.overflow = "hidden";
  $("#puzzle-title").textContent = d.name;
  area.classList.remove("done");
  board.style.backgroundImage = `url("${pagePaths(d).thumb}")`;
  board.innerHTML = "";
  startMusic();
  try {
    const canvas = await colouredPicture(d);
    if (token !== state.token) return;
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    if (token !== state.token) return;
    state.url = URL.createObjectURL(blob);
    state.pic = { w: canvas.width, h: canvas.height };
    buildPieces();
  } catch (err) {
    console.error(err);
    if (token === state.token) $("#puzzle-title").textContent = d.name + " 😢";
  }
}

function closePuzzle() {
  state.token++; clearPieces(); state.drawing = null;
  $("#puzzle").hidden = true; hidePraise(); document.body.style.overflow = "";
  stopMusic();
}

function clearPieces() {
  for (const p of state.pieces) p.el.remove();
  state.pieces = []; drag = null;
  if (state.url) { URL.revokeObjectURL(state.url); state.url = null; }
}

function buildPieces() {
  const { n, cols, rows } = level();
  board.style.backgroundImage = `url("${state.url}")`;
  board.innerHTML = Array.from({ length: n }, () => `<i></i>`).join("");
  board.style.setProperty("--cols", cols); board.style.setProperty("--rows", rows);
  const slots = shuffle([...Array(n).keys()]);
  state.pieces = Array.from({ length: n }, (_, i) => {
    const el = document.createElement("div");
    el.className = "piece";
    el.style.backgroundImage = `url("${state.url}")`;
    area.appendChild(el);
    return { el, col: i % cols, row: Math.floor(i / cols), slot: slots[i], placed: false };
  });
  layout(false);
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

/* ---------------------------------------------------------------- layout */
// Board on the left (landscape) or on top (portrait), as big as possible; the tray gets the rest.
// Pieces in the tray are scaled down to fit; dragged or placed pieces are full size.
function layout(animate = true) {
  if (!state.pic || !state.pieces.length) return;
  const { n, cols, rows } = level();
  const W = area.clientWidth, H = area.clientHeight, ar = state.pic.w / state.pic.h;
  const landscape = W > H * 1.05;
  const fit = (mw, mh) => (mw / mh > ar ? [mh * ar, mh] : [mw, mw / ar]);
  let bw, bh, bx, by, tray;
  if (landscape) {
    [bw, bh] = fit(W * 0.6 - GAP * 1.5, H - GAP * 2);
    bx = GAP; by = (H - bh) / 2;
    tray = { x: bx + bw + GAP, y: GAP, w: W - bw - GAP * 3, h: H - GAP * 2 };
  } else {
    [bw, bh] = fit(W - GAP * 2, H * 0.58 - GAP * 1.5);
    bx = (W - bw) / 2; by = GAP;
    tray = { x: GAP, y: by + bh + GAP, w: W - GAP * 2, h: H - bh - GAP * 3 };
  }
  const cw = bw / cols, ch = bh / rows;
  // Tray grid: try every column count, keep the one that lets pieces be biggest.
  let best = { s: 0, c: 1, r: n };
  for (let c = 1; c <= n; c++) {
    const r = Math.ceil(n / c);
    const s = Math.min(1, (tray.w - GAP * (c - 1)) / (c * cw), (tray.h - GAP * (r - 1)) / (r * ch));
    if (s > best.s) best = { s, c, r };
  }
  const { s, c: tc, r: tr } = best;
  const gw = tc * cw * s + GAP * (tc - 1), gh = tr * ch * s + GAP * (tr - 1);
  const ox = tray.x + (tray.w - gw) / 2, oy = tray.y + (tray.h - gh) / 2;
  state.geo = { bx, by, bw, bh, cw, ch, s, slot: (k) => [ox + (k % tc) * (cw * s + GAP), oy + Math.floor(k / tc) * (ch * s + GAP)] };

  Object.assign(board.style, { left: bx + "px", top: by + "px", width: bw + "px", height: bh + "px" });
  for (const p of state.pieces) {
    Object.assign(p.el.style, {
      width: cw + "px", height: ch + "px",
      backgroundSize: `${bw}px ${bh}px`, backgroundPosition: `${-p.col * cw}px ${-p.row * ch}px`,
    });
    if (p !== (drag && drag.piece)) rest(p, animate);
  }
}

// Move a piece to where it belongs when nobody holds it: its place on the board, or its tray slot.
function rest(p, animate = true) {
  const g = state.geo;
  p.el.classList.toggle("animate", animate);
  if (p.placed) put(p, g.bx + p.col * g.cw, g.by + p.row * g.ch, 1);
  else { const [x, y] = g.slot(p.slot); put(p, x, y, g.s); }
}
function put(p, x, y, s) { p.el.style.transform = `translate(${x}px, ${y}px) scale(${s})`; }

let resizeFrame = 0;
window.addEventListener("resize", () => {
  if ($("#puzzle").hidden) return;
  cancelAnimationFrame(resizeFrame); resizeFrame = requestAnimationFrame(() => layout(false));
});

/* ------------------------------------------------------------------ drag */
// One finger at a time; the piece is centred under the finger while it is held.
let drag = null;
function pointerAt(e) { const r = area.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
function follow(e) {
  const g = state.geo, [x, y] = pointerAt(e);
  const cx = Math.max(0, Math.min(area.clientWidth, x)), cy = Math.max(0, Math.min(area.clientHeight, y));
  drag.x = cx; drag.y = cy;
  put(drag.piece, cx - g.cw / 2, cy - g.ch / 2, 1);
}

area.addEventListener("pointerdown", (e) => {
  if (drag || state.done || (e.pointerType === "mouse" && e.button !== 0)) return;
  const el = e.target.closest(".piece"); if (!el) return;
  const piece = state.pieces.find((p) => p.el === el); if (!piece || piece.placed) return;
  e.preventDefault();
  drag = { piece, id: e.pointerId, x: 0, y: 0 };
  try { el.setPointerCapture(e.pointerId); } catch {}
  el.classList.add("lifted", "animate");
  follow(e);
  tone(587, { dur: 0.12, vol: 0.04, type: "triangle", slide: 1.3 });
  // After the lift animation, follow the finger without delay.
  setTimeout(() => { if (drag && drag.piece === piece) el.classList.remove("animate"); }, 140);
});
area.addEventListener("pointermove", (e) => { if (drag && e.pointerId === drag.id) follow(e); });
function drop(e) {
  if (!drag || e.pointerId !== drag.id) return;
  const { piece, x, y } = drag, g = state.geo;
  drag = null;
  piece.el.classList.remove("lifted");
  const tx = g.bx + (piece.col + 0.5) * g.cw, ty = g.by + (piece.row + 0.5) * g.ch;
  if (Math.hypot(x - tx, y - ty) < Math.min(g.cw, g.ch) * SNAP) {
    piece.placed = true;
    piece.el.classList.add("placed");
    rest(piece);
    tone(392 + state.pieces.filter((p) => p.placed).length * 60, { dur: 0.25, vol: 0.07, slide: 1.6, type: "triangle" });
    if (state.pieces.every((p) => p.placed)) finish();
  } else {
    rest(piece);
    tone(300, { dur: 0.2, vol: 0.04, slide: 0.8, type: "triangle" });
  }
}
area.addEventListener("pointerup", drop);
area.addEventListener("pointercancel", drop);

/* ---------------------------------------------------------------- finish */
function finish() {
  state.done = true;
  const token = state.token;
  setTimeout(() => {
    if (token !== state.token) return;
    area.classList.add("done");
    setTimeout(() => {
      if (token !== state.token) return;
      showPraise(PRAISE[Math.floor(Math.random() * PRAISE.length)], {
        stayIcon: "🔁", stayLabel: "Ghép lại tranh này",
        onStay: () => openPuzzle(state.drawing.id),   // same route, so open it directly
        onNext: () => {
          const i = drawings.findIndex((d) => d.id === state.drawing?.id);
          navigate("ghep-hinh/" + drawings[(i + 1) % drawings.length].id, { replace: true });
        },
      });
    }, 700);
  }, 250);
}
/* ------------------------------------------------------------------ start */
renderLevels();
