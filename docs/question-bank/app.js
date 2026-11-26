/* AIP-C01 Question Bank — static, no build step, progress in localStorage */
(function () {
  "use strict";

  /* ---------- constants ---------- */
  const KEY = "aipc01.qb.v1";
  const DOMAINS = {
    1: { name: "Foundation Model Integration, Data Management & Compliance", short: "FM Integration & Data", weight: 31 },
    2: { name: "Implementation and Integration", short: "Implementation", weight: 26 },
    3: { name: "AI Safety, Security, and Governance", short: "Safety & Governance", weight: 20 },
    4: { name: "Operational Efficiency and Optimization", short: "Optimization", weight: 12 },
    5: { name: "Testing, Validation, and Troubleshooting", short: "Testing & Troubleshooting", weight: 11 },
  };
  const TASKS = {
    "1.1": "Analyze requirements and design GenAI solutions",
    "1.2": "Select and configure FMs",
    "1.3": "Data validation and processing pipelines for FMs",
    "1.4": "Design and implement vector store solutions",
    "1.5": "Design retrieval mechanisms for FM augmentation",
    "1.6": "Prompt engineering strategies and governance",
    "2.1": "Agentic AI solutions and tool integrations",
    "2.2": "Model deployment strategies",
    "2.3": "Enterprise integration architectures",
    "2.4": "FM API integrations",
    "2.5": "Application integration patterns and dev tools",
    "3.1": "Input and output safety controls",
    "3.2": "Data security and privacy controls",
    "3.3": "AI governance and compliance mechanisms",
    "3.4": "Responsible AI principles",
    "4.1": "Cost optimization and resource efficiency",
    "4.2": "Optimize application performance",
    "4.3": "Monitoring systems for GenAI applications",
    "5.1": "Evaluation systems for GenAI",
    "5.2": "Troubleshoot GenAI applications",
  };
  const EXAM_TOTAL = 75, EXAM_SCORED = 65, PASS_SCALED = 750, SEC_PER_Q = 90;
  const NUMWORD = { 2: "TWO", 3: "THREE", 4: "FOUR" };

  const Q = (window.QB || []).slice().sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
  const BYID = Object.fromEntries(Q.map((q) => [q.id, q]));

  /* ---------- persistence ---------- */
  const defaults = () => ({ attempts: [], qstats: {}, notes: {}, bookmarks: {}, session: null, theme: "dark", themeSet: false, examMin: 130 });
  let S = defaults();
  try { S = Object.assign(defaults(), JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (e) { /* ignore */ }
  if (!S.themeSet) S.theme = "dark"; // dark by default until the user picks a theme explicitly
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* quota */ } };
  document.documentElement.dataset.theme = S.theme;

  /* ---------- helpers ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const fmt = (s) => esc(s).replace(/`([^`]+)`/g, "<code>$1</code>");
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pct = (a, b) => (b ? Math.round((100 * a) / b) : 0);
  const mmss = (s) => { s = Math.max(0, Math.round(s)); const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60; return (h ? h + ":" + String(m).padStart(2, "0") : m) + ":" + String(x).padStart(2, "0"); };
  const barCls = (p) => (p >= 75 ? "ok" : p >= 55 ? "warn" : "bad");
  const sameSet = (a, b) => a.length === b.length && a.every((x) => b.includes(x));
  const taskOf = (q) => q.task;
  const poolCount = (f) => Q.filter(f).length;

  /* ---------- state ---------- */
  let view = "home";
  let viewArg = null;
  let sess = null;           // active session (mirrors S.session)
  let ticker = null;
  let setup = null;
  let confirmCb = null;
  let resultsFilter = "all";
  let browse = { domain: "", task: "", text: "", bookmarked: false, tag: "" };

  function initSetup(preset) {
    setup = {
      tasks: Object.fromEntries(Object.keys(TASKS).map((t) => [t, false])),
      diff: { easy: true, medium: true, hard: true },
      src: "all", n: 20, timer: false, mins: "", feedback: "instant", shuffleQ: true, shuffleC: false,
    };
    if (preset && preset.tasks) preset.tasks.forEach((t) => (setup.tasks[t] = true));
    else Object.keys(TASKS).forEach((t) => (setup.tasks[t] = true));
    if (preset && preset.n) setup.n = preset.n;
    if (preset && preset.src) setup.src = preset.src;
  }
  function setupPool() {
    return Q.filter((q) => {
      if (!setup.tasks[q.task]) return false;
      if (!setup.diff[q.difficulty]) return false;
      const st = S.qstats[q.id];
      if (setup.src === "unseen") return !st;
      if (setup.src === "wrong") return st && !st.last;
      if (setup.src === "bookmarked") return !!S.bookmarks[q.id];
      return true;
    });
  }

  /* ---------- session control ---------- */
  function startSession(cfg) {
    const ids = cfg.qids;
    if (!ids.length) return toast("No questions match those filters.");
    const order = {};
    ids.forEach((id) => { const q = BYID[id]; const cids = q.choices.map((c) => c.id); order[id] = cfg.shuffleC ? shuffle(cids) : cids; });
    const unscored = {};
    if (cfg.kind === "exam" && ids.length >= EXAM_TOTAL) shuffle(ids).slice(0, EXAM_TOTAL - EXAM_SCORED).forEach((id) => (unscored[id] = true));
    sess = {
      kind: cfg.kind, title: cfg.title, qids: ids, order, answers: {}, flags: {}, locked: {}, unscored,
      idx: 0, feedback: cfg.feedback, timer: cfg.timer, duration: cfg.duration || 0, elapsed: 0,
      lastTick: Date.now(), started: Date.now(), reviewing: false,
    };
    S.session = sess; save();
    go("test");
  }
  function sessionLeft() { return sess.duration - sess.elapsed; }
  function tick() {
    if (!sess || view !== "test") return;
    const now = Date.now();
    sess.elapsed += (now - sess.lastTick) / 1000;
    sess.lastTick = now;
    const el = $("#timer");
    if (el) {
      if (sess.timer) { const left = sessionLeft(); el.textContent = "⏱ " + mmss(left); el.classList.toggle("low", left < 300); }
      else el.textContent = "⏱ " + mmss(sess.elapsed);
    }
    if (sess.timer && sessionLeft() <= 0) { toast("Time is up — submitting."); finish(true); return; }
    if (Math.round(sess.elapsed) % 10 === 0) save();
  }
  function startTicker() { stopTicker(); ticker = setInterval(tick, 1000); }
  function stopTicker() { if (ticker) clearInterval(ticker); ticker = null; }

  function isCorrect(q, given) { return !!given && given.length > 0 && sameSet(given, q.answer); }

  function finish() {
    tick();
    const res = {}; const byD = {}, byT = {};
    let correct = 0, scored = 0;
    sess.qids.forEach((id) => {
      const q = BYID[id], given = sess.answers[id] || [], ok = isCorrect(q, given), un = !!sess.unscored[id];
      res[id] = { given, ok, un, flag: !!sess.flags[id] };
      const stt = S.qstats[id] || { seen: 0, correct: 0 };
      stt.seen++; if (ok) stt.correct++; stt.last = ok; stt.ts = Date.now(); S.qstats[id] = stt;
      if (un) return;
      scored++; if (ok) correct++;
      (byD[q.domain] = byD[q.domain] || { c: 0, t: 0 }).t++; if (ok) byD[q.domain].c++;
      (byT[q.task] = byT[q.task] || { c: 0, t: 0 }).t++; if (ok) byT[q.task].c++;
    });
    const p = scored ? correct / scored : 0;
    const att = {
      id: "a" + Date.now(), ts: Date.now(), kind: sess.kind, title: sess.title, total: scored, correct, pct: Math.round(p * 100),
      scaled: Math.round(100 + 900 * p), byD, byT, secs: Math.round(sess.elapsed), duration: sess.timer ? sess.duration : 0,
      unscoredCount: sess.qids.length - scored, qids: sess.qids, res,
    };
    S.attempts.unshift(att); S.attempts = S.attempts.slice(0, 60);
    S.session = null; sess = null; stopTicker(); save();
    resultsFilter = "all";
    go("results", att.id);
  }

  /* ---------- navigation / render ---------- */
  function go(v, arg) {
    view = v; viewArg = arg || null;
    if (v === "setup" && !setup) initSetup();
    render(); window.scrollTo(0, 0);
  }
  function render() {
    const app = $("#app");
    const tb = $("#topbar");
    tb.classList.toggle("exam-mode", view === "test");
    document.querySelectorAll(".topnav button[data-view]").forEach((b) => b.classList.toggle("active", b.dataset.view === view));
    if (view !== "test") stopTicker();
    const fn = { home: vHome, setup: vSetup, test: vTest, results: vResults, browse: vBrowse, history: vHistory }[view];
    app.innerHTML = fn();
    if (view === "test") startTicker();
  }
  function toast(msg) {
    const m = $("#modal");
    m.innerHTML = `<div class="box"><p>${esc(msg)}</p><div class="row"><button class="btn primary" data-act="closeModal">OK</button></div></div>`;
    m.classList.remove("hidden");
  }
  function ask(html, cb, yes = "Confirm") {
    confirmCb = cb;
    const m = $("#modal");
    m.innerHTML = `<div class="box">${html}<div class="row"><button class="btn" data-act="closeModal">Cancel</button><button class="btn primary" data-act="confirmYes">${esc(yes)}</button></div></div>`;
    m.classList.remove("hidden");
  }

  /* ---------- stats ---------- */
  function statFor(f) {
    let seen = 0, correct = 0, total = 0;
    Q.forEach((q) => { if (!f(q)) return; total++; const s = S.qstats[q.id]; if (s) { seen += s.seen; correct += s.correct; } });
    return { total, seen, correct, acc: pct(correct, seen) };
  }

  /* ---------- views ---------- */
  function vHome() {
    const totSeen = Object.keys(S.qstats).length;
    const allSt = statFor(() => true);
    const resume = S.session && S.session.qids ? S.session : null;
    const weak = Object.keys(TASKS).map((t) => ({ t, ...statFor((q) => q.task === t) })).filter((x) => x.seen > 0 && x.total > 0).sort((a, b) => a.acc - b.acc).slice(0, 4);
    const recent = S.attempts.slice(0, 12).reverse();
    return `
    <section class="hero">
      <h1>Prepare for AIP-C01, the way the exam asks</h1>
      <p>${Q.length} scenario questions across 5 domains and 20 tasks. Drill a task, sit a timed domain test, or take a full ${EXAM_TOTAL}-question mock exam.</p>
      <div class="row">
        <button class="btn primary" data-act="examStart">Full-length exam</button>
        <button class="btn" data-act="goSetup">Custom practice</button>
        <button class="btn" data-act="quick" data-mode="weak">Quick 10: weak spots</button>
        <button class="btn" data-act="quick" data-mode="wrong">Redo past mistakes</button>
      </div>
    </section>
    ${resume ? `<div class="banner row spread"><div><b>Unfinished test:</b> ${esc(resume.title)} — question ${resume.idx + 1} of ${resume.qids.length}, ${Object.keys(resume.answers).length} answered.</div>
      <div class="row"><button class="btn primary small" data-act="resume">Resume</button><button class="btn danger small" data-act="discard">Discard</button></div></div>` : ""}
    <div class="grid cols-3">
      <div class="card"><small>Questions attempted</small><div class="stat">${totSeen}<small> / ${Q.length}</small></div><div class="bar"><i style="width:${pct(totSeen, Q.length)}%"></i></div></div>
      <div class="card"><small>Overall accuracy</small><div class="stat">${allSt.seen ? allSt.acc + "%" : "—"}</div><div class="bar ${barCls(allSt.acc)}"><i style="width:${allSt.acc}%"></i></div></div>
      <div class="card"><small>Tests completed</small><div class="stat">${S.attempts.length}</div>
        <div class="spark">${recent.map((a) => `<i class="${a.scaled >= PASS_SCALED ? "p" : ""}" style="height:${Math.max(6, a.pct)}%" title="${a.pct}%"></i>`).join("") || "<small>No attempts yet</small>"}</div></div>
    </div>

    <h2 class="section-title">Domains <small>(click to practice · weight = share of exam)</small></h2>
    <div class="grid cols-5">${Object.keys(DOMAINS).map((d) => {
      const st = statFor((q) => q.domain == d);
      return `<div class="card clickable" data-act="domainPractice" data-d="${d}">
        <span class="weight">${DOMAINS[d].weight}%</span><h3>Domain ${d}</h3>
        <div class="muted" style="min-height:3em">${esc(DOMAINS[d].short)}</div>
        <div class="bar ${st.seen ? barCls(st.acc) : ""}" style="margin:8px 0 4px"><i style="width:${st.acc}%"></i></div>
        <small>${st.total} questions · ${st.seen ? st.acc + "% accuracy" : "not started"}</small></div>`;
    }).join("")}</div>

    <div class="grid cols-2" style="margin-top:20px">
      <div class="card"><h2>Weakest tasks</h2>${weak.length ? weak.map((w) => `
        <div class="row spread" style="margin:8px 0"><div><b>${w.t}</b> ${esc(TASKS[w.t])}<div class="bar ${barCls(w.acc)}" style="width:220px;margin-top:4px"><i style="width:${w.acc}%"></i></div></div>
        <button class="btn small" data-act="taskPractice" data-t="${w.t}">Drill · ${w.acc}%</button></div>`).join("") : `<p class="muted">Take a few tests and your weakest tasks will show up here.</p>`}</div>
      <div class="card"><h2>Full-length exam</h2>
        <p class="muted">${EXAM_TOTAL} questions (${EXAM_SCORED} scored + ${EXAM_TOTAL - EXAM_SCORED} hidden unscored), domain mix follows the official weights. No feedback until you submit, just like the real thing.</p>
        <div class="field row"><label for="exmin" style="margin:0">Time limit (min)</label><input id="exmin" type="number" min="10" max="400" value="${S.examMin}" style="width:90px" data-input="examMin"></div>
        <button class="btn primary" data-act="examStart">Start full exam</button></div>
    </div>
    <p class="muted" style="margin-top:22px">Progress is stored in this browser. Questions tagged <span class="chip official">official</span> are transcribed from the AWS sample set; their answers are inferred unless stated.</p>`;
  }

  function vSetup() {
    const pool = setupPool();
    const n = Math.min(setup.n || 1, pool.length);
    const autoMin = Math.max(1, Math.ceil((n * SEC_PER_Q) / 60));
    const treeHtml = Object.keys(DOMAINS).map((d) => {
      const tasks = Object.keys(TASKS).filter((t) => t[0] === d);
      const allOn = tasks.every((t) => setup.tasks[t]);
      return `<div class="dom"><label><input type="checkbox" data-act="toggleDomain" data-d="${d}" ${allOn ? "checked" : ""}><b>Domain ${d} — ${esc(DOMAINS[d].short)}</b><span class="cnt">${poolCount((q) => q.domain == d)} Qs</span></label>
        <div class="tasks">${tasks.map((t) => `<label><input type="checkbox" data-act="toggleTask" data-t="${t}" ${setup.tasks[t] ? "checked" : ""}><span>${t} ${esc(TASKS[t])}</span><span class="cnt">${poolCount((q) => q.task === t)}</span></label>`).join("")}</div></div>`;
    }).join("");
    const seg = (key, vals) => `<div class="seg">${vals.map(([v, l]) => `<button data-act="set" data-k="${key}" data-v="${v}" class="${setup[key] === v ? "on" : ""}">${l}</button>`).join("")}</div>`;
    return `
    <h1>Practice test</h1><p class="muted">Pick the domains and sub-domains (tasks) to drill into, then choose how you want to be tested.</p>
    <div class="setup-grid">
      <div class="card tree"><div class="row spread"><h2>Scope</h2><span><button class="btn small" data-act="allTasks" data-v="1">All</button> <button class="btn small" data-act="allTasks" data-v="0">None</button></span></div>${treeHtml}</div>
      <div class="card">
        <h2>Options</h2>
        <div class="field"><label>Feedback</label>${seg("feedback", [["instant", "Instant (after each question)"], ["end", "At the end"]])}</div>
        <div class="field"><label>Timer</label>${seg("timer", [[false, "Off"], [true, "On"]])}
          ${setup.timer ? `<div class="row" style="margin-top:8px"><input type="number" min="1" max="400" style="width:90px" value="${setup.mins || autoMin}" data-input="mins"><small>minutes (default 1.5 min / question)</small></div>` : ""}</div>
        <div class="field"><label>Number of questions <small>(${pool.length} available)</small></label><input type="number" min="1" max="${Math.max(1, pool.length)}" value="${setup.n}" data-input="n"></div>
        <div class="field"><label>Question pool</label>${seg("src", [["all", "All"], ["unseen", "Unseen"], ["wrong", "Missed"], ["bookmarked", "★ Marked"]])}</div>
        <div class="field opts"><label>Difficulty</label>${["easy", "medium", "hard"].map((d) => `<label><input type="checkbox" data-act="toggleDiff" data-d="${d}" ${setup.diff[d] ? "checked" : ""}>${d}</label>`).join("")}</div>
        <div class="field opts"><label><input type="checkbox" data-act="toggleShuffle" data-k="shuffleQ" ${setup.shuffleQ ? "checked" : ""}>Shuffle questions</label><label><input type="checkbox" data-act="toggleShuffle" data-k="shuffleC" ${setup.shuffleC ? "checked" : ""}>Shuffle answer choices</label></div>
        <button class="btn primary" data-act="startPractice" ${pool.length ? "" : "disabled"}>Start · ${n} question${n === 1 ? "" : "s"}</button>
      </div>
    </div>`;
  }

  function curQ() { return BYID[sess.qids[sess.idx]]; }

  function choiceHtml(q, cid, label, locked) {
    const c = q.choices.find((x) => x.id === cid);
    const given = sess.answers[q.id] || [];
    const sel = given.includes(cid), isAns = q.answer.includes(cid);
    const multi = q.type === "multi";
    let cls = "choice " + (multi ? "check" : "radio") + (sel ? " sel" : "");
    let mark = sel ? "✓" : "";
    let why = "";
    if (locked) {
      cls += " locked";
      if (isAns) { cls += " correct"; mark = "✓"; }
      else if (sel) { cls += " wrong"; mark = "✕"; }
      if (!isAns && q.whyWrong && q.whyWrong[cid]) why = `<span class="why">${fmt(q.whyWrong[cid])}</span>`;
    }
    return `<div class="${cls}" data-act="pick" data-c="${cid}"><span class="mark">${mark}</span><div><span class="letter">${label}.</span>${fmt(c.text)}${why}</div></div>`;
  }

  function vTest() {
    if (!sess) return vHome();
    if (sess.reviewing) return vPreSubmit();
    const q = curQ(), id = q.id, n = sess.qids.length;
    const locked = !!sess.locked[id];
    const given = sess.answers[id] || [];
    const ok = locked && isCorrect(q, given);
    const labels = "ABCDEF";
    const need = q.answer.length;
    const hint = q.type === "multi" && !/select\s/i.test(q.stem) ? `<div class="pick-n">(Select ${NUMWORD[need] || need})</div>` : "";
    const left = sess.timer ? "⏱ " + mmss(sessionLeft()) : "⏱ " + mmss(sess.elapsed);
    const nav = sess.qids.map((qid, i) => {
      let c = "nv";
      if (i === sess.idx) c += " cur";
      if (sess.flags[qid]) c += " fl";
      if (sess.locked[qid]) c += isCorrect(BYID[qid], sess.answers[qid]) ? " ok" : " no";
      else if ((sess.answers[qid] || []).length) c += " ans";
      return `<button class="${c}" data-act="jump" data-i="${i}">${i + 1}</button>`;
    }).join("");
    const isLast = sess.idx === n - 1;
    const note = S.notes[id] || "";
    return `
    <div class="exam-head"><div><b>${esc(sess.title)}</b> <small>· ${sess.feedback === "instant" ? "instant feedback" : "feedback at end"}</small></div>
      <div class="row"><span class="timer ${sess.timer && sessionLeft() < 300 ? "low" : ""}" id="timer">${left}</span>
      <button class="btn small" data-act="pause">Save &amp; exit</button><button class="btn danger small" data-act="endTest">${sess.feedback === "end" ? "Review &amp; submit" : "End test"}</button></div></div>
    <div class="test-layout">
      <div class="card qcard">
        <div class="qmeta"><span>Question ${sess.idx + 1} of ${n}</span>
          <span><span class="chip">${q.task}</span><span class="chip ${q.difficulty}">${q.difficulty}</span>${q.source === "official" ? `<span class="chip official">official</span>` : ""}
          ${sess.feedback === "instant" || locked ? "" : ""}<button class="star ${S.bookmarks[id] ? "on" : ""}" data-act="bookmark" data-id="${id}" title="Bookmark for later">${S.bookmarks[id] ? "★" : "☆"}</button></span></div>
        <div class="stem">${fmt(q.stem)}</div>${hint}
        ${sess.order[id].map((cid, i) => choiceHtml(q, cid, labels[i], locked)).join("")}
        ${locked ? `<div class="feedback ${ok ? "ok" : "bad"}"><h3>${ok ? "✓ Correct" : "✕ Incorrect"} — answer: ${q.answer.map((a) => labels[sess.order[id].indexOf(a)]).join(", ")}</h3><div>${fmt(q.explanation)}</div>
          ${q.services && q.services.length ? `<div class="svc">${q.services.map((s) => `<span class="chip">${esc(s)}</span>`).join("")}</div>` : ""}</div>` : ""}
        <details class="note" ${note ? "open" : ""}><summary>My note</summary><textarea rows="2" data-input="note" data-id="${id}" placeholder="Why did you miss it? What to remember?">${esc(note)}</textarea></details>
        <div class="qfoot"><div class="grp"><button class="btn" data-act="prev" ${sess.idx === 0 ? "disabled" : ""}>← Previous</button>
          <button class="btn ${sess.flags[id] ? "danger" : ""}" data-act="flag">⚑ ${sess.flags[id] ? "Unflag" : "Flag for review"}</button></div>
          <div class="grp">${sess.feedback === "instant" && !locked ? `<button class="btn primary" data-act="check" ${given.length ? "" : "disabled"}>Check answer</button>` : ""}
          ${isLast ? `<button class="btn primary" data-act="endTest">${sess.feedback === "end" ? "Review &amp; submit" : "Finish"}</button>` : `<button class="btn ${locked || sess.feedback === "end" ? "primary" : ""}" data-act="next">Next →</button>`}</div></div>
      </div>
      <aside class="card"><h3>Question navigator</h3><div class="navgrid">${nav}</div>
        <div class="legend">${sess.feedback === "instant" ? "🟩 correct · 🟥 wrong · " : ""}🟦 answered · ⚑ flagged<br>Keys: ← → navigate · A–F select · F flag · Enter check</div></aside>
    </div>`;
  }

  function vPreSubmit() {
    const n = sess.qids.length;
    const unans = sess.qids.filter((id) => !(sess.answers[id] || []).length).length;
    const flagged = sess.qids.filter((id) => sess.flags[id]).length;
    return `
    <div class="exam-head"><div><b>${esc(sess.title)} — review</b></div><div class="row"><span class="timer" id="timer">${sess.timer ? "⏱ " + mmss(sessionLeft()) : "⏱ " + mmss(sess.elapsed)}</span></div></div>
    <div class="card"><h2>Review your answers</h2>
      <p>${n - unans} of ${n} answered · <b class="${unans ? "fail" : "pass"}">${unans} unanswered</b> · ${flagged} flagged. Unanswered questions score as incorrect (no penalty for guessing).</p>
      <table><tr><th>#</th><th>Question</th><th>Status</th><th></th></tr>
      ${sess.qids.map((id, i) => { const g = (sess.answers[id] || []).length;
        return `<tr class="click" data-act="jump" data-i="${i}"><td>${i + 1}</td><td>${esc(BYID[id].stem.slice(0, 110))}…</td><td>${g ? "Answered" : "<b class='fail'>Unanswered</b>"}</td><td>${sess.flags[id] ? "⚑" : ""}</td></tr>`; }).join("")}</table>
      <div class="row" style="margin-top:16px"><button class="btn" data-act="backToTest">← Back to questions</button><button class="btn primary" data-act="submit">Submit test</button></div></div>`;
  }

  /* review block (shared) */
  function revQ(q, given, extra) {
    const labels = "ABCDEF";
    const ok = isCorrect(q, given);
    const status = !given.length ? "skip" : ok ? "ok" : "no";
    return `<details class="card rev-q"><summary><span class="dot ${status}"></span><span class="qs"><b>${q.id}</b> ${extra || ""} — ${esc(q.stem.slice(0, 140))}${q.stem.length > 140 ? "…" : ""}</span></summary>
      <div class="stem" style="margin-top:12px">${fmt(q.stem)}</div>
      ${q.choices.map((c) => { const sel = given.includes(c.id), isA = q.answer.includes(c.id);
        const cls = "choice locked " + (q.type === "multi" ? "check" : "radio") + (isA ? " correct" : sel ? " wrong" : "") + (sel ? " sel" : "");
        return `<div class="${cls}"><span class="mark">${isA ? "✓" : sel ? "✕" : ""}</span><div><span class="letter">${c.id}.</span>${fmt(c.text)}${!isA && q.whyWrong && q.whyWrong[c.id] ? `<span class="why">${fmt(q.whyWrong[c.id])}</span>` : ""}</div></div>`; }).join("")}
      <div class="feedback ${ok ? "ok" : "bad"}"><h3>${ok ? "✓ Correct" : given.length ? "✕ Incorrect" : "Not answered"} — correct: ${q.answer.join(", ")}${given.length ? ` · you chose: ${given.join(", ")}` : ""}</h3><div>${fmt(q.explanation)}</div>
        <div class="svc">${(q.services || []).map((s) => `<span class="chip">${esc(s)}</span>`).join("")}${(q.tags || []).map((s) => `<span class="chip easy">#${esc(s)}</span>`).join("")}</div></div>
      <details class="note" ${S.notes[q.id] ? "open" : ""}><summary>My note</summary><textarea rows="2" data-input="note" data-id="${q.id}">${esc(S.notes[q.id] || "")}</textarea></details>
      <div style="margin-top:8px"><button class="btn small" data-act="bookmark" data-id="${q.id}">${S.bookmarks[q.id] ? "★ Bookmarked" : "☆ Bookmark"}</button></div></details>`;
  }

  function vResults() {
    const a = S.attempts.find((x) => x.id === viewArg);
    if (!a) return vHome();
    const passed = a.scaled >= PASS_SCALED;
    const color = passed ? "var(--ok)" : "var(--bad)";
    const list = a.qids.filter((id) => {
      const r = a.res[id];
      if (resultsFilter === "wrong") return !r.ok && r.given.length;
      if (resultsFilter === "skipped") return !r.given.length;
      if (resultsFilter === "flagged") return r.flag;
      return true;
    });
    const wrongIds = a.qids.filter((id) => !a.res[id].ok);
    const flt = (k, l) => `<button class="btn small ${resultsFilter === k ? "primary" : ""}" data-act="resFilter" data-k="${k}">${l}</button>`;
    return `
    <div class="card"><div class="row" style="gap:28px">
      <div class="score-ring" style="--p:${a.pct};--c:${color}"><span>${a.pct}%</span></div>
      <div><h1>${esc(a.title)}</h1>
        <p><b>${a.correct}</b> of <b>${a.total}</b> correct · time ${mmss(a.secs)}${a.duration ? " of " + mmss(a.duration) : ""}</p>
        <p>Estimated scaled score <b class="${passed ? "pass" : "fail"}">${a.scaled}</b> / 1000 — pass mark ${PASS_SCALED}. <small>(Linear estimate; AWS uses an undisclosed scaling model.)</small></p>
        ${a.unscoredCount ? `<p class="muted">${a.unscoredCount} hidden unscored question(s) were mixed in and excluded from this score, as on the real exam.</p>` : ""}
        <div class="row"><button class="btn primary" data-act="retryWrong" data-id="${a.id}" ${wrongIds.length ? "" : "disabled"}>Retry ${wrongIds.length} missed/skipped</button><button class="btn" data-act="goSetup">New test</button><button class="btn" data-act="go" data-view="home">Dashboard</button></div></div></div></div>
    <div class="grid cols-2" style="margin-top:16px">
      <div class="card"><h2>By domain</h2>${Object.keys(a.byD).sort().map((d) => { const x = a.byD[d], p = pct(x.c, x.t);
        return `<div style="margin:10px 0"><div class="row spread"><span>D${d} ${esc(DOMAINS[d].short)}</span><b>${x.c}/${x.t} · ${p}%</b></div><div class="bar ${barCls(p)}"><i style="width:${p}%"></i></div></div>`; }).join("")}</div>
      <div class="card"><h2>By task <small>(weakest first)</small></h2>${Object.keys(a.byT).sort((x, y) => a.byT[x].c / a.byT[x].t - a.byT[y].c / a.byT[y].t).map((t) => { const x = a.byT[t], p = pct(x.c, x.t);
        return `<div style="margin:8px 0"><div class="row spread"><span>${t} ${esc(TASKS[t])}</span><b>${x.c}/${x.t}</b></div><div class="bar ${barCls(p)}"><i style="width:${p}%"></i></div></div>`; }).join("")}</div>
    </div>
    <h2 class="section-title">Question review</h2>
    <div class="row">${flt("all", "All (" + a.qids.length + ")")}${flt("wrong", "Incorrect")}${flt("skipped", "Unanswered")}${flt("flagged", "Flagged")}</div>
    ${list.map((id) => revQ(BYID[id], a.res[id].given, a.res[id].un ? `<span class="chip">unscored</span>` : "")).join("") || `<p class="muted">Nothing in this filter.</p>`}`;
  }

  function vBrowse() {
    const tags = [...new Set(Q.flatMap((q) => q.tags || []))].sort();
    const t = browse.text.toLowerCase();
    const list = Q.filter((q) => (!browse.domain || q.domain == browse.domain) && (!browse.task || q.task === browse.task) && (!browse.tag || (q.tags || []).includes(browse.tag)) &&
      (!browse.bookmarked || S.bookmarks[q.id]) && (!t || (q.stem + q.choices.map((c) => c.text).join(" ") + (q.tags || []).join(" ") + (q.services || []).join(" ")).toLowerCase().includes(t)));
    return `<h1>Browse &amp; study</h1><p class="muted">Read any question with its answer and explanation. Click to expand.</p>
    <div class="filters">
      <select data-input="bDomain"><option value="">All domains</option>${Object.keys(DOMAINS).map((d) => `<option value="${d}" ${browse.domain == d ? "selected" : ""}>Domain ${d}</option>`).join("")}</select>
      <select data-input="bTask"><option value="">All tasks</option>${Object.keys(TASKS).filter((x) => !browse.domain || x[0] === browse.domain).map((x) => `<option value="${x}" ${browse.task === x ? "selected" : ""}>${x} ${esc(TASKS[x])}</option>`).join("")}</select>
      <select data-input="bTag"><option value="">All tags</option>${tags.map((x) => `<option ${browse.tag === x ? "selected" : ""}>${esc(x)}</option>`).join("")}</select>
      <input type="text" placeholder="Search text, service, tag…" value="${esc(browse.text)}" data-input="bText" id="bText">
      <label><input type="checkbox" data-act="bMarked" ${browse.bookmarked ? "checked" : ""}> ★ only</label></div>
    <p class="muted">${list.length} question(s)</p>
    ${list.map((q) => revQ(q, [], `<span class="chip">${q.task}</span><span class="chip ${q.difficulty}">${q.difficulty}</span>${q.source === "official" ? `<span class="chip official">official</span>` : ""}`)).join("")}`;
  }

  function vHistory() {
    const rows = S.attempts.map((a) => `<tr class="click" data-act="openAttempt" data-id="${a.id}"><td>${new Date(a.ts).toLocaleString()}</td><td>${esc(a.title)}</td><td>${a.correct}/${a.total}</td><td>${a.pct}%</td><td class="${a.scaled >= PASS_SCALED ? "pass" : "fail"}">${a.scaled}</td><td>${mmss(a.secs)}</td></tr>`).join("");
    return `<h1>History &amp; data</h1>
    <div class="card"><table><tr><th>When</th><th>Test</th><th>Score</th><th>%</th><th>Est. scaled</th><th>Time</th></tr>${rows || `<tr><td colspan="6" class="muted">No attempts yet.</td></tr>`}</table></div>
    <h2 class="section-title">Your data</h2>
    <div class="card"><p class="muted">Everything lives in this browser's localStorage. Export a backup to move it elsewhere.</p>
      <div class="row"><button class="btn" data-act="export">Export JSON</button><label class="btn">Import JSON<input type="file" accept="application/json" data-input="import" hidden></label><button class="btn danger" data-act="reset">Reset all progress</button></div></div>`;
  }

  /* ---------- actions ---------- */
  function buildFromSetup() {
    let pool = setupPool();
    if (setup.shuffleQ) pool = shuffle(pool);
    const n = Math.min(Math.max(1, +setup.n || 1), pool.length);
    pool = pool.slice(0, n);
    if (!setup.shuffleQ) pool.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
    const mins = +setup.mins || Math.max(1, Math.ceil((n * SEC_PER_Q) / 60));
    const tasks = Object.keys(setup.tasks).filter((t) => setup.tasks[t]);
    const doms = [...new Set(tasks.map((t) => t[0]))];
    const title = tasks.length === Object.keys(TASKS).length ? "Mixed practice" : doms.length === 1 && tasks.length === Object.keys(TASKS).filter((t) => t[0] === doms[0]).length ? `Domain ${doms[0]} practice` : tasks.length === 1 ? `Task ${tasks[0]} drill` : "Custom practice";
    startSession({ kind: "practice", title, qids: pool.map((q) => q.id), feedback: setup.feedback, timer: !!setup.timer, duration: mins * 60, shuffleC: setup.shuffleC });
  }

  function startExam() {
    const mins = Math.max(10, +S.examMin || 130);
    const w = [31, 26, 20, 12, 11];
    const byD = [1, 2, 3, 4, 5].map((d) => shuffle(Q.filter((q) => q.domain === d)));
    let want = w.map((x) => Math.round((EXAM_TOTAL * x) / 100));
    want[0] += EXAM_TOTAL - want.reduce((a, b) => a + b, 0);
    let picked = []; let short = 0;
    byD.forEach((arr, i) => { const take = Math.min(want[i], arr.length); picked.push(...arr.slice(0, take)); short += want[i] - take; });
    if (short > 0) { const rest = shuffle(byD.flatMap((arr, i) => arr.slice(Math.min(want[i], arr.length)))); picked.push(...rest.slice(0, short)); }
    picked = shuffle(picked);
    const run = () => startSession({ kind: "exam", title: "Full-length exam", qids: picked.map((q) => q.id), feedback: "end", timer: true, duration: mins * 60, shuffleC: false });
    if (picked.length < EXAM_TOTAL) ask(`<h3>Smaller exam</h3><p>The bank has only ${picked.length} questions so this exam will have ${picked.length}, not ${EXAM_TOTAL}.</p>`, run, "Start anyway");
    else ask(`<h3>Start full-length exam?</h3><p>${EXAM_TOTAL} questions, ${mins} minutes, no feedback until you submit.</p>`, run, "Start exam");
  }

  function quick(mode) {
    let pool = Q.filter((q) => (mode === "wrong" ? S.qstats[q.id] && !S.qstats[q.id].last : true));
    if (mode === "weak") {
      const weakTasks = Object.keys(TASKS).map((t) => ({ t, ...statFor((q) => q.task === t) })).filter((x) => x.seen > 0).sort((a, b) => a.acc - b.acc).slice(0, 3).map((x) => x.t);
      const wp = Q.filter((q) => weakTasks.includes(q.task));
      pool = wp.length ? wp : Q.filter((q) => !S.qstats[q.id]);
      if (!pool.length) pool = Q;
    }
    if (!pool.length) return toast("Nothing to review yet — take a test first.");
    pool = shuffle(pool).slice(0, 10);
    startSession({ kind: "practice", title: mode === "wrong" ? "Redo past mistakes" : "Quick 10: weak spots", qids: pool.map((q) => q.id), feedback: "instant", timer: false, duration: 0, shuffleC: false });
  }

  function pick(cid) {
    const q = curQ(); if (sess.locked[q.id]) return;
    const cur = sess.answers[q.id] || [];
    if (q.type === "multi") sess.answers[q.id] = cur.includes(cid) ? cur.filter((x) => x !== cid) : [...cur, cid];
    else sess.answers[q.id] = [cid];
    save(); render();
  }

  const A = {
    go: (el) => go(el.dataset.view),
    theme: () => { S.theme = S.theme === "dark" ? "light" : "dark"; S.themeSet = true; document.documentElement.dataset.theme = S.theme; save(); },
    closeModal: () => $("#modal").classList.add("hidden"),
    confirmYes: () => { $("#modal").classList.add("hidden"); const cb = confirmCb; confirmCb = null; if (cb) cb(); },
    examStart: () => startExam(),
    goSetup: () => { initSetup(); go("setup"); },
    quick: (el) => quick(el.dataset.mode),
    domainPractice: (el) => { initSetup({ tasks: Object.keys(TASKS).filter((t) => t[0] === el.dataset.d), n: 15 }); go("setup"); },
    taskPractice: (el) => { initSetup({ tasks: [el.dataset.t], n: 10 }); go("setup"); },
    resume: () => { sess = S.session; sess.lastTick = Date.now(); go("test"); },
    discard: () => ask("<h3>Discard unfinished test?</h3><p>Your answers in it will be lost.</p>", () => { S.session = null; sess = null; save(); render(); }, "Discard"),
    toggleDomain: (el) => { Object.keys(TASKS).filter((t) => t[0] === el.dataset.d).forEach((t) => (setup.tasks[t] = el.checked)); render(); },
    toggleTask: (el) => { setup.tasks[el.dataset.t] = el.checked; render(); },
    allTasks: (el) => { Object.keys(setup.tasks).forEach((t) => (setup.tasks[t] = el.dataset.v === "1")); render(); },
    toggleDiff: (el) => { setup.diff[el.dataset.d] = el.checked; render(); },
    toggleShuffle: (el) => { setup[el.dataset.k] = el.checked; },
    set: (el) => { const v = el.dataset.v; setup[el.dataset.k] = v === "true" ? true : v === "false" ? false : v; render(); },
    startPractice: () => buildFromSetup(),
    pick: (el) => pick(el.dataset.c),
    check: () => { const q = curQ(); if ((sess.answers[q.id] || []).length) { sess.locked[q.id] = true; save(); render(); } },
    next: () => { if (sess.idx < sess.qids.length - 1) { sess.idx++; save(); render(); window.scrollTo(0, 0); } },
    prev: () => { if (sess.idx > 0) { sess.idx--; save(); render(); window.scrollTo(0, 0); } },
    jump: (el) => { sess.idx = +el.dataset.i; sess.reviewing = false; save(); render(); window.scrollTo(0, 0); },
    flag: () => { const id = curQ().id; sess.flags[id] = !sess.flags[id]; save(); render(); },
    bookmark: (el) => { const id = el.dataset.id; S.bookmarks[id] = !S.bookmarks[id]; if (!S.bookmarks[id]) delete S.bookmarks[id]; save(); const open = [...document.querySelectorAll("details[open]")].length; render(); void open; },
    pause: () => { tick(); save(); stopTicker(); sess = null; go("home"); },
    endTest: () => { if (sess.feedback === "end") { sess.reviewing = true; save(); render(); window.scrollTo(0, 0); } else ask("<h3>End this test?</h3><p>Unanswered questions count as incorrect.</p>", finish, "End & score"); },
    backToTest: () => { sess.reviewing = false; render(); },
    submit: () => { const un = sess.qids.filter((id) => !(sess.answers[id] || []).length).length; ask(`<h3>Submit test?</h3><p>${un ? un + " question(s) are unanswered and will count as incorrect." : "All questions answered."}</p>`, finish, "Submit"); },
    resFilter: (el) => { resultsFilter = el.dataset.k; render(); },
    retryWrong: (el) => { const a = S.attempts.find((x) => x.id === el.dataset.id); startSession({ kind: "practice", title: "Retry: " + a.title, qids: a.qids.filter((id) => !a.res[id].ok), feedback: "instant", timer: false, duration: 0, shuffleC: false }); },
    openAttempt: (el) => go("results", el.dataset.id),
    bMarked: (el) => { browse.bookmarked = el.checked; render(); },
    export: () => { const b = new Blob([JSON.stringify(S, null, 2)], { type: "application/json" }); const u = URL.createObjectURL(b); const a = document.createElement("a"); a.href = u; a.download = "aipc01-progress-" + new Date().toISOString().slice(0, 10) + ".json"; a.click(); URL.revokeObjectURL(u); },
    reset: () => ask("<h3>Reset all progress?</h3><p>Attempts, stats, notes and bookmarks will be erased. This cannot be undone.</p>", () => { S = defaults(); document.documentElement.dataset.theme = S.theme; sess = null; save(); go("home"); }, "Erase"),
  };

  document.addEventListener("click", (e) => {
    if (e.target.closest("details > summary") && !e.target.closest("[data-act]")) return;
    const el = e.target.closest("[data-act]");
    if (!el || !A[el.dataset.act]) return;
    if (el.tagName === "INPUT" && el.type === "checkbox" && e.type === "click") { /* handled via change */ return; }
    if (el.tagName === "LABEL") return;
    A[el.dataset.act](el);
  });
  document.addEventListener("change", (e) => {
    const el = e.target;
    if (el.tagName === "INPUT" && el.type === "checkbox" && el.dataset.act && A[el.dataset.act]) { A[el.dataset.act](el); return; }
    const k = el.dataset.input;
    if (!k) return;
    if (k === "n") { setup.n = Math.max(1, +el.value || 1); render(); }
    else if (k === "mins") { setup.mins = Math.max(1, +el.value || 1); }
    else if (k === "examMin") { S.examMin = Math.max(10, +el.value || 130); save(); }
    else if (k === "bDomain") { browse.domain = el.value; browse.task = ""; render(); }
    else if (k === "bTask") { browse.task = el.value; render(); }
    else if (k === "bTag") { browse.tag = el.value; render(); }
    else if (k === "import") {
      const f = el.files[0]; if (!f) return;
      const r = new FileReader();
      r.onload = () => { try { S = Object.assign(defaults(), JSON.parse(r.result)); save(); toast("Progress imported."); go("home"); } catch (err) { toast("That file is not a valid export."); } };
      r.readAsText(f);
    }
  });
  document.addEventListener("input", (e) => {
    const el = e.target, k = el.dataset.input;
    if (k === "note") { S.notes[el.dataset.id] = el.value; if (!el.value) delete S.notes[el.dataset.id]; save(); }
    else if (k === "bText") { browse.text = el.value; const pos = el.selectionStart; render(); const b = $("#bText"); if (b) { b.focus(); b.setSelectionRange(pos, pos); } }
  });
  document.addEventListener("keydown", (e) => {
    if (view !== "test" || !sess || sess.reviewing || /TEXTAREA|INPUT|SELECT/.test(e.target.tagName)) return;
    if (!$("#modal").classList.contains("hidden")) return;
    const k = e.key.toLowerCase();
    if (k === "arrowright") A.next(); else if (k === "arrowleft") A.prev();
    else if (k === "f") A.flag();
    else if (k === "enter" && sess.feedback === "instant") A.check();
    else if ("abcdef".includes(k) && k.length === 1) { const cid = sess.order[curQ().id]["abcdef".indexOf(k)]; if (cid) pick(cid); }
  });
  window.addEventListener("beforeunload", () => { if (sess) { tick(); save(); } });

  /* ---------- boot ---------- */
  if (!Q.length) { $("#app").innerHTML = `<div class="card"><h2>No questions loaded</h2><p>Expected data files in <code>data/d1.js … d5.js</code>.</p></div>`; }
  else render();
})();
