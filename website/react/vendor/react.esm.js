/**
 * NeuralVerse React Vendor Shim
 * Re-exports React 18 from the esm.sh CDN.
 * All internal React island imports should import from this file
 * so the entire application shares a single React instance.
 *
 * If the CDN is unreachable the React islands will silently fail to
 * mount while the existing JS application continues to function.
 */
export * from "https://esm.sh/react@18.3.1?target=es2022";
export { default } from "https://esm.sh/react@18.3.1?target=es2022";
