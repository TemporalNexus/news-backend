// server.js - Bypasses GPT rewriting to avoid quota issues
import express from 'express';
import fetch from 'node-fetch';
import { config } from 'dotenv';

config();

const app = express();
const PORT = process.env.PORT || 3000;

// Ping route to verify server responsiveness
app.get('/ping', (req, res) => {
  console.log("Received /ping request");
  res.send("pong");
});

// Updated to broader search query
const NEWSAPI_URL = `https://newsapi.org/v2/everything?q=celebrity%20OR%20fame%20OR%20pop%20culture&sortBy=publishedAt&pageSize=5&language=en&apiKey=${process.env.NEWSAPI_KEY}`;

app.get('/api/news', async (req, res) => {
  try {
    const response = await fetch(NEWSAPI_URL);
    const data = await response.json();

    console.log("NewsAPI response:", data); // 🔍 Log NewsAPI data for debugging

    if (!data.articles || data.articles.length === 0) {
      return res.json({ articles: [] });
    }

    const simplifiedArticles = data.articles.map((article) => ({
      title: article.title,
      summary: article.description || article.content || '',
      image: article.urlToImage || null,
      source: article.source.name,
      publishedAt: article.publishedAt,
      url: article.url
    }));

    res.json({ articles: simplifiedArticles });
  } catch (err) {
    console.error("Error fetching articles:", err);
    res.status(500).json({ error: 'Failed to fetch news.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
