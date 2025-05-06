# Jeu PvP

Un jeu de stratégie en tour par tour où deux joueurs s'affrontent sur une grille. Chaque joueur peut se déplacer, lancer des sorts et tenter de vaincre son adversaire.

## Fonctionnalités

- **Déplacement** : Les joueurs peuvent se déplacer sur la grille en fonction de leurs points de mouvement (PM).
- **Sorts** : Chaque joueur dispose de sorts uniques avec des portées et des effets variés :
  - **Frappe lourde** : Inflige des dégâts à un joueur adjacent.
  - **Muspel** : Inflige des dégâts en zone autour d'une case ciblée.
  - **Saut** : Permet de se déplacer rapidement sur une case vide dans une certaine portée.
  - **Coup de bouclier** : Inflige des dégâts et repousse l'adversaire.
- **Obstacles** : Des obstacles fixes sur la grille bloquent les déplacements et les sorts.
- **Tour par tour** : Les joueurs jouent chacun leur tour, avec une gestion des points d'action (PA) et des points de mouvement (PM).
- **Victoire** : Le jeu se termine lorsqu'un joueur n'a plus de points de vie (PV).

## Structure du projet

- **`index.html`** : Contient la structure HTML du jeu.
- **`css/style.css`** : Gère le style visuel du jeu, y compris les animations et les effets.
- **`js/`** : Contient les fichiers JavaScript pour la logique du jeu :
  - **`main.js`** : Point d'entrée principal du jeu.
  - **`Board.js`** : Gestion de la grille et des interactions visuelles.
  - **`Player.js`** : Gestion des joueurs (PV, PA, PM, déplacements).
  - **`Spell.js`** : Gestion des sorts et de leurs effets.
  - **`Obstacle.js`** : Gestion des obstacles sur la grille.
  - **`Game.js`** : (Actuellement vide, peut être utilisé pour des fonctionnalités futures).

## Installation

1. Clonez ce dépôt :
   ```bash
   git clone https://github.com/Cedricbgt/jeuPvp.git
