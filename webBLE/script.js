var HT_PACKAGE_MASK = 0x80;
var HT_BASE_MASK = 0x40;
var HT_AXIS_MASK = 0x20;
var HT_CHECKSUM_MASK = 0x0F;

function Message(buffer, checksum) {
	this.base = buffer[0] & HT_BASE_MASK;
	this.axis = buffer[0] & HT_AXIS_MASK;
	this.centroid = [
		buffer[2] << 8 | buffer[3],
		buffer[4] << 8 | buffer[5],
		buffer[6] << 8 | buffer[7],
		buffer[8] << 8 | buffer[9]];
	var chk = (buffer[0] & HT_CHECKSUM_MASK) << 4 | (buffer[1] & HT_CHECKSUM_MASK)
	this.valid = checksum == chk;
}

window.addEventListener('load', () => {
	console.log("Hello world");

	var button = document.getElementsByTagName('button')[0];
	var stop = document.getElementsByTagName('button')[1];
	var input = document.getElementsByTagName('input')[0];
 	var output = document.getElementsByTagName('div')[0];

	var txCharacteristic;

	var NORDIC_SERVICE = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
	var NORDIC_TX = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";
	var NORDIC_RX = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";

	var filters = [];
	var services = [];

	filters.push({namePrefix: "HT"});
	services.push(NORDIC_SERVICE);

	function connectionDisconnectCallback(){

	}

	function openCallback(){

	}

	function receiveCallback(){

	}

	function ab2str(buf) {
	  return String.fromCharCode.apply(null, new Uint8Array(buf));
	}

	function str2ab(str) {
	  var buf = new ArrayBuffer(str.length);
	  var bufView = new Uint8Array(buf);
	  for (var i=0, strLen=str.length; i<strLen; i++) {
	    bufView[i] = str.charCodeAt(i);
	  }
	  return buf;
	}

	input.addEventListener("keyup", function(event) {
		event.preventDefault();
		if (event.keyCode === 13) {
			if (txCharacteristic){
				console.log("HT> Sending "+ input.value);
				txCharacteristic.writeValue(str2ab(input.value)).then(function() {
					console.log("HT> Sent");
					input.value = "";
				});
			}
		}
	});

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
							message = new Message(byteBuffer, checksum);
							byteBuffer = new Uint8Array(new ArrayBuffer(10));
							byteIndex = 0;
							checksum = 0;
						}
					}

					receiveCallback({ "timeStamp": event.timeStamp, "value": event.target.value });
				});
				return rxCharacteristic.startNotifications();
			}).then(function() {
				return btService.getCharacteristic(NORDIC_TX);
			}).then(function (characteristic) {
				txCharacteristic = characteristic;
				console.log("BT> TX characteristic:"+JSON.stringify(txCharacteristic));
    	}).catch(function(error) {
    	console.log('BT> ERROR: ' + error);
    	if (connectionDisconnectCallback) {
    		connectionDisconnectCallback(undefined);
    		connectionDisconnectCallback = undefined;
    	}
    });
		})
	})
