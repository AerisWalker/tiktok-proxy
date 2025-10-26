import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const { user } = req.query;
    if (!user)
      return res.status(400).json({ error: "Missing ?user parameter" });

    // 🩵 1️⃣ primer intento: servidor principal de RSSHub
    const primary = `https://rsshub.app/tiktok/user/${user}`;
    let response = await fetch(primary, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    // 🩸 2️⃣ si el principal falla, intentar con un mirror alternativo
    if (!response.ok) {
      console.warn(`⚠️ RSSHub principal falló (${response.status}), usando mirror...`);
      const backup = `https://rsshub.moeyy.cn/tiktok/user/${user}`;
      response = await fetch(backup, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });
    }

    if (!response.ok) {
      return res
        .status(response.status)
        .json({ error: `All RSSHub servers failed (${response.status})` });
    }

    // 🕯️ procesar el XML
    const xml = await response.text();
    const match = xml.match(/https:\/\/www\.tiktok\.com\/@[^/]+\/video\/\d+/);

    if (!match) {
      return res.status(404).json({ error: "No TikTok video found." });
    }

    res.status(200).json({
      latest: match[0],
      source: "RSSHub (with fallback)",
    });
  } catch (err) {
    console.error("❌ Error interno:", err.message);
    res.status(500).json({ error: err.message });
  }
}
