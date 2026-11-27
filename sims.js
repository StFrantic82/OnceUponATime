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

  const cfg = Object.assign({ players: 4, level: "hard", games: 200 }, store.get("ouat-sim-cfg", {}), { rounds: 12 });
  let running = false;
  let stopAsked = false;
  let view = "legendary";
  let sortKey = "edge";
  let sortDir = -1;

  const keyOf = () => `ouat-sim14-${cfg.players}-${cfg.level}`;
  const emptyAgg = () => ({
    games: 0, rounds: 0, winner: 0, total: 0, last: 0, seats: 0,
    src: { base: 0, quests: 0, cards: 0, writerPts: 0 },
    writers: {}, cards: {}, chapters: {}, seatWins: {}, seatN: {}, levels: {},
    res: { coins: 0, xp: 0, free: 0, upgraded: 0, legendary: 0, cards: 0, items: 0, quests: 0 },
    curveWin: [], curveAll: [], curveN: 0, pairs: {},
    // Resources of the winner versus everyone (sums; divided by games / seats when shown).
    cmpW: {}, cmpA: {},
  });

  const CMP = [
    ["coinsGained", "cmpCoinsGained"], ["xpGained", "cmpXpGained"], ["base", "cmpVpTokens"], ["quests", "cmpAdvPts"],
    ["cards", "cmpCardPts"], ["writerPts", "cmpWriterPts"], ["cardCount", "simResCards"], ["legendaryCount", "simResLeg"],
    ["upgradedCount", "simResUp"], ["itemCount", "simResItems"], ["questCount", "simResQuests"], ["writerLevel", "cmpWriterLevel"],
    ["coinsLeft", "simResCoins"], ["xpLeft", "simResXp"],
    ["tagCharm", "cmpCharm"], ["tagStrength", "cmpStrength"], ["tagDexterity", "cmpDexterity"], ["tagIntelligence", "cmpIntelligence"], ["tagSorcery", "cmpSorcery"],
  ];

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
      for (const play of p.plays) {
        const c = (agg.chapters[play.number] ||= { n: 0, first: 0, pos: 0, wins: 0 });
        c.n += 1;
        if (play.first) c.first += 1;
        c.pos += play.pos;
        if (won) c.wins += 1;
      }
      agg.seatN[p.seatPos] = (agg.seatN[p.seatPos] || 0) + 1;
      if (won) agg.seatWins[p.seatPos] = (agg.seatWins[p.seatPos] || 0) + 1;
      const lv = (agg.levels[p.writer] ||= [0, 0, 0]);
      lv[(p.writerLevel || 1) - 1] += 1;
      for (const [k] of CMP) {
        agg.cmpA[k] = (agg.cmpA[k] || 0) + (p[k] || 0);
        if (won) agg.cmpW[k] = (agg.cmpW[k] || 0) + (p[k] || 0);
      }
      agg.res.coins += p.coinsLeft;
      agg.res.xp += p.xpLeft;
      agg.res.free += p.freeLeft;
      agg.res.upgraded += p.upgradedCount;
      agg.res.legendary += p.legendaryCount;
      agg.res.cards += p.cardCount;
      agg.res.items += p.itemCount;
      agg.res.quests += p.questCount;
      const legends = [...new Set(p.legendary)].sort();
      for (let i = 0; i < legends.length; i += 1) {
        for (let j = i + 1; j < legends.length; j += 1) {
          const k = `${legends[i]}|${legends[j]}`;
          const e = (agg.pairs[k] ||= [0, 0]);
          e[0] += 1;
          if (won) e[1] += 1;
        }
      }
    }
    // Average score after each round: the eventual winner versus everyone.
    const winnerSeat = game.players.find((p) => p.rank === 1);
    const len = Math.max(...game.players.map((p) => p.curve.length));
    for (let r = 0; r < len; r += 1) {
      agg.curveWin[r] = (agg.curveWin[r] || 0) + (winnerSeat.curve[r] || 0);
      agg.curveAll[r] = (agg.curveAll[r] || 0) + game.players.reduce((sum, p) => sum + (p.curve[r] || 0), 0) / game.players.length;
    }
    agg.curveN += 1;
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
        <div><span class="hl2">${esc(t("players"))}</span>${seg("players", [2, 3, 4].map((n) => [n, n]), cfg.players)}</div>
        <div><span class="hl2">${esc(t("level"))}</span>${seg("level", ["easy", "normal", "hard"].map((l) => [l, t(l)]), cfg.level)}</div>
        <div><span class="hl2">${esc(t("simGames"))}</span>${seg("games", [100, 500, 1000].map((n) => [n, n]), cfg.games)}</div>
      </div>
      <div class="sim-run">
        <button type="button" class="primary sim-run-btn" id="simRun" ${running ? "disabled" : ""}>${esc(running ? t("simRunning") : t("simRun"))}</button>
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

  // The effect of an Action card, as on the card (without the page around it).
  function actionEffect(card) {
    if (!card) return "";
    const html = CardFace.action(card);
    const m = html.match(/<div class="ac-effect">([\s\S]*?)<\/div>\s*<div class="ac-foot">/);
    return m ? `<div class="ac-effect">${m[1]}</div>` : "";
  }

  // Line chart of the average score after each round (winner vs. table average).
  function curveSvg(points) {
    if (!points.length) return "";
    const W = 640;
    const H = 220;
    const pad = { l: 36, r: 12, t: 12, b: 28 };
    const max = Math.max(10, ...points.map((p) => p.win));
    const x = (i) => pad.l + (i * (W - pad.l - pad.r)) / Math.max(1, points.length - 1);
    const y = (v) => H - pad.b - (v / max) * (H - pad.t - pad.b);
    const line = (key) => points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(p[key]).toFixed(1)}`).join("");
    const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(max * f));
    return `<figure class="curve"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(t("simCurve"))}">
      ${ticks.map((v) => `<line x1="${pad.l}" x2="${W - pad.r}" y1="${y(v)}" y2="${y(v)}" stroke="#d9bf92" stroke-dasharray="3 4"/><text x="${pad.l - 6}" y="${y(v) + 4}" text-anchor="end" font-size="11" fill="#7a5d44">${v}</text>`).join("")}
      ${points.map((p, i) => `<text x="${x(i)}" y="${H - 8}" text-anchor="middle" font-size="11" fill="#7a5d44">${p.round}</text>`).join("")}
      <path d="${line("all")}" fill="none" stroke="#6b4a8a" stroke-width="3"/>
      <path d="${line("win")}" fill="none" stroke="#d98a2b" stroke-width="3.5"/>
      ${points.map((p, i) => `<circle cx="${x(i)}" cy="${y(p.win)}" r="3.5" fill="#d98a2b"/><circle cx="${x(i)}" cy="${y(p.all)}" r="3" fill="#6b4a8a"/>`).join("")}
    </svg><figcaption><span><i style="background:#d98a2b"></i>${esc(t("simCurveWin"))} (${points[points.length - 1].win.toFixed(0)})</span><span><i style="background:#6b4a8a"></i>${esc(t("simCurveAll"))} (${points[points.length - 1].all.toFixed(0)})</span></figcaption></figure>`;
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

    const actionText = Object.fromEntries((window.GAME_DATA.actions || []).map((a) => [a.number, a]));
    const chapters = Object.entries(agg.chapters).map(([n, c]) => ({ n: Number(n), first: pct(c.first, c.n), pos: c.pos / c.n + 1, win: pct(c.wins, c.n) })).sort((a, b) => a.n - b.n);
    const seats = Object.keys(agg.seatN).map(Number).sort((a, b) => a - b).map((pos) => ({ pos, win: pct(agg.seatWins[pos] || 0, agg.seatN[pos]) }));
    const r = (k) => (agg.res[k] / agg.seats).toFixed(1);
    const pairs = Object.entries(agg.pairs)
      .filter(([, e]) => e[0] >= Math.max(15, agg.games * 0.03))
      .map(([k, e]) => ({ names: k.split("|"), n: e[0], win: pct(e[1], e[0]) }))
      .sort((a, b) => b.win - a.win);
    const curve = agg.curveWin.map((v, i) => ({ round: i + 1, win: v / agg.curveN, all: agg.curveAll[i] / agg.curveN }));

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
      <div class="scroll"><table class="stab sortable">
        <thead><tr><th>${esc(t("colWriter"))}</th><th>${esc(t("colGames"))}</th><th>${esc(t("simWin"))}</th><th>${esc(t("simEdge"))}</th><th>${esc(t("colAvg"))}</th><th>${esc(t("simLv2"))}</th><th>${esc(t("simLv3"))}</th><th>${esc(t("simWriterPts"))}</th></tr></thead>
        <tbody>${writers.map((w) => { const lv = agg.levels[w.name] || [0, 0, 0]; const tot = lv[0] + lv[1] + lv[2] || 1; return `<tr><td data-card="${esc(w.name)}" data-v="${esc(tc(w.name))}">${esc(tc(w.name))}</td><td data-v="${w.n}">${w.n}</td><td data-v="${w.win}">${w.win.toFixed(0)} %</td><td data-v="${w.win}">${edgeCell(w.win, base)}</td><td data-v="${w.avg}">${w.avg.toFixed(0)}</td><td data-v="${pct(lv[1] + lv[2], tot)}">${pct(lv[1] + lv[2], tot).toFixed(0)} %</td><td data-v="${pct(lv[2], tot)}">${pct(lv[2], tot).toFixed(0)} %</td><td data-v="${w.extra}">${w.extra.toFixed(1)}</td></tr>`; }).join("")}</tbody>
      </table></div>

      <h3>${esc(t("simCards"))}</h3>
      <div class="filters">${["legendary", "common", "items", "quests"].map((k) => `<button type="button" data-sim-view="${k}" aria-pressed="${view === k}">${esc(t(`deck_${k}`))}</button>`).join("")}</div>
      <p class="hint">${esc(t(view === "quests" ? "simQuestHint" : "simCardHint"))}</p>
      <div class="scroll"><table class="stab sim-cards">
        <thead><tr>${th("name", view === "quests" ? t("quest") : t("simCard"))}${th("share", t("simTaken"))}${th("win", t("simWin"))}${th("edge", t("simEdge"))}${th("avg", t("simAvgOwner"))}${view === "quests" ? th("extra", t("simQuestPts")) : ""}</tr></thead>
        <tbody>${rows
          .map((r) => `<tr class="${r.n < low ? "low" : ""}"><td class="cn" data-card="${esc(r.name)}"><span class="owned-thumb">${CardArt.art(r.name)}</span>${esc(tc(r.name))}</td><td>${r.share.toFixed(0)} %</td><td>${r.win.toFixed(0)} %</td><td>${edgeCell(r.win, base)}</td><td>${r.avg.toFixed(0)}</td>${view === "quests" ? `<td>${r.extra.toFixed(1)}</td>` : ""}</tr>`)
          .join("")}</tbody>
      </table></div>

      <h3>${esc(t("simCurve"))}</h3>
      <p class="hint">${esc(t("simCurveHint"))}</p>
      ${curveSvg(curve)}

      <h3>${esc(t("simSeats"))}</h3>
      <p class="hint">${esc(t("simSeatsHint"))}</p>
      <div class="seat-bars">${seats.map((x) => `<div><span>${esc(t("simSeatN", { n: x.pos + 1 }))}</span><i style="width:${Math.min(100, x.win * 2)}%"></i><b>${x.win.toFixed(0)} %</b> ${edgeCell(x.win, base)}</div>`).join("")}</div>

      <h3>${esc(t("simChapters"))}</h3>
      <p class="hint">${esc(t("simChaptersHint"))}</p>
      <div class="scroll"><table class="stab sortable">
        <thead><tr><th>${esc(t("chapter"))}</th><th class="txt">${esc(t("simEffect"))}</th><th>${esc(t("simFirst"))}</th><th>${esc(t("simAvgPos"))}</th><th>${esc(t("simWinWith"))}</th></tr></thead>
        <tbody>${chapters.map((c) => `<tr data-action="${c.n}"><td data-v="${c.n}"><b>${c.n}</b></td><td class="txt sim-action" data-v="${c.n}">${actionEffect(actionText[c.n])}</td><td data-v="${c.first}">${c.first.toFixed(0)} %</td><td data-v="${c.pos}">${c.pos.toFixed(1)}</td><td data-v="${c.win}">${c.win.toFixed(0)} %</td></tr>`).join("")}</tbody>
      </table></div>

      <h3>${esc(t("simEndRes"))}</h3>
      <p class="hint">${esc(t("simEndResHint"))}</p>
      <div class="kpis small">
        <div class="kpi"><b>${r("cards")}</b><span>${esc(t("simResCards"))}</span></div>
        <div class="kpi"><b>${r("legendary")}</b><span>${esc(t("simResLeg"))}</span></div>
        <div class="kpi"><b>${r("upgraded")}</b><span>${esc(t("simResUp"))}</span></div>
        <div class="kpi"><b>${r("items")}</b><span>${esc(t("simResItems"))}</span></div>
        <div class="kpi"><b>${r("quests")}</b><span>${esc(t("simResQuests"))}</span></div>
        <div class="kpi"><b>${r("coins")}</b><span>${esc(t("simResCoins"))}</span></div>
        <div class="kpi"><b>${r("xp")}</b><span>${esc(t("simResXp"))}</span></div>
        <div class="kpi"><b>${r("free")}</b><span>${esc(t("simResFree"))}</span></div>
      </div>

      <h3>${esc(t("cmpTitle"))}</h3>
      <p class="hint">${esc(t("cmpHint"))}</p>
      <div class="scroll"><table class="stab sortable">
        <thead><tr><th class="txt">${esc(t("cmpRes"))}</th><th>${esc(t("cmpWinner"))}</th><th>${esc(t("cmpAll"))}</th><th>${esc(t("cmpDiff"))}</th></tr></thead>
        <tbody>${CMP.map(([k, label]) => {
          const w = (agg.cmpW[k] || 0) / agg.games;
          const a = (agg.cmpA[k] || 0) / agg.seats;
          const d = a ? Math.round((100 * (w - a)) / a) : 0;
          return `<tr><td class="txt" data-v="${esc(t(label))}">${esc(t(label))}</td><td data-v="${w}">${w.toFixed(1)}</td><td data-v="${a}">${a.toFixed(1)}</td><td data-v="${d}"><span class="edge ${d > 10 ? "pos" : d < -10 ? "neg" : ""}">${d > 0 ? "+" : ""}${d} %</span></td></tr>`;
        }).join("")}</tbody>
      </table></div>

      <h3>${esc(t("simPairs"))}</h3>
      <p class="hint">${esc(t("simPairsHint"))}</p>
      <div class="scroll"><table class="stab sortable">
        <thead><tr><th class="txt">${esc(t("simPair"))}</th><th>${esc(t("colGames"))}</th><th>${esc(t("simWin"))}</th><th>${esc(t("simEdge"))}</th></tr></thead>
        <tbody>${[...pairs.slice(0, 8), ...(pairs.length > 12 ? pairs.slice(-4) : [])].map((x, i) => `<tr class="${i === 8 ? "sep" : ""}"><td class="txt" data-v="${esc(tc(x.names[0]))}"><span data-card="${esc(x.names[0])}">${esc(tc(x.names[0]))}</span> + <span data-card="${esc(x.names[1])}">${esc(tc(x.names[1]))}</span></td><td data-v="${x.n}">${x.n}</td><td data-v="${x.win}">${x.win.toFixed(0)} %</td><td data-v="${x.win}">${edgeCell(x.win, base)}</td></tr>`).join("") || `<tr><td colspan="4">—</td></tr>`}</tbody>
      </table></div>`;
  }

  function show() {
    renderControls();
    renderResults();
  }

  // Any "sortable" table: click a column header to sort by it (click again to reverse).
  document.addEventListener("click", (event) => {
    const th = event.target.closest("#simScreen table.sortable th");
    if (!th) return;
    const table = th.closest("table");
    const col = [...th.parentNode.children].indexOf(th);
    const dir = th.dataset.dir === "desc" ? 1 : -1;
    for (const other of th.parentNode.children) {
      delete other.dataset.dir;
      other.classList.remove("sorted");
    }
    th.dataset.dir = dir < 0 ? "desc" : "asc";
    th.classList.add("sorted");
    const body = table.tBodies[0];
    const val = (row) => {
      const v = row.children[col]?.dataset.v ?? row.children[col]?.textContent ?? "";
      const n = Number(v);
      return Number.isNaN(n) || v === "" ? String(v) : n;
    };
    [...body.rows].sort((a, b) => {
      const x = val(a);
      const y = val(b);
      return (typeof x === "string" || typeof y === "string" ? String(x).localeCompare(String(y)) : x - y) * dir;
    }).forEach((row) => body.appendChild(row));
  });

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

  function clearAll() {
    if (running) stopAsked = true;
    try {
      for (const k of Object.keys(localStorage)) if (k.startsWith("ouat-sim1")) localStorage.removeItem(k);
    } catch {
      /* storage unavailable */
    }
    store.set(keyOf(), emptyAgg());
    show();
  }

  window.Sims = { show, clearAll };
})();
