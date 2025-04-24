export default class Player {
  constructor(name, pv, pa, pm, position) {
    this.name = name;
    this.pv = pv;
    this.maxPv = pv;
    this.pa = pa;
    this.maxPa = pa;
    this.pm = pm;
    this.maxPm = pm;
    this.position = position;
  }

  takeDamage(amount) {
    this.pv = Math.max(this.pv - amount, 0);
  }

  heal(amount) {
    this.pv = Math.min(this.pv + amount, this.maxPv);
  }

  resetTurn() {
    this.pa = this.maxPa;
    this.pm = this.maxPm;
  }

  moveTo(newPosition) {
    // Calcul de la distance de Manhattan
    const distance = Math.abs(newPosition.x - this.position.x)
                   + Math.abs(newPosition.y - this.position.y);
    if (distance <= this.pm) {
      this.position = newPosition;
      this.pm -= distance;
      return true;
    }
    return false;
  }
}
