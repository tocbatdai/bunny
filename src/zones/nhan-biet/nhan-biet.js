// Vườn thú – Bé Học Nhận Biết.
//   #/nhan-biet       look and listen: tap an animal, it jumps and the voice says its name
//   #/nhan-biet/tim   find the animal: "Con vịt đâu?" with 2, then 3, then 4 choices
// No score and no losing: a wrong tap names the animal that was tapped and asks again.
import { $ } from "../../shared/dom.js";
import { tone, unlockAudio, bindSoundButton } from "../../shared/sound.js";
import { sayVietnamese, stopSpeaking } from "../../shared/voice.js";
import { showPraise, hidePraise } from "../../shared/praise.js";
import { navigate, back } from "../../router.js";
import { ANIMALS } from "./animals.js";

const NEXT_DELAY = 1600;        // after a right answer, wait before the next question
const PRAISE_EVERY = 5;         // praise card after this many right answers
const PRAISE = ["Bé giỏi quá!", "Hoan hô! Bé biết hết các con vật rồi!", "Tuyệt vời! Bé tìm đúng rồi!"];

const quiz = { right: 0, target: null, choices: [], busy: false, timer: 0 };

/* ------------------------------------------------------------- zone API */
export function show([mode]) {
  $("#zoo").hidden = false;
  if (mode === "tim") startQuiz();
  else { if (mode) navigate("nhan-biet", { replace: true }); else closeQuiz(); }
}
export function leave() {
  closeQuiz();
  $("#zoo").hidden = true;
}

/* ------------------------------------------------------- look and listen */
$("#zoo-grid").innerHTML = ANIMALS.map((a) =>
  `<button class="card animal" type="button" data-animal="${a.id}">${a.svg()}<span>${a.name}</span></button>`).join("");

function jump(el, kind = "jump") {
  el.classList.remove("jump", "wobble"); void el.offsetWidth; el.classList.add(kind);
}
$("#zoo-grid").addEventListener("click", (e) => {
  const card = e.target.closest("[data-animal]"); if (!card) return;
  const a = ANIMALS.find((x) => x.id === card.dataset.animal);
  unlockAudio(); jump(card);
  tone(523, { dur: 0.18, vol: 0.05, slide: 1.5, type: "triangle" });
  sayVietnamese(a.say);
});
for (const sel of ["#zoo-grid", "#quiz-area"]) $(sel).addEventListener("animationend", (e) => e.target.classList.remove("jump", "wobble"));
$("#zoo-play").addEventListener("click", () => { unlockAudio(); navigate("nhan-biet/tim"); });
$("#zoo-home-btn").addEventListener("click", () => back(""));
$("#quiz-back").addEventListener("click", () => back("nhan-biet"));
bindSoundButton($("#zoo-sound"));
bindSoundButton($("#quiz-sound"));

/* --------------------------------------------------------- find the animal */
const lower = (name) => name.charAt(0).toLowerCase() + name.slice(1);
const choiceCount = () => (quiz.right < 3 ? 2 : quiz.right < 8 ? 3 : 4);
const pick = (list) => list[Math.floor(Math.random() * list.length)];

function startQuiz() {
  quiz.right = 0; quiz.target = null;
  $("#quiz").hidden = false; document.body.style.overflow = "hidden";
  nextQuestion();
}
function closeQuiz() {
  clearTimeout(quiz.timer); quiz.busy = false;
  if ($("#quiz").hidden) return;
  $("#quiz").hidden = true; hidePraise(); stopSpeaking(); document.body.style.overflow = "";
}

function nextQuestion() {
  clearTimeout(quiz.timer); quiz.busy = false;
  const n = choiceCount();
  const target = pick(ANIMALS.filter((a) => a !== quiz.target));
  const others = ANIMALS.filter((a) => a !== target).sort(() => Math.random() - 0.5).slice(0, n - 1);
  quiz.target = target;
  quiz.choices = [target, ...others].sort(() => Math.random() - 0.5);
  $("#quiz-question").textContent = `${target.name} đâu?`;
  $("#quiz-area").innerHTML = quiz.choices.map((a) =>
    `<button class="card animal choice" type="button" data-animal="${a.id}" aria-label="${a.name}">${a.svg()}</button>`).join("");
  layoutChoices();
  ask();
}
const ask = () => sayVietnamese(`${quiz.target.name} đâu?`);
$("#quiz-repeat").addEventListener("click", ask);

// Choices are square cards, as big as the screen allows: try every column count, keep the biggest.
function layoutChoices() {
  const area = $("#quiz-area"), n = quiz.choices.length, gap = 18;
  const W = area.clientWidth, H = area.clientHeight;
  let size = 0;
  for (let c = 1; c <= n; c++) {
    const r = Math.ceil(n / c);
    size = Math.max(size, Math.min((W - gap * (c + 1)) / c, (H - gap * (r + 1)) / r));
  }
  area.style.setProperty("--size", Math.floor(Math.min(size, 360)) + "px");
}
window.addEventListener("resize", () => { if (!$("#quiz").hidden) layoutChoices(); });

$("#quiz-area").addEventListener("click", (e) => {
  const card = e.target.closest("[data-animal]"); if (!card || quiz.busy) return;
  const a = ANIMALS.find((x) => x.id === card.dataset.animal);
  if (a === quiz.target) {
    quiz.busy = true; quiz.right++;
    jump(card); card.classList.add("right");
    for (const other of $("#quiz-area").querySelectorAll(".choice:not(.right)")) other.classList.add("faded");
    [659.25, 783.99, 1046.5].forEach((f, i) => tone(f, { dur: 0.22, vol: 0.06, delay: i * 0.1, type: "triangle" }));
    sayVietnamese(`Đúng rồi! ${a.name}!`);
    if (quiz.right % PRAISE_EVERY === 0) quiz.timer = setTimeout(praise, NEXT_DELAY);
    else quiz.timer = setTimeout(nextQuestion, NEXT_DELAY);
  } else {
    jump(card, "wobble");
    tone(300, { dur: 0.22, vol: 0.04, slide: 0.8, type: "triangle" });
    sayVietnamese(`Đây là ${lower(a.name)}. ${quiz.target.name} đâu?`);
  }
});

function praise() {
  showPraise(pick(PRAISE), {
    stayIcon: "🦒", stayLabel: "Xem các con vật",
    onStay: () => back("nhan-biet"),
    onNext: nextQuestion,
    onClose: () => { if (!$("#quiz").hidden) nextQuestion(); },   // closed with Esc: keep playing
  });
}
