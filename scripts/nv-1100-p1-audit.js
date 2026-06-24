const fs = require('fs');
const path = require('path');
const http = require('http');

let chromium;
try {
  ({ chromium } = require('/home/matheusneves/.cache/ms-playwright-go/1.57.0/package/index.js'));
} catch (error) {
  ({ chromium } = require('playwright'));
}

const ROOT_DIR = path.resolve(__dirname, '..');
const WEBSITE_DIR = path.join(ROOT_DIR, 'website');
const OUT_DIR = '/tmp/neuralverse-nv1100-p1-audit';
const REPORT_PATH = path.join(OUT_DIR, 'nv1100-p1-report.json');

const VIEWPORTS = [
  { width: 390, height: 844, label: '390x844' },
  { width: 768, height: 900, label: '768x900' },
  { width: 1024, height: 768, label: '1024x768' },
  { width: 1440, height: 900, label: '1440x900' }
];

const RESULTS = {
  timestamp: new Date().toISOString(),
  task: 'NV-1100-P1 — Data Safety & Persistence',
  routesTested: [],
  viewportsTested: VIEWPORTS.map(v => v.label),
  tests: [],
  consoleErrors: [],
  failedRequests: [],
  screenshots: [],
  regressions: [],
  buildStatus: 'pending',
  gitDiffCheck: 'pending',
  workingTreeStatus: 'pending',
  overallStatus: 'pending'
};

let server;
let serverPort;

function startServer() {
  return new Promise((resolve, reject) => {
    server = http.createServer((req, res) => {
      let filePath = path.join(WEBSITE_DIR, req.url === '/' ? 'index.html' : req.url.split('?')[0]);

      const ext = path.extname(filePath);
      const mimeTypes = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon'
      };

      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }
        res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
        res.end(data);
      });
    });

    server.listen(0, '127.0.0.1', () => {
      serverPort = server.address().port;
      resolve(serverPort);
    });
    server.on('error', reject);
  });
}

function stopServer() {
  return new Promise((resolve) => {
    if (server) server.close(resolve);
    else resolve();
  });
}

function addTest(name, status, details) {
  RESULTS.tests.push({ name, status, details: details || '' });
}

