/**
 * cockpit.ts — C1: the served state view (P2; redesigned v3 at P10 review).
 * Pure render: ProjectState → HTML. One renderer, any project (0 hardcoded).
 * Design v3: everything collapsible, left table-of-contents. The header pills
 * and TOC badges carry the signal; panels expand on demand.
 */

import type { ProjectState, GapEntry, ArtifactEntry } from "../state/types.js";
import { conventionsRef } from "../state/conventions.js";

export interface DecisionItem {
  id: string;
  text: string;
  source: string;
}

export interface CrossCycleRow {
  name: string;
  stage: string;
  phase: string;
  gaps: number;
  errors: number;
}

/** Aggregate pending human decisions across handoffs (F1-c — "Decisions needing you"). */
export function extractDecisions(st: ProjectState): DecisionItem[] {
  const items: DecisionItem[] = [];
  for (const h of st.handoffs) {
    if (h.isRevision) continue;
    const lines = h.body.split(/\r?\n/);
    let inOpen = false;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const section = line.match(/^#{2,3}\s+(.*open questions.*)$/i);
      if (section) {
        inOpen = true;
        continue;
      }
      if (inOpen && /^#{2,}\s+/.test(line) && !/open questions/i.test(line)) inOpen = false;
      if (inOpen) {
        const q =
          line.match(/^\s*(?:[-*]\s*)?\*{0,2}(Q\d+)\*{0,2}\s*[—–:\-]\s*(.+)$/i) ??
          line.match(/^\s*\|\s*\*{0,2}(Q\d+)\*{0,2}\s*\|\s*(.+?)\s*\|/i);
        if (q && !items.some((it) => it.id === q[1])) {
          items.push({ id: q[1], text: q[2].trim(), source: h.name });
        }
      }
      const d = line.match(/^\|\s*D(\d+)\s*\|\s*(.+?)\s*\|/);
      if (d && !items.some((it) => it.id === `D${d[1]}`)) {
        items.push({ id: `D${d[1]}`, text: d[2].trim(), source: h.name });
      }
    }
  }
  return items;
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function statusClass(status: string | undefined): string {
  const s = status ?? "—";
  if (/complet|closed|✅|passed/.test(s)) return "ok";
  if (/open|draft|in-progress|in progress/i.test(s)) return "warn";
  return "mut";
}

export function renderCockpit(
  st: ProjectState,
  opts: { crossCycle?: CrossCycleRow[] } = {}
): string {
  const decisions = extractDecisions(st);
  const artifacts = st.artifacts.filter((a) => !a.isRevision);
  const revisions = st.artifacts.filter((a) => a.isRevision);
  const openGaps = st.gaps.filter((g) => g.status !== "Closed");
  const closedGaps = st.gaps.filter((g) => g.status === "Closed");
  const errors = st.parseErrors.length;
  const warnings = st.warnings.length;
  const proj = esc(st.root.split("/").pop() ?? "");
  const isEmpty = st.handoffs.length === 0;

  // ---- stage grouping ----------------------------------------------------
  const stages = new Map<number, ArtifactEntry[]>();
  for (const a of artifacts) {
    const n = a.stageNum ?? 0;
    if (!stages.has(n)) stages.set(n, []);
    stages.get(n)!.push(a);
  }
  const stageOrder = [...stages.keys()].sort((a, b) => b - a);
  const stageLabel = (n: number) =>
    `Stage ${n}-${esc(stages.get(n)?.[0]?.stageName ?? "")}`;

  const stageRows = (list: ArtifactEntry[]) =>
    list
      .map(
        (a) =>
          `<div class="row"><span class="id"><a href="#" onclick="openReader('handoffs/${esc(a.name)}');return false;" title="open rendered markdown">${esc(a.name)}</a> <a href="/files/workbench/surfaces/${esc(a.name.replace(/\.md$/, "") + "-cards.html")}" title="cards surface">⛶</a></span><span class="phase">${esc(a.phaseId ?? "—")}</span><span class="pill ${statusClass(a.status)}">${esc(a.status ?? "—")}</span><span class="mut src">${esc(a.authors.join(", ") || "—")}</span></div>`
      )
      .join("");

  const stageToc = stageOrder
    .map(
      (n) =>
        `<a class="toc-item" onclick="openPanel('stage-${n}')">${stageLabel(n)} <span class="badge">${stages.get(n)!.length}</span></a>`
    )
    .join("");

  const stagePanels = stageOrder
    .map(
      (n) =>
        `<details class="panel" id="stage-${n}"><summary>${stageLabel(n)} <span class="badge">${stages.get(n)!.length} artifacts</span></summary><div class="body">${stageRows(stages.get(n)!)}</div></details>`
    )
    .join("");

  const workPanel = isEmpty
    ? `<div class="panel attention"><h2>New project</h2><div class="body">${newProjectHint(proj)}</div></div>`
    : stagePanels || `<div class="panel"><h2>Stage work</h2><div class="body"><p class="mut">No stage-derivable artifacts.</p></div></div>`;

  // ---- gaps ---------------------------------------------------------------
  const gapRows = (list: GapEntry[]) =>
    list
      .map(
        (g) =>
          `<div class="row"><span class="id">${esc(g.id)}</span><span>${esc(g.title)}</span><span class="pill ${g.status === "Closed" ? "ok" : g.status === "Open" ? "warn" : "mut"}">${esc(g.status)}</span></div>`
      )
      .join("");

  const gapsPanel = `<details class="panel ${openGaps.length ? "attention" : ""}" id="gaps"><summary>Gaps <span class="badge">${openGaps.length} open${closedGaps.length ? ` · ${closedGaps.length} closed` : ""}</span></summary><div class="body">${
    gapRows(openGaps) || `<p class="mut">No open gaps.</p>`
  }${closedGaps.length ? `<details><summary>${closedGaps.length} closed ▸</summary>${gapRows(closedGaps)}</details>` : ""}</div></details>`;

  // ---- secondary panels ----------------------------------------------------
  const decisionsPanel = `<details class="panel ${decisions.length ? "attention" : ""}" id="decisions"><summary>Decisions needing you <span class="badge">${decisions.length}</span></summary><div class="body">${
    decisions.length
      ? decisions
          .map(
            (d) =>
              `<div class="row"><span class="id">${esc(d.id)}</span><span>${esc(d.text)}</span><span class="mut src">${esc(d.source)}</span></div>`
          )
          .join("")
      : `<p class="mut">Nothing pending — the capture surfaces are current.</p>`
  }</div></details>`;

  const crossRows = (opts.crossCycle ?? [])
    .map(
      (c) =>
        `<div class="row"><span class="id">${esc(c.name)}</span><span class="phase">${esc(c.stage)}</span><span class="mut src">${esc(c.phase)}</span><span class="pill ${c.gaps ? "warn" : "ok"}">${c.gaps} gaps</span><span class="pill ${c.errors ? "err" : "ok"}">${c.errors ? `${c.errors} err` : "ok"}</span></div>`
    )
    .join("");
  const crossPanel = `<details class="panel" id="cross"><summary>Cross-cycle <span class="badge">${(opts.crossCycle ?? []).length} projects</span></summary><div class="body">${crossRows}</div></details>`;


  // ---- header ---------------------------------------------------------------
  const header = `<div class="topbar">
  <h1>${proj}</h1>
  <span class="pill stage">stage ${esc(st.currentStage || "—")}</span>
  <span class="pill phase">${esc(st.currentPhase || "—")}</span>
  <div class="counts">
    <span class="pill ${openGaps.length ? "warn" : "ok"}">${openGaps.length} open gaps</span>
    <span class="pill ${decisions.length ? "warn" : "ok"}">${decisions.length} decisions</span>
    <span class="pill ${errors ? "err" : "ok"}">${errors ? `${errors} parse errors` : "clean parse"}</span>
    <span class="pill mut">${artifacts.length} artifacts${revisions.length ? ` · +${revisions.length} preserved` : ""}</span>
    ${st.awaitingHarness ? `<span class="pill err">awaiting harness (hop 2)</span>` : ""}
  </div>
</div>`;

  // ---- toc ------------------------------------------------------------------
  const fbBox = `<div class="fb-box">
    <label>Feedback → harness</label>
    <textarea id="fb-text" rows="2" placeholder="read right, type here…"></textarea>
    <button onclick="sendFeedback()">Send feedback</button>
    <div id="fb-status" class="mut"></div>
  </div>`;
  const toc = `<aside class="toc">
  <div class="toc-title">${proj}</div>
  ${fbBox}
  <a class="toc-item" onclick="openPanel('wiki')">Wiki <span class="badge" id="wiki-badge">…</span></a>
  <a class="toc-item" onclick="openPanel('references')">References <span class="badge" id="refs-badge">…</span></a>
  <a class="toc-item" onclick="openPanel('explorations')">Explorations <span class="badge" id="explo-badge">…</span></a>
  <a class="toc-item" onclick="openPanel('framing')">Framing <span class="badge" id="framing-badge">…</span></a>
  <a class="toc-item" onclick="openPanel('deliverables')">Deliverables <span class="badge" id="deliv-badge">…</span></a>
  <a class="toc-item ${decisions.length ? "att" : ""}" onclick="openPanel('decisions')">Decisions <span class="badge ${decisions.length ? "warn" : ""}">${decisions.length}</span></a>
  ${stageToc}
  <a class="toc-item ${openGaps.length ? "att" : ""}" onclick="openPanel('gaps')">Gaps <span class="badge ${openGaps.length ? "warn" : ""}">${openGaps.length} open</span></a>
  <a class="toc-item" id="fb-toc" onclick="openPanel('feedback')">Feedback <span class="badge" id="fb-badge2">…</span></a>
  <a class="toc-item" onclick="openPanel('cross')">Cross-cycle <span class="badge">${(opts.crossCycle ?? []).length}</span></a>
  </aside>`;

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>${proj} — deliberatory</title>
<style>
:root{color-scheme:dark}
body{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;background:#0f1115;color:#d7dae0;margin:0}
.layout{display:flex;align-items:flex-start}
.toc{position:sticky;top:0;height:100vh;overflow-y:auto;width:240px;min-width:240px;border-right:1px solid #23272f;padding:16px 12px;background:#10131a;box-sizing:border-box;display:flex;flex-direction:column}
.toc-title{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#8b93a3;margin:0 6px 12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.toc-item{display:flex;justify-content:space-between;align-items:center;gap:6px;padding:6px 8px;border-radius:6px;color:#aab2c0;text-decoration:none;font-size:12px;cursor:pointer;margin:1px 0}
.toc-item:hover{background:#1a1f28;color:#d7dae0}
.toc-item.att{color:#f2c14e}
.main{flex:1;max-width:860px;padding:14px 22px 60px}
#reader-wrap{margin:0 0 12px}
.reader-bar{display:flex;justify-content:space-between;align-items:center;font-size:11px;color:#8b93a3;padding:6px 10px;background:#171a21;border:1px solid #23272f;border-bottom:0;border-radius:8px 8px 0 0}
.reader-bar button{background:#23272f;color:#aab2c0;border:1px solid #2c313c;border-radius:4px;cursor:pointer;font:inherit;font-size:11px;padding:2px 8px}
#reader-frame{width:100%;height:480px;border:1px solid #23272f;border-radius:0 0 8px 8px;background:#0f1115;box-sizing:border-box}
.topbar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:10px 0 4px;border-bottom:1px solid #23272f;margin-bottom:12px}
.topbar h1{font-size:15px;margin:0 8px 0 0}
.counts{display:flex;gap:6px;flex-wrap:wrap;font-size:11px}
.panel{border:1px solid #23272f;border-radius:8px;margin:10px 0;overflow:hidden;background:#0f1115}
.panel.attention{border-left:3px solid #f2c14e}
.panel>h2{font-size:11px;text-transform:uppercase;letter-spacing:.09em;color:#8b93a3;margin:0;padding:9px 14px;background:#171a21}
details.panel summary{display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:#171a21;cursor:pointer;font-size:11px;text-transform:uppercase;letter-spacing:.09em;color:#8b93a3;user-select:none}
details.panel summary:hover{color:#d7dae0}
details.panel[open] summary{border-bottom:1px solid #23272f}
.panel .body{padding:8px 14px 12px}
.panel details{margin-top:8px}
details summary{cursor:pointer;color:#aab2c0;font-size:12px;padding:2px 0;user-select:none}
.row{display:flex;gap:10px;align-items:center;padding:5px 0;border-bottom:1px solid #171a21;font-size:12px}
.row:last-child{border-bottom:none}
.id{min-width:46px;font-weight:600;color:#d7dae0}
.phase{min-width:52px;color:#aab2c0}
.src{margin-left:auto;color:#5b6472;font-size:11px;text-align:right;max-width:40%}
.pill{display:inline-block;padding:1px 8px;border-radius:10px;font-size:11px;white-space:nowrap}
.pill.ok{background:#12311c;color:#6fdc8c}.pill.warn{background:#3a2d10;color:#f2c14e}.pill.err{background:#3a1420;color:#f77}.pill.mut{background:#23272f;color:#aab2c0}.pill.stage{background:#14283c;color:#7fb3e8}.pill.phase{background:#1c2440;color:#9fb4f2}
.badge{background:#23272f;border-radius:9px;padding:1px 8px;font-size:10px;color:#aab2c0}
.badge.warn{background:#3a2d10;color:#f2c14e}.badge.err{background:#3a1420;color:#f77}
.mut{color:#8b93a3;font-size:12px}
.live{position:fixed;bottom:0;left:240px;right:0;font-size:11px;color:#8b93a3;background:#12151b;padding:6px 20px;border-top:1px solid #23272f}
a{color:#6db3f2}
/* feedback box in the sidebar — read right, type left */
.fb-box{margin-top:8px;margin-bottom:8px;border:1px solid #23272f;border-radius:8px;padding:8px}
.fb-box label{font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#8b93a3;display:block;margin-bottom:6px}
.fb-box textarea{width:100%;background:#171a21;color:#d7dae0;border:1px solid #2c313c;border-radius:4px;padding:6px;font:inherit;font-size:11px;min-height:90px;resize:vertical;box-sizing:border-box}
.fb-box button{margin-top:6px;padding:4px 10px;background:#1c5c33;color:#fff;border:0;border-radius:4px;cursor:pointer;font:inherit;font-size:11px;display:block}
.fb-box .ok{color:#6fdc8c;font-size:11px}.fb-box .err{color:#f77;font-size:11px}
#fb-status{font-size:11px;margin-top:5px;overflow-wrap:anywhere}
#fb-status button{display:inline;margin-left:6px;padding:2px 6px;background:#23272f;color:#aab2c0;border:1px solid #2c313c;border-radius:4px;font-size:10px;cursor:pointer}
#chat-view .err{color:#f77;font-size:12px}
#chat-view h3{margin:12px 0 4px;font-size:13px}
</style></head><body>
<div class="layout">
${toc}
<div class="main">
${header}
<div id="reader-wrap" hidden><div class="reader-bar"><span id="reader-name"></span><button onclick="closeReader()">close ✕</button></div><iframe id="reader-frame" title="file view"></iframe></div>
<details class="panel" id="wiki"><summary>Wiki (shared knowledge, before stages) <span class="badge" id="wiki-badge2">…</span></summary><div class="body" id="wiki-body"><span class="mut">loading…</span> · <a href="/files/workbench/wiki/index.html">open full wiki ↗</a></div></details>
<details class="panel" id="references"><summary>References (evidence) <span class="badge" id="refs-badge2">…</span></summary><div class="body" id="refs-body"><span class="mut">loading…</span></div></details>
<details class="panel" id="explorations"><summary>Explorations (ideas, promotable) <span class="badge" id="explo-badge2">…</span></summary><div class="body" id="explo-body"><span class="mut">loading…</span></div></details>
<details class="panel" id="framing"><summary>Framing (principles · constraints · deliverables · boundaries · uncertainties) <span class="badge" id="framing-badge2">…</span></summary><div class="body" id="framing-body"><span class="mut">loading…</span></div></details>
<details class="panel" id="deliverables"><summary>Deliverables (output package — dist/) <span class="badge" id="deliv-badge2">…</span></summary><div class="body" id="deliv-body"><span class="mut">loading…</span></div></details>
${workPanel}
${decisionsPanel}
${gapsPanel}
${crossPanel}
<details class="panel" id="feedback"><summary>Feedback engine (pending → harness) <span class="badge" id="fb-badge">…</span></summary><div class="body" id="fb-body"><span class="mut">loading…</span></div></details>
</div>
</div>
<div class="live" id="live"></div>
<script>
function openPanel(id){const el=document.getElementById(id);if(el){el.open=true;el.scrollIntoView({behavior:"smooth",block:"start"});}}
const live=document.getElementById("live");let reloadTimer=null;
const FB_TOKEN=new URLSearchParams(location.search).get("token")||"";
try{
  const es=new EventSource("/api/events");
  es.onmessage=(e)=>{let d={};try{d=JSON.parse(e.data);}catch{return;}
    if(d.type==="feedback:new"){if(typeof loadFeedback==="function"){loadFeedback();live.textContent="↻ feedback pending — see the Feedback panel";}return;}
    if(d.type!=="changed")return;if(reloadTimer)return;
    live.textContent="↻ state changed "+new Date().toLocaleTimeString()+" — re-reading files (A7)";
    reloadTimer=setTimeout(()=>{reloadTimer=null;location.reload();},350);};
  es.onerror=()=>{live.textContent="SSE disconnected — reload to refresh";};
}catch{live.textContent="SSE unavailable — manual reload";}
// feedback → harness (capture-export-remind): write a canonical handoff; reminder auto-copied
let lastReminder="";
async function sendFeedback(){
  const ta=document.getElementById("fb-text");
  const text=ta.value.trim();
  const st=document.getElementById("fb-status");
  if(!text){st.innerHTML='<span class="err">write something first</span>';return;}
  try{
    const r=await fetch("/api/forms/harness-feedback"+(FB_TOKEN?"?token="+FB_TOKEN:""),{method:"POST",
      headers:{"content-type":"application/x-www-form-urlencoded","X-Feedback-Token":FB_TOKEN},
      body:new URLSearchParams({feedback:text})});
    const d=await r.json();
    if(d.ok&&d.prompt){
      localStorage.removeItem("fb-draft");
      ta.value="";
      lastReminder=d.prompt;
      st.innerHTML='<span class="ok">✔ '+d.path.split("/").pop()+'</span> <button onclick="copyReminder()">copy reminder</button>';
      try{await navigator.clipboard.writeText(d.prompt);}catch{}
    } else { st.innerHTML='<span class="err">✗ '+(d.error||"write failed")+'</span>'; }
  }catch(e){
    st.innerHTML='<span class="err">✗ server not reachable — restart <b>npm run serve</b> (your draft is saved)</span>';
  }
}
function copyReminder(){if(lastReminder){navigator.clipboard.writeText(lastReminder).catch(function(){});}}
// in-cockpit markdown reader: render inline via srcdoc (no separate navigation — robust)
const READER_STYLE='<style>:root{color-scheme:dark}html,body{margin:0;padding:0;background:#0f1115}.md-inline{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;padding:8px 12px 32px;background:#0f1115;color:#d7dae0}.md-inline h1,.md-inline h2,.md-inline h3{color:#e6e9ef;border-bottom:1px solid #23272f;padding-bottom:4px}.md-inline code{font-family:ui-monospace,Menlo,monospace;background:#171a21;border:1px solid #23272f;border-radius:4px;padding:1px 5px;font-size:12px}.md-inline pre{background:#171a21;border:1px solid #23272f;border-radius:6px;padding:10px;overflow-x:auto}.md-inline pre code{border:0}.md-inline table{border-collapse:collapse}.md-inline td,.md-inline th{border:1px solid #23272f;padding:5px 9px}.md-inline blockquote{border-left:3px solid #2c313c;margin:0;padding-left:12px;color:#8b93a3}.md-inline a{color:#6db3f2}.md-inline .mut{color:#8b93a3;font-size:12px}</style>';
async function openReader(rel){
  const wrap=document.getElementById("reader-wrap");
  document.getElementById("reader-name").textContent=rel;
  wrap.hidden=false;
  const fr=document.getElementById("reader-frame");
  fr.srcdoc="<p style='color:#8b93a3'>loading…</p>";
  try{
    const r=await fetch("/view?path="+encodeURIComponent(rel)+"&inline=1");
    if(!r.ok) throw new Error("HTTP "+r.status);
    const html=await r.text();
    fr.srcdoc=READER_STYLE+html;
  }catch(e){ fr.srcdoc=READER_STYLE+"<p style='color:#f77'>✗ could not load: "+e+"</p>"; }
}
function closeReader(){
  document.getElementById("reader-wrap").hidden=true;
  document.getElementById("reader-frame").src="about:blank";
}
// wiki panel: shared knowledge across projects/cycles, rendered inline
async function loadWiki(){
  try{
    const r=await fetch("/api/wiki");const d=await r.json();
    for(const b of document.querySelectorAll("#wiki-badge,#wiki-badge2"))b.textContent=d.topics.length;
    const fam=new Map();
    d.topics.forEach(function(t){const l=fam.get(t.family)||[];l.push(t);fam.set(t.family,l);});
    const el=document.getElementById("wiki-body");
    let html='';
    fam.forEach(function(list,f){
      html+='<h3 style="margin:10px 0 4px;font-size:12px;color:#8b93a3">'+f+'</h3>';
      html+=list.map(function(t){return '<div class="row"><a href="#" onclick="openReader(&#39;'+t.rel+'&#39;);return false;" title="open in the reader">'+t.title+'</a>'+(t.shared?' <span class="mut">(shared)</span>':'')+'</div>';}).join('');
    });
    el.innerHTML=html||'<span class="mut">no wiki topics yet</span> · <a href="/files/workbench/wiki/index.html">open full wiki ↗</a>';
  }catch(e){document.getElementById("wiki-body").innerHTML='<span class="err">'+e+'</span>';}
}
if(document.getElementById("wiki-body"))loadWiki();
// references + explorations panels (like the wiki: project + shared, open in the reader)
async function loadItems(ep, badgeSel, bodyId){
  try{
    const r=await fetch(ep);const d=await r.json();
    for(const b of document.querySelectorAll(badgeSel))b.textContent=d.items.length;
    const el=document.getElementById(bodyId);
    el.innerHTML=d.items.map(function(t){return '<div class="row"><a href="#" onclick="openReader(&#39;'+t.rel+'&#39;);return false;" title="open in the reader">'+t.name+'</a>'+(t.shared?' <span class="mut">(shared)</span>':'')+'</div>';}).join('')||'<span class="mut">none</span>';
  }catch(e){document.getElementById(bodyId).innerHTML='<span class="err">'+e+'</span>';}
}
if(document.getElementById("refs-body"))loadItems("/api/references","#refs-badge,#refs-badge2","refs-body");
if(document.getElementById("explo-body"))loadItems("/api/explorations","#explo-badge,#explo-badge2","explo-body");
// framing panel: surface the frame's principles/constraints/deliverables/boundaries/uncertainties
// so the human can read them and give direct feedback in the sidebar box
async function loadFraming(){
  try{
    const r=await fetch("/api/framing");const d=await r.json();
    const total=d.principles.length+d.constraints.length+d.deliverables.length+d.boundaries.length+d.uncertainties.length;
    for(const b of document.querySelectorAll("#framing-badge,#framing-badge2"))b.textContent=total;
    const el=document.getElementById("framing-body");
    const sec=function(title,list){return list.length
      ? '<h3 style="margin:10px 0 4px;font-size:12px;color:#8b93a3">'+title+' ('+list.length+')</h3>'+list.map(function(t){return '<div class="row"><span class="id">'+t.id+'</span><a href="#" onclick="openReader(&#39;handoffs/'+t.source+'&#39;);return false;" title="open source">'+t.text.replace(/&/g,"&amp;").replace(/</g,"&lt;")+'</a><span class="mut src">'+t.source+'</span></div>';}).join('')
      : '';};
    el.innerHTML=sec("Principles",d.principles)+sec("Constraints",d.constraints)+sec("Deliverables",d.deliverables)+sec("Boundaries — what this is NOT",d.boundaries)+sec("Uncertainty markers",d.uncertainties)||'<span class="mut">no framing inputs extracted</span>';
  }catch(e){document.getElementById("framing-body").innerHTML='<span class="err">'+e+'</span>';}
}
if(document.getElementById("framing-body"))loadFraming();
// deliverables panel: the project's output package (dist/) — read the actual deliverables
async function loadDeliverables(){
  try{
    const r=await fetch("/api/deliverables");const d=await r.json();
    for(const b of document.querySelectorAll("#deliv-badge,#deliv-badge2"))b.textContent=d.items.length;
    const el=document.getElementById("deliv-body");
    el.innerHTML=d.items.map(function(t){return '<div class="row"><a href="#" onclick="openReader(&#39;'+t.rel+'&#39;);return false;" title="open in the reader">'+t.name+'</a><span class="mut src">'+t.ext+'</span></div>';}).join('')||'<span class="mut">no deliverables yet</span>';
  }catch(e){document.getElementById("deliv-body").innerHTML='<span class="err">'+e+'</span>';}
}
if(document.getElementById("deliv-body"))loadDeliverables();
// the automatic feedback engine: pending items, with a mark-addressed action
async function loadFeedback(){
  const badges=document.querySelectorAll("#fb-badge,#fb-badge2");
  try{
    const r=await fetch("/api/feedback/pending"+(FB_TOKEN?"?token="+FB_TOKEN:""));const d=await r.json();
    const items=(d.ok&&d.items)||[];
    for(const b of badges)b.textContent=items.length;
    const el=document.getElementById("fb-body");
    if(!items.length){el.innerHTML='<span class="mut">no pending feedback — the loop is quiet</span>';return;}
    el.innerHTML=items.map(function(i){return '<div class="row"><span class="id">'+i.id+'</span><a href="#" onclick="openReader(&#39;handoffs/'+i.file+'&#39;);return false;" title="open in the reader">'+i.file+'</a><span class="mut src">'+i.kind+' · '+i.author+' · '+i.date+'</span>'+(i.reply?'<a href="#" onclick="openReader(&#39;'+i.reply+'&#39;);return false;" title="the harness reply">↩ reply</a>':'')+'<button onclick="addressFeedback(&#39;'+i.id+'&#39;)">mark addressed</button></div>';}).join('');
    loadReplies();
  }catch(e){for(const b of badges)b.textContent="?";document.getElementById("fb-body").innerHTML='<span class="err">'+e+'</span>';}
}
async function loadReplies(){
  try{
    const r=await fetch("/api/feedback/list"+(FB_TOKEN?"?token="+FB_TOKEN:""));const d=await r.json();
    const replied=(d.ok&&d.items)||[];
    const withR=replied.filter(function(i){return i.status==="addressed"&&i.reply;}).slice(0,5);
    const el=document.getElementById("fb-body");
    if(withR.length){
      el.insertAdjacentHTML("beforeend",'<h3 style="margin:12px 0 4px;font-size:12px;color:#8b93a3">recent replies from the harness</h3>'+withR.map(function(i){return '<div class="row"><span class="id">'+i.id+'</span><a href="#" onclick="openReader(&#39;'+i.reply+'&#39;);return false;" title="open the reply">↩ '+i.reply+'</a><span class="mut src">'+i.addressedBy+' · '+i.addressedAt+'</span></div>';}).join(''));
    }
  }catch(e){}
}
async function addressFeedback(id){
  const r=await fetch("/api/feedback/address"+(FB_TOKEN?"?token="+FB_TOKEN:""),{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded","X-Feedback-Token":FB_TOKEN},body:new URLSearchParams({id:id})});
  await loadFeedback();
}
if(document.getElementById("fb-body")){loadFeedback();setInterval(loadFeedback,15000);}
// draft autosave: a failed submit never loses your text
(function(){const ta=document.getElementById("fb-text");if(ta){ta.value=localStorage.getItem("fb-draft")||"";ta.addEventListener("input",function(){localStorage.setItem("fb-draft",ta.value);});}})();
</script>
</body></html>`;
}

function newProjectHint(proj: string): string {
  return `<p class="mut">No handoffs yet — new project. Two ways to start Frame:<br>
  • <a href="/form/framing">open the framing capture form</a> (workbench), or<br>
  • tell your harness: <i>“Follow fpev-deliberatory — conventions at ${conventionsRef()}. We’re working on ${proj}, v1, stage 1. Let’s start the Frame triptych.”</i><br>
  The workbench attaches to any project directory — existing or empty (P2).</p>`;
}
