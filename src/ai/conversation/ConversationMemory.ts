/**
 * Conversation Memory — Memory Management
 *
 * Stores conversation artifacts and important information.
 * Memory is deterministic — extracted from messages, not generated.
 */

import type { ConversationMemory } from './ConversationState.ts';
import type { ConversationMessage, MessageArtifact } from './ConversationMessage.ts';
import type { ConversationSession } from './ConversationSession.ts';
import { updateSessionMemory } from './ConversationSession.ts';

// ============================================================================
// MEMORY OPERATIONS
// ============================================================================

export function addImportantQuestion(
  session: ConversationSession,
  question: string
): ConversationSession {
  const questions = [...session.memory.importantQuestions];
  if (!questions.includes(question)) {
    questions.push(question);
  }
  return updateSessionMemory(session, { importantQuestions: questions });
}

export function addGeneratedSummary(
  session: ConversationSession,
  summary: string
): ConversationSession {
  return updateSessionMemory(session, {
    generatedSummaries: [...session.memory.generatedSummaries, summary]
  });
}

export function addGeneratedQuiz(
  session: ConversationSession,
  quiz: string
): ConversationSession {
  return updateSessionMemory(session, {
    generatedQuizzes: [...session.memory.generatedQuizzes, quiz]
  });
}

export function addGeneratedLaboratory(
  session: ConversationSession,
  lab: string
): ConversationSession {
  return updateSessionMemory(session, {
    generatedLaboratories: [...session.memory.generatedLaboratories, lab]
  });
}

export function addGeneratedDiagram(
  session: ConversationSession,
  diagram: string
): ConversationSession {
  return updateSessionMemory(session, {
    generatedDiagrams: [...session.memory.generatedDiagrams, diagram]
  });
}

export function addGeneratedComparison(
  session: ConversationSession,
  comparison: string
): ConversationSession {
  return updateSessionMemory(session, {
    generatedComparisons: [...session.memory.generatedComparisons, comparison]
  });
}

export function addGeneratedExplanation(
  session: ConversationSession,
  explanation: string
): ConversationSession {
  return updateSessionMemory(session, {
    generatedExplanations: [...session.memory.generatedExplanations, explanation]
  });
}

export function addReferenceCreated(
  session: ConversationSession,
  reference: string
): ConversationSession {
  return updateSessionMemory(session, {
    referencesCreated: [...session.memory.referencesCreated, reference]
  });
}

export function addArtifactProduced(
  session: ConversationSession,
  artifact: string
): ConversationSession {
  return updateSessionMemory(session, {
    artifactsProduced: [...session.memory.artifactsProduced, artifact]
  });
}

// ============================================================================
// MEMORY EXTRACTION
// ============================================================================

export function extractMemoryFromMessages(
  messages: readonly ConversationMessage[]
): ConversationMemory {
  const importantQuestions: string[] = [];
  const generatedSummaries: string[] = [];
  const generatedQuizzes: string[] = [];
  const generatedLaboratories: string[] = [];
  const generatedDiagrams: string[] = [];
  const generatedComparisons: string[] = [];
  const generatedExplanations: string[] = [];
  const referencesCreated: string[] = [];
  const artifactsProduced: string[] = [];

  for (const msg of messages) {
    // Extract user questions
    if (msg.type === 'user') {
      importantQuestions.push(msg.content);
    }

    // Extract artifacts from messages
    if (msg.artifacts) {
      for (const artifact of msg.artifacts) {
        switch (artifact.type) {
          case 'summary':
            generatedSummaries.push(artifact.content);
            break;
          case 'quiz':
            generatedQuizzes.push(artifact.content);
            break;
          case 'laboratory':
            generatedLaboratories.push(artifact.content);
            break;
          case 'diagram':
            generatedDiagrams.push(artifact.content);
            break;
          case 'comparison':
            generatedComparisons.push(artifact.content);
            break;
          case 'explanation':
            generatedExplanations.push(artifact.content);
            break;
          case 'reference':
            referencesCreated.push(artifact.content);
            break;
          default:
            artifactsProduced.push(artifact.content);
        }
      }
    }
  }

  return {
    importantQuestions,
    generatedSummaries,
    generatedQuizzes,
    generatedLaboratories,
    generatedDiagrams,
    generatedComparisons,
    generatedExplanations,
    referencesCreated,
    artifactsProduced
  };
}

// ============================================================================
// MEMORY QUERIES
// ============================================================================

export function getMemorySize(memory: ConversationMemory): number {
  return (
    memory.importantQuestions.length +
    memory.generatedSummaries.length +
    memory.generatedQuizzes.length +
    memory.generatedLaboratories.length +
    memory.generatedDiagrams.length +
    memory.generatedComparisons.length +
    memory.generatedExplanations.length +
    memory.referencesCreated.length +
    memory.artifactsProduced.length
  );
}

export function hasArtifacts(memory: ConversationMemory): boolean {
  return getMemorySize(memory) > 0;
}
