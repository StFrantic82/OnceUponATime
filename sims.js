// Once Upon a Time — AI simulations for game balance.
// The computer plays whole games against itself; results add up per setup (players, level, rounds)
// and are kept in this browser.
(function () {
  const $ = (sel) => document.querySelector(sel);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const store = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch (e) {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        /* not kept */
      }
    },
  };

  const cfg = Object.assign({ players: 4, level: "hard", rounds: 9, games: 200 }, store.get("ouat-sim-cfg", {}));
  let running = false;
  let stopAsked = false;
  let view = "legendary";
  let sortKey = "edge";
  let sortDir = -1;

  const keyOf = () => `ouat-sim-${cfg.players}-${cfg.level}-${cfg.rounds}`;
  const emptyAgg = () => ({ games: 0, rounds: 0, winner: 0, total: 0, last: 0, seats: 0, src: { base: 0, quests: 0, cards: 0, writerPts: 0 }, writers: {}, cards: {}, chapters: {} });

  function bump(map, name, deck, won, score, extra = 0) {
    const e = (map[name] ||= { deck, n: 0, wins: 0, score: 0, extra: 0 });
    e.n += 1;
    if (won) e.wins += 1;
    e.score += score;
    e.extra += extra;
  }

  function addGame(agg, game) {
    agg.games += 1;
    agg.rounds += game.rounds;
    const totals = game.players.map((p) => p.total);
    agg.winner += Math.max(...totals);
    agg.last += Math.min(...totals);
    for (const p of game.players) {
      const won = p.rank === 1;
      agg.seats += 1;
      agg.total += p.total;
      agg.src.base += p.base;
      agg.src.quests += p.quests;
      agg.src.cards += p.cards;
      agg.src.writerPts += p.writerPts;
      bump(agg.writers, p.writer, "writer", won, p.total, p.writerPts);
      for (const name of new Set(p.legendary)) bump(agg.cards, name, "legendary", won, p.total);
      for (const name of new Set(p.common)) bump(agg.cards, name, "common", won, p.total);
      for (const name of new Set(p.items)) bump(agg.cards, name, "items", won, p.total);
      for (const [name, pts] of p.questNames) bump(agg.cards, name, "quests", won, p.total, pts);
      p.actions.forEach((number, roundIndex) => {
        const c = (agg.chapters[number] ||= { n: 0, early: 0 });
        c.n += 1;
        if (roundIndex < 3) c.early += 1;
      });
    }
  }

  // ---------- Running ----------
  async function run() {
    if (running) return;
    running = true;
    stopAsked = false;
    const agg = store.get(keyOf(), emptyAgg());
    const target = cfg.games;
    renderControls();
    for (let i = 0; i < target && !stopAsked; i += 1) {
      const game = await Game.simulateGame({ players: cfg.players, level: cfg.level, rounds: cfg.rounds });
      addGame(agg, game);
      if (i % 10 === 9 || i === target - 1) {
        $("#simProgress").value = (i + 1) / target;
        $("#simProgressText").textContent = t("simProgress", { n: i + 1, total: target });
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }
    store.set(keyOf(), agg);
    running = false;
    renderControls();
    renderResults();
  }

  // ---------- Display ----------
  function seg(name, options, current) {
    return `<div class="lvls sim-seg">${options.map(([value, label]) => `<button type="button" data-sim="${name}" data-value="${value}" aria-pressed="${String(value) === String(current)}">${esc(label)}</button>`).join("")}</div>`;
  }

  function renderControls() {
    $("#simControls").innerHTML = `
      <div class="sim-grid">
        <div><span class="hl2">${esc(t("players"))}</span>${seg("players", [2, 3, 4, 5].map((n) => [n, n]), cfg.players)}</div>
        <div><span class="hl2">${esc(t("level"))}</span>${seg("level", ["easy", "normal", "hard"].map((l) => [l, t(l)]), cfg.level)}</div>
        <div><span class="hl2">${esc(t("length"))}</span>${seg("rounds", [8, 9].map((n) => [n, t("roundsN", { n })]), cfg.rounds)}</div>
        <div><span class="hl2">${esc(t("simGames"))}</span>${seg("games", [100, 500, 1000].map((n) => [n, n]), cfg.games)}</div>
      </div>
      <div class="sim-run">
        <button type="button" class="bigbtn" id="simRun" ${running ? "disabled" : ""}>${esc(running ? t("simRunning") : t("simRun"))}</button>
        ${running ? `<button type="button" id="simStop">${esc(t("simStop"))}</button>` : `<button type="button" id="simClear">${esc(t("simClear"))}</button>`}
      </div>
      <progress id="simProgress" value="0" max="1" ${running ? "" : "hidden"}></progress>
      <p class="hint" id="simProgressText"></p>`;
  }

  function pct(a, b) {
    return b ? (100 * a) / b : 0;
  }

  function edgeCell(winPct, base) {
    const d = Math.round(winPct - base);
    const cls = d > 4 ? "pos" : d < -4 ? "neg" : "";
    return `<span class="edge ${cls}">${d > 0 ? "+" : d < 0 ? "−" : ""}${Math.abs(d)}</span>`;
  }

  function renderResults() {
    const agg = store.get(keyOf(), emptyAgg());
    const box = $("#simResults");
    if (!agg.games) {
      box.innerHTML = `<p class="stats-empty">${esc(t("simEmpty"))}</p>`;
      return;
    }
    const base = 100 / cfg.players;
    const srcTotal = agg.src.base + agg.src.quests + agg.src.cards + agg.src.writerPts || 1;
    const sources = [
      ["colDuring", agg.src.base, "#d98a2b"],
      ["quests", agg.src.quests, "#6b4a8a"],
      ["colCards", agg.src.cards, "#2f5d8a"],
      ["writer", agg.src.writerPts, "#5d7f3a"],
    ];
    const writers = Object.entries(agg.writers).map(([name, w]) => ({ name, n: w.n, win: pct(w.wins, w.n), avg: w.score / w.n, extra: w.extra / w.n }));
    writers.sort((a, b) => b.win - a.win);

    const rows = Object.entries(agg.cards)
      .filter(([, c]) => c.deck === view)
      .map(([name, c]) => ({ name, n: c.n, share: pct(c.n, agg.seats), win: pct(c.wins, c.n), avg: c.score / c.n, extra: c.extra / c.n }));
    const getter = { name: (r) => tc(r.name), share: (r) => r.share, win: (r) => r.win, edge: (r) => r.win, avg: (r) => r.avg, extra: (r) => r.extra };
    rows.sort((a, b) => {
      const x = getter[sortKey](a);
      const y = getter[sortKey](b);
      return (typeof x === "string" ? x.localeCompare(y) : x - y) * sortDir;
    });
    const low = Math.max(10, agg.games * 0.02);
    const th = (key, label) => `<th data-sort="${key}" class="${sortKey === key ? "sorted" : ""}">${esc(label)}${sortKey === key ? (sortDir < 0 ? " ▾" : " ▴") : ""}</th>`;

    const chapters = Object.entries(agg.chapters).map(([n, c]) => ({ n: Number(n), early: pct(c.early, c.n) })).sort((a, b) => a.n - b.n);

    box.innerHTML = `
      <div class="kpis">
        <div class="kpi"><b>${agg.games}</b><span>${esc(t("simGamesDone"))}</span></div>
        <div class="kpi"><b>${(agg.winner / agg.games).toFixed(0)}</b><span>${esc(t("simWinnerAvg"))}</span></div>
        <div class="kpi"><b>${(agg.total / agg.seats).toFixed(0)}</b><span>${esc(t("simAvg"))}</span></div>
        <div class="kpi"><b>${((agg.winner - agg.last) / agg.games).toFixed(0)}</b><span>${esc(t("simSpread"))}</span></div>
      </div>

      <h3>${esc(t("simSources"))}</h3>
      <div class="src-bar">${sources.map(([k, v, c]) => `<span style="width:${pct(v, srcTotal)}%;background:${c}" title="${esc(t(k))}"></span>`).join("")}</div>
      <ul class="src-legend">${sources.map(([k, v, c]) => `<li><i style="background:${c}"></i>${esc(t(k))} <b>${pct(v, srcTotal).toFixed(0)} %</b> <small>(${(v / agg.seats).toFixed(1)} ${esc(t("simPerPlayer"))})</small></li>`).join("")}</ul>

      <h3>${esc(t("simWriters"))}</h3>
      <p class="hint">${esc(t("simEdgeHint", { n: base.toFixed(0) }))}</p>
      <div class="scroll"><table class="stab">
        <thead><tr><th>${esc(t("colWriter"))}</th><th>${esc(t("colGames"))}</th><th>${esc(t("simWin"))}</th><th>${esc(t("simEdge"))}</th><th>${esc(t("colAvg"))}</th><th>${esc(t("simWriterPts"))}</th></tr></thead>
        <tbody>${writers.map((w) => `<tr><td>${esc(tc(w.name))}</td><td>${w.n}</td><td>${w.win.toFixed(0)} %</td><td>${edgeCell(w.win, base)}</td><td>${w.avg.toFixed(0)}</td><td>${w.extra.toFixed(1)}</td></tr>`).join("")}</tbody>
      </table></div>

      <h3>${esc(t("simCards"))}</h3>
      <div class="filters">${["legendary", "common", "items", "quests"].map((k) => `<button type="button" data-sim-view="${k}" aria-pressed="${view === k}">${esc(t(`deck_${k}`))}</button>`).join("")}</div>
      <p class="hint">${esc(t(view === "quests" ? "simQuestHint" : "simCardHint"))}</p>
      <div class="scroll"><table class="stab sim-cards">
        <thead><tr>${th("name", view === "quests" ? t("quest") : t("simCard"))}${th("share", t("simTaken"))}${th("win", t("simWin"))}${th("edge", t("simEdge"))}${th("avg", t("simAvgOwner"))}${view === "quests" ? th("extra", t("simQuestPts")) : ""}</tr></thead>
        <tbody>${rows
          .map((r) => `<tr class="${r.n < low ? "low" : ""}"><td class="cn"><span class="owned-thumb">${CardArt.art(r.name)}</span>${esc(tc(r.name))}</td><td>${r.share.toFixed(0)} %</td><td>${r.win.toFixed(0)} %</td><td>${edgeCell(r.win, base)}</td><td>${r.avg.toFixed(0)}</td>${view === "quests" ? `<td>${r.extra.toFixed(1)}</td>` : ""}</tr>`)
          .join("")}</tbody>
      </table></div>

      <h3>${esc(t("simChapters"))}</h3>
      <p class="hint">${esc(t("simChaptersHint"))}</p>
      <div class="chap-bars">${chapters.map((c) => `<div class="chap"><span class="chap-fill" style="height:${Math.min(100, c.early * 2)}%"></span><b>${c.n}</b><small>${c.early.toFixed(0)}%</small></div>`).join("")}</div>`;
  }

  function show() {
    renderControls();
    renderResults();
  }

  document.addEventListener("click", (event) => {
    const btn = event.target.closest("#simScreen button, #simScreen th[data-sort]");
    if (!btn) return;
    if (btn.dataset.sim) {
      if (running) return;
      cfg[btn.dataset.sim] = btn.dataset.sim === "level" ? btn.dataset.value : Number(btn.dataset.value);
      store.set("ouat-sim-cfg", cfg);
      show();
    } else if (btn.id === "simRun") {
      run();
    } else if (btn.id === "simStop") {
      stopAsked = true;
    } else if (btn.id === "simClear") {
      store.set(keyOf(), emptyAgg());
      renderResults();
    } else if (btn.dataset.simView) {
      view = btn.dataset.simView;
      renderResults();
    } else if (btn.dataset.sort) {
      if (sortKey === btn.dataset.sort) sortDir = -sortDir;
      else {
        sortKey = btn.dataset.sort;
        sortDir = btn.dataset.sort === "name" ? 1 : -1;
      }
      renderResults();
    }
  });
  window.addEventListener("langchange", () => {
    if (!$("#simScreen")?.hidden) show();
  });

  window.Sims = { show };
})();
