#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { execFileSync, spawnSync } from "node:child_process";

const ROOT = execFileSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();
const SYSTEM_FILE = path.join(ROOT, "adapters", "openai-product-agent", "SYSTEM.md");
const TEMPLATE_FILE = path.join(ROOT, "templates", "docs", "product", "requirements", "_template.md");
const CHECKER = path.join(ROOT, "scripts", "product-check.mjs");
const REQUIREMENTS_DIR = path.join(ROOT, "docs", "product", "requirements");

const args = process.argv.slice(2);
const flags = new Set(args.filter((x) => x.startsWith("--")));
let idea = args.filter((x) => !x.startsWith("--")).join(" ").trim();

const model = process.env.OPENAI_MODEL || "gpt-6-astra";
const maxTurns = Number(process.env.PRODUCT_MAX_TURNS || "12");

function fail(message) {
  console.error("ERROR: " + message);
  process.exit(1);
}

function git(args) {
  return execFileSync("git", args, { cwd: ROOT, encoding: "utf8" }).trim();
}

function detectBaseBranch() {
  try {
    return git(["symbolic-ref", "--quiet", "--short", "refs/remotes/origin/HEAD"]).replace(/^origin\//, "");
  } catch {
    for (const candidate of ["main", "master"]) {
      try { git(["show-ref", "--verify", "--quiet", "refs/remotes/origin/" + candidate]); return candidate; } catch {}
    }
    return "main";
  }
}

function commandExists(name) {
  try {
    execFileSync(process.platform === "win32" ? "where" : "which", [name], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

async function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(question, (answer) => {
    rl.close();
    resolve(answer);
  }));
}

if (!process.env.OPENAI_API_KEY) fail("OPENAI_API_KEY is not set.");
if (!fs.existsSync(SYSTEM_FILE)) fail("Missing " + SYSTEM_FILE);
if (!fs.existsSync(TEMPLATE_FILE)) fail("Missing " + TEMPLATE_FILE);
if (!fs.existsSync(CHECKER)) fail("Missing " + CHECKER);
if (git(["status", "--porcelain"]).trim()) {
  fail("Working tree is not clean. Commit or stash existing changes first.");
}

if (!idea) idea = await ask("IDEA: ");
if (!idea.trim()) fail("Idea cannot be empty.");

const baseBranch = process.env.PRODUCT_BASE_BRANCH || detectBaseBranch();
const systemPrompt = fs.readFileSync(SYSTEM_FILE, "utf8");

const schema = {
  type: "object",
  additionalProperties: false,
  properties: {
    status: { type: "string", enum: ["ASK", "READY"] },
    assistant_message: { type: "string" },
    questions: { type: "array", items: { type: "string" } },
    title: { type: "string" },
    problem: { type: "string" },
    goal: { type: "string" },
    actors: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          name: { type: "string" },
          need: { type: "string" }
        },
        required: ["name", "need"]
      }
    },
    current_workflow: { type: "string" },
    desired_workflow: { type: "string" },
    functional_requirements: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          user: { type: "string" },
          trigger: { type: "string" },
          behavior: { type: "string" },
          result: { type: "string" }
        },
        required: ["id", "name", "user", "trigger", "behavior", "result"]
      }
    },
    non_functional_requirements: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          id: { type: "string" },
          text: { type: "string" }
        },
        required: ["id", "text"]
      }
    },
    business_rules: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          id: { type: "string" },
          text: { type: "string" }
        },
        required: ["id", "text"]
      }
    },
    edge_cases: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          id: { type: "string" },
          condition: { type: "string" },
          expected: { type: "string" }
        },
        required: ["id", "condition", "expected"]
      }
    },
    acceptance_criteria: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          given: { type: "string" },
          when: { type: "string" },
          then: { type: "string" }
        },
        required: ["id", "name", "given", "when", "then"]
      }
    },
    out_of_scope: { type: "array", items: { type: "string" } },
    assumptions: { type: "array", items: { type: "string" } },
    open_questions: { type: "array", items: { type: "string" } }
  },
  required: [
    "status",
    "assistant_message",
    "questions",
    "title",
    "problem",
    "goal",
    "actors",
    "current_workflow",
    "desired_workflow",
    "functional_requirements",
    "non_functional_requirements",
    "business_rules",
    "edge_cases",
    "acceptance_criteria",
    "out_of_scope",
    "assumptions",
    "open_questions"
  ]
};

