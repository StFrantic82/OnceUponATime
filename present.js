// Once Upon a Time — the game explained step by step, like a slide deck (English, French, Italian).
// Nothing to play here: each slide shows one aspect of the game with the real card faces.
(function () {
const SLIDES = {
  en: {
    title: "The game in 16 steps", prev: "Previous", next: "Next", end: "The end", button: "Presentation",
    slides: [
      ["Once Upon a Time", "A game by Simone Luciani & Matthieu Verdier · 2 to 4 players · ages 14+ · 40 min", [
        "You are <b>storytellers</b>: you gather the heroes, villains and treasures of the classic tales into your own story.",
        "The game lasts <b>8 rounds</b>.",
        "The storyteller with the most <b>Victory Points</b> [[icon:vp]] wins."], "[[legendary:Alice]][[legendary:Captain Hook]][[item:Magic Lamp]]"],
      ["What is on the table", "The six kinds of cards", [
        "<b>Common characters</b>: small helpers, often in several copies.",
        "<b>Legendary characters</b>: the stars of the tales, which you can upgrade.",
        "<b>Items</b>: treasures you buy with coins [[icon:coins]].",
        "<b>Adventures</b>: goals that score at the end of the game.",
        "Each player also has a <b>Writer</b> and 12 <b>Chapter cards</b>."], "[[common:Dwarf]][[item:Glass Slipper]][[quest:The Midnight Ball]]"],
      ["Your Writer", "A personal power on three levels", [
        "Everyone draws 2 Writers at the start, keeps 1 and takes the coins [[icon:coins]] shown on it.",
        "Level 1 is active at once.",
        "Fill the star spaces with XP [[icon:xp]] to reach level 2, then level 3.",
        "Level 3 usually scores Victory Points at the end of the game."], "[[writer:Brothers Grimm]]"],
      ["Your Chapter cards", "The heart of the game", [
        "You have 12 Chapter cards, numbered 1 to 12: <b>4 in hand</b>, 8 in your Chapter deck.",
        "A <b>high</b> chapter lets you choose first, but its effect is weak.",
        "A <b>low</b> chapter gives a strong effect, but you choose last.",
        "A chapter you have played is gone: each one is used once."], "[[action:1]][[action:6]][[action:12]]"],
      ["A round, step 1", "Reveal the groups", [
        "Reveal Common and Legendary characters to form the groups shown on the board.",
        "There is always <b>one group more than there are players</b>: the last player still has a choice.",
        "Items and Adventures stay on display from one round to the next."], "[[boards]]"],
      ["A round, step 2", "Everyone plays a Chapter card", [
        "Starting with the first player, each player plays one Chapter card face up.",
        "You cannot play a chapter another player has already played this round.",
        "The <b>highest chapter plays first</b>, then the next one, and so on."], "[[action:10:1st]][[action:6:2nd]][[action:5:3rd]]"],
      ["A round, step 3", "Your turn", [
        "<b>Take a group</b>: its cards join your tableau, and their Instant effects [[icon:instant]] apply at once.",
        "<b>Resolve your Chapter card</b>: coins, XP, an Adventure, activations or a free upgrade.",
        "<b>Buy one Item</b> if you wish.",
        "<b>Place your XP</b> [[icon:xp]] on your Writer or on a Legendary character."], "[[common:Mice]][[common:Pirate]][[action:4]]"],
      ["A round, step 4", "End of the round", [
        "Straighten the cards you tilted.",
        "Discard the characters nobody took; refill the Items and Adventures.",
        "Everyone draws 1 Chapter card.",
        "The player who played the highest chapter becomes first player."], "[[action:11]][[action:3]]"],
      ["The four kinds of effects", "One icon each", [
        "[[icon:instant]] <b>Instant</b>: once, when you take the card.",
        "[[icon:activation]] <b>Activation</b>: each time a Chapter card or an effect activates it. Tilt the card: it is straightened at the end of the round.",
        "[[icon:ongoing]] <b>Ongoing</b>: always active while you have the card.",
        "[[icon:endgame]] <b>Game End</b>: counted at the end of the game."], "[[common:The Lost Boys]][[item:Puss’s Boots]][[legendary:Princess Jasmine]]"],
      ["Legendary characters", "Upgrade them with XP", [
        "A Legendary character starts with its <b>base effect</b>.",
        "Each XP [[icon:xp]] fills one star space. When they are all full, the card is <b>upgraded</b>.",
        "The upgraded effect is <b>added</b> to the base effect.",
        "[[icon:freeup]] A free upgrade fills all the remaining star spaces of one Legendary character at once."], "[[legendary:The Sea Witch]][[legendaryUp:The Sea Witch]]"],
      ["Items", "Treasures of the tales", [
        "On your turn you may buy <b>one</b> Item by paying its price in coins [[icon:coins]].",
        "Items carry tags and effects, like characters.",
        "Some work better with the characters of their own tale."], "[[item:Seven-League Boots]][[item:Enchanted Candelabra]][[item:Trident]]"],
      ["The five tags", "Charm, Strength, Cunning, Intelligence, Magic", [
        "[[tag:Charm]] [[tag:Strength]] [[tag:Dexterity]] [[tag:Intelligence]] [[tag:Sorcery]] Only Legendary characters and Items carry tags (plus the Sirens, with their joker tag).",
        "Many Adventures and effects count your tags: identical ones, or sets of different ones.",
        "A <b>Tag token</b> counts as one tag of the type you choose. Place it on the card that gave it.",
        "If that card leaves your tableau, its tokens are lost."], "[[legendary:Tinker Bell]][[legendary:Captain Hook]][[quest:Neverland]]"],
      ["Adventures", "Goals for the end of the game", [
        "Some Chapter cards and effects let you take one of the Adventures on display.",
        "An Adventure scores at the end of the game, according to what you have gathered.",
        "Many have steps: the more you have, the more they score."], "[[quest:The Midnight Ball]][[quest:The House of Seven]][[quest:Once Upon a Time]]"],
      ["Good and Bad", "Two sides, two styles", [
        "[[icon:Good]] [[icon:Bad]] Every character is Good or Bad; so are a few Items.",
        "Only <b>Bad</b> cards have effects against the other players.",
        "Some cards count your Good cards, your Bad cards, or pairs of both."], "[[legendary:Little Red Riding Hood]][[legendary:The Wolf]]"],
      ["Tales work together", "Cards of the same tale", [
        "“If you have X” means X is in your tableau or among your Items.",
        "Gathering the cards of one tale makes them stronger.",
        "Example: Snow White gains XP and Victory Points for each Dwarf."], "[[legendary:Snow White]][[common:Dwarf]][[quest:The House of Seven]]"],
      ["End of the game", "After 8 rounds", [
        "Add up your <b>VP tokens</b> [[icon:vp]] gained during the game,",
        "the <b>Game End</b> effects [[icon:endgame]] of your cards and Items,",
        "your <b>Adventures</b>,",
        "and your <b>Writer</b> at level 3.",
        "The highest total wins. You are ready to play!"], "[[legendaryUp:The Evil Queen]][[quest:The Midnight Ball]]"],
    ],
  },
  fr: {
    title: "Le jeu en 16 étapes", prev: "Précédent", next: "Suivant", end: "Fin", button: "Présentation",
    slides: [
      ["Once Upon a Time", "Un jeu de Simone Luciani & Matthieu Verdier · 2 à 4 joueurs · 14 ans et + · 40 min", [
        "Vous êtes des <b>conteurs</b> : vous réunissez dans votre histoire les héros, les méchants et les trésors des contes classiques.",
        "La partie dure <b>8 manches</b>.",
        "Le conteur qui a le plus de <b>Points de Victoire</b> [[icon:vp]] l’emporte."], "[[legendary:Alice]][[legendary:Captain Hook]][[item:Magic Lamp]]"],
      ["Ce qu’il y a sur la table", "Les six sortes de cartes", [
        "<b>Personnages Communs</b> : de petits alliés, souvent en plusieurs exemplaires.",
        "<b>Personnages Légendaires</b> : les vedettes des contes, que vous pouvez améliorer.",
        "<b>Objets</b> : des trésors à acheter avec des pièces [[icon:coins]].",
        "<b>Aventures</b> : des objectifs qui rapportent en fin de partie.",
        "Chaque joueur a aussi un <b>Écrivain</b> et 12 <b>cartes Chapitre</b>."], "[[common:Dwarf]][[item:Glass Slipper]][[quest:The Midnight Ball]]"],
      ["Votre Écrivain", "Un pouvoir personnel sur trois niveaux", [
        "Chacun pioche 2 Écrivains au début, en garde 1 et prend les pièces [[icon:coins]] indiquées dessus.",
        "Le niveau 1 est actif tout de suite.",
        "Remplissez les cases étoile avec de l’XP [[icon:xp]] pour atteindre le niveau 2, puis le niveau 3.",
        "Le niveau 3 rapporte en général des Points de Victoire en fin de partie."], "[[writer:Brothers Grimm]]"],
      ["Vos cartes Chapitre", "Le cœur du jeu", [
        "Vous avez 12 cartes Chapitre, numérotées de 1 à 12 : <b>4 en main</b>, 8 dans votre pioche Chapitre.",
        "Un <b>grand</b> chapitre vous fait choisir en premier, mais son effet est faible.",
        "Un <b>petit</b> chapitre donne un effet fort, mais vous choisissez en dernier.",
        "Un chapitre joué est perdu : chacun ne sert qu’une fois."], "[[action:1]][[action:6]][[action:12]]"],
      ["Une manche, étape 1", "Révéler les lots", [
        "Révélez des personnages Communs et Légendaires pour former les lots indiqués sur le plateau.",
        "Il y a toujours <b>un lot de plus que de joueurs</b> : le dernier joueur a encore le choix.",
        "Les Objets et les Aventures restent visibles d’une manche à l’autre."], "[[boards]]"],
      ["Une manche, étape 2", "Chacun joue une carte Chapitre", [
        "En commençant par le premier joueur, chacun joue une carte Chapitre face visible.",
        "On ne peut pas jouer un chapitre déjà joué par un autre joueur cette manche.",
        "Le <b>plus grand chapitre joue en premier</b>, puis le suivant, etc."], "[[action:10:1er]][[action:6:2e]][[action:5:3e]]"],
      ["Une manche, étape 3", "Votre tour", [
        "<b>Prenez un lot</b> : ses cartes rejoignent votre tableau, et leurs effets Instantanés [[icon:instant]] s’appliquent tout de suite.",
        "<b>Résolvez votre carte Chapitre</b> : pièces, XP, Aventure, activations ou amélioration gratuite.",
        "<b>Achetez un Objet</b> si vous le souhaitez.",
        "<b>Placez votre XP</b> [[icon:xp]] sur votre Écrivain ou sur un personnage Légendaire."], "[[common:Mice]][[common:Pirate]][[action:4]]"],
      ["Une manche, étape 4", "Fin de la manche", [
        "Redressez les cartes que vous avez inclinées.",
        "Défaussez les personnages que personne n’a pris ; complétez les Objets et les Aventures.",
        "Chacun pioche 1 carte Chapitre.",
        "Le joueur qui a joué le plus grand chapitre devient premier joueur."], "[[action:11]][[action:3]]"],
      ["Les quatre types d’effets", "Une icône chacun", [
        "[[icon:instant]] <b>Instantané</b> : une fois, quand vous prenez la carte.",
        "[[icon:activation]] <b>Activation</b> : chaque fois qu’une carte Chapitre ou un effet l’active. Inclinez la carte : elle est redressée en fin de manche.",
        "[[icon:ongoing]] <b>Permanent</b> : toujours actif tant que vous avez la carte.",
        "[[icon:endgame]] <b>Fin de partie</b> : compté à la fin de la partie."], "[[common:The Lost Boys]][[item:Puss’s Boots]][[legendary:Princess Jasmine]]"],
      ["Les personnages Légendaires", "Améliorez-les avec de l’XP", [
        "Un personnage Légendaire commence avec son <b>effet de base</b>.",
        "Chaque XP [[icon:xp]] remplit une case étoile. Quand elles sont toutes pleines, la carte est <b>améliorée</b>.",
        "L’effet amélioré <b>s’ajoute</b> à l’effet de base.",
        "[[icon:freeup]] Une amélioration gratuite remplit d’un coup toutes les cases étoile restantes d’un personnage Légendaire."], "[[legendary:The Sea Witch]][[legendaryUp:The Sea Witch]]"],
      ["Les Objets", "Les trésors des contes", [
        "À votre tour, vous pouvez acheter <b>un</b> Objet en payant son prix en pièces [[icon:coins]].",
        "Les Objets portent des tags et des effets, comme les personnages.",
        "Certains fonctionnent mieux avec les personnages de leur conte."], "[[item:Seven-League Boots]][[item:Enchanted Candelabra]][[item:Trident]]"],
      ["Les cinq tags", "Charme, Force, Ruse, Intelligence, Magie", [
        "[[tag:Charm]] [[tag:Strength]] [[tag:Dexterity]] [[tag:Intelligence]] [[tag:Sorcery]] Seuls les personnages Légendaires et les Objets portent des tags (plus les Sirènes, avec leur tag joker).",
        "Beaucoup d’Aventures et d’effets comptent vos tags : identiques, ou en séries de tags différents.",
        "Un <b>jeton Tag</b> compte comme un tag du type de votre choix. Placez-le sur la carte qui vous l’a fait gagner.",
        "Si cette carte quitte votre tableau, ses jetons sont perdus."], "[[legendary:Tinker Bell]][[legendary:Captain Hook]][[quest:Neverland]]"],
      ["Les Aventures", "Des objectifs pour la fin de partie", [
        "Certaines cartes Chapitre et certains effets vous font prendre une des Aventures visibles.",
        "Une Aventure rapporte en fin de partie, selon ce que vous avez réuni.",
        "Beaucoup ont des paliers : plus vous en avez, plus elles rapportent."], "[[quest:The Midnight Ball]][[quest:The House of Seven]][[quest:Once Upon a Time]]"],
      ["Gentils et Méchants", "Deux camps, deux styles", [
        "[[icon:Good]] [[icon:Bad]] Chaque personnage est Gentil ou Méchant ; quelques Objets aussi.",
        "Seules les cartes <b>Méchantes</b> ont des effets contre les autres joueurs.",
        "Certaines cartes comptent vos cartes Gentilles, vos cartes Méchantes, ou les paires des deux."], "[[legendary:Little Red Riding Hood]][[legendary:The Wolf]]"],
      ["Les contes fonctionnent ensemble", "Les cartes d’un même conte", [
        "« Si vous avez X » veut dire que X est dans votre tableau ou parmi vos Objets.",
        "Réunir les cartes d’un même conte les rend plus fortes.",
        "Exemple : Blanche-Neige gagne de l’XP et des Points de Victoire pour chaque Nain."], "[[legendary:Snow White]][[common:Dwarf]][[quest:The House of Seven]]"],
      ["La fin de la partie", "Après 8 manches", [
        "Additionnez vos <b>jetons PV</b> [[icon:vp]] gagnés pendant la partie,",
        "les effets <b>Fin de partie</b> [[icon:endgame]] de vos cartes et de vos Objets,",
        "vos <b>Aventures</b>,",
        "et votre <b>Écrivain</b> au niveau 3.",
        "Le plus grand total l’emporte. Vous êtes prêts à jouer !"], "[[legendaryUp:The Evil Queen]][[quest:The Midnight Ball]]"],
    ],
  },
  it: {
    title: "Il gioco in 16 tappe", prev: "Indietro", next: "Avanti", end: "Fine", button: "Presentazione",
    slides: [
      ["Once Upon a Time", "Un gioco di Simone Luciani & Matthieu Verdier · da 2 a 4 giocatori · 14+ anni · 40 min", [
        "Siete dei <b>narratori</b>: riunite nella vostra storia gli eroi, i cattivi e i tesori delle fiabe classiche.",
        "La partita dura <b>8 round</b>.",
        "Vince il narratore con più <b>Punti Vittoria</b> [[icon:vp]]."], "[[legendary:Alice]][[legendary:Captain Hook]][[item:Magic Lamp]]"],
      ["Che cosa c’è sul tavolo", "I sei tipi di carte", [
        "<b>Personaggi Comuni</b>: piccoli alleati, spesso in più copie.",
        "<b>Personaggi Leggendari</b>: le stelle delle fiabe, che puoi potenziare.",
        "<b>Oggetti</b>: tesori da comprare con le monete [[icon:coins]].",
        "<b>Avventure</b>: obiettivi che danno punti a fine partita.",
        "Ogni giocatore ha anche uno <b>Scrittore</b> e 12 <b>carte Capitolo</b>."], "[[common:Dwarf]][[item:Glass Slipper]][[quest:The Midnight Ball]]"],
      ["Il tuo Scrittore", "Un potere personale su tre livelli", [
        "All’inizio ognuno pesca 2 Scrittori, ne tiene 1 e prende le monete [[icon:coins]] indicate.",
        "Il livello 1 è attivo subito.",
        "Riempi le caselle stella con XP [[icon:xp]] per raggiungere il livello 2, poi il livello 3.",
        "Il livello 3 di solito dà Punti Vittoria a fine partita."], "[[writer:Brothers Grimm]]"],
      ["Le tue carte Capitolo", "Il cuore del gioco", [
        "Hai 12 carte Capitolo, numerate da 1 a 12: <b>4 in mano</b>, 8 nel tuo mazzo Capitolo.",
        "Un capitolo <b>alto</b> ti fa scegliere per primo, ma il suo effetto è debole.",
        "Un capitolo <b>basso</b> dà un effetto forte, ma scegli per ultimo.",
        "Un capitolo giocato è perso: ognuno serve una sola volta."], "[[action:1]][[action:6]][[action:12]]"],
      ["Un round, fase 1", "Rivelare i gruppi", [
        "Rivela personaggi Comuni e Leggendari per formare i gruppi indicati sulla plancia.",
        "C’è sempre <b>un gruppo in più rispetto ai giocatori</b>: anche l’ultimo giocatore può scegliere.",
        "Oggetti e Avventure restano visibili da un round all’altro."], "[[boards]]"],
      ["Un round, fase 2", "Ognuno gioca una carta Capitolo", [
        "A partire dal primo giocatore, ognuno gioca una carta Capitolo scoperta.",
        "Non puoi giocare un capitolo già giocato da un altro giocatore in questo round.",
        "Il <b>capitolo più alto gioca per primo</b>, poi il successivo, e così via."], "[[action:10:1º]][[action:6:2º]][[action:5:3º]]"],
      ["Un round, fase 3", "Il tuo turno", [
        "<b>Prendi un gruppo</b>: le sue carte entrano nel tuo tableau e i loro effetti Istantanei [[icon:instant]] si applicano subito.",
        "<b>Risolvi la tua carta Capitolo</b>: monete, XP, Avventura, attivazioni o potenziamento gratis.",
        "<b>Compra un Oggetto</b>, se vuoi.",
        "<b>Piazza i tuoi XP</b> [[icon:xp]] sul tuo Scrittore o su un personaggio Leggendario."], "[[common:Mice]][[common:Pirate]][[action:4]]"],
      ["Un round, fase 4", "Fine del round", [
        "Raddrizza le carte che hai inclinato.",
        "Scarta i personaggi che nessuno ha preso; completa Oggetti e Avventure.",
        "Ognuno pesca 1 carta Capitolo.",
        "Chi ha giocato il capitolo più alto diventa primo giocatore."], "[[action:11]][[action:3]]"],
      ["I quattro tipi di effetti", "Un’icona ciascuno", [
        "[[icon:instant]] <b>Istantaneo</b>: una volta, quando prendi la carta.",
        "[[icon:activation]] <b>Attivazione</b>: ogni volta che una carta Capitolo o un effetto la attiva. Inclina la carta: viene raddrizzata a fine round.",
        "[[icon:ongoing]] <b>Permanente</b>: sempre attivo finché hai la carta.",
        "[[icon:endgame]] <b>Fine partita</b>: si conta alla fine della partita."], "[[common:The Lost Boys]][[item:Puss’s Boots]][[legendary:Princess Jasmine]]"],
      ["I personaggi Leggendari", "Potenziali con gli XP", [
        "Un personaggio Leggendario inizia con il suo <b>effetto base</b>.",
        "Ogni XP [[icon:xp]] riempie una casella stella. Quando sono tutte piene, la carta è <b>potenziata</b>.",
        "L’effetto potenziato <b>si aggiunge</b> all’effetto base.",
        "[[icon:freeup]] Un potenziamento gratis riempie in un colpo tutte le caselle stella rimaste di un personaggio Leggendario."], "[[legendary:The Sea Witch]][[legendaryUp:The Sea Witch]]"],
      ["Gli Oggetti", "I tesori delle fiabe", [
        "Nel tuo turno puoi comprare <b>un</b> Oggetto pagando il suo prezzo in monete [[icon:coins]].",
        "Gli Oggetti hanno tag ed effetti, come i personaggi.",
        "Alcuni funzionano meglio con i personaggi della loro fiaba."], "[[item:Seven-League Boots]][[item:Enchanted Candelabra]][[item:Trident]]"],
      ["I cinque tag", "Fascino, Forza, Astuzia, Intelligenza, Magia", [
        "[[tag:Charm]] [[tag:Strength]] [[tag:Dexterity]] [[tag:Intelligence]] [[tag:Sorcery]] Solo i personaggi Leggendari e gli Oggetti hanno tag (più le Sirene, con il loro tag jolly).",
        "Molte Avventure e molti effetti contano i tuoi tag: identici, o in serie di tag diversi.",
        "Un <b>segnalino Tag</b> conta come un tag del tipo che scegli. Mettilo sulla carta che te l’ha fatto ottenere.",
        "Se quella carta lascia il tuo tableau, i suoi segnalini sono persi."], "[[legendary:Tinker Bell]][[legendary:Captain Hook]][[quest:Neverland]]"],
      ["Le Avventure", "Obiettivi per la fine della partita", [
        "Alcune carte Capitolo e alcuni effetti ti fanno prendere una delle Avventure scoperte.",
        "Un’Avventura dà punti a fine partita, in base a ciò che hai riunito.",
        "Molte hanno delle soglie: più ne hai, più punti danno."], "[[quest:The Midnight Ball]][[quest:The House of Seven]][[quest:Once Upon a Time]]"],
      ["Buoni e Cattivi", "Due schieramenti, due stili", [
        "[[icon:Good]] [[icon:Bad]] Ogni personaggio è Buono o Cattivo; anche alcuni Oggetti.",
        "Solo le carte <b>Cattive</b> hanno effetti contro gli altri giocatori.",
        "Alcune carte contano le tue carte Buone, le tue carte Cattive o le coppie delle due."], "[[legendary:Little Red Riding Hood]][[legendary:The Wolf]]"],
      ["Le fiabe funzionano insieme", "Le carte della stessa fiaba", [
        "«Se hai X» significa che X è nel tuo tableau o tra i tuoi Oggetti.",
        "Riunire le carte di una stessa fiaba le rende più forti.",
        "Esempio: Biancaneve ottiene XP e Punti Vittoria per ogni Nano."], "[[legendary:Snow White]][[common:Dwarf]][[quest:The House of Seven]]"],
      ["La fine della partita", "Dopo 8 round", [
        "Somma i tuoi <b>segnalini PV</b> [[icon:vp]] ottenuti durante la partita,",
        "gli effetti <b>Fine partita</b> [[icon:endgame]] delle tue carte e dei tuoi Oggetti,",
        "le tue <b>Avventure</b>,",
        "e il tuo <b>Scrittore</b> al livello 3.",
        "Vince il totale più alto. Siete pronti a giocare!"], "[[legendaryUp:The Evil Queen]][[quest:The Midnight Ball]]"],
    ],
  },
};

let index = 0;
let mounted = null;

function draw() {
  const root = mounted;
  if (!root) return;
  const L = SLIDES[I18N.lang] || SLIDES.en;
  index = Math.max(0, Math.min(L.slides.length - 1, index));
  const [title, sub, points, figs] = L.slides[index];
  const fmt = window.Rules.format;
  root.innerHTML = `<div class="deck">
    <article class="slide${index === 0 ? " slide-cover" : ""}">
      <header><p class="slide-step">${index + 1} / ${L.slides.length}</p><h1>${fmt(title)}</h1><p class="slide-sub">${fmt(sub)}</p></header>
      <div class="slide-body"><ul class="slide-points">${points.map((p) => `<li>${fmt(p)}</li>`).join("")}</ul><div class="slide-figs figs-${(figs.match(/\[\[/g) || []).length}">${fmt(figs)}</div></div>
    </article>
    <nav class="deck-nav">
      <button type="button" data-deck="-1" ${index === 0 ? "disabled" : ""}>← ${L.prev}</button>
      <div class="deck-dots">${L.slides.map((_, i) => `<button type="button" data-goto="${i}" class="${i === index ? "on" : ""}" aria-label="${i + 1}"></button>`).join("")}</div>
      ${index === L.slides.length - 1 ? `<button type="button" class="primary" data-deck-end>${L.end} ✓</button>` : `<button type="button" class="primary" data-deck="1">${L.next} →</button>`}
    </nav></div>`;
  root.querySelectorAll("[data-deck]").forEach((b) => b.addEventListener("click", () => go(index + Number(b.dataset.deck))));
  // "The end" goes back to the home screen (in the app) or to the home page (stand-alone).
  root.querySelector("[data-deck-end]")?.addEventListener("click", () => {
    const back = document.querySelector("#presentBack");
    if (back) back.click();
    else location.href = "./";
  });
  root.querySelectorAll("[data-goto]").forEach((b) => b.addEventListener("click", () => go(Number(b.dataset.goto))));
}

function go(i) {
  index = i;
  draw();
}

function render(root, start) {
  mounted = root;
  if (typeof start === "number") index = start;
  draw();
}

document.addEventListener("keydown", (e) => {
  if (!mounted || !mounted.isConnected || mounted.closest("[hidden]")) return;
  if (e.target.closest("input, textarea, select")) return;
  if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") { e.preventDefault(); go(index + 1); }
  else if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); go(index - 1); }
});
window.addEventListener("langchange", draw);

window.Present = { render, label: () => (SLIDES[I18N.lang] || SLIDES.en).button, title: () => (SLIDES[I18N.lang] || SLIDES.en).title };

// Stand-alone page (present.html)
if (document.body.classList.contains("present-body")) {
  const params = new URLSearchParams(location.search);
  if (params.get("lang")) I18N.setLang(params.get("lang"), false);
  I18N.apply();
  const page = () => {
    document.title = `Once Upon a Time · ${window.Present.title()}`;
    document.querySelector(".rules-home").textContent = `← ${t("home")}`;
  };
  render(document.querySelector("#present"), 0);
  page();
  window.addEventListener("langchange", page);
}
})();
