// The praise card (confetti, fanfare and a spoken compliment), shared by every zone.
// The zone that opens it says what its two buttons do.
import { $ } from "./dom.js";
import { fanfare, stopMusic } from "./sound.js";
import { sayVietnamese, stopSpeaking } from "./voice.js";

const BITS = ["🎉", "⭐", "💖", "🌈", "✨", "🎈"];
let handlers = null;

export const praiseOpen = () => !$("#praise").hidden;

export function showPraise(text, { onStay, onNext }) {
  handlers = { onStay, onNext };
  $("#praise-text").textContent = text;
  $("#confetti").innerHTML = Array.from({ length: 24 }, (_, i) =>
    `<span style="--x:${Math.random() * 100}%;--d:${(Math.random() * 0.6).toFixed(2)}s">${BITS[i % BITS.length]}</span>`).join("");
  $("#praise").hidden = false;
  stopMusic(); fanfare(); sayVietnamese(text);
}

export function hidePraise() {
  $("#praise").hidden = true; handlers = null; stopSpeaking();
}

for (const [sel, key] of [["#praise-stay", "onStay"], ["#praise-next", "onNext"]]) {
  $(sel).addEventListener("click", () => { const h = handlers; hidePraise(); if (h && h[key]) h[key](); });
}
