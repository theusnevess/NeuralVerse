const STORAGE_KEY = "neuralverse.progress.v1";

export const PROGRESS_ENTITY_TYPES = Object.freeze({
  LEARNING_PATH: "learning-path",
  MODULE: "module",
  CONTENT_ITEM: "content-item",
});

export const PROGRESS_STATUS = Object.freeze({
  NOT_STARTED: "not-started",
  IN_PROGRESS: "in-progress",
  COMPLETED: "completed",
});

function now() {
  return new Date().toISOString();
}

function createDefaultStore() {
  return { records: [] };
}

function normalizeStore(value) {
  if (!value || !Array.isArray(value.records)) {
    return createDefaultStore();
  }

  return {
    records: value.records.filter(
      (record) =>
        record &&
        typeof record.entityId === "string" &&
        typeof record.entityType === "string"
    ),
  };
}

function findRecord(records, entityId, entityType) {
  return records.find(
    (record) => record.entityId === entityId && record.entityType === entityType
  );
}

function upsertRecord(records, nextRecord) {
  const index = records.findIndex(
    (record) =>
      record.entityId === nextRecord.entityId &&
      record.entityType === nextRecord.entityType
  );

  if (index === -1) {
    return [...records, nextRecord];
  }

  const updated = [...records];
  updated[index] = nextRecord;
  return updated;
}

function getCompletedContentCount(records, contentItemIds) {
  return contentItemIds.filter((contentItemId) => {
    const record = findRecord(
      records,
      contentItemId,
      PROGRESS_ENTITY_TYPES.CONTENT_ITEM
    );

    return record?.status === PROGRESS_STATUS.COMPLETED;
  }).length;
}

function toPercent(completed, total) {
  if (!total) {
    return 0;
  }

  return Math.round((completed / total) * 100);
}

export function createProgressService(options = {}) {
  const storage = options.storage || window.localStorage;
  const storageKey = options.storageKey || STORAGE_KEY;

  function loadProgress() {
    try {
      const raw = storage.getItem(storageKey);

      if (!raw) {
        return createDefaultStore();
      }

      return normalizeStore(JSON.parse(raw));
    } catch {
      return createDefaultStore();
    }
  }

  function saveProgress(store) {
    const normalized = normalizeStore(store);
    storage.setItem(storageKey, JSON.stringify(normalized));
    return normalized;
  }

  function getRecords() {
    return loadProgress().records;
  }

  function createRecord(entityId, entityType, overrides = {}) {
    return {
      entityId,
      entityType,
      status: PROGRESS_STATUS.NOT_STARTED,
      progressValue: 0,
      lastOpenedAt: null,
      completedAt: null,
      ...overrides,
    };
  }

  function updateRecord(entityId, entityType, updater) {
    const store = loadProgress();
    const existing =
      findRecord(store.records, entityId, entityType) ||
      createRecord(entityId, entityType);

    const nextRecord =
      typeof updater === "function" ? updater(existing) : { ...existing, ...updater };

    const nextStore = {
      records: upsertRecord(store.records, nextRecord),
    };

    saveProgress(nextStore);
    return nextRecord;
  }

  function markOpened(entityId, entityType = PROGRESS_ENTITY_TYPES.CONTENT_ITEM) {
    return updateRecord(entityId, entityType, (record) => {
      if (record.status === PROGRESS_STATUS.COMPLETED) {
        return {
          ...record,
          lastOpenedAt: now(),
        };
      }

      return {
        ...record,
        status: PROGRESS_STATUS.IN_PROGRESS,
        progressValue: Math.max(record.progressValue || 0, 1),
        lastOpenedAt: now(),
      };
    });
  }

  function markCompleted(entityId, entityType = PROGRESS_ENTITY_TYPES.CONTENT_ITEM) {
    return updateRecord(entityId, entityType, (record) => ({
      ...record,
      status: PROGRESS_STATUS.COMPLETED,
      progressValue: 100,
      lastOpenedAt: now(),
      completedAt: now(),
    }));
  }

  function getContentProgress(contentItemId) {
    return (
      findRecord(
        getRecords(),
        contentItemId,
        PROGRESS_ENTITY_TYPES.CONTENT_ITEM
      ) ||
      createRecord(contentItemId, PROGRESS_ENTITY_TYPES.CONTENT_ITEM)
    );
  }

  function computeModuleProgress(module, records = getRecords()) {
    const contentItemIds = module?.contentItemIds || [];
    const completed = getCompletedContentCount(records, contentItemIds);
    const total = contentItemIds.length;

    return {
      entityId: module?.id || null,
      entityType: PROGRESS_ENTITY_TYPES.MODULE,
      completed,
      total,
      progressValue: toPercent(completed, total),
      status:
        completed === 0
          ? PROGRESS_STATUS.NOT_STARTED
          : completed === total
            ? PROGRESS_STATUS.COMPLETED
            : PROGRESS_STATUS.IN_PROGRESS,
    };
  }

  function computeLearningPathProgress(path, modules = [], records = getRecords()) {
    const pathModules = modules.filter((module) => module.pathId === path.id);
    const contentItemIds = pathModules.flatMap((module) => module.contentItemIds || []);
    const completed = getCompletedContentCount(records, contentItemIds);
    const total = contentItemIds.length;

    return {
      entityId: path.id,
      entityType: PROGRESS_ENTITY_TYPES.LEARNING_PATH,
      completed,
      total,
      progressValue: toPercent(completed, total),
      status:
        completed === 0
          ? PROGRESS_STATUS.NOT_STARTED
          : completed === total
            ? PROGRESS_STATUS.COMPLETED
            : PROGRESS_STATUS.IN_PROGRESS,
    };
  }

  return {
    loadProgress,
    saveProgress,
    getRecords,
    createRecord,
    updateRecord,
    markOpened,
    markCompleted,
    getContentProgress,
    computeModuleProgress,
    computeLearningPathProgress,
  };
}
