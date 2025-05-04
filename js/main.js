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
const coupBouclier = new Spell('Coup de bouclier', 2, 1, 1, 5, 'player');

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
  checkVictory();
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
    ${currentPlayer === player1 ? `<button id="cast-frappe">Frappe lourde</button> <button id="cast-jump">Saut</button>` : `<button id="cast-muspel">Muspel</button> <button id="cast-bouclier">Coup de bouclier</button>`}
    <button id="end-turn-btn">Fin de tour</button>
  `;
  if (currentPlayer === player1) {
    document.getElementById('cast-frappe').addEventListener('click', () => {
      selectedSpell = frappeLourde;
      board.highlightSpellRange(currentPlayer, frappeLourde);
    });
    document.getElementById('cast-jump').addEventListener('click', () => {
      selectedSpell = saut;
      board.highlightSpellRange(currentPlayer, saut);
    });
  } else {
    document.getElementById('cast-muspel').addEventListener('click', () => {
      selectedSpell = muspel;
      board.highlightSpellRange(currentPlayer, muspel);
    });
    document.getElementById('cast-bouclier').addEventListener('click', () => {
      selectedSpell = coupBouclier;
      board.highlightSpellRange(currentPlayer, coupBouclier);
    });
  }
  document.getElementById('end-turn-btn').addEventListener('click', endTurn);
}

// Affichage initial
updateUIPanel();

function checkVictory() {
  if (player1.pv <= 0) {
    showVictory('Joueur 2 gagne !');
  } else if (player2.pv <= 0) {
    showVictory('Joueur 1 gagne !');
  }
}

function showVictory(message) {
  const banner = document.getElementById('victory-banner');
  banner.querySelector('.victory-text').textContent = message;
  banner.classList.add('show');
  const replayBtn = banner.querySelector('.replay-btn');
  replayBtn.onclick = () => { window.location.reload(); };
}

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
              checkVictory();
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
              checkVictory();
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
          // Empêche d'attaquer si les deux joueurs sont déjà sur la même case (sécurité)
          if (currentPlayer.position.x === target.position.x && currentPlayer.position.y === target.position.y) {
            selectedSpell = null;
            board.clearHighlights();
            board.highlightMoveRange(currentPlayer);
            return;
          }
          selectedSpell.cast(currentPlayer, target, board.container, () => {
            board.renderPlayers([player1, player2]);
            board.clearHighlights();
            board.highlightMoveRange(currentPlayer);
            board.highlightCurrentPlayerCell(currentPlayer);
            updateUIPanel();
            checkVictory();
          }, [player1, player2], board);
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
          checkVictory();
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
    // Empêche le déplacement sur la case d'un autre joueur
    const isPlayerOnTarget = (player1.position.x === x && player1.position.y === y) || (player2.position.x === x && player2.position.y === y);
    if (!isPlayerOnTarget && canMove && !board.isObstacle(x, y) && currentPlayer.moveTo({ x, y })) {
      board.renderPlayers([player1, player2]);
      board.clearHighlights();
      board.highlightMoveRange(currentPlayer);
      board.highlightCurrentPlayerCell(currentPlayer);
      updateUIPanel();
      checkVictory();
    } else {
      console.log('Déplacement impossible pour', currentPlayer.name);
    }
  });
});

// Chargement asynchrone des images nécessaires au jeu
const assetsToLoadURLs = {
  ogre: { url: 'assets/images/ogre_idle.png' },
  valkyrie: { url: 'assets/images/Valkyrie_Idle.png' }
};

let loadedAssets;

window.onload = async function() {
  // Crée un élément temporaire pour le message de chargement
  const loadingDiv = document.createElement('div');
  loadingDiv.id = 'loading-message';
  loadingDiv.textContent = 'Chargement des images...';
  document.body.appendChild(loadingDiv);
  loadedAssets = await loadImages(assetsToLoadURLs);
  // Retire le message de chargement sans toucher au reste du DOM
  loadingDiv.remove();
  startGame();
};

async function loadImages(assetsToBeLoaded) {
  let assetsLoaded = {};
  let loadedAssets = 0;
  let numberOfAssetsToLoad = Object.keys(assetsToBeLoaded).length;
  return new Promise((resolve) => {
    for (let name in assetsToBeLoaded) {
      let url = assetsToBeLoaded[name].url;
      assetsLoaded[name] = new Image();
      assetsLoaded[name].onload = () => {
        loadedAssets++;
        if (loadedAssets >= numberOfAssetsToLoad) {
          resolve(assetsLoaded);
        }
      };
      assetsLoaded[name].src = url;
    }
  });
}

function startGame() {
  // Définition de la taille de la grille
  const GRID_WIDTH = 7;
  const GRID_HEIGHT = 7;

  // Instanciation des joueurs
  const player1 = new Player('Joueur 1', 30, 5, 3, { x: 0, y: 0 });
  const player2 = new Player('Joueur 2', 30, 5, 3, { x: GRID_WIDTH - 1, y: GRID_HEIGHT - 1 });

  // Instanciation des sorts
  const frappeLourde = new Spell('Frappe lourde', 2, 1, 1, 7, 'player');
  const muspel = new Spell('Muspel', 3, 2, 5, 8, 'cell');
  const saut = new JumpSpell('Saut', 2, 2, 3);
  const coupBouclier = new Spell('Coup de bouclier', 2, 1, 1, 5, 'player');

  // Export player (si besoin ailleurs)
  window.player1 = player1;
  window.player2 = player2;

  // Initialisation du plateau
  const board = new Board(GRID_WIDTH, GRID_HEIGHT, 'board');
  board.init();
  addCellListeners();
  // Ajout d'obstacles fixes
  board.addObstacle(3, 3, { type: 'rock' });
  board.addObstacle(2, 4, { type: 'rock' });
  board.addObstacle(4, 2, { type: 'rock' });
  board.renderPlayers([player1, player2]);
  board.highlightMoveRange(player1);

  // Définition du joueur courant
  let currentPlayer = player1;
  let selectedSpell = null;
  let spellTarget = null;

  // Fonction pour terminer le tour
  function endTurn() {
    selectedSpell = null;
    spellTarget = null;
    board.clearHighlights();
    currentPlayer = currentPlayer === player1 ? player2 : player1;
    currentPlayer.resetTurn();
    board.renderPlayers([player1, player2]);
    board.highlightMoveRange(currentPlayer);
    board.highlightCurrentPlayerCell(currentPlayer);
    updateUIPanel();
  }

  // Fonction d'affichage des PA/PM du joueur courant
  function updateUIPanel() {
    const uiPanel = document.getElementById('ui-panel');
    const hpPercent = Math.round((currentPlayer.pv / currentPlayer.maxPv) * 100);
    uiPanel.innerHTML = `
      <strong>${currentPlayer.name}</strong><br>
      <span class="hp-bar"><span class="hp-bar-inner" style="width:${hpPercent}%;"></span></span>
      PV : ${currentPlayer.pv} / ${currentPlayer.maxPv}<br>
      <span style="color:blue">PA</span> : ${currentPlayer.pa} / ${currentPlayer.maxPa}<br>
      <span style="color:green">PM</span> : ${currentPlayer.pm} / ${currentPlayer.maxPm}<br>
      ${currentPlayer === player1 ? `<button id="cast-frappe">Frappe lourde</button> <button id="cast-jump">Saut</button>` : `<button id="cast-muspel">Muspel</button> <button id="cast-bouclier">Coup de bouclier</button>`}
      <button id="end-turn-btn">Fin de tour</button>
    `;
    if (currentPlayer === player1) {
      document.getElementById('cast-frappe').addEventListener('click', () => {
        selectedSpell = frappeLourde;
        board.highlightSpellRange(currentPlayer, frappeLourde);
      });
      document.getElementById('cast-jump').addEventListener('click', () => {
        selectedSpell = saut;
        board.highlightSpellRange(currentPlayer, saut);
      });
    } else {
      document.getElementById('cast-muspel').addEventListener('click', () => {
        selectedSpell = muspel;
        board.highlightSpellRange(currentPlayer, muspel);
      });
      document.getElementById('cast-bouclier').addEventListener('click', () => {
        selectedSpell = coupBouclier;
        board.highlightSpellRange(currentPlayer, coupBouclier);
      });
    }
    document.getElementById('end-turn-btn').addEventListener('click', endTurn);
  }

  // Fonction de victoire
  function checkVictory() {
    if (player1.pv <= 0) {
      showVictory('Joueur 2 gagne !');
    } else if (player2.pv <= 0) {
      showVictory('Joueur 1 gagne !');
    }
  }
  function showVictory(message) {
    const banner = document.getElementById('victory-banner');
    banner.querySelector('.victory-text').textContent = message;
    banner.classList.add('show');
    const replayBtn = banner.querySelector('.replay-btn');
    replayBtn.onclick = () => { window.location.reload(); };
  }

  // Affichage initial
  updateUIPanel();

  function addCellListeners() {
    board.container.querySelectorAll('.cell').forEach(cell => {
      cell.onclick = null;
      cell.addEventListener('click', () => {
        const x = parseInt(cell.dataset.x, 10);
        const y = parseInt(cell.dataset.y, 10);
        if (selectedSpell) {
          if (selectedSpell.targetType === 'cell') {
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
                  checkVictory();
                });
                selectedSpell = null;
              } else {
                selectedSpell = null;
                board.clearHighlights();
                board.highlightMoveRange(currentPlayer);
              }
              return;
            }
            if (selectedSpell === muspel && currentPlayer === player2) {
              const dist = Math.abs(x - currentPlayer.position.x) + Math.abs(y - currentPlayer.position.y);
              if (dist >= muspel.minRange && dist <= muspel.maxRange) {
                selectedSpell.cast(currentPlayer, { x, y }, board.container, () => {
                  board.renderPlayers([player1, player2]);
                  board.clearHighlights();
                  board.highlightMoveRange(currentPlayer);
                  board.highlightCurrentPlayerCell(currentPlayer);
                  updateUIPanel();
                  checkVictory();
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
              if (currentPlayer.position.x === target.position.x && currentPlayer.position.y === target.position.y) {
                selectedSpell = null;
                board.clearHighlights();
                board.highlightMoveRange(currentPlayer);
                return;
              }
              selectedSpell.cast(currentPlayer, target, board.container, () => {
                board.renderPlayers([player1, player2]);
                board.clearHighlights();
                board.highlightMoveRange(currentPlayer);
                board.highlightCurrentPlayerCell(currentPlayer);
                updateUIPanel();
                checkVictory();
              }, [player1, player2], board);
              selectedSpell = null;
            } else {
              selectedSpell = null;
              board.clearHighlights();
              board.highlightMoveRange(currentPlayer);
            }
            return;
          }
          if (selectedSpell.targetType === 'self') {
            selectedSpell.cast(currentPlayer, currentPlayer, board.container, () => {
              board.renderPlayers([player1, player2]);
              board.clearHighlights();
              board.highlightMoveRange(currentPlayer);
              board.highlightCurrentPlayerCell(currentPlayer);
              updateUIPanel();
              checkVictory();
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
          const adj1 = board.isObstacle(currentPlayer.position.x + dx, currentPlayer.position.y);
          const adj2 = board.isObstacle(currentPlayer.position.x, currentPlayer.position.y + dy);
          if (adj1 || adj2) {
            canMove = false;
          }
        }
        const isPlayerOnTarget = (player1.position.x === x && player1.position.y === y) || (player2.position.x === x && player2.position.y === y);
        if (!isPlayerOnTarget && canMove && !board.isObstacle(x, y) && currentPlayer.moveTo({ x, y })) {
          board.renderPlayers([player1, player2]);
          board.clearHighlights();
          board.highlightMoveRange(currentPlayer);
          board.highlightCurrentPlayerCell(currentPlayer);
          updateUIPanel();
          checkVictory();
        } else {
          console.log('Déplacement impossible pour', currentPlayer.name);
        }
      });
    });
  }
}
