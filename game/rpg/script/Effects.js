(function(){
	var flamePool =[],shockwavePool =[];
	var shockwaveTexture=THREE.ImageUtils.loadTexture('../assets/materials/shockwave.png');
	var flameTexture=THREE.ImageUtils.loadTexture('../assets/materials/flame.png');
var up=new THREE.Vector3(0,1,0);
var up2=new THREE.Vector3(0,1,0,0,0,-1);
window.BurstEffect=BurstEffect;
function BurstEffect(position, EffectTime) {
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

})()