import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

test("Product layer has canonical instructions and template", () => {
  assert.equal(fs.existsSync(path.join(ROOT, "templates/docs/product/PRODUCT_AGENT.md")), true);
  assert.equal(fs.existsSync(path.join(ROOT, "templates/docs/product/README.md")), true);
  assert.equal(fs.existsSync(path.join(ROOT, "templates/docs/product/requirements/_template.md")), true);
});

test("old local Product Agent runner is removed", () => {
  assert.equal(fs.existsSync(path.join(ROOT, "product")), false);
  assert.equal(fs.existsSync(path.join(ROOT, "product.cmd")), false);
  assert.equal(fs.existsSync(path.join(ROOT, "adapters/openai-product-agent")), false);
});

test("Claude requirement handoff remains part of the adapter", () => {
  assert.equal(fs.existsSync(path.join(ROOT, "adapters/claude-code/REQUIREMENT_HANDOFF.md")), true);
  assert.equal(fs.existsSync(path.join(ROOT, "adapters/claude-code/workflows/requirement-to-task.yml")), true);
});
