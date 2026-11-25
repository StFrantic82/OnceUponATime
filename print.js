// Once Upon a Time — Print & Play sheets (A4), at the real size of every component.
// Open print.html?lang=fr (or en, it) and print at 100 % scale, or use the ready-made PDFs.
const DATA = window.GAME_DATA;
const MM = 96 / 25.4; // CSS pixels per millimetre

// ---- helpers the card faces need (the same as in the game) ----
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
// Cards use lighter icons (72 px is still above 200 dpi at card size); tokens use the full ones.
function resourceIcon(kind, label, full = false) {
  const src = full ? ICON_FILES[kind] : ICON_FILES[kind].replace("assets/icons/", "assets/icons/print/");
  return `<img class="game-icon" src="${src}" alt="${esc(label)}">`;
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
    .replace(/\bCharm\b/gi, skillIcon("Charm"))
    .replace(/\bVP\b/g, resourceIcon("vp", "VP"))
    .replace(/\bXP\b/g, resourceIcon("xp", "XP"))
    .replace(/\b(?:Coins?|coins?)\b/g, resourceIcon("coins", "Coins"))
    .replace(/\u0002/g, '<span class="fc-max">').replace(/\u0003/g, "</span>")
    .replace(/\u0001SET4\u0001/g, `<span class="set4">${["Charm", "Strength", "Dexterity", "Intelligence"].map(skillIcon).join("")}</span>`);
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

// ---- texts of the sheets ----
const P = {
  en: {
    title: "Print & Play",
    intro: "Print on A4 paper at 100 % scale (“actual size”, no “fit to page”). Cut along the dotted lines. Card sizes are those of standard sleeves.",
    backsHow: "Backs: print each “Backs” page on the reverse of the pages of the same kind (long-edge duplex), or glue it on.",
    contents: "Contents",
    sizes: { common: "Common characters · 58 cards · 56 × 87 mm", legendary: "Legendary characters · 39 cards · 61 × 112 mm (French tarot)", items: "Item tiles · 35 tiles · 60 × 60 mm", quests: "Quest cards · 20 cards · 87 × 56 mm", writers: "Writer tiles · 8 cards · 100 × 100 mm", actions: "Action cards · 5 sets of 12 · 41 × 63 mm", tokens: "Tokens · Tags (square, 20 mm), coins, XP, VP, first player" },
    backs: "Backs",
    tagsTitle: "Tag tokens", resTitle: "Coins and VP", xpTitle: "XP tokens (1 XP each, one per star space)", firstPlayer: "First player",
    page: "Page",
    set: "Set",
    board: "Board · group spaces · front: 2–3 players, back: 4–5 players",
    boardSide: "Board",
    boardPlayers: "{n} players",
    boardHow: "Each round, deal the revealed characters below their space: one group per space. Use the side that matches your number of players.",
    normal: "common", normals: "common", legendary: "Legendary", legendaries: "Legendary",
    itemsShown: "Items revealed", questsShown: "Quests revealed",
    yourBook: "Your book",
    yourBookHint: "Action deck",
    scorePad: "Score pad",
    scoreGame: "Game",
    scoreDate: "Date",
    scoreRounds: "Rounds: 8 □  9 □",
    scoreRows: ["Storyteller", "Writer", "VP gained during the game", "Quests", "Game End effects of characters and Items", "Writer level 3", "Total", "Rank"],
  },
  fr: {
    title: "Print & Play",
    intro: "Imprimez sur du papier A4 à l’échelle 100 % (« taille réelle », sans « ajuster à la page »). Découpez le long des pointillés. Les formats correspondent aux protège-cartes du commerce.",
    backsHow: "Dos : imprimez chaque page « Dos » au verso des pages du même type (recto verso, bord long), ou collez-la.",
    contents: "Contenu",
    sizes: { common: "Personnages communs · 58 cartes · 56 × 87 mm", legendary: "Personnages légendaires · 39 cartes · 61 × 112 mm (tarot français)", items: "Tuiles Objet · 35 tuiles · 60 × 60 mm", quests: "Cartes Quête · 20 cartes · 87 × 56 mm", writers: "Tuiles Écrivain · 8 tuiles · 100 × 100 mm", actions: "Cartes Action · 5 jeux de 12 · 41 × 63 mm", tokens: "Jetons · Tags (carrés, 20 mm), pièces, XP, PV, premier joueur" },
    backs: "Dos",
    tagsTitle: "Jetons Tag", resTitle: "Pièces et PV", xpTitle: "Jetons XP (1 XP chacun, un par case étoile)", firstPlayer: "Premier joueur",
    page: "Page",
    set: "Jeu",
    board: "Plateau · emplacements des lots · recto : 2–3 joueurs, verso : 4–5 joueurs",
    boardSide: "Plateau",
    boardPlayers: "{n} joueurs",
    boardHow: "À chaque manche, posez les personnages révélés sous leur emplacement : un lot par emplacement. Utilisez la face qui correspond à votre nombre de joueurs.",
    normal: "commune", normals: "communes", legendary: "Légendaire", legendaries: "Légendaires",
    itemsShown: "Objets révélés", questsShown: "Quêtes révélées",
    yourBook: "Votre livre",
    yourBookHint: "Pioche Action",
    scorePad: "Carnet de score",
    scoreGame: "Partie",
    scoreDate: "Date",
    scoreRounds: "Manches : 8 □  9 □",
    scoreRows: ["Conteur", "Écrivain", "PV gagnés pendant la partie", "Quêtes", "Effets Fin de partie des personnages et Objets", "Écrivain niveau 3", "Total", "Classement"],
  },
  it: {
    title: "Print & Play",
    intro: "Stampa su carta A4 in scala 100 % («dimensioni reali», senza «adatta alla pagina»). Ritaglia lungo le linee tratteggiate. I formati corrispondono alle bustine protettive in commercio.",
    backsHow: "Retri: stampa ogni pagina «Retri» sul retro delle pagine dello stesso tipo (fronte-retro, lato lungo), oppure incollala.",
    contents: "Contenuto",
    sizes: { common: "Personaggi comuni · 58 carte · 56 × 87 mm", legendary: "Personaggi leggendari · 39 carte · 61 × 112 mm (tarocco francese)", items: "Tessere Oggetto · 35 tessere · 60 × 60 mm", quests: "Carte Missione · 20 carte · 87 × 56 mm", writers: "Tessere Scrittore · 8 tessere · 100 × 100 mm", actions: "Carte Azione · 5 mazzi da 12 · 41 × 63 mm", tokens: "Segnalini · Tag (quadrati, 20 mm), monete, XP, PV, primo giocatore" },
    backs: "Retri",
    tagsTitle: "Segnalini Tag", resTitle: "Monete e PV", xpTitle: "Segnalini XP (1 XP ciascuno, uno per casella stella)", firstPlayer: "Primo giocatore",
    page: "Pagina",
    set: "Mazzo",
    board: "Plancia · spazi dei gruppi · fronte: 2–3 giocatori, retro: 4–5 giocatori",
    boardSide: "Plancia",
    boardPlayers: "{n} giocatori",
    boardHow: "A ogni round, metti i personaggi rivelati sotto il loro spazio: un gruppo per spazio. Usa il lato adatto al vostro numero di giocatori.",
    normal: "comune", normals: "comuni", legendary: "Leggendaria", legendaries: "Leggendarie",
    itemsShown: "Oggetti rivelati", questsShown: "Missioni rivelate",
    yourBook: "Il tuo libro",
    yourBookHint: "Mazzo Azione",
    scorePad: "Blocco segnapunti",
    scoreGame: "Partita",
    scoreDate: "Data",
    scoreRounds: "Round: 8 □  9 □",
    scoreRows: ["Narratore", "Scrittore", "PV ottenuti durante la partita", "Missioni", "Effetti Fine partita di personaggi e Oggetti", "Scrittore livello 3", "Totale", "Classifica"],
  },
};

const params = new URLSearchParams(location.search);
I18N.setLang(params.get("lang") || I18N.lang, false);
I18N.apply();
const L = P[I18N.lang] || P.en;
const SET_COLORS = ["#7a3a24", "#2f5d8a", "#3f7a32", "#6b4a8a", "#b5793a"];

// ---- components: [kind, mm width, mm height, native px width, render] ----
const KINDS = {
  common: { w: 56, h: 87, nw: 170, render: (c) => CardFace.common(c) },
  legendary: { w: 61, h: 112, nw: 216, render: (c) => CardFace.legendary(c, { xpSlot: true }) },
  items: { w: 60, h: 60, nw: 205, render: (c) => CardFace.item(c) },
  quests: { w: 87, h: 56, nw: 300, render: (c) => CardFace.quest(c) },
  writers: { w: 99.9, h: 99.9, nw: 410, render: (c) => writerCard(c) },
  actions: { w: 41, h: 63, nw: 150, render: (c) => `<div class="acard" style="--spine:${SET_COLORS[c.set]}">${CardFace.action(c).replace(/^<div class="acard[^"]*">/, "").replace(/<\/div>\s*$/, "")}</div>` },
};


function writerCard(writer) {
  return CardFace.writer(writer, {
    cls: "print-writer",
    notch: `<div class="book-notch"><span class="notch-label"><b>${esc(L.yourBook)}</b> · ${esc(L.yourBookHint)}</span></div>`,
  });
}

function backFace(kind, set = 0) {
  const label = { common: t("deck_common"), legendary: t("deck_legendary"), items: t("deck_items"), quests: t("deck_quests"), writers: "", actions: t("deck_actions") }[kind];
  return `<div class="card-back back-${kind}" style="--spine:${SET_COLORS[set] || "#7a3a24"}">
    <div class="back-frame">${kind === "writers" ? `<div class="back-medal">${CardArt.art("Once Upon a Time")}</div>` : `<span class="back-star">✦</span>`}<b>Once Upon<br>a Time</b>${label ? `<small>${esc(label)}</small>` : ""}<span class="back-star">✦</span></div>
  </div>`;
}

// Lay out a list of components on as many A4 sheets as needed.
function sheetsFor(kind, items, title, back = false) {
  const k = KINDS[kind];
  const cols = Math.floor(200 / k.w);
  const rows = Math.floor(280 / k.h);
  const per = cols * rows;
  const out = [];
  for (let i = 0; i < items.length; i += per) {
    const chunk = items.slice(i, i + per);
    const cells = chunk.map((item) => `<div class="cell" style="width:${k.w}mm;height:${k.h}mm" data-nw="${k.nw}">${back ? item : k.render(item)}</div>`);
    // Backs are mirrored left-right so they line up with the fronts in duplex printing.
    const grid = back
      ? Array.from({ length: Math.ceil(cells.length / cols) }, (_, r) => {
          const row = cells.slice(r * cols, r * cols + cols);
          while (row.length < cols) row.push(`<div class="cell empty" style="width:${k.w}mm;height:${k.h}mm"></div>`);
          return row.reverse().join("");
        }).join("")
      : cells.join("");
    out.push(`<section class="sheet"><header class="sheet-head">${esc(title)}</header><div class="grid" style="grid-template-columns:repeat(${cols}, ${k.w}mm)">${grid}</div></section>`);
    if (back) break; // one page of backs serves every page of that kind
  }
  return out;
}

function backsSheet(kind, set = 0, count = 0) {
  const k = KINDS[kind];
  const per = count || Math.floor(200 / k.w) * Math.floor(280 / k.h);
  return sheetsFor(kind, Array.from({ length: per }, () => backFace(kind, set)), `${L.backs} · ${L.sizes[kind].split(" · ")[0]}${kind === "actions" ? ` · ${L.set} ${set + 1}` : ""}`, true);
}

function tokenSheet() {
  const tags = ["Charm", "Strength", "Dexterity", "Intelligence"].flatMap((icon) => Array.from({ length: 9 }, () => `<div class="tok tag-tok sk-${icon.toLowerCase()}">${resourceIcon(icon === "Dexterity" ? "DexteritySq" : icon, icon, true)}</div>`));
  const round = (icon, value, n) => Array.from({ length: n }, () => `<div class="tok round-tok tok-${icon}">${resourceIcon(icon, icon, true)}<b>${value}</b></div>`);
  const res = [...round("coins", 1, 27), ...round("coins", 3, 9), ...round("vp", 1, 18), ...round("vp", 5, 9)];
  const xp = Array.from({ length: 90 }, () => `<div class="tok xp-tok">${resourceIcon("xp", "XP", true)}</div>`);
  return [
    `<section class="sheet"><header class="sheet-head">${esc(L.tagsTitle)} · 20 × 20 mm</header><div class="tok-grid">${tags.join("")}</div>
     <header class="sheet-head second">${esc(L.firstPlayer)}</header><div class="tok-grid"><div class="tok first-tok"><b>1</b><small>${esc(L.firstPlayer)}</small></div></div></section>`,
    `<section class="sheet"><header class="sheet-head">${esc(L.resTitle)} · Ø 20 mm</header><div class="tok-grid">${res.join("")}</div>
     <header class="sheet-head second">${esc(L.xpTitle)} · 10 × 10 mm</header><div class="tok-grid xp-grid">${xp.join("")}</div></section>`,
  ];
}

// Make sure nothing spills out of a card (the Good/Bad band must stay visible):
// first shrink the illustration a little, then the text.
function fitFace(face) {
  if (!face.classList.contains("fcard")) return;
  const foot = face.querySelector(".fc-foot");
  const overflows = () => (foot ? foot.offsetTop + foot.offsetHeight > face.clientHeight + 0.5 : false) || face.scrollHeight > face.clientHeight + 1;
  const art = face.querySelector(".fc-art");
  const texts = [...face.querySelectorAll(".fc-side, .fc-text")];
  if (!overflows()) return;
  const artStart = art ? art.offsetHeight : 0;
  for (let h = artStart; art && h > artStart * 0.62 && overflows(); h -= 4) art.style.height = `${h}px`;
  for (let i = 0; i < 12 && overflows(); i += 1) {
    for (const el of texts) el.style.fontSize = `${parseFloat(getComputedStyle(el).fontSize) - 0.5}px`;
  }
}

// Board: one space per group of characters. Front 2–3 players, back 4–5 players.
const BOARDS = { 2: [[1, 0], [1, 1], [2, 1]], 3: [[1, 0], [2, 0], [1, 1], [2, 1]], 4: [[1, 0], [2, 0], [1, 1], [2, 1], [1, 2]], 5: [[1, 0], [2, 0], [1, 1], [2, 1], [0, 2], [1, 2]] };

function boardSection(n) {
  const groups = BOARDS[n].map(([c, l], i) => {
    const minis = `${'<i class="mini mini-c"></i>'.repeat(c)}${'<i class="mini mini-l"></i>'.repeat(l)}`;
    const text = [c ? `${c} ${c > 1 ? L.normals : L.normal}` : "", l ? `${l} ${l > 1 ? L.legendaries : L.legendary}` : ""].filter(Boolean).join(" + ");
    return `<div class="bslot"><span class="bnum">${i + 1}</span><div class="bminis">${minis}</div><div class="btext">${esc(text)}</div><div class="barrow">▼</div></div>`;
  }).join("");
  return `<div class="bsection">
    <div class="bhead"><span class="bstar">✦</span>${esc(L.boardPlayers.replace("{n}", n))}<span class="bstar">✦</span></div>
    <div class="bslots" style="grid-template-columns:repeat(${BOARDS[n].length}, 1fr)">${groups}</div>
    <div class="bdisplays">
      <div class="bdisp">${resourceIcon("coins", "Items", true)} ${esc(L.itemsShown)} : <b>${n + 1}</b></div>
      <div class="bdisp">${resourceIcon("endgame", "Quests", true)} ${esc(L.questsShown)} : <b>${n + 2}</b></div>
    </div>
  </div>`;
}

function boardSheets() {
  return [[2, 3], [4, 5]].map(([a, b]) => `<section class="sheet board-sheet"><header class="sheet-head">${esc(L.boardSide)} · ${esc(L.boardPlayers.replace("{n}", `${a}–${b}`))}</header>
    <div class="board">
      <div class="board-title"><div class="board-art">${CardArt.art("Once Upon a Time")}</div><h2>Once Upon a Time</h2></div>
      ${boardSection(a)}
      ${boardSection(b)}
      <p class="board-how">${esc(L.boardHow)}</p>
    </div></section>`);
}

// Score pad: two games per A4 page, up to 5 storytellers.
function scoreTable() {
  const icons = [null, null, ["vp"], ["endgame"], ["endgame"], ["endgame"], null, null];
  const rows = L.scoreRows.map((label, i) => {
    const cls = i === 6 ? "srow-total" : i < 2 ? "srow-name" : i === 7 ? "srow-rank" : "";
    const ico = icons[i] ? icons[i].map((k) => resourceIcon(k, k, true)).join("") : "";
    return `<tr class="${cls}"><th>${ico}<span>${esc(label)}</span></th>${"<td></td>".repeat(5)}</tr>`;
  }).join("");
  return `<div class="score-block"><div class="score-top"><span>${esc(L.scoreGame)} n° ______</span><span>${esc(L.scoreDate)} : ____ / ____ / ________</span></div>
    <table class="score-table"><tbody>${rows}</tbody></table></div>`;
}

function scoreSheet() {
  return [`<section class="sheet score-sheet"><header class="sheet-head">${esc(L.scorePad)}</header>
    <div class="score-title"><div class="board-art">${CardArt.art("Once Upon a Time")}</div><h2>Once Upon a Time · ${esc(L.scorePad)}</h2></div>
    ${scoreTable()}${scoreTable()}</section>`];
}

function coverSheet(pages) {
  return `<section class="sheet cover">
    <div class="cover-art">${CardArt.art("Once Upon a Time")}</div>
    <h1>Once Upon a Time</h1>
    <p class="cover-kicker">${esc(L.title)}</p>
    <p>${esc(L.intro)}</p>
    <p>${esc(L.backsHow)}</p>
    <h2>${esc(L.contents)}</h2>
    <ul>${pages.map(([label, from, to]) => `<li><span>${esc(label)}</span><b>${esc(L.page)} ${from}${to > from ? `–${to}` : ""}</b></li>`).join("")}</ul>
    <p class="cover-scale"><span style="width:100mm"></span> 100 mm</p>
  </section>`;
}

function build() {
  const sections = [];
  const add = (label, sheets) => sections.push([label, sheets]);
  add(L.sizes.common, sheetsFor("common", DATA.common, L.sizes.common));
  add(`${L.backs} · ${L.sizes.common.split(" · ")[0]}`, backsSheet("common"));
  add(L.sizes.legendary, sheetsFor("legendary", DATA.legendary, L.sizes.legendary));
  add(`${L.backs} · ${L.sizes.legendary.split(" · ")[0]}`, backsSheet("legendary"));
  add(L.sizes.items, sheetsFor("items", DATA.items, L.sizes.items));
  add(`${L.backs} · ${L.sizes.items.split(" · ")[0]}`, backsSheet("items"));
  add(L.sizes.quests, sheetsFor("quests", DATA.quests, L.sizes.quests));
  add(`${L.backs} · ${L.sizes.quests.split(" · ")[0]}`, backsSheet("quests"));
  add(L.sizes.writers, sheetsFor("writers", DATA.writers, L.sizes.writers));
  add(`${L.backs} · ${L.sizes.writers.split(" · ")[0]}`, backsSheet("writers"));
  // One page per Action set (12 cards), each followed by its own coloured backs: ready for duplex.
  add(L.sizes.actions, [0, 1, 2, 3, 4].flatMap((set) => [
    ...sheetsFor("actions", DATA.actions.map((a) => ({ ...a, set })), `${L.sizes.actions} · ${L.set} ${set + 1}`),
    ...backsSheet("actions", set, DATA.actions.length),
  ]));
  add(L.board, boardSheets());
  add(L.scorePad, scoreSheet());
  add(L.sizes.tokens, tokenSheet());

  let page = 2;
  const index = sections.map(([label, sheets]) => {
    const from = page;
    page += sheets.length;
    return [label, from, page - 1];
  });
  document.querySelector("#sheets").innerHTML = coverSheet(index) + sections.flatMap(([, sheets]) => sheets).join("");

  // Draw each card at its usual on-screen size, then scale it to the exact millimetre size of its cell.
  for (const cell of document.querySelectorAll(".cell[data-nw]")) {
    const face = cell.firstElementChild;
    if (!face) continue;
    const nw = Number(cell.dataset.nw);
    const scale = (cell.getBoundingClientRect().width || parseFloat(cell.style.width) * MM) / nw;
    const nh = cell.getBoundingClientRect().height / scale;
    face.style.width = `${nw}px`;
    face.style.height = `${nh}px`;
    face.style.minHeight = "0";
    face.style.transform = `scale(${scale})`;
    fitFace(face);
  }
  document.body.dataset.ready = "1";
}

if (document.fonts && document.fonts.ready) document.fonts.ready.then(build);
else window.addEventListener("load", build);
