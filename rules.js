// Once Upon a Time — illustrated rules (English, French, Italian).
// Illustrations are the real card faces of the game: [[common:Dwarf]], [[action:7]], [[icon:instant]]…
(function () {
const DATA = window.GAME_DATA;
const ICON_FILES = {
  Charm: "assets/icons/tag-charm.png",
  Strength: "assets/icons/tag-strength.png",
  Dexterity: "assets/icons/tag-ruse.png",
  DexteritySq: "assets/icons/tag-ruse-square.png",
  Intelligence: "assets/icons/tag-intelligence.png",
  Sorcery: "assets/icons/tag-magic.png",
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
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
function resourceIcon(kind, label) {
  return `<img class="game-icon" src="${ICON_FILES[kind]}" alt="${esc(label)}" title="${esc(label)}">`;
}
// Skill icons in card texts are square, like the tags on the cards.
function skillIcon(icon) {
  return `<span class="skill-tag txt-tag sk-${icon.toLowerCase()}">${resourceIcon(icon === "Dexterity" ? "DexteritySq" : icon, icon)}</span>`;
}

function formatGameText(text) {
  return (window.tagTokens ? window.tagTokens(text) : String(text || ""))
    .replace(/\bGame End\b/gi, resourceIcon("endgame", "Game End"))
    .replace(/\bOngoing\b/gi, resourceIcon("ongoing", "Ongoing"))
    .replace(/\bInstant\b/gi, resourceIcon("instant", "Instant"))
    .replace(/\bActivation\b/gi, resourceIcon("activation", "Activation"))
    .replace(/\bStrength\b/gi, skillIcon("Strength"))
    .replace(/\b(?:Dexterity|Ruse)\b/gi, skillIcon("Dexterity"))
    .replace(/\bIntelligence\b/gi, skillIcon("Intelligence"))
    .replace(/\bSorcery\b/gi, skillIcon("Sorcery"))
    .replace(/\bCharm\b/gi, skillIcon("Charm"))
    .replace(/\bVP\b/g, resourceIcon("vp", "VP"))
    .replace(/\bXP\b/g, resourceIcon("xp", "XP"))
    .replace(/\b(?:Coins?|coins?)\b/g, resourceIcon("coins", "Coins"))
    .replace(/\u0002/g, '<span class="fc-max">').replace(/\u0003/g, "</span>")
    .replace(/\u0001SET4\u0001/g, `<span class="set4">${["Charm", "Strength", "Dexterity", "Intelligence", "Sorcery"].map(skillIcon).join("")}</span>`);
}
function printedIcons(card) {
  const lead = String(card.base || "").match(/^\s*(?:(?:Charm|Strength|Dexterity|Intelligence|Sorcery)(?:\s*\d+)?\s*[,.]?\s*)+/i);
  return `${card.icons || ""} ${lead ? lead[0] : ""}`;
}
function textIconAmount(text, icon) {
  const regex = new RegExp(`${icon}\\s*(\\d+)?`, "gi");
  let total = 0;
  let m;
  while ((m = regex.exec(text || ""))) total += Number(m[1] || 1);
  return total;
}
function iconAmount(card, icon) {
  return textIconAmount(printedIcons(card), icon);
}

const find = (list, name) => list.find((c) => c.name === name) || list[0];
// Characters revealed each round. With 3 players the second Legendary alternates with a Common card.
const BOARD_ROWS = [
  [2, "", [[0, 1], [1, 0], [1, 0]]],
  [3, "odd", [[0, 1], [0, 1], [1, 0], [1, 0]]],
  [3, "even", [[0, 1], [1, 0], [1, 0], [1, 0]]],
  [4, "", [[0, 1], [0, 1], [1, 0], [1, 0], [1, 0]]],
];

// Writer tiles: same face as in the game and the Print & Play.
function writerCard(writer) {
  return CardFace.writer(writer, { cls: "rules-writer" });
}

function squareTag(icon) {
  return `<span class="skill-tag sk-${icon.toLowerCase()}">${resourceIcon(icon === "Dexterity" ? "DexteritySq" : icon, icon)}</span>`;
}

// Card anatomy: a card with numbered markers and their legend.
const ANATOMY = {
  common: { card: () => CardFace.common(find(DATA.common, "Pirate")), marks: [[100, 5], [100, 30], [100, 70], [100, 95]] },
  legendary: { card: () => CardFace.legendary(find(DATA.legendary, "Snow White")), marks: [[0, 4], [100, 4], [100, 30], [0, 60], [100, 66], [0, 76], [100, 96]] },
  item: { card: () => CardFace.item(find(DATA.items, "Magic Lamp")), marks: [[0, 8], [100, 8], [0, 28], [100, 85]] },
};

function anatomy(kind, labels) {
  const a = ANATOMY[kind];
  return `<div class="anatomy"><figure class="anatomy-card">${a.card()}${a.marks.map(([x, y], i) => `<span class="mark" style="left:${x}%;top:${y}%">${i + 1}</span>`).join("")}</figure>
    <ol class="anatomy-legend">${labels.map((l) => `<li>${l}</li>`).join("")}</ol></div>`;
}

function boardsTable(L) {
  const chip = (k, n) => Array.from({ length: n }, () => `<i class="chip chip-${k}" title="${esc(k === "c" ? L.normal : L.legendary)}"></i>`).join("");
  return `<table class="boards"><thead><tr><th>${esc(L.players)}</th><th>${esc(L.groups)}</th></tr></thead><tbody>${BOARD_ROWS
    .map(([n, when, groups]) => `<tr><td><b>${n}</b>${when ? `<br><small>${esc(L[when])}</small>` : ""}</td><td><div class="board-row">${groups.map(([c, l]) => `<span class="board-group">${chip("c", c)}${chip("l", l)}</span>`).join("")}</div></td></tr>`)
    .join("")}</tbody></table><p class="legend-line"><i class="chip chip-c"></i> ${esc(L.normal)} &nbsp; <i class="chip chip-l"></i> ${esc(L.legendary)}</p>`;
}

function render(text, L) {
  return text
    .replace(/\[\[anatomy:(\w+)\]\]/g, (_, k) => anatomy(k, L.anatomy[k]))
    .replace(/\[\[boards\]\]/g, () => boardsTable(L))
    .replace(/\[\[iconguide\]\]/g, () => CardFace.iconGuide())
    .replace(/\[\[actions\]\]/g, () => `<div class="actions-grid">${DATA.actions.map((a) => `<figure class="fig fig-action">${CardFace.action(a)}</figure>`).join("")}</div>`)
    .replace(/\[\[common:([^\]]+)\]\]/g, (_, n) => `<figure class="fig">${CardFace.common(find(DATA.common, n))}</figure>`)
    .replace(/\[\[legendary:([^\]]+)\]\]/g, (_, n) => `<figure class="fig">${CardFace.legendary(find(DATA.legendary, n))}</figure>`)
    .replace(/\[\[legendaryUp:([^\]]+)\]\]/g, (_, n) => `<figure class="fig">${CardFace.legendary({ ...find(DATA.legendary, n), upgraded: true })}</figure>`)
    .replace(/\[\[item:([^\]]+)\]\]/g, (_, n) => `<figure class="fig">${CardFace.item(find(DATA.items, n))}</figure>`)
    .replace(/\[\[quest:([^\]]+)\]\]/g, (_, n) => `<figure class="fig">${CardFace.quest(find(DATA.quests, n))}</figure>`)
    .replace(/\[\[writer:([^\]]+)\]\]/g, (_, n) => `<figure class="fig fig-writer">${writerCard(find(DATA.writers, n))}</figure>`)
    .replace(/\[\[action:(\d+)(?::([^\]]+))?\]\]/g, (_, n, who) => `<figure class="fig fig-action">${CardFace.action(DATA.actions.find((a) => a.number === Number(n)))}${who ? `<figcaption>${esc(who)}</figcaption>` : ""}</figure>`)
    .replace(/\[\[icon:freeup\]\]/g, () => window.FREEUP_ICON || "")
    .replace(/\[\[questicon\]\]/g, () => window.QUEST_ICON || "")
    .replace(/\[\[icon:(\w+)\]\]/g, (_, k) => resourceIcon(k, k))
    .replace(/\[\[tag:(\w+)\]\]/g, (_, k) => squareTag(k));
}

