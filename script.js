window.addEventListener('load', () => {
	console.log("Hello world");

	var button = document.getElementsByTagName('button')[0]

	var TI_BASE = "f0000000-0451-4000-b000-000000000000";
	var NORDIC_SERVICE = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
	var NORDIC_TX = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";
	var NORDIC_RX = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";

	var filters = [];
	filters.push({ services: [ 'battery_service' ] });

	function connectionDisconnectCallback(){

	}

	function openCallback(){

	}

	function receiveCallback(){

	}

	button.addEventListener('click', () => {
		navigator.bluetooth.requestDevice({
			acceptAllDevices: true,
			optionalServices: ['battery_service'] }).then(function(device) {

				deviceName = device.name;
				console.log('BT>  Device Name:       ' + device.name);
				console.log('BT>  Device ID:         ' + device.id);
				device.addEventListener('gattserverdisconnected', function() {
					console.log("BT> Disconnected (gattserverdisconnected)");
					closeSerial();
				}, {once:true});
				return device.gatt.connect();
			}).then(function(server) {
				console.log("BT> Connected");
				btServer = server;
				return server.getPrimaryService(NORDIC_SERVICE);
			}).then(function(service) {
				console.log("BT> Got service");
				btService = service;
				return btService.getCharacteristic(NORDIC_RX);
			}).then(function (characteristic) {
				rxCharacteristic = characteristic;
				console.log("BT> RX characteristic:"+JSON.stringify(rxCharacteristic));
				rxCharacteristic.addEventListener('characteristicvaluechanged', function(event) {
		        // In Chrome 50+, a DataView is returned instead of an ArrayBuffer.
		        var value = event.target.value.buffer;
		        console.log("BT> RX:"+JSON.stringify(ab2str(value)));
		        receiveCallback(value);
		      });
				return rxCharacteristic.startNotifications();
			}).then(function() {
				return btService.getCharacteristic(NORDIC_TX);
			}).then(function (characteristic) {
				txCharacteristic = characteristic;
				console.log("BT> TX characteristic:"+JSON.stringify(txCharacteristic));
			}).then(function() {
				txDataQueue = [];
				txInProgress = false;
		    Espruino.Core.Serial.setSlowWrite(false, true); // hack - leave throttling up to this implementation
		    setTimeout(function() {
		    	openCallback({ portName : deviceName });
		    }, 500);
		  }).catch(function(error) {
		  	console.log('BT> ERROR: ' + error);
		  	if (connectionDisconnectCallback) {
		  		connectionDisconnectCallback(undefined);
		  		connectionDisconnectCallback = undefined;
		  	}
		  });
		})
	})
