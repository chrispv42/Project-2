export default async function handler(req, res) {
  const { type = "search", q = "", limit = "24", offset = "0" } = req.query;
  const API_KEY = process.env.GIPHY_API_KEY;
  const base = "https://api.giphy.com/v1/gifs";

  const url =
    type === "trending"
      ? `${base}/trending?api_key=${API_KEY}&limit=${limit}&offset=${offset}&rating=pg-13`
      : `${base}/search?api_key=${API_KEY}&q=${encodeURIComponent(q)}&limit=${limit}&offset=${offset}&rating=pg-13&lang=en`;

  const r = await fetch(url);
  const data = await r.json();

  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
  res.status(200).json(data);
}
