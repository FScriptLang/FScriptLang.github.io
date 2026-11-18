import assert from 'node:assert/strict';
import {test} from 'node:test';
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
