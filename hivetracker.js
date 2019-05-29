var HT_PACKAGE_MASK = 0x80;
var HT_BASE_MASK = 0x40;
var HT_AXIS_MASK = 0x20;
var HT_CHECKSUM_MASK = 0x0F;
var HT_PERIOD = 8333;
var HT_TICKS_PER_MICROSECOND = 16.0

function TrackerMessage(buffer, checksum) {
    this.base = buffer[0] & HT_BASE_MASK;
    this.axis = buffer[0] & HT_AXIS_MASK;
    this.centroid = [
        ((buffer[2] << 8 | buffer[3]) << 2) / HT_TICKS_PER_MICROSECOND,
        ((buffer[4] << 8 | buffer[5]) << 2) / HT_TICKS_PER_MICROSECOND,
        ((buffer[6] << 8 | buffer[7]) << 2) / HT_TICKS_PER_MICROSECOND,
        ((buffer[8] << 8 | buffer[9]) << 2) / HT_TICKS_PER_MICROSECOND];
    var chk = (buffer[0] & HT_CHECKSUM_MASK) << 4 | (buffer[1] & HT_CHECKSUM_MASK)
    this.valid = checksum == chk;
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
    var angleH = timeH * Math.PI / HT_PERIOD;
    var angleV = timeV * Math.PI / HT_PERIOD;
    var horizontal = new THREE.Vector3(-Math.cos(angleH), 0, Math.sin(angleV));
    var vertical = new THREE.Vector3(0, -Math.cos(angleV), Math.sin(angleV));
    this.direction = new THREE.Vector3(0, 0, 0);
    this.direction.addVectors(horizontal, vertical);
    this.direction.normalize();
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