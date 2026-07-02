import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  // Session
  createNewSession,
  updateSessionState,
  addMessageToSession,
  updateSessionContext,
  updateSessionSummary,
  updateSessionMetadata,
  getMessageCount,
  isSessionActive,
  // Message
  createUserMessage,
  createAssistantMessage,
  createSystemMessage,
  createContextMessage,
  createGuardrailMessage,
  createArtifact,
  isUserMessage,
  isAssistantMessage,
  hasArtifacts,
  // Context
  syncContextFromRoute,
  addBookmark,
  addNote,
  addSharedKnowledge,
  serializeContext,
  deserializeContext,
  // Memory
  addImportantQuestion,
  addGeneratedQuiz,
  extractMemoryFromMessages,
  getMemorySize,
  // History
  getHistoryOrdered,
  getRecentMessages,
  getUserMessageCount,
  getAssistantMessageCount,
  getLastUserMessage,
  hasUserAskedQuestion,
  // Summary
  generateSummary,
  updateConversationSummary,
  hasSummary,
  // Persistence
  InMemoryPersistence,
  // Validation
  validateSession,
  validateMessage,
  isValidSession,
  isValidMessage,
  hasNoDuplicateIds,
  // Manager
  ConversationManager
} from './index.ts';
import type { ConversationSession } from './ConversationSession.ts';
import type { ConversationMessage } from './ConversationMessage.ts';

// ============================================================================
// SESSION TESTS
// ============================================================================

describe('ConversationSession -- Creation', () => {
  it('should create a new session with correct defaults', () => {
    const session = createNewSession();
    assert.ok(session.id.startsWith('session-'));
    assert.equal(session.state, 'new');
    assert.equal(session.messages.length, 0);
    assert.equal(session.summary, '');
  });

  it('should create session with custom mode and style', () => {
    const session = createNewSession('teaching', 'simple');
    assert.equal(session.metadata.mode, 'teaching');
    assert.equal(session.metadata.style, 'simple');
  });

  it('should generate unique session IDs', () => {
    const s1 = createNewSession();
    const s2 = createNewSession();
    assert.notEqual(s1.id, s2.id);
  });
});

describe('ConversationSession -- Updates', () => {
  it('should update session state immutably', () => {
    const session = createNewSession();
    const updated = updateSessionState(session, 'active');
    assert.equal(session.state, 'new');
    assert.equal(updated.state, 'active');
  });

  it('should add message immutably', () => {
    const session = createNewSession();
    const msg = createUserMessage('Hello');
    const updated = addMessageToSession(session, msg);
    assert.equal(session.messages.length, 0);
    assert.equal(updated.messages.length, 1);
  });

  it('should update context immutably', () => {
    const session = createNewSession();
    const updated = updateSessionContext(session, { currentRoute: '/learning' });
    assert.equal(session.context.currentRoute, '');
    assert.equal(updated.context.currentRoute, '/learning');
  });

  it('should update summary immutably', () => {
    const session = createNewSession();
    const updated = updateSessionSummary(session, 'Test summary');
    assert.equal(session.summary, '');
    assert.equal(updated.summary, 'Test summary');
  });

  it('should update metadata immutably', () => {
    const session = createNewSession();
    const updated = updateSessionMetadata(session, { provider: 'local' });
    assert.equal(session.metadata.provider, 'mock');
    assert.equal(updated.metadata.provider, 'local');
  });
});

describe('ConversationSession -- Queries', () => {
  it('should count messages', () => {
    let session = createNewSession();
    session = addMessageToSession(session, createUserMessage('Q1'));
    session = addMessageToSession(session, createAssistantMessage('A1'));
    assert.equal(getMessageCount(session), 2);
  });

  it('should detect active session', () => {
    const session = createNewSession();
    assert.equal(isSessionActive(session), false);

    const activated = updateSessionState(session, 'active');
    assert.equal(isSessionActive(activated), true);
  });
});

// ============================================================================
// MESSAGE TESTS
// ============================================================================

