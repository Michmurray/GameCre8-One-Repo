// Node/Micro style endpoint: POST {prompt, auto?, iterations?} -> {ok, game}
const { generateFromPrompt } = require("./generator");

module.exports = async (req, res) => {
  try {
    let body = "";
    for await (const chunk of req) body += chunk;
    const data = body ? JSON.parse(body) : {};
    const prompt = data.prompt || "";
    const auto = data.auto !== false; // default: true
    const iterations = Number(data.iterations) || undefined;

    const game = generateFromPrompt(prompt, { auto, iterations });

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ ok: true, game }));
  } catch (err) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ ok:false, error: String(err?.message || err) }));
  }
};
