import * as Environment from "./environment";
import * as Log from "./utilities/logger";
import AlertWindow from "./ui/alertWindow";
import SettingsWindow from "./ui/settingsWindow";
import Storage from "./utilities/storage";
import Timer from "./utilities/timer";

let timerInstance: Timer | null;
let windowInstance: SettingsWindow | null;

function openWindow(): void {
  // Show the current instance if one is active.
  if (windowInstance) {
    windowInstance.show();
    return;
  }

  const window = new SettingsWindow(timerInstance);

  window.onClose = (): void => {
    windowInstance = null;
  };

  window.show();
  windowInstance = window;
}

const main = (): void => {
  if (!Environment.isUiAvailable) {
    Log.warning("UI unavailable, plugin disabled.");
    return;
  }

  timerInstance = new Timer();

  if (Storage.getIsEnabled()) {
    new AlertWindow(timerInstance).show();
  }

  ui.registerMenuItem(Environment.pluginName, () => openWindow());
};

export default main;
