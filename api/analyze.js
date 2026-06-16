// api/analyze.js
// Vercel serverless function: calls the Feng-GUI ImageAttention API server-side
// (where there IS internet access) and returns the result as JSON.
//
// Your Feng-GUI token lives ONLY in Vercel's Environment Variables (FENGGUI_TOKEN),
// never in this code and never exposed to the browser.
//
// Usage:  GET /api/analyze?image=<public-image-url>
// Optional passthrough params: ViewType, ViewDistance, AnalysisOptions, OutputOptions

export default async function handler(req, res) {
  // Allow the report builder / browser to call this from anywhere.
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  if (req.method === "OPTIONS") return res.status(204).end();

  const apikey = process.env.FENGGUI_TOKEN;
  if (!apikey) {
    return res.status(500).json({
      error:
        "Server is missing FENGGUI_TOKEN. Set it in Vercel → Project → Settings → Environment Variables, then redeploy.",
    });
  }

  // Accept either ?image= or ?InputImage=
  const image = req.query.image || req.query.InputImage;
  if (!image) {
    return res.status(400).json({
      error: "Missing required query param 'image' (a publicly accessible image URL).",
      example: "/api/analyze?image=https://your-app.vercel.app/campaign.jpg",
    });
  }

  const {
    ViewType = 0,
    ViewDistance = 0,
    AnalysisOptions = 0,
    OutputOptions = 0,
  } = req.query;

  const params = new URLSearchParams({
    id: "1",
    InputImage: image,
    ViewType: String(ViewType),
    ViewDistance: String(ViewDistance),
    AnalysisOptions: String(AnalysisOptions),
    OutputOptions: String(OutputOptions),
  });

  const apiUrl = `https://service.feng-gui.com/json/api.ashx/ImageAttention?${params.toString()}`;

  try {
    // Current Feng-GUI API authenticates with the key in the X-API-Key header
    // (or an ?apikey= query param). The old ?token= param is no longer valid.
    const r = await fetch(apiUrl, { headers: { "X-API-Key": apikey } });
    const text = await r.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text }; // surface non-JSON responses instead of crashing
    }

    if (!r.ok) {
      return res
        .status(502)
        .json({ error: `Feng-GUI returned HTTP ${r.status}`, body: data });
    }

    // Convenience: the dashboard link is only valid if the image already lives
    // in your Feng-GUI user folder. Provided for reference, not relied upon.
    const filename = String(image).split("/").pop();
    const dashboard = `https://app.feng-gui.com/report.htm?imageid=https://service.feng-gui.com/users/christophe.salesbrain.com/files/images/${filename}`;

    return res.status(200).json({
      ok: true,
      request: { image },
      dashboard,
      result: data,
    });
  } catch (err) {
    return res
      .status(502)
      .json({ error: "Failed to reach Feng-GUI.", detail: String(err) });
  }
}
