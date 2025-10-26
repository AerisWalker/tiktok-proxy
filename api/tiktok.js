import TikTokSign from "tiktok-signature";
import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const { user } = req.query;
    if (!user)
      return res.status(400).json({ error: "Missing ?user parameter" });

    const profileUrl = `https://www.tiktok.com/@${user}`;
    const signer = new TikTokSign();
    const signed = signer.sign(profileUrl);
    const url = `${profileUrl}?${signed}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    const html = await response.text();
    const match = html.match(/https:\/\/www\.tiktok\.com\/@[^/]+\/video\/\d+/);

    if (!match)
      return res.status(404).json({ error: "No video found" });

    res.status(200).json({ latest: match[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