let previousResponseId = null;
let state = null;
let userInput = idea;

console.log("");
console.log("=== AI Dev Framework / Product Agent ===");
console.log("Model: " + model);
console.log("");

for (let turn = 1; turn <= maxTurns; turn += 1) {
  state = await callOpenAI({
    previousResponseId,
    userInput,
    instructions: systemPrompt,
    schema,
    model
  });
  previousResponseId = state.id;

  if (state.data.assistant_message) {
    console.log(state.data.assistant_message.trim());
  }

  if (state.data.status === "READY") break;

  const questions = state.data.questions.length
    ? state.data.questions
    : ["Please clarify the missing information needed for a testable requirement."];

  console.log("");
  console.log("Questions:");
  questions.forEach((q, i) => console.log((i + 1) + ". " + q));
  console.log("");
  userInput = await ask("Answer: ");

  if (!userInput.trim()) fail("Empty answer. Aborting without commit.");
}

if (!state || state.data.status !== "READY") {
  fail("Requirement did not reach READY within " + maxTurns + " turns.");
}

if (state.data.open_questions.length > 0) fail("Model marked READY with open questions. Resolve them before handoff.");
if (!state.data.title.trim() || !state.data.problem.trim() || !state.data.goal.trim()) fail("READY requirement is missing title, problem, or goal.");
if (state.data.actors.length === 0) fail("READY requirement needs at least one actor.");
if (state.data.functional_requirements.length === 0) fail("READY requirement needs at least one functional requirement.");
if (state.data.acceptance_criteria.length === 0) fail("READY requirement needs at least one acceptance criterion.");

const reqNumber = nextRequirementNumber();
const reqId = "REQ-" + String(reqNumber).padStart(3, "0");
const slug = slugify(state.data.title || "requirement");
const filename = reqId + "-" + slug + ".md";
const relPath = path.posix.join("docs/product/requirements", filename);
const absPath = path.join(ROOT, relPath);

fs.mkdirSync(REQUIREMENTS_DIR, { recursive: true });
fs.writeFileSync(absPath, renderMarkdown(reqId, state.data), "utf8");

runChecker(relPath);

const branchName = "product/" + reqId + "-" + slug;
git(["switch", "-c", branchName]);
git(["add", relPath]);
git(["commit", "-m", "feat(product): add " + reqId + " " + state.data.title]);

console.log("");
console.log("Created " + relPath);
console.log("Branch: " + branchName);

if (flags.has("--dry-run")) {
  console.log("DRY RUN: commit created locally; push/PR skipped.");
  process.exit(0);
}

git(["push", "-u", "origin", branchName]);

if (!flags.has("--no-pr")) {
  await createPullRequest({
    head: branchName,
    base: baseBranch,
    title: "[" + reqId + "] " + state.data.title,
    body: buildPrBody(reqId, relPath, state.data)
  });
} else {
  console.log("Push complete. PR creation skipped.");
}

console.log("");
console.log("Done: " + reqId);
console.log("Claude can now consume the READY requirement through the GitHub workflow.");

async function callOpenAI({ previousResponseId, userInput, instructions, schema, model }) {
  const body = {
    model,
    store: true,
    instructions: instructions + "\\n\\nReturn this turn using the supplied structured response schema.",
    input: userInput,
    text: {
      format: {
        type: "json_schema",
        name: "product_requirement_turn",
        strict: true,
        schema
      }
    },
    max_output_tokens: 5000
  };

  if (previousResponseId) body.previous_response_id = previousResponseId;

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + process.env.OPENAI_API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const raw = await response.text();
  let payload;

  try {
    payload = JSON.parse(raw);
  } catch {
    throw new Error("OpenAI returned non-JSON HTTP " + response.status + ": " + raw.slice(0, 500));
  }

  if (!response.ok) {
    throw new Error((payload.error && payload.error.message) || "OpenAI request failed.");
  }

  if (payload.status === "incomplete") {
    throw new Error("OpenAI response incomplete: " + ((payload.incomplete_details && payload.incomplete_details.reason) || "unknown"));
  }

  const text = extractText(payload);
  if (!text) throw new Error("OpenAI response contained no output text.");

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Structured output was not valid JSON.");
  }

  return { id: payload.id, data };
}

