import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import yaml from 'js-yaml';

test('Only a successful main build can deploy, using the built-in Pages token', () => {
  const workflow = yaml.load(readFileSync(new URL('../.github/workflows/website.yml', import.meta.url), 'utf8'));
  assert.ok(workflow.on.pull_request !== undefined || Object.hasOwn(workflow.on, 'pull_request'));
  assert.ok(Object.hasOwn(workflow.on, 'workflow_dispatch'));
  assert.ok(workflow.on.schedule.length > 0);
  assert.match(workflow.jobs.deploy.if, /github.event_name != 'pull_request'/);
  assert.match(workflow.jobs.deploy.if, /github.ref == 'refs\/heads\/main'/);
  assert.equal(workflow.jobs.deploy.needs, 'build');
  assert.deepEqual(workflow.jobs.deploy.permissions, {'pages': 'write', 'id-token': 'write'});
  const steps = workflow.jobs.build.steps;
  const build = steps.findIndex((step) => step.run === 'npm run build');
  const testRuntime = steps.findIndex((step) => step.run === 'npm test');
  assert.ok(build >= 0 && testRuntime > build, 'Tests must exercise the refreshed runtime before deployment');
  assert.ok(steps.some((step) => step.run === 'npm run typecheck'));
  assert.doesNotMatch(JSON.stringify(workflow), /secrets\.|setup-dotnet|MagnusOpera\/FScript/);
});
