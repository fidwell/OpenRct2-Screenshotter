export default class Angle {
  id: number;

  label: string;

  isAll(): boolean {
    return this.id === 4;
  }

  static all: Angle[] = [
    new Angle(0, "0°"),
    new Angle(1, "90°"),
    new Angle(2, "180°"),
    new Angle(3, "270°"),
    new Angle(4, "All four")
  ];

  constructor(id: number, label: string) {
    this.id = id;
    this.label = label;
  }

  static getAll(): Angle[] {
    return this.all;
  }

  static getDefault(): Angle {
    return Angle.all[0];
  }
}
