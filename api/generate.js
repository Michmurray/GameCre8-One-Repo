// api/generate.js
// Returns a simple playable placeholder game spec.

export default function handler(req, res) {
  // Optional: read prompt from POST body
  let promptText = "";
  try {
    if (req.method === "POST" && req.body && typeof req.body === "object") {
      promptText = req.body.prompt || "";
    }
  } catch (_) {}

  const game = {
    meta: { title: "GameCre8 Placeholder" },
    world: { width: 800, height: 480, gravity: 0.7 },
    player: {
      start: { x: 40, y: 320 },
      size: { w: 26, h: 26 },
      speed: 3.2,
      jump: 11
    },
    platforms: [
      { x: 0,   y: 440, w: 800, h: 40 },
      { x: 150, y: 360, w: 120, h: 12 },
      { x: 320, y: 320, w: 120, h: 12 },
      { x: 520, y: 280, w: 120, h: 12 }
    ],
    coins: [
      { x: 190, y: 330 },
      { x: 360, y: 290 },
      { x: 560, y: 250 }
    ],
    lava: [
      { x: 380, y: 430, w: 120, h: 10 }
    ],
    controls: { left: ["ArrowLeft"], right: ["ArrowRight"], jump:
