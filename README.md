# Once Upon a Time — version en ligne

Prototype numérique de **Once Upon a Time**, jeu de cartes où des Écrivains rassemblent personnages et objets des contes classiques pour accomplir des Quêtes. Jouable dans le navigateur.

- Page d’accueil : nombre de joueurs (2 à 5), niveau de l’ordinateur, choix de l’Écrivain, tutoriel, statistiques, simulations IA pour l’équilibrage, catalogue des cartes.
- Mode solo contre 1 à 4 conteurs automatiques, qui jouent vraiment (tableau, objets, quêtes, améliorations) et sont classés en fin de partie.
- Jeu en ligne entre amis : on crée une salle, on envoie le code ou le lien, les places libres sont jouées par l’ordinateur.
- Jouable en anglais, français et italien (interface et cartes).
- Choix de l’Écrivain (au hasard ou au choix), avec ses 3 niveaux.
- Catalogue complet des cartes : Communes, Légendaires, Quêtes, Objets, Écrivains.
- Règles illustrées en FR/EN/IT (`rules.html`), imprimables.
- Print & Play : PDF A4 à imprimer (`pnp/`), cartes communes 56×87 mm, légendaires format tarot 61×112 mm, objets 60×60 mm, quêtes 89×63 mm, écrivains 70×120 mm, cartes Action 41×63 mm (5 couleurs), jetons Tag carrés 20 mm, jetons pièces/XP/PV et premier joueur ; dos en miroir pour le recto verso.

## Jouer

Ouvrez la page GitHub Pages du dépôt.

Pour jouer en ligne, un joueur crée une salle (onglet « En ligne ») et envoie le code ou le lien, les autres la rejoignent avant le lancement. L’hôte fait tourner la partie dans son navigateur : s’il ferme son onglet, la partie s’arrête (en rechargeant la même page, il la reprend). Un invité qui recharge sa page retrouve sa place, et l’hôte peut confier la place d’un joueur absent à l’ordinateur.

Le jeu en ligne utilise la Realtime Database Firebase du projet Minikin City (salles `rooms/OUAT-xxxxx`, mêmes règles de sécurité). Pour tester sans Firebase, ouvrez `index.html?local` dans deux onglets d’un même navigateur (servis par un petit serveur web local).

## Fichiers

- `index.html` et `styles.css` : l’interface ;
- `app.js` : le moteur (état de chaque joueur, ordre du tour, effets, décompte) et l’affichage de la table ;
- `bot.js` : l’ordinateur (choix des cartes Action, groupes, objets, quêtes, améliorations) ;
- `sims.js` : les simulations IA (l’ordinateur contre lui-même) pour l’équilibrage ;
- `online.js` : les salles en ligne (Firebase, ou mode local pour tester) ;
- `game-data.js` : toutes les cartes (généré depuis le tableur des cartes) ;
- `art.js` : les illustrations des cartes, dessinées en SVG ;
- `home.js` : la page d’accueil, les statistiques (enregistrées dans le navigateur) et le tutoriel ;
- `i18n.js` et `i18n-cards.js` : les traductions (interface et textes des cartes) ;
- `rules.html`, `rules.js`, `rules.css` : les règles illustrées ;
- `print.html`, `print.js`, `print.css` : la mise en page du Print & Play (le PDF est généré depuis cette page avec Chromium) ;
- `cards.js` : la mise en page des cartes (personnages, légendaires, objets, quêtes, cartes Action) ;
- `assets/icons/` : les icônes (icônes, ressources, types d’effet).
