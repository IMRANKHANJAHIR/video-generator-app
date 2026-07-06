require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());
app.use(express.static('public'));

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
const REPLICATE_MODEL = process.env.REPLICATE_MODEL || 'bytedance/seedance-1-lite';
const PORT = process.env.PORT || 3000;

if (!REPLICATE_API_TOKEN) {
  console.warn('\n⚠️  No REPLICATE_API_TOKEN found. Copy .env.example to .env and add your token.\n');
}

// Kick off a video generation job
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, duration, aspect_ratio } = req.body;
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: 'A prompt is required.' });
    }
    if (!REPLICATE_API_TOKEN) {
      return res.status(500).json({ error: 'Server is missing REPLICATE_API_TOKEN. Add it to your .env file.' });
    }

    const input = { prompt: prompt.trim() };
    if (duration) input.duration = Number(duration);
    if (aspect_ratio) input.aspect_ratio = aspect_ratio;

    const response = await fetch(
      `https://api.replicate.com/v1/models/${REPLICATE_MODEL}/predictions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json',
          Prefer: 'wait=1',
        },
        body: JSON.stringify({ input }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.detail || 'Failed to start generation.' });
    }

    res.json({ id: data.id, status: data.status, urls: data.urls });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong starting the generation.' });
  }
});

// Poll a job's status
app.get('/api/status/:id', async (req, res) => {
  try {
    const response = await fetch(
      `https://api.replicate.com/v1/predictions/${req.params.id}`,
      { headers: { Authorization: `Bearer ${REPLICATE_API_TOKEN}` } }
    );
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.detail || 'Failed to fetch status.' });
    }

    res.json({
      status: data.status,
      output: data.output,
      error: data.error,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong checking status.' });
  }
});

app.listen(PORT, () => {
  console.log(`\n🎬 Video generator running at http://localhost:${PORT}\n`);
});
