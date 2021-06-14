# Screenshotter for OpenRCT2

This plugin for will automatically save full-size screenshots of your park on a fixed interval.

## Features

* **Viewport**
  * **Rotation angle**: Set the angle to take the screenshot from. You can also have the tool take all four angles at once.
  * **Zoom level**: Set the zoom level / resolution for the screenshot. 1:1 will be an exact pixel-level view. (16:1 and higher are basically useless, but it was easy enough to include them.)
* **Interval**: Set how often we want to take the screenshot. We need two values: the units (see below), and the amount.
* **Transparent background**: If checked, the saved PNG file will have a transparent background instead of black.
* **Enabled**: Turn the tool on or off.
* **Take a screenshot now**: Take a giant screenshot now, with the selected viewport options.

These settings will persist between parks. When loading a park, the plugin will warn you if the tool is turned on, in case you don't want to automatically start taking screenshots.

### Types of units

* In-game days: Takes a screenshot at the beginning of every day, every _n_ days
* In-game months: Takes a screenshot on the first day of each month, every _n_ months
* In-game years: Takes a screenshot on March 1st of each year, every _n_ years
* Ticks: Takes a screenshot after the specified number of ticks have elapsed. *Warning!* This can cause noticeable slowdown if you set this value too low. Settable in increments of 100.
* Real-time seconds / minutes / hours: Takes a screenshot at the specified real-time interval. (This will happen regardless of whether the game is paused.)

### Performance

**Warning!** This plugin may cause performance issues under certain settings. The game may freeze briefly while the screenshot is saving, especially when saving a 1:1-size screenshot. Make sure to not set the interval too low when using this size.

### Planned features

* Custom filename / directory

Please submit any ideas under [issues](https://github.com/andrewsarnold/OpenRct2-Screenshotter/issues).

## Installation

1. This plugin requires at least OpenRCT2 version v0.3.3 (release) or the newest develop version.
2. Download the latest version of the plugin from the [Releases page](https://github.com/andrewsarnold/OpenRct2-Screenshotter/releases).
3. Put the downloaded .js file into your `/OpenRCT2/plugin` folder.
4. The plugin settings window can be found in-game in the dropdown menu under the map icon.

## Modifying this plugin

This plugin's codebase is based on [wisnia74's TypeScript template](https://github.com/wisnia74/openrct2-typescript-mod-template). See the steps in [Basssiiie's Ride Vehicle Editor plugin README](https://github.com/Basssiiie/OpenRCT2-RideVehicleEditor#building-the-source-code) for instructions on building and running the source code.

## Notes

Thanks to [wisnia74](https://github.com/wisnia74/openrct2-typescript-mod-template) for providing the template for this mod and readme. Thanks to [Basssiiie](https://github.com/Basssiiie/OpenRCT2-RideVehicleEditor) for additional templating for the source code and this README.
