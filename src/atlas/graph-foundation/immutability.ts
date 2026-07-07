export function deepFreeze<T>(value: T): T {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }

  for (const key of Reflect.ownKeys(value)) {
    const child = (value as Record<PropertyKey, unknown>)[key];
    deepFreeze(child);
  }

  return Object.freeze(value);
}

export function readonlySet<T>(set: Set<T>): ReadonlySet<T> {
  const frozen = new Set(set);
  return new Proxy(frozen, {
    get(target, property, receiver) {
      if (property === "add" || property === "delete" || property === "clear") {
        return () => {
          throw new TypeError("Graph snapshot sets are immutable.");
        };
      }
      const value = Reflect.get(target, property, target) as unknown;
      return typeof value === "function" ? value.bind(target) : value;
    },
  });
}

export function readonlyMap<K, V>(map: Map<K, V>): ReadonlyMap<K, V> {
  const frozen = new Map(map);
  return new Proxy(frozen, {
    get(target, property, receiver) {
      if (property === "set" || property === "delete" || property === "clear") {
        return () => {
          throw new TypeError("Graph snapshots are immutable.");
        };
      }
      const value = Reflect.get(target, property, target) as unknown;
      return typeof value === "function" ? value.bind(target) : value;
    },
  });
}
