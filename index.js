const express = require('express');
const fetchWebStories = require('./scrape');

const app = express();
const PORT = 3000;

app.get('/api/web-stories', async (req, res) => {
  const stories = await fetchWebStories();
  res.json(stories);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
