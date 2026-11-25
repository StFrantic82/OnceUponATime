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
    .replace(/\b(?:Coins?|coins?)\b/g, resourceIcon("coins", "Coins"));
}
function printedIcons(card) {
  const lead = String(card.base || "").match(/^\s*(?:(?:Charm|Strength|Dexterity|Intelligence)(?:\s*\d+)?\s*[,.]?\s*)+/i);
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
const BOARDS = { 2: [[1, 0], [1, 1], [2, 1]], 3: [[1, 0], [2, 0], [1, 1], [2, 1]], 4: [[1, 0], [2, 0], [1, 1], [2, 1], [1, 2]], 5: [[1, 0], [2, 0], [1, 1], [2, 1], [0, 2], [1, 2]] };

function writerCard(writer) {
  const levels = [
    { n: 1, type: "ongoing", text: writer.level1 },
    { n: 2, type: "instant", text: writer.level2, cost: writer.cost2 },
    { n: 3, type: "endgame", text: writer.level3, cost: writer.cost3 },
  ];
  return `<article class="writer-card">
    <div class="writer-art">${CardArt.art(writer.name)}</div>
    <div class="writer-card-header"><div class="writer-name">${esc(tc(writer.name))}</div><div class="writer-level">${esc(t("writerWord"))}</div></div>
    <div class="writer-levels">${levels.map((l) => `<div class="writer-level-box"><strong>${resourceIcon(l.type, l.type)} ${esc(t("levelN", { n: l.n }))}${l.cost ? ` · ${l.cost} ${resourceIcon("xp", "XP")}` : ""}</strong>${formatGameText(tc(l.text))}</div>`).join("")}</div>
  </article>`;
}

function squareTag(icon) {
  return `<span class="skill-tag sk-${icon.toLowerCase()}">${resourceIcon(icon === "Dexterity" ? "DexteritySq" : icon, icon)}</span>`;
}

// Card anatomy: a card with numbered markers and their legend.
const ANATOMY = {
  common: { card: () => CardFace.common(find(DATA.common, "Pirate")), marks: [[0, 5], [100, 5], [100, 30], [100, 70], [100, 95]] },
  legendary: { card: () => CardFace.legendary(find(DATA.legendary, "Snow White")), marks: [[0, 4], [100, 4], [100, 30], [0, 63], [100, 69], [0, 76], [100, 96]] },
  item: { card: () => CardFace.item(find(DATA.items, "Magic Lamp")), marks: [[0, 8], [100, 8], [0, 28], [100, 85]] },
};

function anatomy(kind, labels) {
  const a = ANATOMY[kind];
  return `<div class="anatomy"><figure class="anatomy-card">${a.card()}${a.marks.map(([x, y], i) => `<span class="mark" style="left:${x}%;top:${y}%">${i + 1}</span>`).join("")}</figure>
    <ol class="anatomy-legend">${labels.map((l) => `<li>${l}</li>`).join("")}</ol></div>`;
}

function boardsTable(L) {
  const chip = (k, n) => Array.from({ length: n }, () => `<i class="chip chip-${k}" title="${esc(k === "c" ? L.normal : L.legendary)}"></i>`).join("");
  return `<table class="boards"><thead><tr><th>${esc(L.players)}</th><th>${esc(L.groups)}</th></tr></thead><tbody>${Object.entries(BOARDS)
    .map(([n, groups]) => `<tr><td><b>${n}</b></td><td><div class="board-row">${groups.map(([c, l]) => `<span class="board-group">${chip("c", c)}${chip("l", l)}</span>`).join("")}</div></td></tr>`)
    .join("")}</tbody></table><p class="legend-line"><i class="chip chip-c"></i> ${esc(L.normal)} &nbsp; <i class="chip chip-l"></i> ${esc(L.legendary)}</p>`;
}

function render(text, L) {
  return text
    .replace(/\[\[anatomy:(\w+)\]\]/g, (_, k) => anatomy(k, L.anatomy[k]))
    .replace(/\[\[boards\]\]/g, () => boardsTable(L))
    .replace(/\[\[common:([^\]]+)\]\]/g, (_, n) => `<figure class="fig">${CardFace.common(find(DATA.common, n))}</figure>`)
    .replace(/\[\[legendary:([^\]]+)\]\]/g, (_, n) => `<figure class="fig">${CardFace.legendary(find(DATA.legendary, n))}</figure>`)
    .replace(/\[\[legendaryUp:([^\]]+)\]\]/g, (_, n) => `<figure class="fig">${CardFace.legendary({ ...find(DATA.legendary, n), upgraded: true })}</figure>`)
    .replace(/\[\[item:([^\]]+)\]\]/g, (_, n) => `<figure class="fig">${CardFace.item(find(DATA.items, n))}</figure>`)
    .replace(/\[\[quest:([^\]]+)\]\]/g, (_, n) => `<figure class="fig">${CardFace.quest(find(DATA.quests, n))}</figure>`)
    .replace(/\[\[writer:([^\]]+)\]\]/g, (_, n) => `<figure class="fig fig-writer">${writerCard(find(DATA.writers, n))}</figure>`)
    .replace(/\[\[action:(\d+)(?::([^\]]+))?\]\]/g, (_, n, who) => `<figure class="fig fig-action">${CardFace.action(DATA.actions.find((a) => a.number === Number(n)))}${who ? `<figcaption>${esc(who)}</figcaption>` : ""}</figure>`)
    .replace(/\[\[icon:(\w+)\]\]/g, (_, k) => resourceIcon(k, k))
    .replace(/\[\[tag:(\w+)\]\]/g, (_, k) => squareTag(k));
}

