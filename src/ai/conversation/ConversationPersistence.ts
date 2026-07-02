/**
 * Conversation Persistence — Persistence Interface
 *
 * Defines persistence contract for conversation storage.
 * Supports in-memory, localStorage, and future backend.
 */

import type { ConversationSession } from './ConversationSession.ts';

// ============================================================================
// PERSISTENCE INTERFACE
// ============================================================================

export interface ConversationPersistence {
  save(session: ConversationSession): boolean;
  load(sessionId: string): ConversationSession | null;
  list(): readonly string[];
  delete(sessionId: string): boolean;
  clear(): boolean;
}

// ============================================================================
// IN-MEMORY PERSISTENCE
// ============================================================================

export class InMemoryPersistence implements ConversationPersistence {
  private storage: Map<string, ConversationSession> = new Map();

  save(session: ConversationSession): boolean {
    this.storage.set(session.id, session);
    return true;
  }

  load(sessionId: string): ConversationSession | null {
    return this.storage.get(sessionId) || null;
  }

  list(): readonly string[] {
    return [...this.storage.keys()];
  }

  delete(sessionId: string): boolean {
    return this.storage.delete(sessionId);
  }

  clear(): boolean {
    this.storage.clear();
    return true;
  }

  getSize(): number {
    return this.storage.size;
  }
}

// ============================================================================
// LOCAL STORAGE PERSISTENCE
// ============================================================================

const STORAGE_PREFIX = 'neuralverse_conversation_';

export class LocalStoragePersistence implements ConversationPersistence {
  private isAvailable: boolean;

  constructor() {
    this.isAvailable = this.checkAvailability();
  }

  save(session: ConversationSession): boolean {
    if (!this.isAvailable) return false;

    try {
      const key = STORAGE_PREFIX + session.id;
      const data = JSON.stringify(session);
      localStorage.setItem(key, data);
      return true;
    } catch {
      return false;
    }
  }

  load(sessionId: string): ConversationSession | null {
    if (!this.isAvailable) return null;

    try {
      const key = STORAGE_PREFIX + sessionId;
      const data = localStorage.getItem(key);
      if (!data) return null;
      return JSON.parse(data) as ConversationSession;
    } catch {
      return null;
    }
  }

  list(): readonly string[] {
    if (!this.isAvailable) return [];

    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        keys.push(key.substring(STORAGE_PREFIX.length));
      }
    }
    return keys;
  }

  delete(sessionId: string): boolean {
    if (!this.isAvailable) return false;

    try {
      const key = STORAGE_PREFIX + sessionId;
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }

  clear(): boolean {
    if (!this.isAvailable) return false;

    try {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_PREFIX)) {
          keys.push(key);
        }
      }
      keys.forEach(k => localStorage.removeItem(k));
      return true;
    } catch {
      return false;
    }
  }

  private checkAvailability(): boolean {
    try {
      if (typeof localStorage === 'undefined') return false;
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }
}

// ============================================================================
// PERSISTENCE FACTORY
// ============================================================================

export function createPersistence(
  type: 'memory' | 'localStorage' = 'memory'
): ConversationPersistence {
  switch (type) {
    case 'localStorage':
      return new LocalStoragePersistence();
    case 'memory':
    default:
      return new InMemoryPersistence();
  }
}
