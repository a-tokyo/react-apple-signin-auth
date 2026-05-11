/**
 * Add explicit `.js` extensions (and `/index.js` for directory imports) to
 * relative specifiers in the ESM build at dist/esm. Babel does not rewrite
 * import specifiers, but Node's native ESM resolver requires explicit
 * extensions — without this step `import` works in bundlers (Vite, webpack)
 * but fails in `node --input-type=module` and in Next.js SSR.
 */
const fs = require('fs');
const path = require('path');

const esmRoot = path.resolve(__dirname, '..', 'dist', 'esm');

/** Captures the relative specifier in `from "./x"`, `import "./x"`, and `import("./x")`. */
const RELATIVE_IMPORT = /(\b(?:from|import\s*\(?)\s*)(["'])(\.\.?\/[^"']+)\2/g;

function resolveSpecifier(directory, specifier) {
  if (/\.[a-zA-Z0-9]+$/.test(specifier)) return specifier;
  if (fs.existsSync(path.resolve(directory, `${specifier}.js`)))
    return `${specifier}.js`;
  if (fs.existsSync(path.resolve(directory, specifier, 'index.js')))
    return `${specifier}/index.js`;
  return specifier;
}

function fixExtensionsIn(directory) {
  fs.readdirSync(directory, { withFileTypes: true }).forEach((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      fixExtensionsIn(fullPath);
    } else if (entry.isFile() && fullPath.endsWith('.js')) {
      const original = fs.readFileSync(fullPath, 'utf8');
      const updated = original.replace(
        RELATIVE_IMPORT,
        (_, prefix, quote, specifier) =>
          `${prefix}${quote}${resolveSpecifier(directory, specifier)}${quote}`,
      );
      if (updated !== original) fs.writeFileSync(fullPath, updated);
    }
  });
}

if (!fs.existsSync(esmRoot)) {
  console.error(`fix-esm-extensions: ${esmRoot} does not exist`);
  process.exit(1);
}
fixExtensionsIn(esmRoot);
