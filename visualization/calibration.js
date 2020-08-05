// This file was automatically generated with the following steps:
// https://github.com/HiveTracker/bonsai-interface/tree/calibration#install

var transform1, transform2;

function loadcalibration() {
  transform1 = new THREE.Matrix4();
  transform1.set(0.037273, 0.085207, -0.995666, 0.0, -0.262485, 0.962207, 0.0725175, 0.0, 0.964216, 0.258644, 0.0582299, 0.0, 2.21213, 2.11234, 0.232716, 1.0);
  transform1.transpose();

  transform2 = new THREE.Matrix4();
  transform2.set(-0.081514, -0.0638828, 0.994623, 0.0, 0.256447, 0.962999, 0.0828688, 0.0, -0.963115, 0.261823, -0.0621153, 0.0, -1.77405, 1.95631, 0.0285911, 1.0);
  transform2.transpose();
}
