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
  if (!target) {
    return;
  }

  const { metadata, markdown } = content;

  target.innerHTML = `
    <article class="nv-content-viewer" aria-labelledby="content-viewer-title">
      <header class="nv-content-viewer__header">
        <h1 id="content-viewer-title">${escapeHtml(metadata.title)}</h1>

        <dl class="nv-content-meta" aria-label="Content metadata">
          <div>
            <dt>Type</dt>
            <dd>${escapeHtml(metadata.type)}</dd>
          </div>
          <div>
            <dt>Estimated reading time</dt>
            <dd>${escapeHtml(metadata.estimatedReadingTime)} min</dd>
          </div>
          <div>
            <dt>Source</dt>
            <dd><code>${escapeHtml(metadata.source)}</code></dd>
          </div>
        </dl>
      </header>

      <div class="nv-markdown-content">
        ${renderMarkdown(markdown)}
      </div>
    </article>
  `;
}

export function renderContentEmptyState(target, message = "No content selected.") {
  if (!target) {
    return;
  }

  target.innerHTML = `
    <section class="nv-empty-state" aria-live="polite">
      <p>${escapeHtml(message)}</p>
    </section>
  `;
}

export function renderContentLoadingState(target) {
  if (!target) {
    return;
  }

  target.innerHTML = `
    <section class="nv-empty-state" aria-live="polite">
      <p>Loading content...</p>
    </section>
  `;
}
