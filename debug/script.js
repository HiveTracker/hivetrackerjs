var size = 500;

var chart0 = new LineChart('plotB0A0', -0.01, 200);
var d0m00 = new LineBuffer(size);
var d0m01 = new LineBuffer(size);
var d0m10 = new LineBuffer(size);
var d0m11 = new LineBuffer(size);

var render = setInterval(function () {
	chart0.clear();

    chart0.stroke(d0m00.points, "red");
    chart0.stroke(d0m01.points, "blue");
    chart0.stroke(d0m10.points, "magenta");
    chart0.stroke(d0m11.points, "black");
}, 100);

///////////////////////////////////////////////////////
var chart1 = new LineChart('plotB0A1', -0.01, 200);
var d1m00 = new LineBuffer(size);
var d1m01 = new LineBuffer(size);
var d1m10 = new LineBuffer(size);
var d1m11 = new LineBuffer(size);

var render = setInterval(function () {
	chart1.clear();

    chart1.stroke(d1m00.points, "red");
    chart1.stroke(d1m01.points, "blue");
    chart1.stroke(d1m10.points, "magenta");
    chart1.stroke(d1m11.points, "black");
}, 100);

///////////////////////////////////////////////////////
var chart2 = new LineChart('plotB1A0', -0.01, 200);
var d2m00 = new LineBuffer(size);
var d2m01 = new LineBuffer(size);
var d2m10 = new LineBuffer(size);
var d2m11 = new LineBuffer(size);

var render = setInterval(function () {
	chart2.clear();

    chart2.stroke(d2m00.points, "red");
    chart2.stroke(d2m01.points, "blue");
    chart2.stroke(d2m10.points, "magenta");
    chart2.stroke(d2m11.points, "black");
}, 100);

///////////////////////////////////////////////////////
var chart3 = new LineChart('plotB1A1', -0.01, 200);
var d3m00 = new LineBuffer(size);
var d3m01 = new LineBuffer(size);
var d3m10 = new LineBuffer(size);
var d3m11 = new LineBuffer(size);

var render = setInterval(function () {
	chart3.clear();

    chart3.stroke(d3m00.points, "red");
    chart3.stroke(d3m01.points, "blue");
    chart3.stroke(d3m10.points, "magenta");
    chart3.stroke(d3m11.points, "black");
}, 100);

///////////////////////////////////////////////////////
window.addEventListener('load', () => {
	var button = document.getElementsByTagName('button')[0];
	var stop = document.getElementsByTagName('button')[1];
	var packetBuffer = [];

	function concatenate(buf) {
		return buf.reduce(function (c, x, i) {
			if (i == 0) return c;
			var tmp = new Uint8Array(c.byteLength + x.byteLength);
			tmp.set(new Uint8Array(c), 0);
			tmp.set(new Uint8Array(x), c.byteLength);
			return tmp.buffer;
		}, buf[0]);
	}

	button.addEventListener('click', () => {
		var tracker = new TrackerBLE();
		var subscription = tracker.subscribe(evt => {
			var message = evt.message;
			packetBuffer.push(message.buffer);

            console.log(message.centroid);

			if (message.axis == 0 && message.base == 0) {
				d0m00.addValue(message.valid * message.centroid[0]);
				d0m01.addValue(message.valid * message.centroid[1]);
				d0m10.addValue(message.valid * message.centroid[2]);
				d0m11.addValue(message.valid * message.centroid[3]);
			}
			if (message.axis == 0 && message.base == 1) {
				d1m00.addValue(message.valid * message.centroid[0]);
				d1m01.addValue(message.valid * message.centroid[1]);
				d1m10.addValue(message.valid * message.centroid[2]);
				d1m11.addValue(message.valid * message.centroid[3]);
			}
			if (message.axis == 1 && message.base == 0) {
				d2m00.addValue(message.valid * message.centroid[0]);
				d2m01.addValue(message.valid * message.centroid[1]);
				d2m10.addValue(message.valid * message.centroid[2]);
				d2m11.addValue(message.valid * message.centroid[3]);
			}
			if (message.axis == 1 && message.base == 1) {
				d3m00.addValue(message.valid * message.centroid[0]);
				d3m01.addValue(message.valid * message.centroid[1]);
				d3m10.addValue(message.valid * message.centroid[2]);
				d3m11.addValue(message.valid * message.centroid[3]);
			}
		});

		stop.addEventListener('click', () => {
			subscription.unsubscribe();
			var data = concatenate(packetBuffer);
			var link = document.createElement('a');
			link.download = 'data.json';
			var blob = new Blob([data], { type: 'application/octet-stream' });
			link.href = window.URL.createObjectURL(blob);
			link.click();
		}, { once: true });
	});
});