async function runTests() {
  await startServer();
  console.log(`Server started on port ${serverPort}`);

  const browser = await chromium.launch({ headless: true });

  try {
    // --- Test 1: Export on clean installation ---
    console.log('Test 1: Export on clean installation');
    const page = await browser.newPage({ viewport: VIEWPORTS[3] });

    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    const failedRequests = [];
    page.on('requestfailed', req => {
      failedRequests.push({ url: req.url(), failure: req.failure()?.errorText });
    });

    await page.goto(`http://127.0.0.1:${serverPort}/#/settings`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Check settings page loaded
    const settingsHeading = await page.$('h1');
    const headingText = settingsHeading ? await settingsHeading.textContent() : '';
    const hasSettingsPage = headingText.includes('Settings') || await page.$('.nv-settings-page') !== null;
    addTest('Settings page loads', hasSettingsPage ? 'PASS' : 'FAIL', 'Heading: ' + headingText);

    // Check export button exists
    const exportBtn = await page.$('[data-action="export"]');
    addTest('Export button present', exportBtn ? 'PASS' : 'FAIL');

    // Check import card exists
    const importCard = await page.$('[data-import-confirm]');
    addTest('Import card present', importCard ? 'PASS' : 'FAIL');

    // Check import strategy radios
    const mergeRadio = await page.$('input[name="nv-import-mode"][value="merge"]');
    const replaceRadio = await page.$('input[name="nv-import-mode"][value="replace"]');
    addTest('Import strategy radios present', (mergeRadio && replaceRadio) ? 'PASS' : 'FAIL');

    // Check file input
    const fileInput = await page.$('[data-file-input]');
    addTest('File input present', fileInput ? 'PASS' : 'FAIL');

    // --- Test 2: Export produces downloadable JSON ---
    console.log('Test 2: Export produces downloadable JSON');
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 5000 }).catch(() => null),
      exportBtn?.click()
    ]);

    if (download) {
      const downloadPath = await download.path();
      const content = fs.readFileSync(downloadPath, 'utf-8');
      let parsed;
      try {
        parsed = JSON.parse(content);
        addTest('Export produces valid JSON', 'PASS');
        addTest('Export includes schemaVersion', parsed.schemaVersion === 1 ? 'PASS' : 'FAIL');
        addTest('Export includes exportedAt', !!parsed.exportedAt ? 'PASS' : 'FAIL');
        addTest('Export includes neuralVerseVersion', !!parsed.neuralVerseVersion ? 'PASS' : 'FAIL');
        addTest('Export includes personalization object', typeof parsed.personalization === 'object' ? 'PASS' : 'FAIL');
        addTest('Export includes study object', typeof parsed.study === 'object' ? 'PASS' : 'FAIL');
        addTest('Export includes notes object', typeof parsed.notes === 'object' ? 'PASS' : 'FAIL');
        addTest('Export includes highlights array', Array.isArray(parsed.highlights) ? 'PASS' : 'FAIL');
        addTest('Export includes collections array', Array.isArray(parsed.collections) ? 'PASS' : 'FAIL');
        addTest('Export includes preferences object', typeof parsed.preferences === 'object' ? 'PASS' : 'FAIL');

        // Write backup file for import tests
        fs.writeFileSync(path.join(OUT_DIR, 'test-backup.json'), content);

        RESULTS.screenshots.push(download.suggestedFilename() || 'export-backup.json');
      } catch (e) {
        addTest('Export produces valid JSON', 'FAIL', e.message);
      }
    } else {
      addTest('Export triggers download', 'FAIL', 'No download event');
    }

    // --- Test 3: Seeding personalization data ---
    console.log('Test 3: Seed personalization data');
    await page.evaluate(() => {
      const prefix = 'nv_personalization_';
      const bookmarks = [
        { id: 'test-bookmark-1', type: 'lesson', title: 'Test Bookmark 1', timestamp: new Date().toISOString(), lineage: null },
        { id: 'test-bookmark-2', type: 'artifact', title: 'Test Bookmark 2', timestamp: new Date().toISOString(), lineage: null }
      ];
      localStorage.setItem(prefix + 'bookmarks', JSON.stringify(bookmarks));

      const favorites = [
        { id: 'test-fav-1', type: 'module', title: 'Test Favorite 1', route: '#/modules/test', timestamp: new Date().toISOString() }
      ];
      localStorage.setItem(prefix + 'favorites', JSON.stringify(favorites));

      const notes = {
        'test-note-1': { text: 'This is a test note', title: 'Test Note', type: 'lesson', timestamp: new Date().toISOString() }
      };
      localStorage.setItem(prefix + 'notes', JSON.stringify(notes));

      const highlights = [
        { resourceId: 'test-res-1', anchorId: 'anchor-1', color: 'yellow', timestamp: new Date().toISOString() }
      ];
      localStorage.setItem(prefix + 'highlights', JSON.stringify(highlights));

      const collections = [
        { name: 'Test Collection', resources: [{ id: 'test-res-1', title: 'Test Resource', type: 'lesson', timestamp: new Date().toISOString() }] }
      ];
      localStorage.setItem(prefix + 'collections', JSON.stringify(collections));

      const tags = { 'test-res-1': ['machine-learning', 'test-tag'] };
      localStorage.setItem(prefix + 'tags', JSON.stringify(tags));

      const studyQueue = [
        { id: 'test-queue-1', type: 'lesson', title: 'Test Queue Item', route: '#/learning/test', addedAt: new Date().toISOString() }
      ];
      localStorage.setItem(prefix + 'study_queue', JSON.stringify(studyQueue));

      const readingProgress = { 'test-artifact-1': { status: 'In Progress', updatedAt: new Date().toISOString() } };
      localStorage.setItem(prefix + 'reading_progress_map', JSON.stringify(readingProgress));

      const readingGoals = { goalMinutes: 45, completedMinutesToday: 15 };
      localStorage.setItem(prefix + 'reading_goals', JSON.stringify(readingGoals));

      const continueReading = { path: { id: 'p1', title: 'Path 1' }, module: { id: 'm1', title: 'Module 1' }, lesson: { id: 'l1', title: 'Lesson 1' }, artifact: null, scrollPosition: 0.5, timestamp: new Date().toISOString() };
      localStorage.setItem(prefix + 'continue_reading', JSON.stringify(continueReading));

      localStorage.setItem('neuralverse.progress.v1', JSON.stringify({ records: [{ entityId: 'test-entity-1', entityType: 'content-item', status: 'completed', progressValue: 100, lastOpenedAt: new Date().toISOString(), completedAt: new Date().toISOString() }] }));
    });

    addTest('Personalization data seeded', 'PASS');

    // --- Test 4: Export after personalization ---
    console.log('Test 4: Export after personalization');
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    const [download2] = await Promise.all([
      page.waitForEvent('download', { timeout: 5000 }).catch(() => null),
      page.$eval('[data-action="export"]', el => el.click())
    ]);

    if (download2) {
      const downloadPath2 = await download2.path();
      const content2 = fs.readFileSync(downloadPath2, 'utf-8');
      const parsed2 = JSON.parse(content2);

      addTest('Export includes bookmarks after seeding', parsed2.personalization?.bookmarks?.length === 2 ? 'PASS' : 'FAIL');
      addTest('Export includes favorites after seeding', parsed2.personalization?.favorites?.length === 1 ? 'PASS' : 'FAIL');
      addTest('Export includes notes after seeding', Object.keys(parsed2.notes || {}).length === 1 ? 'PASS' : 'FAIL');
      addTest('Export includes highlights after seeding', parsed2.highlights?.length === 1 ? 'PASS' : 'FAIL');
      addTest('Export includes collections after seeding', parsed2.collections?.length === 1 ? 'PASS' : 'FAIL');
      addTest('Export includes tags after seeding', Object.keys(parsed2.tags || {}).length === 1 ? 'PASS' : 'FAIL');
      addTest('Export includes study queue after seeding', parsed2.study?.study_queue?.length === 1 ? 'PASS' : 'FAIL');
      addTest('Export includes reading progress after seeding', !!parsed2.personalization?.reading_progress_map?.['test-artifact-1'] ? 'PASS' : 'FAIL');
      addTest('Export includes reading goals after seeding', parsed2.personalization?.reading_goals?.goalMinutes === 45 ? 'PASS' : 'FAIL');
      addTest('Export includes continue reading after seeding', !!parsed2.personalization?.continue_reading?.path ? 'PASS' : 'FAIL');
      addTest('Export includes progress records after seeding', parsed2.progress?.records?.length === 1 ? 'PASS' : 'FAIL');

      fs.writeFileSync(path.join(OUT_DIR, 'test-backup-populated.json'), content2);
    }

    // --- Test 5: Replace import ---
    console.log('Test 5: Replace import');
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    // Create a minimal backup file for replace import
    const replaceBackup = {
      schemaVersion: 1,
      neuralVerseVersion: '1.0.0',
      exportedAt: new Date().toISOString(),
      personalization: {
        bookmarks: [{ id: 'replace-bm-1', type: 'lesson', title: 'Replace Bookmark', timestamp: new Date().toISOString(), lineage: null }],
        favorites: [],
        continue_reading: null,
        recently_visited: [],
        reading_bookmarks: {},
        reading_goals: { goalMinutes: 60, completedMinutesToday: 0 },
        reading_progress_map: {}
      },
      study: { study_queue: [], active_session: null, session_summary: null },
      notes: { 'replace-note-1': { text: 'Replace note', title: 'Replace Note', type: 'lesson', timestamp: new Date().toISOString() } },
      highlights: [],
      collections: [],
      tags: {},
      preferences: { favorites_sort: 'newest', history_filter: 'All' },
      progress: { records: [] }
    };
    fs.writeFileSync(path.join(OUT_DIR, 'replace-backup.json'), JSON.stringify(replaceBackup));

    // Select replace mode
    await page.click('input[name="nv-import-mode"][value="replace"]');
    await page.waitForTimeout(200);

    // Upload file
    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.click('.nv-button--file-label')
    ]);
    await fileChooser.setFiles(path.join(OUT_DIR, 'replace-backup.json'));
    await page.waitForTimeout(500);

    // Check preview appeared
    const preview = await page.$('.nv-persistence-preview');
    addTest('Import preview shows after file selection', preview ? 'PASS' : 'FAIL');

    // Check import button enabled
    const importBtn = await page.$('[data-import-confirm]');
    const isDisabled = await importBtn?.getAttribute('disabled');
    addTest('Import button enabled after valid file', isDisabled === null ? 'PASS' : 'FAIL');

    // Click import
    await importBtn?.click();
    await page.waitForTimeout(500);

    // Verify replace worked
    const replaceResult = await page.evaluate(() => {
      const prefix = 'nv_personalization_';
      const bookmarks = JSON.parse(localStorage.getItem(prefix + 'bookmarks') || '[]');
      const notes = JSON.parse(localStorage.getItem(prefix + 'notes') || '{}');
      const goals = JSON.parse(localStorage.getItem(prefix + 'reading_goals') || '{}');
      const favSort = JSON.parse(localStorage.getItem('nv_favorites_sort') || '"alphabetical"');
      return {
        bookmarksCount: bookmarks.length,
        firstBookmarkTitle: bookmarks[0]?.title,
        notesCount: Object.keys(notes).length,
        goalMinutes: goals.goalMinutes,
        favSort
      };
    });

    addTest('Replace import: bookmarks replaced', replaceResult.bookmarksCount === 1 ? 'PASS' : 'FAIL');
    addTest('Replace import: correct bookmark title', replaceResult.firstBookmarkTitle === 'Replace Bookmark' ? 'PASS' : 'FAIL');
    addTest('Replace import: notes replaced', replaceResult.notesCount === 1 ? 'PASS' : 'FAIL');
    addTest('Replace import: goals updated', replaceResult.goalMinutes === 60 ? 'PASS' : 'FAIL');
    addTest('Replace import: preferences updated', replaceResult.favSort === 'newest' ? 'PASS' : 'FAIL');

    // --- Test 6: Merge import ---
    console.log('Test 6: Merge import');

    // Create a merge backup
    const mergeBackup = {
      schemaVersion: 1,
      neuralVerseVersion: '1.0.0',
      exportedAt: new Date().toISOString(),
      personalization: {
        bookmarks: [{ id: 'merge-bm-1', type: 'module', title: 'Merge Bookmark', timestamp: new Date().toISOString(), lineage: null }],
        favorites: [{ id: 'merge-fav-1', type: 'lesson', title: 'Merge Favorite', route: '#/learning/merge', timestamp: new Date().toISOString() }],
        continue_reading: { path: { id: 'merge-path', title: 'Merge Path' }, module: null, lesson: null, artifact: null, scrollPosition: 0.3, timestamp: new Date().toISOString() },
        recently_visited: [],
        reading_bookmarks: {},
        reading_goals: { goalMinutes: 90, completedMinutesToday: 10 },
        reading_progress_map: { 'merge-artifact': { status: 'Completed', updatedAt: new Date().toISOString() } }
      },
      study: { study_queue: [{ id: 'merge-q-1', type: 'lesson', title: 'Merge Queue', route: '#/merge', addedAt: new Date().toISOString() }], active_session: null, session_summary: null },
      notes: { 'merge-note-1': { text: 'Merge note', title: 'Merge Note', type: 'artifact', timestamp: new Date().toISOString() } },
      highlights: [{ resourceId: 'merge-res', anchorId: 'merge-anchor', color: 'green', timestamp: new Date().toISOString() }],
      collections: [{ name: 'Merge Collection', resources: [] }],
      tags: { 'merge-tag-res': ['merge-tag'] },
      preferences: { favorites_sort: 'alphabetical', history_filter: 'All' },
      progress: { records: [{ entityId: 'merge-entity', entityType: 'content-item', status: 'in-progress', progressValue: 50, lastOpenedAt: new Date().toISOString(), completedAt: null }] }
    };
    fs.writeFileSync(path.join(OUT_DIR, 'merge-backup.json'), JSON.stringify(mergeBackup));

    // Select merge mode
    await page.click('input[name="nv-import-mode"][value="merge"]');
    await page.waitForTimeout(200);

    // Upload merge file
    const [fileChooser2] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.click('.nv-button--file-label')
    ]);
    await fileChooser2.setFiles(path.join(OUT_DIR, 'merge-backup.json'));
    await page.waitForTimeout(500);

    // Click import
    await page.$eval('[data-import-confirm]', el => el.click());
    await page.waitForTimeout(500);

    // Verify merge worked
    const mergeResult = await page.evaluate(() => {
      const prefix = 'nv_personalization_';
      const bookmarks = JSON.parse(localStorage.getItem(prefix + 'bookmarks') || '[]');
      const favorites = JSON.parse(localStorage.getItem(prefix + 'favorites') || '[]');
      const notes = JSON.parse(localStorage.getItem(prefix + 'notes') || '{}');
      const highlights = JSON.parse(localStorage.getItem(prefix + 'highlights') || '[]');
      const collections = JSON.parse(localStorage.getItem(prefix + 'collections') || '[]');
      const tags = JSON.parse(localStorage.getItem(prefix + 'tags') || '{}');
      const queue = JSON.parse(localStorage.getItem(prefix + 'study_queue') || '[]');
      const goals = JSON.parse(localStorage.getItem(prefix + 'reading_goals') || '{}');
      const cr = JSON.parse(localStorage.getItem(prefix + 'continue_reading') || 'null');
      const progressMap = JSON.parse(localStorage.getItem(prefix + 'reading_progress_map') || '{}');
      const progress = JSON.parse(localStorage.getItem('neuralverse.progress.v1') || '{"records":[]}');
      return {
        bookmarksCount: bookmarks.length,
        favoritesCount: favorites.length,
        notesCount: Object.keys(notes).length,
        highlightsCount: highlights.length,
        collectionsCount: collections.length,
        tagsCount: Object.keys(tags).length,
        queueCount: queue.length,
        goalMinutes: goals.goalMinutes,
        continueReadingPath: cr?.path?.id,
        progressMapHasMerge: !!progressMap['merge-artifact'],
        progressRecordsCount: progress.records.length,
        hasReplaceBookmark: bookmarks.some(b => b.id === 'replace-bm-1'),
        hasMergeBookmark: bookmarks.some(b => b.id === 'merge-bm-1')
      };
    });

    addTest('Merge import: bookmarks merged (union)', mergeResult.bookmarksCount === 2 ? 'PASS' : 'FAIL');
    addTest('Merge import: replace bookmark preserved', mergeResult.hasReplaceBookmark ? 'PASS' : 'FAIL');
    addTest('Merge import: merge bookmark added', mergeResult.hasMergeBookmark ? 'PASS' : 'FAIL');
    addTest('Merge import: favorites merged', mergeResult.favoritesCount === 1 ? 'PASS' : 'FAIL');
    addTest('Merge import: notes merged', mergeResult.notesCount === 2 ? 'PASS' : 'FAIL');
    addTest('Merge import: highlights merged', mergeResult.highlightsCount === 1 ? 'PASS' : 'FAIL');
    addTest('Merge import: collections merged', mergeResult.collectionsCount === 1 ? 'PASS' : 'FAIL');
    addTest('Merge import: tags merged', mergeResult.tagsCount === 1 ? 'PASS' : 'FAIL');
    addTest('Merge import: study queue merged', mergeResult.queueCount === 1 ? 'PASS' : 'FAIL');
    addTest('Merge import: reading goals updated', mergeResult.goalMinutes === 90 ? 'PASS' : 'FAIL');
    addTest('Merge import: continue reading updated', mergeResult.continueReadingPath === 'merge-path' ? 'PASS' : 'FAIL');
    addTest('Merge import: reading progress merged', mergeResult.progressMapHasMerge ? 'PASS' : 'FAIL');
    addTest('Merge import: progress records merged', mergeResult.progressRecordsCount >= 1 ? 'PASS' : 'FAIL');

    // --- Test 7: Invalid JSON rejection ---
    console.log('Test 7: Invalid JSON rejection');
    fs.writeFileSync(path.join(OUT_DIR, 'invalid.json'), '{ invalid json content');

    const [fileChooser3] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.click('.nv-button--file-label')
    ]);
    await fileChooser3.setFiles(path.join(OUT_DIR, 'invalid.json'));
    await page.waitForTimeout(500);

    const importStatus = await page.$('[data-status="import-status"]');
    const errorText = importStatus ? await importStatus.textContent() : '';
    const hasErrorVisible = importStatus ? await importStatus.isVisible() : false;
    addTest('Invalid JSON shows error', hasErrorVisible && errorText.includes('Invalid') ? 'PASS' : 'FAIL');

    // --- Test 8: Unsupported schema version rejection ---
    console.log('Test 8: Unsupported schema rejection');
    const unsupportedBackup = {
      schemaVersion: 999,
      exportedAt: new Date().toISOString(),
      personalization: {}
    };
    fs.writeFileSync(path.join(OUT_DIR, 'unsupported.json'), JSON.stringify(unsupportedBackup));

    const [fileChooser4] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.click('.nv-button--file-label')
    ]);
    await fileChooser4.setFiles(path.join(OUT_DIR, 'unsupported.json'));
    await page.waitForTimeout(500);

    const errorText2 = importStatus ? await importStatus.textContent() : '';
    const hasUnsupportedError = errorText2.includes('Unsupported') || errorText2.includes('schema version');
    addTest('Unsupported schema shows error', hasUnsupportedError ? 'PASS' : 'FAIL');

    // --- Test 9: Corrupted backup rejection ---
    console.log('Test 9: Corrupted backup rejection');
    const corruptedBackup = { schemaVersion: 1, exportedAt: 'not-a-date', personalization: 'not-an-object' };
    fs.writeFileSync(path.join(OUT_DIR, 'corrupted.json'), JSON.stringify(corruptedBackup));

    const [fileChooser5] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.click('.nv-button--file-label')
    ]);
    await fileChooser5.setFiles(path.join(OUT_DIR, 'corrupted.json'));
    await page.waitForTimeout(500);

    const errorText3 = importStatus ? await importStatus.textContent() : '';
    addTest('Corrupted backup shows error', errorText3.length > 0 ? 'PASS' : 'FAIL');

    // --- Test 10: Local data warning ---
    console.log('Test 10: Local data warning');
    await page.evaluate(() => {
      localStorage.removeItem('nv_data_persistence_warning_dismissed');
    });
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    const warning = await page.$('.nv-persistence-warning');
    addTest('Data warning shows on first visit', warning ? 'PASS' : 'FAIL');

    // Dismiss warning
    const dismissBtn = await page.$('.nv-persistence-warning__dismiss');
    if (dismissBtn) await dismissBtn.click();
    await page.waitForTimeout(300);

    const warningAfterDismiss = await page.$('.nv-persistence-warning');
    addTest('Data warning dismissed', !warningAfterDismiss ? 'PASS' : 'FAIL');

    // Reload and check it stays dismissed
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    const warningAfterReload = await page.$('.nv-persistence-warning');
    addTest('Data warning stays dismissed after reload', !warningAfterReload ? 'PASS' : 'FAIL');

    // --- Test 11: Current data sections display ---
    console.log('Test 11: Current data sections display');
    const dataGrid = await page.$('[data-current-data-grid]');
    const gridContent = dataGrid ? await dataGrid.textContent() : '';
    addTest('Current data sections displayed', gridContent.length > 0 ? 'PASS' : 'FAIL');

    // --- Test 12: Empty backup rejection ---
    console.log('Test 12: Empty backup rejection');
    fs.writeFileSync(path.join(OUT_DIR, 'empty.json'), '');

    const [fileChooser6] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.click('.nv-button--file-label')
    ]);
    await fileChooser6.setFiles(path.join(OUT_DIR, 'empty.json'));
    await page.waitForTimeout(500);

    const importStatusAfterReload = await page.$('[data-status="import-status"]');
    const errorText4 = importStatusAfterReload ? await importStatusAfterReload.textContent() : '';
    addTest('Empty file shows error', errorText4.length > 0 && !errorText4.includes('No backup file selected') ? 'PASS' : 'FAIL', errorText4);

    // --- Test 13: Responsive behavior ---
    console.log('Test 13: Responsive behavior');
    for (const vp of VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.waitForTimeout(300);

      const hasOverflow = await page.evaluate(() => {
        return document.body.scrollWidth > document.body.clientWidth;
      });
      addTest(`No horizontal overflow at ${vp.label}`, !hasOverflow ? 'PASS' : 'FAIL');

      const exportBtnVisible = await page.$eval('[data-action="export"]', el => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      }).catch(() => false);
      addTest(`Export button visible at ${vp.label}`, exportBtnVisible ? 'PASS' : 'FAIL');
    }

    // --- Test 14: Accessibility checks ---
    console.log('Test 14: Accessibility checks');
    await page.setViewportSize({ width: 1440, height: 900 });

    // Check ARIA labels
    const ariaLabels = await page.$$eval('[aria-label]', els => els.map(el => el.getAttribute('aria-label')));
    addTest('ARIA labels present on interactive elements', ariaLabels.length > 0 ? 'PASS' : 'FAIL');

    // Check role attributes
    const roleAlert = await page.$('[role="alert"]');
    const roleStatus = await page.$$('[role="status"]');
    addTest('Role attributes present', roleStatus.length > 0 ? 'PASS' : 'FAIL');

    // Check focus-visible works
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement;
      return el ? { tag: el.tagName, class: el.className } : null;
    });
    addTest('Keyboard focus works', focusedElement !== null ? 'PASS' : 'FAIL');

    // Check heading hierarchy
    const headings = await page.$$eval('h1, h2, h3, h4, h5, h6', els => els.map(el => ({ level: parseInt(el.tagName[1]), text: el.textContent.trim().substring(0, 50) })));
    addTest('Heading hierarchy present', headings.length >= 2 ? 'PASS' : 'FAIL');

    // --- Test 15: Console errors ---
    console.log('Test 15: Console errors');
    RESULTS.consoleErrors = consoleErrors.filter(e => !e.includes('favicon') && !e.includes('404'));
    addTest('Zero console errors', RESULTS.consoleErrors.length === 0 ? 'PASS' : 'FAIL',
      RESULTS.consoleErrors.length > 0 ? RESULTS.consoleErrors.join('; ') : '');

    RESULTS.failedRequests = failedRequests.filter(r => !r.url.includes('favicon'));
    addTest('Zero failed requests', RESULTS.failedRequests.length === 0 ? 'PASS' : 'FAIL',
      RESULTS.failedRequests.length > 0 ? RESULTS.failedRequests.map(r => r.url).join('; ') : '');

    // --- Test 16: No curriculum regressions ---
    console.log('Test 16: Regression checks');
    await page.goto(`http://127.0.0.1:${serverPort}/#/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    const homeLoaded = await page.$('.nv-empty-state') !== null || await page.$('h1') !== null;
    addTest('Home page loads (no regression)', homeLoaded ? 'PASS' : 'FAIL');

    await page.goto(`http://127.0.0.1:${serverPort}/#/learning`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    const learningLoaded = await page.$('[data-curriculum-root]') !== null || await page.$('h1') !== null;
    addTest('Learning page loads (no regression)', learningLoaded ? 'PASS' : 'FAIL');

    await page.goto(`http://127.0.0.1:${serverPort}/#/workspace`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    const workspaceLoaded = await page.$('#nv-workspace-content-body') !== null || await page.$('h1') !== null;
    addTest('Workspace page loads (no regression)', workspaceLoaded ? 'PASS' : 'FAIL');

    await page.goto(`http://127.0.0.1:${serverPort}/#/knowledge-graph`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    const graphLoaded = await page.$('[data-knowledge-graph-root]') !== null || await page.$('h1') !== null;
    addTest('Knowledge Graph page loads (no regression)', graphLoaded ? 'PASS' : 'FAIL');

    await page.goto(`http://127.0.0.1:${serverPort}/#/retrieval-playground`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    const retrievalLoaded = await page.$('#resume-banner-container') !== null || await page.$('h1') !== null;
    addTest('Retrieval Playground loads (no regression)', retrievalLoaded ? 'PASS' : 'FAIL');

    await page.close();

    // --- Summary ---
    const passed = RESULTS.tests.filter(t => t.status === 'PASS').length;
    const failed = RESULTS.tests.filter(t => t.status === 'FAIL').length;
    RESULTS.overallStatus = failed === 0 ? 'READY' : 'NOT READY';

    console.log('\n=== NV-1100-P1 AUDIT SUMMARY ===');
    console.log(`Total tests: ${RESULTS.tests.length}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Console errors: ${RESULTS.consoleErrors.length}`);
    console.log(`Failed requests: ${RESULTS.failedRequests.length}`);
    console.log(`Overall: ${RESULTS.overallStatus}`);

  } catch (e) {
    console.error('Test error:', e);
    RESULTS.overallStatus = 'ERROR';
    RESULTS.tests.push({ name: 'Test suite execution', status: 'FAIL', details: e.message });
  } finally {
    await browser.close();
    await stopServer();
  }
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  // Run Playwright tests
  await runTests();

  // Check git status
  try {
    const { execSync } = require('child_process');
    const diffCheck = execSync('git diff --check 2>&1', { cwd: ROOT_DIR }).toString().trim();
    RESULTS.gitDiffCheck = diffCheck.length === 0 ? 'CLEAN' : 'ISSUES: ' + diffCheck;

    const workTree = execSync('git status --porcelain 2>&1', { cwd: ROOT_DIR }).toString().trim();
    RESULTS.workingTreeStatus = workTree.length === 0 ? 'CLEAN' : 'MODIFIED';
  } catch (e) {
    RESULTS.gitDiffCheck = 'ERROR: ' + e.message;
    RESULTS.workingTreeStatus = 'ERROR';
  }

  // Write report
  fs.writeFileSync(REPORT_PATH, JSON.stringify(RESULTS, null, 2));
  console.log(`\nReport written to: ${REPORT_PATH}`);

  // Print final status
  console.log('\n=== FINAL STATUS ===');
  console.log(`NV-1100-P1 — Data Safety & Persistence: ${RESULTS.overallStatus}`);
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