describe('ConversationMessage -- Creation', () => {
  it('should create user message', () => {
    const msg = createUserMessage('Hello');
    assert.ok(isUserMessage(msg));
    assert.equal(msg.content, 'Hello');
    assert.ok(msg.id.startsWith('msg-'));
  });

  it('should create assistant message', () => {
    const msg = createAssistantMessage('Response', { provider: 'mock' });
    assert.ok(isAssistantMessage(msg));
    assert.equal(msg.content, 'Response');
    assert.equal(msg.metadata.provider, 'mock');
  });

  it('should create system message', () => {
    const msg = createSystemMessage('System instruction');
    assert.equal(msg.type, 'system');
    assert.equal(msg.content, 'System instruction');
  });

  it('should create context message', () => {
    const msg = createContextMessage('Context data');
    assert.equal(msg.type, 'context');
  });

  it('should create guardrail message', () => {
    const msg = createGuardrailMessage('Guardrail notice');
    assert.equal(msg.type, 'guardrail');
  });

  it('should create artifact', () => {
    const artifact = createArtifact('quiz', 'Test Quiz', 'Quiz content');
    assert.ok(artifact.id.startsWith('artifact-'));
    assert.equal(artifact.type, 'quiz');
    assert.equal(artifact.title, 'Test Quiz');
  });

  it('should generate unique message IDs', () => {
    const m1 = createUserMessage('Q1');
    const m2 = createUserMessage('Q2');
    assert.notEqual(m1.id, m2.id);
  });
});

describe('ConversationMessage -- Type Guards', () => {
  it('should identify user message', () => {
    assert.ok(isUserMessage(createUserMessage('test')));
    assert.ok(!isUserMessage(createAssistantMessage('test')));
  });

  it('should identify assistant message', () => {
    assert.ok(isAssistantMessage(createAssistantMessage('test')));
    assert.ok(!isAssistantMessage(createUserMessage('test')));
  });

  it('should detect artifacts', () => {
    const msg: ConversationMessage = {
      ...createUserMessage('test'),
      artifacts: [createArtifact('quiz', 'Q', 'C')]
    };
    assert.ok(hasArtifacts(msg));
    assert.ok(!hasArtifacts(createUserMessage('test')));
  });
});

// ============================================================================
// CONTEXT TESTS
// ============================================================================

describe('ConversationContext -- Sync', () => {
  it('should sync route context', () => {
    let session = createNewSession();
    session = syncContextFromRoute(session, {
      route: '/learning/ml/module-1/lesson-1',
      lessonId: 'lesson-1',
      lessonTitle: 'Linear Regression',
      moduleId: 'module-1',
      moduleTitle: 'ML Basics',
      pathId: 'ml-path',
      pathTitle: 'Machine Learning'
    });

    assert.equal(session.context.currentRoute, '/learning/ml/module-1/lesson-1');
    assert.ok(session.context.currentLesson);
    assert.equal(session.context.currentLesson.lessonTitle, 'Linear Regression');
  });

  it('should add bookmark immutably', () => {
    let session = createNewSession();
    session = addBookmark(session, 'bookmark-1');
    assert.equal(session.context.bookmarks.length, 1);
    assert.equal(session.context.bookmarks[0], 'bookmark-1');
  });

  it('should not duplicate bookmarks', () => {
    let session = createNewSession();
    session = addBookmark(session, 'bookmark-1');
    session = addBookmark(session, 'bookmark-1');
    assert.equal(session.context.bookmarks.length, 1);
  });

  it('should add note immutably', () => {
    let session = createNewSession();
    session = addNote(session, 'note-1');
    assert.equal(session.context.notes.length, 1);
  });

  it('should add shared knowledge', () => {
    let session = createNewSession();
    session = addSharedKnowledge(session, 'concept-1');
    assert.equal(session.context.sharedKnowledge.length, 1);
  });
});

