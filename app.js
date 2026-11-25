// Once Upon a Time — game engine and table view.
// Every player has their own tableau, resources and score. The shared table (decks, groups,
// displays, turn order, log) lives in G. Game rules read and write `state`, a view that sends
// personal fields to the player currently acting (G.cur) and everything else to G.
const DATA = window.GAME_DATA;

const ICONS = ["Charm", "Strength", "Dexterity", "Intelligence"];
const ICON_FILES = {
  Charm: "assets/icons/tag-charm.png",
  Strength: "assets/icons/tag-strength.png",
  Dexterity: "assets/icons/tag-ruse.png",
  DexteritySq: "assets/icons/tag-ruse-square.png",
  Intelligence: "assets/icons/tag-intelligence.png",
  coins: "assets/icons/coin.png",
  xp: "assets/icons/xp.png",
  vp: "assets/icons/vp.png",
  Good: "assets/icons/good.png",
  Bad: "assets/icons/evil.png",
  ongoing: "assets/icons/effect-type-ongoing.png",
  instant: "assets/icons/effect-type-instant.png",
  activation: "assets/icons/effect-type-activation.png",
  endgame: "assets/icons/effect-type-endgame.png",
};
const ICON_LABELS = { Charm: "Charm", Strength: "Strength", Dexterity: "Dexterity", Intelligence: "Intelligence" };

const PERSONAL = new Set([
  "coins", "xp", "writerXp", "activatePending", "vp", "tagTokens", "freeUpgrades", "hand", "actionDeck", "actionDiscard", "tableau", "items", "quests",
  "questChoices", "writer", "writerLevel", "writerItemDiscount", "writerDraftChoices", "writerDiscardRemaining", "iconTokens",
  "writerRound", "rewardedIconSets", "currentAction", "actionValue", "playerFirst", "phase", "name", "kind", "uid", "seat", "tuckPending",
]);

let G = emptyGame();
let simMode = false; // AI simulations: no drawing, no waiting, no network
const view = { seat: 0, role: "solo" }; // role: solo | host | guest
const state = new Proxy(
  {},
  {
    get(_, key) {
      if (PERSONAL.has(key)) return G.players[G.cur]?.[key];
      return G[key];
    },
    set(_, key, value) {
      if (PERSONAL.has(key)) {
        if (G.players[G.cur]) G.players[G.cur][key] = value;
      } else {
        G[key] = value;
      }
      return true;
    },
  },
);

function emptyGame() {
  return { players: [], cur: 0, round: 0, decks: {}, groups: [], itemDisplay: [], questDisplay: [], order: [], active: null, firstSeat: 0, gameOver: false, log: [], settings: {}, started: false };
}

