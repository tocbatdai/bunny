// Thế Giới Của Bé — app shell: shared buttons, the router and offline support.
// Each zone (ngôi nhà) lives in src/zones/<name>/ and is loaded the first time it is visited.
import { $, bindFullscreenButton } from "./src/shared/dom.js";
import { bindSoundButton } from "./src/shared/sound.js";
import { praiseOpen, hidePraise } from "./src/shared/praise.js";
import { registerZone, startRouter, onRoute, currentPath, back } from "./src/router.js";

registerZone("ve", () => import("./src/zones/ve/ve.js"));

bindSoundButton($("#home-sound"));
bindSoundButton($("#sound-btn"));
bindFullscreenButton($("#fullscreen-btn"));

// Esc closes the praise card, otherwise goes up one screen (like the Home button).
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  const path = currentPath();
  if (praiseOpen()) hidePraise();
  else if (path.length > 1) back(path.slice(0, -1).join("/"));
});

startRouter("ve");

// Offline + install support. Skipped on localhost so development always sees fresh files.
if ("serviceWorker" in navigator && (location.hostname !== "localhost" || location.search.includes("sw=1"))) {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  // A new version took over: reload to use it, but never in the middle of a game
  // (deeper than a zone's start screen): wait until the child is back there.
  const resting = (path) => path.length <= 1;
  let reloadPending = false;
  onRoute((path) => { if (reloadPending && resting(path)) location.reload(); });
  const hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!hadController) return;
    if (resting(currentPath())) location.reload(); else reloadPending = true;
  });
}
