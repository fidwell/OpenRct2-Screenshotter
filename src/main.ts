import * as Environment from "./environment";
import * as Log from "./utilities/logger";
import ScreenshotterWindow from "./ui/screenshotterWindow";
import Storage from "./utilities/storage";
import AlertWindow from "./ui/alertWindow";

let windowInstance: ScreenshotterWindow | null;

function openWindow(): void {
  // Show the current instance if one is active.
  if (windowInstance) {
    windowInstance.show();
    return;
  }

  const window = new ScreenshotterWindow();

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

  if (Storage.isEnabled()) {
    new AlertWindow().show();
  }

  ui.registerMenuItem(Environment.pluginName, () => openWindow());
};

export default main;
