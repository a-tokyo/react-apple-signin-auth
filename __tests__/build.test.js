/**
 * Build-output regression test. Catches breakage in dist/ resolution that
 * unit tests against src/ can't see — e.g., issue #94 (Vite 8 reading
 * `module.exports` instead of `.default`) or the ESM build missing `.js`
 * extensions on relative imports (Node ESM resolver requires them).
 *
 * Skips gracefully when dist/ has not been built, so `yarn test` from a
 * fresh checkout still works. Run after `yarn transpile` to exercise these
 * checks; `prepublishOnly` also runs them so a broken build can't be published.
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { pathToFileURL } = require('url');

const root = path.resolve(__dirname, '..');
const distDir = path.join(root, 'dist');
const esmDir = path.join(distDir, 'esm');
const packageJson = JSON.parse(
  fs.readFileSync(path.join(root, 'package.json'), 'utf8'),
);
const isBuilt = fs.existsSync(path.join(distDir, 'index.js'));
const describeIfBuilt = isBuilt ? describe : describe.skip;

describeIfBuilt('build output (run `yarn transpile` first)', () => {
  describe('CJS — dist/index.js', () => {
    let cjsModule;
    beforeAll(() => {
      // eslint-disable-next-line global-require, import/no-dynamic-require
      cjsModule = require(path.join(distDir, 'index.js'));
    });

    it('default export is a function (#94 Vite 8 / modern bundler interop)', () => {
      expect(typeof cjsModule.default).toBe('function');
    });

    it('marks __esModule = true', () => {
      expect(cjsModule.__esModule).toBe(true);
    });

    it('exposes appleAuthHelpers.signIn and useScript', () => {
      expect(typeof cjsModule.appleAuthHelpers).toBe('object');
      expect(typeof cjsModule.appleAuthHelpers.signIn).toBe('function');
      expect(typeof cjsModule.useScript).toBe('function');
    });

    it('deep import "react-apple-signin-auth/dist/appleAuthHelpers" still resolves (README @unstable path)', () => {
      // eslint-disable-next-line global-require, import/no-dynamic-require
      const deepHelpers = require(path.join(
        distDir,
        'appleAuthHelpers',
        'index.js',
      ));
      expect(typeof deepHelpers.default).toBe('object');
      expect(typeof deepHelpers.default.signIn).toBe('function');
    });
  });

  describe('ESM — dist/esm/index.js', () => {
    it('Node native ESM loader resolves dist/esm with the correct shape', () => {
      const entry = pathToFileURL(path.join(esmDir, 'index.js')).href;
      const script = `
        import(process.env.ENTRY).then((esmModule) => {
          process.stdout.write([
            typeof esmModule.default,
            typeof esmModule.appleAuthHelpers,
            typeof esmModule.appleAuthHelpers?.signIn,
            typeof esmModule.useScript,
          ].join('|'));
        }).catch((error) => { process.stderr.write(error.stack || error.message); process.exit(1); });
      `;
      const result = spawnSync('node', ['--input-type=module', '-e', script], {
        encoding: 'utf8',
        env: { ...process.env, ENTRY: entry },
      });
      if (result.status !== 0)
        throw new Error(`Node ESM import failed:\n${result.stderr}`);
      expect(result.stdout).toBe('function|object|function|function');
    });

    it('dist/esm/package.json declares type: module', () => {
      const esmPackageJson = JSON.parse(
        fs.readFileSync(path.join(esmDir, 'package.json'), 'utf8'),
      );
      expect(esmPackageJson.type).toBe('module');
    });

    it('all relative imports in the ESM build include explicit .js extensions', () => {
      const relativeImport = /(?:from|import\s*\(?)\s*(["'])(\.\.?\/[^"']+)\1/g;
      const offenders = fs
        .readdirSync(esmDir, { recursive: true })
        .filter((file) => file.endsWith('.js'))
        .flatMap((file) => {
          const source = fs.readFileSync(path.join(esmDir, file), 'utf8');
          return [...source.matchAll(relativeImport)]
            .map((match) => match[2])
            .filter((specifier) => !/\.[a-zA-Z0-9]+$/.test(specifier))
            .map((specifier) => `${file}: ${specifier}`);
        });
      expect(offenders).toEqual([]);
    });
  });

  describe('package.json wiring', () => {
    it('all main/module/types fields and exports conditions point to existing files', () => {
      const rootConditions = packageJson.exports['.'];
      const helpersConditions = packageJson.exports['./dist/appleAuthHelpers'];
      const targets = {
        main: packageJson.main,
        module: packageJson.module,
        types: packageJson.types,
        'exports."."→types': rootConditions.types,
        'exports."."→import': rootConditions.import,
        'exports."."→require': rootConditions.require,
        'exports."."→default': rootConditions.default,
        'exports."./dist/appleAuthHelpers"→import': helpersConditions.import,
        'exports."./dist/appleAuthHelpers"→require': helpersConditions.require,
        'exports."./dist/appleAuthHelpers"→default': helpersConditions.default,
      };
      const missing = Object.entries(targets)
        .filter(([, file]) => !fs.existsSync(path.join(root, file)))
        .map(([key]) => key);
      expect(missing).toEqual([]);
    });
  });
});
