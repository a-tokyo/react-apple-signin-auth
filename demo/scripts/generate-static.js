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

  // Configure Puppeteer for CI environments
  const isCI =
    process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
  const launchOptions = {
    headless: true,
    ...(isCI && {
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu',
      ],
    }),
  };

  console.log(
    `🔧 Launching browser with options:`,
    JSON.stringify(launchOptions, null, 2),
  );

  const browser = await puppeteer.launch(launchOptions);
  const page = await browser.newPage();

  try {
    // Load the built SPA from local server
    await page.goto(`http://localhost:${port}`, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    console.log('📄 Page loaded, waiting for React to render...');

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
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    await browser.close();
    server.close();
  }
}

generateStaticSite();
