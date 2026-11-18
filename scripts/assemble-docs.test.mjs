import assert from 'node:assert/strict';
import {mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {test} from 'node:test';
import {assembleDocs, fetchChangelog, whatsNew} from './assemble-docs.mjs';
import {prepareRuntime} from './prepare-runtime.mjs';

const changelog = `# Changelog

## [Unreleased]

- Upcoming Process.exec and FScript.exec.

## [0.95]

### [v0.95.0]

- Future release preparation.

**Full Changelog**: https://github.com/MagnusOpera/FScript/compare/0.94.3...v0.95.0

## [0.94]

### [0.94.3]

- Website publication.

**Full Changelog**: https://github.com/MagnusOpera/FScript/compare/0.94.2...0.94.3

### [0.94.2]

- Previous fix.

**Full Changelog**: https://github.com/MagnusOpera/FScript/compare/0.94.1...0.94.2
`;

test('Stable preserves historical notes and actual compare refs, excluding newer releases and Unreleased', () => {
  const stable = whatsNew(changelog, 'v0.94.3');
  assert.match(stable, /### v0\.94\.3/);
  assert.match(stable, /### v0\.94\.2/);
  assert.match(stable, /compare\/0\.94\.2\.\.\.0\.94\.3/);
  assert.doesNotMatch(stable, /Unreleased|Process.exec|Future release|v0\.95\.0/);
  assert.match(whatsNew(changelog, 'v0.95.0'), /Future release preparation/);
});

test('Next includes only Unreleased, including empty sections', () => {
  assert.match(whatsNew(changelog), /Upcoming Process.exec and FScript.exec/);
  assert.doesNotMatch(whatsNew(changelog), /Website publication|Previous fix|Future release/);
  assert.match(whatsNew(changelog.replace('- Upcoming Process.exec and FScript.exec.', '')), /No unreleased changes/);
});

test('Missing or malformed changelog input fails instead of publishing incomplete notes', () => {
  assert.throws(() => whatsNew('<html>oops</html>'), /Missing changelog/);
  assert.throws(() => whatsNew(changelog, '0.94.3'), /canonical/);
  assert.throws(() => whatsNew(changelog, 'v0.94.4'), /Missing release notes/);
  assert.throws(() => whatsNew(changelog.replace('**Full Changelog**:', 'Compare:'), 'v0.95.0'), /compare link/);
});

test('Assembly uses locally owned Stable and Next without overwriting either source', async (t) => {
  const directory = mkdtempSync(path.join(os.tmpdir(), 'fscript-website-'));
  t.after(() => rmSync(directory, {recursive: true, force: true}));
  for (const edition of ['next', 'stable']) {
    mkdirSync(path.join(directory, `docs/${edition}`), {recursive: true});
    writeFileSync(path.join(directory, `docs/${edition}/intro.md`), `${edition} tutorial`);
    writeFileSync(path.join(directory, `sidebars.${edition}.ts`), "export default {docs: ['intro', 'whats-new']};");
  }
  writeFileSync(path.join(directory, 'docs/stable.json'), JSON.stringify({tag: 'v0.94.3'}));
  const first = await assembleDocs({directory, changelog, runtimeVersion: '0.95.1'});
  assert.equal(first.runtime.version, '0.95.1');
  assert.equal(first.stable[0].tag, 'v0.94.3');
  const read = (file) => readFileSync(path.join(directory, file), 'utf8');
  assert.equal(read('.generated/next/intro.md'), 'next tutorial');
  assert.equal(read('versioned_docs/version-stable/intro.md'), 'stable tutorial');
  assert.doesNotMatch(read('versioned_docs/version-stable/whats-new.md'), /Process.exec/);
  assert.match(read('.generated/next/whats-new.md'), /Process.exec/);
  writeFileSync(path.join(directory, 'docs/stable/intro.md'), 'Independent stable correction');
  await assembleDocs({directory, changelog, runtimeVersion: '0.95.1'});
  assert.equal(read('versioned_docs/version-stable/intro.md'), 'Independent stable correction');
  assert.equal(read('docs/next/intro.md'), 'next tutorial');
  assert.equal(read('.generated/changelog.md'), changelog);
});

test('Upstream fetch retries transient failures and fails closed after bounded attempts', async () => {
  let requests = 0;
  const text = await fetchChangelog({wait: async () => {}, fetchSource: async () => {
    requests++;
    return requests === 1 ? new Response('Unavailable', {status: 503}) : new Response(changelog);
  }});
  assert.equal(requests, 2);
  assert.equal(text, changelog);
  requests = 0;
  await assert.rejects(fetchChangelog({wait: async () => {}, fetchSource: async () => {
    requests++;
    return new Response('Not found', {status: 404});
  }}), /HTTP 404/);
  assert.equal(requests, 3);
});

test('Runtime refresh selects npm latest without modifying dependency manifests and retries failures', async () => {
  let calls = 0;
  await prepareRuntime({wait: async () => {}, run: (command, args) => {
    assert.equal(command, 'npm');
    assert.ok(args.includes('@magnusopera/fscript@latest'));
    assert.ok(args.includes('--no-save'));
    assert.ok(!args.includes('--package-lock=false'), 'Respect the existing lock for unrelated dependencies');
    assert.ok(args.includes('--ignore-scripts'));
    if (++calls === 1) throw new Error('Registry unavailable');
  }});
  assert.equal(calls, 2);
  calls = 0;
  await assert.rejects(prepareRuntime({wait: async () => {}, run: () => {calls++; throw new Error('Unavailable');}}), /Unavailable/);
  assert.equal(calls, 3);
});
