// Classe Spell gérant le coût, la portée, les dégâts et l'animation du sort
export default class Spell {
  constructor(name, cost, minRange, maxRange, damage, targetType = 'player') {
    this.name = name;
    this.cost = cost;
    this.minRange = minRange;
    this.maxRange = maxRange;
    this.damage = damage;
    this.targetType = targetType; // 'player', 'cell', 'self', 'none'
  }

  cast(caster, target, boardContainer, callback, allPlayers = [], board = null) {
    if (caster.pa < this.cost) {
      console.log("PA insuffisants pour lancer", this.name);
      return;
    }
    let targetPos;
    if (this.targetType === 'player' && target && target.position) {
      targetPos = target.position;
    } else if (this.targetType === 'cell' && target && typeof target.x === 'number' && typeof target.y === 'number') {
      targetPos = target;
    } else if (this.targetType === 'self') {
      targetPos = caster.position;
    } else {
      targetPos = null;
    }
    if (targetPos) {
      const dist = Math.abs(targetPos.x - caster.position.x) + Math.abs(targetPos.y - caster.position.y);
      if (dist < this.minRange) {
        console.log("Cible trop proche pour", this.name);
        return;
      }
      if (dist > this.maxRange) {
        console.log("Cible hors portée pour", this.name);
        return;
      }
    }
    caster.pa -= this.cost;
    // Animation et effets classiques
    const spellEl = document.createElement('div');
    spellEl.className = 'spell-effect';
    if (this.name === 'Frappe lourde') {
      spellEl.classList.add('spell-frappe');
    } else if (this.name === 'Muspel') {
      spellEl.classList.add('spell-muspel');
    } else if (this.name === 'Coup de bouclier') {
      spellEl.classList.add('spell-frappe');
    }
    const fromCell = boardContainer.querySelector(`.cell[data-x="${caster.position.x}"][data-y="${caster.position.y}"]`);
    const toCell = targetPos ? boardContainer.querySelector(`.cell[data-x="${targetPos.x}"][data-y="${targetPos.y}"]`) : fromCell;
    const boardRect = boardContainer.getBoundingClientRect();
    const startRect = fromCell.getBoundingClientRect();
    const endRect = toCell.getBoundingClientRect();
    spellEl.style.left = (startRect.left - boardRect.left) + 'px';
    spellEl.style.top  = (startRect.top  - boardRect.top)  + 'px';
    boardContainer.appendChild(spellEl);
    const dx = endRect.left - startRect.left;
    const dy = endRect.top  - startRect.top;
    spellEl.animate([
      { transform: 'translate(0,0)' },
      { transform: `translate(${dx}px, ${dy}px)` }
    ], { duration: 500, easing: 'ease-out' });
    setTimeout(() => {
      boardContainer.removeChild(spellEl);
      if (this.name === 'Coup de bouclier') {
        // Dégâts
        target.takeDamage(this.damage);
        // Calcul de la direction de poussée
        const dirX = Math.sign(target.position.x - caster.position.x);
        const dirY = Math.sign(target.position.y - caster.position.y);
        let newX = target.position.x;
        let newY = target.position.y;
        for (let i = 0; i < 2; i++) {
          const nextX = newX + dirX;
          const nextY = newY + dirY;
          // Vérifie les bords, obstacles et joueurs
          const isOut = board && (nextX < 0 || nextY < 0 || nextX >= board.width || nextY >= board.height);
          const isObs = board && board.isObstacle(nextX, nextY);
          const isPlayer = allPlayers && allPlayers.some(p => p !== target && p.position.x === nextX && p.position.y === nextY);
          if (isOut || isObs || isPlayer) break;
          newX = nextX;
          newY = nextY;
        }
        // Déplace la cible si elle a bougé
        if (newX !== target.position.x || newY !== target.position.y) {
          target.position.x = newX;
          target.position.y = newY;
        }
      } else if (this.name === 'Muspel') {
        // Zone d'effet en croix de 1 autour de la cible
        const affected = [
          { x: targetPos.x, y: targetPos.y },
          { x: targetPos.x + 1, y: targetPos.y },
          { x: targetPos.x - 1, y: targetPos.y },
          { x: targetPos.x, y: targetPos.y + 1 },
          { x: targetPos.x, y: targetPos.y - 1 }
        ];
        affected.forEach(pos => {
          const cell = boardContainer.querySelector(`.cell[data-x="${pos.x}"][data-y="${pos.y}"]`);
          if (cell) {
            const impact = document.createElement('div');
            impact.className = 'spell-effect spell-muspel';
            impact.style.left = '0px';
            impact.style.top = '0px';
            impact.style.position = 'absolute';
            impact.style.pointerEvents = 'none';
            cell.appendChild(impact);
            impact.animate([
              { opacity: 1, transform: 'scale(1)' },
              { opacity: 0, transform: 'scale(1.5)' }
            ], { duration: 400, easing: 'ease-out' });
            setTimeout(() => cell.removeChild(impact), 400);
          }
        });
        allPlayers.forEach(p => {
          if (affected.some(pos => p.position.x === pos.x && p.position.y === pos.y)) {
            p.takeDamage(this.damage);
          }
        });
      } else if (this.targetType === 'player') {
        target.takeDamage(this.damage);
      } else if (this.targetType === 'self') {
        caster.heal(this.damage);
      }
      callback && callback();
    }, 500);
  }
}

// Sort de saut (jump) : déplace le joueur de 2 à 3 cases
export class JumpSpell extends Spell {
  constructor(name, cost, minRange, maxRange) {
    super(name, cost, minRange, maxRange, 0, 'cell');
  }

  cast(caster, targetPos, boardContainer, callback) {
    if (caster.pa < this.cost) {
      console.log("PA insuffisants pour lancer", this.name);
      return;
    }
    const dist = Math.abs(targetPos.x - caster.position.x) + Math.abs(targetPos.y - caster.position.y);
    if (dist < this.minRange) {
      console.log("Cible trop proche pour", this.name);
      return;
    }
    if (dist > this.maxRange) {
      console.log("Cible hors portée pour", this.name);
      return;
    }
    caster.pa -= this.cost;
    const jumpEl = document.createElement('div');
    jumpEl.className = 'spell-effect spell-jump';
    const fromCell = boardContainer.querySelector(`.cell[data-x="${caster.position.x}"][data-y="${caster.position.y}"]`);
    const toCell   = boardContainer.querySelector(`.cell[data-x="${targetPos.x}"][data-y="${targetPos.y}"]`);
    const boardRect = boardContainer.getBoundingClientRect();
    const startRect = fromCell.getBoundingClientRect();
    const endRect   = toCell.getBoundingClientRect();
    jumpEl.style.left = (startRect.left - boardRect.left) + 'px';
    jumpEl.style.top  = (startRect.top  - boardRect.top)  + 'px';
    boardContainer.appendChild(jumpEl);
    const dx = endRect.left - startRect.left;
    const dy = endRect.top  - startRect.top;
    jumpEl.animate([
      { transform: 'translate(0,0) scale(1)', offset: 0 },
      { transform: `translate(${dx/2}px, ${dy/2 - 40}px) scale(1.2)`, offset: 0.5 },
      { transform: `translate(${dx}px, ${dy}px) scale(1)`, offset: 1 }
    ], { duration: 500, easing: 'ease-in-out' });
    setTimeout(() => {
      boardContainer.removeChild(jumpEl);
      caster.position = { x: targetPos.x, y: targetPos.y };
      callback && callback();
    }, 500);
  }
}