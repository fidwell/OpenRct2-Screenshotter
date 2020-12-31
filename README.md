# Screenshotter

A plugin for OpenRCT2. It will save giant screenshots of your park on a fixed interval.

## Options

* **Enabled**: Turn the screenshotter on or off.
* **Viewport**
  * **Rotation angle**: Set the angle to take the screenshot from. You can also have the tool take all four angles at once.
  * **Zoom level**: Set the zoom level / resolution for the screenshot. 1:1 will be an exact pixel-level view. 16:1 and higher are basically useless, but it was easy enough to include them.
* **Interval**: Set how often we want to take the screenshot. We need two values: the units (see below), and the amount.
* **Take a screenshot now**: Take a giant screenshot now, with the selected viewport options.

## Types of units

* In-game days: Takes a screenshot at the beginning of every day, every X day
* In-game months: Takes a screenshot on the first day of each month, every X month
* In-game years: Takes a screenshot on March 1st of each year, every X year
* Ticks: Takes a screenshot after the specified number of ticks have elapsed. *Warning!* This can cause noticeable slowdown if you set this value too low.

Real-time minutes and hours are planned, but currently unavailable, since the plugin architecture doesn't support them.
