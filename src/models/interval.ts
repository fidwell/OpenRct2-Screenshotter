import IntervalUnit from "./intervalUnit";

export default class Interval {
  unit: IntervalUnit;

  amount: number;

  constructor(unit: IntervalUnit, amount: number) {
    this.unit = unit;
    this.amount = amount;
  }

  static getDefault(): Interval {
    return new Interval(IntervalUnit.getDefault(), 1);
  }

  increment(): void {
    this.amount += 1;
  }

  decrement(): void {
    this.amount -= 1;
    if (this.amount < 1) {
      this.amount = 1;
    }
  }
}
