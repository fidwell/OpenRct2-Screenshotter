import * as Environment from "./environment";
import ScreenshotterWindow from "./screenshotterWindow";

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
    console.log("UI unavailable, plugin disabled.");
    return;
  }

  ui.registerMenuItem(Environment.pluginName, () => openWindow());
};

export default main;
