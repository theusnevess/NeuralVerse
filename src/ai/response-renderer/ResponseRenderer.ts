/**
 * Response Renderer — Formats LLM Responses for UI
 *
 * Transforms validated LLM responses into structured payloads
 * that the copilot UI can render.
 */

import type { LLMResponse } from '../llm-provider/LLMProvider.ts';
import type { ResponseValidationResult } from '../response-validator/ResponseValidator.ts';
import type { AIMode, ResponseStyle } from '../prompt-compiler/PromptCompiler.ts';

// ============================================================================
// RENDERER TYPES
// ============================================================================

export interface CopilotResponsePayload {
  readonly type: 'success' | 'error' | 'refusal' | 'partial';
  readonly content: string;
  readonly formattedContent: string;
  readonly metadata: CopilotResponseMetadata;
  readonly sections?: readonly ResponseSection[];
}

export interface CopilotResponseMetadata {
  readonly provider: string;
  readonly model: string;
  readonly mode: AIMode;
  readonly style: ResponseStyle;
  readonly contributingAgents: readonly string[];
  readonly promptSections: readonly string[];
  readonly validationStatus: string;
  readonly latencyMs: number;
  readonly tokenUsage: {
    readonly prompt: number;
    readonly completion: number;
    readonly total: number;
  };
}

export interface ResponseSection {
  title: string;
  content: string;
  type: 'text' | 'code' | 'list' | 'heading';
}

// ============================================================================
// RENDERER
// ============================================================================

export function renderCopilotResponse(
  llmResponse: LLMResponse,
  validation: ResponseValidationResult,
  metadata: {
    mode: AIMode;
    style: ResponseStyle;
    contributingAgents: readonly string[];
    promptSections: readonly string[];
  }
): CopilotResponsePayload {
  if (!validation.valid) {
    return {
      type: 'error',
      content: validation.message,
      formattedContent: `<div class="nv-copilot-error">${escapeHtml(validation.message)}</div>`,
      metadata: buildMetadata(llmResponse, metadata, validation)
    };
  }

  const content = validation.sanitizedContent || llmResponse.content;
  const sections = parseResponseSections(content);
  const formattedContent = formatContent(content, sections);

  return {
    type: 'success',
    content,
    formattedContent,
    metadata: buildMetadata(llmResponse, metadata, validation),
    sections
  };
}

// ============================================================================
// CONTENT PARSING
// ============================================================================

function parseResponseSections(content: string): readonly ResponseSection[] {
  const sections: ResponseSection[] = [];
  const lines = content.split('\n');

  let currentSection: ResponseSection | null = null;

  for (const line of lines) {
    // Check for headers
    const headerMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (headerMatch) {
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = {
        title: headerMatch[2],
        content: '',
        type: 'heading'
      };
      continue;
    }

    // Check for code blocks
    if (line.startsWith('```')) {
      if (currentSection && currentSection.type === 'code') {
        sections.push(currentSection);
        currentSection = null;
      } else {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = {
          title: 'Code',
          content: '',
          type: 'code'
        };
      }
      continue;
    }

    // Check for lists
    if (/^[-*]\s/.test(line) || /^\d+\.\s/.test(line)) {
      if (!currentSection || currentSection.type !== 'list') {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = {
          title: 'List',
          content: '',
          type: 'list'
        };
      }
      currentSection.content += line + '\n';
      continue;
    }

    // Regular text
    if (!currentSection || currentSection.type !== 'text') {
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = {
        title: 'Content',
        content: '',
        type: 'text'
      };
    }
    currentSection.content += line + '\n';
  }

  if (currentSection) {
    sections.push(currentSection);
  }

  return sections;
}

// ============================================================================
// FORMATTING
// ============================================================================

function formatContent(content: string, sections: readonly ResponseSection[]): string {
  let html = content;

  // Escape HTML
  html = escapeHtml(html);

  // Convert markdown to HTML
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/`(.*?)`/g, '<code>$1</code>');
  html = html.replace(/^### (.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^## (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^# (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
  html = html.replace(/\n\n/g, '</p><p>');
  html = html.replace(/\n/g, '<br>');
  html = '<p>' + html + '</p>';
  html = html.replace(/<p><\/p>/g, '');
  html = html.replace(/<p>(<h[234]>)/g, '$1');
  html = html.replace(/(<\/h[234]>)<\/p>/g, '$1');
  html = html.replace(/<p>(<ul>)/g, '$1');
  html = html.replace(/(<\/ul>)<\/p>/g, '$1');

  return html;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ============================================================================
// METADATA
// ============================================================================

function buildMetadata(
  llmResponse: LLMResponse,
  context: {
    mode: AIMode;
    style: ResponseStyle;
    contributingAgents: readonly string[];
    promptSections: readonly string[];
  },
  validation: ResponseValidationResult
): CopilotResponseMetadata {
  return {
    provider: llmResponse.provider,
    model: llmResponse.model,
    mode: context.mode,
    style: context.style,
    contributingAgents: context.contributingAgents,
    promptSections: context.promptSections,
    validationStatus: validation.code,
    latencyMs: llmResponse.metadata.latencyMs,
    tokenUsage: {
      prompt: llmResponse.usage.promptTokens,
      completion: llmResponse.usage.completionTokens,
      total: llmResponse.usage.totalTokens
    }
  };
}
