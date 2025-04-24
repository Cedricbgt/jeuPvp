// Classe Spell gérant le coût, la portée, les dégâts et l'animation du sort
export default class Spell {
  constructor(name, cost, range, damage) {
    this.name = name;
    this.cost = cost;
    this.range = range;
    this.damage = damage;
  }

  cast(caster, target, boardContainer, callback) {
    // Vérification du coût en PA
    if (caster.pa < this.cost) {
      console.log("PA insuffisants pour lancer", this.name);
      return;
    }
    // Vérification de la portée (Manhattan)
    const dist = Math.abs(target.position.x - caster.position.x)
               + Math.abs(target.position.y - caster.position.y);
    if (dist > this.range) {
      console.log("Cible hors de portée pour", this.name);
      return;
    }
    caster.pa -= this.cost;

    // Création de l'animation du sort
    const spellEl = document.createElement('div');
    spellEl.className = 'spell-effect';

    const fromCell = boardContainer.querySelector(`.cell[data-x="${caster.position.x}"][data-y="${caster.position.y}"]`);
    const toCell   = boardContainer.querySelector(`.cell[data-x="${target.position.x}"][data-y="${target.position.y}"]`);
    const boardRect = boardContainer.getBoundingClientRect();
    const startRect = fromCell.getBoundingClientRect();
    const endRect   = toCell.getBoundingClientRect();

    // Position initiale
    spellEl.style.left = (startRect.left - boardRect.left) + 'px';
    spellEl.style.top  = (startRect.top  - boardRect.top)  + 'px';
    boardContainer.appendChild(spellEl);

    // Animation via Web Animations API
    const dx = endRect.left - startRect.left;
    const dy = endRect.top  - startRect.top;
    spellEl.animate([
      { transform: 'translate(0,0)' },
      { transform: `translate(${dx}px, ${dy}px)` }
    ], { duration: 500, easing: 'ease-out' });

    // Fin de l'animation: appliquer dégâts et callback
    setTimeout(() => {
      boardContainer.removeChild(spellEl);
      target.takeDamage(this.damage);
      callback && callback();
    }, 500);
  }
}