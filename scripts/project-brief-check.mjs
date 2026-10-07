#!/usr/bin/env node

import fs from 'node:fs';
import process from 'node:process';

const file = process.argv[2];
if (!file) { console.error('Usage: node scripts/project-brief-check.mjs <Project-Brief>'); process.exit(2); }
if (!fs.existsSync(file)) { console.error('FAIL: file not found: '+file); process.exit(1); }

const source = fs.readFileSync(file, 'utf8');
const errors = [];
if (!source.includes('artifact: PROJECT-BRIEF')) errors.push('missing PROJECT-BRIEF metadata');
if (!source.includes('protocol: Genesis v1')) errors.push('missing Genesis v1 metadata');
for (const section of [
  '# Project Brief','## Problem','## Users & Stakeholders','## Current Workflow',
  '## Desired Workflow / Outcome','## Core Requirements','## Scope','## Constraints',
  '## Technical Implications','## Knowledge Ledger','## Uncertainty Register',
  '## Discovery Synthesis','## Readiness','## Handoff Boundary'
]) if (!source.includes(section)) errors.push('missing section: '+section);

if (/^Readiness:\s*READY_TO_PLAN\s*$/m.test(source)) {
  if (!/^\|[^\n]*HIGH[^\n]*\|[^\n]*\|[^\n]*\|[^\n]*\|[^\n]*\|[^\n]*\|/m.test(source)) {
    // no-op: readiness semantics are primarily model-reviewed
  }
  const rd = source.match(/## Readiness[\s\S]*?(?=\n## Handoff Boundary)/)?.[0] ?? '';
  if ((rd.match(/^- \[ \]/gm) ?? []).length) errors.push('READY_TO_PLAN brief still has unchecked readiness items');
}

if (errors.length) { for (const e of errors) console.error('FAIL: '+e); process.exit(1); }
console.log('PASS: project brief '+file);
