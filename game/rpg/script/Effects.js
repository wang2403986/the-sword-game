(function(){
	var flamePool =[],shockwavePool =[];
	var shockwaveTexture=THREE.ImageUtils.loadTexture('../assets/materials/shockwave.png');
	var flameTexture=THREE.ImageUtils.loadTexture('../assets/materials/flame.png');
var up=new THREE.Vector3(0,1,0);
var up2=new THREE.Vector3(0,1,0,0,0,-1);
window.BurstEffect=Effect;
function Effect(position, EffectTime) {
	var g = 9.8*10, speed = 200, verticalSpeed, moveDirection, angleSpeed, angle, totalTime,time=0;
	totalTime=2;
	var shockwave, flame;
    this.start =function() {
    	if(shockwavePool.length){
    		shockwave = shockwavePool.pop();
    	} else {
    		shockwave = new Fire();
    		shockwave.opts.windStrength= 0,
    		shockwave.opts.windFrequency= 0,
    		shockwave.opts.opacity=1;
    		shockwave.numParticles=1;
    		shockwave.opts.sparkStartSize=(1*10*300);
    		shockwave.opts.sparkEndSize=(7*10*300);
    		shockwave.opts.sparkDistanceScale=1;
    		shockwave.opts.gravity=0;
    		shockwave.opts.sparkLifecycle=(1.2);//3
    		//shockwave.opts.setHighLife(1f);
    		//shockwave.opts.setInitialVelocity(new Vector3f(0, 0, 0));
    		//shockwave.opts.setVelocityVariation(0f);
    		shockwave.texture=shockwaveTexture;
    		shockwave.init(up2);
    	}
    	if(flamePool.length){
    		flame = flamePool.pop();
    	} else {
    		flame = new Fire();
    		flame.numParticles=26;
    		flame.texture=flameTexture;
    		flame.opts.opacity=1;
    		flame.opts.sparkStartSize=(10*100);
    		flame.opts.sparkEndSize=(20*100);
    		flame.opts.sparkDistanceScale=2.4;
    		flame.opts.flameMinHeight= 0.02*200;
    		flame.opts.flameMaxHeight= 0.2*20;
    		flame.opts.flamePeriod= 0.5;
    		flame.opts.gravity=0.05*100*0;
    		flame.init(up);
    	}
    	flame.system.position.copy(position);
    	shockwave.system.position.set(position.x,1,position.z);
    	scene.add( flame.system );
    	scene.add( shockwave.system );
        addUpdater(this);
    }
    this.start();
    this.update=function (deltaTime)
    {
    	flame.update(deltaTime, (time+deltaTime))
    	shockwave.update(deltaTime, (time+deltaTime));
    	if (totalTime <= time-1) {
    		removeUpdater(this);
    		scene.remove( flame.system ), scene.remove( shockwave.system );
    		flamePool.push(flame); shockwavePool.push(shockwave);
    		return;
    	}
        time += deltaTime;
    }
}
var planeGeometry = new THREE.PlaneBufferGeometry( 10, 10 );
var fArray = planeGeometry.attributes.position.array;
for(var j=1;j<fArray.length;j+=3){
	fArray[j+1]=-fArray[j];
	fArray[j]=0;
};
window.ParticleSystem=ParticleSystem;
function ParticleSystem() {
	  var _this = this;
  _this.numParticles = 5.00;
  _this.opts = {
    sparkLifecycle: 0.7,
    sparkStartSize: 10*300,
    sparkEndSize: 20*300,
    sparkDistanceScale: 1.4,

    flameMinHeight: 0.02*30,
    flameMaxHeight: 0.2*30,
    flamePeriod: 0.5,
    windStrength: 0.14,
    windFrequency: 0.5,

    color: 0x6e4d00, //0xffcf5c,
    endColor: 0x8e3920, //0xc0988c,

    opacity: 0.7,
    gravity: 0.05*300,

    // static - set at start
    baseWidth: 0.8 // angle - multiple of PI
  };

  //var textureLoader = new THREE.TextureLoader();
  //textureLoader.load('textures/particle2.png', function (texture) {
    _this.texture = flameTexture;
    //_this.system.material.uniforms.texture.value = _this.texture;
  //});
    return _this;
}
ParticleSystem.prototype.init= function init(up) {
    // make sure gravity points in world Y
    // http://stackoverflow.com/questions/35641875/three-js-how-to-find-world-orientation-vector-of-objects-local-up-vector
    this.direction = new THREE.Vector3();
    if(!up) up=this.direction.set(0,0,-1)//.set(0,0,-1)
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
      depthTest: false,
      // NOTE: don't use additive blending for light backgrounds
      // http://answers.unity3d.com/questions/573717/particle-effects-against-light-backgrounds.html
      blending: THREE.AdditiveBlending,
      vertexShader: document.getElementById("ParticleSystem-vertexShader").textContent,
      fragmentShader: document.getElementById("ParticleSystem-fragmentShader").textContent
    });

    // all flames start at 0,0,0
    var attrSize = this.numParticles * 4;
    var positions = new Float32Array(attrSize * 3);
    for (var i = 0; i < positions.length; i += 3) {
      positions[i] = 0;
    }

    var direction = new Float32Array(attrSize * 3);
    for (var _i = 0; _i < this.numParticles* 3; _i += 3) {
      var phi = this.randCenter(Math.PI * this.opts.baseWidth);
      var theta = this.randCenter(Math.PI);
      // create normal vector in random direction
      var sphereCoord = THREE.Spherical(1, phi, theta);

      var v = new THREE.Vector3();
      v.setFromSpherical(sphereCoord);
      for (var j=0;j<4;j++){
    	  direction[_i*4+j] = v.x;
          direction[_i*4+j +1] = v.y;
          direction[_i*4+j+ 2] = v.z;
      }
    }

    // push some uniqueness - because entropy...
    var uniqueness = new Float32Array(attrSize);
    for (var _i2 = 0; _i2 < attrSize; _i2++) {
    	var rr=Math.random();
    	for (var j=0;j<4;j++){
    		uniqueness[_i2*4+j] = rr;
    	}
    }

    // remember particle index
    var particleIndex = new Float32Array(attrSize);
    for (var _i3 = 0; _i3 < attrSize; _i3++) {
    	for (var j=0;j<4;j++){
    		particleIndex[_i3*4+j] = _i3;
    	}
    }
    var indices = [], indicesSize = this.numParticles*2 * 3;
    _i=0,j=0;
    for (var _i = 0; _i < this.numParticles; _i++) {
        for(var j=0;j<planeGeometry.index.array.length;j++){
        	indices[_i*6 + j]=planeGeometry.index.array[j] + _i*4;
        }
      }
    var uvs = new Float32Array(attrSize*2);
    _i=0,j=0;
    for (var _i = 0; _i < this.numParticles; _i++) {
        for(var j=0;j<planeGeometry.attributes.uv.array.length;j++){
        	uvs[_i*attrSize*2 + j]=planeGeometry.attributes.uv.array[j];
        }
     }
    var vertices=new Float32Array(this.numParticles*4* 3);
    _i=0,j=0;
    for (var _i = 0; _i < this.numParticles; _i++) {
        for(var j=0;j<planeGeometry.attributes.position.array.length;j++){
        	vertices[_i*4*3 + j]=planeGeometry.attributes.position.array[j];
        }
      }
    systemGeometry.setIndex( indices );
    systemGeometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
    systemGeometry.addAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    systemGeometry.addAttribute('positionO', new THREE.BufferAttribute(positions, 3));
    systemGeometry.addAttribute('direction', new THREE.BufferAttribute(direction, 3));
    systemGeometry.addAttribute('uniqueness', new THREE.BufferAttribute(uniqueness, 1));
    systemGeometry.addAttribute('particleIndex', new THREE.BufferAttribute(particleIndex, 1));

    systemGeometry.computeBoundingSphere();
    this.system = new THREE.Mesh(systemGeometry, systemMaterial);
    
    this.system.material.uniforms.texture.value = this.texture;
  }
  ParticleSystem.prototype.update= function update(delta, elapsed) {
    this.system.material.uniforms.elapsedTime.value = elapsed;
  }
  ParticleSystem.prototype.updateOne= function updateOne(opt) {
    this.system.material.uniforms[opt].value = this.opts[opt];
  }
  ParticleSystem.prototype.updateColor=function updateColor(opt) {
    this.system.material.uniforms[opt].value = new THREE.Color(this.opts[opt]);
  }
  ParticleSystem.prototype.randCenter=function randCenter(v) {
    return v * (Math.random() - 0.5);
  };
})()