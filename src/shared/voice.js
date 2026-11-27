// Speech must use a Vietnamese voice. Setting only lang="vi-VN" is not enough: Chrome on
// Android/Windows often keeps the default (English) voice, which mangles Vietnamese. So pick a
// Vietnamese voice explicitly, and stay silent if the device has none (text and sounds still show).
import { soundOn } from "./sound.js";

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

export function sayVietnamese(text) {
  if (!soundOn() || !("speechSynthesis" in window)) return;
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

export function stopSpeaking() {
  speaking = null;
  try { speechSynthesis.cancel(); } catch {}
}
