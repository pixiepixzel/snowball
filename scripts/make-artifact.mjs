/**
 * Package the built game as a claude.ai Artifact page.
 *
 *   npm run build
 *   node scripts/make-artifact.mjs <output folder>
 *
 * Writes two files into the output folder:
 *   snowball.html  the page: title, styles and markup (no <html>/<head>/<body> tags,
 *                  because the Artifact host wraps the file in its own)
 *   game.js        the whole game, three.js included, as one script the page loads
 */
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = resolve(process.argv[2] ?? join(root, 'artifact'));
const assets = join(root, 'dist', 'assets');

const files = readdirSync(assets);
const jsFile = files.find((f) => f.endsWith('.js'));
const cssFile = files.find((f) => f.endsWith('.css'));
if (!jsFile || !cssFile) throw new Error('Run "npm run build" first: dist/assets has no script or stylesheet.');

const css = readFileSync(join(assets, cssFile), 'utf8');
const html = readFileSync(join(root, 'index.html'), 'utf8');
// Everything inside <body>, minus the dev-server script tag.
const body = html
  .slice(html.indexOf('<body>') + 6, html.indexOf('</body>'))
  .replace(/<script[^>]*><\/script>/g, '')
  .trim();

const page = `<title>Snowball</title>
<style>
${css}
</style>
${body}
<script type="module" src="game.js"></script>
`;

mkdirSync(out, { recursive: true });
writeFileSync(join(out, 'snowball.html'), page);
writeFileSync(join(out, 'game.js'), readFileSync(join(assets, jsFile)));
console.log(`Wrote ${join(out, 'snowball.html')} (${(page.length / 1024).toFixed(1)} kB) and game.js (${(readFileSync(join(assets, jsFile)).length / 1024).toFixed(0)} kB)`);
