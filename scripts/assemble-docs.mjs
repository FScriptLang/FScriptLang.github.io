import {createHash} from 'node:crypto';
import {cpSync, mkdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import ts from 'typescript';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {setTimeout as delay} from 'node:timers/promises';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const changelogUrl = 'https://raw.githubusercontent.com/FScriptLang/FScript/main/CHANGELOG.md';

export function whatsNew(changelog, tag) {
  const normalized = changelog.replaceAll('\r\n', '\n');
  let body;
  if (tag) {
    if (!/^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(tag)) {
      throw new Error('Stable documentation requires a canonical vX.Y.Z tag.');
    }
    // Archived changelog headings may predate the v-prefixed tag convention.
    // Links keep their original Git refs; only displayed headings are normalized.
    const version = tag.slice(1);
    const headings = [...normalized.matchAll(/^#{2,3} \[([^\]]+)\]$/gm)];
    const start = headings.findIndex((heading) => heading[1] === tag || heading[1] === version);
    if (start < 0) throw new Error(`Missing release notes for ${tag}`);
    const heading = headings[start];
    const section = normalized.slice(heading.index + heading[0].length, headings[start + 1]?.index);
    if (!/^\s*-\s+/m.test(section) || !section.includes('**Full Changelog**:')) {
      throw new Error(`Release notes for ${tag} require bullets and a compare link.`);
    }
    // Start at this edition's release. Newer release preparations on main must
    // not appear in Stable before its documentation is deliberately promoted.
    body = `## ${version.slice(0, version.lastIndexOf('.'))}\n\n${normalized.slice(heading.index).trim()}`
      .replace(/^## \[(\d+\.\d+)\]$/gm, '## $1')
      .replace(/^#{2,3} \[(v?\d+\.\d+\.\d+(?:-[^\]]+)?)\]$/gm,
        (_, value) => `### v${value.replace(/^v/, '')}`);
  } else {
    const match = /^## \[Unreleased\]\n([\s\S]*?)(?=^## |$(?![\s\S]))/m.exec(normalized);
    if (!match) throw new Error('Missing changelog heading: ## [Unreleased]');
    body = `## Unreleased\n\n${match[1].trim() || 'No unreleased changes.'}`;
  }
  return `---\nid: whats-new\ntitle: What's New\nslug: /whats-new\nmdx:\n  format: md\n---\n\n${body}\n`;
}

export async function fetchChangelog({fetchSource = fetch, wait = delay} = {}) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetchSource(changelogUrl, {signal: AbortSignal.timeout(20_000)});
      if (!response.ok) throw new Error(`FScript changelog request failed: HTTP ${response.status}`);
      const text = await response.text();
      // Reject HTML error pages or unexpected upstream formats before publishing.
      whatsNew(text);
      return text;
    } catch (error) {
      if (attempt === 2) throw error;
      await wait(2_000 * (attempt + 1));
    }
  }
}

async function sidebar(file) {
  const js = ts.transpileModule(readFileSync(file, 'utf8'), {
    compilerOptions: {module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022},
  }).outputText;
  return (await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`)).default;
}

export async function assembleDocs({directory = root, changelog, runtimeVersion} = {}) {
  const stable = JSON.parse(readFileSync(path.join(directory, 'docs/stable.json'), 'utf8'));
  const manifest = {
    upstream: {repository: 'FScriptLang/FScript', ref: 'main', changelogUrl,
      sha256: createHash('sha256').update(changelog).digest('hex')},
    runtime: {package: '@magnusopera/fscript', version: runtimeVersion},
    next: {directory: 'docs/next'},
    stable: [{version: 'stable', tag: stable.tag, directory: 'docs/stable'}],
  };
  // Validate both editions before replacing generated outputs.
  const editions = await Promise.all(['next', 'stable'].map(async (edition) => ({
    edition,
    notes: whatsNew(changelog, edition === 'stable' ? stable.tag : undefined),
    sidebar: await sidebar(path.join(directory, `sidebars.${edition}.ts`)),
  })));
  for (const name of ['.generated', 'versioned_docs', 'versioned_sidebars']) {
    rmSync(path.join(directory, name), {recursive: true, force: true});
  }
  for (const {edition, notes, sidebar: items} of editions) {
    const destination = edition === 'next' ? '.generated/next' : 'versioned_docs/version-stable';
    cpSync(path.join(directory, `docs/${edition}`), path.join(directory, destination), {recursive: true});
    writeFileSync(path.join(directory, destination, 'whats-new.md'), notes);
    const sidebarFile = edition === 'next' ? '.generated/sidebars.json' : 'versioned_sidebars/version-stable-sidebars.json';
    mkdirSync(path.dirname(path.join(directory, sidebarFile)), {recursive: true});
    writeFileSync(path.join(directory, sidebarFile), `${JSON.stringify(items, null, 2)}\n`);
  }
  mkdirSync(path.join(directory, '.generated/static'), {recursive: true});
  writeFileSync(path.join(directory, '.generated/changelog.md'), changelog);
  writeFileSync(path.join(directory, '.generated/static/website-sources.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  writeFileSync(path.join(directory, 'versions.json'), '["stable"]\n');
  return manifest;
}

export async function prepareDocs() {
  const changelog = process.env.FSCRIPT_CHANGELOG_FILE
    ? readFileSync(process.env.FSCRIPT_CHANGELOG_FILE, 'utf8')
    : await fetchChangelog();
  const runtime = JSON.parse(readFileSync(path.join(root, 'node_modules/@magnusopera/fscript/package.json'), 'utf8'));
  const manifest = await assembleDocs({changelog, runtimeVersion: runtime.version});
  console.log(`Prepared Stable (${manifest.stable[0].tag}) and Next; playground uses npm v${runtime.version}.`);
  return manifest;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await prepareDocs();
}
