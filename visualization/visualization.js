var camera, scene, renderer, controls;
var plane, sphere, material;
var base1, base2, directionLine1, directionLine2, triangulation;
var transform1, transform2;

var tracker, subscription, state1, state2;
var messageBuffer = [null, null, null, null];

init();
animate();

function initTracker() {
  var button = document.getElementsByTagName('button')[0];
  var stop = document.getElementsByTagName('button')[1];

  var angleH = document.getElementsByTagName('input')[0];
  var angleV = document.getElementsByTagName('input')[1];
  var angleH2 = document.getElementsByTagName('input')[2];
  var angleV2 = document.getElementsByTagName('input')[3];
  messageBuffer[0] = { base: 0, axis: 0, centroid: [angleH.value, 0, 0, 0], valid: true };
  messageBuffer[1] = { base: 0, axis: 1, centroid: [angleV.value, 0, 0, 0], valid: true };
  messageBuffer[2] = { base: 1, axis: 0, centroid: [angleH2.value, 0, 0, 0], valid: true };
  messageBuffer[3] = { base: 1, axis: 1, centroid: [angleV2.value, 0, 0, 0], valid: true };
  state1 = new TrackerState(messageBuffer[0], messageBuffer[1]);
  state2 = new TrackerState(messageBuffer[2], messageBuffer[3]);

  angleH.oninput = function () {
    var messageH =
    {
      base: 0,
      axis: 0,
      centroid: [angleH.value, 0, 0, 0],
      valid: true
    };
    messageBuffer[0] = messageH;
    var messageV = messageBuffer[1];
    if (messageV !== null && messageH.valid && messageV.valid) {
      state1 = new TrackerState(messageH, messageV);
    }
  };

  angleV.oninput = function () {
    var messageV =
    {
      base: 0,
      axis: 1,
      centroid: [angleV.value, 0, 0, 0],
      valid: true
    };
    messageBuffer[1] = messageV;
    var messageH = messageBuffer[0];
    if (messageH !== null && messageH.valid && messageV.valid) {
      state1 = new TrackerState(messageH, messageV);
    }
  };

  angleH2.oninput = function () {
    var messageH2 =
    {
      base: 0,
      axis: 0,
      centroid: [angleH2.value, 0, 0, 0],
      valid: true
    };
    messageBuffer[2] = messageH2;
    var messageV2 = messageBuffer[3];
    if (messageV2 !== null && messageH2.valid && messageV2.valid) {
      state2 = new TrackerState(messageH2, messageV2);
    }
  };

  angleV2.oninput = function () {
    var messageV2 =
    {
      base: 0,
      axis: 1,
      centroid: [angleV2.value, 0, 0, 0],
      valid: true
    };
    messageBuffer[3] = messageV2;
    var messageH2 = messageBuffer[2];
    if (messageH2 !== null && messageH2.valid && messageV2.valid) {
      state2 = new TrackerState(messageH2, messageV2);
    }
  };

  button.addEventListener('click', () => {
    tracker = new TrackerBLE();
    subscription = tracker.subscribe(evt => {
      var message = evt.message;
      var messageIndex = message.base * 2 + message.axis;
      messageBuffer[messageIndex] = message;
      if (message.base == 0 && message.axis == 1) {
        var messageH = messageBuffer[messageIndex - 1];
        var messageV = messageBuffer[messageIndex];
        if (messageH !== null && messageH.valid && messageV.valid) {
          state1 = new TrackerState(messageH, messageV);
        }
      }
    });

    stop.addEventListener('click', () => {
			subscription.unsubscribe();
		}, { once: true });
  });
}

function init() {

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10);
  camera.position.z = 1;

  var material = new THREE.MeshNormalMaterial();
  var redMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  var redPlaneMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.1 });
  var bluePlaneMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff, transparent: true, opacity: 0.1 });
  var plane = new THREE.PlaneBufferGeometry(2, 1, 1);
  plane.rotateY(THREE.Math.degToRad(90));
  plane.translate(0, 0, -1);
  sphere = new THREE.SphereGeometry(0.01);
  box = new THREE.BoxBufferGeometry(0.1, 0.1, 0.1);

  triangulation = new THREE.Mesh(sphere, redMaterial);
  scene.add(triangulation);

  base1 = new Base(box, material, plane, redPlaneMaterial);
  transform1 = new THREE.Matrix4();
  transform1.set(
    -0.5283118, -0.1285292, 0.8392657, 0,
    0.3147103, 0.8884206, 0.3341649, 0,
    -0.7885709, 0.4406688, -0.4289137, 0,
    -2.088987, 2.483953, -0.7352041, 1);
  transform1.transpose();
  base1.applyMatrix4(transform1);

  base2 = new Base(box, material, plane, bluePlaneMaterial);
  transform2 = new THREE.Matrix4();
  transform2.set(
    -0.05143319, -0.02879849, 0.998261, 0,
    0.5376514, -0.8431603, 0.003377263, 0,
    0.841597, 0.5368903, 0.05884998, 0,
    2.705675, 2.303431, 0.376483, 1);
  transform2.transpose();
  base2.applyMatrix4(transform2);

  scene.add(base1.mesh);
  scene.add(base1.horizontalMesh);
  scene.add(base1.verticalMesh);
  scene.add(base2.mesh);
  scene.add(base2.horizontalMesh);
  scene.add(base2.verticalMesh);

  var lineMaterial1 = new THREE.LineBasicMaterial({ color: 0x0000ff });
  directionLine1 = new DirectionLine(lineMaterial1);
  scene.add(directionLine1.line);

  var lineMaterial2 = new THREE.LineBasicMaterial({ color: 0xff0000 });
  directionLine2 = new DirectionLine(lineMaterial2);
  scene.add(directionLine2.line);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);

  // controls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.rotateSpeed = 1.0;
  controls.zoomSpeed = 1.2;
  controls.panSpeed = 0.8;

  var container = document.getElementById('canvas');
  container.appendChild(renderer.domElement);

  initTracker();
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();

  if (state1 !== undefined) {
    var direction = state1.hits[0].direction.clone();
    direction.multiplyScalar(-4);
    direction.applyMatrix4(base1.mesh.matrixWorld);
    directionLine1.setVertices(base1.mesh.getWorldPosition(), direction);
  }

  if (state2 !== undefined) {
    var direction = state2.hits[0].direction.clone();
    direction.multiplyScalar(-4);
    direction.applyMatrix4(base2.mesh.matrixWorld);
    directionLine2.setVertices(base2.mesh.getWorldPosition(), direction);
  }

  if (state1 !== undefined && state2 !== undefined) {
    var hit1 = state1.hits[0];
    var hit2 = state2.hits[0];
    var intersection = new SensorIntersection(
      hit1, transform1,
      hit2, transform2);
    if (intersection.point !== undefined) {
      triangulation.position.copy(intersection.point);
    }
  }

  renderer.render(scene, camera);
}