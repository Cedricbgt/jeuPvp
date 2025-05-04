import Player from './Player.js';
import Board from './Board.js';
import Spell, { JumpSpell } from './Spell.js';
import Obstacle from './Obstacle.js';

console.log('main.js module chargé');

// Définition de la taille de la grille
const GRID_WIDTH = 7;
const GRID_HEIGHT = 7;

// Instanciation des joueurs
const player1 = new Player('Joueur 1', 30, 5, 3, { x: 0, y: 0 });
const player2 = new Player('Joueur 2', 30, 5, 3, { x: GRID_WIDTH - 1, y: GRID_HEIGHT - 1 });

// Instanciation du sort pour joueur 1 et 2
const frappeLourde = new Spell('Frappe lourde', 2, 1, 1, 7, 'player');
const muspel = new Spell('Muspel', 3, 2, 5, 8, 'cell');
const saut = new JumpSpell('Saut', 2, 2, 3); 

// Export player
export { player1, player2 };

// Initialisation du plateau
const board = new Board(GRID_WIDTH, GRID_HEIGHT, 'board');
board.init();
// Ajout d'obstacles fixes
board.addObstacle(3, 3, { type: 'rock' });
board.addObstacle(2, 4, { type: 'rock' });
board.addObstacle(4, 2, { type: 'rock' });
console.log('Board initialisé - nb cellules:', board.container.querySelectorAll('.cell').length);
// Affichage des sprites 
board.renderPlayers([player1, player2]);
board.highlightMoveRange(player1); // Affiche la portée de déplacement au début

// Définition du joueur courant
let currentPlayer = player1;  // le joeur 1 commence
let selectedSpell = null;     // Sort sélectionné (null si aucun)
let spellTarget = null;       // Cible potentielle du sort

// Fonction pour terminer le tour
function endTurn() {
  selectedSpell = null;
  spellTarget = null;
  board.clearHighlights();
  console.log('Fin de tour pour', currentPlayer.name);
  currentPlayer = currentPlayer === player1 ? player2 : player1;
  currentPlayer.resetTurn();
  console.log('Nouveau joueur courant :', currentPlayer.name);
  board.renderPlayers([player1, player2]);
  board.highlightMoveRange(currentPlayer);
  board.highlightCurrentPlayerCell(currentPlayer);
  updateUIPanel();
}

// Fonction d'affichage des PA/PM du joueur courant
function updateUIPanel() {
  console.log('updateUIPanel', currentPlayer.name, 'PA:', currentPlayer.pa, 'PM:', currentPlayer.pm);
  const uiPanel = document.getElementById('ui-panel');
  const hpPercent = Math.round((currentPlayer.pv / currentPlayer.maxPv) * 100);
  uiPanel.innerHTML = `
    <strong>${currentPlayer.name}</strong><br>
    <span class="hp-bar"><span class="hp-bar-inner" style="width:${hpPercent}%;"></span></span>
    PV : ${currentPlayer.pv} / ${currentPlayer.maxPv}<br>
    <span style="color:blue">PA</span> : ${currentPlayer.pa} / ${currentPlayer.maxPa}<br>
    <span style="color:green">PM</span> : ${currentPlayer.pm} / ${currentPlayer.maxPm}<br>
    ${currentPlayer === player1 ? `<button id="cast-frappe">Frappe lourde</button> <button id="cast-jump">Saut</button>` : `<button id="cast-muspel">Muspel</button>`}
    <button id="end-turn-btn">Fin de tour</button>
  `;
  if (currentPlayer === player1) {
    document.getElementById('cast-frappe').addEventListener('click', () => {
      selectedSpell = frappeLourde;
      board.highlightSpellRange(currentPlayer, frappeLourde); // Affiche la portée du sort
    });
    document.getElementById('cast-jump').addEventListener('click', () => {
      selectedSpell = saut;
      board.highlightSpellRange(currentPlayer, saut); // Affiche la portée de saut
    });
  } else {
    document.getElementById('cast-muspel').addEventListener('click', () => {
      selectedSpell = muspel;
      board.highlightSpellRange(currentPlayer, muspel); // Affiche la portée du sort
    });
  }
  document.getElementById('end-turn-btn').addEventListener('click', endTurn);
}

// Affichage initial
updateUIPanel();


