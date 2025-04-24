export default class Board {
  constructor(width, height, containerId) {
    this.width = width;
    this.height = height;
    this.container = document.getElementById(containerId);
  }

  init() {
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
    players.forEach((player, index) => {
      const sprite = document.createElement('div');
      sprite.classList.add('player', `player${index+1}`);
      const cell = this.container.querySelector(`.cell[data-x="${player.position.x}"][data-y="${player.position.y}"]`);
      if (cell) cell.appendChild(sprite);
    });
  }
}
