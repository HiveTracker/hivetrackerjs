var transform1, transform2;

function loadcalibration() {
  transform1 = new THREE.Matrix4();
  transform1.set(-0.5283118, -0.1285292, 0.8392657, 0,    0.3147103, 0.8884206, 0.3341649, 0,    -0.7885709, 0.4406688, -0.4289137, 0,    -2.088987, 2.483953, -0.7352041, 1);
  transform1.transpose();
  
  transform2 = new THREE.Matrix4();
  transform2.set(-0.05143319, -0.02879849, 0.998261, 0,    0.5376514, -0.8431603, 0.003377263, 0,    0.841597, 0.5368903, 0.05884998, 0,    2.705675, 2.303431, 0.376483, 1);
  transform2.transpose();
}
 
