import assert from 'node:assert/strict';
import {readFileSync, readdirSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const versions = JSON.parse(readFileSync(path.join(root, 'versions.json'), 'utf8'));
const sources = JSON.parse(readFileSync(path.join(root, '.generated/static/website-sources.json'), 'utf8'));
assert.ok(versions.length <= 1, 'Expected only one stable manual');
assert.deepEqual(versions, sources.stable.map((release) => release.version));
assert.equal(new Set(versions).size, versions.length);
assert.deepEqual(versions, [...versions].sort((a, b) => b.localeCompare(a, 'en', {numeric: true})));
const manual = path.join(root, 'build/manual');
const next = versions.length > 0 ? 'next' : '';
const nextHtml = readFileSync(path.join(manual, next, 'index.html'), 'utf8');
assert.ok(nextHtml.includes('This is unreleased documentation'), 'Next is missing its unreleased banner');
const nextNotes = readFileSync(path.join(manual, next, 'whats-new/index.html'), 'utf8');
assert.ok(nextNotes.includes('Unreleased'), 'Next is missing Unreleased notes');
assert.ok(!/<h3 [^>]*>v[\d.]+</.test(nextNotes), 'Released patch headings leaked into Next');
if (versions.length > 0) {
  const stableHtml = readFileSync(path.join(manual, 'index.html'), 'utf8');
  assert.ok(!stableHtml.includes('no longer actively maintained'));
  assert.ok(!stableHtml.includes('This is unreleased documentation'));
  assert.deepEqual(readdirSync(path.join(root, 'versioned_docs')).sort(), versions.map((v) => `version-${v}`).sort());
  assert.deepEqual(readdirSync(path.join(root, 'versioned_sidebars')).sort(), versions.map((v) => `version-${v}-sidebars.json`).sort());
}
for (const [index, release] of sources.stable.entries()) {
  const markdown = readFileSync(path.join(root, `versioned_docs/version-${release.version}/whats-new.md`), 'utf8');
  assert.ok(!markdown.includes('## Unreleased'));
  const patches = [...markdown.matchAll(/^### (v[\d.]+)$/gm)].map((match) => match[1]);
  assert.ok(patches.includes(release.tag));
  const html = readFileSync(path.join(manual, index === 0 ? '' : release.version, 'whats-new/index.html'), 'utf8');
  assert.deepEqual([...html.matchAll(/<h3 [^>]*>(v[\d.]+)</g)].map((match) => match[1]), patches);
}
assert.deepEqual(JSON.parse(readFileSync(path.join(root, 'build/website-sources.json'), 'utf8')), sources);
const baseUrl = process.env.WEBSITE_BASE_URL ?? '/';
const siteUrl = process.env.WEBSITE_URL ?? 'https://fscriptlang.github.io';
const homepage = readFileSync(path.join(root, 'build/index.html'), 'utf8');
// The production minifier may remove optional quotes around HTML attributes.
const attributes = (html, name) => [...html.matchAll(new RegExp(`\\b${name}=(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'g'))]
  .map((match) => match[1] ?? match[2] ?? match[3]);
const canonical = homepage.match(/<link\b[^>]*\brel=(?:"canonical"|'canonical'|canonical)(?=[\s>])[^>]*>/)?.[0] ?? '';
assert.deepEqual(attributes(canonical, 'href'), [`${siteUrl}${baseUrl}`], 'Homepage canonical URL must match the deployment URL');
const imageAndScriptSources = attributes(homepage, 'src');
assert.ok(imageAndScriptSources.some((src) => src.startsWith(`${baseUrl}assets/`)), 'JavaScript assets must use the deployment base path');
assert.ok(imageAndScriptSources.includes(`${baseUrl}img/magnus-opera-logo.svg`), 'Footer logo must use the deployment base path');
if (baseUrl === '/') {
  assert.ok(![...attributes(homepage, 'href'), ...imageAndScriptSources].some((url) => url.startsWith('/website/')),
    'The old project path must not remain in root deployment links');
}
for (const [edition, file] of [['stable', path.join(manual, 'index.html')], ['next', path.join(manual, next, 'index.html')]]) {
  assert.ok(readFileSync(file, 'utf8').includes(`https://github.com/FScriptLang/FScriptLang.github.io/edit/main/docs/${edition}/intro.md`),
    `${edition} documentation edit links must target the renamed repository`);
}
console.log(`Verified Next and ${versions.length} stable manuals against their recorded sources.`);