describe('ConversationContext -- Serialization', () => {
  it('should serialize and deserialize context', () => {
    const context = {
      currentRoute: '/test',
      currentLesson: undefined,
      currentModule: undefined,
      currentPath: undefined,
      currentLaboratory: undefined,
      currentAssessment: undefined,
      currentResearch: undefined,
      bookmarks: ['b1'],
      notes: ['n1'],
      retrievalContext: undefined,
      sharedKnowledge: ['k1']
    };

    const serialized = serializeContext(context);
    const deserialized = deserializeContext(serialized);

    assert.equal(deserialized.currentRoute, '/test');
    assert.deepEqual(deserialized.bookmarks, ['b1']);
    assert.deepEqual(deserialized.notes, ['n1']);
  });

  it('should handle invalid JSON gracefully', () => {
    const result = deserializeContext('invalid json');
    assert.equal(result.currentRoute, '');
    assert.deepEqual(result.bookmarks, []);
  });
});

// ============================================================================
// MEMORY TESTS
// ============================================================================

describe('ConversationMemory -- Operations', () => {
  it('should add important question', () => {
    let session = createNewSession();
    session = addImportantQuestion(session, 'What is ML?');
    assert.equal(session.memory.importantQuestions.length, 1);
  });

  it('should add generated quiz', () => {
    let session = createNewSession();
    session = addGeneratedQuiz(session, 'Quiz content');
    assert.equal(session.memory.generatedQuizzes.length, 1);
  });

  it('should extract memory from messages', () => {
    const messages: ConversationMessage[] = [
      createUserMessage('Question 1'),
      createUserMessage('Question 2'),
      {
        ...createAssistantMessage('Response'),
        artifacts: [createArtifact('quiz', 'Q', 'Quiz')]
      }
    ];

    const memory = extractMemoryFromMessages(messages);
    assert.equal(memory.importantQuestions.length, 2);
  });

  it('should calculate memory size', () => {
    let session = createNewSession();
    session = addImportantQuestion(session, 'Q1');
    session = addGeneratedQuiz(session, 'Quiz');
    assert.equal(getMemorySize(session.memory), 2);
  });
});

// ============================================================================
// HISTORY TESTS
// ============================================================================

describe('ConversationHistory -- Queries', () => {
  it('should order messages by timestamp', () => {
    let session = createNewSession();
    session = addMessageToSession(session, createUserMessage('Q1'));
    session = addMessageToSession(session, createAssistantMessage('A1'));

    const ordered = getHistoryOrdered(session);
    assert.equal(ordered.length, 2);
    assert.ok(isUserMessage(ordered[0]));
  });

  it('should get recent messages', () => {
    let session = createNewSession();
    session = addMessageToSession(session, createUserMessage('Q1'));
    session = addMessageToSession(session, createAssistantMessage('A1'));
    session = addMessageToSession(session, createUserMessage('Q2'));

    const recent = getRecentMessages(session, 2);
    assert.equal(recent.length, 2);
  });

  it('should count by type', () => {
    let session = createNewSession();
    session = addMessageToSession(session, createUserMessage('Q1'));
    session = addMessageToSession(session, createAssistantMessage('A1'));
    session = addMessageToSession(session, createUserMessage('Q2'));

    assert.equal(getUserMessageCount(session), 2);
    assert.equal(getAssistantMessageCount(session), 1);
  });

  it('should get last user message', () => {
    let session = createNewSession();
    session = addMessageToSession(session, createUserMessage('Q1'));
    session = addMessageToSession(session, createAssistantMessage('A1'));
    session = addMessageToSession(session, createUserMessage('Q2'));

    const last = getLastUserMessage(session);
    assert.ok(last);
    assert.equal(last.content, 'Q2');
  });

  it('should check if user asked question', () => {
    let session = createNewSession();
    session = addMessageToSession(session, createUserMessage('What is neural network?'));

    assert.ok(hasUserAskedQuestion(session, 'neural network'));
    assert.ok(!hasUserAskedQuestion(session, 'quantum'));
  });
});

// ============================================================================
// SUMMARY TESTS
// ============================================================================

