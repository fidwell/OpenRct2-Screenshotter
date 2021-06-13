import * as Environment from "./environment";
import * as Log from "./utilities/logger";

const namespace = "screenshotter";
const windowAlertId = "screenshotterAlert";
const storagePrefix = `${namespace}.`;

// ---- Variables from old JS version. To refactor!

const unitOptions = [
  "in-game days",
  "in-game months",
  "in-game years",
  "ticks",
  "real-time seconds",
  "real-time minutes",
  "real-time hours"
];
const zoomLevels = ["1:1", "2:1", "4:1", "8:1", "16:1", "32:1"];
const rotations = ["0°", "90°", "180°", "270°", "All four"];

const tickMultiplier = 100;

const options = {
  isEnabled: false,
  zoom: 0,
  rotation: 0,
  units: 0,
  interval: 1
};

// ---- End variables from old JS version

export default class ScreenshotterWindow {
  onUpdate?: () => void;

  onClose?: () => void;

  private window?: Window;

  private inGameSubscription: IDisposable = null;

  private realTimeSubscription: number = 0;

  private sleeps: number = 0;

  private createWindow(): Window {
    const window = ui.openWindow({
      classification: namespace,
      title: `${Environment.pluginName} (v${Environment.pluginVersion})`,
      width: 230,
      height: 220,
      widgets: [
        <GroupBoxWidget>{
          type: "groupbox",
          x: 10,
          y: 20,
          width: 210,
          height: 60,
          text: "Viewport"
        },
        <LabelWidget>{
          type: "label",
          x: 20,
          y: 40,
          width: 100,
          height: 16,
          text: "Rotation angle:"
        },
        <DropdownWidget>{
          type: "dropdown",
          x: 110,
          y: 38,
          width: 90,
          height: 16,
          items: rotations,
          selectedIndex: options.rotation,
          onChange: (index) => {
            options.rotation = index;
            this.settingsChanged();
          }
        },
        <LabelWidget>{
          type: "label",
          x: 20,
          y: 60,
          width: 100,
          height: 16,
          text: "Zoom level:"
        },
        <DropdownWidget>{
          type: "dropdown",
          x: 110,
          y: 58,
          width: 90,
          height: 16,
          items: zoomLevels,
          selectedIndex: options.zoom,
          onChange: (index) => {
            options.zoom = index;
            this.settingsChanged();
          }
        },
        <GroupBoxWidget>{
          type: "groupbox",
          x: 10,
          y: 90,
          width: 210,
          height: 60,
          text: "Interval"
        },
        <LabelWidget>{
          type: "label",
          x: 20,
          y: 110,
          width: 60,
          height: 16,
          text: "Units:"
        },
        <DropdownWidget>{
          type: "dropdown",
          x: 90,
          y: 108,
          width: 120,
          height: 16,
          items: unitOptions,
          selectedIndex: options.units,
          onChange: (index) => {
            options.units = index;
            this.updateSpinner();
            this.settingsChanged();
          }
        },
        <LabelWidget>{
          type: "label",
          x: 20,
          y: 130,
          width: 60,
          height: 16,
          text: "Amount:"
        },
        <SpinnerWidget>{
          type: "spinner",
          name: "intervalSpinner",
          x: 90,
          y: 128,
          width: 120,
          height: 16,
          text: `${options.interval}`,
          onDecrement: () => {
            options.interval -= 1;
            if (options.interval < 1) options.interval = 1;
            this.updateSpinner();
          },
          onIncrement: () => {
            options.interval += 1;
            this.updateSpinner();
          }
        },
        <CheckboxWidget>{
          type: "checkbox",
          x: 10,
          y: 155,
          width: 210,
          height: 16,
          text: "Enabled",
          isChecked: options.isEnabled,
          onChange: (isChecked) => {
            options.isEnabled = isChecked;
            this.settingsChanged();
          }
        },
        <ButtonWidget>{
          type: "button",
          x: 10,
          y: 175,
          width: 210,
          height: 16,
          text: "Take a screenshot now",
          onClick: () => ScreenshotterWindow.capture()
        },
        <LabelWidget>{
          type: "label",
          x: 10,
          y: 200,
          width: 210,
          height: 16,
          isDisabled: true,
          text: `Made by ${Environment.pluginAuthors.join(", ")}; ver. ${Environment.pluginVersion}`
        }
      ],
      onUpdate: () => {
        if (this.onUpdate) {
          this.onUpdate();
        }
      },
      onClose: () => {
        if (this.onClose) {
          this.onClose();
        }
      }
    });

    return window;
  }

  private updateSpinner(): void {
    const text = options.units === 3
      ? `${options.interval * tickMultiplier}`
      : `${options.interval}`;

    this.window.findWidget<SpinnerWidget>("intervalSpinner").text = text;
    this.settingsChanged();
  }

  private settingsChanged(): void {
    if (options.isEnabled) {
      this.enable();
    } else {
      this.disable();
    }

    ScreenshotterWindow.saveSettings();
  }

