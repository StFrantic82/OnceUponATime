// Once Upon a Time — the computer storytellers.
// Every function runs with G.cur set to the bot's seat, so `state` is the bot's own state.
(function () {
  const level = () => (G.settings && G.settings.level) || "normal";
  const rand = (list) => list[Math.floor(Math.random() * list.length)];

  function bestGroupValues() {
    const values = G.groups.filter((g) => !g.taken).map(groupValue).sort((a, b) => b - a);
    return { best: values[0] || 0, second: values[1] || 0 };
  }

  // Pick a Chapter card. Numbers already played this round by others are avoided when possible.
  function chooseAction(p) {
    const taken = new Set(G.players.filter((o) => o !== p && o.currentAction).map((o) => o.currentAction.number));
    const options = p.hand.filter((card) => !taken.has(card.number));
    const pool = options.length ? options : p.hand;
    if (!pool.length) return;
    const sorted = [...pool].sort((a, b) => a.number - b.number);
    let pick;
    if (level() === "easy") {
      pick = rand(pool);
    } else if (level() === "hard") {
      const { best, second } = bestGroupValues();
      const keen = best - second;
      // Low chapters carry the strongest effects: play them when the groups are even.
      pick = keen > 4 ? sorted[sorted.length - 1] : keen > 2 ? sorted[Math.floor(sorted.length / 2)] : sorted[0];
    } else {
      pick = Math.random() < 0.5 ? sorted[sorted.length - 1] : rand(pool);
    }
    playAction(pick.number);
  }

  // How much a card is worth to this bot right now (rough, but aware of its Quests).
  function cardWorth(card) {
    let value = card.deck === "legendary" ? 6 : 3;
    // A computer storyteller may follow the "no tag" plan: cards without tags and VP during the game.
    if (state.strategy === "tagless" && isTagless(card)) value += 5;
    value += totalIcons(card) * 1.2;
    const text = `${card.effect || ""} ${card.base || ""}`;
    if (/Game End/i.test(text)) value += 2;
    if (/Activation/i.test(text)) value += 1;
    // Story links: cards of the same tale work together ("if you have X").
    const mine = [...state.tableau, ...state.items];
    const fullText = `${text} ${card.upgrade || ""}`;
    if (mine.some((c) => fullText.includes(c.name) || `${c.effect || ""} ${c.base || ""} ${c.upgrade || ""}`.includes(card.name))) value += 2;
    if (card.alignment === "Good" && mine.some((c) => c.name === "Pinocchio")) value += 0.5;
    for (const quest of state.quests) {
      for (const icon of ["Charm", "Strength", "Dexterity", "Intelligence"]) {
        if (new RegExp(icon).test(quest.scoring)) value += iconAmount(card, icon) * 1.5;
      }
      if (/Bad card/.test(quest.scoring) && card.alignment === "Bad") value += 2;
      if (/Good Legendary/.test(quest.scoring) && card.alignment === "Good" && card.deck === "legendary") value += 2;
      if (/each Dwarf/.test(quest.scoring) && card.name === "Dwarf") value += 2;
    }
    return value;
  }

  function chooseGroup() {
    const open = G.groups.filter((g) => !g.taken);
    if (!open.length) return;
    let pick;
    if (level() === "easy" && Math.random() < 0.6) pick = rand(open);
    else if (level() === "hard") pick = [...open].sort((a, b) => b.cards.reduce((s, c) => s + cardWorth(c), 0) - a.cards.reduce((s, c) => s + cardWorth(c), 0))[0];
    else pick = [...open].sort((a, b) => groupValue(b) - groupValue(a))[0];
    // Magic Carpet: drop the weakest Common card of the group when it is worth less than 2 coins.
    let choice = pick.id;
    if (hasCarpet()) {
      const weakest = pick.cards.filter((c) => c.deck === "common").sort((a, b) => cardWorth(a) - cardWorth(b))[0];
      if (weakest && cardWorth(weakest) < 4.5) choice += `|${weakest.id}`;
    }
    takeGroup(choice);
  }

  function itemWorth(item) {
    let value = item.cost;
    if (state.strategy === "tagless" && (isTagless(item) || /without tags/.test(item.effect))) value += 4;
    if (/VP/.test(item.effect)) value += 2;
    if (/Quest/.test(item.effect)) value += 1.5;
    if (/Geppetto/.test(state.tableau.map((c) => c.name).join())) value += 1;
    if (state.tableau.some((c) => item.effect.includes(c.name) || `${c.base || ""} ${c.upgrade || ""}`.includes(item.name))) value += 2;
    value += totalIcons(item);
    return value;
  }

  function buySomething() {
    const affordable = G.itemDisplay.filter((item) => itemPrice(item).price <= state.coins);
    if (!affordable.length) return;
    if (level() === "easy") {
      if (Math.random() < 0.5) buyItem(rand(affordable).id);
      return;
    }
    const pick = [...affordable].sort((a, b) => itemWorth(b) - itemWorth(a))[0];
    // Keep a little money in reserve when a better Item is just out of reach (hard only).
    if (level() === "hard" && state.coins - itemPrice(pick).price < 1 && G.itemDisplay.some((i) => itemWorth(i) > itemWorth(pick) + 2)) return;
    buyItem(pick.id);
  }

  function questPlan(quest) {
    return scoreQuest(quest) + (state.strategy === "tagless" && /Queen's Command/.test(quest.name) ? 8 : 0);
  }

  function takeQuests() {
    let guard = 6;
    while (state.questChoices > 0 && G.questDisplay.length && guard > 0) {
      guard -= 1;
      const pick = level() === "easy" ? rand(G.questDisplay) : [...G.questDisplay].sort((a, b) => questPlan(b) - questPlan(a))[0];
      takeQuest(pick.id);
    }
    state.questChoices = 0;
  }

  function settleWriterChoices() {
    if (state.writerDraftChoices?.length) {
      let pick = state.writerDraftChoices[0];
      if (pick.iconChoice) {
        const counts = iconCounts();
        pick = [...state.writerDraftChoices].sort((a, b) => counts[a.iconChoice] - counts[b.iconChoice])[0];
      } else {
        pick = [...state.writerDraftChoices].sort((a, b) => cardWorth(b) - cardWorth(a))[0];
      }
      resolveWriterDraft(pick.id);
    }
    state.writerDiscardRemaining = 0;
  }

  // XP goes on star spaces and never moves: the bot fills the step closest to completion,
  // weighing a Legendary's upgrade against the Writer's next level.
  async function spendXp() {
    const seat = G.cur;
    let guard = 40;
    while (guard-- > 0) {
      const legends = state.tableau.filter((c) => c.deck === "legendary" && !c.upgraded);
      if (state.freeUpgrades > 0 && state.writer && state.writerLevel < 3 && (!legends.length || writerNextCost() - (state.writerXp || 0) >= Math.max(...legends.map((c) => upgradeCost(c) - (c.xpOn || 0))))) {
        await freeUpgradeWriter();
        G.cur = seat;
        settleWriterChoices();
        continue;
      }
      if (state.freeUpgrades > 0 && legends.length) {
        upgradeLegendary([...legends].sort((a, b) => (upgradeCost(b) - (b.xpOn || 0)) - (upgradeCost(a) - (a.xpOn || 0)))[0].id);
        continue;
      }
      if (state.xp <= 0) return;
      if (level() === "easy") return; // easy bots let their XP go to the Writer at the end of the turn
      const options = [];
      if (state.writer && state.writerLevel < 3) {
        const left = writerNextCost() - (state.writerXp || 0);
        options.push({ target: "writer", left, value: state.writerLevel === 2 ? 9 : 6 });
      }
      for (const c of legends) options.push({ target: c.id, left: upgradeCost(c) - (c.xpOn || 0), value: 7 + (cardWorth ? Math.min(6, cardWorth(c) / 3) : 0) });
      if (!options.length) return;
      // Prefer what can be completed with the XP we have, then the best value per missing XP.
      options.sort((a, b) => (b.left <= state.xp) - (a.left <= state.xp) || b.value / b.left - a.value / a.left);
      const pick = options[0];
      await placeXp(pick.target, Math.min(state.xp, pick.left));
      G.cur = seat;
      settleWriterChoices();
      if (state.writerItemDiscount > 0) buySomething();
    }
  }

  // After "draw 1 Chapter card", put back the card the bot needs least (a middle chapter).
  function settleTuck() {
    let guard = 4;
    while (state.tuckPending > 0 && state.hand.length && guard > 0) {
      guard -= 1;
      const sorted = [...state.hand].sort((a, b) => a.number - b.number);
      const pick = level() === "easy" ? rand(sorted) : sorted[Math.floor(sorted.length / 2)];
      tuckAction(pick.number);
    }
    state.tuckPending = 0;
  }

  async function playTurn() {
    const seat = G.cur;
    while ((state.choices || []).length) {
      const c = state.choices[0];
      resolveChoice(botOption(c.options));
    }
    while (state.activatePending > 0) {
      const pick = activationCandidates()[0];
      if (!pick) {
        state.activatePending = 0;
        break;
      }
      await activatePick(pick.id);
      G.cur = seat;
    }
    if (state.phase === "chooseGroup") chooseGroup();
    settleTuck();
    if (state.phase === "buyItem") {
      await activateActionStep();
      G.cur = seat;
      while (state.activatePending > 0 && activationCandidates().length) {
        await activatePick(activationCandidates()[0].id);
        G.cur = seat;
      }
      state.activatePending = 0;
      buySomething();
    }
    takeQuests();
    await spendXp();
    G.cur = seat;
    takeQuests();
    settleWriterChoices();
    settleTuck();
    if (state.phase === "roundDone") await endTurn();
  }

  const Bot = {
    delay: 650,
    cardWorth,
    chooseAction,
    playTurn,
    queueTurn(seat) {
      setTimeout(() => window.Game.runBot(seat), Bot.delay);
    },
  };
  window.Bot = Bot;
})();
