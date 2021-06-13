export default class Options {
  isEnabled: boolean;

  zoom: number;

  rotation: number;

  units: number;

  interval: number;

  constructor() {
    this.isEnabled = false;
    this.zoom = 0;
    this.rotation = 0;
    this.units = 0;
    this.interval = 1;
  }
}
