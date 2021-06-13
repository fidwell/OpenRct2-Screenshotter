import * as Environment from "../environment";
import Angle from "../models/angle";
import Interval from "../models/interval";
import IntervalUnit from "../models/intervalUnit";
import OptionType from "../models/optionType";
import ZoomLevel from "../models/zoomLevel";

const storagePrefix = `${Environment.namespace}.`;

export default class Storage {
  private static isLoaded: boolean = false;

  private static isEnabled: boolean = false;

  private static zoom: ZoomLevel = ZoomLevel.getDefault();

  private static rotation: Angle = Angle.getDefault();

  private static interval: Interval = Interval.getDefault();

  private static loadSetting(key: string): any {
    return context.sharedStorage.get(`${storagePrefix}${key}`);
  }

  private static saveSetting(key: string, value: any) {
    context.sharedStorage.set(`${storagePrefix}${key}`, value);
  }

  private static loadSettings(): void {
    this.isEnabled = Storage.loadSetting(OptionType.IsEnabled) || false;
    this.zoom = ZoomLevel.all[Storage.loadSetting(OptionType.Zoom) || 0];
    this.rotation = Angle.all[Storage.loadSetting(OptionType.Rotation) || 0];

    const intervalUnit = Storage.loadSetting(OptionType.Units) || 0;
    const intervalAmount = Storage.loadSetting(OptionType.Interval) || 1;

    this.interval = new Interval(IntervalUnit.all[intervalUnit], intervalAmount);

    this.isLoaded = true;
  }

  static getIsEnabled(): boolean {
    if (!this.isLoaded) {
      this.loadSettings();
    }

    return this.isEnabled;
  }

  static setIsEnabled(value: boolean) {
    this.isEnabled = value;
    Storage.saveSetting(OptionType.IsEnabled, value);
  }

  static getZoom(): ZoomLevel {
    if (!this.isLoaded) {
      this.loadSettings();
    }

    return this.zoom;
  }

  static setZoom(value: ZoomLevel) {
    this.zoom = value;
    Storage.saveSetting(OptionType.Zoom, value.level);
  }

  static getRotation(): Angle {
    if (!this.isLoaded) {
      this.loadSettings();
    }

    return this.rotation;
  }

  static setRotation(value: Angle) {
    this.rotation = value;
    Storage.saveSetting(OptionType.Rotation, value.id);
  }

  static getInterval(): Interval {
    if (!this.isLoaded) {
      this.loadSettings();
    }

    return this.interval;
  }

  static setInterval(value: Interval) {
    this.interval = value;
    Storage.saveSetting(OptionType.Units, value.unit.id);
    Storage.saveSetting(OptionType.Interval, value.amount);
  }
}