// ---------------------------------------------------------------------------
// Texts
// ---------------------------------------------------------------------------
const RULES = {
  en: {
    title: "Rules of the game",
    kicker: "Once Upon a Time · 2 to 4 players · ages 14+ · 40 min",
    toc: "Contents",
    players: "Players",
    groups: "Characters revealed each round",
    odd: "odd rounds",
    even: "even rounds",
    normal: "Common character",
    legendary: "Legendary character",
    anatomy: {
      common: ["Name of the character (Common characters have no tag).", "Illustration.", "Effect, with its type icon.", "Good or Bad, in its own band."],
      legendary: ["Skill tags.", "Name of the character.", "Illustration.", "Base effect, active as soon as you take the card.", "Star spaces: one per XP needed to upgrade it.", "Upgraded effect (added to the base effect).", "Good or Bad."],
      item: ["Skill tags.", "Name of the Item.", "Price in coins.", "Effect."],
    },
    sections: [
      ["goal", "The story", `<p>You are storytellers. Round after round you gather the heroes, villains and treasures of the classic tales into your own story, and you complete Adventures. After <b>12 rounds</b>, the storyteller with the most <b>Victory Points</b> [[icon:vp]] wins.</p>
      <p>The heart of the game is your hand of <b>Chapter cards</b>, numbered 1 to 15 like the chapters of a book. A high chapter lets you choose first; a low chapter gives a stronger effect. Every chapter you play is gone, so choose wisely when to spend it.</p>`],
      ["material", "Components", `<ul class="material-list">
        <li><b>62</b> Common character cards</li>
        <li><b>43</b> Legendary character cards</li>
        <li><b>40</b> Item tiles</li>
        <li><b>25</b> Adventure cards</li>
        <li><b>8</b> Writer cards</li>
        <li><b>60</b> Chapter cards (15 per player, in 4 colours)</li>
        <li><b>1</b> board (offer for 2, 3 and 4 players, and the icons)</li>
        <li><b>1</b> first player token</li>
        <li><b>36</b> coins [[icon:coins]]</li>
        <li><b>90</b> XP tokens [[icon:xp]]</li>
        <li><b>45</b> Victory Point tokens [[icon:vp]] (27 worth 1 VP, 18 worth 5 VP)</li>
        <li><b>45</b> Tag tokens (9 per skill)</li>
      </ul>`],
      ["components", "The cards", `<p>Every character and Item shows the same elements:</p>
      [[anatomy:common]]
      [[anatomy:legendary]]
      [[anatomy:item]]
      <p><b>Adventure cards</b> score at the end of the game; some have tiers (2 / 4 / 6 VP). <b>Writer cards</b> give each player a personal power that grows over three levels. <b>Chapter cards</b> are pages of a book: their chapter number sets the turn order, their effect is resolved during your turn.</p>
      <div class="fig-row">[[quest:The Midnight Ball]][[writer:Charles Perrault]][[action:3]]</div>
      <p>The five skills are <b>Charm</b> [[tag:Charm]], <b>Strength</b> [[tag:Strength]], <b>Cunning</b> [[tag:Dexterity]], <b>Intelligence</b> [[tag:Intelligence]] and <b>Magic</b> [[tag:Sorcery]]. Only <b>Legendary characters and Items</b> carry tags (none, one or two; rarely more): Common characters never have any, except the Sirens: they carry a <b>joker tag</b>, which counts as the tag of your choice for each effect during the game; at Game End, you choose one single type for it, for all scorings. Many Adventures and effects count them. A square <b>Tag token</b> counts as one icon of its type: when you gain one, you choose its type and <b>place it on the card that gave it to you</b> (character, Item or Writer). If that card leaves your tableau (discarded or tucked away), <b>its tokens are lost</b>. A round green badge with a feather marks the cards that give VP tokens during the game (not those that only score at Game End); it is <b>not a tag</b>. Some Legendary characters and Items have <b>no tag</b> at all: they are rewarded in other ways, often with Victory Points during the game (Spinning Wheel, Mad Hatter, “The Queen’s Command”…). A Common character never counts as a “card without tags”.</p>
      <p><b>Story links.</b> Cards from the same tale work together: “if you have X” means X is in your tableau (Characters) or among your Items. For example, the Scarecrow gives 2 XP instead of 1 if you have Dorothy Gale, and the Cat and the Fox steal 2 coins from a player who has Pinocchio. Villains’ links often target the cards of your opponents.</p>
      <p><b>Good and Bad cards.</b> A “Good card” or “Bad card” is any card that shows that icon: Characters, but also some Items (the Poisoned Apple, the Spinning Wheel and the Magic Contract are Bad). Only Bad cards have mean effects on other players.</p>
      <p>Effects have four types: [[icon:instant]] <b>Instant</b> (once, when you take the card), [[icon:activation]] <b>Activation</b> (each time an effect activates it), [[icon:ongoing]] <b>Ongoing</b> (always true) and [[icon:endgame]] <b>Game End</b> (scored at the end).</p>`],
      ["setup", "Setup", `<ol>
        <li>Shuffle the Common characters and the Legendary characters into two separate decks.</li>
        <li>Shuffle the Items and reveal <b>1 + the number of players</b>. Shuffle the Adventures and reveal <b>1 + the number of players</b>.</li>
        <li>Each player takes the 15 Chapter cards of one colour, shuffles them, draws <b>4</b> into their hand and places the other <b>11</b> face down: this is their Chapter deck.</li>
        <li>Put the board in the middle: it shows the offer for 2, 3 and 4 players, and all the icons. Choose a first player at random: they take the first player token.</li>
        <li>Shuffle the Writers. Each player draws <b>2 Writers</b>, keeps <b>1</b> of them, at level 1, and takes the <b>coins</b> [[icon:coins]] shown on it. The other Writer is discarded (put back in the game box), as are the Writers nobody drew.</li>
        <li>Place your Chapter deck to the left of your Writer, against the notch: it is the book you are writing.</li>
      </ol>`],
      ["round", "A round", `<h3>1. Reveal the offer</h3>
      <p>Reveal one Common or Legendary character under each space of the board, as shown below: this is the offer. There is always <b>one character more than there are players</b>, and each player will take <b>only one</b>. With 3 players, the second Legendary character is only revealed in odd rounds (1, 3, 5…); in even rounds a Common character takes its place.</p>
      [[boards]]
      <h3>2. Play a Chapter card</h3>
      <p>Starting with the first player and going clockwise, everyone plays one Chapter card face up. You cannot play a chapter that another player has already played this round (if all your cards are taken, play any of them). The <b>highest chapter plays first</b>, then the next, and so on. If two players play the same chapter, the one closest to the first player (clockwise) goes first. The Queen of Hearts adds to your chapter, lets you play the same chapter as an opponent and always wins ties.</p>
      <div class="example"><b>Example.</b> Marc plays chapter 10, Léa chapter 6 and Sofia chapter 5. Marc plays first, then Léa, then Sofia: Sofia will choose her character last, but her chapter 5 gives her a free upgrade and 2 coins.
      <div class="fig-row">[[action:10:Marc]][[action:6:Léa]][[action:5:Sofia]]</div></div>
      <h3>3. Your turn</h3>
      <ol>
        <li><b>Take one character</b> from the offer. Put it in front of you (your tableau). Its [[icon:instant]] effect happens now.</li>
        <li><b>Resolve your Chapter card.</b> Coins, XP, Adventures, activations or free upgrades.</li>
        <li><b>Buy one Item</b> if you wish (one only), by paying its price in coins.</li>
        <li><b>Place your XP</b> [[icon:xp]]: each XP you gain goes on a free star space, between two levels of your Writer or of a Legendary character not yet upgraded. Placed XP never moves. When all the spaces of a step are filled (the number of spaces is the cost), the card moves up at once. To <b>spend XP</b> (the Lost Boys), take it from your unplaced XP or from a Legendary character that is not upgraded yet, never from an upgraded card. [[icon:freeup]] <b>Free upgrade</b>: one of your Legendary characters is upgraded at once (cover its empty spaces with XP from the supply). It cannot be used on your Writer.</li>
        <li>Your turn ends; the next player in the turn order plays.</li>
      </ol>
      <div class="example"><b>Example of a turn.</b> Léa played chapter 4 (“Activate all + 2 coins”). She takes the Mice: they give her a Tag token at once. Then she resolves her chapter: she activates all her cards — the Dwarf she took in an earlier round gives her 1 coin — and gains 2 coins. With her 5 coins she could buy an Item, but she keeps them.
      <div class="fig-row">[[common:Dwarf]][[common:Mice]][[action:4]]</div></div>
      <h3>4. End of the round</h3>
      <ul>
        <li>Straighten all tilted cards. Discard the characters nobody took. The Items and the Adventures stay on display from one round to the next: only refill the empty spots, Items to 1 + players and Adventures to 1 + players.</li>
        <li>Each player draws <b>exactly 1 Chapter card</b> from their Chapter deck. The deck therefore shrinks by one card each round: when it is empty, the last round begins.</li>
        <li>The player who played the highest chapter becomes the first player and takes the token.</li>
      </ul>`],
      ["effects", "Effects in detail", `<h3>The 15 Chapter cards</h3><p>The higher the chapter, the weaker the effect: chapter 1 is the strongest, chapter 15 does nothing but lets you choose your character first.</p><p class="legend-line">[[icon:activation]] activate 1 of your cards · [[icon:activation]][[icon:activation]][[icon:activation]] activate all your cards with an Activation effect · [[icon:freeup]] free upgrade · [[questicon]] take an Adventure.</p>[[actions]]
      <p><b>Activate.</b> “Activate all” triggers every [[icon:activation]] effect in your tableau and Items; “Activate 1 card” only one of them, of your choice. An Activation that costs something (spend coins, discard a card…) is optional. When you activate a card, <b>tilt it</b> to show that it has been used this round; all cards are straightened at the end of the round. An effect that activates a card again (the Sand Hourglass) also works on a tilted card.</p>
      <p><b>Take an Adventure.</b> Choose one face-up Adventure and keep it in front of you. It will score at the end of the game.</p>
      <p><b>Free upgrade.</b> Fill at once all the remaining star spaces of a Legendary character: it is upgraded. A free upgrade can <b>never</b> be used on your Writer: its levels are only reached with XP. If you have no Legendary character to upgrade by the end of your turn, the free upgrade is lost.</p>
      <p><b>XP not placed.</b> XP you have not placed by the end of the turn goes to the first free space: your Writer first, as long as it is not at level 3, then your Legendary characters. If no space is free, it waits in your reserve and goes to the next space that becomes free. Some effects place XP <b>on your Writer</b> only (the Wicked Witches, the “Drink Me” Bottle): if your Writer is already at level 3, that XP is lost.</p>
      <p><b>Draw a Chapter card.</b> Draw 1 card from your Chapter deck, then put 1 Chapter card from your hand under your deck. If your Chapter deck is empty, the effect does nothing. This way the deck always counts the rounds.</p>
      <h3>Legendary characters</h3>
      <p>A Legendary character starts on its base side. When its star spaces are full, it is upgraded: from then on, the upgraded effect is <b>added</b> to the base effect, which stays active (the full star spaces show it).</p>
      <div class="fig-row">[[legendary:Little Red Riding Hood]][[legendaryUp:Little Red Riding Hood]]</div>
      <h3>Writers</h3>
      <p>Level 1 [[icon:ongoing]] is active from the start. Level 2 [[icon:instant]] is a one-time effect when you reach it. Level 3 [[icon:endgame]] scores at the end of the game. You reach each level by filling its star spaces with XP.</p>
      <div class="fig-row">[[writer:L. Frank Baum]][[writer:Hans Christian Andersen]]</div>`],
      ["end", "End of the game and scoring", `<p>The game ends after the 12th round: the Chapter decks are empty and 3 Chapter cards are left in each hand. Each player adds up:</p>
      <ul>
        <li>the Victory Points [[icon:vp]] gained during the game;</li>
        <li>their Adventures [[icon:endgame]];</li>
        <li>the [[icon:endgame]] Game End effects of their characters and Items;</li>
        <li>their Writer, if it reached level 3.</li>
      </ul>
      <p>The storyteller with the most Victory Points has written the best story and wins.</p>
      <div class="example"><b>Example.</b> At the end, Sofia has 5 Charm icons. Her Adventure “The Midnight Ball” gives 2 / 4 / 6 VP for 3 / 4 / 6 Charm: she reaches the second step, 4 VP. Her upgraded Evil Queen gives 1 VP per Charm for her base effect and 1 more for her upgraded effect: another 10 VP.
      <div class="fig-row">[[quest:The Midnight Ball]][[legendaryUp:The Evil Queen]]</div></div>`],
      ["icons", "Iconography", `[[iconguide]]`],
    ],
  },
  fr: {
    title: "Règles du jeu",
    kicker: "Once Upon a Time · 2 à 4 joueurs · 14 ans et + · 40 min",
    toc: "Sommaire",
    players: "Joueurs",
    groups: "Personnages révélés à chaque manche",
    odd: "manches impaires",
    even: "manches paires",
    normal: "Personnage commun",
    legendary: "Personnage légendaire",
    anatomy: {
      common: ["Nom du personnage (les personnages communs n’ont pas de tag).", "Illustration.", "Effet, avec l’icône de son type.", "Gentil ou Méchant, dans son propre bandeau."],
      legendary: ["Tags de compétence.", "Nom du personnage.", "Illustration.", "Effet de base, actif dès que vous prenez la carte.", "Cases étoile : une par XP nécessaire pour l’améliorer.", "Effet amélioré (s’ajoute à l’effet de base).", "Gentil ou Méchant."],
      item: ["Tags de compétence.", "Nom de l’Objet.", "Prix en pièces.", "Effet."],
    },
    sections: [
      ["goal", "L’histoire", `<p>Vous êtes des conteurs. Manche après manche, vous réunissez dans votre histoire les héros, les méchants et les trésors des contes classiques, et vous accomplissez des Aventures. Après <b>12 manches</b>, le conteur qui a le plus de <b>Points de Victoire</b> [[icon:vp]] l’emporte.</p>
      <p>Le cœur du jeu, c’est votre main de <b>cartes Chapitre</b>, numérotées de 1 à 15 comme les chapitres d’un livre. Un grand chapitre vous fait choisir en premier ; un petit chapitre donne un effet plus fort. Chaque chapitre joué est perdu : choisissez bien quand le dépenser.</p>`],
      ["material", "Matériel", `<ul class="material-list">
        <li><b>62</b> cartes Personnage commun</li>
        <li><b>43</b> cartes Personnage légendaire</li>
        <li><b>40</b> tuiles Objet</li>
        <li><b>25</b> cartes Aventure</li>
        <li><b>8</b> cartes Écrivain</li>
        <li><b>60</b> cartes Chapitre (15 par joueur, en 4 couleurs)</li>
        <li><b>1</b> plateau (offre pour 2, 3 et 4 joueurs, et iconographie)</li>
        <li><b>1</b> jeton Premier joueur</li>
        <li><b>36</b> pièces [[icon:coins]]</li>
        <li><b>90</b> jetons XP [[icon:xp]]</li>
        <li><b>45</b> jetons Point de Victoire [[icon:vp]] (27 de valeur 1, 18 de valeur 5)</li>
        <li><b>45</b> jetons Tag (9 par compétence)</li>
      </ul>`],
      ["components", "Les cartes", `<p>Chaque personnage et chaque Objet présente les mêmes éléments :</p>
      [[anatomy:common]]
      [[anatomy:legendary]]
      [[anatomy:item]]
      <p>Les <b>cartes Aventure</b> rapportent des points en fin de partie ; certaines ont des paliers (2 / 4 / 6 PV). Les <b>cartes Écrivain</b> donnent à chaque joueur un pouvoir personnel qui grandit sur trois niveaux. Les <b>cartes Chapitre</b> sont des pages de livre : leur numéro de chapitre fixe l’ordre du tour, leur effet se résout pendant votre tour.</p>
      <div class="fig-row">[[quest:The Midnight Ball]][[writer:Charles Perrault]][[action:3]]</div>
      <p>Les cinq compétences sont le <b>Charme</b> [[tag:Charm]], la <b>Force</b> [[tag:Strength]], la <b>Ruse</b> [[tag:Dexterity]], l’<b>Intelligence</b> [[tag:Intelligence]] et la <b>Magie</b> [[tag:Sorcery]]. Seuls les <b>personnages Légendaires et les Objets</b> portent des tags (aucun, un ou deux ; rarement plus) : les personnages communs n’en ont jamais, sauf les Sirènes : elles portent un <b>tag joker</b>, qui compte comme le tag de votre choix pour chaque effet pendant la partie ; en fin de partie, vous lui choisissez un seul type, pour tous les décomptes. Beaucoup d’Aventures et d’effets les comptent. Un <b>jeton Tag</b> carré compte comme une icône de son type : quand vous en gagnez un, vous choisissez son type et vous le <b>placez sur la carte qui vous l’a fait gagner</b> (personnage, Objet ou Écrivain). Si cette carte quitte votre tableau (défaussée ou glissée sous un Objet), <b>ses jetons sont perdus</b>. Un badge rond vert avec une plume signale les cartes qui rapportent des jetons PV pendant la partie (pas celles qui ne marquent qu’en fin de partie) ; ce n’est <b>pas un tag</b>. Certains personnages Légendaires et Objets n’ont <b>aucun tag</b> : ils sont récompensés autrement, souvent par des Points de Victoire pendant la partie (Rouet, Chapelier fou, « L’Ordre de la Reine »…). Un personnage commun ne compte jamais comme une « carte sans tag ».</p>
      <p><b>Liens entre contes.</b> Les cartes d’un même conte fonctionnent ensemble : « si vous avez X » veut dire que X est dans votre tableau (Personnages) ou parmi vos Objets. Par exemple, l’Épouvantail donne 2 XP au lieu de 1 si vous avez Dorothy Gale, et le Chat et le Renard volent 2 pièces à un joueur qui a Pinocchio. Les liens des méchants visent souvent les cartes de vos adversaires.</p>
      <p><b>Cartes Gentilles et Méchantes.</b> Une « carte Gentille » ou « carte Méchante » est toute carte qui porte cette icône : les Personnages, mais aussi certains Objets (la Pomme empoisonnée, le Rouet et le Contrat magique sont Méchants). Seules les cartes Méchantes ont des effets contre les autres joueurs.</p>
      <p>Les effets sont de quatre types : [[icon:instant]] <b>Instantané</b> (une fois, quand vous prenez la carte), [[icon:activation]] <b>Activation</b> (chaque fois qu’un effet l’active), [[icon:ongoing]] <b>Permanent</b> (toujours valable) et [[icon:endgame]] <b>Fin de partie</b> (compté à la fin).</p>`],
      ["setup", "Mise en place", `<ol>
        <li>Mélangez les personnages Communs et les personnages Légendaires en deux pioches séparées.</li>
        <li>Mélangez les Objets et révélez-en <b>1 + le nombre de joueurs</b>. Mélangez les Aventures et révélez-en <b>1 + le nombre de joueurs</b>.</li>
        <li>Chaque joueur prend les 15 cartes Chapitre d’une couleur, les mélange, en pioche <b>4</b> et pose les <b>11</b> autres face cachée : c’est sa pioche Chapitre.</li>
        <li>Placez le plateau au centre : il indique l’offre à 2, 3 et 4 joueurs, ainsi que toute l’iconographie. Désignez un premier joueur au hasard : il prend le jeton premier joueur.</li>
        <li>Mélangez les Écrivains. Chaque joueur en pioche <b>2</b> et en garde <b>1</b>, au niveau 1, puis prend les <b>pièces</b> [[icon:coins]] indiquées dessus. L’autre Écrivain est défaussé (remis dans la boîte de jeu), tout comme les Écrivains que personne n’a piochés.</li>
        <li>Posez votre pioche Chapitre à gauche de votre Écrivain, contre l’encoche : c’est le livre que vous êtes en train d’écrire.</li>
      </ol>`],
      ["round", "Une manche", `<h3>1. Révéler l’offre</h3>
      <p>Révélez un personnage Commun ou Légendaire sous chaque emplacement du plateau, comme indiqué ci-dessous : c’est l’offre. Il y a toujours <b>un personnage de plus que de joueurs</b>, et chaque joueur n’en prendra <b>qu’un seul</b>. À 3 joueurs, le second personnage Légendaire n’est révélé que lors des manches impaires (1, 3, 5…) ; lors des manches paires, un personnage Commun prend sa place.</p>
      [[boards]]
      <h3>2. Jouer une carte Chapitre</h3>
      <p>En commençant par le premier joueur, dans le sens horaire, chacun joue une carte Chapitre face visible. On ne peut pas jouer un chapitre qu’un autre joueur a déjà joué cette manche (si toutes vos cartes sont déjà prises, jouez-en une au choix). Le <b>plus grand chapitre joue en premier</b>, puis le suivant, etc. Si deux joueurs jouent le même chapitre, celui qui est le plus proche du premier joueur (sens horaire) passe devant. La Reine de cœur augmente votre chapitre, vous permet de jouer le même chapitre qu’un adversaire et gagne toujours les égalités.</p>
      <div class="example"><b>Exemple.</b> Marc joue le chapitre 10, Léa le 6 et Sofia le 5. Marc joue en premier, puis Léa, puis Sofia : Sofia choisira son personnage en dernier, mais son chapitre 5 lui donne une amélioration gratuite et 2 pièces.
      <div class="fig-row">[[action:10:Marc]][[action:6:Léa]][[action:5:Sofia]]</div></div>
      <h3>3. Votre tour</h3>
      <ol>
        <li><b>Prenez un personnage</b> de l’offre. Posez-le devant vous (votre tableau). Son effet [[icon:instant]] s’applique tout de suite.</li>
        <li><b>Résolvez votre carte Chapitre.</b> Pièces, XP, Aventures, activations ou améliorations gratuites.</li>
        <li><b>Achetez un Objet</b> si vous le souhaitez (un seul), en payant son prix en pièces.</li>
        <li><b>Placez votre XP</b> [[icon:xp]] : chaque XP gagné se pose sur une case étoile libre, entre deux niveaux de votre Écrivain ou d’un personnage Légendaire pas encore amélioré. Un XP posé ne peut plus être déplacé. Quand toutes les cases d’une étape sont remplies (le nombre de cases est le coût), la carte passe aussitôt au niveau suivant. Pour <b>dépenser de l’XP</b> (les Garçons perdus), prenez-le dans votre réserve ou sur un personnage Légendaire pas encore amélioré, jamais sur une carte déjà améliorée. [[icon:freeup]] <b>Amélioration gratuite</b> : un de vos personnages Légendaires est amélioré tout de suite (couvrez ses cases vides avec de l’XP de la réserve). Elle ne peut pas servir sur votre Écrivain.</li>
        <li>Votre tour se termine ; le joueur suivant dans l’ordre du tour joue.</li>
      </ol>
      <div class="example"><b>Exemple de tour.</b> Léa a joué le chapitre 4 (« Tout activer + 2 pièces »). Elle prend les Souris : elles lui donnent tout de suite un jeton Tag. Puis elle résout son chapitre : elle active toutes ses cartes — le Nain pris lors d’une manche précédente lui rapporte 1 pièce — et gagne 2 pièces. Avec ses 5 pièces, elle pourrait acheter un Objet, mais elle les garde.
      <div class="fig-row">[[common:Dwarf]][[common:Mice]][[action:4]]</div></div>
      <h3>4. Fin de la manche</h3>
      <ul>
        <li>Redressez toutes les cartes inclinées. Défaussez les personnages que personne n’a pris. Les Objets et les Aventures restent visibles d’une manche à l’autre : complétez seulement les emplacements vides, Objets jusqu’à 1 + joueurs et Aventures jusqu’à 1 + joueurs.</li>
        <li>Chaque joueur pioche <b>exactement 1 carte Chapitre</b> dans sa pioche Chapitre. La pioche diminue donc d’une carte par manche : quand elle est vide, la dernière manche commence.</li>
        <li>Le joueur qui a joué le plus grand chapitre devient premier joueur et prend le jeton.</li>
      </ul>`],
      ["effects", "Les effets en détail", `<h3>Les 15 cartes Chapitre</h3><p>Plus le chapitre est élevé, plus l’effet est faible : le chapitre 1 est le plus fort, le chapitre 15 ne fait rien mais permet de choisir son personnage en premier.</p><p class="legend-line">[[icon:activation]] déclencher 1 de vos cartes · [[icon:activation]][[icon:activation]][[icon:activation]] déclencher toutes vos cartes à effet Activation · [[icon:freeup]] amélioration gratuite · [[questicon]] prendre une Aventure.</p>[[actions]]
      <p><b>Activer.</b> « Tout activer » déclenche tous les effets [[icon:activation]] de votre tableau et de vos Objets ; « Activer 1 carte » un seul d’entre eux, au choix. Une Activation qui coûte quelque chose (dépenser des pièces, défausser une carte…) est facultative. Quand vous activez une carte, <b>inclinez-la</b> pour montrer qu’elle a servi cette manche ; toutes les cartes sont redressées à la fin de la manche. Un effet qui réactive une carte (le Sablier) fonctionne aussi sur une carte inclinée.</p>
      <p><b>Prendre une Aventure.</b> Choisissez une Aventure visible et gardez-la devant vous. Elle rapportera des points en fin de partie.</p>
      <p><b>Amélioration gratuite.</b> Remplissez d’un coup toutes les cases étoile restantes d’un personnage Légendaire : il est amélioré. Une amélioration gratuite ne peut <b>jamais</b> servir sur votre Écrivain : ses niveaux ne s’atteignent qu’avec de l’XP. Si vous n’avez aucun personnage Légendaire à améliorer à la fin de votre tour, l’amélioration gratuite est perdue.</p>
      <p><b>XP non placé.</b> L’XP que vous n’avez pas placé à la fin du tour va sur le premier emplacement libre : d’abord votre Écrivain, tant qu’il n’est pas au niveau 3, puis vos personnages Légendaires. S’il n’y a aucune case libre, il attend dans votre réserve et ira sur la prochaine case qui se libère. Certains effets placent de l’XP <b>sur votre Écrivain</b> uniquement (les Sorcières d’Oz, le Flacon « Bois-moi ») : si votre Écrivain est déjà au niveau 3, cet XP est perdu.</p>
      <p><b>Piocher une carte Chapitre.</b> Piochez 1 carte de votre pioche Chapitre, puis remettez 1 carte Chapitre de votre main sous votre pioche. Si votre pioche est vide, l’effet ne fait rien. Ainsi, la pioche compte toujours les manches.</p>
      <h3>Personnages légendaires</h3>
      <p>Un personnage Légendaire commence sur sa face de base. Quand ses cases étoile sont pleines, il est amélioré : dès lors, l’effet amélioré <b>s’ajoute</b> à l’effet de base, qui reste actif (les cases étoile pleines le montrent).</p>
      <div class="fig-row">[[legendary:Little Red Riding Hood]][[legendaryUp:Little Red Riding Hood]]</div>
      <h3>Écrivains</h3>
      <p>Le niveau 1 [[icon:ongoing]] est actif dès le début. Le niveau 2 [[icon:instant]] donne un effet unique au moment où vous l’atteignez. Le niveau 3 [[icon:endgame]] rapporte des points en fin de partie. On atteint chaque niveau en remplissant ses cases étoile avec de l’XP.</p>
      <div class="fig-row">[[writer:L. Frank Baum]][[writer:Hans Christian Andersen]]</div>`],
      ["end", "Fin de partie et décompte", `<p>La partie se termine après la 12e manche : les pioches Chapitre sont vides et il reste 3 cartes Chapitre dans chaque main. Chaque joueur additionne :</p>
      <ul>
        <li>les Points de Victoire [[icon:vp]] gagnés pendant la partie ;</li>
        <li>ses Aventures [[icon:endgame]] ;</li>
        <li>les effets [[icon:endgame]] Fin de partie de ses personnages et Objets ;</li>
        <li>son Écrivain, s’il a atteint le niveau 3.</li>
      </ul>
      <p>Le conteur qui a le plus de Points de Victoire a écrit la plus belle histoire et gagne la partie.</p>
      <div class="example"><b>Exemple.</b> À la fin, Sofia a 5 icônes Charme. Son Aventure « Le Bal de minuit » donne 2 / 4 / 6 PV pour 3 / 4 / 6 Charme : elle atteint le deuxième palier, 4 PV. Sa Méchante Reine améliorée donne 1 PV par Charme pour son effet de base et 1 de plus pour son effet amélioré : encore 10 PV.
      <div class="fig-row">[[quest:The Midnight Ball]][[legendaryUp:The Evil Queen]]</div></div>`],
      ["icons", "Iconographie", `[[iconguide]]`],
    ],
  },
  it: {
    title: "Regole del gioco",
    kicker: "Once Upon a Time · da 2 a 4 giocatori · 14+ anni · 40 min",
    toc: "Indice",
    players: "Giocatori",
    groups: "Personaggi rivelati a ogni round",
    odd: "round dispari",
    even: "round pari",
    normal: "Personaggio comune",
    legendary: "Personaggio leggendario",
    anatomy: {
      common: ["Nome del personaggio (i personaggi comuni non hanno tag).", "Illustrazione.", "Effetto, con l’icona del suo tipo.", "Buono o Cattivo, nella sua fascia."],
      legendary: ["Tag di abilità.", "Nome del personaggio.", "Illustrazione.", "Effetto base, attivo appena prendi la carta.", "Caselle stella: una per ogni XP necessario a potenziarlo.", "Effetto potenziato (si aggiunge a quello base).", "Buono o Cattivo."],
      item: ["Tag di abilità.", "Nome dell’Oggetto.", "Prezzo in monete.", "Effetto."],
    },
    sections: [
      ["goal", "La storia", `<p>Siete narratori. Round dopo round riunite nella vostra storia gli eroi, i cattivi e i tesori delle fiabe classiche, e completate Avventure. Dopo <b>12 round</b>, vince il narratore con più <b>Punti Vittoria</b> [[icon:vp]].</p>
      <p>Il cuore del gioco è la tua mano di <b>carte Capitolo</b>, numerate da 1 a 15 come i capitoli di un libro. Un capitolo alto ti fa scegliere per primo; un capitolo basso dà un effetto più forte. Ogni capitolo giocato è perso: scegli bene quando usarlo.</p>`],
      ["material", "Componenti", `<ul class="material-list">
        <li><b>62</b> carte Personaggio comune</li>
        <li><b>43</b> carte Personaggio leggendario</li>
        <li><b>40</b> tessere Oggetto</li>
        <li><b>25</b> carte Avventura</li>
        <li><b>8</b> carte Scrittore</li>
        <li><b>60</b> carte Capitolo (15 per giocatore, in 4 colori)</li>
        <li><b>1</b> plancia (offerta per 2, 3 e 4 giocatori, e iconografia)</li>
        <li><b>1</b> segnalino Primo giocatore</li>
        <li><b>36</b> monete [[icon:coins]]</li>
        <li><b>90</b> segnalini XP [[icon:xp]]</li>
        <li><b>45</b> segnalini Punto Vittoria [[icon:vp]] (27 da 1 PV, 18 da 5 PV)</li>
        <li><b>45</b> segnalini Tag (9 per abilità)</li>
      </ul>`],
      ["components", "Le carte", `<p>Ogni personaggio e ogni Oggetto mostra gli stessi elementi:</p>
      [[anatomy:common]]
      [[anatomy:legendary]]
      [[anatomy:item]]
      <p>Le <b>carte Avventura</b> danno punti a fine partita; alcune hanno delle soglie (2 / 4 / 6 PV). Le <b>carte Scrittore</b> danno a ogni giocatore un potere personale che cresce su tre livelli. Le <b>carte Capitolo</b> sono pagine di un libro: il numero del capitolo decide l’ordine di turno, il loro effetto si risolve durante il tuo turno.</p>
      <div class="fig-row">[[quest:The Midnight Ball]][[writer:Charles Perrault]][[action:3]]</div>
      <p>Le cinque abilità sono <b>Fascino</b> [[tag:Charm]], <b>Forza</b> [[tag:Strength]], <b>Astuzia</b> [[tag:Dexterity]], <b>Intelligenza</b> [[tag:Intelligence]] e <b>Magia</b> [[tag:Sorcery]]. Solo i <b>personaggi Leggendari e gli Oggetti</b> hanno tag (nessuno, uno o due; raramente di più): i personaggi comuni non ne hanno mai, tranne le Sirene: hanno un <b>tag jolly</b>, che conta come il tag che vuoi per ogni effetto durante la partita; a fine partita gli scegli un solo tipo, per tutti i conteggi. Molte Avventure ed effetti le contano. Un <b>segnalino Tag</b> quadrato conta come un’icona del suo tipo: quando ne ottieni uno, ne scegli il tipo e lo <b>metti sulla carta che te l’ha fatto ottenere</b> (personaggio, Oggetto o Scrittore). Se quella carta lascia il tuo tableau (scartata o infilata sotto un Oggetto), <b>i suoi segnalini sono persi</b>. Un distintivo rotondo verde con una piuma segnala le carte che danno segnalini PV durante la partita (non quelle che segnano solo a fine partita); <b>non è un tag</b>. Alcuni personaggi Leggendari e Oggetti non hanno <b>nessun tag</b>: sono premiati in altro modo, spesso con Punti Vittoria durante la partita (Arcolaio, Cappellaio Matto, «La Regina Ordina»…). Un personaggio comune non conta mai come «carta senza tag».</p>
      <p><b>Legami tra le fiabe.</b> Le carte di una stessa fiaba funzionano insieme: «se hai X» significa che X è nel tuo tableau (Personaggi) o tra i tuoi Oggetti. Per esempio, lo Spaventapasseri dà 2 XP invece di 1 se hai Dorothy Gale, e il Gatto e la Volpe rubano 2 monete a un giocatore che ha Pinocchio. I legami dei cattivi colpiscono spesso le carte degli avversari.</p>
      <p><b>Carte Buone e Cattive.</b> Una «carta Buona» o «carta Cattiva» è ogni carta che porta quell’icona: i Personaggi, ma anche alcuni Oggetti (la Mela avvelenata, l’Arcolaio e il Contratto magico sono Cattivi). Solo le carte Cattive hanno effetti contro gli altri giocatori.</p>
      <p>Gli effetti sono di quattro tipi: [[icon:instant]] <b>Istantaneo</b> (una volta, quando prendi la carta), [[icon:activation]] <b>Attivazione</b> (ogni volta che un effetto la attiva), [[icon:ongoing]] <b>Permanente</b> (sempre valido) e [[icon:endgame]] <b>Fine partita</b> (contato alla fine).</p>`],
      ["setup", "Preparazione", `<ol>
        <li>Mescola i personaggi Comuni e i personaggi Leggendari in due mazzi separati.</li>
        <li>Mescola gli Oggetti e rivelane <b>1 + il numero di giocatori</b>. Mescola le Avventure e rivelane <b>1 + il numero di giocatori</b>.</li>
        <li>Ogni giocatore prende le 15 carte Capitolo di un colore, le mescola, ne pesca <b>4</b> e mette le altre <b>11</b> coperte: è il suo mazzo Capitolo.</li>
        <li>Metti la plancia al centro: mostra l’offerta per 2, 3 e 4 giocatori e tutta l’iconografia. Scegliete a caso il primo giocatore: prende il segnalino primo giocatore.</li>
        <li>Mescola gli Scrittori. Ogni giocatore ne pesca <b>2</b> e ne tiene <b>1</b>, al livello 1, poi prende le <b>monete</b> [[icon:coins]] indicate sopra. L’altro Scrittore viene scartato (rimesso nella scatola), così come gli Scrittori che nessuno ha pescato.</li>
        <li>Metti il tuo mazzo Capitolo a sinistra del tuo Scrittore, contro la tacca: è il libro che stai scrivendo.</li>
      </ol>`],
      ["round", "Un round", `<h3>1. Rivelare l’offerta</h3>
      <p>Rivela un personaggio Comune o Leggendario sotto ogni spazio della plancia, come indicato qui sotto: è l’offerta. C’è sempre <b>un personaggio in più rispetto ai giocatori</b>, e ogni giocatore ne prenderà <b>uno solo</b>. In 3 giocatori, il secondo personaggio Leggendario viene rivelato solo nei round dispari (1, 3, 5…); nei round pari un personaggio Comune prende il suo posto.</p>
      [[boards]]
      <h3>2. Giocare una carta Capitolo</h3>
      <p>A partire dal primo giocatore, in senso orario, ognuno gioca una carta Capitolo scoperta. Non puoi giocare un capitolo che un altro giocatore ha già giocato in questo round (se tutte le tue carte sono già prese, giocane una a scelta). Il <b>capitolo più alto gioca per primo</b>, poi il successivo, e così via. Se due giocatori giocano lo stesso capitolo, passa prima quello più vicino al primo giocatore (in senso orario). La Regina di cuori aumenta il tuo capitolo, ti permette di giocare lo stesso capitolo di un avversario e vince sempre i pareggi.</p>
      <div class="example"><b>Esempio.</b> Marco gioca il capitolo 10, Lea il 6 e Sofia il 5. Marco gioca per primo, poi Lea, poi Sofia: Sofia sceglierà il suo personaggio per ultima, ma il suo capitolo 5 le dà un potenziamento gratis e 2 monete.
      <div class="fig-row">[[action:10:Marco]][[action:6:Lea]][[action:5:Sofia]]</div></div>
      <h3>3. Il tuo turno</h3>
      <ol>
        <li><b>Prendi un personaggio</b> dall’offerta. Mettilo davanti a te (il tuo tableau). Il suo effetto [[icon:instant]] si applica subito.</li>
        <li><b>Risolvi la tua carta Capitolo.</b> Monete, XP, Avventure, attivazioni o potenziamenti gratis.</li>
        <li><b>Compra un Oggetto</b> se vuoi (uno solo), pagando il suo prezzo in monete.</li>
        <li><b>Metti i tuoi XP</b> [[icon:xp]]: ogni XP ottenuto va su una casella stella libera, tra due livelli del tuo Scrittore o di un personaggio Leggendario non ancora potenziato. Un XP posato non si sposta più. Quando tutte le caselle di un passaggio sono piene (il numero di caselle è il costo), la carta sale subito di livello. Per <b>spendere XP</b> (i Bimbi Sperduti), prendili dalla tua riserva o da un personaggio Leggendario non ancora potenziato, mai da una carta già potenziata. [[icon:freeup]] <b>Potenziamento gratis</b>: uno dei tuoi personaggi Leggendari è potenziato subito (copri le caselle vuote con XP dalla riserva). Non può essere usato sul tuo Scrittore.</li>
        <li>Il tuo turno finisce; gioca il giocatore successivo nell’ordine di turno.</li>
      </ol>
      <div class="example"><b>Esempio di turno.</b> Lea ha giocato il capitolo 4 («Attiva tutto + 2 monete»). Prende i Topolini: le danno subito un segnalino Tag. Poi risolve il suo capitolo: attiva tutte le sue carte — il Nano preso in un round precedente le dà 1 moneta — e ottiene 2 monete. Con le sue 5 monete potrebbe comprare un Oggetto, ma le tiene.
      <div class="fig-row">[[common:Dwarf]][[common:Mice]][[action:4]]</div></div>
      <h3>4. Fine del round</h3>
      <ul>
        <li>Raddrizza tutte le carte inclinate. Scarta i personaggi che nessuno ha preso. Gli Oggetti e le Avventure restano visibili da un round all’altro: completa solo gli spazi vuoti, Oggetti fino a 1 + giocatori e Avventure fino a 1 + giocatori.</li>
        <li>Ogni giocatore pesca <b>esattamente 1 carta Capitolo</b> dal suo mazzo Capitolo. Il mazzo cala quindi di una carta per round: quando è vuoto, inizia l’ultimo round.</li>
        <li>Chi ha giocato il capitolo più alto diventa il primo giocatore e prende il segnalino.</li>
      </ul>`],
      ["effects", "Gli effetti nel dettaglio", `<h3>Le 15 carte Capitolo</h3><p>Più il capitolo è alto, più l’effetto è debole: il capitolo 1 è il più forte, il capitolo 15 non fa nulla ma ti fa scegliere il personaggio per primo.</p><p class="legend-line">[[icon:activation]] attiva 1 delle tue carte · [[icon:activation]][[icon:activation]][[icon:activation]] attiva tutte le tue carte con effetto Activation · [[icon:freeup]] potenziamento gratis · [[questicon]] prendi un’Avventura.</p>[[actions]]
      <p><b>Attivare.</b> «Attiva tutto» fa scattare tutti gli effetti [[icon:activation]] del tuo tableau e dei tuoi Oggetti; «Attiva 1 carta» solo uno di essi, a scelta. Un’Attivazione che costa qualcosa (spendere monete, scartare una carta…) è facoltativa. Quando attivi una carta, <b>inclinala</b> per mostrare che è stata usata in questo round; tutte le carte vengono raddrizzate alla fine del round. Un effetto che riattiva una carta (la Clessidra) funziona anche su una carta inclinata.</p>
      <p><b>Prendere un’Avventura.</b> Scegli un’Avventura scoperta e tienila davanti a te. Darà punti a fine partita.</p>
      <p><b>Potenziamento gratis.</b> Riempi in un colpo tutte le caselle stella rimanenti di un personaggio Leggendario: viene potenziato. Un potenziamento gratis non può <b>mai</b> essere usato sul tuo Scrittore: i suoi livelli si raggiungono solo con gli XP. Se alla fine del tuo turno non hai nessun personaggio Leggendario da potenziare, il potenziamento gratis è perso.</p>
      <p><b>XP non piazzati.</b> Gli XP che non hai piazzato alla fine del turno vanno sul primo spazio libero: prima il tuo Scrittore, finché non è al livello 3, poi i tuoi personaggi Leggendari. Se non c’è nessuna casella libera, restano nella tua riserva e andranno sulla prossima casella che si libera. Alcuni effetti piazzano XP solo <b>sul tuo Scrittore</b> (le Streghe di Oz, la Bottiglietta «Bevimi»): se il tuo Scrittore è già al livello 3, quegli XP sono persi.</p>
      <p><b>Pescare una carta Capitolo.</b> Pesca 1 carta dal tuo mazzo Capitolo, poi rimetti 1 carta Capitolo dalla mano sotto il mazzo. Se il mazzo è vuoto, l’effetto non fa nulla. Così il mazzo conta sempre i round.</p>
      <h3>Personaggi leggendari</h3>
      <p>Un personaggio Leggendario inizia sul lato base. Quando le sue caselle stella sono piene, è potenziato: da quel momento l’effetto potenziato <b>si aggiunge</b> all’effetto base, che resta attivo (le caselle stella piene lo mostrano).</p>
      <div class="fig-row">[[legendary:Little Red Riding Hood]][[legendaryUp:Little Red Riding Hood]]</div>
      <h3>Scrittori</h3>
      <p>Il livello 1 [[icon:ongoing]] è attivo fin dall’inizio. Il livello 2 [[icon:instant]] dà un effetto unico quando lo raggiungi. Il livello 3 [[icon:endgame]] dà punti a fine partita. Si raggiunge ogni livello riempiendo le sue caselle stella con XP.</p>
      <div class="fig-row">[[writer:L. Frank Baum]][[writer:Hans Christian Andersen]]</div>`],
      ["end", "Fine della partita e punteggio", `<p>La partita finisce dopo il 12° round: i mazzi Capitolo sono vuoti e in ogni mano restano 3 carte Capitolo. Ogni giocatore somma:</p>
      <ul>
        <li>i Punti Vittoria [[icon:vp]] ottenuti durante la partita;</li>
        <li>le sue Avventure [[icon:endgame]];</li>
        <li>gli effetti [[icon:endgame]] Fine partita dei suoi personaggi e Oggetti;</li>
        <li>il suo Scrittore, se ha raggiunto il livello 3.</li>
      </ul>
      <p>Il narratore con più Punti Vittoria ha scritto la storia più bella e vince.</p>
      <div class="example"><b>Esempio.</b> Alla fine Sofia ha 5 icone Fascino. La sua Avventura «Il Ballo di Mezzanotte» dà 2 / 4 / 6 PV per 3 / 4 / 6 Fascino: raggiunge la seconda soglia, 4 PV. La sua Regina cattiva potenziata dà 1 PV per Fascino per l’effetto base e 1 in più per l’effetto potenziato: altri 10 PV.
      <div class="fig-row">[[quest:The Midnight Ball]][[legendaryUp:The Evil Queen]]</div></div>`],
      ["icons", "Iconografia", `[[iconguide]]`],
    ],
  },
};

