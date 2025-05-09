// scrape.js
const puppeteer = require('puppeteer');
const fs = require('fs');

async function fetchWebStories() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    executablePath: puppeteer.executablePath() // ensures using bundled Chromium
  });

  const page = await browser.newPage();

  await page.goto('https://motoroctane.com/web-stories', {
    waitUntil: 'networkidle2',
    timeout: 0
  });

  // Optional: Scroll to load lazy content
  await page.evaluate(async () => {
    await new Promise(resolve => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= document.body.scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });

  // Wait for content to fully load
  await new Promise(resolve => setTimeout(resolve, 3000));

  const stories = await page.evaluate(() => {
    const data = [];
    const storyBlocks = document.querySelectorAll('.webstoriessection');

    storyBlocks.forEach(story => {
      const titleEl = story.querySelector('h2.title a');
      const imageEl = story.querySelector('img');
      const authorEl = story.querySelector('span.post_author_date a');

      const title = titleEl?.innerText?.trim() || '';
      const link = titleEl?.href || '';

      // Lazy image fix
      let image = imageEl?.getAttribute('src') || '';
      if (image.startsWith('data:image/svg+xml')) {
        image = imageEl?.getAttribute('data-src') || '';
      }

      const author = authorEl?.innerText?.trim() || '';

      if (title && link && image && author) {
        data.push({ title, link, image, author });
      }
    });

    return data;
  });

  if (stories.length === 0) {
    const html = await page.content();
    fs.writeFileSync('page.html', html);
    console.log('⚠️ No stories found. Dumped page.html for inspection.');
  }

  await browser.close();
  return stories;
}

module.exports = fetchWebStories;
