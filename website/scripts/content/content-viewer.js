function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderInlineMarkdown(value) {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}

function renderParagraph(lines) {
  return `<p>${renderInlineMarkdown(lines.join(" "))}</p>`;
}

export function renderMarkdown(markdown) {
  const lines = String(markdown || "").split(/\r?\n/);
  const html = [];
  let paragraph = [];
  let listItems = [];
  let codeBlock = [];
  let inCodeBlock = false;

  function flushParagraph() {
    if (paragraph.length) {
      html.push(renderParagraph(paragraph));
      paragraph = [];
    }
  }

  function flushList() {
    if (listItems.length) {
      html.push(`<ul>${listItems.join("")}</ul>`);
      listItems = [];
    }
  }

  function flushCodeBlock() {
    if (codeBlock.length) {
      html.push(`<pre><code>${escapeHtml(codeBlock.join("\n"))}</code></pre>`);
      codeBlock = [];
    }
  }

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      if (inCodeBlock) {
        flushCodeBlock();
        inCodeBlock = false;
      } else {
        flushParagraph();
        flushList();
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeBlock.push(line);
      return;
    }

    if (!trimmed) {
      flushParagraph();
      flushList();
      return;
    }

    if (trimmed.startsWith("### ")) {
      flushParagraph();
      flushList();
      html.push(`<h3>${renderInlineMarkdown(trimmed.slice(4))}</h3>`);
      return;
    }

    if (trimmed.startsWith("## ")) {
      flushParagraph();
      flushList();
      html.push(`<h2>${renderInlineMarkdown(trimmed.slice(3))}</h2>`);
      return;
    }

    if (trimmed.startsWith("# ")) {
      flushParagraph();
      flushList();
      html.push(`<h1>${renderInlineMarkdown(trimmed.slice(2))}</h1>`);
      return;
    }

    if (trimmed.startsWith("- ")) {
      flushParagraph();
      listItems.push(`<li>${renderInlineMarkdown(trimmed.slice(2))}</li>`);
      return;
    }

    paragraph.push(trimmed);
  });

  flushParagraph();
  flushList();

  if (inCodeBlock) {
    flushCodeBlock();
  }

  return html.join("");
}

export function renderContentViewer(target, content) {
  if (!target) return;

  const { metadata, markdown } = content;

  target.innerHTML = `
    <article class="nv-content-viewer" aria-labelledby="content-viewer-title">
      <header class="nv-content-viewer__header">
        <p class="nv-content-viewer__back">
          <a href="#/content" aria-label="Return to Reference Library">Library</a>
        </p>
        <h2 id="content-viewer-title">${escapeHtml(metadata.title)}</h2>
        <dl class="nv-content-meta" aria-label="Content metadata">
          <div>
            <dt>Type</dt>
            <dd>${escapeHtml(metadata.type)}</dd>
          </div>
          <div>
            <dt>Reading time</dt>
            <dd>${escapeHtml(metadata.estimatedReadingTime)} min</dd>
          </div>
        </dl>
      </header>

      <div class="nv-markdown-content">
        ${renderMarkdown(markdown)}
      </div>

      <footer class="nv-content-viewer__footer">
        <a href="#/content" class="nv-button" data-variant="secondary">Back to Library</a>
      </footer>
    </article>
  `;
}

export function renderContentLibrary(target, items) {
  if (!target) return;

  if (!items || items.length === 0) {
    renderLibraryEmptyState(target);
    return;
  }

  const entries = items
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map(item => {
      const num = String(item.order || 1).padStart(2, '0');
      return `
        <a href="#/content/${escapeHtml(item.id)}" class="nv-editorial-entry" aria-label="Read ${escapeHtml(item.title)}">
          <span class="nv-editorial-entry__num" aria-hidden="true">${num}</span>
          <div class="nv-editorial-entry__content">
            <span class="nv-editorial-entry__meta">${escapeHtml(item.type)}<span class="nv-editorial-entry__sep" aria-hidden="true">&middot;</span>${escapeHtml(item.estimatedReadingTime)} min read</span>
            <h3 class="nv-editorial-entry__title">${escapeHtml(item.title)}</h3>
            <p class="nv-editorial-entry__desc">${escapeHtml(item.description || '')}</p>
          </div>
        </a>
      `;
    })
    .join('');

  target.innerHTML = `
    <section class="nv-editorial-library" aria-labelledby="content-library-title">
      <header class="nv-editorial-library__hero">
        <span class="nv-editorial-library__kicker">Reference Library</span>
        <h2 id="content-library-title" class="nv-editorial-library__title">Technical Reference & Guides</h2>
        <p class="nv-editorial-library__subtitle">
          Standalone reference material for AI engineering study.
          Curated guides covering foundations, classical ML, and deep learning fundamentals.
        </p>
      </header>
      <div class="nv-editorial-library__list" role="list">
        ${entries}
      </div>
    </section>
  `;
}

export function renderLibraryEmptyState(target) {
  if (!target) return;

  target.innerHTML = `
    <section class="nv-empty-state nv-content-empty" aria-live="polite">
      <div class="nv-empty-state__icon" aria-hidden="true">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
        </svg>
      </div>
      <h3 class="nv-empty-state__title">Reference Library</h3>
      <p class="nv-empty-state__description">No reference material is available yet.</p>
      <div class="nv-empty-state__actions">
        <a href="#/modules" class="nv-button" data-variant="primary">Browse Modules</a>
        <a href="#/learning" class="nv-button" data-variant="secondary">Open Learning</a>
      </div>
    </section>
  `;
}

export function renderReaderEmptyState(target) {
  if (!target) return;

  target.innerHTML = `
    <section class="nv-empty-state nv-content-empty" aria-live="polite">
      <div class="nv-empty-state__icon" aria-hidden="true">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      <h3 class="nv-empty-state__title">Content not found</h3>
      <p class="nv-empty-state__description">The requested reference could not be located.</p>
      <div class="nv-empty-state__actions">
        <a href="#/content" class="nv-button" data-variant="primary">Return to Library</a>
        <a href="#/modules" class="nv-button" data-variant="secondary">Browse Modules</a>
      </div>
    </section>
  `;
}

export function renderContentLoadingState(target) {
  if (!target) return;

  target.innerHTML = `
    <section class="nv-empty-state" aria-live="polite">
      <p>Loading content...</p>
    </section>
  `;
}