board.container.querySelectorAll('.cell').forEach(cell => {
  cell.addEventListener('click', () => {
    const x = parseInt(cell.dataset.x, 10);
    const y = parseInt(cell.dataset.y, 10);
    if (selectedSpell) {
      
      if (selectedSpell.targetType === 'cell') {
        // Saut : case vide uniquement
        if (selectedSpell === saut && currentPlayer === player1) {
          const isOccupied = (player1.position.x === x && player1.position.y === y) || (player2.position.x === x && player2.position.y === y);
          const dist = Math.abs(x - currentPlayer.position.x) + Math.abs(y - currentPlayer.position.y);
          if (!isOccupied && dist >= saut.minRange && dist <= saut.maxRange) {
            selectedSpell.cast(currentPlayer, { x, y }, board.container, () => {
              board.renderPlayers([player1, player2]);
              board.clearHighlights();
              board.highlightMoveRange(currentPlayer);
              board.highlightCurrentPlayerCell(currentPlayer);
              updateUIPanel();
            });
            selectedSpell = null;
          } else {
            selectedSpell = null;
            board.clearHighlights();
            board.highlightMoveRange(currentPlayer);
          }
          return;
        }
        // Muspel : zone d'effet, case dans la portée
        if (selectedSpell === muspel && currentPlayer === player2) {
          const dist = Math.abs(x - currentPlayer.position.x) + Math.abs(y - currentPlayer.position.y);
          if (dist >= muspel.minRange && dist <= muspel.maxRange) {
            selectedSpell.cast(currentPlayer, { x, y }, board.container, () => {
              board.renderPlayers([player1, player2]);
              board.clearHighlights();
              board.highlightMoveRange(currentPlayer);
              board.highlightCurrentPlayerCell(currentPlayer);
              updateUIPanel();
            }, [player1, player2]);
            selectedSpell = null;
          } else {
            selectedSpell = null;
            board.clearHighlights();
            board.highlightMoveRange(currentPlayer);
          }
          return;
        }
        
        selectedSpell = null;
        board.clearHighlights();
        board.highlightMoveRange(currentPlayer);
        return;
      }
      
      if (selectedSpell.targetType === 'player') {
        const target = (currentPlayer === player1) ? player2 : player1;
        if (target.position.x === x && target.position.y === y) {
          selectedSpell.cast(currentPlayer, target, board.container, () => {
            board.renderPlayers([player1, player2]);
            board.clearHighlights();
            board.highlightMoveRange(currentPlayer);
            board.highlightCurrentPlayerCell(currentPlayer);
            updateUIPanel();
          });
          selectedSpell = null;
        } else {
          selectedSpell = null;
          board.clearHighlights();
          board.highlightMoveRange(currentPlayer);
        }
        return;
      }
      // Gestion des sorts self (auto-ciblés)
      if (selectedSpell.targetType === 'self') {
        selectedSpell.cast(currentPlayer, currentPlayer, board.container, () => {
          board.renderPlayers([player1, player2]);
          board.clearHighlights();
          board.highlightMoveRange(currentPlayer);
          board.highlightCurrentPlayerCell(currentPlayer);
          updateUIPanel();
        });
        selectedSpell = null;
        return;
      }
    }
    // sinon gestion du déplacement
    const dx = x - currentPlayer.position.x;
    const dy = y - currentPlayer.position.y;
    const isDiagonal = Math.abs(dx) > 0 && Math.abs(dy) > 0;
    let canMove = true;
    if (isDiagonal) {
      //  les deux cases adjacentes à la diagonale
      const adj1 = board.isObstacle(currentPlayer.position.x + dx, currentPlayer.position.y);
      const adj2 = board.isObstacle(currentPlayer.position.x, currentPlayer.position.y + dy);
      if (adj1 || adj2) {
        canMove = false;
      }
    }
    if (canMove && !board.isObstacle(x, y) && currentPlayer.moveTo({ x, y })) {
      board.renderPlayers([player1, player2]);
      board.clearHighlights();
      board.highlightMoveRange(currentPlayer);
      board.highlightCurrentPlayerCell(currentPlayer);
      updateUIPanel();
    } else {
      console.log('Déplacement impossible pour', currentPlayer.name);
    }
  });
});
