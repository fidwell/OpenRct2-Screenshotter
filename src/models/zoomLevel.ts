export default class ZoomLevel {
  level: number;

  label: string;

  static all: ZoomLevel[] = [
    new ZoomLevel(0, "1:1"),
    new ZoomLevel(1, "2:1"),
    new ZoomLevel(2, "4:1"),
    new ZoomLevel(3, "8:1"),
    new ZoomLevel(4, "16:1"),
    new ZoomLevel(5, "32:1")
  ];

  static getDefault(): ZoomLevel {
    return ZoomLevel.all[0];
  }

  constructor(level: number, label: string) {
    this.level = level;
    this.label = label;
  }
}
