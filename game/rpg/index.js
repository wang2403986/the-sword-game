var container, stats, controls, terrin;
var raycaster = new THREE.Raycaster();
var raycaster_models=[];
var mouse = new THREE.Vector2(), INTERSECTED;
var camera, scene, renderer, light;
var clock = new THREE.Clock(), keyboard = new KeyboardState();
var mixers = [], worldSize = {x:512,y:512};

init();
animate();
function init() {
	container = document.createElement( 'div' );
	document.body.appendChild( container );
	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
	camera.position.set( 304, 140, 300 );
	controls = new THREE.OrbitControls( camera );
	controls.target.set( 179,  -213,  102 );
	controls.enableRotate=false;controls.update();
	scene = new THREE.Scene();
	//scene.background = new THREE.Color( 0xa0a0a0 );
	scene.fog = new THREE.Fog( 0xa0a0a0, 200, 1000 );
	light = new THREE.AmbientLight(0xffffff); light.intensity = 1.2;
	scene.add(light);
	light = new THREE.DirectionalLight( 0xffffff );
	light.position.set( 0, 200, 100 ); 
	//light.castShadow = true;
	light.shadow.camera.top = 180;
	light.shadow.camera.bottom = -100;
	light.shadow.camera.left = -120;
	light.shadow.camera.right = 120;
	scene.add( light );
	// scene.add( new THREE.CameraHelper( light.shadow.camera ) );
	// ground
	var texture = THREE.ImageUtils.loadTexture('../assets/materials/sand.png');
	texture.wrapS=texture.wrapT = THREE.RepeatWrapping;texture.repeat.set(10, 10);
	var mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry(worldSize.x, worldSize.y), new THREE.MeshBasicMaterial( { color: 0x999999,map:texture, depthWrite: true } ) );
	mesh.geometry.rotateX( - Math.PI / 2 );
	mesh.geometry.translate(worldSize.x/2, 0, worldSize.y/2);
//	mesh.rotation.x = - Math.PI / 2; mesh.position.set(worldSize.x/2,0, worldSize.y/2);
	mesh.receiveShadow = false;
	
	scene.add( mesh );
	var grid = new THREE.GridHelper( worldSize.x, 20, 0x000000, 0x000000 );
	grid.geometry.translate(worldSize.x/2, 0, worldSize.y/2);
	grid.material.opacity = 0.2;
	grid.material.transparent = true;
	terrin = mesh;
	//scene.add( grid );

	renderer = new THREE.WebGLRenderer( { antialias: false } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	//renderer.shadowMap.enabled = true;
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
    if (fElapse < 0.0001) return;
    window.now = now;
    keyboard.update();
	for ( var i = 0; i < mixers.length; i ++ )
		mixers[ i ].update( fElapse );
	for(var i=0;i<updateTaskList.length;i++) {
		updateTaskList[i].update(fElapse);
	}
	if(camera) {
//		raycaster.setFromCamera(mouse, camera);
//		var intersects = raycaster.intersectBoxs( raycaster_models );
//		if(intersects.length > 0 ) {
//			if ( INTERSECTED != intersects[ 0 ].object ) {
//				if ( INTERSECTED ) INTERSECTED._model.meshs[0].material.color.setHex( INTERSECTED.currentHex );//emissive
//				INTERSECTED = intersects[ 0 ].object;
//				var material=INTERSECTED._model.meshs[0].material;
//				INTERSECTED.currentHex = material.color.getHex();
//				material.color.setHex( 0xffcccc );
//			}
//		} else {
//			if ( INTERSECTED ) INTERSECTED._model.meshs[0].material.color.setHex( INTERSECTED.currentHex );
//			INTERSECTED = null;
//		}
	}
	if(camera) {
		camera.update&&camera.update();
		renderer.render( scene, camera );
	}
	stats.update();
}

window.addEventListener( 'mousemove', function ( event ) {
	// calculate mouse position in normalized device coordinates
	// (-1 to +1) for both components
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}, false );
