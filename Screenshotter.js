const name = "Screenshotter";

const unitOptions = [
	"in-game days",
	"in-game months",
	"in-game years",
	"real-time minutes",
	"real-time hours"
];

var theWindow = null;
var subscription = null;
var sleeps = 0;

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
			height: 200,
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
				items: ["North","East","South","West"],
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
				items: ["1:1","2:1","4:1","8:1","16:1","32:1"],
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
				text: "Capture now",
				onClick: function () { capture(); }
			}
			]
		});
	});
}

function updateSpinner() {
	theWindow.findWidget(intervalSpinner.name).text = ("" + options.interval);
	setInterval();
}

function setInterval () {
	console.log(options.units);
	console.log(options.isEnabled);
	
	if (options.isEnabled) {
		var alertInterval = "";
		switch (options.units) {
			case 0: // In-game days
				console.log("days");
				alertInterval = "days";
				if (subscription) subscription.dispose();
				subscription = context.subscribe("interval.day", inGameTimeCapture);
				break;
			case 1: // In-game months
				console.log("months");
				alertInterval = "months";
				if (subscription) subscription.dispose();
				subscription = context.subscribe("interval.day", inGameTimeCapture);
				break;
			case 2: // In-game years
				console.log("years");
				alertInterval = "years";
				if (subscription) subscription.dispose();
				subscription = context.subscribe("interval.day", inGameTimeCapture);
				break;
			case 3: // Real-time minutes
				console.log("minutes");
				alertInterval = "minutes";
				// To do
				break;
			case 4: // Real-time hours
				console.log("hours");
				alertInterval = "hours";
				// To do
				break;
		}
		
		sleeps = options.interval;
		console.log("Screenshotter enabled to every " + options.interval + " " + alertInterval);
	} else {
		// If we disabled the screenshotter, dispose of the game-time subscription
		if (subscription) {
			subscription.dispose();
		}
		
		// To do: Dispose of real-time 
		
		makeAlert("Screenshotter disabled");
	}
}

function makeAlert(message) {
	park.postMessage({
		type: "award",
		text: message
	});
}

function inGameTimeCapture () {
	console.log("day " + date.day + " of month " + (date.month + 3) + ", year " + date.year);
	switch (options.units) {
		case 0: // In-game days
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
	context.captureImage({
		// filename: "", // Default (screenshot\park yyyy-mm-dd hh-mm-ss.png)
		// width: 0, // Default for giant screenshot
		// height: 0, // Default for giant screenshot
		// position: null, // Default for giant screenshot
		zoom: options.zoom,
		rotation: options.rotation
	});
	sleeps = options.interval; // Reset sleep timer
}

function main () {
	addMenuItem();
}

registerPlugin({
	name: name,
	version: "1.0",
	authors: ["fidwell"],
	type: "local",
	licence: "MIT",
	main: main
});
