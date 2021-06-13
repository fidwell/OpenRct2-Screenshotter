import Angle from "./angle";
import Interval from "./interval";

export default class Options {
  isEnabled: boolean;

  zoom: number;

  rotation: Angle;

  interval: Interval;

  constructor() {
    this.isEnabled = false;
    this.zoom = 0;
    this.rotation = Angle.getDefault();
    this.interval = Interval.getDefault();

    //this.units = 0;
    //this.interval = 1;
  }
}
