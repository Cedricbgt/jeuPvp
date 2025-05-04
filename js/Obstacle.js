export default class Obstacle {
  constructor(x, y, options = {}) {
    this.x = x;
    this.y = y;
    this.type = options.type || 'rock';
    this.destructible = options.destructible || false;
    this.hp = options.hp || null;
    
  }
} 