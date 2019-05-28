var camera, scene, renderer, controls;
var plane, sphere, material;

init();
animate();

var base1, base2;

var hitB11, hitB12, hitB13, hitB14;
var hitB21, hitB22, hitB23, hitB24;
var diode1, diode2, diode3, diode4;
var tracker, angle;
var pivot, rotationAxis;

var chart1, chart2, chart3, chart4;
var d1m00, d1m01, d1m10, d1m11;
var d2m00, d2m01, d2m10, d2m11;
var d3m00, d3m01, d3m10, d3m11;
var d4m00, d4m01, d4m10, d4m11;

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

function polarToCart(angle, radius) {
  return {
    x: radius * Math.cos(angle),
    y: radius * Math.sin(angle)
  }
}

function angleToPlane(point, plane, forward) {
  var projection = new THREE.Vector3();
  var planeDistance = plane.distanceToPoint(point);
  projection.copy(plane.normal).multiplyScalar(-planeDistance).add(point);
  forward.closestPointToPoint(projection, false, projection);
  var forwardDistance = projection.sub(forward.start).length();
  return Math.atan(planeDistance / forwardDistance);
}

function angleMeasurements(position, base1, base2) {
  return {
    b0a0: angleToPlane(position, base1.horizontalPlane, base1.forwardLine),
    b0a1: angleToPlane(position, base1.verticalPlane, base1.forwardLine),
    b1a0: angleToPlane(position, base2.horizontalPlane, base2.forwardLine),
    b1a1: angleToPlane(position, base2.verticalPlane, base2.forwardLine)
  }
}

function init() {

  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10);
  camera.position.z = 1;

  // controls
  controls = new THREE.OrbitControls(camera);
  controls.rotateSpeed = 1.0;
  controls.zoomSpeed = 1.2;
  controls.panSpeed = 0.8;

  scene = new THREE.Scene();

  material = new THREE.MeshNormalMaterial();
  redMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  blueMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
  redPlaneMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.1 });
  bluePlaneMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff, transparent: true, opacity: 0.1 });
  plane = new THREE.PlaneBufferGeometry(2, 1, 1);
  plane.rotateY(THREE.Math.degToRad(90));
  plane.translate(0, 0, 1);
  sphere = new THREE.SphereGeometry(0.1);
  box = new THREE.BoxBufferGeometry(0.1, 0.1, 0.1);

  base1 = new Base(box, material, plane, redPlaneMaterial);
  var transform1 = new THREE.Matrix4();
  var position1 = new THREE.Vector3(0.6, 0.4, -0.4);
  var center1 = new THREE.Vector3(0, 0, 0);
  transform1.setPosition(position1);
  transform1.lookAt(center1, position1, base1.mesh.up);
  base1.applyMatrix4(transform1);

  base2 = new Base(box, material, plane, bluePlaneMaterial);
  var transform2 = new THREE.Matrix4();
  var position2 = new THREE.Vector3(-0.6, 0.4, -0.4);
  var center2 = new THREE.Vector3(0, 0, 0);
  transform2.setPosition(position2);
  transform2.lookAt(center2, position2, base2.mesh.up);
  base2.applyMatrix4(transform2);

  scene.add(base1.mesh);
  scene.add(base1.horizontalMesh);
  scene.add(base1.verticalMesh);
  scene.add(base2.mesh);
  scene.add(base2.horizontalMesh);
  scene.add(base2.verticalMesh);

  angle = 0.0;
  pivot = new THREE.Vector3(0, 0, 1);
  rotationAxis = new THREE.Vector3(0, 0.75, 0);
  pivot.applyMatrix4(transform2);
  rotationAxis.applyMatrix4(transform2);

  diode1 = new THREE.Mesh(sphere, material);
  diode1.position.set(-0.05, 0, 0.05);

  diode2 = new THREE.Mesh(sphere, material);
  diode2.position.set(0.05, 0, 0.05);

  diode3 = new THREE.Mesh(sphere, material);
  diode3.position.set(-0.05, 0, -0.05);

  diode4 = new THREE.Mesh(sphere, material);
  diode4.position.set(0.05, 0, -0.05);

  diode1.scale.set(0.15, 0.15, 0.15);
  diode2.scale.set(0.15, 0.15, 0.15);
  diode3.scale.set(0.15, 0.15, 0.15);
  diode4.scale.set(0.15, 0.15, 0.15);

  tracker = new THREE.Group();
  tracker.add(diode1);
  tracker.add(diode2);
  tracker.add(diode3);
  tracker.add(diode4);
  scene.add(tracker);

  hitB11 = new THREE.Mesh(sphere, redMaterial);
  hitB12 = new THREE.Mesh(sphere, redMaterial);
  hitB13 = new THREE.Mesh(sphere, redMaterial);
  hitB14 = new THREE.Mesh(sphere, redMaterial);
  hitB11.scale.set(0.1, 0.1, 0.1);
  hitB12.scale.set(0.1, 0.1, 0.1);
  hitB13.scale.set(0.1, 0.1, 0.1);
  hitB14.scale.set(0.1, 0.1, 0.1);
  scene.add(hitB11);
  scene.add(hitB12);
  scene.add(hitB13);
  scene.add(hitB14);

  hitB21 = new THREE.Mesh(sphere, blueMaterial);
  hitB22 = new THREE.Mesh(sphere, blueMaterial);
  hitB23 = new THREE.Mesh(sphere, blueMaterial);
  hitB24 = new THREE.Mesh(sphere, blueMaterial);
  hitB21.scale.set(0.1, 0.1, 0.1);
  hitB22.scale.set(0.1, 0.1, 0.1);
  hitB23.scale.set(0.1, 0.1, 0.1);
  hitB24.scale.set(0.1, 0.1, 0.1);
  scene.add(hitB21);
  scene.add(hitB22);
  scene.add(hitB23);
  scene.add(hitB24);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);

  var container = document.getElementById('canvas');
  container.appendChild(renderer.domElement);

  // plot canvas
  var scale = 200;
  chart1 = new LineChart('plotB0A0', scale);
  chart2 = new LineChart('plotB0A1', scale);
  chart3 = new LineChart('plotB1A0', scale);
  chart4 = new LineChart('plotB1A1', scale);

  // data buffers
  var size = 500;
  d1m00 = new LineBuffer(size);
  d1m01 = new LineBuffer(size);
  d1m10 = new LineBuffer(size);
  d1m11 = new LineBuffer(size);

  d2m00 = new LineBuffer(size);
  d2m01 = new LineBuffer(size);
  d2m10 = new LineBuffer(size);
  d2m11 = new LineBuffer(size);

  d3m00 = new LineBuffer(size);
  d3m01 = new LineBuffer(size);
  d3m10 = new LineBuffer(size);
  d3m11 = new LineBuffer(size);

  d4m00 = new LineBuffer(size);
  d4m01 = new LineBuffer(size);
  d4m10 = new LineBuffer(size);
  d4m11 = new LineBuffer(size);

}

