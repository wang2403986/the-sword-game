(function () {
	// source: https://github.com/greggman/tdl/blob/master/tdl/particles.js
	// ported to three.js by fazeaction
	var CORNERS_ = [
		[ - 0.5, - 0.5 ],
		[ + 0.5, - 0.5 ],
		[ + 0.5, + 0.5 ],
		[ - 0.5, + 0.5 ]
	];
	function createDefaultClock_ ( particleSystem ) {
		return function () {
			var now = particleSystem.now_;
			var base = particleSystem.timeBase_;

			return ( now.getTime() - base.getTime() ) / 1000.0;
		}
	}

	var POSITION_START_TIME_IDX = 0;
	var UV_LIFE_TIME_FRAME_START_IDX = 4;
	var VELOCITY_START_SIZE_IDX = 8;
	var ACCELERATION_END_SIZE_IDX = 12;
	var SPIN_START_SPIN_SPEED_IDX = 16;
	var ORIENTATION_IDX = 20;
	var COLOR_MULT_IDX = 24;
	var LAST_IDX = 28;
	var singleParticleArray_ = new Float32Array( 4 * LAST_IDX );

	// source: https://github.com/greggman/tdl/blob/master/tdl/particles.js
	// ported to three.js by fazeaction

	function ParticleSpec () {

		this.numParticles = 1;

		this.numFrames = 1; this.numFramesX = 1;this.numFramesY = 1;

		this.frameDuration = 1;

		this.frameStart = 0;

		this.frameStartRange = 0;

		this.timeRange = 99999999;

		this.startTime = null;

		this.lifeTime = 1;

		this.lifeTimeRange = 0;

		this.startSize = 1;

		this.startSizeRange = 0;

		this.endSize = 1;

		this.endSizeRange = 0;

		this.position = [ 0, 0, 0 ];

		this.positionRange = [ 0, 0, 0 ];

		this.velocity = [ 0, 0, 0 ];

		this.velocityRange = [ 0, 0, 0 ];

		this.acceleration = [ 0, 0, 0 ];

		this.accelerationRange = [ 0, 0, 0 ];

		this.spinStart = 0;

		this.spinStartRange = 0;

		this.spinSpeed = 0;

		this.spinSpeedRange = 0;

		this.colorMult = [ 1, 1, 1, 1 ];

		this.colorMultRange = [ 0, 0, 0, 0 ];

		this.worldVelocity = [ 0, 0, 0 ];

		this.worldAcceleration = [ 0, 0, 0 ];

		this.billboard = true;

		this.orientation = [ 0, 0, 0, 1 ];

	}

	// source: https://github.com/greggman/tdl/blob/master/tdl/particles.js
	// ported to three.js by fazeaction

	function OneShot( emitter, scene ) {

		THREE.Mesh.call( this );
		this.emitter_ = emitter.clone();
		this.scene = scene;

		this.world_ = new THREE.Matrix4();
		this.tempWorld_ = new THREE.Matrix4();
		this.timeOffset_ = 0;
		this.visible_ = false;

		// Remove the parent emitter from the particle system's drawable
		// list (if it's still there) and add ourselves instead.
		var particleSystem = emitter.particleSystem;
		var idx = particleSystem.drawables_.indexOf( this.emitter_ );
		if ( idx >= 0 ) {

			particleSystem.drawables_.splice( idx, 1 );

		}

		particleSystem.drawables_.push( this );

	}

	OneShot.prototype = Object.create( THREE.Mesh.prototype );

	OneShot.prototype.constructor = OneShot;


	OneShot.prototype.trigger = function ( opt_world ) {

		if ( ! this.visible_ ) {

			this.scene.add( this.emitter_ );

		}
		if ( opt_world ) {

	        this.emitter_.position.copy( new THREE.Vector3().fromArray( opt_world ) );

		}
		this.visible_ = true;
		this.timeOffset_ = this.emitter_.timeSource_();

	};

	OneShot.prototype.draw = function ( world, viewProjection, timeOffset ) {

		if ( this.visible_ ) {

			//this.tempWorld_.multiplyMatrices(this.world_, world);
			this.emitter_.draw( this.world_, viewProjection, this.timeOffset_ );

		}

	};
	
//	var particles_billboard =`
//	uniform int billboardType;
//	uniform mat4 viewInverse;
//	uniform vec3 worldVelocity;
//	uniform vec3 worldAcceleration;
//	uniform float timeRange;
//	uniform float time;
//	uniform float timeOffset;
//	uniform float frameDuration;
//	uniform float numFrames;
//
//	// Incoming vertex attributes
//	attribute vec4 uvLifeTimeFrameStart;
//	attribute float startTime;
//	attribute vec4 velocityStartSize;
//	attribute vec4 accelerationEndSize;
//	attribute vec4 spinStartSpinSpeed;
//	attribute vec4 colorMult;
//
//	// Outgoing variables to fragment shader
//	varying vec2 outputTexcoord;
//	varying float outputPercentLife;
//	varying vec4 outputColorMult;
//
//	void main() {
//		mat4 billboardMatrix;
//		if ( billboardType == 4 ){
//			billboardMatrix = mat4(
//					viewInverse[0],
//					viewInverse[1],
//					viewInverse[2],
//					vec4(0.0, 0.0,1.0, 1.0));
//		}
//		else {
//		
//			billboardMatrix = mat4(
//				vec4(1.0, 0.0, 0.0, 0.0),
//				vec4(0.0, 1.0, 0.0, 0.0),
//				vec4(0.0, 0.0, 1.0, 0.0),
//				vec4(0.0, 0.0, 0.0, 1.0));
//		
//			if ( billboardType == 1 ){
//				billboardMatrix *= mat4(
//					vec4(1.0, 0.0, 0.0, 0.0),
//					vec4(0.0, viewInverse[1].y, viewInverse[1].z, 0.0),
//					vec4(0.0, viewInverse[2].y, viewInverse[2].z, 0.0),
//					vec4(0.0, 0.0, 0.0, 1.0)
//					);
//			}
//		
//			if ( billboardType == 2 ){
//				billboardMatrix *= mat4(
//					vec4(viewInverse[0].x, 0.0, viewInverse[0].z, 0.0),
//					vec4(0.0, 1.0, 0.0, 0.0),
//					vec4(viewInverse[2].x, 0.0, viewInverse[2].z, 0.0),
//					vec4(0.0, 0.0, 0.0, 1.0)
//					);
//			}
//		
//			if ( billboardType == 3 ){
//				billboardMatrix *= mat4(
//					vec4(viewInverse[0].x, viewInverse[0].y, 0.0, 0.0),
//					vec4(viewInverse[1].x, viewInverse[1].y, 0.0, 0.0),
//					vec4(0.0, 0.0, 1.0, 0.0),
//					vec4(0.0, 0.0, 0.0, 1.0)
//					);
//			}
//		
//		}
//	    float lifeTime = uvLifeTimeFrameStart.z;
//	    float frameStart = uvLifeTimeFrameStart.w;
//	    vec3 velocity = (modelMatrix * vec4(velocityStartSize.xyz,
//	                                 0.)).xyz + worldVelocity;
//	    float startSize = velocityStartSize.w;
//	    vec3 acceleration = (modelMatrix * vec4(accelerationEndSize.xyz,
//	                                     0)).xyz + worldAcceleration;
//	    float endSize = accelerationEndSize.w;
//	    float spinStart = spinStartSpinSpeed.x;
//	    float spinSpeed = spinStartSpinSpeed.y;
//
//	    float localTime = mod((time - timeOffset - startTime), timeRange);
//	    float percentLife = localTime / lifeTime;
//
//	    float frame = mod(floor(localTime / frameDuration + frameStart),
//	                     numFrames);
//	    float uOffset = frame / numFrames;
//	    float u = uOffset + (uv.x + 0.5) * (1. / numFrames);
//
//	    outputTexcoord = vec2(u, uv.y + 0.5);
//	    outputColorMult = colorMult;
//
//	    vec3 basisX = billboardMatrix[0].xyz;//viewInverse[0].xyz;
//	    vec3 basisZ = billboardMatrix[1].xyz;//viewInverse[1].xyz;
//	    vec4 vertexWorld = modelMatrix * vec4(position, 1.0);
//
//	    float size = mix(startSize, endSize, percentLife);
//	    size = (percentLife < 0. || percentLife > 1.) ? 0. : size;
//	    float s = sin(spinStart + spinSpeed * localTime);
//	    float c = cos(spinStart + spinSpeed * localTime);
//
//	    vec2 rotatedPoint = vec2(uv.x * c + uv.y * s, -uv.x * s + uv.y * c);
//	    vec3 localPosition = vec3(basisX * rotatedPoint.x + basisZ * rotatedPoint.y) * size +
//	                        velocity * localTime +
//	                        acceleration * localTime * localTime +
//	                        vertexWorld.xyz;
//
//	    outputPercentLife = percentLife;
//	    gl_Position = projectionMatrix *viewMatrix * vec4(localPosition, 1.);
//
//	}`;

	var billboardParticleInstancedVertexShader =`
	
uniform mat4 viewInverse;
uniform vec3 worldVelocity;
uniform vec3 worldAcceleration;
uniform float timeRange;
uniform float time;
uniform float timeOffset;
uniform float frameDuration;
uniform float numFrames;
uniform float numFramesX;uniform float numFramesY;
attribute vec4 uvLifeTimeFrameStart;
attribute float startTime;
attribute vec4 velocityStartSize;
attribute vec4 accelerationEndSize;
attribute vec4 spinStartSpinSpeed;
attribute vec4 colorMult;
varying vec2 outputTexcoord;
varying float outputPercentLife;
varying vec4 outputColorMult;
void main() {
    float lifeTime = uvLifeTimeFrameStart.z;
    float frameStart = uvLifeTimeFrameStart.w;
    vec3 velocity = (modelMatrix * vec4(velocityStartSize.xyz,
                                 0.)).xyz + worldVelocity;
    float startSize = velocityStartSize.w;
    vec3 acceleration = (modelMatrix * vec4(accelerationEndSize.xyz,
                                     0)).xyz + worldAcceleration;
    float endSize = accelerationEndSize.w;
    float spinStart = spinStartSpinSpeed.x;
    float spinSpeed = spinStartSpinSpeed.y;
    float localTime = mod((time - timeOffset - startTime), timeRange);
    float percentLife = localTime / lifeTime;
    float frame = mod(floor(localTime / frameDuration + frameStart),
                     numFrames);
    //float uOffset = frame / numFrames;
    float uOffset = mod(frame , numFramesX);
    //uOffset = uOffset / numFramesX;
    float vOffset = floor(frame / numFramesX);
    //vOffset = vOffset / numFramesY;
    //float u = uOffset + (uv.x + 0.5) * (1. / numFrames);
    //outputTexcoord = vec2(u, uv.y + 0.5);
    outputTexcoord = vec2((uv.x + 0.5+uOffset)/numFramesX, (uv.y + 0.5+vOffset)/numFramesY);
    outputColorMult = colorMult;
    vec3 basisX = viewInverse[0].xyz;
    vec3 basisZ = viewInverse[1].xyz;
    vec4 vertexWorld = modelMatrix * vec4(position, 1.0);
    float size = mix(startSize, endSize, percentLife);
    size = (percentLife < 0. || percentLife > 1.) ? 0. : size;
    float s = sin(spinStart + spinSpeed * localTime);
    float c = cos(spinStart + spinSpeed * localTime);
    vec2 rotatedPoint = vec2(uv.x * c + uv.y * s, -uv.x * s + uv.y * c);
    vec3 localPosition = vec3(basisX * rotatedPoint.x + basisZ * rotatedPoint.y) * size +
                        velocity * localTime +
                        acceleration * localTime * localTime +
                        vertexWorld.xyz;
    outputPercentLife = percentLife;
    gl_Position = projectionMatrix * viewMatrix * vec4(localPosition, 1.);
}
	`
var orientedParticleInstancedVertexShader=`

uniform mat4 worldViewProjection;
uniform mat4 world;
uniform vec3 worldVelocity;
uniform vec3 worldAcceleration;
uniform float timeRange;
uniform float time;
uniform float timeOffset;
uniform float frameDuration;
uniform float numFrames;
uniform float numFramesX;uniform float numFramesY;
attribute vec3 offset;
attribute vec4 uvLifeTimeFrameStart;attribute float startTime;attribute vec4 velocityStartSize;attribute vec4 accelerationEndSize;attribute vec4 spinStartSpinSpeed;attribute vec4 orientation;attribute vec4 colorMult;
varying vec2 outputTexcoord;
varying float outputPercentLife;
varying vec4 outputColorMult;
void main() {
float lifeTime = uvLifeTimeFrameStart.z;
float frameStart = uvLifeTimeFrameStart.w;
vec3 velocity = ( vec4(velocityStartSize.xyz,
                              0.)).xyz + worldVelocity;
float startSize = velocityStartSize.w;
vec3 acceleration = ( vec4(accelerationEndSize.xyz,
                                  0)).xyz + worldAcceleration;
float endSize = accelerationEndSize.w;
float spinStart = spinStartSpinSpeed.x;
float spinSpeed = spinStartSpinSpeed.y;
float localTime = mod((time - timeOffset - startTime), timeRange);
float percentLife = localTime / lifeTime;
float frame = mod(floor(localTime / frameDuration + frameStart),
                  numFrames);
//float uOffset = frame / numFrames;
//float u = uOffset + (uv.x + 0.5) * (1. / numFrames);
float uOffset = mod(frame , numFramesX);
float vOffset = floor(frame / numFramesX);
outputTexcoord = vec2((uv.x + 0.5+uOffset)/numFramesX, (uv.y + 0.5+vOffset)/numFramesY);
//outputTexcoord = vec2(u, uv.y + 0.5);
outputColorMult = colorMult;
float size = mix(startSize, endSize, percentLife);
size = (percentLife < 0. || percentLife > 1.) ? 0. : size;
float s = sin(spinStart + spinSpeed * localTime);
float c = cos(spinStart + spinSpeed * localTime);
vec4 rotatedPoint = vec4((uv.x * c + uv.y * s) * size, 0.,
                         (uv.x * s - uv.y * c) * size, 1.);
vec3 center = velocity * localTime +
              acceleration * localTime * localTime +
              position +offset;
vec4 q2 = orientation + orientation;
vec4 qx = orientation.xxxw * q2.xyzx;
vec4 qy = orientation.xyyw * q2.xyzy;
vec4 qz = orientation.xxzw * q2.xxzz;
mat4 localMatrix = mat4(
    (1.0 - qy.y) - qz.z,
    qx.y + qz.w,
    qx.z - qy.w,
    0,
    qx.y - qz.w,
    (1.0 - qx.x) - qz.z,
    qy.z + qx.w,
    0,
    qx.z + qy.w,
    qy.z - qx.w,
    (1.0 - qx.x) - qy.y,
    0,
    center.x, center.y, center.z, 1);
rotatedPoint = localMatrix * rotatedPoint;
outputPercentLife = percentLife;
gl_Position = projectionMatrix * modelViewMatrix * rotatedPoint;
}
`
	var particleFragmentShader = "\n#ifdef GL_ES\nprecision mediump float;\n#endif\nuniform sampler2D rampSampler;\nuniform sampler2D colorSampler;\nvarying vec2 outputTexcoord;\nvarying float outputPercentLife;\nvarying vec4 outputColorMult;\nvoid main() {\n    vec4 colorMult = texture2D(rampSampler, vec2(outputPercentLife, 0.5)) * outputColorMult;\n    gl_FragColor = texture2D(colorSampler, outputTexcoord) * colorMult;\n}";

	// source: https://github.com/greggman/tdl/blob/master/tdl/particles.js

	function ParticleEmitter ( particleSystem, opt_texture, opt_clock ) {

		THREE.Mesh.call( this );

		opt_clock = opt_clock || particleSystem.timeSource_;

		//TODO make alternative to instanced buffer
		//this.particleBuffer_ = new THREE.BufferGeometry();
		//this.indexBuffer_ = [];

		this.particleBuffer_ = new THREE.InstancedBufferGeometry();
		this.interleavedBuffer = new THREE.InterleavedBuffer();

		this.numParticles_ = 0;

		this.rampTexture_ = particleSystem.defaultRampTexture;
		this.colorTexture_ = opt_texture || particleSystem.defaultColorTexture;

		this.particleSystem = particleSystem;

		this.timeSource_ = opt_clock;

		this.setState( THREE.NormalBlending );
		this.animationStartTime = Date.now()/1000;

	}
	ParticleEmitter.prototype = Object.create( THREE.Mesh.prototype );

	ParticleEmitter.prototype.constructor = ParticleEmitter;

	ParticleEmitter.prototype.setTranslation = function ( x, y, z ) {

	        this.position.x = x;
	        this.position.y = y;
	        this.position.z = z;

	};

	ParticleEmitter.prototype.setState = function ( stateId ) {

	        this.blendFunc_ = stateId;

	};

	ParticleEmitter.prototype.setColorRamp = function ( colorRamp ) {

		var width = colorRamp.length / 4;
		if (width % 1 != 0) {

			throw 'colorRamp must have multiple of 4 entries';

		}

		if (this.rampTexture_ == this.particleSystem.defaultRampTexture) {

			this.rampTexture_ = null;

		}

		this.rampTexture_ = this.particleSystem.createTextureFromFloats( width, 1, colorRamp, this.rampTexture_ );

	};

	ParticleEmitter.prototype.validateParameters = function ( parameters ) {

		var defaults = new ParticleSpec();

		for ( var key in parameters ) {

			if ( typeof defaults[ key ] === 'undefined' ) {

				throw 'unknown particle parameter "' + key + '"';

			}

		}

		for ( var key in defaults ) {

			if ( typeof parameters[ key ] === 'undefined' ) {

				parameters[ key ] = defaults[ key ];

			}

		}

	};

	var array1= new Float64Array(4);
	ParticleEmitter.prototype.createParticles_ = function( firstParticleIndex, numParticles, parameters, opt_perParticleParamSetter ) {

	    var interleaveBufferData = this.interleavedBuffer.array;

	    this.billboard_ = parameters.billboard;

	    var random = this.particleSystem.randomFunction_;

	    var plusMinus = function ( range ) {

	        return ( random() - 0.5 ) * range * 2;

	    };

	    // TODO: change to not allocate.
	    var v4= new THREE.Vector4();
	    var v3= new THREE.Vector3();
	    var plusMinusVector = function ( range ) {
	    	
	        var v = array1, length = range.length;

	        for (var ii = 0; ii < length; ++ ii) {

	            v[ii]=plusMinus( range[ ii ] );

	        }

	        return length===3? v3.fromArray(v):v4.fromArray(v);

	    };

	    var pPosition=new THREE.Vector3();
	    var pVelocity=new THREE.Vector3();
	    var pAcceleration=new THREE.Vector3();
	    var pColorMult=new THREE.Vector4();
	    var pOrientation=new THREE.Vector4();
	    for ( var ii = 0; ii < numParticles; ++ ii ) {

	        if ( opt_perParticleParamSetter ) {

	            opt_perParticleParamSetter( ii, parameters );

	        }

	        var pLifeTime = parameters.lifeTime;
	        var pStartTime = ( parameters.startTime === null ) ? ( ii * parameters.lifeTime / numParticles ) : parameters.startTime;
	        var pFrameStart = parameters.frameStart + plusMinus(parameters.frameStartRange);
	        pPosition.fromArray(parameters.position).add(plusMinusVector(parameters.positionRange));
	        pVelocity.fromArray(parameters.velocity).add(plusMinusVector(parameters.velocityRange));
	        pAcceleration.fromArray(parameters.acceleration).add( plusMinusVector( parameters.accelerationRange ));
	        pColorMult.fromArray(parameters.colorMult).add(plusMinusVector( parameters.colorMultRange ));
	        var pSpinStart = parameters.spinStart + plusMinus(parameters.spinStartRange);
	        var pSpinSpeed = parameters.spinSpeed + plusMinus(parameters.spinSpeedRange);
	        var pStartSize = parameters.startSize + plusMinus(parameters.startSizeRange);
	        var pEndSize = parameters.endSize + plusMinus(parameters.endSizeRange);
	        pOrientation.fromArray(parameters.orientation);

	        for (var jj = 0; jj < 1; ++jj) {

	            var offset0 = LAST_IDX * jj + ( ii * LAST_IDX * 4 ) + ( firstParticleIndex * LAST_IDX * 4 );
	            offset0 = LAST_IDX * jj + ( ii * LAST_IDX * 1 ) + ( firstParticleIndex * LAST_IDX * 1 );
	            var offset1 = offset0 + 1;
	            var offset2 = offset0 + 2;
	            var offset3 = offset0 + 3;


	            interleaveBufferData[POSITION_START_TIME_IDX + offset0] = pPosition.x;
	            interleaveBufferData[POSITION_START_TIME_IDX + offset1] = pPosition.y;
	            interleaveBufferData[POSITION_START_TIME_IDX + offset2] = pPosition.z;
	            interleaveBufferData[POSITION_START_TIME_IDX + offset3] = pStartTime;

	            interleaveBufferData[UV_LIFE_TIME_FRAME_START_IDX + offset0] = CORNERS_[jj][0];
	            interleaveBufferData[UV_LIFE_TIME_FRAME_START_IDX + offset1] = CORNERS_[jj][1];
	            interleaveBufferData[UV_LIFE_TIME_FRAME_START_IDX + offset2] = pLifeTime;
	            interleaveBufferData[UV_LIFE_TIME_FRAME_START_IDX + offset3] = pFrameStart;

	            interleaveBufferData[VELOCITY_START_SIZE_IDX + offset0] = pVelocity.x;
	            interleaveBufferData[VELOCITY_START_SIZE_IDX + offset1] = pVelocity.y;
	            interleaveBufferData[VELOCITY_START_SIZE_IDX + offset2] = pVelocity.z;
	            interleaveBufferData[VELOCITY_START_SIZE_IDX + offset3] = pStartSize;

	            interleaveBufferData[ACCELERATION_END_SIZE_IDX + offset0] = pAcceleration.x;
	            interleaveBufferData[ACCELERATION_END_SIZE_IDX + offset1] = pAcceleration.y;
	            interleaveBufferData[ACCELERATION_END_SIZE_IDX + offset2] = pAcceleration.z;
	            interleaveBufferData[ACCELERATION_END_SIZE_IDX + offset3] = pEndSize;

	            interleaveBufferData[SPIN_START_SPIN_SPEED_IDX + offset0] = pSpinStart;
	            interleaveBufferData[SPIN_START_SPIN_SPEED_IDX + offset1] = pSpinSpeed;
	            interleaveBufferData[SPIN_START_SPIN_SPEED_IDX + offset2] = 0;
	            interleaveBufferData[SPIN_START_SPIN_SPEED_IDX + offset3] = 0;

	            interleaveBufferData[ORIENTATION_IDX + offset0] = pOrientation.x;
	            interleaveBufferData[ORIENTATION_IDX + offset1] = pOrientation.y;
	            interleaveBufferData[ORIENTATION_IDX + offset2] = pOrientation.z;
	            interleaveBufferData[ORIENTATION_IDX + offset3] = pOrientation.w;

	            interleaveBufferData[COLOR_MULT_IDX + offset0] = pColorMult.x;
	            interleaveBufferData[COLOR_MULT_IDX + offset1] = pColorMult.y;
	            interleaveBufferData[COLOR_MULT_IDX + offset2] = pColorMult.z;
	            interleaveBufferData[COLOR_MULT_IDX + offset3] = pColorMult.w;

	        }

	    }

	    this.interleavedBuffer.needsUpdate = true;

	    this.material.uniforms.worldVelocity.value = new THREE.Vector3(parameters.worldVelocity[0], parameters.worldVelocity[1], parameters.worldVelocity[2]);
	    this.material.uniforms.worldAcceleration.value = new THREE.Vector3(parameters.worldAcceleration[0], parameters.worldAcceleration[1], parameters.worldAcceleration[2]);
	    this.material.uniforms.timeRange.value = parameters.timeRange;
	    this.material.uniforms.frameDuration.value = parameters.frameDuration;
	    this.material.uniforms.numFrames.value = parameters.numFrames;
	    if(parameters.numFramesX){
	    	this.material.uniforms.numFramesX.value = parameters.numFramesX;
	    	this.material.uniforms.numFramesY.value = parameters.numFramesY;
	    	this.material.uniforms.numFrames.value = parameters.numFramesX*parameters.numFramesY;
	    }
	    this.material.uniforms.rampSampler.value = this.rampTexture_;
	    this.material.uniforms.colorSampler.value = this.colorTexture_;

	    this.material.blending = this.blendFunc_;

	};

	ParticleEmitter.prototype.allocateParticles_ = function ( numParticles, parameters ) {

		if ( this.numParticles_ != numParticles ) {

	        var numIndices = 6 * numParticles;

			if (numIndices > 65536 && THREE.BufferGeometry.MaxIndex < 65536) {

				throw "can't have more than 10922 particles per emitter";

			}
//0, 1, 1, 1, 0, 0, 1, 0
			var vertexBuffer = new THREE.InterleavedBuffer( new Float32Array([
				// Front
				-0.5, 0.5, 0, 0,   0-.5, 1-.5,   0, 0,
				0.5, 0.5, 0, 0,     1-.5, 1-.5,  0, 0,
				-0.5, -0.5, 0, 0,    0-.5, 0-.5, 0, 0,
				0.5, -0.5, 0, 0,    1-.5, 0-.5,  0, 0
			]), 8);


			// Use vertexBuffer, starting at offset 0, 3 items in position attribute
			var positions = new THREE.InterleavedBufferAttribute( vertexBuffer, 3, 0 );
			this.particleBuffer_.addAttribute( 'position', positions );
			// Use vertexBuffer, starting at offset 4, 2 items in uv attribute
			var uvs = new THREE.InterleavedBufferAttribute( vertexBuffer, 2, 4 );
			this.particleBuffer_.addAttribute( 'uv', uvs );

			var indices = new Uint16Array([

				0, 2, 1, 2, 3, 1

			]);

			this.particleBuffer_.setIndex( new THREE.BufferAttribute( indices, 1 ) );

			this.numParticles_ = numParticles;
			this.interleavedBuffer = new THREE.InstancedInterleavedBuffer( new Float32Array( numParticles * LAST_IDX ), LAST_IDX, 1 ).setDynamic( true );

			this.particleBuffer_.addAttribute( 'position', new THREE.InterleavedBufferAttribute(this.interleavedBuffer, 3, POSITION_START_TIME_IDX));
			this.particleBuffer_.addAttribute( 'startTime', new THREE.InterleavedBufferAttribute(this.interleavedBuffer, 1, 3));
			this.particleBuffer_.addAttribute( 'uvLifeTimeFrameStart', new THREE.InterleavedBufferAttribute(this.interleavedBuffer, 4, UV_LIFE_TIME_FRAME_START_IDX));
			this.particleBuffer_.addAttribute( 'velocityStartSize', new THREE.InterleavedBufferAttribute(this.interleavedBuffer, 4, VELOCITY_START_SIZE_IDX));
			this.particleBuffer_.addAttribute( 'accelerationEndSize', new THREE.InterleavedBufferAttribute(this.interleavedBuffer, 4, ACCELERATION_END_SIZE_IDX));
			this.particleBuffer_.addAttribute( 'spinStartSpinSpeed', new THREE.InterleavedBufferAttribute(this.interleavedBuffer, 4, SPIN_START_SPIN_SPEED_IDX));
			this.particleBuffer_.addAttribute( 'orientation', new THREE.InterleavedBufferAttribute(this.interleavedBuffer, 4, ORIENTATION_IDX));
			this.particleBuffer_.addAttribute( 'colorMult', new THREE.InterleavedBufferAttribute(this.interleavedBuffer, 4, COLOR_MULT_IDX));

			//TODO Fix boundingSphere
			this.particleBuffer_.boundingSphere = new THREE.Sphere();

			var uniforms = {

				//world: { type: 'm4', value: this.matrixWorld },
				viewInverse: { type: 'm4', value: this.particleSystem.camera.matrixWorld },
				worldVelocity: { type: 'v3', value: null },
				worldAcceleration: { type: 'v3', value: null },
				timeRange: { type: 'f', value: null },
				time: { type: 'f', value: null },
				timeOffset: { type: 'f', value: null },
				frameDuration: { type: 'f', value: null },
				numFrames: { type: 'f', value: null },
				numFramesX: { type: 'f', value: 1 },
				numFramesY: { type: 'f', value: 1 },
				rampSampler: { type: "t", value: this.rampTexture_ },
				colorSampler: { type: "t", value: this.colorTexture_ }

			};

			var material;
				material = new THREE.ShaderMaterial({

					uniforms: uniforms,
					vertexShader: ( parameters.billboard ) ? billboardParticleInstancedVertexShader : orientedParticleInstancedVertexShader,
					fragmentShader: particleFragmentShader,
					side:  THREE.DoubleSide,
					blending: this.blendFunc_,
					depthTest: true,
					depthWrite: false,
					transparent: true

				});


			this.geometry = this.particleBuffer_;
			this.material = material;

		}

	};

	ParticleEmitter.prototype.setParameters = function ( parameters, opt_perParticleParamSetter ) {

		this.validateParameters ( parameters );

		var numParticles = parameters.numParticles;

		this.allocateParticles_ ( numParticles, parameters );
		this.createParticles_ ( 0, numParticles, parameters, opt_perParticleParamSetter );

	};

	ParticleEmitter.prototype.draw = function ( world, viewProjection, timeOffset ) {

		var uniforms = this.material.uniforms;

		uniforms.time.value = this.timeSource_()
		
		uniforms.timeOffset.value = this.timeOffset_? this.timeOffset_: timeOffset;

	};

	ParticleEmitter.prototype.createOneShot = function () {

		return new OneShot( this, this.particleSystem.scene );

	};

	ParticleEmitter.prototype.clone = function ( object ) {

		if ( object === undefined ) object = this.particleSystem.createParticleEmitter( this.colorTexture_, this.timeSource_);

		object.geometry = this.geometry;
		object.material = this.material.clone();
		object.material.uniforms.viewInverse.value = this.particleSystem.camera.matrixWorld;
		object.material.uniforms.rampSampler.value = this.rampTexture_;
		object.material.uniforms.colorSampler.value = this.colorTexture_;

		THREE.Mesh.prototype.clone.call( this, object );

		return object;

	};

	// source: https://github.com/greggman/tdl/blob/master/tdl/particles.js

	function Trail ( particleSystem, maxParticles, parameters, opt_texture, opt_perParticleParamSetter, opt_clock ) {

		ParticleEmitter.call( this, particleSystem, opt_texture, opt_clock );

		this.allocateParticles_( maxParticles, parameters );
		this.validateParameters( parameters );

		this.parameters = parameters;
		this.perParticleParamSetter = opt_perParticleParamSetter;
		this.birthIndex_ = 0;
		this.maxParticles_ = maxParticles;

	}

	Trail.prototype = Object.create( ParticleEmitter.prototype );

	Trail.prototype.constructor = Trail;

	Trail.prototype.birthParticles = function ( position ) {

		var numParticles = this.parameters.numParticles;
		this.parameters.startTime = this.timeSource_();
		this.parameters.position = position;

		while ( this.birthIndex_ + numParticles >= this.maxParticles_ ) {

			var numParticlesToEnd = this.maxParticles_ - this.birthIndex_;

			this.createParticles_( this.birthIndex_, numParticlesToEnd,	this.parameters, this.perParticleParamSetter );
			numParticles -= numParticlesToEnd;

			this.birthIndex_ = 0;

		}

		this.createParticles_( this.birthIndex_, numParticles, this.parameters, this.perParticleParamSetter );

		if ( this.birthIndex_ === 0 ) {

			this.particleSystem.scene.add( this );

		}

		this.birthIndex_ += numParticles;


	};

	// source: https://github.com/greggman/tdl/blob/master/tdl/particles.js

	function ParticleSystem ( scene, camera, opt_clock, opt_randomFunction ) {

		this.scene = scene;
		this.camera = camera;

		this.drawables_ = [];

		var pixelBase = [ 0, 0.20, 0.70, 1, 0.70, 0.20, 0, 0 ];
		var pixels = [];

		for ( var yy = 0; yy < 8; ++ yy ) {

			for ( var xx = 0; xx < 8; ++ xx ) {

				var pixel = pixelBase[ xx ] * pixelBase[ yy ];
				pixels.push( pixel, pixel, pixel, pixel );

			}

		}

		var colorTexture = this.createTextureFromFloats( 8, 8, pixels );
		var rampTexture = this.createTextureFromFloats( 2, 1, [ 1, 1, 1, 1, 1, 1, 1, 0 ] );

		this.now_ = new Date();
		this.timeBase_ = new Date();

		if ( opt_clock ) {

			this.timeSource_ = opt_clock;

		} else {

			this.timeSource_ = createDefaultClock_( this );

		}

		this.randomFunction_ = opt_randomFunction || Math.random;

		this.defaultColorTexture = colorTexture;
		this.defaultRampTexture = rampTexture;

	}

	ParticleSystem.prototype.createTextureFromFloats = function ( width, height, pixels, opt_texture ) {

		var texture = null;
		if ( opt_texture != null ) {

			texture = opt_texture;

		} else {

			var data = new Uint8Array( pixels.length );
			var t;
			for ( var i = 0; i < pixels.length; i ++ ) {

				t = pixels[ i ] * 255.;
				data[ i ] = t;

			}

			texture = new THREE.DataTexture( data, width, height, THREE.RGBAFormat );
			texture.minFilter = THREE.LinearFilter;
			texture.magFilter = THREE.LinearFilter;
			texture.needsUpdate = true;

			return texture;

		}

		return texture;

	};

	ParticleSystem.prototype.createParticleEmitter = function ( opt_texture, opt_clock ) {

		var emitter = new ParticleEmitter( this, opt_texture, opt_clock );
		this.drawables_.push( emitter );

		return emitter;

	};

	ParticleSystem.prototype.createTrail = function ( maxParticles, parameters, opt_texture, opt_perParticleParamSetter, opt_clock ) {

		var trail = new Trail( this, maxParticles, parameters, opt_texture, opt_perParticleParamSetter,	opt_clock );
		this.drawables_.push( trail );

		return trail;

	};

	ParticleSystem.prototype.draw = function ( viewProjection, world, viewInverse ) {

		this.now_ = new Date();

		for ( var ii = 0; ii < this.drawables_.length; ++ ii ) {

			this.drawables_[ ii ].draw( world, viewProjection, 0 );

		}

	};

	var particleSystem;
	var g_poofs = [], g_poofIndex = 0, MAX_POOFS = 3;
	var g_trail, g_trailParameters;
	var g_keyDown = [];

	init();

	function getEventKeyChar( event ) {

		if ( ! event ) {

			event = window.event;

		}

		var charCode = 0;

		if ( ! charCode ) charCode = ( window.event ) ? window.event.keyCode : event.charCode;

		if ( ! charCode ) charCode = event.keyCode;

		return charCode;

	}

	function onKeyPress( event ) {

		event = event || window.event;
		var keyChar = String.fromCharCode( getEventKeyChar( event ) );

		keyChar = keyChar.toLowerCase();

		switch ( keyChar ) {
			case 'p':
				triggerPoof();
				break;
		}

	}

	function onKeyDown( event ) {

		event = event || window.event;
		g_keyDown[ event.keyCode ] = true;

	}

	function onKeyUp( event ) {

		event = event || window.event;
		g_keyDown[ event.keyCode ] = false;

	}

	function init() {
//		camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 5000 );
//		camera.position.set( 0, 5, 15 );
//
		window.particleSystem = 
		particleSystem = new ParticleSystem( scene, camera );
//		setupFlame( particleSystem );
//		setupNaturalGasFlame( particleSystem );
//		setupSmoke( particleSystem );
//		setupWhiteEnergy( particleSystem );
//		setupRipples( particleSystem );
//		setupText( particleSystem );
//		setupRain( particleSystem );
//		setupAnim( particleSystem );
		setupBall2( particleSystem );
//		setupCube( particleSystem );
//		setupPoof( particleSystem );
//		setupTrail( particleSystem );

//		renderer.gammaInput = true;
//		renderer.gammaOutput = true;
		document.addEventListener('keypress',onKeyPress);
		document.addEventListener('keydown',onKeyDown);
		document.addEventListener('keyup',onKeyUp);
		addUpdater({ update: update });
	}

	function setupFlame( particleSystem ) {

		var emitter = particleSystem.createParticleEmitter();
		emitter.setTranslation( 0, 0, 0 );
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
			numParticles: 20/2,
			lifeTime: 2,
			timeRange: 2,
			startSize: 0.5,
			endSize: 0.9,
			velocity: [ 0, 0.60, 0 ], velocityRange: [ 0.15, 0.15, 0.15 ],
			worldAcceleration: [ 0, - 0.20, 0 ],
			spinSpeedRange: 4
		} );

		scene.add( emitter );

	}

	function setupNaturalGasFlame( particleSystem ) {

		var emitter = particleSystem.createParticleEmitter();
		emitter.setTranslation( - 2, 0, 0 );
		emitter.setState( THREE.AdditiveBlending );
		emitter.setColorRamp(
			[
				0.2, 0.2, 1, 1,
				0, 0, 1, 1,
				0, 0, 1, 0.5,
				0, 0, 1, 0
			]
		);
		emitter.setParameters( {
			numParticles: 20/2,
			lifeTime: 2,
			timeRange: 2,
			startSize: 0.5,
			endSize: 0.2,
			velocity: [ 0, 0.60, 0 ],
			worldAcceleration: [ 0, - 0.20, 0 ],
			spinSpeedRange: 4
		} );

		scene.add( emitter );

	}

	function setupSmoke( particleSystem ) {

		var emitter = particleSystem.createParticleEmitter();
		emitter.setTranslation( - 1, 0, 0 );
		emitter.setState( THREE.NormalBlending );
		emitter.setColorRamp(
			[
				0, 0, 0, 1,
				0, 0, 0, 0
			]
		);
		emitter.setParameters( {
			numParticles: 20/2,
			lifeTime: 2,
			timeRange: 2,
			startSize: 1,
			endSize: 1.5,
			velocity: [ 0, 2, 0 ], velocityRange: [ 0.2, 0, 0.2 ],
			worldAcceleration: [ 0, - 0.25, 0 ],
			spinSpeedRange: 4
		} );

		scene.add( emitter );

	}

	function setupWhiteEnergy( particleSystem ) {

		var emitter = particleSystem.createParticleEmitter();
		emitter.setTranslation( 0, 0, 0 );
		emitter.setState( THREE.AdditiveBlending );
		emitter.setColorRamp(
			[
				1, 1, 1, 1,
				1, 1, 1, 0
			]
		);
		emitter.setParameters( {
			numParticles: 80,
			lifeTime: 2,
			timeRange: 2,
			startSize: 1,
			endSize: 1,
			positionRange: [ 1, 0, 1 ],
			velocityRange: [ 0.20, 0, 0.20 ]
		} );

		scene.add( emitter );

	}

	function setupRipples( particleSystem ) {

		var texture = new THREE.TextureLoader().load( '../assets/materials/particle/ripple.png' );
		texture.minFilter = THREE.LinearMipMapLinearFilter;
		texture.magFilter = THREE.LinearFilter;
		var emitter = particleSystem.createParticleEmitter( texture );
		emitter.setTranslation( - 2, 0, 3 );
		emitter.setState( THREE.NormalBlending );
		emitter.setColorRamp(
			[
				0.7, 0.8, 1, 1,
				1, 1, 1, 0
			]
		);
		emitter.setParameters( {
			numParticles: 20,
			lifeTime: 2,
			timeRange: 2,
			startSize: 0.5,
			endSize: 2,
			positionRange: [ 1, 0, 1 ],
			billboard: false
		} );

		scene.add( emitter );

	}

	function setupText( particleSystem ) {

		var image = [
			'X.....X..XXXXXX..XXXXX....XXXX...X....',
			'X.....X..X.......X....X..X.......X....',
			'X..X..X..XXXXX...XXXXX...X..XXX..X....',
			'X..X..X..X.......X....X..X....X..X....',
			'.XX.XX...XXXXXX..XXXXX....XXXX...XXXXX' ];

		var height = image.length;
		var width = image[ 0 ].length;

		// Make an array of positions based on the text image.
		var positions = [];
		for ( var yy = 0; yy < height; ++ yy ) {

			for ( var xx = 0; xx < width; ++ xx ) {

				if ( image[ yy ].substring( xx, xx + 1 ) == 'X' ) {

					positions.push( [ ( xx - width * 0.5 ) * 0.10,
						- ( yy - height * 0.5 ) * 0.10 ] );

				}

			}

		}
		var emitter = particleSystem.createParticleEmitter();
		emitter.setTranslation( 2, 2, 0 );
		emitter.setState( THREE.AdditiveBlending );
		emitter.setColorRamp(
			[
				1, 0, 0, 1,
				0, 1, 0, 1,
				0, 0, 1, 1,
				1, 1, 0, 0
			]
		);
		emitter.setParameters( {
				numParticles: positions.length * 4,
				lifeTime: 2,
				timeRange: 2,
				startSize: 0.25,
				endSize: 0.5,
				positionRange: [ 0.02, 0, 0.02 ],
				velocity: [ 0.01, 0, 0.01 ]
			},
			function ( particleIndex, parameters ) {

				var index = Math.floor( Math.random() * positions.length );
				index = Math.min( index, positions.length - 1 );
				parameters.position[ 0 ] = positions[ index ][ 0 ];
				parameters.position[ 1 ] = positions[ index ][ 1 ];

			} );

		scene.add( emitter );

	}

	function setupRain( particleSystem ) {

		var emitter = particleSystem.createParticleEmitter();
		emitter.setTranslation( 2, 2, 0 );
		emitter.setState( THREE.NormalBlending );
		emitter.setColorRamp( [ 0.2, 0.2, 1, 1 ] );
		emitter.setParameters( {
			numParticles: 80,
			lifeTime: 2,
			timeRange: 2,
			startSize: 0.05,
			endSize: 0.05,
			positionRange: [ 1, 0, 1 ],
			velocity: [ 0, - 1.5, 0 ]
		} );

		scene.add( emitter );

	}

	function setupAnim( particleSystem ) {

		var emitter = particleSystem.createParticleEmitter( /*new THREE.TextureLoader().load( 'textures/particle-anim.png' )*/ );
		emitter.setTranslation( 3, 0, 0 );
		emitter.setColorRamp(
			[
				1, 1, 1, 1,
				1, 1, 1, 1,
				1, 1, 1, 0
			]
		);
		emitter.setParameters( {
			numParticles: 20,
//			numFrames: 8,
//			frameDuration: 0.25,
//			frameStartRange: 8,
			lifeTime: 2,
			timeRange: 2,
			startSize: 0.5,
			endSize: 0.9,
			positionRange: [ 0.1, 0.1, 0.1 ],
			velocity: [ 0, 2, 0 ], velocityRange: [ 0.75, 0.15, 0.75 ],
			acceleration: [ 0, - 1.5, 0 ],
			spinSpeedRange: 1
		} );

		scene.add( emitter );

	}

	function setupBall( particleSystem ) {

		var texture = new THREE.TextureLoader().load( '../../assets/materials/particle/ripple.png' );
		texture.minFilter = THREE.LinearMipMapLinearFilter;
		texture.magFilter = THREE.LinearFilter;

		var emitter = particleSystem.createParticleEmitter( texture );
		emitter.setTranslation( - 4, 0, - 2 );
		emitter.setState( THREE.NormalBlending );
		emitter.setColorRamp(
			[
				1, 1, 1, 1,
				1, 1, 1, 0
			]
		);
		emitter.setParameters( {
				numParticles: 300,
				lifeTime: 2,
				timeRange: 2,
				startSize: 0.1,
				endSize: 0.5,
				colorMult: [ 1, 1, 0.5, 1 ], colorMultRange: [ 0, 0, 0.5, 0 ],
				billboard: false
			},
			function ( particleIndex, parameters ) {

				var matrix = new THREE.Matrix4();
				var matrix2 = new THREE.Matrix4();

				matrix.makeRotationY( Math.random() * Math.PI * 2 );
				matrix2.makeRotationX( Math.random() * Math.PI );
				matrix.multiply( matrix2 );
				var position = new THREE.Vector3( 0, 1, 0 );
				position.transformDirection( matrix );

				parameters.position = [ position.x, position.y, position.z ];
				var q = new THREE.Quaternion();
				q.setFromRotationMatrix( matrix );
				parameters.orientation = [ q.x, q.y, q.z, q.w ];

			} );
		scene.add( emitter );
	}
	function setupBall2( particleSystem ) {

		var texture = new THREE.TextureLoader().load( '../../assets/materials/particle/flame.png' );
		texture.minFilter = THREE.LinearMipMapLinearFilter;
		texture.magFilter = THREE.LinearFilter;

		var emitter = particleSystem.createParticleEmitter(texture);
		emitter.setState( THREE.AdditiveBlending );
		emitter.setColorRamp(
			[
				1, 1, 1, 0.3,
				1, 1, 1, 0
			]
		);
		emitter.setParameters( {
				numParticles: 5,
				numFramesX: 2,numFramesY: 2,
				frameDuration : 1,
				lifeTime: 14,
				startTime: 0,
				timeRange: 14,
				startSize: 10.50,//0.50,
				endSize: 9,//2,
//				spinSpeedRange: 10,
				colorMult: [ 1, 1, 0.5, 1 ],
				billboard: true
			},
			function ( index, parameters ) {

				var matrix = new THREE.Matrix4();
				var angle = Math.random() * 2 * Math.PI;
				matrix.makeRotationY( angle );
				var position = new THREE.Vector3( 8, 0, 0 );//3, 0, 0
				var len = position.length();
				position.transformDirection( matrix );
				parameters.velocity = [ position.x * len, position.y * len, position.z * len ];
				parameters.velocity = [ 0, 2, 0 ];
				var acc = new THREE.Vector3( - 0.3, 0, - 0.3 ).multiply( position );
//				parameters.acceleration = [ acc.x, acc.y, acc.z ];

			} );
		scene.add( emitter );
	}
	function setupCube( particleSystem ) {

		var texture = new THREE.TextureLoader().load( '../assets/materials/particle/ripple.png' );
		texture.minFilter = THREE.LinearMipMapLinearFilter;
		texture.magFilter = THREE.LinearFilter;

		var emitter = particleSystem.createParticleEmitter( texture );
		emitter.setTranslation( 2, 0, - 3 );
		emitter.setState( THREE.AdditiveBlending );
		emitter.setColorRamp(
			[
				1, 1, 1, 1,
				0, 0, 1, 1,
				1, 1, 1, 0
			]
		);
		emitter.setParameters( {
				numParticles: 300,
				lifeTime: 2,
				timeRange: 2,
				startSize: 0.1,
				endSize: 0.5,
				colorMult: [ 0.8, 0.9, 1, 1 ],
				billboard: false
			},
			function ( particleIndex, parameters ) {

				var matrix = new THREE.Matrix4();
				var matrix2 = new THREE.Matrix4();

				matrix.makeRotationY( Math.floor( Math.random() * 4 ) * Math.PI * 0.5 );
				matrix2.makeRotationX( Math.floor( Math.random() * 3 ) * Math.PI * 0.5 );
				matrix.multiply( matrix2 );

				var q = new THREE.Quaternion();
				q.setFromRotationMatrix( matrix );
				parameters.orientation = [ q.x, q.y, q.z, q.w ];

				var position = new THREE.Vector3( Math.random() * 2 - 1, 1, Math.random() * 2 - 1 );
				var len = position.length();
				position.transformDirection( matrix );
				parameters.position = [ position.x * len, position.y * len, position.z * len ];

			} );
		scene.add( emitter );
	}
	function setupPoof( particleSystem ) {
		var emitter = particleSystem.createParticleEmitter();
		emitter.setState( THREE.AdditiveBlending );
		emitter.setColorRamp(
			[
				1, 1, 1, 0.3,
				1, 1, 1, 0
			]
		);
		emitter.setParameters( {
				numParticles: 30,
				lifeTime: 1.5,
				startTime: 0,
				startSize: 1.50,//0.50,
				endSize: 9,//2,
				spinSpeedRange: 10,
				billboard: true
			},
			function ( index, parameters ) {

				var matrix = new THREE.Matrix4();
				var angle = Math.random() * 2 * Math.PI;
				matrix.makeRotationY( angle );
				var position = new THREE.Vector3( 8, 0, 0 );//3, 0, 0
				var len = position.length();
				position.transformDirection( matrix );
				parameters.velocity = [ position.x * len, position.y * len, position.z * len ];
				var acc = new THREE.Vector3( - 0.3, 0, - 0.3 ).multiply( position );
				parameters.acceleration = [ acc.x, acc.y, acc.z ];

			} );

		// make 3 poofs one shots
		for ( var ii = 0; ii < MAX_POOFS; ++ ii ) {

			g_poofs[ ii ] = emitter.createOneShot();

		}

	}

	window.showSkillEffect = function(id, source, target){
		triggerPoof([target.pos.x, 3, target.pos.z])
	};
	function triggerPoof(pos) {

		// We have multiple poofs because if you only have one and it is still going
		// when you trigger it a second time it will immediately start over.

		g_poofs[ g_poofIndex ].trigger(pos? pos: [ 1 + g_poofIndex, 0, 3 ] );

		g_poofIndex ++;

		if ( g_poofIndex == MAX_POOFS ) {

			g_poofIndex = 0;

		}

	}

	function setupTrail( particleSystem ) {

		g_trailParameters = {
			numParticles: 2,
			lifeTime: 2,
			startSize: 0.1,
			endSize: 0.9,
			velocityRange: [ 0.20, 0.20, 0.20 ],
			spinSpeedRange: 0.04,
			billboard: true
		};

		g_trail = particleSystem.createTrail(
			1000,
			g_trailParameters );

		g_trail.setState( THREE.AdditiveBlending );

		g_trail.setColorRamp(
			[
				1, 0, 0, 1,
				1, 1, 0, 1,
				1, 1, 1, 0
			]
		);

	}

	function leaveTrail() {

		var trailClock = ( new Date().getTime() / 1000.0 ) * - 0.8;
		g_trail.birthParticles(
			[ Math.sin( trailClock ) * 4, 2, Math.cos( trailClock ) * 4 ] );

	}
	function update() {
		var time = Date.now() * 0.0005;
//		camera.position.z = Math.sin( - time ) * 15;
//		camera.position.x = Math.cos( - time ) * 15;
//
//		camera.position.y = 5;
//		camera.lookAt( new THREE.Vector3( 0, 1, 0 ) );
		if ( g_keyDown[ 84 ] ) {
			leaveTrail();
		}
		particleSystem.draw();
		//renderer.render( scene, camera );

	}
})();
