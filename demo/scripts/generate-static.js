import puppeteer from 'puppeteer';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { readFile } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function startLocalServer(distPath) {
  return new Promise((resolve) => {
    const server = createServer(async (req, res) => {
      let filePath = join(distPath, req.url === '/' ? 'index.html' : req.url);

      try {
        if (req.url.endsWith('.js')) {
          res.setHeader('Content-Type', 'application/javascript');
        } else if (req.url.endsWith('.css')) {
          res.setHeader('Content-Type', 'text/css');
        } else if (req.url.endsWith('.html') || req.url === '/') {
          res.setHeader('Content-Type', 'text/html');
        }

        const content = await readFile(filePath);
        res.end(content);
      } catch (error) {
        res.statusCode = 404;
        res.end('Not found');
      }
    });

    server.listen(0, () => {
      const port = server.address().port;
      resolve({ server, port });
    });
  });
}

async function generateStaticSite() {
  const distPath = join(__dirname, '../dist');
  const indexPath = join(distPath, 'index.html');

  if (!existsSync(indexPath)) {
    console.error('Build files not found. Run "npm run build:spa" first.');
    process.exit(1);
  }

  console.log('🚀 Starting static site generation...');

  const { server, port } = await startLocalServer(distPath);
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Load the built SPA from local server
    await page.goto(`http://localhost:${port}`, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    // Wait for React to render and syntax highlighting to load
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Get the fully rendered HTML
    const html = await page.content();

    // Write the static HTML
    writeFileSync(indexPath, html);

    console.log('✅ Static site generated successfully!');
    console.log(`📁 Output: ${indexPath}`);
  } catch (error) {
    console.error('❌ Error generating static site:', error);
    process.exit(1);
  } finally {
    await browser.close();
    server.close();
  }
}

generateStaticSite();
