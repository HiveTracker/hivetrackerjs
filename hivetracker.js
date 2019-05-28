var HT_PACKAGE_MASK = 0x80;
var HT_BASE_MASK = 0x40;
var HT_AXIS_MASK = 0x20;
var HT_CHECKSUM_MASK = 0x0F;
var HT_PERIOD = 8333;
var HT_TICKS_PER_MICROSECOND = 16.0

function Message(buffer, checksum) {
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

function Hit(timeH, timeV) {
	var angleH = timeH * Math.PI / HT_PERIOD;
	var angleV = timeV * Math.PI / HT_PERIOD;
	var horizontal = new THREE.Vector3(-Math.cos(angleH), 0, Math.sin(angleV));
	var vertical = new THREE.Vector3(0, -Math.cos(angleV), Math.sin(angleV));
	this.direction = new THREE.Vector3(0, 0, 0);
	this.direction.addVectors(horizontal, vertical);
	this.direction.normalize();
}