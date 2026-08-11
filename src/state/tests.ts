/**
 * tests.ts — P1 verification: `npm run test:parse`.
 * Unit tests (frontmatter, atomic-write, reader) + corpus walk (0 hard errors).
 * Exit non-zero on any failure (C12: reproducible, verifiable).
 */

import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { splitFrontmatter, normAuthors } from "./frontmatter.js";
import { atomicWrite } from "./atomic-write.js";
import { parseHandoff, readProject, extractGaps, listHandoffs } from "./reader.js";

let passed = 0;
let failed = 0;
function test(name: string, fn: () => void) {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failed++;
    console.error(`  ✗ ${name}: ${(err as Error).message}`);
  }
}

console.log("=== unit tests ===");

test("frontmatter: parses a standard handoff", () => {
  const { meta, body, hadFrontmatter, error } = splitFrontmatter(
    `---\nstage: 3-execute\nartifact: phase-1-handoff\nproject: x\nauthors: [DSv4flash]\n---\n\n# Body\n`
  );
  assert.equal(error, undefined);
  assert.equal(hadFrontmatter, true);
  assert.equal(meta.stage, "3-execute");
  assert.equal(meta.artifact, "phase-1-handoff");
  assert.match(body, /# Body/);
});

test("frontmatter: legacy file without frontmatter is tolerated (no error)", () => {
  const { hadFrontmatter, error } = splitFrontmatter("# frame\n\nplain old file\n");
  assert.equal(hadFrontmatter, false);
  assert.equal(error, undefined);
});

test("frontmatter: malformed frontmatter is reported, not silent", () => {
  const { error } = splitFrontmatter("---\nstage: [unclosed\n---\n\nbody\n");
  assert.ok(error, "expected a reported error");
});

test("frontmatter: authors string and array normalize", () => {
  assert.deepEqual(normAuthors("efran"), ["efran"]);
  assert.deepEqual(normAuthors(["OpusCC5", "DSv4flash"]), ["OpusCC5", "DSv4flash"]);
  assert.deepEqual(normAuthors(undefined), []);
});

test("atomic-write: writes file atomically", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "delib-test-"));
  const file = path.join(dir, "a.md");
  const r1 = atomicWrite(file, "# one");
  assert.equal(r1.success, true);
  assert.equal(fs.readFileSync(file, "utf8"), "# one");
  const r2 = atomicWrite(file, "# two", { backup: true });
  assert.equal(r2.success, true);
  assert.equal(fs.readFileSync(file, "utf8"), "# two");
  assert.equal(fs.readFileSync(file + ".bak", "utf8"), "# one");
  fs.rmSync(dir, { recursive: true, force: true });
});

test("reader: derives stage/artifact/phase from frontmatter", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "delib-test-"));
  const hd = path.join(dir, "handoffs");
  fs.mkdirSync(hd, { recursive: true });
  fs.writeFileSync(
    path.join(hd, "stage-2-plan-X.md"),
    `---\nstage: 2-plan\nartifact: plan\nproject: x\nphase: P3\n---\n\n# Plan\n`
  );
  const h = parseHandoff(path.join(hd, "stage-2-plan-X.md"));
  assert.equal(h.stageNum, 2);
  assert.equal(h.stageName, "plan");
  assert.equal(h.phaseId, "P3");
  assert.equal(h.isRevision, false);
  fs.rmSync(dir, { recursive: true, force: true });
});

test("reader: revision -vN detected; current file not revision", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "delib-test-"));
  const a1 = path.join(dir, "stage-1-frame-problem-A-v1.md");
  const a2 = path.join(dir, "stage-1-frame-problem-A.md");
  fs.writeFileSync(a1, "---\nstage: 1-frame\n---\n# v1\n");
  fs.writeFileSync(a2, "---\nstage: 1-frame\n---\n# current\n");
  assert.equal(parseHandoff(a1).isRevision, true);
  assert.equal(parseHandoff(a1).revisionNum, 1);
  assert.equal(parseHandoff(a2).isRevision, false);
  fs.rmSync(dir, { recursive: true, force: true });
});

