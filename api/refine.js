// Node/Micro style endpoint: POST {game, iterations?} -> {ok, game}
const { refine } = require("./generator");

module.exports = async (req, res) => {
  try {
    let body = "";
    for await (const chunk of req) body += chunk;
    const data = body ? JSON.parse(body) : {};
    const game = data.game;
    if (!game) throw new Error("Missing {game}");
    const out = refine(game, { iterations: Number(data.iterations) || 12 });

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ ok: true, game: out }));
  } catch (err) {
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ ok:false, error: String(err?.message || err) }));
  }
};
