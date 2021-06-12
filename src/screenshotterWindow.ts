import * as Environment from "./environment";

const windowId = "screenshotter";

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

var options = {
  isEnabled: false,
  zoom: 0,
  rotation: 0,
  units: 0,
  interval: 1
};

export default class ScreenshotterWindow {
  onUpdate?: () => void;
  onClose?: () => void;

  private _window?: Window;

  private createWindow(): Window {
    let windowTitle = `${Environment.pluginName} (v${Environment.pluginVersion})`;

    const window = ui.openWindow({
      classification: windowId,
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

  private settingsChanged() {

  }

  private updateSpinner() {

  }

  private capture() {

  }

  show(): void {
    if (this._window) {
      this._window.bringToFront();
    } else {
      this._window = this.createWindow();
    }
  }

  close(): void {
    ui.closeWindows(windowId);
  }
}
