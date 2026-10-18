import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const KIT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const SCRIPT = path.join(KIT, 'scripts', 'bootstrap-project.sh');
const WORKFLOW = path.join(KIT, 'bootstrap', 'github', 'framework-bootstrap.yml');

const created = [];
after(() => { for (const d of created) fs.rmSync(d, { recursive: true, force: true }); });

const available = (cmd, args) => {
  const r = spawnSync(cmd, args, { encoding: 'utf8' });
  return !r.error && r.status === 0;
};

test('local bootstrap installs chatgpt, claude-code, codex adapters in a fresh git repo', (t) => {
  if (!available('bash', ['-c', 'true'])) return t.skip('bash unavailable');
  if (!available('git', ['--version'])) return t.skip('git unavailable');

  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fwboot-'));
  created.push(dir);
  const init = spawnSync('git', ['init', '-q', dir], { encoding: 'utf8' });
  assert.equal(init.status, 0, init.stderr);

  const r = spawnSync('bash', [SCRIPT, dir], { encoding: 'utf8' });
  assert.equal(r.status, 0, `${r.stdout}\n${r.stderr}`);

  for (const a of ['chatgpt', 'claude-code', 'codex']) {
    assert.ok(fs.existsSync(path.join(dir, 'adapters', a, 'adapter.json')), `adapters/${a}/adapter.json`);
  }
  assert.ok(fs.existsSync(path.join(dir, '.claude/agents/implementer.md')));
  assert.ok(fs.existsSync(path.join(dir, '.claude/rules/execution.md')));
  assert.ok(fs.existsSync(path.join(dir, '.github/workflows/requirement-to-task.yml')));

  const tmplCfg = JSON.parse(fs.readFileSync(path.join(KIT, 'templates/framework.config.json'), 'utf8'));
  const gotCfg = JSON.parse(fs.readFileSync(path.join(dir, 'framework.config.json'), 'utf8'));
  assert.deepEqual(gotCfg, tmplCfg);

  assert.equal(fs.existsSync(path.join(dir, '.codex')), false, 'no .codex runtime config in Phase 1');
  assert.ok(fs.readFileSync(path.join(dir, 'CLAUDE.md')).equals(fs.readFileSync(path.join(KIT, 'templates/CLAUDE.md'))));
});

test('GitHub bootstrap workflow copies the same adapter set as the local script (static check)', () => {
  const yml = fs.readFileSync(WORKFLOW, 'utf8');
  const sh = fs.readFileSync(SCRIPT, 'utf8');
  const fromYml = new Set([...yml.matchAll(/cp -a "\$framework\/adapters\/([\w-]+)\/\."/g)].map((m) => m[1]));
  const fromSh = new Set([...sh.matchAll(/copy_dir "\$KIT_ROOT\/adapters\/([\w-]+)"/g)].map((m) => m[1]));
  assert.deepEqual([...fromYml].sort(), ['chatgpt', 'claude-code', 'codex']);
  assert.deepEqual([...fromYml].sort(), [...fromSh].sort());
  assert.match(yml, /adapters\/claude-code\/\.claude\/\./);
  assert.match(yml, /mkdir -p [^\n]*adapters\/codex/);
  assert.doesNotMatch(yml, /\.codex/);
});
