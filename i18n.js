// Once Upon a Time — interface languages (English, French, Italian).
(function () {
  const S = {
    en: {
      langName: "English",
      // home
      kicker: "A fairy-tale card game",
      tagline: "Gather the heroes, villains and treasures of the classic tales, and write the story worth the most Victory Points.",
      solo: "Solo", online: "Online", yourName: "Your name", namePh: "Storyteller", players: "Players",
      hintOne: "You against one computer storyteller.", hintMany: "You against {n} computer storytellers.",
      level: "Computer level", easy: "Easy", normal: "Normal", hard: "Hard",
      hintEasy: "The storytellers play their Action cards at random and often grab any group.",
      hintNormal: "The storytellers like high cards and always take the most valuable group.",
      hintHard: "The storytellers read the table: they spend high cards only when one group is clearly the best.",
      yourWriter: "Your Writer", writerRandom: "Draw at random", writerChoose: "Choose mine",
      start: "Start the story", onlineNote: "Create a room and send the link to your friends. Empty seats are played by the computer.",
      createRoom: "Create a room", roomCode: "Room code", join: "Join", tutorial: "Tutorial", statistics: "Statistics", theCards: "The cards",
      // decks
      deck_actions: "Actions", deck_common: "Common", deck_legendary: "Legendary", deck_items: "Items", deck_quests: "Quests", deck_writers: "Writers",
      back: "Back",
      // stats
      g_writer: "Click “Choose” under the Writer you want.", g_chooseAction: "Click one of your Action cards.", g_tuck: "Click the Action card to put back under your deck.", g_chooseGroup: "Your turn: click “Take this group” under the group you want.", g_buyItem: "You may buy one Item (one only).", g_resolve: "Click “Resolve Action card effect”.", g_perrault: "Perrault: click “Buy for…” under an Item, with your discount.", g_activate: "Click the card to activate: it glows in your tableau.", g_quest: "Click “Take this Quest” under the Quest you want.", g_draft: "Click one of the choices on your Writer.", g_discard: "Click “Discard” under the cards to discard, or “Finish discarding”.", g_free: "Free upgrade ({n}): click “Free upgrade” on your Writer or under a Legendary character.", g_xp: "Place your {n} {xp}: click a glowing star space (here or on a Legendary). Otherwise it goes to your Writer at the end of the turn.", g_endTurn: "When you are done, click “End turn”.", g_wait: "Waiting: {p} is playing.", tuto_intro_t: "Welcome, storyteller!", tuto_intro: "In 8 rounds, gather characters, Items and Quests into your story to score the most Victory Points. At the top, the offer: the groups of cards you can take this round (hover a card to zoom in). On the left, your Action cards and your Writer. In the centre, your tableau and your recap. On the right, the Quests and the Items for sale.", tuto_chooseAction_t: "1. Play an Action card", tuto_chooseAction: "It is your turn to play an Action card. Cards are played one by one, clockwise from the first player, and a chapter already played this round cannot be played again. The highest chapter will choose a group first… but the lower the chapter, the stronger its effect. Chapter 12 does nothing.", tuto_waitChoose_t: "Wait for your turn", tuto_waitChoose: "Another storyteller plays their Action card first: cards are played clockwise from the first player (gold token “1”). The badge on each player shows their place in the turn order.", tuto_chooseGroup_t: "2. Take a group", tuto_chooseGroup: "Groups are taken from the highest chapter to the lowest. Take one: its cards go into your tableau and their Instant effects happen at once. Their square tags count for your Quests and your score.", tuto_resolve_t: "3. Resolve your Action card", tuto_resolve: "Press “Resolve Action card effect”: your chapter gives you coins, XP, a Quest, activations or a free upgrade.", tuto_activatePick_t: "Choose the card to activate", tuto_activatePick: "Your effect activates one card of your choice: click a glowing card in your tableau.", tuto_questPick_t: "Take a Quest", tuto_questPick: "Click “Take this Quest” under one of the Quests on the right. Quests score at the end of the game: pick one that matches the tags you collect.", tuto_tuck_t: "Draw an Action card", tuto_tuck: "You drew an Action card: now choose a card from your hand to put back under your Action deck.", tuto_placeXp_t: "Place your XP", tuto_placeXp: "Each XP goes on a dashed star space: between two levels of your Writer, or of a Legendary character. Click a glowing space. Placed XP never moves, and when all the spaces of a step are full the card moves up a level. XP you have not placed goes to your Writer at the end of the turn.", tuto_buyAfter_t: "4. Buy one Item (optional)", tuto_buyAfter: "You may now buy one Item, and only one, with your coins: click “Buy for…” under it.", tuto_roundDone_t: "5. End your turn", tuto_roundDone: "When you are done, press “End turn”: the next storyteller plays.", tuto_newRound_t: "A new round", tuto_newRound: "At the end of each round, everyone draws 1 Action card, and the player who played the highest chapter becomes first player. Your Action deck counts the rounds: with 1 card left, it is the last round.", statsTitle: "Your statistics", home: "Home", clearStats: "Clear statistics",
      statsEmpty: "No finished game yet. Your scores are saved in this browser each time you calculate the final score of a finished game (the tutorial is not counted).",
      gamesPlayed: "games played", bestScore: "best score", avgScore: "average score", bestWriter: "best Writer on average",
      byWriter: "By Writer", lastGames: "Last games", colWriter: "Writer", colGames: "Games", colAvg: "Average", colBest: "Best",
      colDate: "Date", colPlayers: "Players", colBots: "Computer", colQuests: "Quests", colScore: "Score",
      // tutorial
      gotIt: "Got it", leaveTuto: "Leave tutorial",
      // game layout
      endRound: "End round", calcScore: "Calculate score", resolveAction: "3. Resolve Action card effect",
      playAction: "1. Play an Action card", quests: "Quests", buyItem: "4. Buy 1 Item", optional: "(optional)",
      you: "You", opponents: "Opponents", status: "Status", chooseGroupTitle: "2. Choose and take a Group", storySoFar: "Story so far",
      writer: "Writer", tableau: "Tableau", round: "Round", quest: "Quest", freeUp: "Free upgrades", coinsWord: "Coins", vpWord: "Victory Points", items: "Items", upgrade: "Upgraded", upgradeLabel: "Upgrade",
      st_chooseWriter: "Choose Writer", st_chooseAction: "Choose Action", st_buyItem: "Resolve the effect", st_chooseGroup: "Take group", st_gameOver: "Game over", st_roundDone: "Buy an Item, then end turn",
      ph_perrault: "Perrault: immediately buy an Item for 2 fewer coins.", ph_gameOver: "The story is over.",
      ph_chooseWriter: "Choose a Writer to start the game.", ph_chooseAction: "Choose an Action card. Highest chapter picks a group first.",
      ph_buyItem: "Resolve your Action card effect.", ph_chooseGroup: "Choose and take an available group.",
      ph_quest: "Choose {n} Quest from the display to resolve the effect.", ph_roundDone: "You may buy 1 Item, then end your turn.",
      chooseYourWriter: "Choose your Writer",
      // buttons in game
      takeQuest: "Take this Quest", buyFor: "Buy for {n}", group: "Group {n}", takenBy: "taken by {who}", yours: "yours", takeGroup: "Take this group",
      effectsUpgrade: "Effects and upgrade", upgradeBtn: "Upgrade ({n})", placeXp: "Place 1 {xp}", freeUpBtn: "Free upgrade", discardBtn: "Discard: +2 {coin} +2 {xp}", yes: "Yes", no: "No",
      sec_act: "Activations", sec_ong: "Ongoing Effects", sec_inst: "Instant Effects", sec_other: "Other Cards",
      base: "Base", legendary: "Legendary", good: "Good", bad: "Bad", neutral: "Neutral", tags: "Skill tags",
      finalScore: "Final Score", totalLine: "Total: {total} ({base} during the game + {quests} from Quests + {writer} from the Writer)", colScoring: "Scoring",
      levelN: "Level {n}", lvN: "Lv {n}", choose: "Choose", finishDiscard: "Finish discarding", writerWord: "Writer",
      // action cards
      chapter: "Chapter", takeAQuest: "Take a Quest", activateAll: "Activate all", activateOne: "Activate 1 card", freeUpgrades: "free upgrades", freeUpgrade: "free upgrade",
      noEffect: "No effect.<br>Only the turn order matters.",
      // logs
      l_chooseWriter: "Choose your Writer.", l_isWriter: "{w} is your Writer.", l_chooseAction: "Choose an Action card from your hand.",
      l_over: "No Action cards left: the story is over. Calculate your final score.",
      l_play: "You play {n}{bonus}. {bots}.", l_counts: " (counts as {v})", l_noGroup: "No group is left for you this round (the decks are running out). You may still buy an Item, then resolve your Action card.",
      l_first: "You choose first. Take a group.", l_yourTurn: "Your turn: take one of the remaining groups.", l_resolved: "Action card effect resolved.",
      l_botTakes: "{who} takes {cards}.", l_youTake: "You take {cards}.", l_mayBuy: "You may now buy up to 1 Item, then resolve the Action card effect.",
      l_buy: "You buy {item} for {n} {coin}.", l_takeQuest: "You take the Quest {q}.", l_questEmpty: "{src} grants a Quest, but the display is empty.",
      l_questChoose: "{src}: choose 1 Quest from the display.", l_upgraded: "{c} is upgraded.", l_chose: "You chose {w}.", l_writerLevel: "{w} reaches level {n}.",
      l_perrault: "Perrault: your next Item costs 2 fewer coins.", l_andersen: "Andersen: you may discard up to two cards from your tableau.",
      l_activateN: "You activate {n} card(s).", l_activate: "You activate {c}.", l_noCoins: "{c}: you do not have enough coins to use the optional effect.",
      l_noXp: "{c}: you do not have enough XP to use the optional effect.", l_costAsk: "{c}: this Activation has a cost. Do you want to use it?",
      l_skip: "You chose not to use the effect of {c}.", l_merry: "The Merry Men: spend 1 coin and gain 1 XP.", l_forest: "{c}: spend 3 coins and gain one free upgrade.",
      l_andersenDiscard: "You discard {c} with Andersen.", l_actionCard: "Action card",
      l_lastRound: "Last round of the story!", lastRoundTag: "Last round!", l_tuck: "{p} puts an Action card under their deck.", ph_tuck: "Choose an Action card from your hand to put under your deck.", tuckBtn: "Under the deck", deckLeft: "left in your Action deck", deckHint: "One card is drawn each round: with 1 card left, it is the last round.", roundOf: "Round {n} of {total}", length: "Length", roundsN: "{n} rounds", l_isWriterOf: "{p}: {w} is the Writer.", l_round: "— Round {n} —", l_played: "Chapters played: {list}.", l_turnOf: "{p}'s turn.",
      l_noGroupFor: "{p}: no group left this round.", l_takes: "{p} takes {cards}.", l_buys: "{p} buys {item} for {n} {coin}.",
      l_takesQuest: "{p} takes the Quest {q}.", chapterTaken: "Already played this round by another player", turnOrder: "Turn order", firstPlayer: "First player", g_waitChoose: "Waiting: {p} chooses an Action card (cards are played clockwise from the first player).", l_carpet: "{p} discards {c} with the Magic Carpet and gains 2 coins.", carpetAsk: "Magic Carpet: discard a Common card from this group to gain 2 coins?", carpetDiscard: "Discard {c}", carpetNone: "Keep everything", l_upgrades: "{p} upgrades {c}.", l_writerUp: "{p}: {w} reaches level {n}.",
      l_discards: "{p} discards {c}.", l_nose: "Pinocchio: {p}'s nose grows (+1 Tag token).", l_steal: "{c}: {p} steals {n} coin(s) from {o}.", l_lose: "{c}: {o} loses {n} coin(s).", l_stealVp: "{c}: {p} steals {n} VP from {o}.", g_choose: "{c}: choose one effect.", g_chooseDiscard: "(discard 1 Common character)", g_nothing: "Nothing", l_activates: "{p} activates {n} card(s).",
      ph_waitAction: "Waiting for the other storytellers to choose their chapter…", ph_waitTurn: "{p} is playing…",
      st_waitAction: "Waiting", st_waitTurn: "Waiting", ps_turn: "Playing", ps_choosing: "Choosing…", ps_ready: "Ready",
      computer: "computer", toBot: "Hand over to the computer", emptyTableau: "No cards yet.",
      theEnd: "The end", youWin: "You win the story!", yourPlace: "You finish #{n} of {total}", seeTable: "See the table",
      yourQuests: "Your Quests", colDuring: "During the game", colCards: "Card effects", endTurn: "End turn", nowPlaying: "Now playing", victories: "victories",
      lobbyKicker: "Online game", roomWord: "Room", shareLink: "Send this link (or the code) to your friends:", copyLink: "Copy the link", copied: "Copied!",
      inRoom: "Storytellers in the room", botsFill: "Empty seats will be played by the computer.", waitingHost: "Waiting for the host to start the story…",
      leave: "Leave", startGame: "Start the story", hostTag: "host", youTag: "you",
      errNoRoom: "This room does not exist. Check the code.", errStarted: "This game has already started.", errFull: "This room is full (5 storytellers).",
      errNet: "Online play is not available here.", openGithub: "Play online on the GitHub version", errClosed: "The room was closed.",
      connecting: "Connecting…", invitedHint: "You have been invited: enter your name and press Join.",
      tabMine: "My games", tabSims: "AI simulations", simIntro: "The computer plays whole games against itself, as many as you like, to see what wins most often. Results add up for each setup and stay in this browser.",
      simGames: "Games", simRun: "Run the simulations", simRunning: "Simulating…", simStop: "Stop", simClear: "Clear these results", simProgress: "{n} / {total} games",
      simEmpty: "No simulation yet for this setup. Choose the players, level and length, then run.", simGamesDone: "games simulated", simWinnerAvg: "winner’s average score",
      simAvg: "average score", simSpread: "average gap first–last", simSources: "Where Victory Points come from", simPerPlayer: "VP per player",
      simWriters: "Writers", simEdgeHint: "Win %: games won by the players who had it. Edge: difference with a fair share ({n} %). Green above +4, red below −4.",
      simWin: "Win %", simEdge: "Edge", simWriterPts: "VP from level 3", simCards: "Cards", simCard: "Card", simTaken: "Taken by", simAvgOwner: "Owner’s score",
      simQuestPts: "Quest VP", simCardHint: "“Taken by”: share of players who ended the game with the card. Faded rows have too few games to conclude.",
      simQuestHint: "Quests: how often they are taken, the winning rate of their owners and the VP they bring on average.",
      simChapters: "Action cards", simChaptersHint: "Picks first: how often the chapter gave first choice of a group. Average position: 1 = first to choose. Win %: games won by the players who played it.",
      simLv2: "Reach lv 2", simLv3: "Reach lv 3", simCurve: "Score round by round", simCurveHint: "Average score at the end of each round, for the eventual winner and for the whole table.", simCurveWin: "Winner", simCurveAll: "Table average",
      simSeats: "Seat order", simSeatsHint: "Win rate by seat, counted from the first player of round 1.", simSeatN: "Seat {n}",
      simEffect: "Effect", simFirst: "Picks first", simAvgPos: "Avg turn position", simWinWith: "Win %",
      simEndRes: "At the end of the game (per player)", simEndResHint: "Leftover coins, XP and free upgrades are resources that brought nothing.",
      simResCards: "characters", simResLeg: "Legendaries", simResUp: "upgraded", simResItems: "Items", simResQuests: "Quests", simResCoins: "coins left", simResXp: "XP left", simResFree: "free upgrades unused",
      simPairs: "Legendary duos", simPairsHint: "Pairs of Legendaries owned together: the 8 that win the most, then the 4 that win the least (enough games only).", simPair: "Duo",
      rules: "Rules", pnpIntro: "Print the whole game at home on A4 paper, at 100 % scale. Each PDF holds the cards, tiles and tokens at their real size, with backs.", pnpCommon: "Common characters: 56 × 87 mm", pnpLegendary: "Legendary characters: 61 × 112 mm (French tarot)", pnpItems: "Item tiles: 60 × 60 mm", pnpQuests: "Quest cards: 87 × 56 mm", pnpWriters: "Writer tiles: 100 × 100 mm", pnpActions: "Action cards (5 sets of 12): 41 × 63 mm", pnpBoard: "Board with the group spaces (front 2–3 players, back 4–5 players) and a score pad", pnpTokens: "Square Tag tokens (20 mm), coins, XP, VP and first player", pnpHint: "The PDFs open on the GitHub version. You can also print straight from the browser:", pnpPage: "printable page",
      botNames: ["Mother Goose", "The Narrator", "The Old Bard", "Aesop"],
    },
    fr: {
      langName: "Français",
      kicker: "Un jeu de cartes de contes de fées",
      tagline: "Rassemblez les héros, les méchants et les trésors des contes classiques, et écrivez l’histoire qui rapporte le plus de Points de Victoire.",
      solo: "Solo", online: "En ligne", yourName: "Votre nom", namePh: "Conteur", players: "Joueurs",
      hintOne: "Vous contre un conteur de l’ordinateur.", hintMany: "Vous contre {n} conteurs de l’ordinateur.",
      level: "Niveau de l’ordinateur", easy: "Facile", normal: "Normal", hard: "Difficile",
      hintEasy: "Les conteurs jouent leurs cartes Action au hasard et prennent souvent n’importe quel groupe.",
      hintNormal: "Les conteurs aiment les grosses cartes et prennent toujours le groupe le plus intéressant.",
      hintHard: "Les conteurs lisent la table : ils ne sortent leurs grosses cartes que si un groupe est nettement le meilleur.",
      yourWriter: "Votre Écrivain", writerRandom: "Tirer au hasard", writerChoose: "Le choisir",
      start: "Commencer l’histoire", onlineNote: "Créez une salle et envoyez le lien à vos amis. Les places libres sont jouées par l’ordinateur.",
      createRoom: "Créer une salle", roomCode: "Code de salle", join: "Rejoindre", tutorial: "Tutoriel", statistics: "Statistiques", theCards: "Les cartes",
      deck_actions: "Actions", deck_common: "Communes", deck_legendary: "Légendaires", deck_items: "Objets", deck_quests: "Quêtes", deck_writers: "Écrivains",
      back: "Retour",
      g_writer: "Cliquez sur « Choisir » sous l’Écrivain de votre choix.", g_chooseAction: "Cliquez sur une de vos cartes Action.", g_tuck: "Cliquez sur la carte Action à remettre sous votre pioche.", g_chooseGroup: "À vous : cliquez sur « Prendre ce groupe » sous le groupe de votre choix.", g_buyItem: "Vous pouvez acheter un Objet (un seul).", g_resolve: "Cliquez sur « Résoudre l’effet de la carte Action ».", g_perrault: "Perrault : cliquez sur « Acheter pour… » sous un Objet, avec votre réduction.", g_activate: "Cliquez sur la carte à activer : elle brille dans votre tableau.", g_quest: "Cliquez sur « Prendre cette Quête » sous la Quête de votre choix.", g_draft: "Cliquez sur un des choix de votre Écrivain.", g_discard: "Cliquez sur « Défausser » sous les cartes à défausser, ou sur « Terminer la défausse ».", g_free: "Amélioration gratuite ({n}) : cliquez sur « Amélioration gratuite » sur votre Écrivain ou sous un personnage Légendaire.", g_xp: "Placez vos {n} {xp} : cliquez sur une case étoile qui brille (ici ou sur un Légendaire). Sinon, ils iront sur votre Écrivain à la fin du tour.", g_endTurn: "Quand vous avez fini, cliquez sur « Fin du tour ».", g_wait: "Patientez : {p} joue.", tuto_intro_t: "Bienvenue, conteur !", tuto_intro: "En 8 manches, réunissez personnages, Objets et Quêtes dans votre histoire pour marquer le plus de Points de Victoire. En haut, l’offre : les groupes de cartes à prendre cette manche (survolez une carte pour l’agrandir). À gauche, vos cartes Action et votre Écrivain. Au centre, votre tableau et votre récap. À droite, les Quêtes et les Objets à acheter.", tuto_chooseAction_t: "1. Jouez une carte Action", tuto_chooseAction: "C’est à vous de jouer une carte Action. On les joue une par une, dans le sens horaire à partir du premier joueur, et un chapitre déjà joué cette manche ne peut pas être rejoué. Le plus grand chapitre choisira son groupe en premier… mais plus le chapitre est petit, plus son effet est fort. Le chapitre 12 ne fait rien.", tuto_waitChoose_t: "Attendez votre tour", tuto_waitChoose: "Un autre conteur joue sa carte Action avant vous : on joue dans le sens horaire à partir du premier joueur (jeton doré « 1 »). La pastille de chaque joueur indique sa place dans l’ordre du tour.", tuto_chooseGroup_t: "2. Prenez un groupe", tuto_chooseGroup: "Les groupes se prennent du plus grand chapitre au plus petit. Prenez-en un : ses cartes vont dans votre tableau et leurs effets Instantanés s’appliquent tout de suite. Leurs tags carrés comptent pour vos Quêtes et votre score.", tuto_resolve_t: "3. Résolvez votre carte Action", tuto_resolve: "Appuyez sur « Résoudre l’effet de la carte Action » : votre chapitre vous donne des pièces, de l’XP, une Quête, des activations ou une amélioration gratuite.", tuto_activatePick_t: "Choisissez la carte à activer", tuto_activatePick: "Votre effet active une carte au choix : cliquez sur une carte qui brille dans votre tableau.", tuto_questPick_t: "Prenez une Quête", tuto_questPick: "Cliquez sur « Prendre cette Quête » sous l’une des Quêtes à droite. Les Quêtes rapportent des points en fin de partie : choisissez-en une qui correspond aux tags que vous collectionnez.", tuto_tuck_t: "Piochez une carte Action", tuto_tuck: "Vous avez pioché une carte Action : choisissez maintenant une carte de votre main à remettre sous votre pioche Action.", tuto_placeXp_t: "Placez votre XP", tuto_placeXp: "Chaque XP se pose sur une case étoile en pointillés : entre deux niveaux de votre Écrivain, ou d’un personnage Légendaire. Cliquez sur une case qui brille. Un XP posé ne bouge plus, et quand toutes les cases d’une étape sont pleines la carte monte de niveau. L’XP non placé va sur votre Écrivain à la fin du tour.", tuto_buyAfter_t: "4. Achetez un Objet (facultatif)", tuto_buyAfter: "Vous pouvez maintenant acheter un Objet, et un seul, avec vos pièces : cliquez sur « Acheter pour… » sous l’Objet.", tuto_roundDone_t: "5. Terminez votre tour", tuto_roundDone: "Quand vous avez fini, appuyez sur « Fin du tour » : le conteur suivant joue.", tuto_newRound_t: "Une nouvelle manche", tuto_newRound: "À la fin de chaque manche, chacun pioche 1 carte Action, et le joueur qui a joué le plus grand chapitre devient premier joueur. Votre pioche Action compte les manches : quand il n’y reste qu’une carte, c’est la dernière manche.", statsTitle: "Vos statistiques", home: "Accueil", clearStats: "Effacer les statistiques",
      statsEmpty: "Aucune partie terminée pour l’instant. Vos scores sont enregistrés dans ce navigateur chaque fois que vous calculez le score final d’une partie terminée (le tutoriel n’est pas compté).",
      gamesPlayed: "parties jouées", bestScore: "meilleur score", avgScore: "score moyen", bestWriter: "meilleur Écrivain en moyenne",
      byWriter: "Par Écrivain", lastGames: "Dernières parties", colWriter: "Écrivain", colGames: "Parties", colAvg: "Moyenne", colBest: "Record",
      colDate: "Date", colPlayers: "Joueurs", colBots: "Ordinateur", colQuests: "Quêtes", colScore: "Score",
      gotIt: "Compris", leaveTuto: "Quitter le tutoriel",
      endRound: "Fin de manche", calcScore: "Calculer le score", resolveAction: "3. Résoudre l’effet de la carte Action",
      playAction: "1. Jouez une carte Action", quests: "Quêtes", buyItem: "4. Achetez 1 Objet", optional: "(facultatif)",
      you: "Vous", opponents: "Adversaires", status: "Étape", chooseGroupTitle: "2. Choisissez et prenez un Groupe", storySoFar: "L’histoire jusqu’ici",
      writer: "Écrivain", tableau: "Tableau", round: "Manche", quest: "Quêtes", freeUp: "Améliorations gratuites", coinsWord: "Pièces", vpWord: "Points de Victoire", items: "Objets", upgrade: "Améliorés", upgradeLabel: "Amélioration",
      st_chooseWriter: "Choix de l’Écrivain", st_chooseAction: "Choix de l’Action", st_buyItem: "Résoudre l’effet", st_chooseGroup: "Prendre un groupe", st_gameOver: "Partie terminée", st_roundDone: "Achat puis fin du tour",
      ph_perrault: "Perrault : achetez immédiatement un Objet pour 2 pièces de moins.", ph_gameOver: "L’histoire est terminée.",
      ph_chooseWriter: "Choisissez un Écrivain pour commencer.", ph_chooseAction: "Choisissez une carte Action. Le plus grand chapitre choisit un groupe en premier.",
      ph_buyItem: "Résolvez l’effet de votre carte Action.", ph_chooseGroup: "Choisissez et prenez un groupe disponible.",
      ph_quest: "Choisissez {n} Quête dans la réserve pour résoudre l’effet.", ph_roundDone: "Vous pouvez acheter 1 Objet, puis finir votre tour.",
      chooseYourWriter: "Choisissez votre Écrivain",
      takeQuest: "Prendre cette Quête", buyFor: "Acheter pour {n}", group: "Groupe {n}", takenBy: "pris par {who}", yours: "à vous", takeGroup: "Prendre ce groupe",
      effectsUpgrade: "Effets et amélioration", upgradeBtn: "Améliorer ({n})", placeXp: "Placer 1 {xp}", freeUpBtn: "Amélioration gratuite", discardBtn: "Défausser : +2 {coin} +2 {xp}", yes: "Oui", no: "Non",
      sec_act: "Activations", sec_ong: "Effets permanents", sec_inst: "Effets instantanés", sec_other: "Autres cartes",
      base: "Base", legendary: "Légendaire", good: "Gentil", bad: "Méchant", neutral: "Neutre", tags: "Tags de compétence",
      finalScore: "Score final", totalLine: "Total : {total} ({base} pendant la partie + {quests} grâce aux Quêtes + {writer} grâce à l’Écrivain)", colScoring: "Décompte",
      levelN: "Niveau {n}", lvN: "Niv. {n}", choose: "Choisir", finishDiscard: "Terminer la défausse", writerWord: "Écrivain",
      chapter: "Chapitre", takeAQuest: "Prendre une Quête", activateAll: "Tout activer", activateOne: "Activer 1 carte", freeUpgrades: "améliorations gratuites", freeUpgrade: "amélioration gratuite",
      noEffect: "Aucun effet.<br>Seul l’ordre du tour compte.",
      l_chooseWriter: "Choisissez votre Écrivain.", l_isWriter: "{w} est votre Écrivain.", l_chooseAction: "Choisissez une carte Action dans votre main.",
      l_over: "Plus de cartes Action : l’histoire est terminée. Calculez votre score final.",
      l_play: "Vous jouez {n}{bonus}. {bots}.", l_counts: " (compte pour {v})", l_noGroup: "Il ne reste aucun groupe pour vous cette manche (les pioches s’épuisent). Vous pouvez quand même acheter un Objet, puis résoudre votre carte Action.",
      l_first: "Vous choisissez en premier. Prenez un groupe.", l_yourTurn: "À vous : prenez l’un des groupes restants.", l_resolved: "Effet de la carte Action résolu.",
      l_botTakes: "{who} prend {cards}.", l_youTake: "Vous prenez {cards}.", l_mayBuy: "Vous pouvez maintenant acheter 1 Objet, puis résoudre l’effet de la carte Action.",
      l_buy: "Vous achetez {item} pour {n} {coin}.", l_takeQuest: "Vous prenez la Quête {q}.", l_questEmpty: "{src} donne une Quête, mais la réserve est vide.",
      l_questChoose: "{src} : choisissez 1 Quête dans la réserve.", l_upgraded: "{c} est amélioré(e).", l_chose: "Vous avez choisi {w}.", l_writerLevel: "{w} atteint le niveau {n}.",
      l_perrault: "Perrault : votre prochain Objet coûte 2 pièces de moins.", l_andersen: "Andersen : vous pouvez défausser jusqu’à deux cartes de votre tableau.",
      l_activateN: "Vous activez {n} carte(s).", l_activate: "Vous activez {c}.", l_noCoins: "{c} : pas assez de pièces pour utiliser l’effet.",
      l_noXp: "{c} : pas assez d’XP pour utiliser l’effet.", l_costAsk: "{c} : cette Activation a un coût. Voulez-vous l’utiliser ?",
      l_skip: "Vous n’utilisez pas l’effet de {c}.", l_merry: "Les Joyeux Compagnons : 1 pièce dépensée, 1 XP gagné.", l_forest: "{c} : 3 pièces dépensées, une amélioration gratuite gagnée.",
      l_andersenDiscard: "Vous défaussez {c} avec Andersen.", l_actionCard: "La carte Action",
      l_lastRound: "Dernière manche de l’histoire !", lastRoundTag: "Dernière manche !", l_tuck: "{p} remet une carte Action sous sa pioche.", ph_tuck: "Choisissez une carte Action de votre main à remettre sous votre pioche.", tuckBtn: "Sous la pioche", deckLeft: "dans votre pioche Action", deckHint: "On pioche une carte par manche : quand il ne reste qu’une carte, c’est la dernière manche.", roundOf: "Manche {n} sur {total}", length: "Durée", roundsN: "{n} manches", l_isWriterOf: "{p} : {w} est l’Écrivain.", l_round: "— Manche {n} —", l_played: "Chapitres joués : {list}.", l_turnOf: "Au tour de {p}.",
      l_noGroupFor: "{p} : plus de groupe cette manche.", l_takes: "{p} prend {cards}.", l_buys: "{p} achète {item} pour {n} {coin}.",
      l_takesQuest: "{p} prend la Quête {q}.", chapterTaken: "Déjà jouée cette manche par un autre joueur", turnOrder: "Ordre du tour", firstPlayer: "Premier joueur", g_waitChoose: "Patientez : {p} choisit sa carte Action (on joue dans le sens horaire à partir du premier joueur).", l_carpet: "{p} défausse {c} grâce au Tapis volant et gagne 2 pièces.", carpetAsk: "Tapis volant : défausser une carte commune de ce groupe pour gagner 2 pièces ?", carpetDiscard: "Défausser {c}", carpetNone: "Tout garder", l_upgrades: "{p} améliore {c}.", l_writerUp: "{p} : {w} atteint le niveau {n}.",
      l_discards: "{p} défausse {c}.", l_nose: "Pinocchio : le nez de {p} s’allonge (+1 jeton d’icône).", l_steal: "{c} : {p} vole {n} pièce(s) à {o}.", l_lose: "{c} : {o} perd {n} pièce(s).", l_stealVp: "{c} : {p} vole {n} PV à {o}.", g_choose: "{c} : choisissez un effet.", g_chooseDiscard: "(défaussez 1 personnage commun)", g_nothing: "Rien", l_activates: "{p} active {n} carte(s).",
      ph_waitAction: "Les autres conteurs choisissent leur chapitre…", ph_waitTurn: "{p} joue…",
      st_waitAction: "En attente", st_waitTurn: "En attente", ps_turn: "Joue", ps_choosing: "Choisit…", ps_ready: "Prêt",
      computer: "ordinateur", toBot: "Confier à l’ordinateur", emptyTableau: "Pas encore de cartes.",
      theEnd: "Fin de l’histoire", youWin: "Vous remportez l’histoire !", yourPlace: "Vous terminez {n}e sur {total}", seeTable: "Voir la table",
      yourQuests: "Vos Quêtes", colDuring: "Pendant la partie", colCards: "Effets des cartes", endTurn: "Fin du tour", nowPlaying: "Joue", victories: "victoires",
      lobbyKicker: "Partie en ligne", roomWord: "Salle", shareLink: "Envoyez ce lien (ou le code) à vos amis :", copyLink: "Copier le lien", copied: "Copié !",
      inRoom: "Conteurs dans la salle", botsFill: "Les places libres seront jouées par l’ordinateur.", waitingHost: "En attente du lancement par l’hôte…",
      leave: "Quitter", startGame: "Commencer l’histoire", hostTag: "hôte", youTag: "vous",
      errNoRoom: "Cette salle n’existe pas. Vérifiez le code.", errStarted: "Cette partie a déjà commencé.", errFull: "Cette salle est pleine (5 conteurs).",
      errNet: "Le jeu en ligne n’est pas disponible ici.", openGithub: "Jouer en ligne sur la version GitHub", errClosed: "La salle a été fermée.",
      connecting: "Connexion…", invitedHint: "Vous êtes invité : entrez votre nom puis appuyez sur Rejoindre.",
      tabMine: "Mes parties", tabSims: "Simulations IA", simIntro: "L’ordinateur joue des parties entières contre lui-même, autant que vous voulez, pour voir ce qui gagne le plus souvent. Les résultats s’additionnent pour chaque réglage et restent dans ce navigateur.",
      simGames: "Parties", simRun: "Lancer les simulations", simRunning: "Simulation…", simStop: "Arrêter", simClear: "Effacer ces résultats", simProgress: "{n} / {total} parties",
      simEmpty: "Aucune simulation pour ce réglage. Choisissez les joueurs, le niveau et la durée, puis lancez.", simGamesDone: "parties simulées", simWinnerAvg: "score moyen du gagnant",
      simAvg: "score moyen", simSpread: "écart moyen 1er–dernier", simSources: "D’où viennent les Points de Victoire", simPerPlayer: "PV par joueur",
      simWriters: "Écrivains", simEdgeHint: "% victoires : parties gagnées par les joueurs qui l’avaient. Écart : différence avec une part équitable ({n} %). Vert au-dessus de +4, rouge en dessous de −4.",
      simWin: "% victoires", simEdge: "Écart", simWriterPts: "PV du niveau 3", simCards: "Cartes", simCard: "Carte", simTaken: "Prise par", simAvgOwner: "Score du détenteur",
      simQuestPts: "PV de la quête", simCardHint: "« Prise par » : part des joueurs qui finissent la partie avec la carte. Les lignes pâles ont trop peu de parties pour conclure.",
      simQuestHint: "Quêtes : à quelle fréquence elles sont prises, le taux de victoire de leurs détenteurs et les PV qu’elles rapportent en moyenne.",
      simChapters: "Cartes Action", simChaptersHint: "Choisit en premier : fréquence à laquelle le chapitre a donné le premier choix de groupe. Position moyenne : 1 = premier à choisir. % victoires : parties gagnées par les joueurs qui l’ont joué.",
      simLv2: "Atteint niv. 2", simLv3: "Atteint niv. 3", simCurve: "Le score manche par manche", simCurveHint: "Score moyen à la fin de chaque manche, pour le futur gagnant et pour toute la table.", simCurveWin: "Gagnant", simCurveAll: "Moyenne de la table",
      simSeats: "Place à la table", simSeatsHint: "Taux de victoire selon la place, comptée à partir du premier joueur de la manche 1.", simSeatN: "Place {n}",
      simEffect: "Effet", simFirst: "Choisit en premier", simAvgPos: "Position moyenne", simWinWith: "% victoires",
      simEndRes: "En fin de partie (par joueur)", simEndResHint: "Les pièces, l’XP et les améliorations gratuites restantes sont des ressources qui n’ont rien rapporté.",
      simResCards: "personnages", simResLeg: "Légendaires", simResUp: "améliorés", simResItems: "Objets", simResQuests: "Quêtes", simResCoins: "pièces restantes", simResXp: "XP restants", simResFree: "améliorations gratuites perdues",
      simPairs: "Duos de Légendaires", simPairsHint: "Paires de Légendaires possédées ensemble : les 8 qui gagnent le plus, puis les 4 qui gagnent le moins (avec assez de parties).", simPair: "Duo",
      rules: "Règles", pnpIntro: "Imprimez tout le jeu chez vous sur du papier A4, à l’échelle 100 %. Chaque PDF contient les cartes, tuiles et jetons à leur taille réelle, avec les dos.", pnpCommon: "Personnages communs : 56 × 87 mm", pnpLegendary: "Personnages légendaires : 61 × 112 mm (tarot français)", pnpItems: "Tuiles Objet : 60 × 60 mm", pnpQuests: "Cartes Quête : 87 × 56 mm", pnpWriters: "Tuiles Écrivain : 100 × 100 mm", pnpActions: "Cartes Action (5 jeux de 12) : 41 × 63 mm", pnpBoard: "Plateau des lots (recto 2–3 joueurs, verso 4–5 joueurs) et carnet de score", pnpTokens: "Jetons Tag carrés (20 mm), pièces, XP, PV et premier joueur", pnpHint: "Les PDF s’ouvrent sur la version GitHub. Vous pouvez aussi imprimer directement depuis le navigateur :", pnpPage: "page à imprimer",
      botNames: ["Ma Mère l’Oye", "Le Narrateur", "Le Vieux Barde", "Ésope"],
    },
    it: {
      langName: "Italiano",
      kicker: "Un gioco di carte delle fiabe",
      tagline: "Riunisci gli eroi, i cattivi e i tesori delle fiabe classiche, e scrivi la storia che vale più Punti Vittoria.",
      solo: "Solo", online: "Online", yourName: "Il tuo nome", namePh: "Narratore", players: "Giocatori",
      hintOne: "Tu contro un narratore del computer.", hintMany: "Tu contro {n} narratori del computer.",
      level: "Livello del computer", easy: "Facile", normal: "Normale", hard: "Difficile",
      hintEasy: "I narratori giocano le carte Azione a caso e spesso prendono un gruppo qualsiasi.",
      hintNormal: "I narratori amano le carte alte e prendono sempre il gruppo più prezioso.",
      hintHard: "I narratori leggono il tavolo: usano le carte alte solo quando un gruppo è chiaramente il migliore.",
      yourWriter: "Il tuo Scrittore", writerRandom: "Pesca a caso", writerChoose: "Sceglilo tu",
      start: "Inizia la storia", onlineNote: "Crea una stanza e invia il link ai tuoi amici. I posti liberi sono giocati dal computer.",
      createRoom: "Crea una stanza", roomCode: "Codice stanza", join: "Entra", tutorial: "Tutorial", statistics: "Statistiche", theCards: "Le carte",
      deck_actions: "Azioni", deck_common: "Comuni", deck_legendary: "Leggendarie", deck_items: "Oggetti", deck_quests: "Missioni", deck_writers: "Scrittori",
      back: "Indietro",
      g_writer: "Clicca su «Scegli» sotto lo Scrittore che vuoi.", g_chooseAction: "Clicca su una delle tue carte Azione.", g_tuck: "Clicca sulla carta Azione da rimettere sotto il mazzo.", g_chooseGroup: "Tocca a te: clicca su «Prendi questo gruppo» sotto il gruppo che vuoi.", g_buyItem: "Puoi comprare un Oggetto (uno solo).", g_resolve: "Clicca su «Risolvi l’effetto della carta Azione».", g_perrault: "Perrault: clicca su «Compra per…» sotto un Oggetto, con il tuo sconto.", g_activate: "Clicca sulla carta da attivare: brilla nel tuo tableau.", g_quest: "Clicca su «Prendi questa Missione» sotto la Missione che vuoi.", g_draft: "Clicca su una delle scelte del tuo Scrittore.", g_discard: "Clicca su «Scarta» sotto le carte da scartare, o su «Termina gli scarti».", g_free: "Potenziamento gratis ({n}): clicca su «Potenziamento gratis» sul tuo Scrittore o sotto un personaggio Leggendario.", g_xp: "Metti i tuoi {n} {xp}: clicca su una casella stella che brilla (qui o su una Leggendaria). Altrimenti andranno al tuo Scrittore alla fine del turno.", g_endTurn: "Quando hai finito, clicca su «Fine turno».", g_wait: "Attendi: {p} sta giocando.", tuto_intro_t: "Benvenuto, narratore!", tuto_intro: "In 8 round, riunisci personaggi, Oggetti e Missioni nella tua storia per fare più Punti Vittoria. In alto, l’offerta: i gruppi di carte da prendere in questo round (passa sopra una carta per ingrandirla). A sinistra, le tue carte Azione e il tuo Scrittore. Al centro, il tuo tableau e il tuo riepilogo. A destra, le Missioni e gli Oggetti in vendita.", tuto_chooseAction_t: "1. Gioca una carta Azione", tuto_chooseAction: "Tocca a te giocare una carta Azione. Si giocano una alla volta, in senso orario dal primo giocatore, e un capitolo già giocato in questo round non può essere rigiocato. Il capitolo più alto sceglierà il gruppo per primo… ma più il capitolo è basso, più il suo effetto è forte. Il capitolo 12 non fa nulla.", tuto_waitChoose_t: "Aspetta il tuo turno", tuto_waitChoose: "Un altro narratore gioca la sua carta Azione prima di te: si gioca in senso orario dal primo giocatore (segnalino dorato «1»). Il cerchietto di ogni giocatore indica il suo posto nell’ordine di turno.", tuto_chooseGroup_t: "2. Prendi un gruppo", tuto_chooseGroup: "I gruppi si prendono dal capitolo più alto al più basso. Prendine uno: le sue carte vanno nel tuo tableau e i loro effetti Istantanei si applicano subito. I loro tag quadrati contano per le tue Missioni e il tuo punteggio.", tuto_resolve_t: "3. Risolvi la tua carta Azione", tuto_resolve: "Premi «Risolvi l’effetto della carta Azione»: il tuo capitolo ti dà monete, XP, una Missione, attivazioni o un potenziamento gratis.", tuto_activatePick_t: "Scegli la carta da attivare", tuto_activatePick: "Il tuo effetto attiva una carta a scelta: clicca su una carta che brilla nel tuo tableau.", tuto_questPick_t: "Prendi una Missione", tuto_questPick: "Clicca su «Prendi questa Missione» sotto una delle Missioni a destra. Le Missioni danno punti a fine partita: scegline una adatta ai tag che raccogli.", tuto_tuck_t: "Pesca una carta Azione", tuto_tuck: "Hai pescato una carta Azione: ora scegli una carta dalla mano da rimettere sotto il tuo mazzo Azione.", tuto_placeXp_t: "Metti i tuoi XP", tuto_placeXp: "Ogni XP va su una casella stella tratteggiata: tra due livelli del tuo Scrittore, o di un personaggio Leggendario. Clicca su una casella che brilla. Un XP posato non si sposta più, e quando tutte le caselle di un passaggio sono piene la carta sale di livello. Gli XP non piazzati vanno al tuo Scrittore alla fine del turno.", tuto_buyAfter_t: "4. Compra un Oggetto (facoltativo)", tuto_buyAfter: "Ora puoi comprare un Oggetto, uno solo, con le tue monete: clicca su «Compra per…» sotto l’Oggetto.", tuto_roundDone_t: "5. Chiudi il tuo turno", tuto_roundDone: "Quando hai finito, premi «Fine turno»: gioca il narratore successivo.", tuto_newRound_t: "Un nuovo round", tuto_newRound: "Alla fine di ogni round, ognuno pesca 1 carta Azione, e chi ha giocato il capitolo più alto diventa primo giocatore. Il tuo mazzo Azione conta i round: con 1 sola carta rimasta, è l’ultimo round.", statsTitle: "Le tue statistiche", home: "Home", clearStats: "Cancella statistiche",
      statsEmpty: "Ancora nessuna partita conclusa. I tuoi punteggi vengono salvati in questo browser ogni volta che calcoli il punteggio finale di una partita conclusa (il tutorial non conta).",
      gamesPlayed: "partite giocate", bestScore: "punteggio migliore", avgScore: "punteggio medio", bestWriter: "miglior Scrittore in media",
      byWriter: "Per Scrittore", lastGames: "Ultime partite", colWriter: "Scrittore", colGames: "Partite", colAvg: "Media", colBest: "Record",
      colDate: "Data", colPlayers: "Giocatori", colBots: "Computer", colQuests: "Missioni", colScore: "Punteggio",
      gotIt: "Capito", leaveTuto: "Esci dal tutorial",
      endRound: "Fine round", calcScore: "Calcola il punteggio", resolveAction: "3. Risolvi l’effetto della carta Azione",
      playAction: "1. Gioca una carta Azione", quests: "Missioni", buyItem: "4. Compra 1 Oggetto", optional: "(facoltativo)",
      you: "Tu", opponents: "Avversari", status: "Fase", chooseGroupTitle: "2. Scegli e prendi un Gruppo", storySoFar: "La storia finora",
      writer: "Scrittore", tableau: "Tableau", round: "Round", quest: "Missioni", freeUp: "Potenziamenti gratis", coinsWord: "Monete", vpWord: "Punti Vittoria", items: "Oggetti", upgrade: "Potenziate", upgradeLabel: "Potenziamento",
      st_chooseWriter: "Scelta Scrittore", st_chooseAction: "Scelta Azione", st_buyItem: "Risolvi l’effetto", st_chooseGroup: "Prendi un gruppo", st_gameOver: "Partita finita", st_roundDone: "Acquisto poi fine turno",
      ph_perrault: "Perrault: compra subito un Oggetto pagando 2 monete in meno.", ph_gameOver: "La storia è finita.",
      ph_chooseWriter: "Scegli uno Scrittore per iniziare.", ph_chooseAction: "Scegli una carta Azione. Il capitolo più alto sceglie per primo.",
      ph_buyItem: "Risolvi l’effetto della tua carta Azione.", ph_chooseGroup: "Scegli e prendi un gruppo disponibile.",
      ph_quest: "Scegli {n} Missione dall’esposizione per risolvere l’effetto.", ph_roundDone: "Puoi comprare 1 Oggetto, poi chiudere il turno.",
      chooseYourWriter: "Scegli il tuo Scrittore",
      takeQuest: "Prendi questa Missione", buyFor: "Compra per {n}", group: "Gruppo {n}", takenBy: "preso da {who}", yours: "tuo", takeGroup: "Prendi questo gruppo",
      effectsUpgrade: "Effetti e potenziamento", upgradeBtn: "Potenzia ({n})", placeXp: "Metti 1 {xp}", freeUpBtn: "Potenziamento gratis", discardBtn: "Scarta: +2 {coin} +2 {xp}", yes: "Sì", no: "No",
      sec_act: "Attivazioni", sec_ong: "Effetti permanenti", sec_inst: "Effetti istantanei", sec_other: "Altre carte",
      base: "Base", legendary: "Leggendaria", good: "Buono", bad: "Cattivo", neutral: "Neutrale", tags: "Tag di abilità",
      finalScore: "Punteggio finale", totalLine: "Totale: {total} ({base} durante la partita + {quests} dalle Missioni + {writer} dallo Scrittore)", colScoring: "Punteggio",
      levelN: "Livello {n}", lvN: "Liv. {n}", choose: "Scegli", finishDiscard: "Termina gli scarti", writerWord: "Scrittore",
      chapter: "Capitolo", takeAQuest: "Prendi una Missione", activateAll: "Attiva tutto", activateOne: "Attiva 1 carta", freeUpgrades: "potenziamenti gratis", freeUpgrade: "potenziamento gratis",
      noEffect: "Nessun effetto.<br>Conta solo l’ordine di turno.",
      l_chooseWriter: "Scegli il tuo Scrittore.", l_isWriter: "{w} è il tuo Scrittore.", l_chooseAction: "Scegli una carta Azione dalla tua mano.",
      l_over: "Niente più carte Azione: la storia è finita. Calcola il tuo punteggio finale.",
      l_play: "Giochi {n}{bonus}. {bots}.", l_counts: " (vale {v})", l_noGroup: "Non resta nessun gruppo per te in questo round (i mazzi stanno finendo). Puoi comunque comprare un Oggetto, poi risolvere la tua carta Azione.",
      l_first: "Scegli per primo. Prendi un gruppo.", l_yourTurn: "Tocca a te: prendi uno dei gruppi rimasti.", l_resolved: "Effetto della carta Azione risolto.",
      l_botTakes: "{who} prende {cards}.", l_youTake: "Prendi {cards}.", l_mayBuy: "Ora puoi comprare 1 Oggetto, poi risolvere l’effetto della carta Azione.",
      l_buy: "Compri {item} per {n} {coin}.", l_takeQuest: "Prendi la Missione {q}.", l_questEmpty: "{src} dà una Missione, ma l’esposizione è vuota.",
      l_questChoose: "{src}: scegli 1 Missione dall’esposizione.", l_upgraded: "{c} è potenziato/a.", l_chose: "Hai scelto {w}.", l_writerLevel: "{w} raggiunge il livello {n}.",
      l_perrault: "Perrault: il tuo prossimo Oggetto costa 2 monete in meno.", l_andersen: "Andersen: puoi scartare fino a due carte dal tuo tableau.",
      l_activateN: "Attivi {n} carta/e.", l_activate: "Attivi {c}.", l_noCoins: "{c}: non hai abbastanza monete per usare l’effetto.",
      l_noXp: "{c}: non hai abbastanza XP per usare l’effetto.", l_costAsk: "{c}: questa Attivazione ha un costo. Vuoi usarla?",
      l_skip: "Non usi l’effetto di {c}.", l_merry: "Gli Allegri Compagni: 1 moneta spesa, 1 XP ottenuto.", l_forest: "{c}: 3 monete spese, un potenziamento gratis ottenuto.",
      l_andersenDiscard: "Scarti {c} con Andersen.", l_actionCard: "La carta Azione",
      l_lastRound: "Ultimo round della storia!", lastRoundTag: "Ultimo round!", l_tuck: "{p} rimette una carta Azione sotto il suo mazzo.", ph_tuck: "Scegli una carta Azione dalla mano da rimettere sotto il tuo mazzo.", tuckBtn: "Sotto il mazzo", deckLeft: "nel tuo mazzo Azione", deckHint: "Si pesca una carta per round: con 1 sola carta rimasta, è l’ultimo round.", roundOf: "Round {n} di {total}", length: "Durata", roundsN: "{n} round", l_isWriterOf: "{p}: {w} è lo Scrittore.", l_round: "— Round {n} —", l_played: "Capitoli giocati: {list}.", l_turnOf: "Tocca a {p}.",
      l_noGroupFor: "{p}: nessun gruppo rimasto in questo round.", l_takes: "{p} prende {cards}.", l_buys: "{p} compra {item} per {n} {coin}.",
      l_takesQuest: "{p} prende la Missione {q}.", chapterTaken: "Già giocata in questo round da un altro giocatore", turnOrder: "Ordine di turno", firstPlayer: "Primo giocatore", g_waitChoose: "Attendi: {p} sceglie la sua carta Azione (si gioca in senso orario dal primo giocatore).", l_carpet: "{p} scarta {c} con il Tappeto volante e ottiene 2 monete.", carpetAsk: "Tappeto volante: scartare una carta comune di questo gruppo per ottenere 2 monete?", carpetDiscard: "Scarta {c}", carpetNone: "Tieni tutto", l_upgrades: "{p} potenzia {c}.", l_writerUp: "{p}: {w} raggiunge il livello {n}.",
      l_discards: "{p} scarta {c}.", l_nose: "Pinocchio: a {p} si allunga il naso (+1 segnalino icona).", l_steal: "{c}: {p} ruba {n} moneta/e a {o}.", l_lose: "{c}: {o} perde {n} moneta/e.", l_stealVp: "{c}: {p} ruba {n} PV a {o}.", g_choose: "{c}: scegli un effetto.", g_chooseDiscard: "(scarta 1 personaggio comune)", g_nothing: "Niente", l_activates: "{p} attiva {n} carta/e.",
      ph_waitAction: "Gli altri narratori scelgono il loro capitolo…", ph_waitTurn: "{p} sta giocando…",
      st_waitAction: "In attesa", st_waitTurn: "In attesa", ps_turn: "Gioca", ps_choosing: "Sceglie…", ps_ready: "Pronto",
      computer: "computer", toBot: "Affida al computer", emptyTableau: "Ancora nessuna carta.",
      theEnd: "Fine della storia", youWin: "Hai vinto la storia!", yourPlace: "Finisci {n}° su {total}", seeTable: "Vedi il tavolo",
      yourQuests: "Le tue Missioni", colDuring: "Durante la partita", colCards: "Effetti delle carte", endTurn: "Fine turno", nowPlaying: "Gioca", victories: "vittorie",
      lobbyKicker: "Partita online", roomWord: "Stanza", shareLink: "Invia questo link (o il codice) ai tuoi amici:", copyLink: "Copia il link", copied: "Copiato!",
      inRoom: "Narratori nella stanza", botsFill: "I posti liberi saranno giocati dal computer.", waitingHost: "In attesa che l’host inizi la storia…",
      leave: "Esci", startGame: "Inizia la storia", hostTag: "host", youTag: "tu",
      errNoRoom: "Questa stanza non esiste. Controlla il codice.", errStarted: "Questa partita è già iniziata.", errFull: "Questa stanza è piena (5 narratori).",
      errNet: "Il gioco online non è disponibile qui.", openGithub: "Gioca online sulla versione GitHub", errClosed: "La stanza è stata chiusa.",
      connecting: "Connessione…", invitedHint: "Sei stato invitato: inserisci il tuo nome e premi Entra.",
      tabMine: "Le mie partite", tabSims: "Simulazioni IA", simIntro: "Il computer gioca partite intere contro sé stesso, quante ne vuoi, per vedere cosa vince più spesso. I risultati si sommano per ogni impostazione e restano in questo browser.",
      simGames: "Partite", simRun: "Avvia le simulazioni", simRunning: "Simulazione…", simStop: "Ferma", simClear: "Cancella questi risultati", simProgress: "{n} / {total} partite",
      simEmpty: "Nessuna simulazione per questa impostazione. Scegli giocatori, livello e durata, poi avvia.", simGamesDone: "partite simulate", simWinnerAvg: "punteggio medio del vincitore",
      simAvg: "punteggio medio", simSpread: "scarto medio 1°–ultimo", simSources: "Da dove vengono i Punti Vittoria", simPerPlayer: "PV per giocatore",
      simWriters: "Scrittori", simEdgeHint: "% vittorie: partite vinte dai giocatori che lo avevano. Scarto: differenza con una quota equa ({n} %). Verde sopra +4, rosso sotto −4.",
      simWin: "% vittorie", simEdge: "Scarto", simWriterPts: "PV del livello 3", simCards: "Carte", simCard: "Carta", simTaken: "Presa da", simAvgOwner: "Punteggio di chi la ha",
      simQuestPts: "PV della missione", simCardHint: "«Presa da»: quota di giocatori che finiscono la partita con la carta. Le righe sbiadite hanno troppe poche partite per concludere.",
      simQuestHint: "Missioni: quanto spesso vengono prese, la percentuale di vittoria di chi le ha e i PV che portano in media.",
      simChapters: "Carte Azione", simChaptersHint: "Sceglie per primo: quanto spesso il capitolo ha dato la prima scelta del gruppo. Posizione media: 1 = primo a scegliere. % vittorie: partite vinte da chi lo ha giocato.",
      simLv2: "Arriva al liv. 2", simLv3: "Arriva al liv. 3", simCurve: "Il punteggio round per round", simCurveHint: "Punteggio medio alla fine di ogni round, per il futuro vincitore e per tutto il tavolo.", simCurveWin: "Vincitore", simCurveAll: "Media del tavolo",
      simSeats: "Posto al tavolo", simSeatsHint: "Percentuale di vittoria per posto, contato dal primo giocatore del round 1.", simSeatN: "Posto {n}",
      simEffect: "Effetto", simFirst: "Sceglie per primo", simAvgPos: "Posizione media", simWinWith: "% vittorie",
      simEndRes: "A fine partita (per giocatore)", simEndResHint: "Monete, XP e potenziamenti gratis rimasti sono risorse che non hanno portato nulla.",
      simResCards: "personaggi", simResLeg: "Leggendarie", simResUp: "potenziate", simResItems: "Oggetti", simResQuests: "Missioni", simResCoins: "monete rimaste", simResXp: "XP rimasti", simResFree: "potenziamenti gratis persi",
      simPairs: "Coppie di Leggendarie", simPairsHint: "Coppie di Leggendarie possedute insieme: le 8 che vincono di più, poi le 4 che vincono di meno (solo con abbastanza partite).", simPair: "Coppia",
      rules: "Regole", pnpIntro: "Stampa tutto il gioco a casa su carta A4, in scala 100 %. Ogni PDF contiene carte, tessere e segnalini nelle dimensioni reali, con i retri.", pnpCommon: "Personaggi comuni: 56 × 87 mm", pnpLegendary: "Personaggi leggendari: 61 × 112 mm (tarocco francese)", pnpItems: "Tessere Oggetto: 60 × 60 mm", pnpQuests: "Carte Missione: 87 × 56 mm", pnpWriters: "Tessere Scrittore: 100 × 100 mm", pnpActions: "Carte Azione (5 mazzi da 12): 41 × 63 mm", pnpBoard: "Plancia dei gruppi (fronte 2–3 giocatori, retro 4–5 giocatori) e blocco segnapunti", pnpTokens: "Segnalini Tag quadrati (20 mm), monete, XP, PV e primo giocatore", pnpHint: "I PDF si aprono sulla versione GitHub. Puoi anche stampare direttamente dal browser:", pnpPage: "pagina da stampare",
      botNames: ["Mamma Oca", "Il Narratore", "Il Vecchio Bardo", "Esopo"],
    },
  };

  const LANGS = ["en", "fr", "it"];
  // Small flags drawn in SVG (emoji flags do not show on Windows).
  const FLAGS = {
    en: '<svg class="flag" viewBox="0 0 60 40" aria-hidden="true"><rect width="60" height="40" fill="#012169"/><path d="M0 0 60 40M60 0 0 40" stroke="#fff" stroke-width="8"/><path d="M0 0 60 40M60 0 0 40" stroke="#c8102e" stroke-width="3"/><path d="M30 0v40M0 20h60" stroke="#fff" stroke-width="12"/><path d="M30 0v40M0 20h60" stroke="#c8102e" stroke-width="7"/></svg>',
    fr: '<svg class="flag" viewBox="0 0 3 2" aria-hidden="true"><rect width="1" height="2" fill="#002395"/><rect x="1" width="1" height="2" fill="#fff"/><rect x="2" width="1" height="2" fill="#ed2939"/></svg>',
    it: '<svg class="flag" viewBox="0 0 3 2" aria-hidden="true"><rect width="1" height="2" fill="#009246"/><rect x="1" width="1" height="2" fill="#fff"/><rect x="2" width="1" height="2" fill="#ce2b37"/></svg>',
  };
  let lang = "en";
  try {
    lang = localStorage.getItem("ouat-lang") || "";
  } catch (e) {
    lang = "";
  }
  if (!LANGS.includes(lang)) {
    const nav = (navigator.language || "en").slice(0, 2);
    lang = LANGS.includes(nav) ? nav : "en";
  }

  const cardMap = new Map((window.CARD_I18N || []).map((row) => [row[0], row]));

  function t(key, vars) {
    let text = (S[lang] && S[lang][key]) ?? S.en[key] ?? key;
    if (vars && typeof text === "string") {
      text = text.replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined ? vars[k] : m));
    }
    return text;
  }

  // Card text in the current language (falls back to the English original).
  function tc(en) {
    if (lang === "en" || en == null) return en;
    const row = cardMap.get(en);
    if (!row) return en;
    return lang === "fr" ? row[1] : row[2];
  }

  function apply(root = document) {
    document.documentElement.lang = lang;
    for (const node of root.querySelectorAll("[data-i18n]")) node.textContent = t(node.dataset.i18n);
    for (const node of root.querySelectorAll("[data-i18n-ph]")) node.placeholder = t(node.dataset.i18nPh);
    for (const node of root.querySelectorAll(".lang-switch")) {
      node.innerHTML = LANGS.map((l) => `<button type="button" data-lang="${l}" aria-pressed="${l === lang}" title="${S[l].langName}" aria-label="${S[l].langName}">${FLAGS[l]}<span>${l.toUpperCase()}</span></button>`).join("");
    }
  }

  function setLang(next, remember = true) {
    if (!LANGS.includes(next) || next === lang) return;
    lang = next;
    try {
      if (remember) localStorage.setItem("ouat-lang", lang);
    } catch (e) {
      /* not remembered */
    }
    apply();
    window.dispatchEvent(new CustomEvent("langchange"));
  }

  document.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-lang]");
    if (btn) setLang(btn.dataset.lang);
  });

  window.I18N = { t, tc, apply, setLang, get lang() { return lang; } };
  window.t = t;
  window.tc = tc;
})();
