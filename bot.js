// Once Upon a Time — the computer storytellers.
// Every function runs with G.cur set to the bot's seat, so `state` is the bot's own state.
(function () {
  const level = () => (G.settings && G.settings.level) || "normal";
  const rand = (list) => list[Math.floor(Math.random() * list.length)];

  // ---------------------------------------------------------------------------
  // The "hard" storyteller plans with the real scoring of the game: it measures what a card, an Item,
  // an Adventure or an upgrade would add to its final score, then adds what the card can still bring
  // in the rounds that are left.
  // ---------------------------------------------------------------------------
  const smart = () => level() === "hard" && state.ai !== "v1";
  // Tuning: seats flagged "v1b" in simulations try the alternative values (A/B tests).
  const TUNE = { coinBuy: 0.2, coinGain: 0.5, coinInstant: 0.5 };
  const ALT = { coinBuy: 0.2, coinGain: 0.5, coinInstant: 0.5 };
  const tune = (key) => (state.ai === "alt" ? ALT : TUNE)[key];
  const roundsLeft = () => Math.max(0, (G.settings.rounds || 8) - G.round);

  // The Writer's level 3, counted in advance (the closer the level, the more it weighs).
  function writerPotential() {
    if (!state.writer) return 0;
    const lvl = state.writerLevel;
    if (lvl >= 3) return scoreWriter();
    if (roundsLeft() === 0) return 0;
    state.writerLevel = 3;
    const value = scoreWriter();
    state.writerLevel = lvl;
    return value * (lvl === 2 ? 0.65 : 0.35);
  }

  function projected() {
    return scoreCards() + state.quests.reduce((sum, quest) => sum + scoreQuest(quest), 0) + writerPotential() + state.vp;
  }

  // What a list of cards adds to the projected score when they join the tableau together.
  function jointGain(cards, list) {
    const before = projected();
    list.push(...cards);
    const after = projected();
    list.splice(list.length - cards.length, cards.length);
    return after - before;
  }

  // Value of what a text gives at once.
  function immediate(text) {
    const left = roundsLeft();
    let value = 0;
    let m;
    const instant = (String(text).match(/Instant:[^]*?(?=(?:Activation|Ongoing|Game End):|$)/i) || [""])[0];
    if ((m = instant.match(/gain (\d+) coins?/i))) value += Number(m[1]) * (left ? tune("coinInstant") : 0.15);
    if ((m = instant.match(/(\d+) XP/i))) value += Number(m[1]) * (xpTargets().length ? 1.1 : 0.1);
    if ((m = instant.match(/gain (\d+) VP/i))) value += Number(m[1]);
    if (/Tag token/i.test(instant)) value += 1.2;
    if (/take 1 (?:Quest|Adventure)/i.test(instant)) value += 3 + 0.3 * left;
    return value;
  }

  // What a card can still bring in the rounds to come (beyond what it scores right now).
  function future(card) {
    const left = roundsLeft();
    const text = card.deck === "legendary" ? card.base || "" : card.effect || "";
    let value = immediate(text);
    if (/Game End/i.test(text)) value += 0.35 * left;
    if (/Activation/i.test(text)) value += 0.45 * left;
    if (/Ongoing/i.test(text)) value += 0.3 * left;
    value += totalIcons(card) * (0.4 + 0.12 * left);
    if (card.deck === "legendary") value += 1 + Math.min(3, 0.6 * left);
    else if (card.deck === "common") value += 0.8;
    if (left > 0) {
      const mine = [...state.tableau, ...state.items];
      const fullText = `${card.effect || ""} ${card.base || ""} ${card.upgrade || ""}`;
      if (mine.some((c) => fullText.includes(c.name) || `${c.effect || ""} ${c.base || ""} ${c.upgrade || ""}`.includes(card.name))) value += 1.5;
      for (const quest of state.quests) {
        for (const icon of ["Charm", "Strength", "Dexterity", "Intelligence"]) {
          if (new RegExp(icon).test(quest.scoring)) value += iconAmount(card, icon) * 0.8;
        }
      }
    }
    if (state.strategy === "tagless" && isTagless(card)) value += 4;
    return value;
  }

  function smartCardWorth(card) {
    return jointGain([card], card.deck === "items" || card.cost != null ? state.items : state.tableau) + future(card);
  }

  function smartGroupWorth(group) {
    return jointGain(group.cards, state.tableau) + group.cards.reduce((sum, card) => sum + future(card), 0);
  }

  // What upgrading a Legendary is worth.
  function upgradeValue(card) {
    const left = roundsLeft();
    const before = projected();
    card.upgraded = true;
    const after = projected();
    card.upgraded = false;
    const text = String(card.upgrade || "");
    let value = after - before + immediate(text);
    let m;
    if ((m = text.match(/Gain (\d+) VP/))) value += Number(m[1]);
    if (/Activation/i.test(text)) value += 0.8 + 0.5 * left;
    if (/Ongoing/i.test(text)) value += 0.5 + 0.35 * left;
    if (/Game End/i.test(text)) value += 0.3 * left;
    return Math.max(0.5, value);
  }

  function questValue(quest) {
    const left = roundsLeft();
    state.quests.push(quest);
    const now = projected();
    state.quests.pop();
    const gain = now - projected();
    const tiered = /\d+ \/ \d+ \/ \d+/.test(quest.scoring || "");
    const room = Math.max(0, (tiered ? 6 : 8) - gain);
    return gain + Math.min(room, (tiered ? 0.45 : 0.55) * left) + (state.strategy === "tagless" && /Queen's Command/.test(quest.name) ? 6 : 0);
  }

  // Value of a Chapter effect if it were resolved this turn.
  function effectNow(effect) {
    const left = roundsLeft();
    let value = 0;
    for (const part of String(effect || "").split("+").map((x) => x.trim())) {
      let m;
      if (/Draft (?:a )?Quest/i.test(part)) value += G.questDisplay.length ? Math.max(...G.questDisplay.map(questValue)) : 0;
      else if (/Activate all/i.test(part)) value += activationCandidates().length * 1.3;
      else if (/Activate a single/i.test(part)) value += activationCandidates().length ? 1.7 : 0;
      else if ((m = part.match(/^(\d+) Coins?/i))) value += Number(m[1]) * (left ? tune("coinGain") : 0.3);
      else if ((m = part.match(/^(\d+) XP/i))) value += Number(m[1]) * (xpTargets().length ? 1.2 : 0);
      else if (/Free level up/i.test(part)) {
        const legends = state.tableau.filter((c) => c.deck === "legendary" && !c.upgraded);
        if (legends.length) value += Math.max(...legends.map((c) => upgradeValue(c) * 0.6 + (upgradeCost(c) - (c.xpOn || 0)) * 0.7));
        else if (G.groups.some((g) => !g.taken && g.cards.some((c) => c.deck === "legendary"))) value += 2;
      } else if (/Draw 1 Chapter/i.test(part)) value += left ? 1 : 0;
    }
    return value;
  }

  // Typical value of each chapter: a card is kept for later when it would bring less than that now.
  const CHAPTER_BASE = { 1: 9.5, 2: 9, 3: 8, 4: 6.5, 5: 6.5, 6: 5.5, 7: 3.8, 8: 3.4, 9: 2.6, 10: 2.4, 11: 1, 12: 0 };

  function smartChooseAction(p, pool) {
    const left = roundsLeft();
    const keep = left >= 3 ? 0.85 : left === 2 ? 0.7 : left === 1 ? 0.5 : 0;
    const values = G.groups.filter((g) => !g.taken).map(smartGroupWorth).sort((a, b) => b - a);
    const others = G.players.filter((o) => o !== p);
    const groupAt = (ahead) => {
      const lo = Math.min(values.length - 1, Math.floor(ahead));
      const hi = Math.min(values.length - 1, lo + 1);
      return values.length ? values[lo] + (values[hi] - values[lo]) * (ahead - Math.floor(ahead)) : 0;
    };
    let best = null;
    for (const card of pool) {
      const mine = card.number + actionBonus(p, card.number);
      const ahead = others.reduce((sum, o) => sum + (o.currentAction ? (o.actionValue > mine ? 1 : 0) : Math.min(1, Math.max(0, (12 - mine) / 11))), 0);
      const score = effectNow(card.effect) - keep * (CHAPTER_BASE[card.number] || 0) + groupAt(ahead);
      if (!best || score > best.score) best = { card, score };
    }
    return best.card;
  }

  function bestGroupValues() {
    const values = G.groups.filter((g) => !g.taken).map(groupValue).sort((a, b) => b - a);
    return { best: values[0] || 0, second: values[1] || 0 };
  }

  // Pick a Chapter card. Numbers already played this round by others are avoided when possible.
  function chooseAction(p) {
    const taken = new Set(G.players.filter((o) => o !== p && o.currentAction).map((o) => o.currentAction.number));
    const options = p.hand.filter((card) => canPlayChapter(p, card.number));
    const pool = options.length ? options : p.hand;
    if (!pool.length) return;
    const sorted = [...pool].sort((a, b) => a.number - b.number);
    let pick;
    if (level() === "easy") {
      pick = rand(pool);
    } else if (smart()) {
      pick = smartChooseAction(p, pool);
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
    if (smart()) return smartCardWorth(card);
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
    else if (smart()) pick = [...open].sort((a, b) => smartGroupWorth(b) - smartGroupWorth(a))[0];
    else if (level() === "hard") pick = [...open].sort((a, b) => b.cards.reduce((s, c) => s + cardWorth(c), 0) - a.cards.reduce((s, c) => s + cardWorth(c), 0))[0];
    else pick = [...open].sort((a, b) => groupValue(b) - groupValue(a))[0];
    // Magic Carpet: drop the weakest Common card of the group when it is worth less than 2 coins.
    let choice = pick.id;
    if (hasCarpet()) {
      const weakest = pick.cards.filter((c) => c.deck === "common").sort((a, b) => cardWorth(a) - cardWorth(b))[0];
      if (weakest && cardWorth(weakest) < (smart() ? 1.8 : 4.5)) choice += `|${weakest.id}`;
    }
    takeGroup(choice);
  }

  function itemWorth(item) {
    let value = item.cost;
    if (state.strategy === "tagless" && (isTagless(item) || /without tags/.test(item.effect))) value += 4;
    if (/VP/.test(item.effect)) value += 2;
    if (/Quest|Adventure/.test(item.effect)) value += 1.5;
    if (/Geppetto/.test(state.tableau.map((c) => c.name).join())) value += 1;
    if (state.tableau.some((c) => item.effect.includes(c.name) || `${c.base || ""} ${c.upgrade || ""}`.includes(item.name))) value += 2;
    value += totalIcons(item);
    return value;
  }

  function buySomething() {
    const affordable = G.itemDisplay.filter((item) => itemPrice(item).price <= state.coins + (window.Game?.crownStash ? window.Game.crownStash() : 0));
    if (!affordable.length) return;
    if (level() === "easy") {
      if (Math.random() < 0.5) buyItem(rand(affordable).id);
      return;
    }
    if (smart()) {
      // Buy the Item that adds the most points for its price; coins are worth little in the last round.
      const coinValue = roundsLeft() ? tune("coinBuy") : 0.1;
      const scored = affordable.map((item) => {
        const price = itemPrice(item).price;
        const coins = state.coins;
        state.coins = Math.max(0, coins - price);
        const worth = jointGain([item], state.items) + future(item) + (/Activation/i.test(item.effect) ? 0.3 * roundsLeft() : 0);
        state.coins = coins;
        return { item, net: worth - price * coinValue };
      }).sort((a, b) => b.net - a.net);
      if (scored[0].net > 0) buyItem(scored[0].item.id);
      return;
    }
    const pick = [...affordable].sort((a, b) => itemWorth(b) - itemWorth(a))[0];
    // Keep a little money in reserve when a better Item is just out of reach (hard only).
    if (level() === "hard" && state.coins - itemPrice(pick).price < 1 && G.itemDisplay.some((i) => itemWorth(i) > itemWorth(pick) + 2)) return;
    buyItem(pick.id);
  }

  function questPlan(quest) {
    if (smart()) return questValue(quest);
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
    await settleWriterXp();
    G.cur = seat;
    let guard = 40;
    while (guard-- > 0) {
      const legends = state.tableau.filter((c) => c.deck === "legendary" && !c.upgraded);
      if (state.freeUpgrades > 0 && legends.length && smart()) {
        const worth = (c) => upgradeValue(c) * 0.6 + (upgradeCost(c) - (c.xpOn || 0)) * 0.7;
        upgradeLegendary([...legends].sort((a, b) => worth(b) - worth(a))[0].id);
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
        let value = state.writerLevel === 2 ? 9 : 6;
        if (smart()) {
          const lvl = state.writerLevel;
          state.writerLevel = 3;
          const top = scoreWriter() + 0.4 * roundsLeft();
          state.writerLevel = lvl;
          value = lvl === 2 ? top : 3 + (roundsLeft() >= 2 ? top * 0.45 : 0);
        }
        options.push({ target: "writer", left, value });
      }
      for (const c of legends) options.push({ target: c.id, left: upgradeCost(c) - (c.xpOn || 0), value: smart() ? upgradeValue(c) : 7 + (cardWorth ? Math.min(6, cardWorth(c) / 3) : 0) });
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
