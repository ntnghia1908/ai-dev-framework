import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const KIT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const CHECKER = path.join(KIT, 'scripts', 'framework-check.mjs');

const created = [];
after(() => { for (const d of created) fs.rmSync(d, { recursive: true, force: true }); });

function copyDir(src, dest) {
  fs.cpSync(src, dest, { recursive: true });
}

// Build a minimal valid project from core/ + templates/ + adapters, FILL markers replaced.
function makeProject({ adapters = ['claude-code'] } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fwkit-'));
  created.push(dir);
  copyDir(path.join(KIT, 'core'), dir);
  copyDir(path.join(KIT, 'templates'), dir);
  for (const a of adapters) {
    const src = path.join(KIT, 'adapters', a);
    copyDir(src, path.join(dir, 'adapters', a));
    if (a === 'claude-code') copyDir(path.join(src, '.claude'), path.join(dir, '.claude'));
    if (a === 'copilot') copyDir(path.join(src, '.github'), path.join(dir, '.github'));
  }
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith('.md')) {
        fs.writeFileSync(p, fs.readFileSync(p, 'utf8').replace(/<!--\s*FILL:[\s\S]*?-->/g, 'filled'));
      }
    }
  };
  walk(dir);
  const cfg = JSON.parse(fs.readFileSync(path.join(dir, 'framework.config.json'), 'utf8'));
  cfg.adapters = adapters;
  cfg.agents = {};
  if (adapters.includes('chatgpt')) cfg.agents.product = 'chatgpt';
  if (adapters.includes('claude-code')) cfg.agents.orchestrator = 'claude-code';
  fs.writeFileSync(path.join(dir, 'framework.config.json'), JSON.stringify(cfg, null, 2));
  return dir;
}

function run(dir) {
  const r = spawnSync(process.execPath, [CHECKER, '--root', dir], { encoding: 'utf8' });
  return { code: r.status, out: r.stdout };
}

function edit(dir, rel, fn) {
  const p = path.join(dir, rel);
  fs.writeFileSync(p, fn(fs.readFileSync(p, 'utf8')));
}

function expectFail(dir, needle) {
  const { code, out } = run(dir);
  assert.equal(code, 1, out);
  assert.match(out, needle);
  assert.match(out, /^FAIL: /m);
}

const validTask = `# Task: T

## Status / Approval

- Status: IN_PROGRESS
- Type: CHANGE
- Change class: S1
- Owner: HUMAN LEAD
- Execution profile: dual-agent
- Implementer: claude-code
- Authorization mode: boundary
- Authorization source: ADR-TEST / Architecture Approval
- Parallel group: P1
- Owned paths: src/a
- Dependencies: none
- Implementation authorized: YES

## Goal

x

## Scope

x

## Acceptance Criteria

1. x

## Required verification

- x
`;

test('minimal project passes', () => {
  const dir = makeProject();
  const { code, out } = run(dir);
  assert.equal(code, 0, out);
  assert.match(out, /PASS: framework structure/);
  assert.match(out, /PASS: docs\/ai\/workflow\.md/);
});

test('chatgpt plus claude role bindings pass', () => {
  const dir = makeProject({ adapters: ['chatgpt', 'claude-code'] });
  const { code, out } = run(dir);
  assert.equal(code, 0, out);
  assert.match(out, /PASS: adapter descriptor adapters\/chatgpt\/adapter\.json/);
});

test('minimal project with both adapters passes', () => {
  const dir = makeProject({ adapters: ['claude-code', 'copilot'] });
  const { code, out } = run(dir);
  assert.equal(code, 0, out);
  assert.match(out, /PASS: \.github\/agents\/implementer\.agent\.md/);
});

test('codex adapter enabled passes without extra files', () => {
  const dir = makeProject({ adapters: ['claude-code', 'copilot', 'codex'] });
  const { code, out } = run(dir);
  assert.equal(code, 0, out);
});

test('codex adapter alone passes', () => {
  const dir = makeProject({ adapters: ['codex'] });
  const { code, out } = run(dir);
  assert.equal(code, 0, out);
});

test('missing required file fails', () => {
  const dir = makeProject();
  fs.rmSync(path.join(dir, 'docs/ai/project-profile.md'));
  expectFail(dir, /missing required file: docs\/ai\/project-profile\.md/);
});

test('wrong Status fails', () => {
  const dir = makeProject();
  edit(dir, 'docs/ai/workflow.md', (s) => s.replace('| Status | CURRENT |', '| Status | DRAFT |'));
  expectFail(dir, /workflow\.md must be CURRENT/);
});

test('current-state wrong Status fails', () => {
  const dir = makeProject();
  edit(dir, 'docs/workflow/current-state.md', (s) => s.replace('OPERATIONAL STATE — NOT AUTHORITY', 'CURRENT'));
  expectFail(dir, /current-state\.md has wrong operational status/);
});

test('Version not in history fails', () => {
  const dir = makeProject();
  edit(dir, 'docs/ai/framework-history.md', (s) => s.replace('## v4.4', '## v4.2'));
  expectFail(dir, /framework-history\.md missing entry for workflow Version 4\.3/);
});

