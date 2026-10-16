import { test } from "node:test";
import assert from "node:assert/strict";
import { initialShowcases, readShowcases, webUrl } from "../src/lib/portfolio";
test("portfolio restores independent projects with their framing and fallback mode", () => {
  const projects = initialShowcases.map((p) => ({
    ...p,
    x: -120,
    y: -300,
    zoom: 1.25,
    mode: "image" as const,
  }));
  assert.deepEqual(readShowcases(JSON.stringify(projects)), projects);
});
test("invalid saved data falls back without crashing", () => {
  for (const raw of [
    null,
    "bad",
    "[]",
    "[{}]",
    JSON.stringify([{ ...initialShowcases[0], zoom: 99 }]),
    JSON.stringify([{ ...initialShowcases[0], url: "javascript:alert(1)" }]),
  ])
    assert.deepEqual(readShowcases(raw), initialShowcases);
});
test("only HTTPS links without credentials can be embedded", () => {
  for (const url of [
    "javascript:alert(1)",
    "http://example.org",
    "https://user:password@example.org",
    "/bureau",
    "",
  ])
    assert.equal(webUrl(url), false);
  assert.equal(webUrl("https://example.org/demo?view=1"), true);
});
