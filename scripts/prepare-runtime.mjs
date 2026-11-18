import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {setTimeout as delay} from 'node:timers/promises';

// npm ci installs the locked dependency tree. Refresh only the interpreter for
// deployment, without rewriting package.json or the committed dependency lock.
export async function prepareRuntime({run = execFileSync, wait = delay} = {}) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      run('npm', ['install', '--no-save', '--ignore-scripts',
        '--no-audit', '--no-fund', '--prefer-online', '@magnusopera/fscript@latest'], {
        cwd: fileURLToPath(new URL('../', import.meta.url)), stdio: 'inherit', timeout: 60_000,
      });
      return;
    } catch (error) {
      if (attempt === 2) throw error;
      await wait(2_000 * (attempt + 1));
    }
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await prepareRuntime();
}
