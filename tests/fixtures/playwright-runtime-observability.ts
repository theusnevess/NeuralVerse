import { expect, test as base } from '@playwright/test';
import type { BrowserContext, ConsoleMessage, Page, Request, Response, TestInfo } from '@playwright/test';

export type RuntimeCategory = 'CONSOLE_ERROR' | 'CONSOLE_WARNING' | 'PAGE_ERROR' | 'UNHANDLED_REJECTION' | 'REQUEST_FAILED' | 'HTTP_CLIENT_ERROR' | 'HTTP_SERVER_ERROR';
export type RuntimeEvent = { category: RuntimeCategory; message: string; url: string; timestamp: number; method?: string; status?: number; resourceType?: string };
export type RuntimeEvents = { events: RuntimeEvent[]; pages: Set<string> };

function record(events: RuntimeEvents, event: RuntimeEvent) {
  if (!events.events.some(item => item.category === event.category && item.message === event.message && item.url === event.url && Math.abs(item.timestamp - event.timestamp) < 25)) events.events.push(event);
}

function observePage(page: Page, events: RuntimeEvents) {
  events.pages.add(page.url());
  page.on('console', (message: ConsoleMessage) => {
    if (message.type() === 'error' || message.type() === 'assert') record(events, { category: 'CONSOLE_ERROR', message: message.text().slice(0, 1000), url: page.url(), timestamp: Date.now() });
    if (message.type() === 'warning') record(events, { category: 'CONSOLE_WARNING', message: message.text().slice(0, 1000), url: page.url(), timestamp: Date.now() });
  });
  page.on('pageerror', error => record(events, { category: 'PAGE_ERROR', message: `${error.name}: ${error.message}`.slice(0, 1000), url: page.url(), timestamp: Date.now() }));
  page.on('requestfailed', (request: Request) => {
    const message = request.failure()?.errorText || 'request failed';
    // Navigation replaces in-flight local fetches; Chromium reports those as
    // ERR_ABORTED even though no application request failed.
    if (message === 'net::ERR_ABORTED') return;
    record(events, { category: 'REQUEST_FAILED', message, url: request.url(), method: request.method(), resourceType: request.resourceType(), timestamp: Date.now() });
  });
  page.on('response', (response: Response) => {
    const status = response.status();
    if (status >= 400 && status < 500) record(events, { category: 'HTTP_CLIENT_ERROR', message: response.statusText(), url: response.url(), method: response.request().method(), resourceType: response.request().resourceType(), status, timestamp: Date.now() });
    if (status >= 500) record(events, { category: 'HTTP_SERVER_ERROR', message: response.statusText(), url: response.url(), method: response.request().method(), resourceType: response.request().resourceType(), status, timestamp: Date.now() });
  });
}

async function observeContext(context: BrowserContext, events: RuntimeEvents) {
  await context.addInitScript(() => {
    const sink = (window as any).__nvRuntimeEarlyEvents = (window as any).__nvRuntimeEarlyEvents || [];
    window.addEventListener('error', event => sink.push({ category: 'PAGE_ERROR', message: String(event.message || 'window error'), timestamp: Date.now() }));
    window.addEventListener('unhandledrejection', event => sink.push({ category: 'UNHANDLED_REJECTION', message: String(event.reason?.message || event.reason || 'unhandled rejection'), timestamp: Date.now() }));
  });
  const observe = (page: Page) => observePage(page, events);
  context.pages().forEach(observe);
  context.on('page', observe);
}

function summarize(events: RuntimeEvents) {
  return Object.fromEntries(['CONSOLE_ERROR', 'PAGE_ERROR', 'UNHANDLED_REJECTION', 'CONSOLE_WARNING', 'REQUEST_FAILED', 'HTTP_CLIENT_ERROR', 'HTTP_SERVER_ERROR'].map(category => [category, events.events.filter(event => event.category === category).length]));
}

export const test = base.extend<{ runtimeEvents: RuntimeEvents }>({
  runtimeEvents: [async ({ context }, use, testInfo: TestInfo) => {
    const events: RuntimeEvents = { events: [], pages: new Set() };
    await observeContext(context, events);
    await use(events);
    for (const page of context.pages()) {
      try {
        const early = await page.evaluate(() => (window as any).__nvRuntimeEarlyEvents || []);
        early.forEach((event: any) => record(events, { ...event, url: page.url() }));
      } catch { /* Closed pages cannot contribute post-teardown events. */ }
    }
    const blocking = events.events.filter(event => event.category !== 'CONSOLE_WARNING');
    await testInfo.attach('runtime-events.json', { body: Buffer.from(JSON.stringify({ test: testInfo.title, observedPages: [...events.pages], events: events.events, summary: summarize(events), status: blocking.length ? 'FAIL' : 'PASS' }, null, 2)), contentType: 'application/json' });
    if (blocking.length) throw new Error(`Unexpected runtime events: ${blocking.map(event => `${event.category} ${event.message} ${event.url}`).join(' | ')}`);
  }, { auto: true }]
});

export { expect };
export type { Page, ConsoleMessage };