describe('ConversationSummary -- Generation', () => {
  it('should generate summary from empty session', () => {
    const session = createNewSession();
    const summary = generateSummary(session);
    assert.equal(summary, '');
  });

  it('should generate summary with messages', () => {
    let session = createNewSession();
    session = addMessageToSession(session, createUserMessage('Explain ML'));
    session = addMessageToSession(session, createAssistantMessage('ML is...'));

    const summary = generateSummary(session);
    assert.ok(summary.length > 0);
    assert.ok(summary.includes('Topic:'));
    assert.ok(summary.includes('1 questions'));
  });

  it('should update session summary', () => {
    let session = createNewSession();
    session = addMessageToSession(session, createUserMessage('Test'));
    session = updateConversationSummary(session);

    assert.ok(hasSummary(session));
  });
});

// ============================================================================
// PERSISTENCE TESTS
// ============================================================================

describe('ConversationPersistence -- InMemory', () => {
  it('should save and load session', () => {
    const persistence = new InMemoryPersistence();
    const session = createNewSession();

    persistence.save(session);
    const loaded = persistence.load(session.id);

    assert.ok(loaded);
    assert.equal(loaded.id, session.id);
  });

  it('should list sessions', () => {
    const persistence = new InMemoryPersistence();
    const s1 = createNewSession();
    const s2 = createNewSession();

    persistence.save(s1);
    persistence.save(s2);

    const list = persistence.list();
    assert.equal(list.length, 2);
  });

  it('should delete session', () => {
    const persistence = new InMemoryPersistence();
    const session = createNewSession();

    persistence.save(session);
    assert.equal(persistence.delete(session.id), true);
    assert.equal(persistence.load(session.id), null);
  });

  it('should clear all sessions', () => {
    const persistence = new InMemoryPersistence();
    persistence.save(createNewSession());
    persistence.save(createNewSession());

    persistence.clear();
    assert.equal(persistence.list().length, 0);
  });
});

// ============================================================================
// VALIDATION TESTS
// ============================================================================

describe('ConversationValidation -- Session', () => {
  it('should validate empty session', () => {
    const session = createNewSession();
    const result = validateSession(session);
    assert.equal(result.valid, false);
    assert.equal(result.code, 'session_empty');
  });

  it('should validate valid session', () => {
    let session = createNewSession();
    session = addMessageToSession(session, createUserMessage('Test'));
    const result = validateSession(session);
    assert.equal(result.valid, true);
  });

  it('should detect invalid state', () => {
    let session = createNewSession();
    session = addMessageToSession(session, createUserMessage('Test'));
    // Cast to any to test invalid state detection
    const invalidSession = { ...session, state: 'invalid' } as unknown as ConversationSession;
    const result = validateSession(invalidSession);
    assert.equal(result.valid, false);
    assert.equal(result.code, 'session_invalid_state');
  });
});

describe('ConversationValidation -- Message', () => {
  it('should validate valid message', () => {
    const msg = createUserMessage('Test');
    const result = validateMessage(msg);
    assert.equal(result.valid, true);
  });

  it('should reject empty content', () => {
    const msg: ConversationMessage = {
      ...createUserMessage(''),
      content: ''
    };
    const result = validateMessage(msg);
    assert.equal(result.valid, false);
    assert.equal(result.code, 'message_empty_content');
  });

  it('should detect duplicate IDs', () => {
    const messages = [
      createUserMessage('Q1'),
      createUserMessage('Q2')
    ];
    assert.ok(hasNoDuplicateIds(messages));
  });
});

// ============================================================================
// MANAGER TESTS
// ============================================================================

