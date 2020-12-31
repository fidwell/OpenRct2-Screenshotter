const name = "Screenshotter";
const version = "0.9";
const author = "fidwell";

const unitOptions = [
	"in-game days",
	"in-game months",
	"in-game years",
	"ticks"
	//"real-time minutes",
	//"real-time hours",
	//"real-time seconds"
];
const zoomLevels = ["1:1","2:1","4:1","8:1","16:1","32:1"];
const rotations = ["0°","90°","180°","270°","All four"];

var theWindow = null;
var subscription = null; // In-game time
//var timeout = null; // Real-time
var sleeps = 0;
var tickMultiplier = 100;

var options = {
	isEnabled: false,
	zoom: 0,
	rotation: 0,
	units: 0,
	interval: 1
};

var intervalSpinner = {
	type: "spinner",
	name: "intervalSpinner",
	x: 90,
	y: 148,
	width: 120,
	height: 16,
	text: ("" + options.interval),
	onDecrement: function () {
		options.interval--;
		if (options.interval < 1) options.interval = 1;
		updateSpinner();
	},
	onIncrement: function () {
		options.interval++;
		updateSpinner();
	}
};

function addMenuItem () {
	 ui.registerMenuItem(name, function() {
		theWindow = ui.openWindow({
			title: name,
			id: 1,
			classification: name,
			width: 230,
			height: 220,
			widgets: [
			{
				type: "checkbox",
				x: 10,
				y: 20,
				width: 100,
				height: 16,
				text: "Enabled",
				isChecked: options.isEnabled,
				onChange: function (isChecked) {
					options.isEnabled = isChecked;
					setInterval();
				}
			},
			{
				type: "groupbox",
				x: 10,
				y: 40,
				width: 210,
				height: 60,
				text: "Viewport"
			},
			{
				type: "label",
				x: 20,
				y: 60,
				width: 100,
				height: 16,
				text: "Rotation angle:"
			},
			{
				type: "dropdown",
				x: 110,
				y: 58,
				width: 90,
				height: 16,
				items: rotations,
				selectedIndex: options.rotation,
				onChange: function (index) {
					options.rotation = index;
					setInterval();
				}
			},
			{
				type: "label",
				x: 20,
				y: 80,
				width: 100,
				height: 16,
				text: "Zoom level:"
			},
			{
				type: "dropdown",
				x: 110,
				y: 78,
				width: 90,
				height: 16,
				items: zoomLevels,
				selectedIndex: options.zoom,
				onChange: function (index) {
					options.zoom = index;
					setInterval();
				}
			},
			{
				type: "groupbox",
				x: 10,
				y: 110,
				width: 210,
				height: 60,
				text: "Interval"
			},
			{
				type: "label",
				x: 20,
				y: 130,
				width: 60,
				height: 16,
				text: "Units:"
			},
			{
				type: "dropdown",
				x: 90,
				y: 128,
				width: 120,
				height: 16,
				items: unitOptions,
				selectedIndex: options.units,
				onChange: function (index) {
					options.units = index;
					updateSpinner();
					setInterval();
				}
			},
			{
				type: "label",
				x: 20,
				y: 150,
				width: 60,
				height: 16,
				text: "Amount:"
			},
			intervalSpinner,
			{
				type: "button",
				x: 10,
				y: 175,
				width: 210,
				height: 16,
				text: "Take a screenshot now",
				onClick: function () { capture(); }
			},
			{
				type: "label",
				x: 10,
				y: 200,
				width: 210,
				height: 16,
				isDisabled: true,
				text: "Made by " + author + "; ver. " + version
			}
			]
		});
	});
}

function updateSpinner() {
	var text = options.units == 3 ? ("" + options.interval * tickMultiplier) : ("" + options.interval);
	
	theWindow.findWidget(intervalSpinner.name).text = text;
	setInterval();
}

function setInterval () {
	if (options.isEnabled) {
		var alertInterval = "";
		switch (options.units) {
			case 0: // In-game days
				alertInterval = (options.interval + " days");
				if (subscription) subscription.dispose();
				subscription = context.subscribe("interval.day", inGameTimeCapture);
				break;
			case 1: // In-game months
				alertInterval = (options.interval + " months");
				if (subscription) subscription.dispose();
				subscription = context.subscribe("interval.day", inGameTimeCapture);
				break;
			case 2: // In-game years
				alertInterval = (options.interval + " years");
				if (subscription) subscription.dispose();
				subscription = context.subscribe("interval.day", inGameTimeCapture);
				break;
			case 3: // Ticks
				alertInterval = ((options.interval * tickMultiplier) + " ticks");
				if (subscription) subscription.dispose();
				subscription = context.subscribe("interval.tick", inGameTimeCapture);
				break;
			
			/*
			
			Real-time stuff not available, as we do not
			have access to the "setTimeout" method.
			
			case 4: // Real-time minutes
				console.log("minutes");
				alertInterval = "minutes";
				timeout = setTimeout(realTimeCapture, options.interval * 60 * 1000);
				break;
			case 5: // Real-time hours
				console.log("hours");
				alertInterval = "hours";
				timeout = setTimeout(realTimeCapture, options.interval * 60 * 60 * 1000);
				break;
			case 6: // Real-time seconds
				console.log("seconds");
				alertInterval = "seconds";
				timeout = setTimeout(realTimeCapture, options.interval * 1000);
				break;
			*/
		}
		
		sleeps = options.interval;
		console.log("Screenshotter enabled to every " + alertInterval);
	} else {
		// If we disabled the screenshotter, dispose of the game-time subscription
		if (subscription) {
			subscription.dispose();
		}
		
		// To do: Dispose of real-time
		//window.clearTimeout(timeout);
		
		console.log("Screenshotter disabled");
	}
}

// function realTimeCapture () {
	// console.log("Pretending to capture");
// }

function inGameTimeCapture () {
	switch (options.units) {
		case 0: // In-game days
		case 3: // ticks
			sleeps--;
			break;
		case 1: // In-game months
			if (date.day == 1) {
				sleeps--;
			}
			break;
		case 2: // In-game years
			if (date.day == 1 && date.month == 0) {
				sleeps--;
			}
			break;
		default:
			break;
	}
	
	if (sleeps <= 0) {
		capture();
	}
}

function capture () {
	console.log("Capturing...")
	
	if (options.rotation == 4) {
		for (var x = 0; x < 4; x++) {
			captureWithRotation(x);
		}
	} else {
		captureWithRotation(options.rotation);
	}
	
	// Reset sleep timer
	sleeps = options.units == 3
		? options.interval * tickMultiplier
		: options.interval;
}

function captureWithRotation (rotation) {
	context.captureImage({
		// filename: "", // Default (screenshot\park yyyy-mm-dd hh-mm-ss.png)
		// width: 0, // Default for giant screenshot
		// height: 0, // Default for giant screenshot
		// position: null, // Default for giant screenshot
		zoom: options.zoom,
		rotation: rotation
	});
}

function main () {
	addMenuItem();
}

registerPlugin({
	name: name,
	version: version,
	authors: [author],
	type: "local",
	licence: "MIT",
	main: main
});
