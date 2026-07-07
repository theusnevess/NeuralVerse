export function createHash(): {
  update(input: string | Uint8Array): { digest(encoding: "hex"): string };
  digest(encoding: "hex"): string;
} {
  let content = "";
  const api = {
    update(input: string | Uint8Array) {
      content += typeof input === "string" ? input : Array.from(input).join(",");
      return api;
    },
    digest(encoding: "hex") {
      if (encoding !== "hex") throw new Error("Atlas browser hash compatibility supports hex output only.");
      return stableBrowserHash(content);
    },
  };
  return api;
}

export function deflateSync(input: Uint8Array | string): Uint8Array {
  return typeof input === "string" ? new TextEncoder().encode(input) : input;
}

export function inflateSync(input: Uint8Array): Uint8Array {
  return input;
}

function stableBrowserHash(input: string): string {
  let a = 0x811c9dc5;
  let b = 0x01000193;
  for (let index = 0; index < input.length; index += 1) {
    const code = input.charCodeAt(index);
    a ^= code;
    a = Math.imul(a, 0x01000193) >>> 0;
    b = Math.imul(b ^ code, 0x85ebca6b) >>> 0;
  }
  const seed = `${a.toString(16).padStart(8, "0")}${b.toString(16).padStart(8, "0")}`;
  return seed.repeat(4).slice(0, 64);
}
