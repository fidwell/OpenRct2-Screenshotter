import * as Environment from "../environment";
import Angle from "../models/angle";
import Interval from "../models/interval";
import IntervalUnit from "../models/intervalUnit";
import Options from "../models/options";
import OptionType from "../models/OptionType";

const storagePrefix = `${Environment.namespace}.`;

export default class Storage {
  private static loadSetting(key: string): any {
    return context.sharedStorage.get(`${storagePrefix}${key}`);
  }

  private static saveSetting(key: string, value: any) {
    context.sharedStorage.set(`${storagePrefix}${key}`, value);
  }

  static isEnabled(): boolean {
    return Storage.loadSetting(OptionType.IsEnabled) || false;
  }

  static disable(): void {
    Storage.saveSetting(OptionType.IsEnabled, false);
  }

  static loadSettings(): Options {
    const result: Options = new Options();

    result.isEnabled = Storage.isEnabled();
    result.zoom = Storage.loadSetting(OptionType.Zoom) || 0;
    result.rotation = Angle.all[Storage.loadSetting(OptionType.Rotation) || 0];

    const intervalUnit = Storage.loadSetting(OptionType.Units) || 0;
    const intervalAmount = Storage.loadSetting(OptionType.Interval) || 1;

    result.interval = new Interval(IntervalUnit.get(intervalUnit), intervalAmount);

    return result;
  }

  static saveSettings(options: Options) {
    Storage.saveSetting(OptionType.IsEnabled, options.isEnabled);
    Storage.saveSetting(OptionType.Zoom, options.zoom);
    Storage.saveSetting(OptionType.Rotation, options.rotation.id);
    Storage.saveSetting(OptionType.Units, options.interval.unit.id);
    Storage.saveSetting(OptionType.Interval, options.interval.amount);
  }
}
