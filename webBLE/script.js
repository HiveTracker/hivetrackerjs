var chart1 = new LineChart('plotB0A0', -0.05, 200);
var d1m00, d1m01, d1m10, d1m11;
var size = 500;
d1m00 = new LineBuffer(size);
d1m01 = new LineBuffer(size);
d1m10 = new LineBuffer(size);
d1m11 = new LineBuffer(size);

var render = setInterval(function () {
	chart1.clear();
    
    chart1.stroke(d1m00.points, "red");
    chart1.stroke(d1m01.points, "blue");
    chart1.stroke(d1m10.points, "magenta");
    chart1.stroke(d1m11.points, "black");
}, 100);

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
			if (message.valid && message.axis == 0 && message.base == 0) {
				d1m00.addValue(message.centroid[0]);
				d1m01.addValue(message.centroid[1]);
				d1m10.addValue(message.centroid[2]);
				d1m11.addValue(message.centroid[3]);
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
