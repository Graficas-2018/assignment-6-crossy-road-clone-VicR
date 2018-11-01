/*
  Three.js Frogger Clone
  Víctor Rendón Suárez | A01022462
  25/10/2018
*/
var renderer = null,
scene = null,
camera = null,
root = null,
horse = null,
group = null,
orbitControls = null,
mixer = null,
score_count = null,
scoreCSS = null,
camstep = null;

var inGame = false;

var morphs = [],
    cars = [],
    trees = [];

var duration = 20000; // ms
var currentTime = Date.now();

function loadGLTF()
{
    mixer = new THREE.AnimationMixer( scene );

    var loader = new THREE.GLTFLoader();
    loader.load( "../models/Horse.glb", function( gltf ) {
        horse = gltf.scene.children[ 0 ];
        horse.scale.set(0.02, 0.02, 0.02);
        horse.position.set(-83, -4, 0.4);
        horse.rotation.set(0, Math.PI/2, 0)
        horse.castShadow = true;
        horse. receiveShadow = true;
        scene.add( horse );
    } );

    // Load Cars
    var textureUrl = "../images/car.png";
    var texture = new THREE.TextureLoader().load(textureUrl);
    var material = new THREE.MeshBasicMaterial({ map: texture });
    var geometry = new THREE.CubeGeometry(2, 3, 5);
    // And put the geometry and material together into a mesh
    car_positions = [-72, -62, -46, -36, -19, -13, 4, 14, 30, 39, 55, 64, 81, 87];
    for(var i = 0; i < car_positions.length; i++) {
      cube = new THREE.Mesh(geometry, material);
      cube.position.set(car_positions[i], -2, 0.4);
      cube.castShadow = true;
      cube. receiveShadow = true;
      morphs.push(cube);
      cars.push(cube);
      scene.add( cube );
    }

    // Load Trees
    var textureUrl = "../images/tree.jpeg";
    var texture = new THREE.TextureLoader().load(textureUrl);
    var material = new THREE.MeshBasicMaterial({ map: texture });
    var geometry = new THREE.CubeGeometry(3, 10, 3);
    // And put the geometry and material together into a mesh
    tree_positions = [-54, -29, -3, 22, 47, 95, -54, -29, -3, 22, 47, 73, 73, 95];
    for(var i = 0; i < tree_positions.length; i++) {
      cube = new THREE.Mesh(geometry, material);
      cube.position.set(tree_positions[i], 0, getRandomInt(-25, 25));
      cube.castShadow = true;
      cube. receiveShadow = true;
      trees.push(cube);
      scene.add( cube );
    }
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

function animate() {

    var now = Date.now();
    var deltat = now - currentTime;
    currentTime = now;

    if ( mixer ) {
        mixer.update( ( deltat ) * 0.001 );
    }

    for(var morph of morphs)
    {
        morph.position.z += 0.04 * deltat;
        if(morph.position.z > 40)
            morph.position.z = -70 - Math.random() * 50;
    }
}

function run() {
    requestAnimationFrame(function() { run(); });

        // Render the scene
        renderer.render( scene, camera );

        // Spin the cube for next frame
        animate();

        if(inGame && horse != null){
          checkCarCollision();
        }
}

function keyPressed(e)
{
  var key = e.key.toLowerCase();
  var step = 2;
  if (key == 'w'){
    if(!treeCollision(step, 'x', '+') && horse.position.z > -83){
      horse.position.x += step;
      score_count += 1;
      scoreCSS = $("#score");
      scoreCSS.text("Score: " + score_count);
      camera.position.x += 2;
    }
  }
  else if (key == 'a'){
    if(!treeCollision(step, 'z', '-') && horse.position.z > -17.6){
      horse.position.z -= step;
    }
  }
  else if (key == 's'){
    if(!treeCollision(step, 'x', '-') && horse.position.x > -83){
      horse.position.x -= step;
      camera.position.x -= 3;
    }
  }
  else if (key == 'd'){
    if(!treeCollision(step, 'z', '+') && horse.position.z < 15.4){
      horse.position.z += step;
    }
  }
}

function checkCarCollision()
{
  for (var i = 0; i < cars.length; i++) {
    var horsebox = new THREE.Box3().setFromObject(horse);
    var carbox = new THREE.Box3().setFromObject(cars[i]);

    if (horsebox.intersectsBox(carbox)){
      console.log('CAR COLLISION');
      horse.position.set(-83, -4, 0.4);
      camera.position.set(-120, 16.7, 0.8);
      score_count = 0
      scoreCSS.text("Score: " + score_count);
    }
  }
}

function treeCollision(step, pos, op)
{
  var c_horse = horse.clone();
  if (pos == 'x'){
    if (op == '+'){
      c_horse.position.x += step;
    } else {
      c_horse.position.x -= step;
    }
  } else {
    if (op == '+'){
      c_horse.position.z += step;
    } else {
      c_horse.position.z -= step;
    }
  }
  for (var i = 0; i < trees.length; i++) {
    var horsebox = new THREE.Box3().setFromObject(c_horse);
    var treebox = new THREE.Box3().setFromObject(trees[i]);

    if (horsebox.intersectsBox(treebox)){
      console.log('TREE COLLISION');
      return true;
    }
  }
}

var directionalLight = null;
var spotLight = null;
var ambientLight = null;
var mapUrl = "../images/road.jpeg";

var SHADOW_MAP_WIDTH = 2048, SHADOW_MAP_HEIGHT = 2048;

function createScene(canvas) {

    // Create the Three.js renderer and attach it to our canvas
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );

    // Set the viewport size
    renderer.setSize(canvas.width, canvas.height);

    // Turn on shadows
    renderer.shadowMap.enabled = true;
    // Options are THREE.BasicShadowMap, THREE.PCFShadowMap, PCFSoftShadowMap
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    document.addEventListener("keypress", keyPressed, false);

    // Create a new Three.js scene
    scene = new THREE.Scene();

    // Add  a camera so we can view the scene
    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 4000 );
    camera.position.set(-120, 16.7, 0.8);
    camera.rotation.set(-1.5, -1.3, -1.5);
    // scene.add(camera);

    // Create a group to hold all the objects
    root = new THREE.Object3D;
    root.moves = {
      w: new KF.KeyFrameAnimator,
      a: new KF.KeyFrameAnimator,
      s: new KF.KeyFrameAnimator,
      d: new KF.KeyFrameAnimator
    }
    spotLight = new THREE.SpotLight (0xffffff);
    spotLight.position.set(-150, 50, -10);
    spotLight.target.position.set(-2, 0, -2);
    root.add(spotLight);

    spotLight.castShadow = true;

    spotLight.shadow.camera.near = 1;
    spotLight.shadow.camera.far = 200;
    spotLight.shadow.camera.fov = 45;

    spotLight.shadow.mapSize.width = SHADOW_MAP_WIDTH;
    spotLight.shadow.mapSize.height = SHADOW_MAP_HEIGHT;

    ambientLight = new THREE.AmbientLight ( 0x888888, 1.6 );
    root.add(ambientLight);

    // Create the objects
    loadGLTF();

    // Create a group to hold the objects
    group = new THREE.Object3D;
    root.add(group);

    // Create a texture map
    var map = new THREE.TextureLoader().load(mapUrl);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(8, 8);

    var color = 0xffffff;

    // Put in a ground plane to show off the lighting
    geometry = new THREE.PlaneGeometry(200, 200, 50, 50);
    var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color:color, map:map, side:THREE.DoubleSide}));

    mesh.rotation.x = -Math.PI / 2;
    mesh.rotation.z = -Math.PI / 2;
    mesh.position.y = -4.02;

    // Add the mesh to our group
    group.add( mesh );
    mesh.castShadow = false;
    mesh.receiveShadow = true;

    // Now add the group to our scene
    scene.add( root );
    inGame = true;
}
