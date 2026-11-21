import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import * as fscript from '@magnusopera/fscript';

test('Published npm runtime evaluates the playground Values example', () => {
  const result = fscript.run('let add x y = x + y\nlet numbers = [1; 2; 3; 4]\nlet total = List.fold add 0 numbers\ntotal');
  assert.equal(fscript.formatValue(result), '10');
});

test('Published npm runtime resolves imports and retains interactive declarations', () => {
  const options = {rootDirectory: '/', entryFile: '/main.fss', sources: {'/shared.fss': 'let inc x = x + 1'}};
  assert.equal(fscript.formatValue(fscript.run('import "shared.fss" as Shared\nexport let answer = Shared.inc 41\nanswer', options)), '42');
  const session = fscript.createSession(options);
  assert.equal(fscript.submit(session, 'let twice x = x * 2').hasValue, false);
  assert.equal(fscript.submit(session, 'twice 21').text, '42');
  fscript.resetSession(session);
  assert.throws(() => fscript.submit(session, 'twice 21'));
});

test('The newcomer script runs as documented and catches the suggested type mistake', () => {
  const tutorial = readFileSync(new URL('../docs/next/learn/first-script.md', import.meta.url), 'utf8');
  const source = /```fsharp\n([\s\S]*?)\n```/.exec(tutorial)?.[1];
  assert.ok(source, 'The first-script tutorial provides a runnable example');
  assert.equal(fscript.formatValue(fscript.run(source)), '228');
  assert.equal(fscript.formatValue(fscript.run(source.replace('quote 12', 'quote 3'))), '87');
  assert.equal(fscript.formatValue(fscript.run(source.replace('seats >= 10', 'seats >= 20'))), '348');
  assert.throws(() => fscript.run(source.replace('quote 12', 'quote "twelve"')));
});

test('The language tour examples evaluate independently, including the two-file program', () => {
  const tutorial = readFileSync(new URL('../docs/next/learn/language-tour.md', import.meta.url), 'utf8');
  const snippets = [...tutorial.matchAll(/```fsharp\n([\s\S]*?)\n```/g)].map((match) => match[1]);
  const expected = ['"Total: 228"', '[7;9;11]', '"Answer: 4"', '(20, "team", 12, Some 19)', '"Total: 228"', '(Some 42, "Ada")'];
  assert.equal(snippets.length, 8, 'Six single-file examples and a two-file program are present');
  for (const [index, value] of expected.entries()) {
    assert.equal(fscript.formatValue(fscript.run(snippets[index])), value, `Tour example ${index + 1}`);
  }
  const options = {rootDirectory: '/', entryFile: '/main.fss', sources: {'/prices.fss': snippets[6]}};
  assert.equal(fscript.formatValue(fscript.run(snippets[7], options)), '228');
});
