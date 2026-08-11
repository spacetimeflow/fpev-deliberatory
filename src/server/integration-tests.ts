/**
 * tests.ts (integration) — P6 verification: `npm run test:integration`.
 * 1. fs.watch fires on a handoff write (hop 2 mechanism).
 * 2. G20: N concurrent atomic writes → no torn file, no .tmp leftovers.
 */

import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as http from "node:http";
import * as os from "node:os";
import * as path from "node:path";
import { atomicWrite } from "../state/atomic-write.js";
import { watchProject } from "./watch.js";

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

test("watch: fires on a handoff write (debounced)", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "delib-watch-"));
  fs.mkdirSync(path.join(dir, "handoffs"));
  let fired = 0;
  const handle = watchProject(dir, () => fired++);
  await new Promise((r) => setTimeout(r, 50));
  fs.writeFileSync(path.join(dir, "handoffs", "stage-2-plan-A.md"), "---\nstage: 2-plan\n---\n# p\n");
  await new Promise((r) => setTimeout(r, 400));
  handle.stop();
  assert.ok(fired >= 1, `expected ≥1 watch event, got ${fired}`);
  fs.rmSync(dir, { recursive: true, force: true });
});

test("G20: 200 concurrent atomic writes — no torn file, no .tmp leftovers", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "delib-g20-"));
  const file = path.join(dir, "handoffs", "state.md");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const payload = (i: number) => `# ${i}\n`.repeat(200); // 200 lines, distinguishable
  await Promise.all(
    Array.from({ length: 200 }, (_, i) => Promise.resolve(atomicWrite(file, payload(i))))
  );
  const final = fs.readFileSync(file, "utf8");
  // final content must be exactly one writer's payload — never a torn mix
  const firstLine = final.split("\n")[0].replace("# ", "").trim();
  assert.match(firstLine, /^\d+$/);
  const expected = `# ${firstLine}\n`.repeat(200);
  assert.equal(final, expected, "torn write detected: content is a mix of writers");
  const leftovers = fs.readdirSync(path.dirname(file)).filter((f) => f.endsWith(".tmp"));
  assert.equal(leftovers.length, 0, `.tmp leftovers: ${leftovers.join(",")}`);
  fs.rmSync(dir, { recursive: true, force: true });
});

test("static serving: workbench/ HTML reachable via /files/, traversal guarded", async () => {
  const { createServer } = await import("./server.js");
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "delib-static-"));
  fs.mkdirSync(path.join(dir, "workbench", "surfaces"), { recursive: true });
  fs.mkdirSync(path.join(dir, "handoffs"), { recursive: true });
  fs.writeFileSync(path.join(dir, "workbench", "surfaces", "x-cards.html"), "<h1>cards</h1>");
  fs.writeFileSync(path.join(dir, "handoffs", "a.md"), "# a");
  fs.writeFileSync(path.join(dir, "secret.txt"), "nope");
  const server = createServer(dir);
  await new Promise<void>((r) => server.listen(0, r));
  const addr = server.address();
  const port = typeof addr === "object" && addr ? addr.port : 0;
  const get = (p: string) =>
    new Promise<{ status: number; body: string; contentType: string }>((resolve, reject) => {
      http.get({ port, path: p }, (res) => {
        let b = "";
        res.on("data", (c) => (b += c));
        res.on("end", () =>
          resolve({ status: res.statusCode ?? 0, body: b, contentType: res.headers["content-type"] ?? "" })
        );
      }).on("error", reject);
    });
  const html = await get("/files/workbench/surfaces/x-cards.html");
  assert.equal(html.status, 200);
  assert.match(html.body, /<h1>cards<\/h1>/);
  const md = await get("/files/handoffs/a.md");
  assert.equal(md.status, 200);
  assert.match(md.contentType, /markdown/);
  const trav = await get("/files/../secret.txt");
  assert.equal(trav.status, 403, "path traversal must be refused");
  server.close();
  fs.rmSync(dir, { recursive: true, force: true });
});

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
if (failed > 0) process.exit(1);
