(function(){
	
	var objectsPool =[];
	var particle=THREE.ImageUtils.loadTexture('textures/particle2.png');
	window.Projectile=Projectile;
function Projectile(source, attackTarget, m_speed, gravity) {
	var position=source,target=attackTarget;
	if(position.x===undefined)
		position=source.pos,target=attackTarget.pos;
	var y = position.y?position.y:0;
	var transform,totalTime,time=0,verticalSpeed, g = 9.8*5, speed = 20, angleSpeed, angle;
	
	var direction= new THREE.Vector3();
	var tmp1= new THREE.Vector3();
	var startPos= new THREE.Vector3().set(position.x, position.y+ 6, position.z);
	var endPos= new THREE.Vector3().set(target.x, target.y+ 6, target.z); 
//	startPos.y=endPos.y= y + 6;
	var lastPos= new THREE.Vector3().copy(startPos);
	
    this.start =function() {
//    	if(m_speed) speed=m_speed;  if(gravity) g=gravity;
    	//transform = new THREE.Sprite( Bullet.material ); transform.scale.set(100,100,1);
    	if(objectsPool.length){
    		transform = objectsPool.pop();
    	} else {
    		transform = new Fire();
    		transform.init()
    	}
    	transform.position = transform.system.position;
    	transform.rotation = transform.system.rotation;
    	transform.lookAt = function(e){transform.system.lookAt(e)};
    	transform.position.copy(startPos)
    	scene.add( transform.system );
    	var tmepDistance = startPos.distanceTo(endPos);
    	var tempTime = tmepDistance / speed; totalTime=tempTime;
        var riseTime, downTime;
        riseTime = downTime = tempTime / 2;
         verticalSpeed = g * riseTime;
        transform.lookAt(endPos);
        var tempTan = verticalSpeed / speed;
        var hu = Math.atan(tempTan);
        angle =  (180 / 180 * hu);
        transform.system.rotateX ( -angle);
        angleSpeed = angle / riseTime;
 
        direction .copy(endPos) .sub( transform.position).normalize();
        SceneManager.addUpdater(this);
    }
    this.start();
    this.update= update;
    function update(deltaTime)
    {
    	transform.update(deltaTime, (time+deltaTime))
    	if (time+deltaTime > totalTime) {
    		if(attackTarget.onHit){
    			attackTarget.onHit(source);
    		}
    		SceneManager.removeUpdater(this);
    		SceneManager.remove( transform.system );
    		objectsPool.push(transform);
    		return;
    	}
    	time += deltaTime;
    	lastPos.copy(transform.position);
        var test = verticalSpeed - g * time;
        transform.position.add(tmp1.copy(direction).multiplyScalar( speed * deltaTime));
        transform.position.y+=  test * deltaTime;
        var testAngle = -angle + angleSpeed * time;
       // transform.rotation.x = testAngle;
        transform.system.rotateX ( angleSpeed * deltaTime);
    }
}
window.Fire=Fire;
  function Fire() {
	  var _this = this;
    _this.numParticles = 10;
    _this.opts = {
      sparkLifecycle: 0.5,
      sparkStartSize: 13*1.0,
      sparkEndSize: 14*1.0,
      sparkDistanceScale: 1.8*50,

      flameMinHeight: 0.08*1,
      flameMaxHeight: 0.14*1,
      flamePeriod: 1*1,
      windStrength: 0.0,
      windFrequency: 0.0,

      color: 0x6e4d00, //0xffcf5c,
      endColor: 0x8e3920, //0xc0988c,

      opacity: 1.0,
      gravity: 8.0,

      // static - set at start
      baseWidth: 0.8 // angle - multiple of PI
    };

    //var textureLoader = new THREE.TextureLoader();
    //textureLoader.load('textures/particle2.png', function (texture) {
      _this.texture = particle;
      //_this.system.material.uniforms.texture.value = _this.texture;
    //});
      return _this;
  }
  Fire.prototype[ 'init']= function init(up) {
      // make sure gravity points in world Y
      // http://stackoverflow.com/questions/35641875/three-js-how-to-find-world-orientation-vector-of-objects-local-up-vector
      this.direction = new THREE.Vector3();
      if(!up) up=this.direction.set(0,0,-1)
      var v3=this.direction.copy(up)//.applyQuaternion(this.getWorldQuaternion().inverse());

      var systemGeometry = new THREE.BufferGeometry();
      var systemMaterial = new THREE.ShaderMaterial({
        uniforms: {
          up: { type: 'v3', value: v3 },
          gravity: { type: 'f', value: this.opts.gravity },
          elapsedTime: { type: 'f', value: 0.0 },
          numParticles: { type: 'f', value: this.numParticles },
          color: { type: 'c', value: new THREE.Color(this.opts.color) },
          endColor: { type: 'c', value: new THREE.Color(this.opts.endColor) },
          flameMaxHeight: { type: 'f', value: this.opts.flameMaxHeight },
          flameMinHeight: { type: 'f', value: this.opts.flameMinHeight },
          flamePeriod: { type: 'f', value: this.opts.flamePeriod },
          windStrength: { type: 'f', value: this.opts.windStrength },
          windFrequency: { type: 'f', value: this.opts.windFrequency },
          sparkLifecycle: { type: 'f', value: this.opts.sparkLifecycle },
          sparkDistanceScale: { type: 'f', value: this.opts.sparkDistanceScale },
          sparkStartSize: { type: 'f', value: this.opts.sparkStartSize },
          sparkEndSize: { type: 'f', value: this.opts.sparkEndSize },
          opacity: { type: 'f', value: this.opts.opacity },
          texture: { type: 't', value: null } },

        transparent: true,
        depthWrite: false,
        depthTest: false,//true,
        // NOTE: don't use additive blending for light backgrounds
        // http://answers.unity3d.com/questions/573717/particle-effects-against-light-backgrounds.html
        blending: THREE.AdditiveBlending,
        vertexShader: '\n        uniform float elapsedTime;\n        uniform float numParticles;\n        uniform float gravity;\n        uniform vec3 up;\n        \n        uniform float sparkLifecycle;\n        uniform float sparkDistanceScale;\n        uniform float sparkStartSize;\n        uniform float sparkEndSize;\n        \n        uniform float flameMaxHeight;\n        uniform float flameMinHeight;\n        uniform float flamePeriod;\n        uniform float windStrength;\n        uniform float windFrequency;\n\n        attribute vec3 direction;\n        attribute float uniqueness;\n        attribute float particleIndex;\n\n        #define PI 3.141592653589793238462643383279\n\n        varying float vTime;\n\n        void main( void ) {\n          // unique duration\n          float duration = sparkLifecycle + sparkLifecycle * uniqueness;\n\n          // make time loop\n          float particleOffset = (particleIndex / numParticles * duration);\n          float time = mod(elapsedTime + particleOffset, duration);\n\n          // store time as 0-1 for fragment shader\n          vTime = time / duration;\n\n          // apply "gravity" to fire\n          vec3 vGravity = up * gravity * pow(vTime, 2.0);\n\n          // move in direction based on elapsed time\n          float flameHeight = mix(flameMinHeight, flameMaxHeight, uniqueness); \n          vec3 vDistance = flameHeight * direction * vTime;\n\n          // close flame at top (0.5 is fully closed)\n          vDistance.xz *= cos(mix(0.0, PI * flamePeriod, vTime));\n\n          // apply some random horizonal wind\n          vec3 vWind = sin((elapsedTime + vTime * uniqueness) * windFrequency * uniqueness) * cross(up, direction) * windStrength * uniqueness * vTime;\n\n          // add all forces to get final position for this frame\n          vec3 pos = position + vDistance + vGravity + vWind;\n\n          // Set size based on frame and distance\n          vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );\n          gl_PointSize = mix(sparkStartSize, sparkEndSize, vTime);\n\t\t\t\t  gl_PointSize = gl_PointSize * (sparkDistanceScale / length(mvPosition.xyz));\n          \n          // project position on screen\n          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);\n        }\n\n      ',

        fragmentShader: '\n        uniform vec3 color;\n        uniform vec3 endColor;\n        uniform float opacity;\n        uniform sampler2D texture;\n\n        varying float vTime;\n        \n        void main() {\n          vec4 texColor = texture2D(texture, gl_PointCoord);\n          vec4 startColor = vec4(color, opacity);\n          vec4 endColor = vec4(endColor, 0.0);\n          gl_FragColor = texColor * mix(startColor, endColor, vTime);\n        }\n      '
      });

      // all flames start at 0,0,0
      var positions = new Float32Array(this.numParticles * 3);
      for (var i = 0; i < positions.length; i += 3) {
        positions[i] = 0;
      }

      var direction = new Float32Array(this.numParticles * 3);
      for (var _i = 0; _i < direction.length; _i += 3) {
        var phi = this.randCenter(Math.PI * this.opts.baseWidth);
        var theta = this.randCenter(Math.PI);
        // create normal vector in random direction
        var sphereCoord = THREE.Spherical(1, phi, theta);

        var v = new THREE.Vector3();
        v.setFromSpherical(sphereCoord);
        direction[_i] = v.x;
        direction[_i + 1] = v.y;
        direction[_i + 2] = v.z;
      }

      // push some uniqueness - because entropy...
      var uniqueness = new Float32Array(this.numParticles);
      for (var _i2 = 0; _i2 < this.numParticles; _i2++) {
        uniqueness[_i2] = Math.random();
      }

      // remember particle index
      var particleIndex = new Float32Array(this.numParticles);
      for (var _i3 = 0; _i3 < this.numParticles; _i3++) {
        particleIndex[_i3] = _i3;
      }

      systemGeometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
      systemGeometry.addAttribute('direction', new THREE.BufferAttribute(direction, 3));
      systemGeometry.addAttribute('uniqueness', new THREE.BufferAttribute(uniqueness, 1));
      systemGeometry.addAttribute('particleIndex', new THREE.BufferAttribute(particleIndex, 1));

      systemGeometry.computeBoundingSphere();
      this.system = new THREE.Points(systemGeometry, systemMaterial);
      
      //this.add(this.system);
      this.system.material.uniforms.texture.value = this.texture;
    }
	Fire.prototype['update']= function update(delta, elapsed) {
      this.system.material.uniforms.elapsedTime.value = elapsed;
    }
	Fire.prototype['updateOne']= function updateOne(opt) {
      this.system.material.uniforms[opt].value = this.opts[opt];
    }
	Fire.prototype['updateColor']=function updateColor(opt) {
      this.system.material.uniforms[opt].value = new THREE.Color(this.opts[opt]);
    }
	Fire.prototype['randCenter']=function randCenter(v) {
      return v * (Math.random() - 0.5);
    };

})()