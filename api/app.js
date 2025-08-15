// app.js (module)
import { TinyEngine } from "./engine.js";

const canvas = document.getElementById("game");
const statusEl = document.getElementById("status");
const titleEl = document.getElementById("title");
const engine = new TinyEngine(canvas, statusEl, titleEl);

const promptInput = document.getElementById("prompt");
const goBtn = document.getElementById("go");

async function createAndPlay() {
  const prompt = promptInput.value.trim();
  statusEl.textContent = "Generating...";
  goBtn.disabled = true;

  try {
    const resp = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });

    if (!resp.ok) throw new Error(`API error: ${resp.status}`);

    const gameJson = await resp.json();
    engine.load(gameJson);
    statusEl.textContent = "Playing. Collect all coins!";
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Error. Check console.";
  } finally {
    goBtn.disabled = false;
  }
}

goBtn.addEventListener("click", createAndPlay);

window.addEventListener("load", () => {
  promptInput.value = "A simple platformer with coins and lava";
  createAndPlay();
});