test("reader: gap extraction from heading + status", () => {
  const body = `# Gaps\n\n### G16 — Port vs re-spec\n**Status:** Open\n\n### G20 — Write path\n**Status:** Closed\n`;
  const gaps = extractGaps(body, "x.md");
  assert.equal(gaps.length, 2);
  assert.equal(gaps[0].id, "G16");
  assert.equal(gaps[0].status, "Open");
  assert.equal(gaps[1].id, "G20");
  assert.equal(gaps[1].status, "Closed");
});

test("reader: project state — current stage + gaps aggregated", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "delib-test-"));
  const hd = path.join(dir, "handoffs");
  fs.mkdirSync(hd, { recursive: true });
  fs.writeFileSync(
    path.join(hd, "stage-1-frame-problem-A.md"),
    `---\nstage: 1-frame\nartifact: problem-statement\n---\n# P\n`
  );
  fs.writeFileSync(
    path.join(hd, "stage-1-frame-gaps-A.md"),
    `---\nstage: 1-frame\nartifact: gaps\n---\n### G1 — X\n**Status:** Open\n`
  );
  fs.writeFileSync(
    path.join(hd, "stage-2-plan-A.md"),
    `---\nstage: 2-plan\nartifact: plan\nphase: P0\n---\n# Plan\n`
  );
  const st = readProject(dir);
  assert.equal(st.currentStageNum, 2);
  assert.equal(st.currentStage, "2-plan");
  assert.equal(st.gaps.length, 1);
  assert.equal(st.gaps[0].id, "G1");
  assert.equal(st.parseErrors.length, 0);
  fs.rmSync(dir, { recursive: true, force: true });
});

test("reader: Verify phases (V1/V2/V3) rank within stage 4", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "delib-test-"));
  const hd = path.join(dir, "handoffs");
  fs.mkdirSync(hd, { recursive: true });
  fs.writeFileSync(
    path.join(hd, "stage-4-phase-1-A.md"),
    `---\nstage: 4-verify\nartifact: phase-1-handoff\nphase: V1 — Layer 1\n---\n# V1\n`
  );
  fs.writeFileSync(
    path.join(hd, "stage-4-phase-2-A.md"),
    `---\nstage: 4-verify\nartifact: phase-2-handoff\nphase: V2 — Layer 2\n---\n# V2\n`
  );
  const st = readProject(dir);
  assert.equal(st.currentStage, "4-verify");
  assert.equal(st.currentPhase, "V2 — Layer 2");
  fs.rmSync(dir, { recursive: true, force: true });
});

console.log("=== corpus walk ===");

const HERE = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");

function siblingProjects(root) {
  const parent = path.dirname(root);
  try {
    return fs.readdirSync(parent)
      .filter((n) => !n.startsWith(".") && n !== path.basename(root) && fs.existsSync(path.join(parent, n, "handoffs")))
      .map((n) => path.join(parent, n));
  } catch { return []; }
}
const DEFAULT_CORPUS = [HERE, ...siblingProjects(HERE)];
const CORPUS = (process.env.CORPUS_ROOT ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean)
  .length
  ? (process.env.CORPUS_ROOT ?? "").split(",").map((s) => s.trim())
  : DEFAULT_CORPUS;

let corpusFiles = 0;
let corpusErrors = 0;
for (const root of CORPUS) {
  const handoffDir = path.join(root, "handoffs");
  if (!fs.existsSync(handoffDir)) {
    console.log(`  ⚠ missing handoffs/: ${root}`);
    continue;
  }
  const st = readProject(root);
  const files = listHandoffs(handoffDir);
  corpusFiles += files.length;
  corpusErrors += st.parseErrors.length;
  const state = st.currentStage || "—";
  console.log(
    `  ${path.basename(root).padEnd(28)} files=${String(files.length).padStart(3)} ` +
      `stage=${state.padEnd(14)} gaps=${st.gaps.length} parseErrors=${st.parseErrors.length}`
  );
  for (const w of st.warnings.slice(0, 5)) console.log(`      ⚠ ${w}`);
  if (st.parseErrors.length) console.log(`      ✗ ${st.parseErrors.join(" | ")}`);
}

console.log(`\n=== Results: ${passed} unit passed, ${failed} failed; ` +
  `${corpusFiles} corpus files parsed, ${corpusErrors} hard errors ===`);
if (failed > 0 || corpusErrors > 0) process.exit(1);
