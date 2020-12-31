# Screenshotter

A plugin for OpenRCT2. It will save giant screenshots of your park on a fixed interval.

## Options

* **Enabled**: Turn the screenshotter on or off.
* **Viewport**
  * **Rotation angle**: Set the angle to take the screenshot from. North = 0, East = 1, etc. The compass directions don't actually mean anything, but it sounds nice?
  * **Zoom level**: Set the zoom level / resolution for the screenshot. 1:1 will be an exact pixel-level view. 16:1 and higher are basically useless, but it was easy enough to include them.
* **Interval**: Set how often we want to take the screenshot. We need two options: the units, and the amount.
* **Capture now**: Take a giant screenshot now, with the selected viewport options.

## Types of units

* In-game days: Takes a screenshot at the beginning of every day
* In-game months: Takes a screenshot on the first day of each month
* In-game years: Takes a screenshot on March 1st of each year
* Ticks: Takes a screenshot after the specified number of ticks have elapsed. *Warning!* This can cause noticable slowdown if you set this value too low.

Real-time minutes and hours are planned, but currently unavailable, since the plugin architecture doesn't support them.
 