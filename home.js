// Once Upon a Time — home page, statistics and tutorial.
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
        /* storage unavailable: settings simply are not remembered */
      }
    },
  };

  const LEVELS = {
    easy: { label: () => t("easy"), hint: () => t("hintEasy") },
    normal: { label: () => t("normal"), hint: () => t("hintNormal") },
    hard: { label: () => t("hard"), hint: () => t("hintHard") },
  };
  const DECKS = [
    { key: "actions", icon: "activation" },
    { key: "common", icon: "Good" },
    { key: "legendary", icon: "xp" },
    { key: "items", icon: "coins" },
    { key: "quests", icon: "endgame" },
    { key: "writers", icon: "vp" },
  ];

  const prefs = Object.assign({ mode: "solo", name: "", players: 2, level: "normal", writerMode: "random", rounds: 9 }, store.get("ouat-prefs", {}));

  function savePrefs() {
    store.set("ouat-prefs", prefs);
  }

  // ---------- Home ----------
  function renderHome() {
    I18N.apply();
    const data = window.GAME_DATA;
    const pick = (list, name) => list.find((card) => card.name === name) || list[0];
    $("#heroCards").innerHTML = [
      CardFace.item(pick(data.items, "Magic Lamp"), { cls: "hero-c1" }),
      CardFace.legendary(pick(data.legendary, "Little Red Riding Hood"), { cls: "hero-c2" }),
      CardFace.common(pick(data.common, "The Fairies"), { cls: "hero-c3" }),
    ].join("");

    const home = $("#home");
    home.dataset.mode = prefs.mode;
    for (const btn of home.querySelectorAll("[data-mode]")) btn.setAttribute("aria-pressed", String(btn.dataset.mode === prefs.mode));
    $("#soloBox").hidden = prefs.mode !== "solo";
    $("#onlineBox").hidden = prefs.mode !== "online";

    $("#pname").value = prefs.name;
    $("#nseg").innerHTML = [2, 3, 4, 5]
      .map((n) => `<button type="button" aria-pressed="${n === prefs.players}" data-players="${n}" aria-label="${n} players">${n}</button>`)
      .join("");
    $("#nhint").textContent = prefs.players === 2 ? t("hintOne") : t("hintMany", { n: prefs.players - 1 });
    $("#lvseg").innerHTML = Object.entries(LEVELS)
      .map(([key, level], i) => `<button type="button" aria-pressed="${key === prefs.level}" data-level="${key}">${"★".repeat(i + 1)}<span>${level.label()}</span></button>`)
      .join("");
    $("#lvhint").textContent = LEVELS[prefs.level].hint();
    $("#wseg").innerHTML = [["random", t("writerRandom")], ["choose", t("writerChoose")]]
      .map(([key, label]) => `<button type="button" aria-pressed="${key === prefs.writerMode}" data-writer-pick="${key}">${label}</button>`)
      .join("");
    $("#rseg").innerHTML = [8, 9]
      .map((n) => `<button type="button" aria-pressed="${n === prefs.rounds}" data-rounds="${n}">${t("roundsN", { n })}</button>`)
      .join("");
    $("#deckBtns").innerHTML = DECKS.map((deck) => `<button type="button" data-open-deck="${deck.key}">${resourceIcon(deck.icon, t(`deck_${deck.key}`))}<b>${t(`deck_${deck.key}`)}</b><span>${(data[deck.key] || []).length}</span></button>`).join("");
  }

  // Only one screen at a time: home, lobby, game or stats.
  function showScreen(name) {
    $("#home").hidden = name !== "home";
    $("#lobbyScreen").hidden = name !== "lobby";
    $("#statsScreen").hidden = name !== "stats";
    $("#rulesScreen").hidden = name !== "rules";
    document.querySelector(".app").hidden = name !== "game";
    if (name !== "game") {
      hideCoach();
      document.querySelector(".recap-overlay")?.remove();
    }
    I18N.apply();
    window.scrollTo(0, 0);
  }

  function show() {
    if (window.Online?.active) {
      window.Online.leave();
      return;
    }
    showScreen("home");
    renderHome();
  }

  function startGame(tutorial = false) {
    prefs.name = $("#pname").value.trim().slice(0, 16);
    savePrefs();
    showScreen("game");
    tutorialState.on = tutorial;
    tutorialState.seen = new Set();
    Game.newGame(
      tutorial
        ? { players: 2, level: "easy", writerMode: "random", rounds: 9, name: prefs.name || t("you"), tutorial: true }
        : { players: prefs.players, level: prefs.level, writerMode: prefs.writerMode, rounds: prefs.rounds, name: prefs.name || t("you"), tutorial: false },
    );
    window.scrollTo(0, 0);
  }

  function bindHome() {
    $("#home").addEventListener("click", (event) => {
      const btn = event.target.closest("button");
      if (!btn) return;
      if (btn.dataset.mode) prefs.mode = btn.dataset.mode;
      else if (btn.dataset.players) prefs.players = Number(btn.dataset.players);
      else if (btn.dataset.level) prefs.level = btn.dataset.level;
      else if (btn.dataset.writerPick) prefs.writerMode = btn.dataset.writerPick;
      else if (btn.dataset.rounds) prefs.rounds = Number(btn.dataset.rounds);
      else if (btn.dataset.openDeck) return openCatalog(btn.dataset.openDeck);
      else if (btn.id === "startBtn") return startGame(false);
      else if (btn.id === "tutoBtn") return startGame(true);
      else if (btn.id === "statsBtn") return showStats();
      else if (btn.id === "createBtn") return createRoom();
      else if (btn.id === "pnpBtn") return showPrintAndPlay();
      else if (btn.id === "rulesBtn") return showRules();
      else if (btn.id === "joinBtn") return joinRoom();
      else return;
      savePrefs();
      renderHome();
    });
    $("#pname").addEventListener("change", () => {
      prefs.name = $("#pname").value.trim().slice(0, 16);
      savePrefs();
    });
    $("#statsBack").addEventListener("click", show);
    $("#rulesBack").addEventListener("click", show);
    bindCardPreview();
    $("#rulesPrint").addEventListener("click", () => window.print());
    window.addEventListener("langchange", () => {
      if (!$("#rulesScreen").hidden) window.Rules.render($("#rulesInApp"));
    });
    for (const tab of document.querySelectorAll("[data-stats-tab]")) {
      tab.addEventListener("click", () => setStatsTab(tab.dataset.statsTab));
    }
    $("#joinCode").addEventListener("keydown", (event) => {
      if (event.key === "Enter") joinRoom();
    });
    $("#statsClear").addEventListener("click", () => {
      store.set("ouat-history", []);
      showStats();
    });
  }

  // ---------- Statistics ----------
  function recordGame(entry) {
    if (entry.tutorial) return;
    const history = store.get("ouat-history", []);
    history.push({ ...entry, date: new Date().toISOString() });
    store.set("ouat-history", history.slice(-200));
  }

  let statsTab = "mine";
  function setStatsTab(tab) {
    statsTab = tab;
    for (const btn of document.querySelectorAll("[data-stats-tab]")) btn.setAttribute("aria-pressed", String(btn.dataset.statsTab === tab));
    $("#myStats").hidden = tab !== "mine";
    $("#simScreen").hidden = tab !== "sims";
    if (tab === "sims") window.Sims?.show();
  }

  // Card preview when hovering (or tapping) a card name in the statistics.
  function cardPreviewHtml(name) {
    const D = window.GAME_DATA;
    const pick = (list) => list.find((c) => c.name === name);
    let c;
    if ((c = pick(D.legendary))) return CardFace.legendary(c);
    if ((c = pick(D.common))) return CardFace.common(c);
    if ((c = pick(D.items))) return CardFace.item(c);
    if ((c = pick(D.quests))) return CardFace.quest(c);
    if ((c = pick(D.writers)) && typeof window.renderWriterCard === "function") return window.renderWriterCard(c, 1, false, true);
    return "";
  }

  function bindCardPreview() {
    const tip = document.createElement("div");
    tip.className = "card-preview";
    tip.hidden = true;
    document.body.appendChild(tip);
    let current = null;
    const place = (x, y) => {
      const r = tip.getBoundingClientRect();
      let left = x + 18;
      if (left + r.width > innerWidth - 8) left = x - r.width - 18;
      let top = y - r.height / 2;
      top = Math.max(8, Math.min(top, innerHeight - r.height - 8));
      tip.style.left = `${Math.max(8, left)}px`;
      tip.style.top = `${top}px`;
    };
    const open = (el, x, y) => {
      if (el !== current) {
        current = el;
        const html = el.dataset.card ? cardPreviewHtml(el.dataset.card) : CardFace.action(window.GAME_DATA.actions.find((a) => a.number === Number(el.dataset.action)) || {});
        if (!html) return close();
        tip.innerHTML = html;
        tip.hidden = false;
      }
      place(x, y);
    };
    const close = () => {
      current = null;
      tip.hidden = true;
    };
    const screen = $("#statsScreen");
    screen.addEventListener("pointermove", (e) => {
      if (e.pointerType === "touch") return;
      const el = e.target.closest("[data-card],[data-action]");
      if (el) open(el, e.clientX, e.clientY);
      else if (current) close();
    });
    screen.addEventListener("pointerleave", close);
    screen.addEventListener("click", (e) => {
      const el = e.target.closest("[data-card],[data-action]");
      if (el && el !== current) open(el, e.clientX, e.clientY);
      else close();
    });
    window.addEventListener("scroll", close, { passive: true });
  }

  function showRules() {
    showScreen("rules");
    window.Rules.render($("#rulesInApp"));
    window.scrollTo(0, 0);
  }

  function showStats() {
    showScreen("stats");
    setStatsTab(statsTab);
    const history = store.get("ouat-history", []);
    const body = $("#statsBody");
    if (!history.length) {
      body.innerHTML = `<p class="stats-empty">${esc(t("statsEmpty"))}</p>`;
      return;
    }
    const scores = history.map((g) => g.score);
    const best = Math.max(...scores);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const byWriter = {};
    for (const g of history) {
      const w = (byWriter[g.writer] ||= { games: 0, total: 0, best: 0 });
      w.games += 1;
      w.total += g.score;
      w.best = Math.max(w.best, g.score);
    }
    const writers = Object.entries(byWriter).sort((a, b) => b[1].total / b[1].games - a[1].total / a[1].games);
    const recent = history.slice(-10).reverse();
    body.innerHTML = `
      <div class="kpis">
        <div class="kpi"><b>${history.length}</b><span>${esc(t("gamesPlayed"))}</span></div>
        <div class="kpi"><b>${history.filter((g) => g.rank === 1).length}</b><span>${esc(t("victories"))}</span></div>
        <div class="kpi"><b>${best}</b><span>${esc(t("bestScore"))}</span></div>
        <div class="kpi"><b>${avg.toFixed(1)}</b><span>${esc(t("avgScore"))}</span></div>
        <div class="kpi"><b>${esc(tc(writers[0][0]))}</b><span>${esc(t("bestWriter"))}</span></div>
      </div>
      <h3>${esc(t("byWriter"))}</h3>
      <table class="stab"><thead><tr><th>${esc(t("colWriter"))}</th><th>${esc(t("colGames"))}</th><th>${esc(t("colAvg"))}</th><th>${esc(t("colBest"))}</th></tr></thead><tbody>
        ${writers.map(([name, w]) => `<tr><td data-card="${esc(name)}">${esc(tc(name))}</td><td>${w.games}</td><td>${(w.total / w.games).toFixed(1)}</td><td>${w.best}</td></tr>`).join("")}
      </tbody></table>
      <h3>${esc(t("lastGames"))}</h3>
      <table class="stab"><thead><tr><th>${esc(t("colDate"))}</th><th class="txt">${esc(t("colWriter"))}</th><th>${esc(t("colPlayers"))}</th><th>${esc(t("colBots"))}</th><th>${esc(t("colQuests"))}</th><th>${esc(t("colScore"))}</th></tr></thead><tbody>
        ${recent.map((g) => `<tr><td>${new Date(g.date).toLocaleDateString(I18N.lang)}</td><td class="txt" data-card="${esc(g.writer)}">${esc(tc(g.writer))}</td><td>${g.players}</td><td>${esc(LEVELS[g.level]?.label() || g.level)}</td><td>${g.quests}</td><td>${g.score}</td></tr>`).join("")}
      </tbody></table>`;
  }

  // ---------- Tutorial ----------
  const tutorialState = { on: false, seen: new Set() };
  const STEPS = {
    chooseAction: {
      target: "#actionHand",
    },
    chooseGroup: {
      target: "#groups",
    },
    buyItem: {
      target: "#itemDisplay",
    },
    questPick: {
      target: "#questDisplay",
    },
    roundDone: {
      target: "#endRoundBtn",
    },
  };

  function afterRender(state) {
    if (!tutorialState.on) return;
    let key = state.phase;
    if (state.questChoices > 0) key = "questPick";
    const step = STEPS[key];
    if (!step || tutorialState.seen.has(key)) {
      if (!step) hideCoach();
      return;
    }
    showCoach(key, { ...step, title: t(`tuto_${key}_t`), text: t(`tuto_${key}`) });
  }

  function showCoach(key, step) {
    const coach = $("#coach");
    coach.hidden = false;
    coach.innerHTML = `<b>${esc(step.title)}</b><p>${esc(step.text)}</p><div class="cbtn"><button type="button" class="ghost" data-coach="stop">${esc(t("leaveTuto"))}</button><button type="button" data-coach="ok">${esc(t("gotIt"))}</button></div>`;
    document.querySelectorAll(".hl").forEach((node) => node.classList.remove("hl"));
    const target = document.querySelector(step.target);
    if (target) {
      target.classList.add("hl");
      target.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
    coach.onclick = (event) => {
      const btn = event.target.closest("[data-coach]");
      if (!btn) return;
      tutorialState.seen.add(key);
      if (btn.dataset.coach === "stop") tutorialState.on = false;
      hideCoach();
    };
  }

  function hideCoach() {
    const coach = $("#coach");
    if (coach) coach.hidden = true;
    document.querySelectorAll(".hl").forEach((node) => node.classList.remove("hl"));
  }

  window.addEventListener("langchange", () => {
    if (!$("#home").hidden) renderHome();
    if (!$("#statsScreen").hidden) showStats();
    if (!document.querySelector(".app").hidden && tutorialState.on) {
      tutorialState.lastKey = null;
      afterRender(Game.state);
    }
  });

  // Print & Play: the ready-made PDFs (one per language) and the printable page.
  const SITE = "https://stfrantic82.github.io/OnceUponATime/";
  function showPrintAndPlay() {
    const flags = { en: "English", fr: "Français", it: "Italiano" };
    const box = document.createElement("div");
    box.className = "confirm-overlay";
    box.innerHTML = `<div class="pnp-box" role="dialog" aria-modal="true" aria-label="Print & Play">
      <h2>Print &amp; Play</h2>
      <p>${esc(t("pnpIntro"))}</p>
      <ul class="pnp-sizes">${["pnpCommon", "pnpLegendary", "pnpItems", "pnpQuests", "pnpWriters", "pnpActions", "pnpTokens"].map((k) => `<li>${esc(t(k))}</li>`).join("")}</ul>
      <div class="pnp-links">${["fr", "en", "it"]
        .sort((a, b) => (a === I18N.lang ? -1 : b === I18N.lang ? 1 : 0))
        .map((l) => `<a class="pnp-link ${l === I18N.lang ? "main" : ""}" href="${SITE}pnp/once-upon-a-time-print-and-play-${l}.pdf" target="_blank" rel="noopener">PDF · ${flags[l]}</a>`)
        .join("")}</div>
      <p class="hint">${esc(t("pnpHint"))} <a href="${SITE}print.html?lang=${I18N.lang}" target="_blank" rel="noopener">${esc(t("pnpPage"))}</a></p>
      <div class="confirm-actions"><button type="button" class="primary" data-close>${esc(t("back"))}</button></div>
    </div>`;
    box.addEventListener("click", (event) => {
      if (event.target === box || event.target.closest("[data-close]")) box.remove();
    });
    document.body.appendChild(box);
  }

  function playerName() {
    prefs.name = $("#pname").value.trim().slice(0, 16);
    savePrefs();
    return prefs.name || t("namePh");
  }

  function createRoom() {
    tutorialState.on = false;
    window.Online.create(playerName(), { players: prefs.players, level: prefs.level, writerMode: prefs.writerMode, rounds: prefs.rounds });
  }

  function joinRoom() {
    tutorialState.on = false;
    window.Online.join($("#joinCode").value, playerName());
  }

  window.Home = { show, showScreen, afterRender, recordGame };
  bindHome();
  const invited = window.Online?.roomFromUrl();
  if (invited) {
    prefs.mode = "online";
    show();
    $("#joinCode").value = invited;
    $("#joinCode").closest(".joinrow").classList.add("invited");
    $("#netmsg").textContent = t("invitedHint");
  } else {
    show();
  }
})();
