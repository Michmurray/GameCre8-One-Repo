import { TinyEngine } from "./engine.js";

const canvas = document.getElementById("game");
const goBtn = document.getElementById("go");
const promptInput = document.getElementById("prompt");
const titleEl = document.getElementById("title");
const statusEl = document.getElementById("status");

const engine = new TinyEngine(canvas);
let currentGame = null;

async function call(path, payload) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload || {})
  });
  if (!res.ok) throw new Error(path + " -> " + res.status);
  return res.json();
}

async function createAndPlay() {
  try {
    statusEl.textContent = "Generating...";
    goBtn.disabled = true;
    const { game } = await call("/api/generate", {
      prompt: promptInput.value || "",
      auto: true,
      iterations: 18
    });

    currentGame = game;
    titleEl.textContent = game?.meta?.title || "GameCre8";
    engine.load(game);
    statusEl.textContent = "Go! (press R to refine)";
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Error. Check console.";
  } finally {
    goBtn.disabled = false;
  }
}

async function refineOnce() {
  if (!currentGame) return;
  try {
    statusEl.textContent = "Refining...";
    const { game } = await call("/api/refine", { game: currentGame, iterations: 12 });
    currentGame = game;
    engine.load(game);
    statusEl.textContent = "Refined. Press R again to iterate.";
  } catch (e) {
    console.error(e);
    statusEl.textContent = "Refine failed.";
  }
}

goBtn.addEventListener("click", createAndPlay);
window.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "r") refineOnce();
});

window.addEventListener("load", () => {
  if (promptInput) promptInput.value ||= "a fun medium platformer with coins";
});
