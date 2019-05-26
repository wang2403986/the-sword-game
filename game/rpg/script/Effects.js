(function(){
	var flamePool =[],shockwavePool =[];
	var shockwaveTexture=THREE.ImageUtils.loadTexture('../assets/materials/shockwave.png');
	var flameTexture=THREE.ImageUtils.loadTexture('../assets/materials/flame.png');
	var flash=THREE.ImageUtils.loadTexture('../assets/materials/particle/flash.png');
	var smoke=THREE.ImageUtils.loadTexture('../assets/materials/particle/smoke.png');
	var smoketrail=THREE.ImageUtils.loadTexture('../assets/materials/particle/smoketrail.png');
	smoketrail=THREE.ImageUtils.loadTexture('../assets/materials/particle/aaa.png');
	var spark=THREE.ImageUtils.loadTexture('../assets/materials/particle/spark.png');
	
//	var shockwaveTexture=THREE.ImageUtils.loadTexture('../../assets/materials/shockwave.png');
//	var flameTexture=THREE.ImageUtils.loadTexture('../../assets/materials/flame.png');
//	var flash=THREE.ImageUtils.loadTexture('../../assets/materials/particle/flash.png');
//	var smoke=THREE.ImageUtils.loadTexture('../../assets/materials/particle/smoke.png');
//	var smoketrail=THREE.ImageUtils.loadTexture('../../assets/materials/particle/smoketrail.png');
//	smoketrail=THREE.ImageUtils.loadTexture('../../assets/materials/particle/aaa.png');
//	var spark=THREE.ImageUtils.loadTexture('../../assets/materials/particle/spark.png');
window.BurstEffect=BurstEffect;

function initShockwave(explosionEffect) {
	var emitter = particleSystem.createParticleEmitter(shockwaveTexture);
	emitter.setState( THREE.AdditiveBlending );
	emitter.setParameters( {
			numParticles: 1,
//			colorMult:[.68, 0.77, 0.61, 1],
			lifeTime: 1,
			startTime: 0,
			startSize: 1*3,//0.50,
			endSize: 7*3,//2,
			spinSpeedRange: 0,
			billboard: false
		}
		);
    explosionEffect.add(emitter);
    emitter.timeOffset_ = emitter.timeSource_();
//    var shockwaveEmitter=emitter;
//    /* The shockwave faces upward (along the Y axis) to make it appear as
//     * a horizontally expanding circle. */
////    shockwaveEmitter.setStartColor(new ColorRGBA(.68f, 0.77f, 0.61f, 1f));
////    shockwaveEmitter.setEndColor(new ColorRGBA(.68f, 0.77f, 0.61f, 0f));
//    shockwaveEmitter.setStartSize(1f);
//    shockwaveEmitter.setEndSize(7f);
//    shockwaveEmitter.setGravity(0, 0, 0);
//    shockwaveEmitter.setLowLife(1f);
//    shockwaveEmitter.setHighLife(1f);
//    shockwaveEmitter.getParticleInfluencer().setInitialVelocity(new Vector3f(0, 0, 0));
//    shockwaveEmitter.getParticleInfluencer().setVelocityVariation(0f);
//    shockwaveEmitter.setParticlesPerSec(0);
  }
function initFire(explosionEffect) {
	var emitter = particleSystem.createParticleEmitter();
	emitter.setState( THREE.AdditiveBlending );
	emitter.setColorRamp(
		[
			1, 1, 0, 1,
			1, 0, 0, 1,
			1, 0, 0, 1,
			1, 0, 0, 0.5,
			0, 0, 0, 0
		]
	);
	emitter.setParameters( {
			numParticles: 20,
			//colorMult:[.68, 0.77, 0.61, 1],
			lifeTime: 1.25,
			lifeTimeRange: .75,
			startTime: 0,
			startSize: 1*4,//0.50,
			endSize: 0.005*4,//2,
			spinSpeedRange: 0,
			billboard: true,
			velocityRange : [ 0.3*4, 0.3*4,0.3*4],
			//worldAcceleration: [ 0, - 0.20, 0 ],
			velocity:[ 0, 3*2,0],
			positionRange: [ 1, 0, 1 ],
//			velocity: [ 0, 0.60, 0 ], velocityRange: [ 0.15, 0.15, 0.15 ],
//			worldAcceleration: [ 0, - 0.20, 0 ],
//			spinSpeedRange: 4
		}
	//,
//		function ( index, parameters ) {
//
//			var matrix = new THREE.Matrix4();
//			var angle = Math.random() * 2 * Math.PI;
//			matrix.makeRotationY( angle );
//			var position = new THREE.Vector3( 8, 0, 0 );//3, 0, 0
//			var len = position.length();
//			position.transformDirection( matrix );
//			parameters.velocity = [ position.x * len, position.y * len, position.z * len ];
//			var acc = new THREE.Vector3( - 0.3, 0, - 0.3 ).multiply( position );
//			parameters.acceleration = [ acc.x, acc.y, acc.z ];
//
//		}
		);
    explosionEffect.add(emitter);
    emitter.timeOffset_ = emitter.timeSource_();
  }
function initBurst(explosionEffect) {
	var emitter = particleSystem.createParticleEmitter();
	emitter.setState( THREE.AdditiveBlending );
	emitter.setColorRamp(
		[
			1, 0.8, 0.36, 1,
			1, 0.8, 0.36, .25
		]
	);
	emitter.setParameters( {
			numParticles: 5,
			//colorMult:[.68, 0.77, 0.61, 1],
			lifeTime: .75,
			lifeTimeRange: 0,
			startTime: 0,
			startSize: .1,//0.50,
			endSize: 6,//2,
			spinSpeedRange: 0,
			billboard: true,
			velocityRange : [ 1*4, 1*4,1*4],
			positionRange: [ 2, 0, 2 ],
			velocity:[ 0, 2*4,0]
		}
		);
    explosionEffect.add(emitter);
    emitter.timeOffset_ = emitter.timeSource_();
  }
function initSmoke(explosionEffect) {
	var emitter = particleSystem.createParticleEmitter(smoketrail);
	emitter.setState( THREE.AdditiveBlending );
	emitter.setColorRamp(
		[
			1, 0.8, 0.36, 1,
			1, 0.8, 0.36, .25
		]
	);
	emitter.setParameters( {
			numParticles: 20,
			//colorMult:[.68, 0.77, 0.61, 1],
			lifeTime: 1,
			lifeTimeRange: 0,
			startTime: 0,
			startSize: 0.5,//0.50,
			endSize: 3,//2,
			spinSpeedRange: 0,
			billboard: false,
			velocityRange : [ 0, 0,0]
			//velocity:[ 0, 6,0]
		}
	,
		function ( index, parameters ) {

			var matrix = new THREE.Matrix4();
			var angle = Math.random() * 2 * Math.PI;
			//matrix.makeRotationY( angle );
			var position = new THREE.Vector3( 8, 0, 0 );//3, 0, 0
			var velocityRange = new THREE.Vector3( 1, 1, 1 );
			var len = position.length();
			position.transformDirection( matrix );
			
			var phi = (Math.PI * 0.4)*(Math.random() - 0.5);
	        var theta = (Math.PI)*(Math.random() - 0.5);
	        // create normal vector in random direction
	        var sphereCoord = THREE.Spherical(1, phi, theta);

	        var v = new THREE.Vector3();
	        v.setFromSpherical(sphereCoord);
	        parameters.velocity = [ v.x*12, v.y *12, v.z*12 ];
	        var q=new THREE.Quaternion().setFromRotationMatrix(matrix);
	        q.setFromUnitVectors(new THREE.Vector3(-1,0,0), v.normalize());
	        parameters.orientation = [ q.x, q.y , q.z,q.w ];
			//var acc = new THREE.Vector3( - 0.3, 0, - 0.3 ).multiply( position );
			//parameters.acceleration = [ acc.x, acc.y, acc.z ];

		}
		);
    explosionEffect.add(emitter);
    emitter.timeOffset_ = emitter.timeSource_();
  }
function BurstEffect(position, EffectTime) {
	var totalTime=2, time=0;
	var shockwave;
    this.start =function() {
    	if(shockwavePool.length){
    		shockwave = shockwavePool.pop();
    		for(var i=0;i< shockwave.children.length;i++){
    			shockwave.children[i].timeOffset_ = shockwave.children[i].timeSource_();
    		}
    	} else {
    		shockwave = new THREE.Object3D();
    		initSmoke(shockwave);
    		initBurst(shockwave);
    		initFire(shockwave);
    		initShockwave(shockwave);
    	}
    	scene.add( shockwave );
    	shockwave.position.copy(position);
    	shockwave.position.y= 2 + position.height;
        addUpdater(this);
    }
    this.start();
    this.update=function (deltaTime)
    {
    	//shockwave.update(deltaTime, (time+deltaTime));
    	if (totalTime <= time-1) {
    		removeUpdater(this);
    		scene.remove( shockwave );
    		shockwavePool.push(shockwave);
    		return;
    	}
        time += deltaTime;
    }
}

})()