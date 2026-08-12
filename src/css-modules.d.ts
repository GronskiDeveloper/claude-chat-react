// Ambient type declarations for CSS Modules — lets `import styles from './x.module.css'`
// type-check under `strict` TypeScript. The `styles` object is a Record<string, string>
// at runtime (tsup emits the CSS as a separate .css file and bundlers wire class names).
declare module '*.module.css' {
  const classes: Record<string, string>;
  export default classes;
}
