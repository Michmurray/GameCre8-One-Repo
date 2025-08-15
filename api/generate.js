// api/generate.js
// Express app wrapped with serverless-http so it runs as a Vercel Function.

const express = require("express");
const serverless = require("serverless-http");

const app = express();
app.use(express.json());

// Helper: very simple placeholder game generator based on the prompt
function generateGameFromPrompt(prompt) {
  const width = 800;
  const height = 480;

  const seed = (prompt || "").length || 7;
  const coins = Array.from({ length: 5 + (seed % 5) }).map((_, i) => ({
    x: 100 + ((i * 120) % (width - 120)),
    y: 120 + ((i * 70 + seed * 13) % (height - 200)),
    size: 14
  }));

  const lava = [
    { x: 0, y: height - 40, w: width * 0.35, h: 40 },
    { x: width * 0.55, y: height - 40, w: width * 0.45, h: 40 }
  ];

  return {
    meta: {
      title: `GameCre8 Placeholder — ${prompt || "Untitled"}`,
      promptUsed: prompt || "",
      instructions: "Use arrow keys to move. Collect all coins. Don’t touch lava."
    },
    world: { width, height, gravity: 0.7 },
    player: { x: 40, y: 40, w: 28, h: 28, speed: 3.2, jump: 12 },
    platforms: [
      { x: 0, y: height - 60, w: width, h: 20 },
      { x: 120, y: height - 160, w: 120, h: 12 },
      { x: 320, y: height - 220, w: 120, h: 12 },
      { x: 540, y: height - 280, w: 140, h: 12 }
    ],
    coins,
    lava
  };
}

// Vercel function path is /api/generate. We handle POST at "/" within this function.
app.post("/", (req, res) => {
  const { prompt } = req.body || {};
  const gameJson = generateGameFromPrompt(String(prompt || ""));
  res.status(200).json(gameJson);
});

// Optional health check
app.get("/", (_req, res) => {
  res.status(200).json({ ok: true, route: "/api/generate" });
});

module.exports = serverless(app);
