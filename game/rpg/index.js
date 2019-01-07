var container, stats, controls, terrin;
var raycaster = new THREE.Raycaster();
var raycaster_models=[];
var mouse = new THREE.Vector2(), INTERSECTED;
var camera, scene, renderer, light;
var keyboard = new KeyboardState();
var mixers = [], worldSize = {x:512,y:512};

init();
animate();
function init() {
	container = document.createElement( 'div' );
	document.body.appendChild( container );
	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
	camera.position.set( 314, 65, 290 );
	camera.position.set(304.3, 66.0, 295.4);
	controls = new THREE.OrbitControls( camera );
	controls.target.set( 179,  -213,  102 );
	controls.enableRotate=false;controls.update();
	scene = new THREE.Scene();
	//scene.background = new THREE.Color( 0xa0a0a0 );
	//scene.fog = new THREE.Fog( 0xa0a0a0, 200, 1000 );
	light = new THREE.AmbientLight(0xffffff); light.intensity = .9;
	scene.add(light);
	light = new THREE.DirectionalLight( 0xffffff );
	light.castShadow = true;
	
//	light.position.set(-40, 60, -10)//-40, 60, -10;390, 260, 210
//	light.shadow.camera.top = 350;
//	light.shadow.camera.bottom = 150;
//	light.shadow.camera.left = 100;
//	light.shadow.camera.right = 300;
	
	light.position.set(390, 260, 210)
	light.shadow.camera.top = -100;//       350,-100
	light.shadow.camera.bottom = -300;//    150,-300
	light.shadow.camera.left = 0;//         100,0
	light.shadow.camera.right = -200;//     300,-200
	
	light.shadow.mapSize.height = 2048;
	light.shadow.mapSize.width = 2048;
	scene.add( light );
	scene.add(new THREE.DirectionalLightHelper(light));
	scene.add( new THREE.CameraHelper( light.shadow.camera ) );
	// ground
	var texture = THREE.ImageUtils.loadTexture('../assets/materials/sand.png');
	texture.wrapS=texture.wrapT = THREE.RepeatWrapping;texture.repeat.set(10, 10);
	var mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry(worldSize.x, worldSize.y), new THREE.MeshLambertMaterial( { color: 0x666666,map:texture, depthWrite: true } ) );
	mesh.geometry.rotateX( - Math.PI / 2 );
	mesh.geometry.translate(worldSize.x/2, 0, worldSize.y/2);
//	mesh.rotation.x = - Math.PI / 2; mesh.position.set(worldSize.x/2,0, worldSize.y/2);
	mesh.receiveShadow = true;
	
	scene.add( mesh );
	
	var sphereGeometry = new THREE.SphereGeometry(5,20,20);
    var sphereMaterial = new THREE.MeshStandardMaterial({color:0x7777ff});
    var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(2,5,2)
    //告诉球需要投射阴影
    sphere.castShadow = true;
    scene.add(sphere);
    
	var grid = new THREE.GridHelper( worldSize.x, worldSize.x, 0x000000, 0x000000 );
	grid.geometry.translate(worldSize.x/2, 0, worldSize.y/2);
	grid.material.opacity = 0.5;
	grid.material.transparent = true;
	terrin = mesh;
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

(function(){
//	var gui = new dat.GUI();
//	light.shadow.camera;light.position;
//	var controller = light.shadow.camera;
//	    var f1 = gui.addFolder('Shadow camera');
////	    f1.add(controller, 'top', -250, 250).step(10).onChange( function() {
////	    	light.shadow.camera.updateProjectionMatrix()
////	    });
////	    f1.add(controller, 'bottom', -250, 250).step(10).onChange( function() {
////	    	light.shadow.camera.updateProjectionMatrix()
////	    });
////	    f1.add(controller, 'left', -250, 250).step(10).onChange( function() {
////	    	light.shadow.camera.updateProjectionMatrix()
////	    });
////	    f1.add(controller, 'right', -250, 250).step(10).onChange( function() {
////	    	light.shadow.camera.updateProjectionMatrix()
////	    });
//	    var controller2 = light.position;
//	    f1.add(controller2, 'x', -250, 800).step(10).onChange( function() {
//	    	
//	    });
//	    f1.add(controller2, 'y', -250, 800).step(10).onChange( function() {
//	    	
//	    });
//	    f1.add(controller2, 'z', -250, 800).step(10).onChange( function() {
//	    	
//	    });
//	    var controller1 = {x:0,y:0,z:0};
//	    f1.add(controller1, 'x', -250, 250).step(10).onChange( function() {
//	    	light.lookAt(controller1.x,controller1.y,controller1.z)
//	    });
//	    f1.add(controller1, 'y', -250, 250).step(10).onChange( function() {
//	    	light.lookAt(controller1.x,controller1.y,controller1.z)
//	    });
//	    f1.add(controller1, 'z', -250, 250).step(10).onChange( function() {
//	    	light.lookAt(controller1.x,controller1.y,controller1.z)
//	    });
})();