function animate() {
  requestAnimationFrame(animate);
  controls.update();

  angle += 0.04;
  tracker.position.copy(pivot);
  tracker.position.applyAxisAngle(rotationAxis, angle);
  //var {x, y} = polarToCart(angle, 0.3);
  //diode.position.x = x;
  //diode.position.y = y;

  var diode1position = diode1.getWorldPosition();
  var diode2position = diode2.getWorldPosition();
  var diode3position = diode3.getWorldPosition();
  var diode4position = diode4.getWorldPosition();
  var data1 = angleMeasurements(diode1position, base1, base2);
  var data2 = angleMeasurements(diode2position, base1, base2);
  var data3 = angleMeasurements(diode3position, base1, base2);
  var data4 = angleMeasurements(diode4position, base1, base2);

  base1.horizontalPlane.projectPoint(diode1position, hitB11.position);
  base1.horizontalPlane.projectPoint(diode2position, hitB12.position);
  base1.horizontalPlane.projectPoint(diode3position, hitB13.position);
  base1.horizontalPlane.projectPoint(diode4position, hitB14.position);
  base2.horizontalPlane.projectPoint(diode1position, hitB21.position);
  base2.horizontalPlane.projectPoint(diode2position, hitB22.position);
  base2.horizontalPlane.projectPoint(diode3position, hitB23.position);
  base2.horizontalPlane.projectPoint(diode4position, hitB24.position);
  renderer.render(scene, camera);

  d1m00.addValue(data1.b0a0);
  d1m01.addValue(data1.b0a1);
  d1m10.addValue(data1.b1a0);
  d1m11.addValue(data1.b1a1);

  d2m00.addValue(data2.b0a0);
  d2m01.addValue(data2.b0a1);
  d2m10.addValue(data2.b1a0);
  d2m11.addValue(data2.b1a1);

  d3m00.addValue(data3.b0a0);
  d3m01.addValue(data3.b0a1);
  d3m10.addValue(data3.b1a0);
  d3m11.addValue(data3.b1a1);

  d4m00.addValue(data4.b0a0);
  d4m01.addValue(data4.b0a1);
  d4m10.addValue(data4.b1a0);
  d4m11.addValue(data4.b1a1);

  chart1.clear();
  chart2.clear();
  chart3.clear();
  chart4.clear();

  chart1.stroke(d1m00.points, "red");
  chart2.stroke(d1m01.points, "red");
  chart3.stroke(d1m10.points, "red");
  chart4.stroke(d1m11.points, "red");

  chart1.stroke(d2m00.points, "blue");
  chart2.stroke(d2m01.points, "blue");
  chart3.stroke(d2m10.points, "blue");
  chart4.stroke(d2m11.points, "blue");

  chart1.stroke(d3m00.points, "magenta");
  chart2.stroke(d3m01.points, "magenta");
  chart3.stroke(d3m10.points, "magenta");
  chart4.stroke(d3m11.points, "magenta");

  chart1.stroke(d4m00.points, "black");
  chart2.stroke(d4m01.points, "black");
  chart3.stroke(d4m10.points, "black");
  chart4.stroke(d4m11.points, "black");
}