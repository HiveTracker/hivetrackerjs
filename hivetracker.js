var HT_PACKAGE_MASK = 0x80;
var HT_BASE_MASK = 0x40;
var HT_AXIS_MASK = 0x20;
var HT_CHECKSUM_MASK = 0x0F;
var HT_PERIOD = 8333;
var HT_TICKS_PER_MICROSECOND = 16

function TrackerBLE() {
    var NORDIC_SERVICE = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
    var NORDIC_RX = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";
    var filters = [{ namePrefix: "HT" }];
    var services = [NORDIC_SERVICE];
    function TrackerSubscription() {
        this.device = null;
        this.unsubscribe = function () {
            if (this.device !== null) {
                this.device.gatt.disconnect();
            }
        };
    };

    this.subscribe = function (next, error, complete) {
        var checksum = 0;
		var byteIndex = 0;
        var byteBuffer = new Uint8Array(new ArrayBuffer(10));
        var subscription = new TrackerSubscription();
        navigator.bluetooth
            .requestDevice({ filters: filters, optionalServices: services })
            .then(function (device) {
                subscription.device = device;
                if (typeof complete === 'function') {
                    device.addEventListener('gattserverdisconnected', complete, { once: true });
                }
                return device.gatt.connect();
            })
            .then(function (server) { return server.getPrimaryService(NORDIC_SERVICE); })
            .then(function (service) { return service.getCharacteristic(NORDIC_RX); })
            .then(function (characteristic) {
                if (typeof next === 'function') {
                    characteristic.addEventListener('characteristicvaluechanged', function (event) {
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
                                var message = new TrackerMessage(byteBuffer, checksum);
                                next({ timeStamp: event.timeStamp, message: message });
                                byteBuffer = new Uint8Array(new ArrayBuffer(10));
                                byteIndex = 0;
                                checksum = 0;
                            }
                        }
                    });
                }
                return characteristic.startNotifications();
            })
            .catch(function (ex) {
                if (typeof error === 'function') {
                    error(ex);
                }
            });
        return subscription;
    };
}

function TrackerMessage(buffer, checksum) {
    this.base = (buffer[0] & HT_BASE_MASK) >> 6;
    this.axis = (buffer[0] & HT_AXIS_MASK) >> 5;
    this.centroid = [
        ((buffer[2] << 8 | buffer[3]) << 2) / HT_TICKS_PER_MICROSECOND,
        ((buffer[4] << 8 | buffer[5]) << 2) / HT_TICKS_PER_MICROSECOND,
        ((buffer[6] << 8 | buffer[7]) << 2) / HT_TICKS_PER_MICROSECOND,
        ((buffer[8] << 8 | buffer[9]) << 2) / HT_TICKS_PER_MICROSECOND];
    var chk = (buffer[0] & HT_CHECKSUM_MASK) << 4 | (buffer[1] & HT_CHECKSUM_MASK)
    this.valid = checksum == chk;
    this.buffer = buffer;
}

function TrackerState(messageH, messageV) {
    if (messageH.base != messageV.base) {
    }

    if (messageH.axis != 0) {
    }

    if (messageV.axis != 1) {
    }

    this.hits = [
        new SensorHit(messageH.centroid[0], messageV.centroid[0]),
        new SensorHit(messageH.centroid[1], messageV.centroid[1]),
        new SensorHit(messageH.centroid[2], messageV.centroid[2]),
        new SensorHit(messageH.centroid[3], messageV.centroid[3])];
    this.base = messageH.base;
    this.applyMatrix4 = function (matrix) {
        this.hits[0].direction.applyMatrix4(matrix);
        this.hits[1].direction.applyMatrix4(matrix);
        this.hits[2].direction.applyMatrix4(matrix);
        this.hits[3].direction.applyMatrix4(matrix);
    };
}

function SensorHit(timeH, timeV) {
    var angleH = timeH * Math.PI / HT_PERIOD - Math.PI / 2;
    var angleV = timeV * Math.PI / HT_PERIOD;
    this.direction = new THREE.Vector3(
        Math.sin(angleV) * Math.sin(-angleH),
        Math.cos(angleV),
        Math.sin(angleV) * Math.cos(-angleH));
    this.direction.normalize();
}

function SensorIntersection(hitA, matrixA, hitB, matrixB) {
    var u = hitA.direction.clone();
    var v = hitB.direction.clone();
    var p0 = new THREE.Vector3();
    var q0 = new THREE.Vector3();

    // get origin of vector
    p0.applyMatrix4(matrixA);
    q0.applyMatrix4(matrixB);

    // get endpoint of vector
    u.multiplyScalar(-1);
    v.multiplyScalar(-1);
    u.applyMatrix4(matrixA);
    v.applyMatrix4(matrixB);
    
    // new direction vector is endpoint - origin
    u.sub(p0);
    v.sub(q0);

    // line-line intersection algorithm
    var w0 = p0.clone();
    w0.sub(q0);
    var a = u.dot(u);
    var b = u.dot(v);
    var c = v.dot(v);
    var d = u.dot(w0);
    var e = v.dot(w0);
    var denom = a * c - b * b;
    if (denom >= 1e-6) {
        var s = (e * b - c * d) / denom;
        var t = (a * e - b * d) / denom;
        u.multiplyScalar(s);
        u.add(p0);
        v.multiplyScalar(t);
        v.add(q0);

        // average of both projections
        u.add(v);
        u.multiplyScalar(0.5);
        this.point = u;
    }
}

function Base(geometry, material, planeGeometry, planeMaterial) {
    var origin = new THREE.Vector3(0, 0, 0);
    var forward = new THREE.Vector3(0, 0, 1);
    var horizontalNormal = new THREE.Vector3(1, 0, 0);
    var verticalNormal = new THREE.Vector3(0, 1, 0);
    var normalMatrix = new THREE.Matrix3();
    this.mesh = new THREE.Mesh(geometry, material);
    this.horizontalMesh = new THREE.Mesh(planeGeometry, planeMaterial);
    this.verticalMesh = new THREE.Mesh(planeGeometry, planeMaterial);
    this.horizontalMesh.material.side = THREE.DoubleSide;
    this.verticalMesh.material.side = THREE.DoubleSide;
    this.horizontalPlane = new THREE.Plane(horizontalNormal, 0);
    this.verticalPlane = new THREE.Plane(verticalNormal, 0);
    this.forwardLine = new THREE.Line3(origin, forward);
    this.applyMatrix4 = function (matrix) {
        normalMatrix.getNormalMatrix(matrix);
        this.horizontalPlane.applyMatrix4(matrix, normalMatrix);
        this.verticalPlane.applyMatrix4(matrix, normalMatrix);
        this.forwardLine.applyMatrix4(matrix);
        this.mesh.applyMatrix(matrix);
        this.horizontalMesh.applyMatrix(matrix);
        this.verticalMesh.applyMatrix(matrix);
    };
}

function DirectionLine(lineMaterial) {
    var lineGeometry = new THREE.Geometry();
    lineGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
    lineGeometry.vertices.push(new THREE.Vector3(0, 0, 1));
    this.line = new THREE.Line(lineGeometry, lineMaterial);
    this.setVertices = function (p0, p1) {
        this.line.geometry.vertices[0] = p0;
        this.line.geometry.vertices[1] = p1;
        this.line.geometry.verticesNeedUpdate = true;
    };
}