var camera, scene, renderer, controls;
var plane, sphere, material;
var base1, base2, directionLine;

var tracker, subscription, state;
var messageBuffer = [null, null, null, null];

init();
animate();

function initTracker() {
  var button = document.getElementsByTagName('button')[0];
  var stop = document.getElementsByTagName('button')[1];
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
          state = new TrackerState(messageH, messageV);
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
  var redPlaneMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.1 });
  var bluePlaneMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff, transparent: true, opacity: 0.1 });
  var plane = new THREE.PlaneBufferGeometry(2, 1, 1);
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

  var lineMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff });
  directionLine = new DirectionLine(lineMaterial);
  scene.add(directionLine.line);

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

  if (state !== undefined) {
    var direction = state.hits[0].direction.clone();
    direction.multiplyScalar(0.2);
    direction.applyMatrix4(base2.mesh.matrixWorld);
    directionLine.setVertices(base2.mesh.getWorldPosition(), direction);
  }

  renderer.render(scene, camera);
}