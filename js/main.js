import Player from './Player.js';
import Board from './Board.js';
import Spell from './Spell.js';

console.log('main.js module chargé');

// Définition de la taille de la grille
const GRID_WIDTH = 7;
const GRID_HEIGHT = 7;

// Instanciation des joueurs
const player1 = new Player('Joueur 1', 30, 5, 3, { x: 0, y: 0 });
const player2 = new Player('Joueur 2', 30, 5, 3, { x: GRID_WIDTH - 1, y: GRID_HEIGHT - 1 });

// Instanciation du sort
const frappeLourde = new Spell('Frappe lourde', 2, 1, 7);

// Export ou ajout à l'état du jeu
export { player1, player2 };

// Initialisation du plateau
const board = new Board(GRID_WIDTH, GRID_HEIGHT, 'board');
board.init();
console.log('Board initialisé - nb cellules:', board.container.querySelectorAll('.cell').length);
// Affichage des sprites des joueurs
board.renderPlayers([player1, player2]);

// Définition du joueur courant
let currentPlayer = player1;  // on commence avec Joueur 1

// Fonction pour terminer le tour
function endTurn() {
  console.log('Fin de tour pour', currentPlayer.name);
  currentPlayer = currentPlayer === player1 ? player2 : player1;
  currentPlayer.resetTurn();
  console.log('Nouveau joueur courant :', currentPlayer.name);
  board.renderPlayers([player1, player2]);
  updateUIPanel();
}

// Fonction d'affichage des PA/PM du joueur courant
function updateUIPanel() {
  console.log('updateUIPanel', currentPlayer.name, 'PA:', currentPlayer.pa, 'PM:', currentPlayer.pm);
  const uiPanel = document.getElementById('ui-panel');
  uiPanel.innerHTML = `
    <strong>${currentPlayer.name}</strong><br>
    PV : ${currentPlayer.pv} / ${currentPlayer.maxPv}<br>
    <span style="color:blue">PA</span> : ${currentPlayer.pa} / ${currentPlayer.maxPa}<br>
    <span style="color:green">PM</span> : ${currentPlayer.pm} / ${currentPlayer.maxPm}<br>
    <button id="cast-frappe">Frappe lourde</button>
    <button id="end-turn-btn">Fin de tour</button>
  `;
  document.getElementById('cast-frappe').addEventListener('click', () => {
    const enemy = currentPlayer === player1 ? player2 : player1;
    frappeLourde.cast(currentPlayer, enemy, board.container, () => {
      board.renderPlayers([player1, player2]);
      updateUIPanel();
    });
  });
  document.getElementById('end-turn-btn').addEventListener('click', endTurn);
}

// Affichage initial
updateUIPanel();

// Gestion du déplacement du joueur actif
document.querySelectorAll('.cell').forEach(cell => {
  console.log('Ajout listener sur cellule', cell.dataset.x, cell.dataset.y);
  cell.addEventListener('click', () => {
    console.log('Clic sur cellule', cell.dataset.x, cell.dataset.y, 'currentPlayer PM:', currentPlayer.pm);
    const x = parseInt(cell.dataset.x, 10);
    const y = parseInt(cell.dataset.y, 10);
    if (currentPlayer.moveTo({ x, y })) {
      board.renderPlayers([player1, player2]);
      updateUIPanel(); // Met à jour l'affichage après déplacement
    } else {
      console.log('Déplacement impossible pour', currentPlayer.name);
    }
  });
});