test('Version differs from config fails', () => {
  const dir = makeProject();
  edit(dir, 'framework.config.json', (s) => s.replace('"4.4"', '"4.2"'));
  expectFail(dir, /does not match framework\.config\.json/);
});

test('task missing field fails', () => {
  const dir = makeProject();
  fs.writeFileSync(path.join(dir, 'docs/tasks/T1.md'), validTask.replace('- Owner: HUMAN LEAD\n', ''));
  expectFail(dir, /docs\/tasks\/T1\.md: missing field: Owner/);
});

test('task invalid value and missing section fail', () => {
  const dir = makeProject();
  fs.writeFileSync(path.join(dir, 'docs/tasks/T1.md'), validTask.replace('S1', 'S9').replace('## Goal', '## Aim'));
  const { code, out } = run(dir);
  assert.equal(code, 1);
  assert.match(out, /invalid Change class: S9/);
  assert.match(out, /missing section: Goal/);
});

test('valid boundary task is reported', () => {
  const dir = makeProject();
  fs.writeFileSync(path.join(dir, 'docs/tasks/T1.md'), validTask);
  const { code, out } = run(dir);
  assert.equal(code, 0, out);
  assert.match(out, /PASS: task contract docs\/tasks\/T1\.md/);
});

test('legacy task-approval mode remains supported', () => {
  const dir = makeProject();
  edit(dir, 'framework.config.json', s => s.replace('"taskAuthorization": "boundary"', '"taskAuthorization": "task"'));
  const task = validTask
    .replace('- Status: IN_PROGRESS', '- Status: APPROVED')
    .replace('- Authorization mode: boundary', '- Authorization mode: task')
    .replace('- Authorization source: ADR-TEST / Architecture Approval', '- Authorization source: APPROVED TASK')
    .replace('- Implementation authorized: YES', '- Implementation authorized: YES');
  fs.writeFileSync(path.join(dir, 'docs/tasks/T1.md'), task);
  const { code, out } = run(dir);
  assert.equal(code, 0, out);
});

test('missing taskDir / decisionDir is skipped', () => {
  const dir = makeProject();
  edit(dir, 'framework.config.json', (s) => s.replace('"docs/decisions"', '"nope/decisions"').replace('"docs/tasks"', '"nope/tasks"'));
  const { code, out } = run(dir);
  assert.equal(code, 0, out);
});

test('boundary governance config passes', () => {
  const dir = makeProject();
  const cfg = JSON.parse(fs.readFileSync(path.join(dir, 'framework.config.json'), 'utf8'));
  assert.deepEqual(cfg.governance, { taskAuthorization: 'boundary', maxParallelImplementers: 3 });
  assert.equal(run(dir).code, 0);
});

test('invalid governance config fails', () => {
  const dir = makeProject();
  edit(dir, 'framework.config.json', (s) => s.replace('"maxParallelImplementers": 3', '"maxParallelImplementers": 4'));
  expectFail(dir, /maxParallelImplementers must be an integer from 1 to 3/);
});

test('boundary task requires authorization source', () => {
  const dir = makeProject();
  const task = validTask.replace('- Status: APPROVED', '- Status: IN_PROGRESS').replace('- Implementation authorized: YES', '- Authorization mode: boundary\n- Authorization source: <missing>\n- Implementation authorized: YES');
  fs.writeFileSync(path.join(dir, 'docs/tasks/T1.md'), task);
  expectFail(dir, /boundary authorization requires Authorization source/);
});

test('valid boundary-authorized task passes', () => {
  const dir = makeProject();
  const task = validTask.replace('- Status: APPROVED', '- Status: IN_PROGRESS').replace('- Implementation authorized: YES', '- Authorization mode: boundary\n- Authorization source: ADR-TEST / Architecture Approval\n- Parallel group: P1\n- Owned paths: src/a\n- Dependencies: none\n- Implementation authorized: YES');
  fs.writeFileSync(path.join(dir, 'docs/tasks/T1.md'), task);
  assert.equal(run(dir).code, 0);
});

test('decision record with bad Status fails', () => {
  const dir = makeProject();
  fs.mkdirSync(path.join(dir, 'docs/decisions'));
  fs.writeFileSync(path.join(dir, 'docs/decisions/D1.md'), '# D\n\n| Metadata | Value |\n|---|---|\n| Status | MAYBE |\n');
  expectFail(dir, /docs\/decisions\/D1\.md: invalid Status: MAYBE/);
});

test('unfilled FILL marker fails at the right file', () => {
  const dir = makeProject();
  edit(dir, 'docs/ai/project-profile.md', (s) => `${s}\n<!-- FILL: still here -->\n`);
  expectFail(dir, /docs\/ai\/project-profile\.md: unfilled template marker/);
});

test('placeholders in task template are not FILL markers', () => {
  const dir = makeProject();
  const { code, out } = run(dir);
  assert.equal(code, 0, out);
});

