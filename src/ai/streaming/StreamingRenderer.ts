/**
 * StreamingRenderer — Progressive markdown rendering
 *
 * Handles incremental rendering of streaming content into HTML.
 * Supports partial markdown, code blocks, and section detection.
 */

export interface RenderedSection {
  id: string;
  type: 'text' | 'heading' | 'code' | 'list' | 'tool-status' | 'plan-status';
  html: string;
  plainText: string;
  timestamp: number;
}

export function renderPartialMarkdown(content: string): string {
  if (!content) return '';

  let html = escapeHtml(content);

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Line breaks
  html = html.replace(/\n/g, '<br>');

  return html;
}

export function extractSections(content: string): RenderedSection[] {
  const sections: RenderedSection[] = [];
  const lines = content.split('\n');
  let currentSection = '';
  let sectionIndex = 0;

  for (const line of lines) {
    if (line.startsWith('#')) {
      if (currentSection.trim()) {
        sections.push({
          id: `section_${sectionIndex}`,
          type: 'text',
          html: renderPartialMarkdown(currentSection),
          plainText: currentSection.trim(),
          timestamp: Date.now()
        });
        sectionIndex++;
      }
      currentSection = line + '\n';
      const type = line.startsWith('##') ? 'heading' : 'heading';
      sections.push({
        id: `section_${sectionIndex}`,
        type,
        html: renderPartialMarkdown(line),
        plainText: line.replace(/^#+\s*/, ''),
        timestamp: Date.now()
      });
      sectionIndex++;
      currentSection = '';
    } else {
      currentSection += line + '\n';
    }
  }

  if (currentSection.trim()) {
    sections.push({
      id: `section_${sectionIndex}`,
      type: 'text',
      html: renderPartialMarkdown(currentSection),
      plainText: currentSection.trim(),
      timestamp: Date.now()
    });
  }

  return sections;
}

export function createToolStatusHtml(toolName: string, status: 'running' | 'completed' | 'error', durationMs?: number): string {
  const icon = status === 'running' ? '⏳' : status === 'completed' ? '✓' : '✗';
  const duration = durationMs != null ? ` (${durationMs}ms)` : '';
  const statusClass = status === 'running' ? 'nv-streaming--running' : status === 'completed' ? 'nv-streaming--complete' : 'nv-streaming--error';
  return `<span class="${statusClass}">${icon} ${escapeHtml(toolName)}${duration}</span>`;
}

export function createPlanStatusHtml(plan: { iteration: number; confidence: number; completedEvidence: unknown[] }): string {
  return `<div class="nv-plan-status">Iteration ${plan.iteration} | Confidence ${Math.round(plan.confidence * 100)}% | ${plan.completedEvidence.length} evidence items</div>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