// ---------------------------------------------------------------------------
// Texts
// ---------------------------------------------------------------------------
const RULES = {
  en: {
    title: "Rules of the game",
    kicker: "Once Upon a Time · 2 to 5 players",
    toc: "Contents",
    players: "Players",
    groups: "Groups revealed each round",
    normal: "Normal character",
    legendary: "Legendary character",
    anatomy: {
      common: ["Skill tags (square, top left): Charm, Strength, Cunning, Intelligence.", "Name of the character.", "Illustration.", "Effect, with its type icon.", "Good or Bad, in its own band."],
      legendary: ["Skill tags.", "Name and “Legendary”.", "Illustration.", "Base effect, active as soon as you take the card.", "Upgrade cost in XP.", "Upgraded effect (replaces the base effect).", "Good or Bad."],
      item: ["Skill tags.", "Name of the Item.", "Price in coins.", "Effect."],
    },
    sections: [
      ["goal", "The story", `<p>You are storytellers. Round after round you gather the heroes, villains and treasures of the classic tales into your own story, and you complete Quests. After <b>8 rounds</b>, the storyteller with the most <b>Victory Points</b> [[icon:vp]] wins.</p>
      <p>The heart of the game is your hand of <b>Action cards</b>, numbered 1 to 12 like the chapters of a book. A high chapter lets you choose first; a low chapter gives a stronger effect. Every chapter you play is gone, so choose wisely when to spend it.</p>`],
      ["components", "The cards", `<p>Every character and Item shows the same elements:</p>
      [[anatomy:common]]
      [[anatomy:legendary]]
      [[anatomy:item]]
      <p><b>Quest cards</b> score at the end of the game. <b>Writer cards</b> give each player a personal power that grows over three levels. <b>Action cards</b> are pages of a book: their chapter number sets the turn order, their effect is resolved during your turn.</p>
      <div class="fig-row">[[quest:The Midnight Ball]][[writer:Charles Perrault]][[action:3]]</div>
      <p>The four skills are <b>Charm</b> [[tag:Charm]], <b>Strength</b> [[tag:Strength]], <b>Cunning</b> [[tag:Dexterity]] and <b>Intelligence</b> [[tag:Intelligence]]. Many Quests and effects count them. A square <b>Tag token</b> counts as one icon of its type.</p>
      <p>Effects have four types: [[icon:instant]] <b>Instant</b> (once, when you take the card), [[icon:activation]] <b>Activation</b> (each time an effect activates it), [[icon:ongoing]] <b>Ongoing</b> (always true) and [[icon:endgame]] <b>Game End</b> (scored at the end).</p>`],
      ["setup", "Setup", `<ol>
        <li>Shuffle the Normal characters and the Legendary characters into two separate decks.</li>
        <li>Shuffle the Items and reveal <b>1 + the number of players</b>. Shuffle the Quests and reveal <b>2 + the number of players</b>.</li>
        <li>Each player takes the 12 Action cards of one colour, shuffles them, draws <b>5</b> into their hand and places the other <b>7</b> face down: this is their Action deck.</li>
        <li>Each player takes <b>2 coins</b> [[icon:coins]] and a Writer (dealt at random, or chosen), at level 1.</li>
        <li>Place your Action deck to the left of your Writer, against the notch: it is the book you are writing.</li>
        <li>Put the board in the middle, on the side for your number of players. Choose a first player at random.</li>
      </ol>`],
      ["round", "A round", `<h3>1. Reveal the groups</h3>
      <p>Reveal Normal and Legendary characters under the spaces of the board to form the groups shown below. There is always <b>one group more than there are players</b>.</p>
      [[boards]]
      <h3>2. Play an Action card</h3>
      <p>Starting with the first player and going clockwise, everyone plays one Action card face up. The <b>highest chapter plays first</b>, then the next, and so on. If two players play the same chapter, the one closest to the first player (clockwise) goes first. Some effects add to your chapter (Queen of Hearts, Carlo Collodi).</p>
      <div class="example"><b>Example.</b> Marc plays chapter 10, Léa chapter 7 and Sofia chapter 4. Marc plays first, then Léa, then Sofia: Sofia will get the last group, but her chapter 4 activates all her cards and upgrades a Legendary for free.
      <div class="fig-row">[[action:10:Marc]][[action:7:Léa]][[action:4:Sofia]]</div></div>
      <h3>3. Your turn</h3>
      <ol>
        <li><b>Take a group.</b> Put all its cards in front of you (your tableau). Their [[icon:instant]] effects happen now.</li>
        <li><b>Buy one Item</b> if you wish, by paying its price in coins.</li>
        <li><b>Resolve your Action card.</b> Coins, XP, Quests, activations or free upgrades.</li>
        <li><b>Place your XP</b> [[icon:xp]]: each XP you gain goes on a free star space, between two levels of your Writer or of a Legendary character not yet upgraded. Placed XP never moves. When all the spaces of a step are filled (the number of spaces is the cost), the card moves up at once.</li>
        <li>Your turn ends; the next player in the turn order plays.</li>
      </ol>
      <div class="example"><b>Example of a turn.</b> Léa played chapter 7 (“Activate all + 2 coins”). She takes the group with the Dwarf and the Mice: the Mice give her a Tag token at once. She buys nothing. Then she resolves her chapter: she activates all her cards — the Dwarf gives her 1 coin — and gains 2 coins.
      <div class="fig-row">[[common:Dwarf]][[common:Mice]][[action:7]]</div></div>
      <h3>4. End of the round</h3>
      <ul>
        <li>Discard the cards nobody took. Refill the Items to 1 + players and the Quests to 2 + players.</li>
        <li>Each player draws <b>exactly 1 Action card</b> from their Action deck. The deck therefore shrinks by one card each round: it shows how many rounds are left.</li>
        <li>The player who played the highest chapter becomes the first player.</li>
      </ul>`],
      ["effects", "Effects in detail", `<p><b>Activate.</b> “Activate all” triggers every [[icon:activation]] effect in your tableau and Items; “Activate 1 card” only one of them. An Activation that costs something (spend coins, discard a card…) is optional.</p>
      <p><b>Take a Quest.</b> Choose one face-up Quest and keep it in front of you. It will score at the end of the game.</p>
      <p><b>Free upgrade.</b> Upgrade one Legendary character at once, without filling its star spaces (any XP already on it is discarded).</p>
      <p><b>XP not placed.</b> XP you have not placed by the end of the turn goes to the first free space: your Writer first, as long as it is not at level 3, then your Legendary characters. If no space is free, it waits in your reserve and goes to the next space that becomes free.</p>
      <p><b>Draw an Action card.</b> Draw 1 card from your Action deck, then put 1 Action card from your hand under your deck. If your Action deck is empty, the effect does nothing. This keeps the deck an exact count of the rounds left.</p>
      <h3>Legendary characters</h3>
      <p>A Legendary character starts on its base side. When its star spaces are full, it is upgraded (turn it 90° to show it): from then on, only the upgraded effect counts.</p>
      <div class="fig-row">[[legendary:Little Red Riding Hood]][[legendaryUp:Little Red Riding Hood]]</div>
      <h3>Writers</h3>
      <p>Level 1 [[icon:ongoing]] is active from the start. Level 2 [[icon:instant]] is a one-time effect when you reach it. Level 3 [[icon:endgame]] scores at the end of the game. You reach each level by filling its star spaces with XP.</p>
      <div class="fig-row">[[writer:L. Frank Baum]][[writer:Hans Christian Andersen]]</div>`],
      ["end", "End of the game and scoring", `<p>The game ends after the 8th round, when the Action decks are empty. Each player adds up:</p>
      <ul>
        <li>the Victory Points [[icon:vp]] gained during the game;</li>
        <li>their Quests [[icon:endgame]];</li>
        <li>the [[icon:endgame]] Game End effects of their characters and Items;</li>
        <li>their Writer, if it reached level 3.</li>
      </ul>
      <p>The storyteller with the most Victory Points has written the best story and wins.</p>
      <div class="example"><b>Example.</b> At the end, Sofia has 7 Charm icons. Her Quest “The Midnight Ball” gives her 2 VP per Charm: 14 VP (the maximum). Her upgraded Snow White gives 2 VP per Charm as well: another 14 VP.
      <div class="fig-row">[[quest:The Midnight Ball]][[legendaryUp:Snow White]]</div></div>`],
    ],
  },
  fr: {
    title: "Règles du jeu",
    kicker: "Once Upon a Time · 2 à 5 joueurs",
    toc: "Sommaire",
    players: "Joueurs",
    groups: "Groupes révélés à chaque manche",
    normal: "Personnage normal",
    legendary: "Personnage légendaire",
    anatomy: {
      common: ["Tags de compétence (carrés, en haut à gauche) : Charme, Force, Ruse, Intelligence.", "Nom du personnage.", "Illustration.", "Effet, avec l’icône de son type.", "Gentil ou Méchant, dans son propre bandeau."],
      legendary: ["Tags de compétence.", "Nom et mention « Légendaire ».", "Illustration.", "Effet de base, actif dès que vous prenez la carte.", "Coût d’amélioration en XP.", "Effet amélioré (remplace l’effet de base).", "Gentil ou Méchant."],
      item: ["Tags de compétence.", "Nom de l’Objet.", "Prix en pièces.", "Effet."],
    },
    sections: [
      ["goal", "L’histoire", `<p>Vous êtes des conteurs. Manche après manche, vous réunissez dans votre histoire les héros, les méchants et les trésors des contes classiques, et vous accomplissez des Quêtes. Après <b>8 manches</b>, le conteur qui a le plus de <b>Points de Victoire</b> [[icon:vp]] l’emporte.</p>
      <p>Le cœur du jeu, c’est votre main de <b>cartes Action</b>, numérotées de 1 à 12 comme les chapitres d’un livre. Un grand chapitre vous fait choisir en premier ; un petit chapitre donne un effet plus fort. Chaque chapitre joué est perdu : choisissez bien quand le dépenser.</p>`],
      ["components", "Les cartes", `<p>Chaque personnage et chaque Objet présente les mêmes éléments :</p>
      [[anatomy:common]]
      [[anatomy:legendary]]
      [[anatomy:item]]
      <p>Les <b>cartes Quête</b> rapportent des points en fin de partie. Les <b>cartes Écrivain</b> donnent à chaque joueur un pouvoir personnel qui grandit sur trois niveaux. Les <b>cartes Action</b> sont des pages de livre : leur numéro de chapitre fixe l’ordre du tour, leur effet se résout pendant votre tour.</p>
      <div class="fig-row">[[quest:The Midnight Ball]][[writer:Charles Perrault]][[action:3]]</div>
      <p>Les quatre compétences sont le <b>Charme</b> [[tag:Charm]], la <b>Force</b> [[tag:Strength]], la <b>Ruse</b> [[tag:Dexterity]] et l’<b>Intelligence</b> [[tag:Intelligence]]. Beaucoup de Quêtes et d’effets les comptent. Un <b>jeton Tag</b> carré compte comme une icône de son type.</p>
      <p>Les effets sont de quatre types : [[icon:instant]] <b>Instantané</b> (une fois, quand vous prenez la carte), [[icon:activation]] <b>Activation</b> (chaque fois qu’un effet l’active), [[icon:ongoing]] <b>Permanent</b> (toujours valable) et [[icon:endgame]] <b>Fin de partie</b> (compté à la fin).</p>`],
      ["setup", "Mise en place", `<ol>
        <li>Mélangez les personnages Normaux et les personnages Légendaires en deux pioches séparées.</li>
        <li>Mélangez les Objets et révélez-en <b>1 + le nombre de joueurs</b>. Mélangez les Quêtes et révélez-en <b>2 + le nombre de joueurs</b>.</li>
        <li>Chaque joueur prend les 12 cartes Action d’une couleur, les mélange, en pioche <b>5</b> et pose les <b>7</b> autres face cachée : c’est sa pioche Action.</li>
        <li>Chaque joueur prend <b>2 pièces</b> [[icon:coins]] et un Écrivain (distribué au hasard ou choisi), au niveau 1.</li>
        <li>Posez votre pioche Action à gauche de votre Écrivain, contre l’encoche : c’est le livre que vous êtes en train d’écrire.</li>
        <li>Placez le plateau au centre, sur la face qui correspond à votre nombre de joueurs. Désignez un premier joueur au hasard.</li>
      </ol>`],
      ["round", "Une manche", `<h3>1. Révéler les groupes</h3>
      <p>Révélez des personnages Normaux et Légendaires sous les emplacements du plateau pour former les groupes ci-dessous. Il y a toujours <b>un groupe de plus que de joueurs</b>.</p>
      [[boards]]
      <h3>2. Jouer une carte Action</h3>
      <p>En commençant par le premier joueur, dans le sens horaire, chacun joue une carte Action face visible. Le <b>plus grand chapitre joue en premier</b>, puis le suivant, etc. Si deux joueurs jouent le même chapitre, celui qui est le plus proche du premier joueur (sens horaire) passe devant. Certains effets augmentent votre chapitre (la Reine de cœur, Carlo Collodi).</p>
      <div class="example"><b>Exemple.</b> Marc joue le chapitre 10, Léa le 7 et Sofia le 4. Marc joue en premier, puis Léa, puis Sofia : Sofia aura le dernier groupe, mais son chapitre 4 active toutes ses cartes et améliore gratuitement un Légendaire.
      <div class="fig-row">[[action:10:Marc]][[action:7:Léa]][[action:4:Sofia]]</div></div>
      <h3>3. Votre tour</h3>
      <ol>
        <li><b>Prenez un groupe.</b> Posez toutes ses cartes devant vous (votre tableau). Leurs effets [[icon:instant]] s’appliquent tout de suite.</li>
        <li><b>Achetez un Objet</b> si vous le souhaitez, en payant son prix en pièces.</li>
        <li><b>Résolvez votre carte Action.</b> Pièces, XP, Quêtes, activations ou améliorations gratuites.</li>
        <li><b>Placez votre XP</b> [[icon:xp]] : chaque XP gagné se pose sur une case étoile libre, entre deux niveaux de votre Écrivain ou d’un personnage Légendaire pas encore amélioré. Un XP posé ne peut plus être déplacé. Quand toutes les cases d’une étape sont remplies (le nombre de cases est le coût), la carte passe aussitôt au niveau suivant.</li>
        <li>Votre tour se termine ; le joueur suivant dans l’ordre du tour joue.</li>
      </ol>
      <div class="example"><b>Exemple de tour.</b> Léa a joué le chapitre 7 (« Tout activer + 2 pièces »). Elle prend le groupe avec le Nain et les Souris : les Souris lui donnent tout de suite un jeton Tag. Elle n’achète rien. Puis elle résout son chapitre : elle active toutes ses cartes — le Nain lui rapporte 1 pièce — et gagne 2 pièces.
      <div class="fig-row">[[common:Dwarf]][[common:Mice]][[action:7]]</div></div>
      <h3>4. Fin de la manche</h3>
      <ul>
        <li>Défaussez les cartes que personne n’a prises. Complétez les Objets jusqu’à 1 + joueurs et les Quêtes jusqu’à 2 + joueurs.</li>
        <li>Chaque joueur pioche <b>exactement 1 carte Action</b> dans sa pioche Action. La pioche diminue donc d’une carte par manche : elle indique combien de manches il reste.</li>
        <li>Le joueur qui a joué le plus grand chapitre devient premier joueur.</li>
      </ul>`],
      ["effects", "Les effets en détail", `<p><b>Activer.</b> « Tout activer » déclenche tous les effets [[icon:activation]] de votre tableau et de vos Objets ; « Activer 1 carte » un seul d’entre eux. Une Activation qui coûte quelque chose (dépenser des pièces, défausser une carte…) est facultative.</p>
      <p><b>Prendre une Quête.</b> Choisissez une Quête visible et gardez-la devant vous. Elle rapportera des points en fin de partie.</p>
      <p><b>Amélioration gratuite.</b> Améliorez aussitôt un personnage Légendaire, sans remplir ses cases étoile (l’XP déjà posé dessus est défaussé).</p>
      <p><b>XP non placé.</b> L’XP que vous n’avez pas placé à la fin du tour va sur le premier emplacement libre : d’abord votre Écrivain, tant qu’il n’est pas au niveau 3, puis vos personnages Légendaires. S’il n’y a aucune case libre, il attend dans votre réserve et ira sur la prochaine case qui se libère.</p>
      <p><b>Piocher une carte Action.</b> Piochez 1 carte de votre pioche Action, puis remettez 1 carte Action de votre main sous votre pioche. Si votre pioche est vide, l’effet ne fait rien. Ainsi, la pioche compte toujours exactement les manches restantes.</p>
      <h3>Personnages légendaires</h3>
      <p>Un personnage Légendaire commence sur sa face de base. Quand ses cases étoile sont pleines, il est amélioré (tournez la carte de 90° pour le montrer) : dès lors, seul l’effet amélioré compte.</p>
      <div class="fig-row">[[legendary:Little Red Riding Hood]][[legendaryUp:Little Red Riding Hood]]</div>
      <h3>Écrivains</h3>
      <p>Le niveau 1 [[icon:ongoing]] est actif dès le début. Le niveau 2 [[icon:instant]] donne un effet unique au moment où vous l’atteignez. Le niveau 3 [[icon:endgame]] rapporte des points en fin de partie. On atteint chaque niveau en remplissant ses cases étoile avec de l’XP.</p>
      <div class="fig-row">[[writer:L. Frank Baum]][[writer:Hans Christian Andersen]]</div>`],
      ["end", "Fin de partie et décompte", `<p>La partie se termine après la 8e manche, quand les pioches Action sont vides. Chaque joueur additionne :</p>
      <ul>
        <li>les Points de Victoire [[icon:vp]] gagnés pendant la partie ;</li>
        <li>ses Quêtes [[icon:endgame]] ;</li>
        <li>les effets [[icon:endgame]] Fin de partie de ses personnages et Objets ;</li>
        <li>son Écrivain, s’il a atteint le niveau 3.</li>
      </ul>
      <p>Le conteur qui a le plus de Points de Victoire a écrit la plus belle histoire et gagne la partie.</p>
      <div class="example"><b>Exemple.</b> À la fin, Sofia a 7 icônes Charme. Sa Quête « Le Bal de minuit » lui donne 2 PV par Charme : 14 PV (le maximum). Sa Blanche-Neige améliorée donne aussi 2 PV par Charme : encore 14 PV.
      <div class="fig-row">[[quest:The Midnight Ball]][[legendaryUp:Snow White]]</div></div>`],
    ],
  },
  it: {
    title: "Regole del gioco",
    kicker: "Once Upon a Time · da 2 a 5 giocatori",
    toc: "Indice",
    players: "Giocatori",
    groups: "Gruppi rivelati a ogni round",
    normal: "Personaggio normale",
    legendary: "Personaggio leggendario",
    anatomy: {
      common: ["Tag di abilità (quadrati, in alto a sinistra): Fascino, Forza, Astuzia, Intelligenza.", "Nome del personaggio.", "Illustrazione.", "Effetto, con l’icona del suo tipo.", "Buono o Cattivo, nella sua fascia."],
      legendary: ["Tag di abilità.", "Nome e dicitura «Leggendaria».", "Illustrazione.", "Effetto base, attivo appena prendi la carta.", "Costo del potenziamento in XP.", "Effetto potenziato (sostituisce quello base).", "Buono o Cattivo."],
      item: ["Tag di abilità.", "Nome dell’Oggetto.", "Prezzo in monete.", "Effetto."],
    },
    sections: [
      ["goal", "La storia", `<p>Siete narratori. Round dopo round riunite nella vostra storia gli eroi, i cattivi e i tesori delle fiabe classiche, e completate Missioni. Dopo <b>8 round</b>, vince il narratore con più <b>Punti Vittoria</b> [[icon:vp]].</p>
      <p>Il cuore del gioco è la tua mano di <b>carte Azione</b>, numerate da 1 a 12 come i capitoli di un libro. Un capitolo alto ti fa scegliere per primo; un capitolo basso dà un effetto più forte. Ogni capitolo giocato è perso: scegli bene quando usarlo.</p>`],
      ["components", "Le carte", `<p>Ogni personaggio e ogni Oggetto mostra gli stessi elementi:</p>
      [[anatomy:common]]
      [[anatomy:legendary]]
      [[anatomy:item]]
      <p>Le <b>carte Missione</b> danno punti a fine partita. Le <b>carte Scrittore</b> danno a ogni giocatore un potere personale che cresce su tre livelli. Le <b>carte Azione</b> sono pagine di un libro: il numero del capitolo decide l’ordine di turno, il loro effetto si risolve durante il tuo turno.</p>
      <div class="fig-row">[[quest:The Midnight Ball]][[writer:Charles Perrault]][[action:3]]</div>
      <p>Le quattro abilità sono <b>Fascino</b> [[tag:Charm]], <b>Forza</b> [[tag:Strength]], <b>Astuzia</b> [[tag:Dexterity]] e <b>Intelligenza</b> [[tag:Intelligence]]. Molte Missioni ed effetti le contano. Un <b>segnalino Tag</b> quadrato conta come un’icona del suo tipo.</p>
      <p>Gli effetti sono di quattro tipi: [[icon:instant]] <b>Istantaneo</b> (una volta, quando prendi la carta), [[icon:activation]] <b>Attivazione</b> (ogni volta che un effetto la attiva), [[icon:ongoing]] <b>Permanente</b> (sempre valido) e [[icon:endgame]] <b>Fine partita</b> (contato alla fine).</p>`],
      ["setup", "Preparazione", `<ol>
        <li>Mescola i personaggi Normali e i personaggi Leggendari in due mazzi separati.</li>
        <li>Mescola gli Oggetti e rivelane <b>1 + il numero di giocatori</b>. Mescola le Missioni e rivelane <b>2 + il numero di giocatori</b>.</li>
        <li>Ogni giocatore prende le 12 carte Azione di un colore, le mescola, ne pesca <b>5</b> e mette le altre <b>7</b> coperte: è il suo mazzo Azione.</li>
        <li>Ogni giocatore prende <b>2 monete</b> [[icon:coins]] e uno Scrittore (a caso o scelto), al livello 1.</li>
        <li>Metti il tuo mazzo Azione a sinistra del tuo Scrittore, contro la tacca: è il libro che stai scrivendo.</li>
        <li>Metti la plancia al centro, sul lato adatto al vostro numero di giocatori. Scegliete a caso il primo giocatore.</li>
      </ol>`],
      ["round", "Un round", `<h3>1. Rivelare i gruppi</h3>
      <p>Rivela personaggi Normali e Leggendari sotto gli spazi della plancia per formare i gruppi qui sotto. C’è sempre <b>un gruppo in più rispetto ai giocatori</b>.</p>
      [[boards]]
      <h3>2. Giocare una carta Azione</h3>
      <p>A partire dal primo giocatore, in senso orario, ognuno gioca una carta Azione scoperta. Il <b>capitolo più alto gioca per primo</b>, poi il successivo, e così via. Se due giocatori giocano lo stesso capitolo, passa prima quello più vicino al primo giocatore (in senso orario). Alcuni effetti aumentano il tuo capitolo (la Regina di cuori, Carlo Collodi).</p>
      <div class="example"><b>Esempio.</b> Marco gioca il capitolo 10, Lea il 7 e Sofia il 4. Marco gioca per primo, poi Lea, poi Sofia: Sofia avrà l’ultimo gruppo, ma il suo capitolo 4 attiva tutte le sue carte e potenzia gratis una Leggendaria.
      <div class="fig-row">[[action:10:Marco]][[action:7:Lea]][[action:4:Sofia]]</div></div>
      <h3>3. Il tuo turno</h3>
      <ol>
        <li><b>Prendi un gruppo.</b> Metti tutte le sue carte davanti a te (il tuo tableau). I loro effetti [[icon:instant]] si applicano subito.</li>
        <li><b>Compra un Oggetto</b> se vuoi, pagando il suo prezzo in monete.</li>
        <li><b>Risolvi la tua carta Azione.</b> Monete, XP, Missioni, attivazioni o potenziamenti gratis.</li>
        <li><b>Metti i tuoi XP</b> [[icon:xp]]: ogni XP ottenuto va su una casella stella libera, tra due livelli del tuo Scrittore o di un personaggio Leggendario non ancora potenziato. Un XP posato non si sposta più. Quando tutte le caselle di un passaggio sono piene (il numero di caselle è il costo), la carta sale subito di livello.</li>
        <li>Il tuo turno finisce; gioca il giocatore successivo nell’ordine di turno.</li>
      </ol>
      <div class="example"><b>Esempio di turno.</b> Lea ha giocato il capitolo 7 («Attiva tutto + 2 monete»). Prende il gruppo con il Nano e i Topolini: i Topolini le danno subito un segnalino Tag. Non compra nulla. Poi risolve il suo capitolo: attiva tutte le sue carte — il Nano le dà 1 moneta — e ottiene 2 monete.
      <div class="fig-row">[[common:Dwarf]][[common:Mice]][[action:7]]</div></div>
      <h3>4. Fine del round</h3>
      <ul>
        <li>Scarta le carte che nessuno ha preso. Completa gli Oggetti fino a 1 + giocatori e le Missioni fino a 2 + giocatori.</li>
        <li>Ogni giocatore pesca <b>esattamente 1 carta Azione</b> dal suo mazzo Azione. Il mazzo cala quindi di una carta per round: indica quanti round restano.</li>
        <li>Chi ha giocato il capitolo più alto diventa il primo giocatore.</li>
      </ul>`],
      ["effects", "Gli effetti nel dettaglio", `<p><b>Attivare.</b> «Attiva tutto» fa scattare tutti gli effetti [[icon:activation]] del tuo tableau e dei tuoi Oggetti; «Attiva 1 carta» solo uno di essi. Un’Attivazione che costa qualcosa (spendere monete, scartare una carta…) è facoltativa.</p>
      <p><b>Prendere una Missione.</b> Scegli una Missione scoperta e tienila davanti a te. Darà punti a fine partita.</p>
      <p><b>Potenziamento gratis.</b> Potenzia subito un personaggio Leggendario, senza riempire le sue caselle stella (gli XP già posati su di esso vengono scartati).</p>
      <p><b>XP non piazzati.</b> Gli XP che non hai piazzato alla fine del turno vanno sul primo spazio libero: prima il tuo Scrittore, finché non è al livello 3, poi i tuoi personaggi Leggendari. Se non c’è nessuna casella libera, restano nella tua riserva e andranno sulla prossima casella che si libera.</p>
      <p><b>Pescare una carta Azione.</b> Pesca 1 carta dal tuo mazzo Azione, poi rimetti 1 carta Azione dalla mano sotto il mazzo. Se il mazzo è vuoto, l’effetto non fa nulla. Così il mazzo conta sempre esattamente i round rimasti.</p>
      <h3>Personaggi leggendari</h3>
      <p>Un personaggio Leggendario inizia sul lato base. Quando le sue caselle stella sono piene, è potenziato (ruota la carta di 90° per mostrarlo): da quel momento conta solo l’effetto potenziato.</p>
      <div class="fig-row">[[legendary:Little Red Riding Hood]][[legendaryUp:Little Red Riding Hood]]</div>
      <h3>Scrittori</h3>
      <p>Il livello 1 [[icon:ongoing]] è attivo fin dall’inizio. Il livello 2 [[icon:instant]] dà un effetto unico quando lo raggiungi. Il livello 3 [[icon:endgame]] dà punti a fine partita. Si raggiunge ogni livello riempiendo le sue caselle stella con XP.</p>
      <div class="fig-row">[[writer:L. Frank Baum]][[writer:Hans Christian Andersen]]</div>`],
      ["end", "Fine della partita e punteggio", `<p>La partita finisce dopo l’8° round, quando i mazzi Azione sono vuoti. Ogni giocatore somma:</p>
      <ul>
        <li>i Punti Vittoria [[icon:vp]] ottenuti durante la partita;</li>
        <li>le sue Missioni [[icon:endgame]];</li>
        <li>gli effetti [[icon:endgame]] Fine partita dei suoi personaggi e Oggetti;</li>
        <li>il suo Scrittore, se ha raggiunto il livello 3.</li>
      </ul>
      <p>Il narratore con più Punti Vittoria ha scritto la storia più bella e vince.</p>
      <div class="example"><b>Esempio.</b> Alla fine Sofia ha 7 icone Fascino. La sua Missione «Il Ballo di Mezzanotte» le dà 2 PV per Fascino: 14 PV (il massimo). La sua Biancaneve potenziata dà anch’essa 2 PV per Fascino: altri 14 PV.
      <div class="fig-row">[[quest:The Midnight Ball]][[legendaryUp:Snow White]]</div></div>`],
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

window.Rules = { render: build };
// cards.js uses these helpers as globals; on the stand-alone page app.js is not loaded.
for (const [name, fn] of Object.entries({ esc, resourceIcon, formatGameText, iconAmount, printedIcons, textIconAmount })) {
  if (typeof window[name] !== "function") window[name] = fn;
}

// Stand-alone page (rules.html)
if (document.body.classList.contains("rules-body")) {
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
