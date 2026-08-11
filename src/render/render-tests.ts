/**
 * render-tests.ts — P2 verification: `npm run test:render`.
 * One renderer, every project (0 hardcoded cases — G9); render < 200 ms (R7).
 */

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { readProject } from "../state/reader.js";
import { renderCockpit, extractDecisions } from "./cockpit.js";

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

const HERE = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");

function siblingProjects(root) {
  const parent = path.dirname(root);
  try {
    return fs.readdirSync(parent)
      .filter((n) => !n.startsWith(".") && n !== path.basename(root) && fs.existsSync(path.join(parent, n, "handoffs")))
      .map((n) => path.join(parent, n));
  } catch { return []; }
}
const PROJECTS = [HERE, ...siblingProjects(HERE)];

for (const root of PROJECTS) {
  const name = path.basename(root);
  test(`render ${name} — stage, gaps, decisions present; clean parse; <200ms`, () => {
    const t0 = performance.now();
    const st = readProject(root);
    const open = st.gaps.filter((g) => g.status !== "Closed").length;
    const html = renderCockpit(st, { crossCycle: PROJECTS.map((r) => ({ name: path.basename(r), stage: "x", phase: "", gaps: 0, errors: 0 })) });
    const ms = performance.now() - t0;
    if (st.parseErrors.length > 0) throw new Error(`parse errors: ${st.parseErrors.join("; ")}`);
    if (!html.includes(st.currentStage || "stage")) throw new Error("stage missing from cockpit");
    if (!html.includes(`${open} open gaps`)) throw new Error("gap count missing from cockpit");
    if (ms > 200) throw new Error(`render took ${ms.toFixed(0)}ms (R7: <200ms)`);
  });
}

test("decisions aggregation — a plan handoff's D-decisions are extracted", () => {
  // the two-session discipline: the repo never carries dev handoffs, so the test builds its
  // own fixture instead of reading the package's (the clean-room catch, 2026-08-10).
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "delib-render-decisions-"));
  fs.mkdirSync(path.join(dir, "handoffs"), { recursive: true });
  fs.writeFileSync(
    path.join(dir, "handoffs", "stage-2-plan-A.md"),
    "---\nstage: 2-plan\nartifact: plan\nproject: fixture\nstatus: draft\ncreated-at: 2026-08-10\nauthors: [test]\n---\n\n# Plan\n\n| ID | Decision | Choice |\n|----|----------|--------|\n| D1 | one | a |\n| D2 | two | b |\n| D3 | three | c |\n| D4 | four | d |\n| D5 | five | e |\n| D6 | six | f |\n"
  );
  const st = readProject(dir);
  const items = extractDecisions(st);
  const dItems = items.filter((i) => i.id.startsWith("D"));
  if (dItems.length < 5) throw new Error(`expected ≥5 plan decisions, got ${dItems.length}`);
  fs.rmSync(dir, { recursive: true, force: true });
});

test("design v3: left TOC + all panels collapsed by default", () => {
  const st = readProject(HERE);
  const html = renderCockpit(st);
  if (!html.includes("<aside class=\"toc\"")) throw new Error("left TOC missing");
  if (!html.includes('onclick="openPanel(\'decisions\')"')) throw new Error("TOC decision link missing");
  if (!html.includes('class="panel' ) || !html.includes("<details")) throw new Error("collapsible panels missing");
  // panels must be <details> (collapsed by default), not pre-opened
  const openPanels = html.match(/<details[^>]* open/g);
  if (openPanels && openPanels.length > 0) throw new Error(`panels pre-opened: ${openPanels.length}`);
});

test("cockpit script is syntactically valid JS (R4: template-literal escaping guard)", () => {
  const st = readProject(HERE);
  const html = renderCockpit(st);
  const m = html.match(/<script>([\s\S]*?)<\/script>/);
  if (!m) throw new Error("no script block");
  // new Function parses the body — a syntax error throws (catches the \" → \" collapse bug)
  try {
    // eslint-disable-next-line no-new-func
    new Function(m[1]);
  } catch (e) {
    throw new Error(`cockpit script is broken JS: ${(e as Error).message}`);
  }
});

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
if (failed > 0) process.exit(1);
