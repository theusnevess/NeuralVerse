const { chromium } = require('/home/matheusneves/.cache/ms-playwright-go/1.57.0/package/index.js');
const http = require('http');
const fs = require('fs');
const path = require('path');

const WEBSITE_DIR = path.resolve(__dirname, '../website');
const PORT = 9507;
const BASE_URL = `http://127.0.0.1:${PORT}/`;
const LOCAL_SCREENSHOTS_DIR = path.join(WEBSITE_DIR, 'screenshots');

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.md': 'text/markdown',
  '.txt': 'text/plain', '.woff': 'font/woff', '.woff2': 'font/woff2',
};

function serveFile(req, res) {
  let urlPath = req.url.split('?')[0];
  if (urlPath === '/' || urlPath === '') urlPath = '/index.html';
  const filePath = path.join(WEBSITE_DIR, urlPath);
  const ext = path.extname(filePath).toLowerCase();
  try {
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      const idx = path.join(WEBSITE_DIR, 'index.html');
      res.writeHead(200, { 'Content-Type': 'text/html', 'Cache-Control': 'no-cache' });
      res.end(fs.readFileSync(idx));
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(fs.readFileSync(filePath));
  } catch (e) {
    res.writeHead(500); res.end(`Error: ${e.message}`);
  }
}

const AGENTS = [
  { id: 'curriculum-dependency', name: 'Curriculum & Dependency Agent' },
  { id: 'didactic-architecture', name: 'Didactic Architecture Agent' },
  { id: 'visual-interactive-media', name: 'Visual & Interactive Media Agent' },
  { id: 'code-simulation-lab', name: 'Code, Simulation & Laboratory Agent' },
  { id: 'assessment-reinforcement', name: 'Assessment & Reinforcement Agent' },
  { id: 'research-state-of-art', name: 'Research & State-of-the-Art Agent' },
  { id: 'application-professional-transfer', name: 'Application & Professional Transfer Agent' },
  { id: 'storytelling-learning-journey', name: 'Storytelling & Learning Journey Agent' },
  { id: 'obsidian-knowledge-governance', name: 'Obsidian & Knowledge Governance Agent' },
  { id: 'curiosity-engagement', name: 'Curiosity & Engagement Agent' }
];

(async () => {
  // Ensure local screenshots directory exists
  if (!fs.existsSync(LOCAL_SCREENSHOTS_DIR)) {
    fs.mkdirSync(LOCAL_SCREENSHOTS_DIR, { recursive: true });
  }

  // Start server
  const server = http.createServer(serveFile);
  await new Promise(r => server.listen(PORT, '127.0.0.1', r));
  console.log(`Embedded server started at ${BASE_URL}`);

  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 1000 }
  });
  const page = await ctx.newPage();

  try {
    console.log('Navigating to NeuralVerse Home...');
    await page.goto(BASE_URL, { waitUntil: 'load' });
    await page.waitForTimeout(1000);

    // Open the agent panel
    const trigger = await page.$('#nv-agent-trigger');
    if (!trigger) {
      throw new Error('Trigger button #nv-agent-trigger not found.');
    }
    await trigger.click();
    await page.waitForTimeout(500);
    console.log('Agent panel opened.');

    // Loop through agents
    for (const agent of AGENTS) {
      console.log(`Processing Agent: ${agent.name} (${agent.id})...`);
      
      // Select agent
      await page.selectOption('#nv-agent-select', agent.id);
      await page.waitForTimeout(500);

      // Enter query
      await page.fill('#nv-agent-input', `Hello ${agent.name}, please demonstrate your capability.`);
      await page.waitForTimeout(300);

      // Submit
      const submitBtn = await page.$('.nv-agent-submit');
      await submitBtn.click();
      await page.waitForTimeout(1500);

      // Take screenshot of panel
      const panel = await page.$('#nv-agent-panel');
      const screenshotPath = path.join(LOCAL_SCREENSHOTS_DIR, `agent_${agent.id}.png`);
      await panel.screenshot({ path: screenshotPath });
      console.log(`Saved screenshot for ${agent.name} to ${screenshotPath}`);
    }
  } catch (err) {
    console.error('Execution error:', err);
  } finally {
    await browser.close();
    server.close();
    console.log('Server stopped and browser closed.');
  }
  process.exit(0);
})();
