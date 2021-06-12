import * as Environment from "./environment";

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

var inGameSubscription = null;
var realTimeSubscription = 0;
var sleeps = 0;
var tickMultiplier = 100;

var options = {
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

  private _window?: Window;

  private createWindow(): Window {
    let windowTitle = `${Environment.pluginName} (v${Environment.pluginVersion})`;

    const window = ui.openWindow({
      classification: namespace,
      title: windowTitle,
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
          onChange: function (index) {
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
          onChange: function (index) {
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
          onChange: function (index) {
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
          text: ("" + options.interval),
          onDecrement: function () {
            options.interval--;
            if (options.interval < 1) options.interval = 1;
            this.updateSpinner();
          },
          onIncrement: function () {
            options.interval++;
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
          onChange: function (isChecked) {
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
          onClick: function () { this.capture(); }
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
    var text = options.units === 3
      ? ("" + options.interval * tickMultiplier)
      : ("" + options.interval);

    this._window.findWidget<SpinnerWidget>("intervalSpinner").text = text;
    this.settingsChanged();
  }

  private settingsChanged(): void {
    if (options.isEnabled) {
      this.enable();
    } else {
      this.disable();
    }

    this.saveSettings();
  }

  private enable(): void {
    var alertInterval = "";
    switch (options.units) {
      case 0: // In-game days
        alertInterval = (options.interval + " days");
        this.setInGameTime("interval.day");
        break;
      case 1: // In-game months
        alertInterval = (options.interval + " months");
        this.setInGameTime("interval.day");
        break;
      case 2: // In-game years
        alertInterval = (options.interval + " years");
        this.setInGameTime("interval.day");
        break;
      case 3: // Ticks
        alertInterval = ((options.interval * tickMultiplier) + " ticks");
        this.setInGameTime("interval.tick");
        break;

      case 4: // Real-time seconds
        alertInterval = (options.interval + " seconds");
        this.setRealTime(options.interval * 1000);
        break;
      case 5: // Real-time minutes
        alertInterval = (options.interval + " minutes");
        this.setRealTime(options.interval * 1000 * 60);
        break;
      case 6: // Real-time hours
        alertInterval = (options.interval + " hours");
        this.setRealTime(options.interval * 1000 * 60 * 60);
        break;
    }

    sleeps = options.interval;
    console.log("Screenshotter enabled to every " + alertInterval);
  }

  private setInGameTime(type): void {
    if (inGameSubscription) inGameSubscription.dispose();
    inGameSubscription = context.subscribe(type, this.inGameTimeCapture);
  }

  private setRealTime(milliseconds): void {
    context.clearInterval(realTimeSubscription);
    realTimeSubscription = context.setInterval(this.capture, milliseconds);
  }

  private disable(): void {
    if (inGameSubscription) {
      inGameSubscription.dispose();
    }

    context.clearInterval(realTimeSubscription);
    console.log("Screenshotter disabled");
  }

  private inGameTimeCapture(): void {
    switch (options.units) {
      case 0: // In-game days
      case 3: // ticks
        sleeps--;
        break;
      case 1: // In-game months
        if (date.day === 1) {
          sleeps--;
        }
        break;
      case 2: // In-game years
        if (date.day === 1 && date.month === 0) {
          sleeps--;
        }
        break;
      default:
        break;
    }

    if (sleeps <= 0) {
      this.capture();
      this.resetSleepTimer();
    }
  }

  private capture(): void {
    console.log("Capturing...")

    if (options.rotation === 4) {
      for (var x = 0; x < 4; x++) {
        this.captureWithRotation(x);
      }
    } else {
      this.captureWithRotation(options.rotation);
    }
  }

  private resetSleepTimer(): void {
    sleeps = options.units === 3
      ? options.interval * tickMultiplier
      : options.interval;
  }

  private captureWithRotation(rotation): void {
    context.captureImage({
      // filename: "", // Default (screenshot\park yyyy-mm-dd hh-mm-ss.png)
      // width: 0, // Default for giant screenshot
      // height: 0, // Default for giant screenshot
      // position: null, // Default for giant screenshot
      zoom: options.zoom,
      rotation: rotation
    });
  }

  private saveSettings(): void {
    this.saveSetting("isEnabled", options.isEnabled);
    this.saveSetting("zoom", options.zoom);
    this.saveSetting("rotation", options.rotation);
    this.saveSetting("units", options.units);
    this.saveSetting("interval", options.interval);
  }

  private saveSetting(key, value): void {
    context.sharedStorage.set(storagePrefix + key, value);
  }

  private loadSettings(): void {
    options.isEnabled = this.loadSetting("isEnabled") || false;
    options.zoom = this.loadSetting("zoom") || 0;
    options.rotation = this.loadSetting("rotation") || 0;
    options.units = this.loadSetting("units") || 0;
    options.interval = this.loadSetting("interval") || 1;

    if (options.isEnabled) {
      this.enable();
      this.showLoadAlert();
    }
  }

  private showLoadAlert(): void {
    const width = 270;
    const height = 66;

    var alert = ui.openWindow({
      title: Environment.pluginName,
      classification: windowAlertId,
      width: width,
      height: height,
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
          onClick: function () {
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
          onClick: function () {
            alert.close();
          }
        }
      ]
    });
  }

  private loadSetting(key): any {
    return context.sharedStorage.get(storagePrefix + key);
  }

  show(): void {
    if (this._window) {
      this._window.bringToFront();
    } else {
      this._window = this.createWindow();
    }
  }

  close(): void {
    ui.closeWindows(namespace);
  }
}
