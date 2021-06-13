import * as Environment from "../environment";
import * as Log from "../utilities/logger";
import Angle from "../models/angle";
import Capturer from "../utilities/capturer";
import Options from "../models/options";
import Storage from "../utilities/storage";
import IntervalUnit, { IntervalUnitId } from "../models/intervalUnit";

// ---- Variables from old JS version. To refactor!

const zoomLevels = ["1:1", "2:1", "4:1", "8:1", "16:1", "32:1"];

const tickMultiplier = 100;

// ---- End variables from old JS version

export default class ScreenshotterWindow {
  onUpdate?: () => void;

  onClose?: () => void;

  private window?: Window;

  private options: Options = new Options();

  private inGameSubscription: IDisposable = null;

  private realTimeSubscription: number = 0;

  private sleeps: number = 0;

  private createWindow(): Window {
    const window = ui.openWindow({
      classification: Environment.namespace,
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
          items: Angle.getAll().map((a) => a.label),
          selectedIndex: this.options.rotation.id,
          onChange: (index) => {
            this.options.rotation = Angle.all[index];
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
          selectedIndex: this.options.zoom,
          onChange: (index) => {
            this.options.zoom = index;
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
          items: IntervalUnit.all.map((u) => u.label),
          selectedIndex: this.options.interval.unit.id,
          onChange: (index) => {
            this.options.interval.unit = IntervalUnit.get(index);
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
          text: `${this.options.interval.amount}`,
          onDecrement: () => {
            this.options.interval.decrement();
            this.updateSpinner();
          },
          onIncrement: () => {
            this.options.interval.increment();
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
          isChecked: this.options.isEnabled,
          onChange: (isChecked) => {
            this.options.isEnabled = isChecked;
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
          onClick: () => Capturer.capture(this.options)
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
    const text = this.options.interval.unit.id === IntervalUnitId.Ticks
      ? `${this.options.interval.amount * tickMultiplier}`
      : `${this.options.interval.amount}`;

    this.window.findWidget<SpinnerWidget>("intervalSpinner").text = text;
    this.settingsChanged();
  }

  private settingsChanged(): void {
    if (this.options.isEnabled) {
      this.enable();
    } else {
      this.disable();
    }

    Storage.saveSettings(this.options);
  }

  private enable(): void {
    let alertInterval = "";
    switch (this.options.interval.unit.id) {
      case 0: // In-game days
        alertInterval = `${this.options.interval.amount} days`;
        this.setInGameTime("interval.day");
        break;
      case 1: // In-game months
        alertInterval = `${this.options.interval.amount} months`;
        this.setInGameTime("interval.day");
        break;
      case 2: // In-game years
        alertInterval = `${this.options.interval.amount} years`;
        this.setInGameTime("interval.day");
        break;
      case 3: // Ticks
        alertInterval = `${this.options.interval.amount * tickMultiplier} ticks"`;
        this.setInGameTime("interval.tick");
        break;

      case 4: // Real-time seconds
        alertInterval = `${this.options.interval.amount} seconds`;
        this.setRealTime(this.options.interval.amount * 1000);
        break;
      case 5: // Real-time minutes
        alertInterval = `${this.options.interval.amount} minutes`;
        this.setRealTime(this.options.interval.amount * 1000 * 60);
        break;
      case 6: // Real-time hours
        alertInterval = `${this.options.interval.amount} hours`;
        this.setRealTime(this.options.interval.amount * 1000 * 60 * 60);
        break;
      default: // Unknown
        break;
    }

    this.sleeps = this.options.interval.amount;
    Log.debug(`Screenshotter enabled to every ${alertInterval}`);
  }

  private setInGameTime(type: HookType): void {
    if (this.inGameSubscription) this.inGameSubscription.dispose();
    this.inGameSubscription = context.subscribe(type, this.inGameTimeCapture);
  }

  private setRealTime(milliseconds: number): void {
    context.clearInterval(this.realTimeSubscription);
    this.realTimeSubscription = context.setInterval(() => Capturer.capture(this.options), milliseconds);
  }

  private disable(): void {
    if (this.inGameSubscription) {
      this.inGameSubscription.dispose();
    }

    context.clearInterval(this.realTimeSubscription);
    Log.debug("Screenshotter disabled");
  }

  private inGameTimeCapture(): void {
    switch (this.options.interval.unit.id) {
      case IntervalUnitId.Days:
      case IntervalUnitId.Ticks:
        this.sleeps -= 1;
        break;
      case IntervalUnitId.Months:
        if (date.day === 1) {
          this.sleeps -= 1;
        }
        break;
      case IntervalUnitId.Years:
        if (date.day === 1 && date.month === 0) {
          this.sleeps -= 1;
        }
        break;
      default:
        break;
    }

    if (this.sleeps <= 0) {
      Capturer.capture(this.options);
      this.resetSleepTimer();
    }
  }

  private resetSleepTimer(): void {
    this.sleeps = this.options.interval.unit.id === IntervalUnitId.Ticks
      ? this.options.interval.amount * tickMultiplier
      : this.options.interval.amount;
  }

  private loadSettings(): void {
    this.options = Storage.loadSettings();

    if (this.options.isEnabled) {
      this.enable();
    }
  }

  show(): void {
    if (this.window) {
      this.window.bringToFront();
    } else {
      this.loadSettings();
      this.window = this.createWindow();
    }
  }

  static close(): void {
    ui.closeWindows(Environment.namespace);
  }
}
