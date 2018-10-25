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
mixer = null;

var inGame = false;

var morphs = [],
    cars = [];

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
        // horse.position.y -= 4;
        // horse.position.z = -50 - Math.random() * 50;
        horse.castShadow = true;
        horse. receiveShadow = true;
        scene.add( horse );
        // mixer.clipAction( gltf.animations[ 0 ], horse).setDuration( 1 ).play();
    } );

    var textureUrl = "../images/car.png";
    var texture = new THREE.TextureLoader().load(textureUrl);
    var material = new THREE.MeshBasicMaterial({ map: texture });
    var geometry = new THREE.CubeGeometry(2, 3, 5);
    // And put the geometry and material together into a mesh
    for(var i = 10; i <= 20; i+=10) {
      cube = new THREE.Mesh(geometry, material);
      // Move the mesh back from the camera and tilt it toward the viewer
      // cube.position.y += -3;
      // cube.position.x += 10;
      // cube.position.z = -50 - Math.random() * 50;
      cube.position.set(-(i+52), -2, 0.4);
      cube.castShadow = true;
      cube. receiveShadow = true;
      morphs.push(cube);
      cars.push(cube);
      scene.add( cube );
    }
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
        morph.position.z += 0.03 * deltat;
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

        // Update the camera controller
        // orbitControls.update();
        if(inGame && horse != null){
          checkCarCollision();
        }
}

function keyPressed(e)
{
  var key = e.key.toLowerCase();
  if (key == 'w'){
    horse.position.x += 3;
  }
  else if (key == 'a'){
    horse.position.z -= 3;
  }
  else if (key == 's'){
    horse.position.x -= 3;
  }
  else if (key == 'd'){
    horse.position.z += 3;
  }
}

function checkCarCollision()
{
  for (var i = 0; i < cars.length; i++) {
    var horsebox = new THREE.Box3().setFromObject(horse);
    var carbox = new THREE.Box3().setFromObject(cars[i]);

    if (horsebox.intersectsBox(carbox)){
      console.log('COLLISION');
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
    camera.position.set(-115, 16.7, 0.8);
    camera.rotation.set(-1.5, -1.3, -1.5);
    scene.add(camera);

    // orbitControls = new THREE.OrbitControls(camera, renderer.domElement);

    // Create a group to hold all the objects
    root = new THREE.Object3D;
    root.moves = {
      w: new KF.KeyFrameAnimator,
      a: new KF.KeyFrameAnimator,
      s: new KF.KeyFrameAnimator,
      d: new KF.KeyFrameAnimator
    }
    spotLight = new THREE.SpotLight (0xffffff);
    spotLight.position.set(-100, 17, -10);
    spotLight.target.position.set(-2, 0, -2);
    // root .add(spotLight);

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