  private enable(): void {
    let alertInterval = "";
    switch (options.units) {
      case 0: // In-game days
        alertInterval = `${options.interval} days`;
        this.setInGameTime("interval.day");
        break;
      case 1: // In-game months
        alertInterval = `${options.interval} months`;
        this.setInGameTime("interval.day");
        break;
      case 2: // In-game years
        alertInterval = `${options.interval} years`;
        this.setInGameTime("interval.day");
        break;
      case 3: // Ticks
        alertInterval = `${options.interval * tickMultiplier} ticks"`;
        this.setInGameTime("interval.tick");
        break;

      case 4: // Real-time seconds
        alertInterval = `${options.interval} seconds`;
        this.setRealTime(options.interval * 1000);
        break;
      case 5: // Real-time minutes
        alertInterval = `${options.interval} minutes`;
        this.setRealTime(options.interval * 1000 * 60);
        break;
      case 6: // Real-time hours
        alertInterval = `${options.interval} hours`;
        this.setRealTime(options.interval * 1000 * 60 * 60);
        break;
      default: // Unknown
        break;
    }

    this.sleeps = options.interval;
    Log.debug(`Screenshotter enabled to every ${alertInterval}`);
  }

  private setInGameTime(type): void {
    if (this.inGameSubscription) this.inGameSubscription.dispose();
    this.inGameSubscription = context.subscribe(type, this.inGameTimeCapture);
  }

  private setRealTime(milliseconds): void {
    context.clearInterval(this.realTimeSubscription);
    this.realTimeSubscription = context.setInterval(ScreenshotterWindow.capture, milliseconds);
  }

  private disable(): void {
    if (this.inGameSubscription) {
      this.inGameSubscription.dispose();
    }

    context.clearInterval(this.realTimeSubscription);
    Log.debug("Screenshotter disabled");
  }

  private inGameTimeCapture(): void {
    switch (options.units) {
      case 0: // In-game days
      case 3: // ticks
        this.sleeps -= 1;
        break;
      case 1: // In-game months
        if (date.day === 1) {
          this.sleeps -= 1;
        }
        break;
      case 2: // In-game years
        if (date.day === 1 && date.month === 0) {
          this.sleeps -= 1;
        }
        break;
      default:
        break;
    }

    if (this.sleeps <= 0) {
      ScreenshotterWindow.capture();
      this.resetSleepTimer();
    }
  }

  private static capture(): void {
    Log.debug("Capturing...");

    if (options.rotation === 4) {
      for (let x = 0; x < 4; x += 1) {
        ScreenshotterWindow.captureWithRotation(x);
      }
    } else {
      ScreenshotterWindow.captureWithRotation(options.rotation);
    }
  }

  private resetSleepTimer(): void {
    this.sleeps = options.units === 3
      ? options.interval * tickMultiplier
      : options.interval;
  }

  private static captureWithRotation(rotation): void {
    context.captureImage({
      // filename: "", // Default (screenshot\park yyyy-mm-dd hh-mm-ss.png)
      // width: 0, // Default for giant screenshot
      // height: 0, // Default for giant screenshot
      // position: null, // Default for giant screenshot
      zoom: options.zoom,
      rotation
    });
  }

  private static saveSettings(): void {
    ScreenshotterWindow.saveSetting("isEnabled", options.isEnabled);
    ScreenshotterWindow.saveSetting("zoom", options.zoom);
    ScreenshotterWindow.saveSetting("rotation", options.rotation);
    ScreenshotterWindow.saveSetting("units", options.units);
    ScreenshotterWindow.saveSetting("interval", options.interval);
  }

  private static saveSetting(key, value): void {
    context.sharedStorage.set(`${storagePrefix}${key}`, value);
  }

  private loadSettings(): void {
    options.isEnabled = ScreenshotterWindow.loadSetting("isEnabled") || false;
    options.zoom = ScreenshotterWindow.loadSetting("zoom") || 0;
    options.rotation = ScreenshotterWindow.loadSetting("rotation") || 0;
    options.units = ScreenshotterWindow.loadSetting("units") || 0;
    options.interval = ScreenshotterWindow.loadSetting("interval") || 1;

    if (options.isEnabled) {
      this.enable();
      this.showLoadAlert();
    }
  }

  private showLoadAlert(): void {
    const width = 270;
    const height = 66;

    const alert = ui.openWindow({
      title: Environment.pluginName,
      classification: windowAlertId,
      width,
      height,
      x: ui.width / 2 - width / 2,
      y: ui.height / 2 - height / 2,
      widgets: [
        <LabelWidget>{
          type: "label",
          x: 10,
          y: 20,
          width: 260,
          height: 16,
          text: "Warning: Screenshotter is currently running."
        },
        <ButtonWidget>{
          type: "button",
          x: 10,
          y: 40,
          width: 120,
          height: 16,
          text: "Disable",
          onClick: () => {
            options.isEnabled = false;
            this.settingsChanged();
            alert.close();
          }
        },
        <ButtonWidget>{
          type: "button",
          x: 140,
          y: 40,
          width: 120,
          height: 16,
          text: "Leave enabled",
          onClick: () => {
            alert.close();
          }
        }
      ]
    });
  }

  private static loadSetting(key): any {
    return context.sharedStorage.get(storagePrefix + key);
  }

  show(): void {
    if (this.window) {
      this.window.bringToFront();
    } else {
      this.window = this.createWindow();
    }
  }

  static close(): void {
    ui.closeWindows(namespace);
  }
}
