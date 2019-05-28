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
	console.log("Hello world");

	var button = document.getElementsByTagName('button')[0];
	var stop = document.getElementsByTagName('button')[1];
	var NORDIC_SERVICE = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
	var NORDIC_RX = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";

	var filters = [];
	var services = [];

	filters.push({namePrefix: "HT"});
	services.push(NORDIC_SERVICE);

	function connectionDisconnectCallback(){

	}

	function receiveCallback(){

	}

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
		var checksum = 0;
		var byteIndex = 0;
		var lineBuffer = "";
		var packetBuffer = [];
		var messageBuffer = [null, null, null, null];
		var byteBuffer = new Uint8Array(new ArrayBuffer(10));
		navigator.bluetooth.requestDevice({
			filters: filters,
		  optionalServices: services}).then(function(device) {

				deviceName = device.name;
				console.log('HT>  Device Name:       ' + device.name);
				console.log('HT>  Device ID:         ' + device.id);
				stop.addEventListener('click', () => {
					console.log("HT> Disconnect (stop!)");
					device.gatt.disconnect();
					var data = concatenate(packetBuffer);
					var link = document.createElement('a');
					link.download = 'data.json';
					var blob = new Blob([data], {type: 'application/octet-stream'});
					link.href = window.URL.createObjectURL(blob);
					link.click();
				}, {once:true});
				device.addEventListener('gattserverdisconnected', function() {
					console.log("HT> Disconnected (gattserverdisconnected)");
				}, {once:true});
				return device.gatt.connect();
			}).then(function(server) {
				console.log("HT> Connected");
				btServer = server;
				return server.getPrimaryService(NORDIC_SERVICE);
			}).then(function(service) {
				console.log("HT> Got service");
				btService = service;
				return btService.getCharacteristic(NORDIC_RX);
			}).then(function (characteristic) {
				rxCharacteristic = characteristic;
				console.log("HT> RX characteristic:"+JSON.stringify(rxCharacteristic));
				rxCharacteristic.addEventListener('characteristicvaluechanged', function (event) {
					var value = new Uint8Array(event.target.value.buffer);
					for (let i = 0; i < value.length; i++) {
						const element = value[i];
						if (byteIndex < 2) {
							if ((element & HT_PACKAGE_MASK) == 0) {
								byteIndex = 0;
								continue;
							}
						}
						else if (byteIndex % 2 != 0) checksum = (checksum + element) % 256;

						byteBuffer[byteIndex++] = element;
						if (byteIndex >= 10) {
							packetBuffer.push(byteBuffer);
							var message = new Message(byteBuffer, checksum);
							var messageIndex = message.base * 2 + message.axis;
							messageBuffer[messageIndex] = message;
							byteBuffer = new Uint8Array(new ArrayBuffer(10));
							byteIndex = 0;
							checksum = 0;
							if (message.valid && message.axis == 0 && message.base == 0) {
								d1m00.addValue(message.centroid[0]);
								d1m01.addValue(message.centroid[1]);
								d1m10.addValue(message.centroid[2]);
								d1m11.addValue(message.centroid[3]);
							}
						}
					}

					receiveCallback({ "timeStamp": event.timeStamp, "value": event.target.value });
				});
				return rxCharacteristic.startNotifications();
			}).catch(function(error) {
				console.log('BT> ERROR: ' + error);
				if (connectionDisconnectCallback) {
					connectionDisconnectCallback(undefined);
					connectionDisconnectCallback = undefined;
				}
    		});
		})
	})
