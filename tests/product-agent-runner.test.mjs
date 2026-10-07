import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

test("Product Agent runner is valid JavaScript", () => {
  const runner = path.join(ROOT, "adapters", "openai-product-agent", "run.mjs");
  const result = spawnSync(process.execPath, ["--check", runner], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr || result.stdout);
});

test("Product CLI wrappers exist", () => {
  assert.equal(fs.existsSync(path.join(ROOT, "product")), true);
  assert.equal(fs.existsSync(path.join(ROOT, "product.cmd")), true);
});
