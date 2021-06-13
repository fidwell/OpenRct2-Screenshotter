import * as Environment from "../environment";
import Angle from "../models/angle";
import Capturer from "../utilities/capturer";
import IntervalUnit, { IntervalUnitId } from "../models/intervalUnit";
import Storage from "../utilities/storage";
import Timer from "../utilities/timer";
import ZoomLevel from "../models/zoomLevel";

export default class SettingsWindow {
  onUpdate?: () => void;

  onClose?: () => void;

  private window?: Window;

  private timer?: Timer;

  private createWindow(): Window {
    const window = ui.openWindow({
      classification: Environment.namespace,
      title: `${Environment.pluginName} (v${Environment.pluginVersion})`,
      width: 230,
      height: 265,
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
          items: Angle.all.map((a) => a.label),
          selectedIndex: Storage.getRotation().id,
          onChange: (index) => {
            Storage.setRotation(Angle.all[index]);
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
          items: ZoomLevel.all.map((z) => z.label),
          selectedIndex: Storage.getZoom().level,
          onChange: (index) => {
            Storage.setZoom(ZoomLevel.all[index]);
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
          selectedIndex: Storage.getInterval().unit.id,
          onChange: (index) => {
            const interval = Storage.getInterval();
            interval.unit = IntervalUnit.all[index];
            Storage.setInterval(interval);
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
          text: SettingsWindow.getSpinnerText(),
          onDecrement: () => {
            SettingsWindow.intervalDecrement();
            this.updateSpinner();
            this.settingsChanged();
          },
          onIncrement: () => {
            SettingsWindow.intervalIncrement();
            this.updateSpinner();
            this.settingsChanged();
          }
        },

        <GroupBoxWidget>{
          type: "groupbox",
          x: 10,
          y: 155,
          width: 210,
          height: 40,
          text: "Other options"
        },
        <CheckboxWidget>{
          type: "checkbox",
          x: 20,
          y: 170,
          width: 200,
          height: 16,
          text: "Transparent background",
          isChecked: Storage.getTransparent(),
          onChange: (isChecked) => {
            Storage.setTransparent(isChecked);
          }
        },

        <CheckboxWidget>{
          type: "checkbox",
          x: 10,
          y: 200,
          width: 210,
          height: 16,
          text: "Enabled",
          isChecked: Storage.getIsEnabled(),
          onChange: (isChecked) => {
            if (isChecked) {
              this.timer.enable();
            } else {
              this.timer.disable();
            }
          }
        },
        <ButtonWidget>{
          type: "button",
          x: 10,
          y: 220,
          width: 210,
          height: 16,
          text: "Take a screenshot now",
          onClick: () => Capturer.capture()
        },
        <LabelWidget>{
          type: "label",
          x: 10,
          y: 245,
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

  private static getSpinnerText(): string {
    const interval = Storage.getInterval();
    return interval.unit.id === IntervalUnitId.Ticks
      ? `${interval.amount * Timer.tickMultiplier}`
      : `${interval.amount}`;
  }

  private static intervalDecrement(): void {
    const interval = Storage.getInterval();
    interval.decrement();
    Storage.setInterval(interval);
  }

  private static intervalIncrement(): void {
    const interval = Storage.getInterval();
    interval.increment();
    Storage.setInterval(interval);
  }

  private updateSpinner(): void {
    this.window.findWidget<SpinnerWidget>("intervalSpinner").text = SettingsWindow.getSpinnerText();
  }

  private settingsChanged(): void {
    if (Storage.getIsEnabled()) {
      // Force a reload of settings
      this.timer.enable();
    }
  }

  constructor(timer: Timer) {
    this.timer = timer;
  }

  show(): void {
    if (this.window) {
      this.window.bringToFront();
    } else {
      this.window = this.createWindow();
    }
  }

  static close(): void {
    ui.closeWindows(Environment.namespace);
  }
}
