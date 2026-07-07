export function freezeInteraction<T>(value: T): Readonly<T> {
  if (value && typeof value === "object") {
    Object.freeze(value);
    for (const child of Object.values(value as Record<string, unknown>)) {
      if (child && typeof child === "object" && !Object.isFrozen(child)) freezeInteraction(child);
    }
  }
  return value as Readonly<T>;
}

