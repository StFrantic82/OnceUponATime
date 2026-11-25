# Once Upon a Time — version en ligne

Prototype numérique de **Once Upon a Time**, jeu de cartes où des Écrivains rassemblent personnages et objets des contes classiques pour accomplir des Quêtes. Jouable dans le navigateur.

- Page d’accueil : nombre de joueurs (2 à 5), niveau de l’ordinateur, choix de l’Écrivain, tutoriel, statistiques, catalogue des cartes.
- Mode solo contre 1 à 4 conteurs automatiques.
- Jouable en anglais, français et italien (interface et cartes).
- Choix de l’Écrivain (au hasard ou au choix), avec ses 3 niveaux.
- Catalogue complet des cartes : Communes, Légendaires, Quêtes, Objets, Écrivains.

## Jouer

Ouvrez la page GitHub Pages du dépôt. Le mode multijoueur est en préparation.

## Fichiers

- `index.html` et `styles.css` : l’interface ;
- `app.js` : les règles et le déroulement d’une partie ;
- `game-data.js` : toutes les cartes (généré depuis le tableur des cartes) ;
- `art.js` : les illustrations des cartes, dessinées en SVG ;
- `home.js` : la page d’accueil, les statistiques (enregistrées dans le navigateur) et le tutoriel ;
- `i18n.js` et `i18n-cards.js` : les traductions (interface et textes des cartes) ;
- `cards.js` : la mise en page des cartes (personnages, légendaires, objets, quêtes, cartes Action) ;
- `assets/icons/` : les icônes (icônes, ressources, types d’effet).
