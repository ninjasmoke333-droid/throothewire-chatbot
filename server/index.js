import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config({ path: 'C:\\Users\\ninja\\Desktop\\throoTHEwire-chatbot-website\\throothewire-chatbot\\.env' });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "online", name: "THROOTHEWIRE proxy" });
});

// Brave Search proxy
app.get("/api/search", async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ error: "Query parameter 'q' is required" });
  }

  if (!process.env.VITE_BRAVE_API_KEY) {
    return res.status(500).json({ error: "Brave API key not configured" });
  }

  try {
    const response = await fetch(
      `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(q)}&count=3`,
      {
        headers: {
          "Accept": "application/json",
          "Accept-Encoding": "gzip",
          "X-Subscription-Token": process.env.VITE_BRAVE_API_KEY,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Brave Search error:", response.status, error);
      return res.status(response.status).json({ error: "Brave Search failed", details: error });
    }

    const data = await response.json();
    const results = data.web?.results?.slice(0, 3).map(r => ({
      title: r.title,
      description: r.description,
      url: r.url,
    })) || [];

    res.json({ results });

  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: "Internal proxy error", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🤖 THROOTHEWIRE proxy online at http://localhost:${PORT}`);
});
