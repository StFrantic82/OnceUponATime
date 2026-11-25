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
    easy: { label: "Easy", hint: "The storytellers play their Action cards at random and often grab any group." },
    normal: { label: "Normal", hint: "The storytellers like high cards and always take the most valuable group." },
    hard: { label: "Hard", hint: "The storytellers read the table: they spend high cards only when one group is clearly the best." },
  };
  const DECKS = [
    { key: "actions", label: "Actions", icon: "activation" },
    { key: "common", label: "Common", icon: "Good" },
    { key: "legendary", label: "Legendary", icon: "xp" },
    { key: "items", label: "Items", icon: "coins" },
    { key: "quests", label: "Quests", icon: "endgame" },
    { key: "writers", label: "Writers", icon: "vp" },
  ];

  const prefs = Object.assign({ mode: "solo", name: "", players: 2, level: "normal", writerMode: "random" }, store.get("ouat-prefs", {}));

  function savePrefs() {
    store.set("ouat-prefs", prefs);
  }

  // ---------- Home ----------
  function renderHome() {
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
    $("#nhint").textContent = prefs.players === 2 ? "You against one computer storyteller." : `You against ${prefs.players - 1} computer storytellers.`;
    $("#lvseg").innerHTML = Object.entries(LEVELS)
      .map(([key, level], i) => `<button type="button" aria-pressed="${key === prefs.level}" data-level="${key}">${"★".repeat(i + 1)}<span>${level.label}</span></button>`)
      .join("");
    $("#lvhint").textContent = LEVELS[prefs.level].hint;
    $("#wseg").innerHTML = [["random", "Draw at random"], ["choose", "Choose mine"]]
      .map(([key, label]) => `<button type="button" aria-pressed="${key === prefs.writerMode}" data-writer-pick="${key}">${label}</button>`)
      .join("");
    $("#deckBtns").innerHTML = DECKS.map((deck) => `<button type="button" data-open-deck="${deck.key}">${resourceIcon(deck.icon, deck.label)}<b>${deck.label}</b><span>${(data[deck.key] || []).length}</span></button>`).join("");
  }

  function show() {
    $("#statsScreen").hidden = true;
    $("#home").hidden = false;
    document.querySelector(".app").hidden = true;
    hideCoach();
    renderHome();
    window.scrollTo(0, 0);
  }

  function startGame(tutorial = false) {
    prefs.name = $("#pname").value.trim().slice(0, 16);
    savePrefs();
    $("#home").hidden = true;
    $("#statsScreen").hidden = true;
    document.querySelector(".app").hidden = false;
    tutorialState.on = tutorial;
    tutorialState.seen = new Set();
    Game.newGame(
      tutorial
        ? { players: 2, level: "easy", writerMode: "random", name: prefs.name || "You", tutorial: true }
        : { players: prefs.players, level: prefs.level, writerMode: prefs.writerMode, name: prefs.name || "You", tutorial: false },
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
      else if (btn.dataset.openDeck) return openCatalog(btn.dataset.openDeck);
      else if (btn.id === "startBtn") return startGame(false);
      else if (btn.id === "tutoBtn") return startGame(true);
      else if (btn.id === "statsBtn") return showStats();
      else return;
      savePrefs();
      renderHome();
    });
    $("#pname").addEventListener("change", () => {
      prefs.name = $("#pname").value.trim().slice(0, 16);
      savePrefs();
    });
    $("#statsBack").addEventListener("click", show);
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

  function showStats() {
    $("#home").hidden = true;
    document.querySelector(".app").hidden = true;
    $("#statsScreen").hidden = false;
    const history = store.get("ouat-history", []);
    const body = $("#statsBody");
    if (!history.length) {
      body.innerHTML = `<p class="stats-empty">No finished game yet. Your scores are saved in this browser each time you calculate the final score of a finished game (the tutorial is not counted).</p>`;
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
        <div class="kpi"><b>${history.length}</b><span>games played</span></div>
        <div class="kpi"><b>${best}</b><span>best score</span></div>
        <div class="kpi"><b>${avg.toFixed(1)}</b><span>average score</span></div>
        <div class="kpi"><b>${esc(writers[0][0])}</b><span>best Writer on average</span></div>
      </div>
      <h3>By Writer</h3>
      <table class="stab"><thead><tr><th>Writer</th><th>Games</th><th>Average</th><th>Best</th></tr></thead><tbody>
        ${writers.map(([name, w]) => `<tr><td>${esc(name)}</td><td>${w.games}</td><td>${(w.total / w.games).toFixed(1)}</td><td>${w.best}</td></tr>`).join("")}
      </tbody></table>
      <h3>Last games</h3>
      <table class="stab"><thead><tr><th>Date</th><th class="txt">Writer</th><th>Players</th><th>Bots</th><th>Quests</th><th>Score</th></tr></thead><tbody>
        ${recent.map((g) => `<tr><td>${new Date(g.date).toLocaleDateString()}</td><td class="txt">${esc(g.writer)}</td><td>${g.players}</td><td>${esc(LEVELS[g.level]?.label || g.level)}</td><td>${g.quests}</td><td>${g.score}</td></tr>`).join("")}
      </tbody></table>`;
  }

  // ---------- Tutorial ----------
  const tutorialState = { on: false, seen: new Set() };
  const STEPS = {
    chooseAction: {
      title: "1. Play an Action card",
      text: "Each round, everyone plays one Action card. Its chapter number sets the turn order: the highest number chooses a group first. Its effect (coins, XP, Quests, activations…) is resolved at the end of your turn. Played cards are gone, so use your high chapters wisely!",
      target: "#actionHand",
    },
    chooseGroup: {
      title: "2. Take a group of cards",
      text: "The groups in the middle hold Normal and Legendary characters. Take one: Instant effects happen right away, and the icons on the cards count for your Quests and scoring. Groups already taken by the other storyteller are greyed out.",
      target: "#groups",
    },
    buyItem: {
      title: "3. Buy an Item, then resolve your Action",
      text: "You may buy one Item tile with your coins (optional). Then press “Resolve Action card effect” to get what your chapter gives you.",
      target: "#itemDisplay",
    },
    questPick: {
      title: "Take a Quest",
      text: "Your effect lets you take a Quest. Quests score Victory Points at the end of the game: pick one that matches the icons you are collecting.",
      target: "#questDisplay",
    },
    roundDone: {
      title: "4. Upgrade and end the round",
      text: "Spend XP to upgrade your Legendary characters (in your tableau) or to level up your Writer. When you are ready, press “End round”. The game ends when your Action cards run out.",
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
    showCoach(key, step);
  }

  function showCoach(key, step) {
    const coach = $("#coach");
    coach.hidden = false;
    coach.innerHTML = `<b>${esc(step.title)}</b><p>${esc(step.text)}</p><div class="cbtn"><button type="button" class="ghost" data-coach="stop">Leave tutorial</button><button type="button" data-coach="ok">Got it</button></div>`;
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

  window.Home = { show, afterRender, recordGame };
  bindHome();
  show();
})();
