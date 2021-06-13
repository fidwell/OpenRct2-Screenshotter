import Angle from "./angle";

export default class Options {
  isEnabled: boolean;

  zoom: number;

  rotation: Angle;

  units: number;

  interval: number;

  constructor() {
    this.isEnabled = false;
    this.zoom = 0;
    this.rotation = Angle.getDefault();
    this.units = 0;
    this.interval = 1;
  }
}
