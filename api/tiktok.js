import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const { user } = req.query;
    if (!user)
      return res.status(400).json({ error: "Missing ?user parameter" });

    const rssUrl = `https://www.tiktok.com/@${user}/rss`;
    const response = await fetch(rssUrl);
    const xml = await response.text();

    // Buscar el primer enlace del feed RSS
    const match = xml.match(/<link>(https:\/\/www\.tiktok\.com\/@[^<]+)<\/link>/i);

    if (!match || !match[1]) {
      return res.status(404).json({ error: "No TikTok link found" });
    }

    res.status(200).json({ latest: match[1] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
