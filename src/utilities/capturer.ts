import * as Log from "./logger";
import Options from "../models/options";

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

  static capture(options: Options): void {
    Log.debug("Capturing...");

    if (options.rotation.isAll()) {
      for (let x = 0; x < 4; x += 1) {
        Capturer.captureWithRotation(options.zoom, x);
      }
    } else {
      Capturer.captureWithRotation(options.zoom, options.rotation.id);
    }
  }
}
