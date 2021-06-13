import * as Environment from "../environment";
import Timer from "../utilities/timer";

const windowAlertId = "screenshotterAlert";

export default class AlertWindow {
  private window?: Window;

  private timer?: Timer;

  constructor(timer: Timer) {
    this.timer = timer;
  }

  show(): void {
    const width = 270;
    const height = 66;

    this.window = ui.openWindow({
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
            this.timer.disable();
            this.window.close();
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
            this.window.close();
          }
        }
      ]
    });
  }
}
