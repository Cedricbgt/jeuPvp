import Obstacle from './Obstacle.js';

export default class Board {
  constructor(width, height, containerId) {
    this.width = width;
    this.height = height;
    this.container = document.getElementById(containerId);
    this.obstacles = [];
  }

  init() {
    this.container.innerHTML = '';
    this.container.style.gridTemplateColumns = `repeat(${this.width}, 64px)`;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.x = x;
        cell.dataset.y = y;
        this.container.appendChild(cell);
      }
    }
  }

  renderPlayers(players) {
    // Nettoie les sprites précédents
    this.container.querySelectorAll('.cell').forEach(cell => { cell.innerHTML = ''; });
    this.renderObstacles();
    players.forEach((player, index) => {
      const sprite = document.createElement('div');
      sprite.classList.add('player', `player${index+1}`);
      // Utilisation des images chargées dynamiquement
      if (window.loadedAssets) {
        if (index === 0 && window.loadedAssets.ogre) {
          sprite.style.backgroundImage = `url('${window.loadedAssets.ogre.src}')`;
        } else if (index === 1 && window.loadedAssets.valkyrie) {
          sprite.style.backgroundImage = `url('${window.loadedAssets.valkyrie.src}')`;
        }
      }
      const cell = this.container.querySelector(`.cell[data-x="${player.position.x}"][data-y="${player.position.y}"]`);
      if (cell) {
        // Ajout de la barre de vie flottante
        const hpPercent = Math.max(0, Math.round((player.pv / player.maxPv) * 100));
        const hpBar = document.createElement('div');
        hpBar.className = 'hp-bar-plateau';
        hpBar.innerHTML = `<div class="hp-bar-plateau-inner" style="width:${hpPercent}%;"></div>`;
        cell.appendChild(hpBar);
        cell.appendChild(sprite);
      }
    });
  }

  // Affiche les obstacles sur la grille
  renderObstacles() {
    this.obstacles.forEach(obstacle => {
      const cell = this.container.querySelector(`.cell[data-x="${obstacle.x}"][data-y="${obstacle.y}"]`);
      if (cell) {
        const obsDiv = document.createElement('div');
        obsDiv.className = 'obstacle';
        obsDiv.title = obstacle.type;
        // On n'utilise plus loadedAssets.rock, on garde le fond CSS
        cell.appendChild(obsDiv);
      }
    });
  }

  // Ajoute un obstacle
  addObstacle(x, y, options = {}) {
    this.obstacles.push(new Obstacle(x, y, options));
  }

  // Vérifie s'il y a un obstacle sur une case
  isObstacle(x, y) {
    return this.obstacles.some(obs => obs.x === x && obs.y === y);
  }

  // Surligne les cases accessibles pour le déplacement
  highlightMoveRange(player) {
    this.clearHighlights();
    this.container.querySelectorAll('.cell').forEach(cell => {
      const x = parseInt(cell.dataset.x, 10);
      const y = parseInt(cell.dataset.y, 10);
      const dist = Math.abs(x - player.position.x) + Math.abs(y - player.position.y);
      if (dist > 0 && dist <= player.pm) {
        cell.classList.add('move-range');
      }
    });
  }

  // Surligne la portée d'un sort
  highlightSpellRange(player, spell) {
    this.clearHighlights();
    this.container.querySelectorAll('.cell').forEach(cell => {
      const x = parseInt(cell.dataset.x, 10);
      const y = parseInt(cell.dataset.y, 10);
      const dist = Math.abs(x - player.position.x) + Math.abs(y - player.position.y);
      if (dist >= spell.minRange && dist <= spell.maxRange) {
        cell.classList.add('spell-range');
      }
    });
  }

  // Retire tous les surlignages
  clearHighlights() {
    this.container.querySelectorAll('.cell').forEach(cell => {
      cell.classList.remove('move-range', 'spell-range');
    });
  }

  // Met en surbrillance la case du joueur courant
  highlightCurrentPlayerCell(player) {
    this.container.querySelectorAll('.cell').forEach(cell => {
      cell.classList.remove('selected');
    });
    const cell = this.container.querySelector(`.cell[data-x="${player.position.x}"][data-y="${player.position.y}"]`);
    if (cell) cell.classList.add('selected');
  }
}
