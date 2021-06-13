import * as Environment from "../environment";

const storagePrefix = `${Environment.namespace}.`;

export default class Storage {
  static loadSetting(key: string): any {
    return context.sharedStorage.get(storagePrefix + key);
  }
}