function extractText(payload) {
  if (typeof payload.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text;
  }

  for (const item of payload.output || []) {
    for (const part of item.content || []) {
      if (part.type === "output_text" && typeof part.text === "string") return part.text;
    }
  }

  return "";
}

function renderMarkdown(id, data) {
  const date = new Date().toISOString().slice(0, 10);
  const lines = [
    "---",
    "id: " + id,
    'title: "' + yamlString(data.title) + '"',
    "status: READY",
    "version: 1",
    'owner: "' + yamlString(process.env.PRODUCT_OWNER || "HUMAN LEAD") + '"',
    "created: " + date,
    "updated: " + date,
    "---",
    "",
    "# Requirement: " + id + " — " + data.title,
    "",
    "## 1. Problem",
    "",
    data.problem,
    "",
    "## 2. Goal",
    "",
    data.goal,
    "",
    "## 3. Actors",
    "",
    "| Actor | Role / need |",
    "|---|---|"
  ];

  for (const actor of data.actors) {
    lines.push("| " + escapeCell(actor.name) + " | " + escapeCell(actor.need) + " |");
  }
  if (!data.actors.length) lines.push("| None | None |");
  lines.push("");

  pushText(lines, "4. Current workflow / context", data.current_workflow);
  pushText(lines, "5. Desired workflow / outcome", data.desired_workflow);

  lines.push("## 6. Functional requirements", "");
  for (const fr of data.functional_requirements) {
    lines.push(
      "### " + fr.id + " — " + fr.name,
      "",
      "- User: " + fr.user,
      "- Trigger: " + fr.trigger,
      "- Behavior: " + fr.behavior,
      "- Result: " + fr.result,
      ""
    );
  }
  if (!data.functional_requirements.length) lines.push("None.", "");

  lines.push("## 7. Non-functional requirements", "");
  if (data.non_functional_requirements.length) {
    for (const item of data.non_functional_requirements) lines.push("- " + item.id + ": " + item.text);
  } else {
    lines.push("None.");
  }
  lines.push("");

  lines.push("## 8. Business rules / constraints", "");
  if (data.business_rules.length) {
    for (const item of data.business_rules) lines.push("- " + item.id + ": " + item.text);
  } else {
    lines.push("None.");
  }
  lines.push("");

  lines.push("## 9. Edge cases / failure behavior", "");
  if (data.edge_cases.length) {
    for (const item of data.edge_cases) lines.push("- " + item.id + ": " + item.condition + " → " + item.expected);
  } else {
    lines.push("None.");
  }
  lines.push("");

  lines.push("## 10. Acceptance criteria", "");
  for (const item of data.acceptance_criteria) {
    lines.push(
      "### " + item.id + " — " + item.name,
      "",
      "Given " + item.given + ", when " + item.when + ", then " + item.then + ".",
      ""
    );
  }
  if (!data.acceptance_criteria.length) lines.push("None.", "");

  lines.push("## 11. Out of scope", "");
  if (data.out_of_scope.length) {
    for (const item of data.out_of_scope) lines.push("- " + item);
  } else {
    lines.push("- None.");
  }
  lines.push("");

  lines.push("## 12. Assumptions", "");
  if (data.assumptions.length) {
    for (const item of data.assumptions) lines.push("- " + item);
  } else {
    lines.push("- None.");
  }
  lines.push("");

  lines.push("## 13. Open questions", "", "None.", "");
  lines.push(
    "## 14. Readiness",
    "",
    "- [x] Problem is specific.",
    "- [x] Goal is observable and non-technical.",
    "- [x] Actors are known.",
    "- [x] Current context is sufficient.",
    "- [x] Desired workflow is clear.",
    "- [x] Functional requirements are explicit.",
    "- [x] Relevant rules and edge cases are recorded.",
    "- [x] Acceptance criteria are testable.",
    "- [x] Out of scope is explicit.",
    "- [x] No material open question blocks planning.",
    "",
    "Readiness: READY",
    "",
    "## 15. Traceability",
    "",
    "- Source idea / request: CLI Product Agent session",
    "- Parent requirement: None",
    "- Generated tasks: None",
    ""
  );

  return lines.join("\\n");
}

