// public/app.js
// Frontend glue: calls /api/generate and loads the returned game into the engine.
import { TinyEngine } from "./engine.js";

const canvas = document.getElementById("game");
const goBtn = document.getElementById("go");
const promptInput = document.getElementById("prompt");
const titleEl = document.getElementById("title");
const statusEl = document.getElementById("status");

const engine = new TinyEngine(canvas);

async function createAndPlay() {
  try {
    statusEl.textContent = "Loading...";
    goBtn.disabled = true;

    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: promptInput.value || "" }),
    });

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    const data = await res.json();

    // Accept either { game: {...} } or the game object directly
    const spec = data?.game ?? data;

    if (!spec || !spec.world) {
      throw new Error("Bad spec from API (missing world).");
    }

    // Optional UI polish
    titleEl.textContent = spec.meta?.title ?? "GameCre8 Placeholder";

    // Load and play
    engine.load(spec);
    statusEl.textContent = "Go!";
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Error. Check console.";
  } finally {
    goBtn.disabled = false;
  }
}

goBtn.addEventListener("click", createAndPlay);

// Auto-load a demo on first paint
window.addEventListener("load", () => {
  if (promptInput) {
    promptInput.value = "A simple platformer with coins and lava";
  }
  // Don't auto-start if you prefer manual; otherwise uncomment:
  // createAndPlay();
});