function build(root = document.querySelector("#rules")) {
  if (!root) return;
  const L = RULES[I18N.lang] || RULES.en;
  root.innerHTML = `
    <header class="rules-hero">
      <div class="rules-hero-art">${CardArt.art("Once Upon a Time")}</div>
      <p class="hero-kicker">${esc(L.kicker)}</p>
      <h1>${esc(L.title)}</h1>
      <nav class="rules-toc" aria-label="${esc(L.toc)}">${L.sections.map(([id, title], i) => `<a href="#r-${id}">${i + 1}. ${esc(title)}</a>`).join("")}</nav>
    </header>
    ${L.sections.map(([id, title, html], i) => `<section class="rules-section" id="r-${id}"><h2>${i + 1}. ${esc(title)}</h2>${render(html, L)}</section>`).join("")}`;
  // In-page links scroll inside whatever container shows the rules.
  root.querySelectorAll(".rules-toc a").forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    root.querySelector(a.getAttribute("href"))?.scrollIntoView({ behavior: "smooth", block: "start" });
  }));
}

window.Rules = { render: build, format: (html) => render(html, RULES[I18N.lang] || RULES.en) };
// cards.js uses these helpers as globals; on the stand-alone page app.js is not loaded.
for (const [name, fn] of Object.entries({ esc, resourceIcon, formatGameText, iconAmount, printedIcons, textIconAmount })) {
  if (typeof window[name] !== "function") window[name] = fn;
}

// Stand-alone page (rules.html)
if (document.body.classList.contains("rules-body") && !document.body.classList.contains("present-body") && !document.body.classList.contains("box-body")) {
  const params = new URLSearchParams(location.search);
  if (params.get("lang")) I18N.setLang(params.get("lang"), false);
  I18N.apply();
  const page = () => {
    document.title = `Once Upon a Time · ${(RULES[I18N.lang] || RULES.en).title}`;
    build();
    document.querySelector(".rules-home").textContent = `← ${t("home")}`;
  };
  page();
  window.addEventListener("langchange", page);
}
})();
