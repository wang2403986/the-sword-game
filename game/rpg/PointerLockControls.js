/**
 * @author mrdoob / http://mrdoob.com/
 * @author Mugen87 / https://github.com/Mugen87
 */

THREE.PointerLockControls = function ( camera, domElement ) {

	var scope = this;

	this.domElement = domElement || document.body;
	this.isLocked = false;

	var euler = new THREE.Euler( 0, 0, 0, 'YXZ' );

	var PI_2 = Math.PI / 2;

	function onMouseMove( event ) {

		if (scope.isMouseDown && !scope.isLocked) scope.isLocked=true;
		if ( scope.isLocked === false ) return;

		var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

		euler.setFromQuaternion( camera.quaternion );

		euler.y -= movementX * 0.002;
		euler.x -= movementY * 0.002;

		euler.x = Math.max( - PI_2, Math.min( PI_2, euler.x ) );

		camera.quaternion.setFromEuler( euler );

	}
	function onMouseDown( event ) {
		if (event.button===2) scope.isMouseDown = true;
	}
	function onMouseUp( event ) {
		scope.isLocked = false;
		scope.isMouseDown = false;
	}
	function onMouseWheel( event ) {
		if ( event.deltaY < 0 ) {
			camera.position.y -= 2;
		} else if ( event.deltaY > 0 ) {
			camera.position.y += 2;
		}
	}

	function onPointerlockChange() {

		if ( document.pointerLockElement === scope.domElement ) {

			scope.dispatchEvent( { type: 'lock' } );

			scope.isLocked = true;

		} else {

			scope.dispatchEvent( { type: 'unlock' } );

			scope.isLocked = false;

		}

	}

	function onPointerlockError() {

		console.error( 'THREE.PointerLockControls: Unable to use Pointer Lock API' );

	}

	this.connect = function () {

		document.addEventListener( 'mousemove', onMouseMove, false );
		document.addEventListener( 'mousedown', onMouseDown, false );
		document.addEventListener( 'mouseup', onMouseUp, false );
		document.addEventListener( 'wheel', onMouseWheel, false );
		document.addEventListener( 'pointerlockchange', onPointerlockChange, false );
		document.addEventListener( 'pointerlockerror', onPointerlockError, false );

	};

	this.disconnect = function () {

		document.removeEventListener( 'mousemove', onMouseMove, false );
		document.removeEventListener( 'mousedown', onMouseDown, false );
		document.removeEventListener( 'mouseup', onMouseUp, false );
		document.removeEventListener( 'wheel', onMouseWheel, false );
		document.removeEventListener( 'pointerlockchange', onPointerlockChange, false );
		document.removeEventListener( 'pointerlockerror', onPointerlockError, false );

	};

	this.dispose = function () {

		this.disconnect();

	};

	this.getObject = function () { // retaining this method for backward compatibility

		return camera;

	};

	this.getDirection = function () {

		var direction = new THREE.Vector3( 0, 0, - 1 );

		return function ( v ) {

			return v.copy( direction ).applyQuaternion( camera.quaternion );

		};

	}();

	this.lock = function () {

		this.domElement.requestPointerLock();

	};

	this.unlock = function () {

		document.exitPointerLock();

	};

	this.connect();
};

THREE.PointerLockControls.prototype = Object.create( THREE.EventDispatcher.prototype );
THREE.PointerLockControls.prototype.constructor = THREE.PointerLockControls;



// init
(function(){
	var objects = [];
	var raycaster;
	var moveForward = false;
	var moveBackward = false;
	var moveLeft = false;
	var moveRight = false;
	var canJump = false;
	var prevTime = Date.now();
	var velocity = new THREE.Vector3();
	var direction = new THREE.Vector3();
	var vertex = new THREE.Vector3();
	var color = new THREE.Color();

	var onKeyDown = function ( event ) {
		switch ( event.keyCode ) {
			case 38: // up
			case 87: // w
				moveForward = true;
				break;
			case 37: // left
			case 65: // a
				moveLeft = true;
				break;
			case 40: // down
			case 83: // s
				moveBackward = true;
				break;
			case 39: // right
			case 68: // d
				moveRight = true;
				break;
			case 32: // space
				if ( canJump === true ) velocity.y += 350;
				canJump = false;
				break;
		}
	};
	var onKeyUp = function ( event ) {
		switch ( event.keyCode ) {
			case 38: // up
			case 87: // w
				moveForward = false;
				break;
			case 37: // left
			case 65: // a
				moveLeft = false;
				break;
			case 40: // down
			case 83: // s
				moveBackward = false;
				break;
			case 39: // right
			case 68: // d
				moveRight = false;
				break;
		}
	};
	document.addEventListener( 'keydown', onKeyDown, false );
	document.addEventListener( 'keyup', onKeyUp, false );
	document.oncontextmenu=function(ev){
	    return false;
	    };
	raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );
	
	
	var gameObject = {}
	gameObject.update = function () {
		if ( window.controls&& controls.getObject) {
//			raycaster.ray.origin.copy( controls.getObject().position );
//			raycaster.ray.origin.y -= 10;
//			var intersections = raycaster.intersectObjects( objects );
//			var onObject = intersections.length > 0;
			var time = Date.now();
			var delta = ( time - prevTime ) / 1000;
			velocity.x -= velocity.x * 10.0 * delta;
			velocity.z -= velocity.z * 10.0 * delta;
			velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass
			direction.z = Number( moveForward ) - Number( moveBackward );
			direction.x = Number( moveLeft ) - Number( moveRight );
			direction.normalize(); // this ensures consistent movements in all directions
			if ( moveForward || moveBackward ) velocity.z -= direction.z * 400.0 * delta;
			if ( moveLeft || moveRight ) velocity.x -= direction.x * 400.0 * delta;
//			if ( onObject === true ) {
//				velocity.y = Math.max( 0, velocity.y );
//				canJump = true;
//			}
			controls.getObject().translateX( velocity.x * delta );
			//controls.getObject().position.y += ( velocity.y * delta ); // new behavior
			controls.getObject().translateZ( velocity.z * delta );
//			if ( controls.getObject().position.y < 10 ) {
//				velocity.y = 0;
//				controls.getObject().position.y = 10;
//				canJump = true;
//			}
			prevTime = time;
		}
	};
	SceneManager.addUpdater(gameObject);
})()
