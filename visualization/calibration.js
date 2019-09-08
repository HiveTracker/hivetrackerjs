var transform1, transform2;

function loadcalibration() {
  transform1 = new THREE.Matrix4();
  transform1.set(-0.812449, 0.0541912, -0.580509, 0.0, -0.277869, 0.839329, 0.467243, 0.0, 0.512558, 0.540916, -0.666854, 0.0, 0.481608, 0.0675493, -0.873921, 1.0);
  transform1.transpose();
  
  transform2 = new THREE.Matrix4();
  transform2.set(0.924792, -0.0700639, 0.373967, 0.0, 0.254349, 0.844835, -0.470702, 0.0, -0.282962, 0.530419, 0.799118, 0.0, -1.08335, 0.15707, 1.82407, 1.0);
  transform2.transpose();
}
 
