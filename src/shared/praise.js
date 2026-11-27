// The praise card (confetti, fanfare and a spoken compliment), shared by every zone.
// The zone that opens it says what its two buttons do, and optionally what happens when the
// card is closed another way (Esc, or the zone being left).
import { $ } from "./dom.js";
import { fanfare, stopMusic } from "./sound.js";
import { sayVietnamese, stopSpeaking } from "./voice.js";

const BITS = ["🎉", "⭐", "💖", "🌈", "✨", "🎈"];
let handlers = null;

export const praiseOpen = () => !$("#praise").hidden;

export function showPraise(text, { onStay, onNext, onClose, stayIcon = "🖍️", stayLabel = "Tô tiếp tranh này" }) {
  handlers = { onStay, onNext, onClose };
  $("#praise-stay").textContent = stayIcon;
  $("#praise-stay").setAttribute("aria-label", stayLabel);
  $("#praise-text").textContent = text;
  $("#confetti").innerHTML = Array.from({ length: 24 }, (_, i) =>
    `<span style="--x:${Math.random() * 100}%;--d:${(Math.random() * 0.6).toFixed(2)}s">${BITS[i % BITS.length]}</span>`).join("");
  $("#praise").hidden = false;
  stopMusic(); fanfare(); sayVietnamese(text);
}

export function hidePraise() {
  const h = handlers;
  handlers = null;
  $("#praise").hidden = true; stopSpeaking();
  if (h && h.onClose) h.onClose();
}

for (const [sel, key] of [["#praise-stay", "onStay"], ["#praise-next", "onNext"]]) {
  $(sel).addEventListener("click", () => {
    const h = handlers; handlers = null;   // a button was used: not a plain close
    hidePraise();
    if (h && h[key]) h[key]();
  });
}
