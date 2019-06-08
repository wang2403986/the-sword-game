var container, stats, controls, terrin;
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
mouse.moveX=mouse.moveY=0;
var camera, scene, renderer, light;
var keyboard = new KeyboardState();
var mixers = [], worldSize = {x:512,y:512};

init();
animate();
function init() {
	container = document.createElement( 'div' );
	document.body.appendChild( container );
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
	camera.position.set(231.7, 69.3, 332.3);
	controls = new THREE.OrbitControls( camera );
	controls.target.copy( controls.target0.set( 231.7, -15,  238.4 ) );
	controls.screenSpacePanning = controls.enableRotate = false;
	controls.enablePan = false;
	controls.update();
//	controls = new THREE.PointerLockControls( camera );
//	scene.add(controls.getObject());
	//scene.background = new THREE.Color( 0xa0a0a0 );
	//scene.fog = new THREE.Fog( 0xa0a0a0, 200, 1000 );
	var ambientlight = new THREE.AmbientLight(0xffffff); ambientlight.intensity = .9;
	scene.add(ambientlight);
	light = new THREE.DirectionalLight( 0xffffff );
	light.castShadow = true;
	
	light.position.set(440, 60, 309.3);
	light.target.position.set(70, -250, 298.29);
	light.shadow.camera.top = 0;//       350,-100
	light.shadow.camera.bottom = 180;//    150,-300
	light.shadow.camera.left = 0;//         100,0
	light.shadow.camera.right = 180;//     300,-200
	shadow=light.shadow;
	
	light.shadow.mapSize.height = 2048;
	light.shadow.mapSize.width = 2048;
	scene.add( light );
	scene.add(light.target);
	scene.add(new THREE.DirectionalLightHelper(light));
	scene.add( new THREE.CameraHelper( light.shadow.camera ) );
	// ground
	var texture = THREE.ImageUtils.loadTexture('../assets/materials/sand.png');
	texture.wrapS=texture.wrapT = THREE.RepeatWrapping;texture.repeat.set(10, 10);
//	var mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry(worldSize.x, worldSize.y), new THREE.MeshLambertMaterial( { color: 0x666666,map:texture, depthWrite: true } ) );
//	mesh.geometry.rotateX( - Math.PI / 2 );
//	mesh.geometry.translate(worldSize.x/2, 0, worldSize.y/2);
//	mesh.receiveShadow = true;
//	terrin = mesh;
//	scene.add( mesh );
	
	
//	var grid = new THREE.GridHelper( worldSize.x, worldSize.x, 0x000000, 0x000000 );
//	grid.geometry.translate(worldSize.x/2, 0, worldSize.y/2);
//	grid.material.opacity = 0.5;
//	grid.material.transparent = true;
	//scene.add( grid );

	renderer = new THREE.WebGLRenderer( { antialias: false } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.shadowMap.enabled = true;
	container.appendChild( renderer.domElement );
	window.addEventListener( 'resize', onWindowResize, false );
	// stats
	stats = new Stats();
	container.appendChild( stats.dom );
}
function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}
window.now = Date.now();
function animate() {
	requestAnimationFrame( animate );
	var now = Date.now();
	var fElapse  = (now - window.now)/1000.0;
    window.now = now;
    keyboard.update();
    SceneManager.update(fElapse);
	if(camera) {
		camera.update && camera.update();
		renderer.render( scene, camera );
		if(window.moveCamera) moveCamera(mouse.moveX, mouse.moveY);
	}
	stats.update();
}

document.addEventListener( 'mousemove', function ( event ) {
	// calculate mouse position in normalized device coordinates
	// (-1 to +1) for both components
	mouse.moveX = mouse.moveY=0;
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
	
	var inc=.7;
	if (event.clientX < 20){
		mouse.moveX=-inc;
	}else if (event.clientX>innerWidth-20){
		mouse.moveX=inc;
	} else if (event.clientY<20){
		mouse.moveY=-inc;
	}else if (event.clientY>innerHeight-20){
		mouse.moveY=inc;
	}
});
document.addEventListener( 'mouseleave', function ( event ) {
	mouse.moveX= mouse.moveY=0;
});

(function(){
//	var gui = new dat.GUI();
//	light.shadow.camera;
//	light.position;
//	var controller = light.shadow.camera;
//	    var f1 = gui.addFolder('light pos');
//	    var controller2 = light.position;
//	    f1.add(controller2, 'x', -500, 800).step(10).onChange( function() {
//	    	
//	    });
//	    f1.add(controller2, 'y', -500, 800).step(10).onChange( function() {
//	    	
//	    });
//	    f1.add(controller2, 'z', -500, 800).step(10).onChange( function() {
//	    	
//	    });
//	    var controller1 = light.target.position;
//	    var f1 = gui.addFolder('light target');
//	    f1.add(controller1, 'x', -500, 500).step(10).onChange( function() {
//	    	//light.lookAt(controller1.x,controller1.y,controller1.z)
//	    });
//	    f1.add(controller1, 'y', -500, 500).step(10).onChange( function() {
//	    	//light.lookAt(controller1.x,controller1.y,controller1.z)
//	    });
//	    f1.add(controller1, 'z', -500, 500).step(10).onChange( function() {
//	    	//light.lookAt(controller1.x,controller1.y,controller1.z)
//	    });//
})();
