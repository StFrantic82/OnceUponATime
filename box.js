// Once Upon a Time — box art: square cover and box back (English, French, Italian).
// Both faces are built from the game's own illustrations and card faces.
(function () {
const TEXT = {
  en: {
    page: "Box", cover: "Cover", back: "Box back",
    by: "A game by", tagline: "Gather the heroes, villains and treasures of the classic tales into your own story.",
    players: "2–4 players", age: "Ages 14+", time: "40 min",
    pitch: "You are storytellers. Round after round, heroes, villains and treasures step out of the classic tales, and each of you weaves them into a story of your own. After 8 rounds, the finest story wins.",
    keys: [
      ["Twelve chapters, one dilemma", "A high Chapter card lets you choose first. A low one gives a stronger effect. Each can be played only once."],
      ["Tales that work together", "Combine the tags, the Good and the Bad, and the characters of the same tale to trigger combos."],
      ["A story that grows", "Upgrade your Legendary characters and your Writer with XP, buy Items and complete Adventures."],
    ],
    sceneTitle: "A round in progress",
    c1: "Play a Chapter card", c2: "Take a group of characters", c3: "Grow your story",
    contents: "Contents", list: ["62 Common characters", "43 Legendary characters", "40 Items", "25 Adventures", "8 Writers", "48 Chapter cards", "1 board", "Coins, XP, VP and Tag tokens"],
  },
  fr: {
    page: "Boîte", cover: "Couverture", back: "Dos de boîte",
    by: "Un jeu de", tagline: "Réunissez dans votre histoire les héros, les méchants et les trésors des contes classiques.",
    players: "2–4 joueurs", age: "14 ans et +", time: "40 min",
    pitch: "Vous êtes des conteurs. Manche après manche, héros, méchants et trésors sortent des contes classiques, et chacun les tisse dans sa propre histoire. Après 8 manches, la plus belle histoire l’emporte.",
    keys: [
      ["Douze chapitres, un dilemme", "Une grande carte Chapitre vous fait choisir en premier. Une petite donne un effet plus fort. Chacune ne se joue qu’une fois."],
      ["Des contes qui fonctionnent ensemble", "Combinez les tags, les Gentils et les Méchants, et les personnages d’un même conte pour déclencher des combos."],
      ["Une histoire qui grandit", "Améliorez vos personnages Légendaires et votre Écrivain avec l’XP, achetez des Objets et accomplissez des Aventures."],
    ],
    sceneTitle: "Une manche en cours",
    c1: "Jouez une carte Chapitre", c2: "Prenez un lot de personnages", c3: "Faites grandir votre histoire",
    contents: "Contenu", list: ["62 personnages Communs", "43 personnages Légendaires", "40 Objets", "25 Aventures", "8 Écrivains", "48 cartes Chapitre", "1 plateau", "Pièces, XP, PV et jetons Tag"],
  },
  it: {
    page: "Scatola", cover: "Copertina", back: "Retro della scatola",
    by: "Un gioco di", tagline: "Riunisci nella tua storia gli eroi, i cattivi e i tesori delle fiabe classiche.",
    players: "2–4 giocatori", age: "14+ anni", time: "40 min",
    pitch: "Siete dei narratori. Round dopo round, eroi, cattivi e tesori escono dalle fiabe classiche, e ognuno li intreccia nella propria storia. Dopo 8 round, vince la storia più bella.",
    keys: [
      ["Dodici capitoli, un dilemma", "Una carta Capitolo alta ti fa scegliere per primo. Una bassa dà un effetto più forte. Ognuna si gioca una sola volta."],
      ["Fiabe che funzionano insieme", "Combina i tag, i Buoni e i Cattivi e i personaggi della stessa fiaba per innescare combo."],
      ["Una storia che cresce", "Potenzia i tuoi personaggi Leggendari e il tuo Scrittore con gli XP, compra Oggetti e completa Avventure."],
    ],
    sceneTitle: "Un round in corso",
    c1: "Gioca una carta Capitolo", c2: "Prendi un gruppo di personaggi", c3: "Fai crescere la tua storia",
    contents: "Contenuto", list: ["62 personaggi Comuni", "43 personaggi Leggendari", "40 Oggetti", "25 Avventure", "8 Scrittori", "48 carte Capitolo", "1 plancia", "Monete, XP, PV e segnalini Tag"],
  },
};
const AUTHORS = "Simone Luciani & Matthieu Verdier";
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function cover(L) {
  const good = ["Alice", "Peter Pan", "Little Mermaid", "Aladin"];
  const bad = ["Captain Hook", "The Evil Queen", "The Wolf", "Queen of Hearts"];
  // Four medallions on each side of the book, on an arc.
  const arc = (names, side) => names.map((name, i) => {
    const angle = (-50 + i * 37) * (Math.PI / 180);
    const x = 500 + side * Math.cos(angle) * 345;
    const y = 566 + Math.sin(angle) * 262;
    return `<span class="medal medal-${side < 0 ? "good" : "bad"}" style="left:${x.toFixed(1)}px;top:${y.toFixed(1)}px">${CardArt.art(name)}</span>`;
  }).join("");
  return `<div class="box-face box-cover" id="boxCover">
    <div class="cover-stars"></div>
    <div class="cover-frame"></div>
    <p class="cover-by">${esc(L.by)} <b>${esc(AUTHORS)}</b></p>
    <h1 class="cover-title">Once Upon a Time</h1>
    <div class="cover-book">${CardArt.art("Once Upon a Time")}</div>
    ${arc(good, -1)}${arc(bad, 1)}
    <p class="cover-tagline">${esc(L.tagline)}</p>
    <div class="cover-badges"><span>${esc(L.players)}</span><span>${esc(L.age)}</span><span>${esc(L.time)}</span></div>
  </div>`;
}

function back(L) {
  const f = window.Rules.format;
  return `<div class="box-face box-back" id="boxBack">
    <div class="back-frame"></div>
    <header class="back-head"><h2>Once Upon a Time</h2><p>${esc(L.pitch)}</p></header>
    <ol class="back-keys">${L.keys.map(([t, d], i) => `<li><span class="key-num">${i + 1}</span><div><b>${esc(t)}</b><span>${esc(d)}</span></div></li>`).join("")}</ol>
    <section class="back-scene">
      <h3>${esc(L.sceneTitle)}</h3>
      <div class="scene-table">
        <div class="scene-row scene-groups">
          <div class="scene-group">${f("[[legendary:Alice]]")}</div>
          <div class="scene-group picked">${f("[[common:Pirate]][[common:Mice]][[legendary:Captain Hook]]")}</div>
          <div class="scene-group">${f("[[common:Dwarf]][[common:The Lost Boys]]")}</div>
          <div class="scene-shop">${f("[[item:Magic Lamp]][[quest:Neverland]]")}</div>
        </div>
        <div class="scene-row scene-player">
          <div class="scene-writer">${f("[[writer:J. M. Barrie]]")}</div>
          <div class="scene-hand">${f("[[action:10]][[action:6]][[action:3]]")}</div>
          <div class="scene-tableau">${f("[[legendaryUp:Peter Pan]][[legendary:Tinker Bell]][[common:The Lost Boys]][[item:Seven-League Boots]]")}</div>
        </div>
        <span class="callout co-1"><i>1</i>${esc(L.c1)}</span>
        <span class="callout co-2"><i>2</i>${esc(L.c2)}</span>
        <span class="callout co-3"><i>3</i>${esc(L.c3)}</span>
      </div>
    </section>
    <footer class="back-foot">
      <div class="back-contents"><b>${esc(L.contents)}</b><span>${L.list.map(esc).join(" · ")}</span></div>
      <div class="back-badges"><span>${esc(L.players)}</span><span>${esc(L.age)}</span><span>${esc(L.time)}</span></div>
      <p class="back-by">${esc(L.by)} ${esc(AUTHORS)}</p>
    </footer>
  </div>`;
}

function build() {
  const L = TEXT[I18N.lang] || TEXT.en;
  document.title = `Once Upon a Time · ${L.page}`;
  document.querySelector(".rules-home").textContent = `← ${t("home")}`;
  document.querySelector("#box").innerHTML = `<figure class="box-wrap"><figcaption>${esc(L.cover)}</figcaption>${cover(L)}</figure><figure class="box-wrap"><figcaption>${esc(L.back)}</figcaption>${back(L)}</figure>`;
}

const params = new URLSearchParams(location.search);
if (params.get("lang")) I18N.setLang(params.get("lang"), false);
I18N.apply();
build();
window.addEventListener("langchange", build);
})();