test('config missing fails', () => {
  const dir = makeProject();
  fs.rmSync(path.join(dir, 'framework.config.json'));
  expectFail(dir, /missing framework\.config\.json/);
});

test('config invalid JSON fails', () => {
  const dir = makeProject();
  fs.writeFileSync(path.join(dir, 'framework.config.json'), '{ nope');
  expectFail(dir, /invalid JSON/);
});

test('config wrong types fail', () => {
  const dir = makeProject();
  fs.writeFileSync(path.join(dir, 'framework.config.json'), JSON.stringify({
    frameworkVersion: 4.2, adapters: 'claude-code', requiredFiles: 'x', requiredTokens: { a: 'b' }, taskDir: 3,
  }));
  const { code, out } = run(dir);
  assert.equal(code, 1);
  for (const re of [/frameworkVersion must be/, /adapters must be/, /requiredFiles must be/, /requiredTokens must be/, /taskDir must be/]) assert.match(out, re);
});

test('unknown adapter fails', () => {
  const dir = makeProject();
  edit(dir, 'framework.config.json', (s) => s.replace('"claude-code"', '"vim"'));
  expectFail(dir, /unknown adapter: vim/);
});

test('role binding to disabled adapter fails', () => {
  const dir = makeProject();
  edit(dir, 'framework.config.json', (s) => s.replace('"orchestrator": "claude-code"', '"orchestrator": "chatgpt"'));
  expectFail(dir, /agents\.orchestrator references disabled adapter: chatgpt/);
});

test('role binding to unsupported adapter role fails', () => {
  const dir = makeProject({ adapters: ['claude-code', 'codex'] });
  edit(dir, 'framework.config.json', (s) => s.replace('"orchestrator": "claude-code"', '"orchestrator": "codex"'));
  expectFail(dir, /agents\.orchestrator adapter codex does not support role orchestrator/);
});

test('invalid adapter descriptor fails', () => {
  const dir = makeProject();
  edit(dir, 'adapters/claude-code/adapter.json', (s) => s.replace('"roles": ["orchestrator", "implementer"]', '"roles": ["reviewer"]'));
  expectFail(dir, /adapter\.json: unknown role: reviewer/);
});

test('dual-agent task with disabled implementer fails', () => {
  const dir = makeProject();
  fs.writeFileSync(path.join(dir, 'docs/tasks/T1.md'), validTask.replace('- Implementer: claude-code', '- Implementer: copilot'));
  expectFail(dir, /Implementer copilot is not an enabled adapter/);
});

test('claude-code adapter enabled but file missing fails', () => {
  const dir = makeProject();
  fs.rmSync(path.join(dir, '.claude/agents/implementer.md'));
  expectFail(dir, /missing required file: \.claude\/agents\/implementer\.md/);
});

test('copilot adapter enabled but file missing fails', () => {
  const dir = makeProject({ adapters: ['claude-code', 'copilot'] });
  fs.rmSync(path.join(dir, '.github/agents/implementer.agent.md'));
  expectFail(dir, /missing required file: \.github\/agents\/implementer\.agent\.md/);
});

test('adapter not enabled: its files are not required', () => {
  const dir = makeProject();
  assert.equal(fs.existsSync(path.join(dir, '.github')), false);
  assert.equal(run(dir).code, 0);
});

test('CLAUDE.md not a bridge fails', () => {
  const dir = makeProject();
  fs.writeFileSync(path.join(dir, 'CLAUDE.md'), '# my own rules\n');
  expectFail(dir, /CLAUDE\.md must be a minimal AGENTS\.md bridge/);
});

test('execution.md without current-state import fails', () => {
  const dir = makeProject();
  edit(dir, '.claude/rules/execution.md', (s) => s.replace('@../../docs/workflow/current-state.md', ''));
  expectFail(dir, /execution\.md must import current-state\.md/);
});

test('requiredFiles missing fails; present passes', () => {
  const dir = makeProject();
  edit(dir, 'framework.config.json', (s) => s.replace('"requiredFiles": []', '"requiredFiles": ["extra-doc.md"]'));
  expectFail(dir, /missing required file: extra-doc\.md/);
  fs.writeFileSync(path.join(dir, "extra-doc.md"), "# hi\n");
  assert.equal(run(dir).code, 0);
});

test('requiredTokens missing fails; present passes', () => {
  const dir = makeProject();
  edit(dir, 'framework.config.json', (s) => s.replace('"requiredTokens": {}', '"requiredTokens": {"docs/ai/project-profile.md": ["magic-token"]}'));
  expectFail(dir, /project-profile\.md: missing required token: magic-token/);
  edit(dir, 'docs/ai/project-profile.md', (s) => `${s}\nmagic-token\n`);
  assert.equal(run(dir).code, 0);
});

test('adoption record missing section fails', () => {
  const dir = makeProject();
  edit(dir, 'FRAMEWORK_ADOPTION.md', (s) => s.replace('## Not adopted', '## Skipped'));
  expectFail(dir, /FRAMEWORK_ADOPTION\.md missing section: Not adopted/);
});