describe('ConversationManager -- Core', () => {
  it('should create manager with defaults', () => {
    const manager = new ConversationManager();
    assert.equal(manager.getState(), null);
  });

  it('should start new session', () => {
    const manager = new ConversationManager();
    const session = manager.startNewSession('teaching', 'simple');
    assert.ok(session.id);
    assert.equal(manager.getState(), 'new');
    assert.equal(manager.getMessageCount(), 0);
  });

  it('should append user message', () => {
    const manager = new ConversationManager();
    manager.startNewSession();
    manager.appendUserMessage('Hello');

    assert.equal(manager.getMessageCount(), 1);
    assert.equal(manager.getState(), 'active');
  });

  it('should append assistant message', () => {
    const manager = new ConversationManager();
    manager.startNewSession();
    manager.appendUserMessage('Q');
    manager.appendAssistantMessage('A');

    assert.equal(manager.getMessageCount(), 2);
  });

  it('should auto-start session on first message', () => {
    const manager = new ConversationManager();
    manager.appendUserMessage('Hello');
    assert.equal(manager.getState(), 'active');
  });

  it('should update context', () => {
    const manager = new ConversationManager();
    manager.startNewSession();
    manager.updateContext('/learning', {
      lessonId: 'l1',
      lessonTitle: 'Lesson 1',
      moduleId: 'm1',
      moduleTitle: 'Module 1',
      pathId: 'p1',
      pathTitle: 'Path 1'
    });

    const context = manager.getContext();
    assert.ok(context);
    assert.equal(context.currentRoute, '/learning');
  });

  it('should update provider', () => {
    const manager = new ConversationManager();
    manager.startNewSession();
    manager.updateProvider('local', 'qwen3:8b');

    const info = manager.getDeveloperInfo();
    assert.ok(info);
    assert.equal(info.provider, 'local');
    assert.equal(info.model, 'qwen3:8b');
  });

  it('should get developer info', () => {
    const manager = new ConversationManager();
    manager.startNewSession();
    manager.appendUserMessage('Test');

    const info = manager.getDeveloperInfo();
    assert.ok(info);
    assert.equal(info.messageCount, 1);
  });

  it('should validate session', () => {
    const manager = new ConversationManager();
    manager.startNewSession();
    manager.appendUserMessage('Test');

    const result = manager.validate();
    assert.ok(result);
    assert.equal(result.valid, true);
  });
});

describe('ConversationManager -- State Transitions', () => {
  it('should pause and restore session', () => {
    const manager = new ConversationManager();
    const session = manager.startNewSession();
    manager.appendUserMessage('Test');

    manager.pauseSession();
    assert.equal(manager.getState(), 'paused');

    manager.restoreSession(session.id);
    assert.equal(manager.getState(), 'restored');
  });

  it('should finish session', () => {
    const manager = new ConversationManager();
    manager.startNewSession();
    manager.appendUserMessage('Test');

    manager.finishSession();
    assert.equal(manager.getState(), 'finished');
  });

  it('should archive session', () => {
    const manager = new ConversationManager();
    manager.startNewSession();
    manager.appendUserMessage('Test');

    manager.archiveSession();
    assert.equal(manager.getState(), 'archived');
  });
});

describe('ConversationManager -- Persistence', () => {
  it('should save and restore session', () => {
    const persistence = new InMemoryPersistence();
    const manager = new ConversationManager({ persistence });
    const session = manager.startNewSession();
    manager.appendUserMessage('Test');

    const restored = manager.restoreSession(session.id);
    assert.ok(restored);
    assert.equal(restored.id, session.id);
  });

  it('should list sessions', () => {
    const manager = new ConversationManager();
    manager.startNewSession();
    manager.startNewSession();

    const list = manager.listSessions();
    assert.equal(list.length, 2);
  });
});

describe('ConversationManager -- Determinism', () => {
  it('should produce consistent results for same operations', () => {
    const manager1 = new ConversationManager();
    const manager2 = new ConversationManager();

    manager1.startNewSession('teaching', 'simple');
    manager2.startNewSession('teaching', 'simple');

    manager1.appendUserMessage('Test');
    manager2.appendUserMessage('Test');

    assert.equal(manager1.getMessageCount(), manager2.getMessageCount());
    assert.equal(manager1.getState(), manager2.getState());
  });

  it('should not mutate original session on update', () => {
    const manager = new ConversationManager();
    const session = manager.startNewSession();
    const originalState = session.state;

    manager.appendUserMessage('Test');

    // Original session object should not be mutated
    assert.equal(session.state, originalState);
    assert.equal(session.messages.length, 0);
  });
});
