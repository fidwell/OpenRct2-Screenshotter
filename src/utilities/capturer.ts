import * as Log from "./logger";
import Storage from "./storage";

export default class Capturer {
  private static captureWithRotation(zoom: number, rotation: number): void {
    context.captureImage({
      // filename: "", // Default (screenshot\park yyyy-mm-dd hh-mm-ss.png)
      // width: 0, // Default for giant screenshot
      // height: 0, // Default for giant screenshot
      // position: null, // Default for giant screenshot
      zoom,
      rotation,
      // transparent: false // Default for giant screenshot
    });
  }

  static capture(): void {
    Log.debug("Capturing...");

    const rotation = Storage.getRotation();
    const zoom = Storage.getZoom();

    if (rotation.isAll()) {
      for (let x = 0; x < 4; x += 1) {
        Capturer.captureWithRotation(zoom.level, x);
      }
    } else {
      Capturer.captureWithRotation(zoom.level, rotation.id);
    }
  }
}
