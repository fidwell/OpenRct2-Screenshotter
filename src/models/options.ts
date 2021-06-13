import Angle from "./angle";
import Interval from "./interval";
import ZoomLevel from "./zoomLevel";

export default class Options {
  isEnabled: boolean;

  zoom: ZoomLevel;

  rotation: Angle;

  interval: Interval;

  constructor() {
    this.isEnabled = false;
    this.zoom = ZoomLevel.getDefault();
    this.rotation = Angle.getDefault();
    this.interval = Interval.getDefault();
  }
}
