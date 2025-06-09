import express from 'express';
import fetch from 'node-fetch';
import { config } from 'dotenv';
import OpenAI from 'openai';

config();

const app = express();
const PORT = process.env.PORT || 3000;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const NEWSAPI_URL = 'https://newsapi.org/v2/top-headlines?category=entertainment&pageSize=5&language=en&apiKey=' + process.env.NEWSAPI_KEY;

app.get('/api/news', async (req, res) => {
  try {
    const response = await fetch(NEWSAPI_URL);
    const data = await response.json();

    const rewrittenArticles = await Promise.all(
      data.articles.map(async (article) => {
        const prompt = `Rewrite the following news article in a clear, factual tone that highlights its cultural significance. Avoid clickbait.\n\nTitle: ${article.title}\n\nContent: ${article.description || article.content}`;

        const completion = await openai.chat.completions.create({
          messages: [{ role: 'user', content: prompt }],
          model: 'gpt-4',
          temperature: 0.7,
        });

        return {
          title: article.title,
          summary: completion.choices[0].message.content.trim(),
          image: article.urlToImage,
          source: article.source.name,
          publishedAt: article.publishedAt,
          url: article.url,
        };
      })
    );

    res.json({ articles: rewrittenArticles });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch or rewrite news.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