const el = {
  stats: document.querySelector("#stats"),
  phaseText: document.querySelector("#phaseText"),
  actionHand: document.querySelector("#actionHand"),
  questDisplay: document.querySelector("#questDisplay"),
  itemDisplay: document.querySelector("#itemDisplay"),
  groups: document.querySelector("#groups"),
  tableau: document.querySelector("#tableau"),
  tableauSummary: document.querySelector("#tableauSummary"),
  playerAction: document.querySelector("#playerAction"),
  botAction: document.querySelector("#botAction"),
  roundState: document.querySelector("#roundState"),
  playersPanel: document.querySelector("#playersPanel"),
  log: document.querySelector("#log"),
  writerPanel: document.querySelector("#writerPanel"),
  writerSetup: document.querySelector("#writerSetup"),
  writerSetupTitle: document.querySelector("#writerSetupTitle"),
  writerChoices: document.querySelector("#writerChoices"),
  deckCatalog: document.querySelector("#deckCatalog"),
  deckCatalogTitle: document.querySelector("#deckCatalogTitle"),
  deckCatalogTabs: document.querySelector("#deckCatalogTabs"),
  deckCatalogCards: document.querySelector("#deckCatalogCards"),
  closeCatalogBtn: document.querySelector("#closeCatalogBtn"),
  newGameBtn: document.querySelector("#newGameBtn"),
  resolveActionBtn: document.querySelector("#resolveActionBtn"),
  endRoundBtn: document.querySelector("#endRoundBtn"),
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

function askConfirm(message) {
  return new Promise((resolve) => {
    const box = document.createElement("div");
    box.className = "confirm-overlay";
    box.innerHTML = `<div class="confirm-box" role="dialog" aria-modal="true"><p></p><div class="confirm-actions"><button type="button" data-yes>${t("yes")}</button><button type="button" data-no>${t("no")}</button></div></div>`;
    box.querySelector("p").textContent = message;
    const done = (answer) => {
      box.remove();
      resolve(answer);
    };
    box.querySelector("[data-yes]").addEventListener("click", () => done(true));
    box.querySelector("[data-no]").addEventListener("click", () => done(false));
    document.body.appendChild(box);
    box.querySelector("[data-yes]").focus();
  });
}

// Optional costs: the local player is asked; the computer and remote players accept when they can pay.
function confirmCost(card) {
  const p = G.players[G.cur];
  if (p && p.kind === "human" && p.seat === view.seat && view.role !== "guest") {
    return askConfirm(t("l_costAsk", { c: tc(card.name) }));
  }
  return Promise.resolve(true);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function shuffle(cards) {
  const deck = clone(cards);
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function draw(deckName, count) {
  const cards = [];
  for (let i = 0; i < count; i += 1) {
    const card = G.decks[deckName].shift();
    if (card) cards.push(card);
  }
  return cards;
}

// One Action card is drawn at the end of every round, so the Action deck counts the rounds left.
function drawActionCard() {
  if (state.actionDeck.length) state.hand.push(state.actionDeck.shift());
}

// "Draw an Action card": draw 1, then put 1 card from your hand under your deck.
// The deck size does not change; with an empty deck the effect does nothing.
function drawAndTuck() {
  if (!state.actionDeck.length) return;
  state.hand.push(state.actionDeck.shift());
  state.tuckPending = (state.tuckPending || 0) + 1;
}

function tuckAction(number) {
  if (!(state.tuckPending > 0)) return;
  const card = state.hand.find((entry) => entry.number === Number(number));
  if (!card) return;
  state.hand = state.hand.filter((entry) => entry !== card);
  state.actionDeck.push(card);
  state.tuckPending -= 1;
  log("l_tuck", { p: state.name });
}

// Log entries are stored as keys + values so each viewer reads them in their own language.
const C = (name) => ({ c: name });
function log(key, vars = {}) {
  G.log.unshift({ k: key, v: vars });
  G.log = G.log.slice(0, 60);
}

function renderLogEntry(entry) {
  if (typeof entry === "string") return escapeHtml(entry);
  const vars = {};
  for (const [k, v] of Object.entries(entry.v || {})) {
    if (v && typeof v === "object") {
      if (v.c !== undefined) vars[k] = escapeHtml(tc(v.c));
      else if (v.cs) vars[k] = v.cs.map((n) => escapeHtml(tc(n))).join(", ");
      else if (v.k) vars[k] = escapeHtml(t(v.k));
      else if (v.icon) vars[k] = resourceIcon(v.icon, v.icon);
    } else {
      vars[k] = escapeHtml(v);
    }
  }
  return t(entry.k, vars);
}

function withSeat(seat, fn) {
  const prev = G.cur;
  G.cur = seat;
  try {
    return fn();
  } finally {
    G.cur = prev;
  }
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------
// Board layout per player count (groups of Normal + Legendary cards), from the Board sheet.
const BOARDS = {
  2: [[1, 0], [1, 1], [2, 1]],
  3: [[1, 0], [2, 0], [1, 1], [2, 1]],
  4: [[1, 0], [2, 0], [1, 1], [2, 1], [1, 2]],
  5: [[1, 0], [2, 0], [1, 1], [2, 1], [0, 2], [1, 2]],
};

const settings = { players: 2, level: "normal", name: "You", writerMode: "random", tutorial: false };

function newPlayer(seat, info) {
  const actionDeck = shuffle(DATA.actions);
  return {
    seat,
    name: info.name,
    kind: info.kind, // human | bot
    uid: info.uid || null,
    coins: 2,
    xp: 0,
    writerXp: 0,
    activatePending: 0,
    vp: 0,
    tagTokens: 0,
    freeUpgrades: 0,
    actionDeck,
    hand: actionDeck.splice(0, 4),
    actionDiscard: [],
    tableau: [],
    items: [],
    quests: [],
    questChoices: 0,
    writer: null,
    writerLevel: 1,
    writerItemDiscount: 0,
    writerDraftChoices: [],
    writerDiscardRemaining: 0,
    iconTokens: { Charm: 0, Strength: 0, Dexterity: 0, Intelligence: 0 },
    writerRound: {},
    rewardedIconSets: 0,
    currentAction: null,
    actionValue: 0,
    playerFirst: false,
    phase: "chooseAction",
    tuckPending: 0,
  };
}

// seats: [{ name, kind: "human"|"bot", uid }]. Solo play passes nothing and gets one human + bots.
function newGame(options = {}, seats = null) {
  Object.assign(settings, options);
  const players = Math.min(5, Math.max(2, Number(settings.players) || 2));
  settings.players = players;
  settings.rounds = 8; // the story always lasts 8 rounds
  if (!seats) {
    const names = t("botNames");
    seats = [{ name: settings.name || t("you"), kind: "human", uid: "local" }];
    for (let i = 1; i < players; i += 1) seats.push({ name: names[i - 1], kind: "bot" });
    view.role = "solo";
    view.seat = 0;
  }
  G = emptyGame();
  G.settings = { ...settings };
  G.started = true;
  G.decks = {
    common: shuffle(DATA.common),
    legendary: shuffle(DATA.legendary),
    items: shuffle(DATA.items),
    quests: shuffle(DATA.quests),
  };
  G.players = seats.slice(0, players).map((info, seat) => newPlayer(seat, info));
  G.itemDisplay = draw("items", 1 + players);
  G.questDisplay = draw("quests", 2 + players);
  G.firstSeat = Math.floor(Math.random() * players);
  G.startSeat = G.firstSeat;
  G.history = [];
  G.curve = [];
  const writers = shuffle(DATA.writers || []);
  for (const p of G.players) {
    if (p.kind === "human" && settings.writerMode === "choose") {
      p.phase = "chooseWriter";
    } else {
      p.writer = writers.pop() || null;
      if (p.writer) log("l_isWriterOf", { p: p.name, w: C(p.writer.name) });
    }
  }
  startRound();
  afterChange();
}

function startRound() {
  if (G.players.every((p) => !p.hand.length && !p.actionDeck.length)) {
    endGame();
    return;
  }
  G.round += 1;
  G.order = [];
  G.active = null;
  G.groups = (BOARDS[G.players.length] || BOARDS[2])
    .map(([basic, advanced], index) => ({
      id: `G${index + 1}`,
      taken: false,
      takenBy: null,
      takenSeat: null,
      cards: [
        ...draw("common", basic).map((card) => ({ ...card, source: "Normal" })),
        ...draw("legendary", advanced).map((card) => ({ ...card, source: "Legendary" })),
      ],
    }))
    .filter((group) => group.cards.length);
  for (const p of G.players) {
    p.currentAction = null;
    p.actionValue = 0;
    p.playerFirst = false;
    p.writerRound = { alignmentRewarded: false, activationRewarded: false };
    if (p.phase !== "chooseWriter") p.phase = p.hand.length ? "chooseAction" : "waitAction";
  }
  log("l_round", { n: G.round });
  if (G.round === G.settings.rounds) log("l_lastRound");
  // The computer picks its Action card once humans are done (they may react to what is played).
  maybeBotsChoose();
}

function endGame() {
  G.gameOver = true;
  G.active = null;
  for (const p of G.players) p.phase = "gameOver";
  G.results = G.players
    .map((p) => withSeat(p.seat, () => ({ seat: p.seat, name: p.name, writer: p.writer?.name || "-", ...finalScore() })))
    .sort((a, b) => b.total - a.total);
  log("l_over");
}

// ---------------------------------------------------------------------------
// Action cards and turn order
// ---------------------------------------------------------------------------
function actionBonus(p, number) {
  const writerBonus = p.writer?.name === "Carlo Collodi" && number <= 5 ? 1 : 0;
  const queen = p.tableau.find((card) => card.name === "Queen of Hearts");
  const queenBonus = queen ? (queen.upgraded ? 2 : 1) : 0;
  return writerBonus + queenBonus;
}

function playAction(number) {
  if (state.phase !== "chooseAction") return;
  const action = state.hand.find((card) => card.number === Number(number));
  if (!action) return;
  const p = G.players[G.cur];
  p.currentAction = action;
  p.hand = p.hand.filter((card) => card !== action);
  p.actionDiscard.push(action);
  p.actionValue = action.number + actionBonus(p, action.number);
  p.phase = "waitAction";
  maybeBotsChoose();
}

function maybeBotsChoose() {
  const humansWaiting = G.players.some((p) => p.kind === "human" && (p.phase === "chooseAction" || p.phase === "chooseWriter"));
  if (humansWaiting) return;
  for (const p of G.players) {
    if (p.kind === "bot" && p.phase === "chooseAction") withSeat(p.seat, () => Bot.chooseAction(p));
  }
  if (G.players.every((p) => p.phase === "waitAction")) beginTurns();
}

function beginTurns() {
  const n = G.players.length;
  const seatRank = (seat) => (seat - G.firstSeat + n) % n; // ties go to the first player, then clockwise
  const order = G.players
    .filter((p) => p.currentAction)
    .sort((a, b) => b.actionValue - a.actionValue || seatRank(a.seat) - seatRank(b.seat))
    .map((p) => p.seat);
  G.order = order;
  if (order.length) {
    const first = G.players[order[0]];
    first.playerFirst = true;
    G.firstSeat = order[0];
    const queen = first.tableau.find((card) => card.name === "Queen of Hearts" && card.upgraded);
    if (queen) withSeat(first.seat, () => gain("vp", 1));
  }
  G.history.push({ round: G.round, plays: G.players.filter((p) => p.currentAction).map((p) => ({ seat: p.seat, number: p.currentAction.number, first: p.seat === order[0], pos: order.indexOf(p.seat) })) });
  log("l_played", { list: G.players.filter((p) => p.currentAction).map((p) => `${p.name} ${p.currentAction.number}`).join(" · ") });
  for (const p of G.players) p.phase = "waitTurn";
  nextTurn();
}

function nextTurn() {
  const seat = G.order.shift();
  if (seat === undefined) {
    endRoundAll();
    return;
  }
  G.active = seat;
  const p = G.players[seat];
  const anyGroup = G.groups.some((group) => !group.taken);
  p.phase = anyGroup ? "chooseGroup" : "buyItem";
  log(anyGroup ? "l_turnOf" : "l_noGroupFor", { p: p.name });
  if (p.kind === "bot" && !simMode) Bot.queueTurn(seat);
}

// The story lasts 8 rounds. Each player draws one Action card at the end of each round:
// with 4 cards in hand and 8 in the deck, 1 card is left in the deck during the last round,
// so "draw 1 Action card, then put 1 under your deck" effects still work until the end.
function endRoundAll() {
  G.active = null;
  if (simMode) G.curve.push(G.players.map((p) => liveScore(p.seat)));
  if (G.round >= G.settings.rounds) {
    endGame();
    return;
  }
  for (const p of G.players) withSeat(p.seat, drawActionCard);
  while (G.itemDisplay.length < 1 + G.players.length && G.decks.items.length) G.itemDisplay.push(...draw("items", 1));
  while (G.questDisplay.length < 2 + G.players.length && G.decks.quests.length) G.questDisplay.push(...draw("quests", 1));
  startRound();
}

// ---------------------------------------------------------------------------
// A player's turn
// ---------------------------------------------------------------------------
function groupValue(group) {
  return group.cards.reduce((sum, card) => {
    let value = card.deck === "legendary" ? 7 : 3;
    value += totalIcons(card) * 0.8;
    if (/Quest|Game End|Activation|Ongoing/i.test(card.effect || card.base || "")) value += 1.2;
    return sum + value;
  }, 0);
}

function takeGroup(groupId) {
  if (state.phase !== "chooseGroup" || G.active !== G.cur) return;
  const group = G.groups.find((entry) => entry.id === groupId);
  if (!group || group.taken) return;
  group.taken = true;
  group.takenBy = state.name;
  group.takenSeat = G.cur;
  for (const card of group.cards) {
    state.tableau.push(card);
    applyInstant(card);
  }
  applyWriterAfterGroup(group.cards);
  checkBaumSets();
  log("l_takes", { p: state.name, cards: { cs: group.cards.map((card) => card.name) } });
  state.phase = "buyItem";
}

function itemPrice(item) {
  const baseDiscount = state.writer?.name === "Charles Perrault" && !state.writerRound.itemBought ? 1 : 0;
  const discount = Math.max(baseDiscount, state.writerItemDiscount || 0);
  return { price: Math.max(0, item.cost - discount), discount };
}

function buyItem(itemId) {
  const perraultPurchase = state.writer?.name === "Charles Perrault" && state.writerItemDiscount > 0;
  if (!perraultPurchase && (state.phase !== "buyItem" || state.writerRound.itemBought)) return;
  const item = G.itemDisplay.find((entry) => entry.id === itemId);
  if (!item) return;
  const { price } = itemPrice(item);
  if (state.coins < price) return;
  state.coins -= price;
  state.writerItemDiscount = 0;
  state.writerRound.itemBought = true;
  state.items.push(item);
  G.itemDisplay = G.itemDisplay.filter((entry) => entry.id !== itemId);
  applyInstant(item);
  triggerOnTakeItem();
  checkBaumSets();
  log("l_buys", { p: state.name, item: C(item.name), n: price, coin: { icon: "coins" } });
}

async function activateActionStep() {
  if (state.phase !== "buyItem" || !state.currentAction) return;
  const seat = G.cur;
  state.phase = "resolving";
  await resolveAction(state.currentAction.effect);
  G.cur = seat;
  if (state.writer?.name === "J. M. Barrie" && state.currentAction.number <= 7 && state.playerFirst) gain("xp", 1);
  state.phase = "roundDone";
}

async function endTurn() {
  if (state.phase !== "roundDone" || state.questChoices > 0 || state.tuckPending > 0 || state.activatePending > 0 || G.active !== G.cur) return;
  const seat = G.cur;
  for (const p of G.players) {
    if (p.xp > 0) {
      G.cur = p.seat;
      await autoPlaceXp();
    }
  }
  G.cur = seat;
  if (state.phase !== "roundDone" || state.questChoices > 0 || state.tuckPending > 0) return;
  state.writerDiscardRemaining = 0;
  state.phase = "waitRound";
  nextTurn();
}

function takeQuest(questId) {
  if (state.questChoices <= 0) return;
  const quest = G.questDisplay.find((entry) => entry.id === questId);
  if (!quest) return;
  state.quests.push(quest);
  G.questDisplay = G.questDisplay.filter((entry) => entry.id !== questId);
  state.questChoices -= 1;
  const questRewardCards = state.tableau.filter((card) => /whenever you take a Quest, gain 1 XP/i.test(`${card.base || ""} ${card.upgrade || ""}`));
  if (questRewardCards.length) gain("xp", questRewardCards.length);
  log("l_takesQuest", { p: state.name, q: C(quest.name) });
}

function grantQuestChoice(source) {
  if (G.questDisplay.length <= state.questChoices) return;
  state.questChoices += 1;
}

function upgradeLegendary(cardId) {
  const card = state.tableau.find((entry) => entry.id === cardId && entry.deck === "legendary");
  if (!card || card.upgraded || G.gameOver || state.freeUpgrades <= 0) return;
  state.freeUpgrades -= 1;
  completeUpgrade(card);
}

function completeUpgrade(card) {
  card.upgraded = true;
  card.xpOn = 0;
  applyUpgradeGain(card);
  if (/take 1 Quest/i.test(card.upgrade || "")) grantQuestChoice(card.name);
  const servants = state.tableau.filter((entry) => entry.name === "The Invisible Servants").length;
  if (servants) gain("coins", servants);
  log("l_upgrades", { p: state.name, c: C(card.name) });
}

function chooseWriter(writerId) {
  const writer = DATA.writers.find((entry) => entry.id === writerId);
  if (!writer || state.writer || state.phase !== "chooseWriter") return;
  state.writer = clone(writer);
  state.phase = state.hand.length ? "chooseAction" : "waitAction";
  log("l_isWriterOf", { p: state.name, w: C(writer.name) });
  maybeBotsChoose();
}

function writerNextCost() {
  if (!state.writer || state.writerLevel >= 3) return 0;
  return state.writerLevel === 1 ? state.writer.cost2 : state.writer.cost3;
}

// XP rule: every XP gained goes on a free star space (Writer's next level, or a Legendary not yet upgraded).
// Placed XP can never move. When all the spaces of a step are filled, the card moves up at once.
// XP that is not placed by the end of a turn goes to the first free space (the Writer first).
function xpTargets() {
  const out = [];
  if (state.writer && state.writerLevel < 3) out.push("writer");
  for (const card of state.tableau) if (card.deck === "legendary" && !card.upgraded) out.push(card.id);
  return out;
}

async function placeXp(target = "writer", count = 1) {
  if (G.gameOver) return;
  const seat = G.cur;
  for (let i = 0; i < count && state.xp > 0; i += 1) {
    if (target === "writer") {
      if (!state.writer || state.writerLevel >= 3) return;
      state.xp -= 1;
      state.writerXp += 1;
      if (state.writerXp >= writerNextCost()) {
        state.writerXp = 0;
        await levelUpWriter();
        G.cur = seat;
      }
    } else {
      const card = state.tableau.find((entry) => entry.id === target && entry.deck === "legendary" && !entry.upgraded);
      if (!card) return;
      state.xp -= 1;
      card.xpOn = (card.xpOn || 0) + 1;
      if (card.xpOn >= upgradeCost(card)) completeUpgrade(card);
    }
  }
}

async function autoPlaceXp() {
  const seat = G.cur;
  let guard = 60;
  while (state.xp > 0 && guard-- > 0) {
    const target = xpTargets()[0];
    if (!target) break;
    await placeXp(target, 1);
    G.cur = seat;
  }
}

// XP still "in play": the reserve plus XP placed on spaces that have not been completed yet.
function xpRemaining() {
  return state.xp + state.writerXp + state.tableau.reduce((sum, card) => sum + (card.upgraded ? 0 : card.xpOn || 0), 0);
}

async function levelUpWriter() {
  const seat = G.cur;
  const nextLevel = state.writerLevel + 1;
  state.writerLevel = nextLevel;
  log("l_writerUp", { p: state.name, w: C(state.writer.name), n: nextLevel });
  if (nextLevel === 2) await resolveWriterInstant();
  G.cur = seat;
}

async function resolveWriterInstant() {
  const seat = G.cur;
  const name = state.writer.name;
  if (name === "Charles Perrault") {
    state.writerItemDiscount = 2;
  } else if (name === "Brothers Grimm") {
    gain("xp", Math.min(5, Math.min(countAlignment("Good"), countAlignment("Bad"))));
  } else if (name === "Hans Christian Andersen") {
    state.writerDiscardRemaining = 2;
  } else if (name === "Carlo Collodi") {
    const recovered = state.actionDiscard.pop();
    if (recovered) {
      state.hand.push(recovered);
      const discard = state.hand.filter((card) => card !== recovered).sort((a, b) => a.number - b.number)[0];
      if (discard) {
        state.hand = state.hand.filter((card) => card !== discard);
        state.actionDiscard.push(discard);
      }
    }
  } else if (name === "Lewis Carroll") {
    const cards = [...state.tableau, ...state.items].filter((card) => /Activation/i.test(activeCardText(card))).slice(0, 2);
    for (const card of cards) {
      await activateCard(card);
      G.cur = seat;
    }
  } else if (name === "J. M. Barrie") {
    state.writerDraftChoices = draw("common", 3);
  } else if (name === "L. Frank Baum") {
    state.writerDraftChoices = ICONS.map((icon) => ({ id: icon, name: ICON_LABELS[icon], iconChoice: icon }));
  } else if (name === "Le Prince de Beaumont") {
    state.freeUpgrades += 1;
  }
}

function resolveWriterDraft(choiceId) {
  const choice = state.writerDraftChoices.find((entry) => entry.id === choiceId);
  if (!choice) return;
  if (choice.iconChoice) {
    state.iconTokens[choice.iconChoice] += 2;
  } else {
    state.tableau.push({ ...choice, source: "Normal" });
    applyInstant(choice);
  }
  checkBaumSets();
  state.writerDraftChoices = [];
}

function discardForWriter(cardId) {
  if (state.writerDiscardRemaining <= 0) return;
  for (const zone of [state.tableau, state.items]) {
    const index = zone.findIndex((card) => card.id === cardId);
    if (index >= 0) {
      const [card] = zone.splice(index, 1);
      state.writerDiscardRemaining -= 1;
      gain("coins", 2);
      gain("xp", 2);
      log("l_discards", { p: state.name, c: C(card.name) });
      break;
    }
  }
}

function finishWriterDiscard() {
  state.writerDiscardRemaining = 0;
}

function applyWriterAfterGroup(cards) {
  if (state.writer?.name !== "Brothers Grimm" || state.writerRound.alignmentRewarded) return;
  if (cards.some((card) => card.alignment === "Good" || card.alignment === "Bad")) {
    gain("coins", 1);
    state.writerRound.alignmentRewarded = true;
  }
}

function checkBaumSets() {
  if (state.writer?.name !== "L. Frank Baum") return;
  const sets = Math.min(...ICONS.map((icon) => iconCounts()[icon]));
  if (sets > state.rewardedIconSets) {
    gain("coins", sets - state.rewardedIconSets);
    state.rewardedIconSets = sets;
  }
}

// ---------------------------------------------------------------------------
// Card effects
// ---------------------------------------------------------------------------
async function resolveAction(effect) {
  const seat = G.cur;
  const text = effect || "";
  if (/3 Coins/i.test(text)) gain("coins", 3);
  if (/4 Coins/i.test(text)) gain("coins", 4);
  if (/2 coins/i.test(text)) gain("coins", 2);
  if (/1 Coin/i.test(text)) gain("coins", 1);
  if (/3 XP/i.test(text)) gain("xp", 3);
  else if (/1 XP/i.test(text)) gain("xp", 1);
  if (/Quest/i.test(text)) grantQuestChoice("action");
  if (/Activate all/i.test(text)) await activateAll();
  G.cur = seat;
  if (/Activate a single/i.test(text)) await activateOne();
  G.cur = seat;
  if (/Free level up (?:to )?2/i.test(text)) state.freeUpgrades += 2;
  else if (/free level up/i.test(text)) state.freeUpgrades += 1;
}

function applyInstant(card) {
  const text = `${card.effect || ""} ${card.base || ""}`;
  if (!/Instant/i.test(text)) return;
  if (/gain 5 XP/i.test(text)) gain("xp", 5);
  else if (/gain 4 XP/i.test(text)) gain("xp", 4);
  else if (/gain 3 XP/i.test(text)) gain("xp", 3);
  else if (/gain 2 XP if you have a Bad/i.test(text)) {
    if (countAlignment("Bad")) gain("xp", 2);
  } else if (/gain 2 XP/i.test(text)) gain("xp", 2);
  else if (/gain 1 XP/i.test(text)) gain("xp", 1);
  if (/gain 5 coins/i.test(text)) gain("coins", 5);
  else if (/gain 4 coins/i.test(text)) gain("coins", 4);
  else if (/gain 3 coins/i.test(text)) gain("coins", 3);
  else if (/gain 2 coins/i.test(text)) gain("coins", 2);
  else if (/gain 1 coin\b/i.test(text)) gain("coins", 1);
  if (/gain 3 VP/i.test(text)) gain("vp", 3);
  else if (/gain 2 VP/i.test(text)) gain("vp", 2);
  if (/Tag token/i.test(text)) state.tagTokens += 1;
  if (/take 1 Quest|Take 1 Quest/i.test(text)) grantQuestChoice(card.name);
  if (/level up .*free|place XP on a Character so that it levels up/i.test(text)) state.freeUpgrades += 1;
  if (/draw 1 Action card, then put/i.test(text)) drawAndTuck();
}

function applyUpgradeGain(card) {
  const vp = (card.upgrade || "").match(/Gain (\d+) VP/i);
  if (vp) gain("vp", Number(vp[1]));
}

function triggerOnTakeItem() {
  const munchkins = state.tableau.filter((card) => /The Munchkins/i.test(card.name)).length;
  if (munchkins) gain("xp", munchkins);
}

async function activateAll() {
  const seat = G.cur;
  const cards = [...state.tableau, ...state.items].filter((card) => /Activation/i.test(activeCardText(card)));
  for (const card of cards) {
    await activateCard(card);
    G.cur = seat;
  }
  log("l_activates", { p: state.name, n: cards.length });
}

function activationCandidates() {
  return [...state.tableau, ...state.items].filter((entry) => /Activation/i.test(activeCardText(entry)));
}

// "Activate a single card": a human player chooses the card (it waits for a click); the computer takes the first one.
async function activateOne() {
  const options = activationCandidates();
  if (!options.length) return;
  const p = G.players[G.cur];
  if (p && p.kind === "human" && !simMode) {
    state.activatePending = (state.activatePending || 0) + 1;
    return;
  }
  await activateCard(options[0]);
}

async function activatePick(cardId) {
  if (!(state.activatePending > 0)) return;
  const card = activationCandidates().find((entry) => entry.id === cardId);
  if (!card) return;
  state.activatePending -= 1;
  await activateCard(card);
}

async function activateCard(card) {
  const seat = G.cur;
  const text = activeCardText(card);
  const hasActivationCost = /Activation:[\s\S]*?\b(?:spend|discard|tuck)\b/i.test(text);
  if (/spend 1 coin to gain 1 XP/i.test(text) && state.coins < 1) return;
  if (/spend 1 XP to gain 3 coins/i.test(text) && state.xp < 1) return;
  if (/spend 3 coins to level up/i.test(text) && state.coins < 3) return;
  if (hasActivationCost) {
    const ok = await confirmCost(card);
    G.cur = seat;
    if (!ok) return;
  }
  if (card.name === "The Merry Men" && /spend 1 coin to gain 1 XP/i.test(text)) {
    state.coins -= 1;
    gain("xp", 1);
  } else if (/spend 1 XP to gain 3 coins/i.test(text)) {
    state.xp -= 1;
    gain("coins", 3);
  } else if (/spend 3 coins to level up/i.test(text)) {
    state.coins -= 3;
    state.freeUpgrades += 1;
  } else {
    if (/gain 2 XP/i.test(text)) gain("xp", 2);
    else if (/gain 1 XP\b/i.test(text)) gain("xp", 1);
    if (/gain 1 coin for each Dexterity/i.test(text)) gain("coins", countIcon("Dexterity"));
    if (/gain 1 coin for each Pirate/i.test(text)) gain("coins", Math.min(7, countByName("Pirate") + countAlignment("Bad")));
    if (/gain 1 coin for each Good Character/i.test(text)) gain("coins", Math.min(5, countAlignment("Good")));
    if (/gain 1 XP for each Charm/i.test(text)) gain("xp", Math.min(5, countIcon("Charm")));
    if (/gain 1 XP for each Item/i.test(text)) gain("xp", Math.min(4, state.items.length));
    if (/gain 2 VP/i.test(text)) gain("vp", 2);
    else if (/gain 1 VP and 1 coin/i.test(text)) {
      gain("vp", 1);
      gain("coins", 1);
    } else if (/gain 1 VP\b/i.test(text)) gain("vp", 1);
    if (/Tag token/i.test(text)) state.tagTokens += 1;
    if (/Activation: gain 1 coin\./i.test(text)) gain("coins", 1);
  }
  if (state.writer?.name === "Lewis Carroll" && !state.writerRound.activationRewarded) {
    gain("coins", 1);
    state.writerRound.activationRewarded = true;
  }
}

function gain(kind, amount) {
  if (!amount) return;
  if (kind === "coins") state.coins += amount;
  if (kind === "xp") state.xp += amount;
  if (kind === "vp") state.vp += amount;
}

function upgradeCost(card) {
  const match = (card.upgrade || "").match(/Cost (\d+) XP/i);
  const base = match ? Number(match[1]) : 4;
  return Math.max(0, base - (state.writer?.name === "Le Prince de Beaumont" ? 1 : 0));
}

// ---------------------------------------------------------------------------
// Counting and scoring (for the player in G.cur)
// ---------------------------------------------------------------------------
function iconCounts() {
  const counts = Object.fromEntries(ICONS.map((icon) => [icon, state.iconTokens?.[icon] || 0]));
  for (const card of [...(state.tableau || []), ...(state.items || [])]) {
    for (const icon of ICONS) counts[icon] += iconAmount(card, icon);
    if (card.deck === "legendary" && card.upgraded) {
      for (const icon of ICONS) counts[icon] += textIconAmount(upgradeIcons(card), icon);
    }
  }
  return counts;
}

// Icons printed on a card: the "icons" field, or the icon list that opens a Legendary's base text
// (e.g. "Charm 1, Intelligence 1. Game End: ..."). Mentions inside effect text do not count.
function printedIcons(card) {
  const lead = String(card.base || "").match(/^\s*(?:(?:Charm|Strength|Dexterity|Intelligence)(?:\s*\d+)?\s*[,.]?\s*)+/i);
  return `${card.icons || ""} ${lead ? lead[0] : ""}`;
}

function iconAmount(card, icon) {
  return textIconAmount(printedIcons(card), icon);
}

// Icons gained by an upgrade: only the "Gains X and Y." sentence counts.
function upgradeIcons(card) {
  const gains = String(card.upgrade || "").match(/Gains ([^.]*)\./i);
  return gains ? gains[1] : "";
}

function totalIcons(card) {
  return ICONS.reduce((sum, icon) => sum + iconAmount(card, icon), 0);
}

function textIconAmount(text, icon) {
  const regex = new RegExp(`${icon}\\s*(\\d+)?`, "gi");
  let total = 0;
  let match;
  while ((match = regex.exec(text || ""))) total += Number(match[1] || 1);
  return total;
}

function countIcon(icon) {
  return iconCounts()[icon] || 0;
}

function countAlignment(alignment) {
  return (state.tableau || []).filter((card) => card.alignment === alignment).length;
}

function countByName(name) {
  return (state.tableau || []).filter((card) => card.name.includes(name)).length;
}

function countCardsWith(pattern) {
  const regex = new RegExp(pattern, "i");
  return [...(state.tableau || []), ...(state.items || [])].filter((card) => regex.test(`${card.effect || ""} ${card.base || ""} ${card.upgrade || ""}`)).length;
}

function scoreQuest(quest) {
  const icons = iconCounts();
  const completeSets = Math.min(...ICONS.map((icon) => icons[icon]));
  const upgraded = state.tableau.filter((card) => card.deck === "legendary" && card.upgraded).length;
  const name = quest.name;
  if (/Midnight Ball/.test(name)) return Math.min(14, icons.Charm * 2);
  if (/Hook/.test(name)) return Math.min(14, icons.Strength * 2);
  if (/Rabbit Hole/.test(name)) return Math.min(14, icons.Dexterity * 2);
  if (/Lost Voice/.test(name)) return Math.min(14, icons.Intelligence * 2);
  if (/Glass Slipper/.test(name)) return Math.min(15, completeSets * 5);
  if (/Neverland/.test(name)) return Math.min(...ICONS.map((i) => icons[i])) >= 3 ? 12 : Math.min(...ICONS.map((i) => icons[i])) >= 2 ? 8 : 0;
  if (/Apple's Bite/.test(name)) return Math.min(14, countAlignment("Bad") * 2);
  if (/Forest Awakening/.test(name)) return Math.min(12, countAlignment("Good"));
  if (/Queen's Command/.test(name)) return Math.min(15, countAlignment("Neutral") * 3);
  if (/House of Seven/.test(name)) return Math.min(12, state.tableau.length);
  if (/King's Trident/.test(name)) return Math.min(14, state.items.length * 2);
  if (/Hatter's Tea Party/.test(name)) return Math.min(15, countCardsWith("Ongoing") * 3);
  if (/Second Star/.test(name)) return Math.min(14, countCardsWith("Activation") * 2);
  if (/Pact with the Beast/.test(name)) return Math.min(15, upgraded * 5);
  if (/Enchanted Rose/.test(name)) return Math.min(15, countCardsWith("less XP|free|place XP on a Character") * 3);
  if (/Rob the Rich/.test(name)) return Math.min(12, Math.floor(state.coins / 2));
  if (/Rubbed Lamp/.test(name)) return Math.min(12, Math.floor(xpRemaining() / 2));
  if (/Arrow on Target/.test(name)) return Math.min(15, countCardsWith("VP|Game End") * 3);
  if (/Final Wish/.test(name)) return Math.min(15, Math.max(0, state.quests.length - 1) * 5);
  if (/Once Upon a Time/.test(name)) {
    const categories = [countAlignment("Good"), countAlignment("Bad"), state.tableau.length, state.items.length, countCardsWith("Activation")].filter((value) => value >= 3).length;
    return Math.min(15, categories * 3);
  }
  return 0;
}

// Game End effects printed on characters and items.
function scoreCards() {
  let total = 0;
  const icons = iconCounts();
  const sets = Math.min(...ICONS.map((icon) => icons[icon]));
  const goodBadPairs = Math.min(countAlignment("Good"), countAlignment("Bad"));
  const upgradedLeg = state.tableau.filter((card) => card.deck === "legendary" && card.upgraded).length;
  const plainLeg = state.tableau.filter((card) => card.deck === "legendary" && !card.upgraded).length;
  const quests = state.quests.length;
  for (const card of [...state.tableau, ...state.items]) {
    const text = card.deck === "legendary" ? (card.upgraded ? card.upgrade : card.base) : card.effect;
    if (!/Game End/i.test(text || "")) continue;
    const n = card.name;
    const up = Boolean(card.upgraded);
    if (n === "The Dwarves House") total += countByName("Dwarf");
    else if (n === "Hot Air Balloon") total += Math.min(8, (card.tucked || 0) * 2);
    else if (n === "The Crown of England") total += sets * 3;
    else if (n === "Glass Slipper") total += Math.min(10, quests * 2);
    else if (n === "Enchanted Rose") total += Math.min(12, upgradedLeg * 2);
    else if (n === "Undersea Throne") total += Math.min(8, state.items.length);
    else if (n === "Alice") total += up ? Math.min(12, quests * 2) : quests;
    else if (n === "Grandmother") total += Math.min(8, countAlignment("Bad") * 2);
    else if (n === "Stepmother") total += up ? Math.min(10, plainLeg * 2) : Math.min(6, plainLeg);
    else if (n === "Prince Charming") total += Math.min(8, icons.Charm);
    else if (n === "Evil Sorcerer") total += sets * 3;
    else if (n === "The Evil Queen") total += up ? Math.min(14, icons.Charm * 2) : Math.min(10, maxCharmAtTable());
    else if (n === "Snow White") total += up ? Math.min(14, icons.Charm * 2) : Math.floor(icons.Charm / 2);
    else if (n === "Dorothy Gale") total += Math.min(16, sets * 4);
    else if (n === "Peter Pan") total += Math.min(14, (countByName("Pirate") + countByName("Lost Boys") + countByName("Tinker Bell")) * 2);
    else if (n === "Captain Hook") total += up ? Math.min(14, icons.Dexterity * 2) : Math.floor(icons.Dexterity / 2);
    else if (n === "Little Red Riding Hood") total += Math.min(15, goodBadPairs * 3);
    else if (n === "Little Mermaid") total += Math.min(14, quests * 2);
    else if (n === "Robin Hood") total += Math.floor(icons.Intelligence / 2);
    else if (n === "Prince John") total += Math.min(12, Math.floor(state.coins / 2));
    else if (n === "Cinderella") total += Math.min(14, state.items.length * 2);
    else if (n === "Rumpelstiltskin") total += up ? Math.min(14, countAlignment("Bad") * 2) : Math.min(8, countAlignment("Bad"));
    else if (n === "Belle") total += Math.min(14, upgradedLeg * 2);
    else if (n === "Beast") total += up ? Math.min(14, icons.Strength * 2) : Math.floor(icons.Strength / 2);
  }
  return total;
}

function maxCharmAtTable() {
  return Math.max(...G.players.map((p) => withSeat(p.seat, () => iconCounts().Charm)));
}

function finalScore() {
  const questScores = state.quests.map((quest) => ({ quest, points: scoreQuest(quest) }));
  const questTotal = questScores.reduce((sum, entry) => sum + entry.points, 0);
  const writerTotal = scoreWriter();
  const cardTotal = scoreCards();
  return { base: state.vp, questScores, questTotal, writerTotal, cardTotal, total: state.vp + questTotal + writerTotal + cardTotal };
}

function scoreWriter() {
  if (!state.writer || state.writerLevel < 3) return 0;
  const name = state.writer.name;
  if (name === "Charles Perrault") return Math.min(14, state.items.length * 2);
  if (name === "Brothers Grimm") return Math.min(15, Math.min(countAlignment("Good"), countAlignment("Bad")) * 3);
  if (name === "Hans Christian Andersen") return Math.min(14, countCardsWith("Game End") * 2);
  if (name === "Carlo Collodi") return Math.min(14, Math.floor(state.coins / 2) + Math.floor(xpRemaining() / 2));
  if (name === "Lewis Carroll") return Math.min(14, countCardsWith("Activation") * 2);
  if (name === "J. M. Barrie") return Math.min(14, countIcon("Dexterity") * 2);
  if (name === "L. Frank Baum") return Math.min(15, Math.min(...ICONS.map(countIcon)) * 5);
  if (name === "Le Prince de Beaumont") return Math.min(16, state.tableau.filter((card) => card.deck === "legendary" && card.upgraded).length * 4);
  return 0;
}

function roundsTotal() {
  return G.settings.rounds || 8;
}

function liveScore(seat) {
  return withSeat(seat, () => finalScore().total);
}

// ---------------------------------------------------------------------------
// Dispatch: every move goes through one queue, so moves never interleave.
// ---------------------------------------------------------------------------
const MOVES = {
  playAction,
  takeGroup,
  buyItem,
  resolve: activateActionStep,
  endTurn,
  takeQuest,
  upgrade: upgradeLegendary,
  placeXp,
  activatePick,
  writerDraft: resolveWriterDraft,
  writerDiscard: discardForWriter,
  writerDiscardDone: finishWriterDiscard,
  chooseWriter,
  tuck: tuckAction,
};

let queue = Promise.resolve();
function dispatch(seat, type, payload) {
  queue = queue.then(async () => {
    const fn = MOVES[type];
    const p = G.players[seat];
    if (!fn || !p || G.gameOver) return;
    G.cur = seat;
    try {
      await fn(payload);
    } catch (error) {
      console.error(error);
    }
    G.cur = view.seat;
    afterChange();
  });
  return queue;
}

// The computer plays its turn through the same queue as everyone else.
function runBot(seat) {
  if (view.role === "guest") return;
  queue = queue.then(async () => {
    const p = G.players[seat];
    if (!p || p.kind !== "bot" || G.active !== seat || G.gameOver) return;
    G.cur = seat;
    try {
      await Bot.playTurn();
    } catch (error) {
      console.error(error);
    }
    G.cur = view.seat;
    afterChange();
  });
}

// Called by the view: a guest sends the move to the host, everyone else applies it.
function act(type, payload) {
  if (view.role === "guest") {
    window.Online?.sendMove(type, payload);
    return;
  }
  dispatch(view.seat, type, payload);
}

function afterChange() {
  if (simMode) return;
  if (G.gameOver && !G.scoreShown) {
    G.scoreShown = true;
    setTimeout(showScore, 50);
  }
  render();
  if (view.role === "host") window.Online?.publish(G);
}

// The host or a guest receives a new snapshot of the table.
function loadSnapshot(snapshot, seat) {
  G = snapshot;
  G.cur = seat;
  view.seat = seat;
  if (G.gameOver && !G.scoreShownLocal) {
    G.scoreShownLocal = true;
    setTimeout(showScore, 50);
  }
  render();
}

// Hand a disconnected player's seat to the computer (host only).
function seatToBot(seat) {
  const p = G.players[seat];
  if (!p || view.role === "guest") return;
  p.kind = "bot";
  p.name = `${p.name} 🤖`;
  if (p.phase === "chooseWriter") {
    p.writer = shuffle(DATA.writers)[0];
    p.phase = "chooseAction";
  }
  maybeBotsChoose();
  if (G.active === seat) Bot.queueTurn(seat);
  afterChange();
}

// ---------------------------------------------------------------------------
// Rendering (from the point of view of view.seat)
// ---------------------------------------------------------------------------
function render() {
  if (!G.started) return;
  G.cur = view.seat;
  renderStats();
  renderPlayers();
  renderActions();
  renderWriter();
  renderDisplays();
  renderGroups();
  renderTableau();
  renderRound();
  renderLog();
  renderGuide();
  window.Home?.afterRender(state);
}

// ---------------------------------------------------------------------------
// Guide: tells the local player what to click, and highlights it.
// ---------------------------------------------------------------------------
function markXpTargets() {
  if (!(state.xp > 0) || G.gameOver) return [];
  const marked = [];
  const writerSteps = el.writerPanel.querySelectorAll(".xp-step");
  if (state.writer && state.writerLevel < 3) {
    const box = writerSteps[state.writerLevel - 1]?.querySelector(".xp-box:not(.on)");
    if (box) {
      box.classList.add("xp-target");
      box.dataset.placeXp = "writer";
      marked.push(box);
    }
  }
  for (const wrap of el.tableau.querySelectorAll("[data-own-id]")) {
    const card = state.tableau.find((entry) => entry.id === wrap.dataset.ownId && entry.deck === "legendary" && !entry.upgraded);
    if (!card) continue;
    const box = wrap.querySelector(".xp-step .xp-box:not(.on)");
    if (box) {
      box.classList.add("xp-target");
      box.dataset.placeXp = card.id;
      marked.push(box);
    }
  }
  for (const box of marked) box.addEventListener("click", () => act("placeXp", box.dataset.placeXp));
  return marked;
}

function renderGuide() {
  document.querySelectorAll(".needs-click").forEach((node) => node.classList.remove("needs-click"));
  document.querySelectorAll(".hint-bubble").forEach((node) => node.remove());
  const guide = document.querySelector("#guide");
  if (guide) guide.hidden = true;
  const me = G.players[view.seat];
  if (G.gameOver || !me) return;
  const mark = (selector) => document.querySelectorAll(selector).forEach((node) => node.classList.add("needs-click"));
  // A speech bubble right next to the thing to click.
  const bubble = (anchor, text, where = "before") => {
    if (!anchor) return;
    const node = document.createElement("div");
    node.className = `hint-bubble hb-${where}`;
    node.innerHTML = text;
    if (where === "inside") anchor.prepend(node);
    else anchor.insertAdjacentElement(where === "after" ? "afterend" : "beforebegin", node);
  };
  const myTurn = G.active === view.seat;
  if (state.tuckPending > 0) {
    bubble(el.actionHand.querySelector(".action-card"), t("g_tuck"));
    mark("#actionHand .action-card");
  } else if (state.phase === "chooseAction") {
    bubble(el.actionHand.querySelector(".action-card"), t("g_chooseAction"));
    mark("#actionHand .action-card:not(:disabled)");
  }
  if (myTurn && state.phase === "chooseGroup") {
    bubble(el.groups, t("g_chooseGroup"));
    mark("#groups [data-group]:not(:disabled)");
  }
  if (state.writer?.name === "Charles Perrault" && state.writerItemDiscount > 0) {
    bubble(el.itemDisplay, t("g_perrault"));
    mark("#itemDisplay [data-item]:not(:disabled)");
  } else if (myTurn && state.phase === "buyItem") {
    bubble(el.itemDisplay, t("g_buyItem"));
    bubble(el.resolveActionBtn.closest(".tableau-head"), t("g_resolve"), "after");
    mark("#itemDisplay [data-item]:not(:disabled)");
    mark("#resolveActionBtn");
  }
  if (state.activatePending > 0) {
    bubble(el.tableau, t("g_activate"));
    const ids = activationCandidates().map((card) => card.id);
    for (const wrap of el.tableau.querySelectorAll("[data-own-id]")) {
      if (!ids.includes(wrap.dataset.ownId)) continue;
      wrap.classList.add("needs-click", "pick-activate");
      wrap.addEventListener("click", (event) => {
        if (event.target.closest("button, summary")) return;
        act("activatePick", wrap.dataset.ownId);
      });
    }
  }
  if (state.questChoices > 0) {
    bubble(el.questDisplay, t("g_quest"));
    mark("#questDisplay [data-quest]");
  }
  if ((state.writerDraftChoices || []).length) {
    bubble(el.writerPanel, t("g_draft"));
    mark("[data-writer-choice]");
  }
  if (state.writerDiscardRemaining > 0) {
    bubble(el.tableau, t("g_discard"));
    mark("[data-writer-discard], [data-finish-writer-discard]");
  }
  if (state.freeUpgrades > 0 && state.tableau.some((card) => card.deck === "legendary" && !card.upgraded)) {
    bubble(el.tableau, t("g_free", { n: state.freeUpgrades }));
    mark("[data-upgrade]");
  }
  if (markXpTargets().length) bubble(el.writerPanel, t("g_xp", { n: state.xp, xp: resourceIcon("xp", "XP") }));
  if (myTurn && state.phase === "roundDone" && !state.questChoices && !state.tuckPending && !state.activatePending) {
    bubble(el.endRoundBtn.closest(".tableau-head"), t("g_endTurn"), "after");
    mark("#endRoundBtn");
  }
}

function phaseMessage() {
  if (G.gameOver) return t("ph_gameOver");
  if (state.tuckPending > 0) return t("ph_tuck");
  if (G.round === G.settings.rounds && state.phase === "chooseAction") return `${t("lastRoundTag")} ${t("ph_chooseAction")}`;
  if (state.writer?.name === "Charles Perrault" && state.writerItemDiscount > 0) return t("ph_perrault");
  if (state.questChoices > 0) return t("ph_quest", { n: state.questChoices });
  const active = G.active !== null ? G.players[G.active] : null;
  switch (state.phase) {
    case "chooseWriter": return t("ph_chooseWriter");
    case "chooseAction": return t("ph_chooseAction");
    case "waitAction": return t("ph_waitAction");
    case "waitTurn": return active ? t("ph_waitTurn", { p: active.name }) : t("ph_waitAction");
    case "chooseGroup": return t("ph_chooseGroup");
    case "buyItem": return t("ph_buyItem");
    case "resolving": return t("ph_buyItem");
    case "roundDone": return t("ph_roundDone");
    case "waitRound": return active ? t("ph_waitTurn", { p: active.name }) : t("ph_waitAction");
    default: return "";
  }
}

function renderStats() {
  const icons = iconCounts();
  el.stats.innerHTML = "";
  el.phaseText.textContent = phaseMessage();
  const cell = ([label, value, cls = ""]) => `<div class="summary-cell ${cls}"><span class="label">${label}</span><strong>${value}</strong></div>`;
  const neutral = countAlignment("Neutral");
  el.tableauSummary.innerHTML = `
    <div class="summary-group sg-main">${[
      [t("round"), `${G.round}/${roundsTotal()}`, "round-cell"],
      [resourceIcon("coins", t("coinsWord")), state.coins],
      [resourceIcon("xp", "XP"), state.xp],
      [resourceIcon("vp", t("vpWord")), liveScore(view.seat), "vp-cell"],
      [t("quest"), state.quests.length],
      ...(state.freeUpgrades > 0 ? [[t("freeUp"), state.freeUpgrades, "free-cell"]] : []),
    ].map(cell).join("")}</div>
    <div class="summary-group sg-tags" title="${escapeHtml(t("tags"))}">${ICONS.map((icon) => cell([squareTag(icon), icons[icon], "tag-cell"])).join("")}</div>
    <div class="summary-group sg-align">${[
      [resourceIcon("Good", t("good")), countAlignment("Good")],
      [resourceIcon("Bad", t("bad")), countAlignment("Bad")],
      ...(neutral ? [[`<span class="neutral-dot" title="${escapeHtml(t("neutral"))}">◐</span>`, neutral]] : []),
    ].map(cell).join("")}</div>
    <div class="summary-group">${[[t("items"), state.items.length], [t("upgrade"), state.tableau.filter((card) => card.upgraded).length]].map(cell).join("")}</div>`;
}

// When the row of groups leaves room on the right (2-3 players), Quests and Items move up beside it.
function fitOfferRow() {
  const layout = document.querySelector(".layout");
  if (!layout) return;
  layout.classList.remove("offer-narrow");
  layout.style.removeProperty("--offer-zoom");
  if (!window.matchMedia("(min-width: 1201px)").matches || !el.groups.lastElementChild) return;
  const start = el.groups.getBoundingClientRect().left;
  const need = el.groups.lastElementChild.getBoundingClientRect().right - start;
  const right = layout.querySelector(".right-col");
  const room = layout.clientWidth - (right ? right.getBoundingClientRect().width : 340) - 14 - 30;
  const ratio = room / need;
  if (ratio >= 0.82) {
    layout.classList.add("offer-narrow");
    if (ratio < 1) layout.style.setProperty("--offer-zoom", (0.56 * ratio).toFixed(3));
  }
}
window.addEventListener("resize", () => {
  if (G.started) fitOfferRow();
});

// Player colour = colour of their Writer.
function playerColor(p) {
  return p?.writer ? CardFace.writerColor(p.writer.name) : "#9a8a70";
}

// The four skill tags are square, like on the cards.
function squareTag(icon) {
  return `<span class="skill-tag mini-tag sk-${icon.toLowerCase()}" title="${escapeHtml(ICON_LABELS[icon] || icon)}">${resourceIcon(icon === "Dexterity" ? "DexteritySq" : icon, ICON_LABELS[icon] || icon)}</span>`;
}

function playerStatus(p) {
  if (G.gameOver) return "";
  if (G.active === p.seat) return t("ps_turn");
  if (p.phase === "chooseAction" || p.phase === "chooseWriter") return t("ps_choosing");
  if (p.phase === "waitAction") return t("ps_ready");
  return "";
}

function renderPlayers() {
  const revealed = G.order.length || G.active !== null || G.players.every((p) => p.phase !== "chooseAction" && p.phase !== "waitAction");
  el.playersPanel.innerHTML = G.players
    .map((p) => {
      const score = liveScore(p.seat);
      const icons = withSeat(p.seat, iconCounts);
      const me = p.seat === view.seat;
      const played = p.currentAction && (revealed || me) ? `<span class="pp-card" title="${escapeHtml(t("chapter"))}">${p.currentAction.number}</span>` : "";
      const canHandOver = view.role === "host" && !me && p.kind === "human" && !G.gameOver;
      return `<button type="button" class="pp ${me ? "me" : ""} ${G.active === p.seat ? "active" : ""}" data-player="${p.seat}" style="--pcol:${playerColor(p)}">
        <span class="pp-top"><b>${escapeHtml(p.name)}${p.kind === "bot" ? ` <small>${escapeHtml(t("computer"))}</small>` : ""}</b>${played}</span>
        <span class="pp-writer">${p.writer ? escapeHtml(tc(p.writer.name)) + ` · ${t("lvN", { n: p.writerLevel })}` : "…"} · <span class="pp-deck" title="${escapeHtml(t("deckLeft"))}">${p.actionDeck.length}</span></span>
        <span class="pp-res">${resourceIcon("coins", "coins")}${p.coins} ${resourceIcon("xp", "XP")}${p.xp} ${resourceIcon("vp", "VP")}${score}</span>
        <span class="pp-icons">${ICONS.map((i) => `<span class="pp-tag">${squareTag(i)}${icons[i]}</span>`).join("")}</span>
        <span class="pp-align">${withSeat(p.seat, () => `${resourceIcon("Good", t("good"))}${countAlignment("Good")} ${resourceIcon("Bad", t("bad"))}${countAlignment("Bad")}`)}</span>
        <span class="pp-status">${escapeHtml(playerStatus(p))}${canHandOver ? ` <span class="pp-bot" data-to-bot="${p.seat}">${escapeHtml(t("toBot"))}</span>` : ""}</span>
      </button>`;
    })
    .join("");
  for (const btn of el.playersPanel.querySelectorAll("[data-player]")) {
    btn.addEventListener("click", (event) => {
      const toBot = event.target.closest("[data-to-bot]");
      if (toBot) {
        seatToBot(Number(toBot.dataset.toBot));
        return;
      }
      showPlayerTableau(Number(btn.dataset.player));
    });
  }
}

function showPlayerTableau(seat) {
  const p = G.players[seat];
  if (!p) return;
  const box = document.createElement("div");
  box.className = "confirm-overlay";
  const cards = [...p.tableau.map((card) => CardFace.character(card, card.deck === "legendary" ? { cost: withSeat(seat, () => upgradeCost(card)) } : {})), ...p.items.map((card) => CardFace.item(card)), ...p.quests.map((card) => CardFace.quest(card))];
  box.innerHTML = `<div class="tableau-box" role="dialog" aria-modal="true"><div class="deck-catalog-header"><h2>${escapeHtml(p.name)} · ${p.writer ? escapeHtml(tc(p.writer.name)) : ""}</h2><button type="button" class="primary" data-close>← ${escapeHtml(t("back"))}</button></div><div class="deck-catalog-cards">${cards.join("") || `<p>${escapeHtml(t("emptyTableau"))}</p>`}</div></div>`;
  box.addEventListener("click", (event) => {
    if (event.target === box || event.target.closest("[data-close]")) box.remove();
  });
  document.body.appendChild(box);
}

function renderActions() {
  const hand = [...state.hand].sort((a, b) => a.number - b.number);
  const tucking = state.tuckPending > 0;
  const deck = state.actionDeck.length;
  const deckInfo = `<div class="action-deck ${deck === 0 ? "empty" : ""}" title="${escapeHtml(t("deckHint"))}">
      <span class="deck-stack">${Array.from({ length: Math.min(deck, 9) }, (_, i) => `<i style="--i:${i}"></i>`).join("")}</span>
      <span><b>${deck}</b> ${escapeHtml(t("deckLeft"))}<br><small>${escapeHtml(t("roundOf", { n: G.round, total: roundsTotal() }))}</small></span>
    </div>`;
  el.actionHand.style.setProperty("--spine", playerColor(G.players[view.seat]));
  document.querySelector(".board")?.style.setProperty("--pcol", playerColor(G.players[view.seat]));
  el.actionHand.innerHTML = deckInfo + hand
    .map(
      (action) => `
        <button class="action-card ${tucking ? "tucking" : ""}" type="button" ${state.phase !== "chooseAction" && !tucking ? "disabled" : ""} data-action="${action.number}" aria-label="${escapeHtml(t("chapter"))} ${action.number}">
          ${CardFace.action(action)}
          ${tucking ? `<span class="tuck-label">${escapeHtml(t("tuckBtn"))}</span>` : ""}
        </button>
      `,
    )
    .join("");
  for (const button of el.actionHand.querySelectorAll("[data-action]")) {
    button.addEventListener("click", () => act(tucking ? "tuck" : "playAction", Number(button.dataset.action)));
  }
}

function renderDisplays() {
  el.questDisplay.innerHTML = G.questDisplay.map(renderQuest).join("");
  for (const button of el.questDisplay.querySelectorAll("[data-quest]")) {
    button.addEventListener("click", () => act("takeQuest", button.dataset.quest));
  }
  el.itemDisplay.innerHTML = G.itemDisplay.map(renderItem).join("");
  for (const button of el.itemDisplay.querySelectorAll("[data-item]")) {
    button.addEventListener("click", () => act("buyItem", button.dataset.item));
  }
}

function renderQuest(quest) {
  return `
    <div class="slot slot-quest ${state.questChoices > 0 ? "can-pick" : ""}">
      ${CardFace.quest(quest)}
      ${state.questChoices > 0 ? `<button type="button" class="primary" data-quest="${quest.id}">${t("takeQuest")}</button>` : ""}
    </div>
  `;
}

function renderItem(item) {
  const { price, discount } = itemPrice(item);
  const perraultPurchase = state.writer?.name === "Charles Perrault" && state.writerItemDiscount > 0;
  const canBuy = perraultPurchase || (state.phase === "buyItem" && !state.writerRound.itemBought);
  return `
    <div class="slot slot-item">
      ${CardFace.item(item, { price, original: discount ? item.cost : null })}
      <button type="button" class="${canBuy && state.coins >= price ? "primary" : ""}" ${!canBuy || state.coins < price ? "disabled" : ""} data-item="${item.id}">${t("buyFor", { n: `${price} ${resourceIcon("coins", "coins")}` })}</button>
    </div>
  `;
}

function renderGroups() {
  const myTurn = state.phase === "chooseGroup" && G.active === view.seat;
  el.groups.innerHTML = G.groups
    .map((group) => {
      const mine = group.taken && group.takenSeat === view.seat;
      const taker = group.taken ? G.players[group.takenSeat] : null;
      const label = group.taken ? ` <span class="taken-chip" style="--pcol:${playerColor(taker)}">${mine ? t("yours") : t("takenBy", { who: escapeHtml(group.takenBy || "?") })}</span>` : "";
      return `
        <div class="group ${group.taken && !mine ? "removed" : ""} ${mine ? "taken" : ""} ${group.taken ? "is-taken" : ""}" style="--pcol:${group.taken ? playerColor(G.players[group.takenSeat]) : "transparent"}">
          <h3>${t("group", { n: group.id.slice(1) })}${label}</h3>
          <div class="group-cards">${group.cards.map(renderCard).join("")}</div>
          <button type="button" class="${myTurn && !group.taken ? "primary" : ""}" ${!myTurn || group.taken ? "disabled" : ""} data-group="${group.id}">${t("takeGroup")}</button>
        </div>
      `;
    })
    .join("");
  for (const button of el.groups.querySelectorAll("[data-group]")) {
    button.addEventListener("click", () => act("takeGroup", button.dataset.group));
  }
  fitOfferRow();
}

function renderTableau() {
  const cards = [
    ...state.tableau.map((card) => ({ ...card, zone: "Tableau" })),
    ...state.items.map((card) => ({ ...card, zone: "Item" })),
    ...state.quests.map((card) => ({ ...card, zone: "Quest" })),
  ];
  const sections = [
    { title: t("sec_act"), test: (card) => /Activation:/i.test(activeCardText(card)) },
    { title: t("sec_ong"), test: (card) => /Ongoing:/i.test(activeCardText(card)) },
    { title: t("sec_inst"), test: (card) => /Instant:/i.test(activeCardText(card)) && !/Game End:/i.test(activeCardText(card)) },
    { title: t("sec_other"), test: () => true },
  ];
  const remaining = [...cards];
  el.tableau.innerHTML = sections
    .map((section) => {
      const selected = remaining.filter(section.test);
      for (const card of selected) remaining.splice(remaining.indexOf(card), 1);
      if (!selected.length) return "";
      return `<section class="tableau-section"><h3>${section.title} <span>${selected.length}</span></h3><div class="tableau-section-cards">${selected.map((card) => (section.title === t("sec_inst") ? renderCompactOwnedCard(card) : renderOwnedCard(card))).join("")}</div></section>`;
    })
    .join("");
}

function activeCardText(card) {
  return `${card.effect || ""} ${card.base || ""} ${card.upgraded ? card.upgrade || "" : ""}`;
}

function canUpgradeCard(card) {
  return card.deck === "legendary" && !card.upgraded && !G.gameOver && state.freeUpgrades > 0;
}

// Star spaces: filled ones show the XP already placed.
function xpPips(filled, total) {
  return `<span class="xp-pips" title="${filled}/${total}">${Array.from({ length: total }, (_, i) => `<i class="${i < filled ? "on" : ""}">${resourceIcon("xp", "XP")}</i>`).join("")}</span>`;
}

function legendaryXpControls(card) {
  if (card.deck !== "legendary" || card.upgraded || G.gameOver) return "";
  return `<div class="xp-place">
    <button type="button" ${state.xp > 0 ? "" : "disabled"} data-place-xp="${card.id}">${t("placeXp", { xp: resourceIcon("xp", "XP") })}</button>
    ${state.freeUpgrades > 0 ? `<button type="button" data-upgrade="${card.id}">${t("freeUpBtn")}</button>` : ""}</div>`;
}

function renderCompactOwnedCard(card) {
  return `<div data-own-id="${card.id}" class="compact-owned ${card.deck === "legendary" ? "legendary-card" : card.deck === "common" ? "common-card" : ""}">
    <div class="owned-head"><span class="owned-thumb">${CardArt.art(card.name)}</span><div><strong>${escapeHtml(tc(card.name))}${card.upgraded ? " ✦" : ""}</strong>${renderTags(card)}</div></div>
    ${card.deck === "legendary" ? `<details><summary>${t("effectsUpgrade")}</summary>${renderLegendaryEffects(card)}</details>${legendaryXpControls(card)}` : ""}
    ${state.writerDiscardRemaining > 0 && (card.zone === "Tableau" || card.zone === "Item") ? `<button type="button" data-writer-discard="${card.id}">${t("discardBtn", { coin: resourceIcon("coins", "coins"), xp: resourceIcon("xp", "XP") })}</button>` : ""}
  </div>`;
}

function renderOwnedCard(card) {
  if (card.zone === "Quest") return CardFace.quest(card, { cls: "fc-small" });
  return `
    <div data-own-id="${card.id}" class="card owned ${card.deck === "legendary" ? "legendary-card" : card.deck === "common" ? "common-card" : "item-card"}">
      <div class="owned-head"><span class="owned-thumb">${CardArt.art(card.name)}</span><div><div class="card-title">${escapeHtml(tc(card.name))}${card.upgraded ? " ✦" : ""}</div>${renderTags(card)}</div></div>
      ${card.deck === "legendary" ? renderLegendaryEffects(card) : `<div class="effect">${formatGameText(tc(card.effect))}</div>`}
      ${legendaryXpControls(card)}
      ${state.writerDiscardRemaining > 0 && (card.zone === "Tableau" || card.zone === "Item") ? `<button type="button" data-writer-discard="${card.id}">${t("discardBtn", { coin: resourceIcon("coins", "coins"), xp: resourceIcon("xp", "XP") })}</button>` : ""}
    </div>
  `;
}

function renderCard(card) {
  return CardFace.character(card, card.deck === "legendary" ? { cost: upgradeCost(card) } : {});
}

function renderLegendaryEffects(card) {
  const upgradeText = String(card.upgrade || "").replace(/^Cost\s+\d+\s+XP\.\s*/i, "");
  const cost = upgradeCost(card);
  return `
    <div class="legendary-effects">
      <div class="legendary-effect-block"><div class="effect">${formatGameText(tc(card.base))}</div></div>
      ${CardFace.xpStep(cost, card.upgraded ? cost : card.xpOn || 0)}
      <div class="legendary-effect-block upgrade-effect ${card.upgraded ? "unlocked" : ""}">
        <div class="legendary-upgrade-ability ${card.upgraded ? "" : "locked"}"><div class="effect">${formatGameText(tc(upgradeText))}</div></div>
      </div>
    </div>
  `;
}

function renderTags(card) {
  const tags = [];
  for (const icon of ICONS) {
    const count = iconAmount(card, icon);
    for (let i = 0; i < count; i += 1) tags.push(`<span class="skill-tag sk-${icon.toLowerCase()}">${resourceIcon(icon === "Dexterity" ? "DexteritySq" : icon, ICON_LABELS[icon])}</span>`);
  }
  if (card.alignment === "Good" || card.alignment === "Bad") {
    tags.push(`<span class="tag icon-tag alignment-icon">${resourceIcon(card.alignment, t(card.alignment.toLowerCase()))}</span>`);
  } else if (card.alignment) {
    tags.push(`<span class="tag ${card.alignment.toLowerCase()}">${t(card.alignment.toLowerCase())}</span>`);
  }
  return `<div class="tag-row">${tags.join("")}</div>`;
}

function renderRound() {
  el.playerAction.textContent = state.currentAction ? state.currentAction.number : "-";
  const active = G.active !== null ? G.players[G.active] : null;
  el.botAction.textContent = active ? active.name : "-";
  const labels = {
    chooseWriter: "st_chooseWriter",
    chooseAction: "st_chooseAction",
    waitAction: "st_waitAction",
    waitTurn: "st_waitTurn",
    chooseGroup: "st_chooseGroup",
    buyItem: "st_buyItem",
    resolving: "st_buyItem",
    roundDone: "st_roundDone",
    waitRound: "st_waitTurn",
    gameOver: "st_gameOver",
  };
  el.roundState.textContent = t(labels[state.phase] || "st_waitTurn");
  el.endRoundBtn.disabled = state.phase !== "roundDone" || state.questChoices > 0 || state.tuckPending > 0 || state.activatePending > 0;
  el.endRoundBtn.classList.toggle("primary", state.phase === "roundDone" && !state.questChoices && !state.tuckPending);
  el.resolveActionBtn.disabled = state.phase !== "buyItem";
  el.resolveActionBtn.classList.toggle("hidden", state.phase !== "buyItem");
  for (const button of el.tableau.querySelectorAll("[data-upgrade]")) {
    button.addEventListener("click", () => act("upgrade", button.dataset.upgrade));
  }
  for (const button of el.tableau.querySelectorAll("[data-place-xp]")) {
    button.addEventListener("click", () => act("placeXp", button.dataset.placeXp));
  }
  for (const button of el.tableau.querySelectorAll("[data-writer-discard]")) {
    button.addEventListener("click", () => act("writerDiscard", button.dataset.writerDiscard));
  }
}

function renderLog() {
  el.log.innerHTML = G.log.map((entry) => `<p>${renderLogEntry(entry)}</p>`).join("");
}

// End of game: a bubble that sums up the Victory Points of the viewer, with the ranking.
function showScore() {
  if (!G.started || !G.gameOver) return;
  G.cur = view.seat;
  const score = finalScore();
  if (!G.recorded?.[view.seat]) {
    G.recorded = { ...(G.recorded || {}), [view.seat]: true };
    const rank = (G.results || []).findIndex((r) => r.seat === view.seat) + 1;
    window.Home?.recordGame({ score: score.total, rank, writer: state.writer?.name || "-", players: G.players.length, level: G.settings.level, online: view.role !== "solo", quests: state.quests.length, cards: state.tableau.length, items: state.items.length, tutorial: G.settings.tutorial });
  }
  const results = G.results || [];
  const rank = results.findIndex((r) => r.seat === view.seat) + 1;
  document.querySelector(".recap-overlay")?.remove();
  const box = document.createElement("div");
  box.className = "recap-overlay";
  const lines = [
    [t("colDuring"), score.base],
    [t("quests"), score.questTotal],
    [t("colCards"), score.cardTotal],
    [t("writer"), score.writerTotal],
  ];
  box.innerHTML = `<div class="recap" role="dialog" aria-modal="true" aria-label="${escapeHtml(t("finalScore"))}">
    <p class="recap-kicker">${escapeHtml(t("theEnd"))}</p>
    <h2>${rank === 1 ? escapeHtml(t("youWin")) : escapeHtml(t("yourPlace", { n: rank, total: results.length }))}</h2>
    <div class="recap-total">${score.total}${resourceIcon("vp", "VP")}</div>
    <ul class="recap-lines">${lines.map(([label, value]) => `<li><span>${escapeHtml(label)}</span><b>${value}</b></li>`).join("")}</ul>
    ${score.questScores.length ? `<details><summary>${escapeHtml(t("yourQuests"))}</summary><ul class="recap-quests">${score.questScores.map((q) => `<li><span>${escapeHtml(tc(q.quest.name))}</span><b>${q.points}</b></li>`).join("")}</ul></details>` : ""}
    <ol class="recap-rank">${results.map((r) => `<li class="${r.seat === view.seat ? "me" : ""}"><span>${escapeHtml(r.name)}</span><small>${escapeHtml(tc(r.writer))}</small><b>${r.total}</b></li>`).join("")}</ol>
    <div class="recap-actions"><button type="button" data-recap-close>${escapeHtml(t("seeTable"))}</button><button type="button" class="primary" data-recap-home>${escapeHtml(t("home"))}</button></div>
  </div>`;
  box.addEventListener("click", (event) => {
    if (event.target.closest("[data-recap-close]")) box.remove();
    if (event.target.closest("[data-recap-home]")) {
      box.remove();
      window.Home?.show();
    }
  });
  document.body.appendChild(box);
  box.querySelector("[data-recap-home]").focus();
}

function renderWriter() {
  const writers = DATA.writers || [];
  const setupOpen = state.phase === "chooseWriter";
  el.writerSetup.classList.toggle("hidden", !setupOpen);
  el.writerSetupTitle.textContent = t("chooseYourWriter");
  el.writerChoices.className = "writer-choice-grid";
  el.writerChoices.innerHTML = setupOpen ? writers.map((writer) => renderWriterCard(writer, 1, true)).join("") : "";
  for (const button of el.writerChoices.querySelectorAll("[data-writer]")) {
    button.addEventListener("click", () => act("chooseWriter", button.dataset.writer));
  }
  el.writerPanel.innerHTML = state.writer ? renderWriterCard(state.writer, state.writerLevel, false) : "";
  const upgrade = el.writerPanel.querySelector("[data-writer-upgrade]");
  if (upgrade) upgrade.addEventListener("click", () => act("placeXp", "writer"));
  const finishDiscard = el.writerPanel.querySelector("[data-finish-writer-discard]");
  if (finishDiscard) finishDiscard.addEventListener("click", () => act("writerDiscardDone"));
  for (const button of el.writerPanel.querySelectorAll("[data-writer-choice]")) {
    button.addEventListener("click", () => act("writerDraft", button.dataset.writerChoice));
  }
}

const DECK_CATALOG = [
  { key: "actions" },
  { key: "common" },
  { key: "legendary" },
  { key: "quests" },
  { key: "items" },
  { key: "writers" },
];

function openCatalog(key) {
  if (!DECK_CATALOG.some((entry) => entry.key === key)) return;
  el.deckCatalogTitle.textContent = `${t(`deck_${key}`)} (${DATA[key].length})`;
  el.deckCatalogTabs.innerHTML = DECK_CATALOG.map(
    (entry) => `<button type="button" class="${entry.key === key ? "selected" : ""}" data-catalog-tab="${entry.key}" aria-current="${entry.key === key ? "true" : "false"}">${t(`deck_${entry.key}`)}</button>`,
  ).join("");
  el.deckCatalog.dataset.key = key;
  el.deckCatalogCards.className = `deck-catalog-cards catalog-${key}`;
  el.deckCatalogCards.innerHTML = DATA[key]
    .map((card) => {
      if (key === "writers") return renderWriterCard(card, 1, false, true);
      if (key === "actions") return CardFace.action(card);
      if (key === "quests") return CardFace.quest(card);
      if (key === "items") return CardFace.item(card);
      return CardFace.character(card);
    })
    .join("");
  el.deckCatalog.classList.remove("hidden");
  for (const button of el.deckCatalogTabs.querySelectorAll("[data-catalog-tab]")) {
    button.addEventListener("click", () => openCatalog(button.dataset.catalogTab));
  }
  el.closeCatalogBtn.focus();
}

function closeCatalog() {
  el.deckCatalog.classList.add("hidden");
}

function renderWriterCard(writer, level, selectable, preview = false) {
  const own = !selectable && !preview;
  const canPlace = own && level < 3 && state.xp > 0 && !G.gameOver;
  const drafts = own ? state.writerDraftChoices || [] : [];
  const extra = `${drafts.length ? `<div class="writer-draft">${drafts.map((choice) => `<button type="button" data-writer-choice="${choice.id}">${choice.iconChoice ? resourceIcon(choice.iconChoice, choice.name) : escapeHtml(tc(choice.name))}</button>`).join("")}</div>` : ""}
    ${preview ? "" : `<div class="writer-card-actions">
      ${selectable ? `<button type="button" data-writer="${writer.id}">${t("choose")}</button>` : level < 3 && own ? `<button type="button" ${!canPlace ? "disabled" : ""} data-writer-upgrade>${t("placeXp", { xp: resourceIcon("xp", "XP") })}</button>` : ""}
      ${own && state.writerDiscardRemaining > 0 ? `<button type="button" data-finish-writer-discard>${t("finishDiscard")}</button>` : ""}
    </div>`}`;
  return CardFace.writer(writer, { level: own ? level : 0, xpPlaced: own ? state.writerXp || 0 : 0, extra });
}

function effectLabel(type) {
  return { ongoing: "Ongoing", instant: "Instant", activation: "Activation", endgame: "Game End" }[type] || type;
}

function resourceIcon(kind, label) {
  return `<img class="game-icon" src="${ICON_FILES[kind]}" alt="${escapeHtml(label)}" title="${escapeHtml(label)}">`;
}

function formatGameText(text) {
  return (window.tagTokens ? window.tagTokens(text) : String(text || ""))
    .replace(/\bGame End\b/gi, resourceIcon("endgame", "Game End"))
    .replace(/\bOngoing\b/gi, resourceIcon("ongoing", "Ongoing"))
    .replace(/\bInstant\b/gi, resourceIcon("instant", "Instant"))
    .replace(/\bActivation\b/gi, resourceIcon("activation", "Activation"))
    .replace(/\bStrength\b/gi, resourceIcon("Strength", "Strength"))
    .replace(/\b(?:Dexterity|Ruse)\b/gi, resourceIcon("Dexterity", "Dexterity"))
    .replace(/\bIntelligence\b/gi, resourceIcon("Intelligence", "Intelligence"))
    .replace(/\bCharm\b/gi, resourceIcon("Charm", "Charm"))
    .replace(/\bVP\b/g, resourceIcon("vp", "VP"))
    .replace(/\bXP\b/g, resourceIcon("xp", "XP"))
    .replace(/\b(?:Coins?|coins?)\b/g, resourceIcon("coins", "Coins"))
    .replace(/\bGoals?\b/gi, "Quest");
}

el.newGameBtn.addEventListener("click", () => window.Home?.show());
el.resolveActionBtn.addEventListener("click", () => act("resolve"));
el.endRoundBtn.addEventListener("click", () => act("endTurn"));
el.closeCatalogBtn.addEventListener("click", closeCatalog);

// ---------------------------------------------------------------------------
// AI simulations: whole games between computer players, as fast as possible.
// ---------------------------------------------------------------------------
async function simulateGame(opts) {
  simMode = true;
  const n = Math.min(5, Math.max(2, Number(opts.players) || 4));
  try {
    newGame({ players: n, level: opts.level || "hard", rounds: 8, writerMode: "random", tutorial: false }, Array.from({ length: n }, (_, i) => ({ name: `AI ${i + 1}`, kind: "bot" })));
    let guard = 400;
    while (!G.gameOver && guard > 0) {
      guard -= 1;
      if (G.active === null) break;
      G.cur = G.active;
      await Bot.playTurn();
    }
    return {
      rounds: G.round,
      players: G.players.map((p) => {
        const r = G.results.find((x) => x.seat === p.seat);
        return {
          rank: G.results.indexOf(r) + 1,
          total: r.total,
          base: r.base,
          quests: r.questTotal,
          cards: r.cardTotal,
          writerPts: r.writerTotal,
          writer: p.writer?.name || "-",
          legendary: p.tableau.filter((c) => c.deck === "legendary").map((c) => c.name),
          upgraded: p.tableau.filter((c) => c.upgraded).length,
          common: p.tableau.filter((c) => c.deck === "common").map((c) => c.name),
          items: p.items.map((c) => c.name),
          questNames: r.questScores.map((q) => [q.quest.name, q.points]),
          actions: p.actionDiscard.map((c) => c.number),
          writerLevel: p.writerLevel,
          coinsLeft: p.coins,
          xpLeft: p.xp,
          freeLeft: p.freeUpgrades,
          upgradedCount: p.tableau.filter((c) => c.upgraded).length,
          legendaryCount: p.tableau.filter((c) => c.deck === "legendary").length,
          cardCount: p.tableau.length,
          itemCount: p.items.length,
          questCount: p.quests.length,
          seatPos: (p.seat - G.startSeat + G.players.length) % G.players.length,
          curve: G.curve.map((row) => row[p.seat]),
          plays: G.history.map((h) => h.plays.find((x) => x.seat === p.seat)).filter(Boolean),
        };
      }),
    };
  } finally {
    simMode = false;
    G = emptyGame();
  }
}

window.Game = {
  simulateGame,
  newGame,
  get state() {
    return state;
  },
  get G() {
    return G;
  },
  view,
  settings,
  dispatch,
  loadSnapshot,
  showScore,
  finalScore,
  withSeat,
  afterChange,
  seatToBot,
  runBot,
};
window.addEventListener("langchange", () => {
  if (G.started) render();
  if (!el.deckCatalog.classList.contains("hidden") && el.deckCatalog.dataset.key) openCatalog(el.deckCatalog.dataset.key);
  if (document.querySelector(".recap-overlay")) showScore();
});
