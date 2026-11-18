import {spawn} from 'node:child_process';
import {watch} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {assembleDocs, root} from './assemble-docs.mjs';
import {readFileSync} from 'node:fs';

// Keep the fetched changelog fixed during local edits. Restart to refresh it.
// Changes to either locally owned manual regenerate Docusaurus's snapshots.
let pending = Promise.resolve();
let timer;
const changelog = readFileSync(process.env.FSCRIPT_CHANGELOG_FILE ?? path.join(root, '.generated/changelog.md'), 'utf8');
const runtimeVersion = JSON.parse(readFileSync(path.join(root, '.generated/static/website-sources.json'), 'utf8')).runtime.version;
const schedule = () => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    pending = pending.then(() => assembleDocs({changelog, runtimeVersion}))
      .catch((error) => console.error('Could not refresh documentation:', error));
  }, 100);
};
const watchers = [watch(path.join(root, 'docs'), {recursive: true}, schedule),
  watch(root, (_, name) => {if (/^sidebars\.(next|stable)\.ts$/.test(String(name))) schedule();})];
const server = spawn(process.execPath, [fileURLToPath(new URL('../node_modules/@docusaurus/core/bin/docusaurus.mjs', import.meta.url)),
  'start', ...process.argv.slice(2)], {stdio: 'inherit'});
const stop = () => {clearTimeout(timer); watchers.forEach((watcher) => watcher.close());};
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => {stop(); server.kill(signal);});
server.on('error', (error) => {stop(); console.error(error); process.exitCode = 1;});
server.on('exit', (code) => {stop(); process.exitCode = code ?? 1;});