function pushText(lines, title, value) {
  lines.push("## " + title, "", value || "None.", "");
}

function yamlString(value) {
  return String(value).replaceAll("\\\\", "\\\\\\\\").replaceAll('"', '\\"').replaceAll("\\n", " ");
}

function escapeCell(value) {
  return String(value).replaceAll("|", "\\|").replaceAll("\\n", " ");
}

function slugify(value) {
  return String(value)
    .normalize("NFKD")
    .replace(/[\\u0300-\\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "requirement";
}

function nextRequirementNumber() {
  const files = fs.existsSync(REQUIREMENTS_DIR) ? fs.readdirSync(REQUIREMENTS_DIR) : [];
  let max = 0;

  for (const file of files) {
    const match = file.match(/^REQ-(\\d{3,})(?:[-.]|$)/);
    if (match) max = Math.max(max, Number(match[1]));
  }

  return max + 1;
}

function runChecker(relPath) {
  const result = spawnSync(process.execPath, [CHECKER, relPath], {
    cwd: ROOT,
    encoding: "utf8"
  });

  process.stdout.write(result.stdout || "");
  process.stderr.write(result.stderr || "");

  if (result.status !== 0) {
    fail("Product readiness checker failed. Nothing was pushed.");
  }
}

function buildPrBody(id, relPath, data) {
  const lines = [
    "## Product Requirement: " + id,
    "",
    data.goal,
    "",
    "Requirement: " + relPath,
    "",
    "This PR contains a READY product requirement.",
    "Claude may create DRAFT task contracts from it.",
    "No application implementation is authorized by this requirement.",
    "",
    "## Out of scope"
  ];

  if (data.out_of_scope.length) {
    for (const item of data.out_of_scope) lines.push("- " + item);
  } else {
    lines.push("- None recorded.");
  }

  return lines.join("\\n");
}

async function createPullRequest({ head, base, title, body }) {
  const remote = git(["remote", "get-url", "origin"]);
  const repo = parseGitHubRemote(remote);
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

  if (token && repo) {
    const response = await fetch(
      "https://api.github.com/repos/" + repo.owner + "/" + repo.name + "/pulls",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
          "X-GitHub-Api-Version": "2022-11-28"
        },
        body: JSON.stringify({ title, head, base, body, draft: false })
      }
    );

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.message || "GitHub PR creation failed.");
    }

    console.log("PR: " + payload.html_url);
    return;
  }

  if (commandExists("gh")) {
    const result = spawnSync(
      "gh",
      ["pr", "create", "--base", base, "--head", head, "--title", title, "--body", body],
      { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }
    );

    if (result.status === 0) {
      process.stdout.write(result.stdout || "");
      return;
    }

    throw new Error(result.stderr || "gh pr create failed.");
  }

  throw new Error("No GitHub PR credential/tool found. Set GITHUB_TOKEN/GH_TOKEN or authenticate gh.");
}

function parseGitHubRemote(remote) {
  const ssh = remote.match(/^git@github\\.com:([^/]+)\\/([^/]+?)(?:\\.git)?$/);
  if (ssh) return { owner: ssh[1], name: ssh[2] };

  const https = remote.match(/^https:\\/\\/github\\.com\\/([^/]+)\\/([^/]+?)(?:\\.git)?$/);
  if (https) return { owner: https[1], name: https[2] };

  return null;
}
