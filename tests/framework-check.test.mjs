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
// orchestrator: undefined keeps the legacy auto-binding (claude-code when enabled);
// null requests NO agents.orchestrator binding; a string sets that binding explicitly.
function makeProject({ adapters = ['claude-code'], orchestrator } = {}) {
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
  if (orchestrator === null) delete cfg.agents.orchestrator;
  else if (orchestrator) cfg.agents.orchestrator = orchestrator;
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
  expectFail(dir, /framework-history\.md missing entry for workflow Version 4\.4/);
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
  const task = validTask.replace('- Authorization source: ADR-TEST / Architecture Approval\n', '');
  fs.writeFileSync(path.join(dir, 'docs/tasks/T1.md'), task);
  expectFail(dir, /boundary authorization requires Authorization source/);
});

test('valid boundary-authorized task passes', () => {
  const dir = makeProject();
  fs.writeFileSync(path.join(dir, 'docs/tasks/T1.md'), validTask);
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

test('template config has ADR-003 new-project defaults', () => {
  const cfg = JSON.parse(fs.readFileSync(path.join(KIT, 'templates', 'framework.config.json'), 'utf8'));
  assert.equal(cfg.frameworkVersion, '4.4');
  assert.deepEqual(cfg.adapters, ['chatgpt', 'claude-code', 'codex']);
  assert.deepEqual(cfg.agents, { product: 'chatgpt' });
  assert.deepEqual(cfg.governance, { taskAuthorization: 'boundary', maxParallelImplementers: 3 });
  assert.deepEqual(cfg.requiredFiles, []);
  assert.deepEqual(cfg.requiredTokens, {});
  assert.equal(cfg.taskDir, 'docs/tasks');
  assert.equal(cfg.decisionDir, 'docs/decisions');
});

test('new-project default: three adapters, product-only binding, boundary/3 passes', () => {
  const dir = makeProject({ adapters: ['chatgpt', 'claude-code', 'codex'], orchestrator: null });
  const cfg = JSON.parse(fs.readFileSync(path.join(dir, 'framework.config.json'), 'utf8'));
  assert.deepEqual(cfg.adapters, ['chatgpt', 'claude-code', 'codex']);
  assert.deepEqual(cfg.agents, { product: 'chatgpt' });
  assert.equal('orchestrator' in cfg.agents, false);
  assert.deepEqual(cfg.governance, { taskAuthorization: 'boundary', maxParallelImplementers: 3 });
  fs.writeFileSync(path.join(dir, 'docs/tasks/T1.md'), validTask);
  const { code, out } = run(dir);
  assert.equal(code, 0, out);
  assert.doesNotMatch(out, /unfilled template marker/);
  assert.match(out, /PASS: adapter descriptor adapters\/codex\/adapter\.json/);
});

test('no-binding fixture does not auto-insert a Claude orchestrator', () => {
  const dir = makeProject({ adapters: ['claude-code'], orchestrator: null });
  const cfg = JSON.parse(fs.readFileSync(path.join(dir, 'framework.config.json'), 'utf8'));
  assert.deepEqual(cfg.agents, {});
  assert.equal(run(dir).code, 0);
});

test('legacy fixed claude-code binding with task governance passes unchanged', () => {
  const dir = makeProject({ adapters: ['chatgpt', 'claude-code'], orchestrator: 'claude-code' });
  edit(dir, 'framework.config.json', s => s.replace('"taskAuthorization": "boundary"', '"taskAuthorization": "task"'));
  const cfg = JSON.parse(fs.readFileSync(path.join(dir, 'framework.config.json'), 'utf8'));
  assert.equal(cfg.agents.orchestrator, 'claude-code');
  assert.equal(cfg.governance.taskAuthorization, 'task');
  const task = validTask
    .replace('- Status: IN_PROGRESS', '- Status: APPROVED')
    .replace('- Authorization mode: boundary', '- Authorization mode: task')
    .replace('- Authorization source: ADR-TEST / Architecture Approval', '- Authorization source: APPROVED TASK');
  fs.writeFileSync(path.join(dir, 'docs/tasks/T1.md'), task);
  const { code, out } = run(dir);
  assert.equal(code, 0, out);
  assert.match(out, /PASS: task contract docs\/tasks\/T1\.md/);
});

test('legacy fixed claude-code binding with boundary/3 passes unchanged', () => {
  const dir = makeProject({ adapters: ['chatgpt', 'claude-code'], orchestrator: 'claude-code' });
  const cfg = JSON.parse(fs.readFileSync(path.join(dir, 'framework.config.json'), 'utf8'));
  assert.equal(cfg.agents.orchestrator, 'claude-code');
  assert.deepEqual(cfg.governance, { taskAuthorization: 'boundary', maxParallelImplementers: 3 });
  fs.writeFileSync(path.join(dir, 'docs/tasks/T1.md'), validTask);
  const { code, out } = run(dir);
  assert.equal(code, 0, out);
});

test('optional Orchestrator field and Handoff section in a task are accepted', () => {
  const dir = makeProject({ adapters: ['chatgpt', 'claude-code', 'codex'], orchestrator: null });
  const task = validTask.replace('- Implementer: claude-code', '- Orchestrator: codex\n- Implementer: codex')
    + '\n## Handoff\n\n- Outgoing / incoming ORCHESTRATOR: codex / claude-code\n';
  fs.writeFileSync(path.join(dir, 'docs/tasks/T1.md'), task);
  const { code, out } = run(dir);
  assert.equal(code, 0, out);
});

test('no-binding project: role binding to an adapter lacking the role still fails', () => {
  const dir = makeProject({ adapters: ['chatgpt', 'claude-code', 'codex', 'copilot'], orchestrator: null });
  assert.equal(run(dir).code, 0);
  edit(dir, 'framework.config.json', s => s.replace('"product": "chatgpt"', '"product": "chatgpt", "orchestrator": "copilot"'));
  expectFail(dir, /agents\.orchestrator adapter copilot does not support role orchestrator/);
});

test('no-binding project: binding to a disabled adapter fails', () => {
  const dir = makeProject({ adapters: ['chatgpt', 'claude-code'], orchestrator: null });
  edit(dir, 'framework.config.json', s => s.replace('"product": "chatgpt"', '"product": "chatgpt", "orchestrator": "codex"'));
  expectFail(dir, /agents\.orchestrator references disabled adapter: codex/);
});

test('codex orchestrator binding passes and keeps implementer role', () => {
  const dir = makeProject({ adapters: ['codex', 'claude-code'], orchestrator: 'codex' });
  const cfg = JSON.parse(fs.readFileSync(path.join(dir, 'framework.config.json'), 'utf8'));
  assert.equal(cfg.agents.orchestrator, 'codex');
  const desc = JSON.parse(fs.readFileSync(path.join(dir, 'adapters/codex/adapter.json'), 'utf8'));
  assert.deepEqual(desc.roles, ['orchestrator', 'implementer']);
  fs.writeFileSync(path.join(dir, 'docs/tasks/T1.md'), validTask.replace('- Implementer: claude-code', '- Implementer: codex'));
  const { code, out } = run(dir);
  assert.equal(code, 0, out);
  assert.match(out, /PASS: adapter descriptor adapters\/codex\/adapter\.json/);
  assert.match(out, /PASS: task contract docs\/tasks\/T1\.md/);
});

test('role binding to unsupported adapter role fails', () => {
  const dir = makeProject({ adapters: ['claude-code', 'copilot'] });
  edit(dir, 'framework.config.json', (s) => s.replace('"orchestrator": "claude-code"', '"orchestrator": "copilot"'));
  expectFail(dir, /agents\.orchestrator adapter copilot does not support role orchestrator/);
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

test('token rules have workflow owners and adapter/template pointers', () => {
  const workflow = fs.readFileSync(path.join(KIT, 'core/docs/ai/workflow.md'), 'utf8');
  const section = n => workflow.split(new RegExp(`^## ${n}\\. `, 'm'))[1]?.split(/^## /m)[0] ?? '';
  assert.match(section(4), /Phải giữ nguyên/);
  assert.match(section(5), /5 phút/);
  assert.match(section(5), /chi phí trên mỗi task merge/);
  assert.match(section(9), /250k token/);
  assert.match(section(9), /project-profile\.md/);
  assert.match(section(9), /Không resume[\s\S]*1 giờ/);
  assert.match(section(10), /^Ngân sách context/);
  for (const token of ['AGENTS.md', 'rules adapter', '1,5k token', 'grep / script nhỏ', 'scripts/token-audit.py', 'cost per merged task']) {
    assert.ok(section(10).includes(token), `§10 missing ${token}`);
  }
  for (const rel of ['agents/implementer.md', 'rules/execution.md']) {
    const adapter = fs.readFileSync(path.join(KIT, 'adapters/claude-code/.claude', rel), 'utf8');
    assert.match(adapter, /docs\/ai\/workflow\.md`? §5 \(Claude Code subagent: (?:\*\*)?5 phút/);
  }
  const state = fs.readFileSync(path.join(KIT, 'templates/docs/workflow/current-state.md'), 'utf8');
  assert.match(state, /Ngân sách token.*docs\/ai\/workflow\.md` §10/);
});

test('code growth rules have workflow owners and adapter/template pointers', () => {
  const workflow = fs.readFileSync(path.join(KIT, 'core/docs/ai/workflow.md'), 'utf8');
  const section = n => workflow.split(new RegExp(`^## ${n}\\. `, 'm'))[1]?.split(/^## /m)[0] ?? '';
  assert.match(section(4), /Code bị thay \/ xóa/);
  assert.match(section(5), /Tái dùng trước khi viết/);
  for (const token of ['AC → test', '3 hàm test / AC', 'parametrize', 'thêm / xóa', 'không thêm dependency']) {
    assert.ok(section(7).includes(token), `§7 missing ${token}`);
  }
  const template = fs.readFileSync(path.join(KIT, 'templates/docs/tasks/_template.md'), 'utf8');
  for (const heading of ['## Phải giữ nguyên', '## Code bị thay / xóa']) assert.ok(template.includes(heading), `template missing ${heading}`);
  assert.match(template, /AC → test, docs\/ai\/workflow\.md §7/);
  for (const rel of ['adapters/claude-code/.claude/agents/implementer.md', 'adapters/claude-code/.claude/rules/execution.md', 'adapters/codex/README.md']) {
    const text = fs.readFileSync(path.join(KIT, rel), 'utf8');
    assert.match(text, /docs\/ai\/workflow\.md`? §5/, `${rel} missing §5 pointer`);
    assert.match(text, /AC → test/, `${rel} missing AC → test`);
  }
});

test('token audit help works and project/repo must be explicit without reading transcripts', () => {
  const script = path.join(KIT, 'scripts/token-audit.py');
  const help = spawnSync('python3', [script, '--help'], { encoding: 'utf8' });
  assert.equal(help.status, 0, help.stderr);
  assert.match(help.stdout, /--project/);
  assert.match(help.stdout, /--repo/);
  assert.match(help.stdout, /no default/);
  assert.match(help.stdout, /workflow\.md §10/);
  const missing = spawnSync('python3', [script], { encoding: 'utf8' });
  assert.equal(missing.status, 2, missing.stderr);
  assert.match(missing.stderr, /required: --project, --repo/);
});

test('token audit counts cold gaps, deduplicates streams and filters synthetic transcripts', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fwkit-token-'));
  created.push(dir);
  const repo = path.join(dir, 'repo');
  fs.mkdirSync(repo);
  const env = { ...process.env, HOME: dir };

  const writeLog = (rel, records) => {
    const file = path.join(dir, rel);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, records.map(r => JSON.stringify(r)).join('\n') + '\n');
  };
  const turn = (id, timestamp, written, output = 10) => ({ type: 'assistant', timestamp,
    message: { id, model: 'claude-sonnet-test', usage: { input_tokens: 0, cache_creation_input_tokens: written,
      cache_read_input_tokens: 0, output_tokens: output } } });
  writeLog('.claude/projects/fixture/main.jsonl', [
    turn('before', '2026-10-18T23:00:00Z', 100000),
    turn('m1', '2026-10-19T00:00:01Z', 300000),
    turn('m1', '2026-10-19T00:00:02Z', 300000, 20),
    turn('m2', '2026-10-19T00:01:00Z', 300000),
  ]);
  writeLog('.claude/projects/fixture/main/subagents/agent.jsonl', [
    turn('before', '2026-10-18T23:59:00Z', 100000),
    turn('s1', '2026-10-19T00:05:01Z', 100000),
    turn('s2', '2026-10-19T00:06:00Z', 100000),
  ]);
  writeLog('.claude/projects/other/main.jsonl', [turn('excluded', '2026-10-19T00:00:00Z', 99999999)]);
  // Project substring follows sibling worktrees and moved repositories; --repo only counts merges.
  for (const [name, cwd] of [
    ['pilot', '/old/location/fixture-codex-pilot'],
    ['web', '/old/location/fixture-web'],
    ['moved', '/new/location/fixture'],
    ['other', '/old/location/unrelated'],
    ['repo-only', path.join(repo, 'worktree')],
  ]) {
    const usage = input => ({ input_tokens: input, cached_input_tokens: input / 2 });
    writeLog(`.codex/sessions/2026/10/19/${name}.jsonl`, [
      { type: 'session_meta', payload: { cwd } },
      { timestamp: '2026-10-18T23:00:00Z', payload: { type: 'token_count', info: { total_token_usage: usage(1000000) } } },
      { timestamp: '2026-10-19T12:00:00Z', payload: { type: 'token_count', info: { total_token_usage: usage(3000000) } } },
      { timestamp: '2026-10-20T00:00:00Z', payload: { type: 'token_count', info: { total_token_usage: usage(5000000) } } },
    ]);
  }
  // Supply a synthetic merge count without creating commits or inspecting a real repository.
  const harness = 'import runpy, sys\naudit = runpy.run_path(sys.argv.pop(1))\naudit["main"].__globals__["merged_prs"] = lambda *args: 1\nsys.exit(audit["main"]())';
  const result = spawnSync('python3', ['-c', harness, path.join(KIT, 'scripts/token-audit.py'), '--project', 'fixture', '--repo', repo,
    '--since', '2026-10-19', '--until', '2026-10-19'], { env, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /\$2\.90 \(fixed API-price equivalent\)/);
  assert.match(result.stdout, /matched Claude transcript files: 2/);
  assert.match(result.stdout, /subagent share: 17%/);
  assert.match(result.stdout, /main input above 250000 tokens context \(excess \/ total\): 16\.7%/);
  assert.match(result.stdout, /MAIN cache-expired rewrites \(heuristic\): 1/);
  assert.match(result.stdout, /subagent cache-expired rewrites \(heuristic\): 1/);
  assert.match(result.stdout, /MAIN cold resumes \(>1h\): 1/);
  assert.match(result.stdout, /subagent cold resumes \(>5m\): 1/);
  assert.match(result.stdout, /merged PRs on main \(merge commits\): 1  -> \$2\.90\/PR/);
  assert.match(result.stdout, /codex input tokens: 6\.0M \(50% cached; separate subscription\)/);
});
