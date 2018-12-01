(function(){
	window.addMonster=addMonster;
	function addMonster(){
		// model
		var model = { name:'Monster1',
				url:'../assets/models/hou_zi.FBX',
				animation:'walk', animationsFiles:{
					free: '../assets/models/hou_zi@free.FBX',
					die: '../assets/models/hou_zi@die.FBX',
					attack: '../assets/models/hou_zi@attack.FBX'
				},
				boundingBox:{x:20, y:20, z:20},
				topBoard:{height:40, scale:{x:30, y:3, z:1}},
				scale:.16//.2 .15 .05 scale:.08
		};
		loadModel(model, onLoaded);
		// model
		var model2 = { name:'Monster2',
				url:'../assets/models/hu.FBX',
				animation:'free', animationsFiles:{
					walk: '../assets/models/hu@run.FBX',
					die: '../assets/models/hu@die.FBX',
					attack: '../assets/models/hu@attack.FBX'
				},
				boundingBox:{x:40, y:100, z:40},
				position:{x:193, y: 0, z: 333},
				topBoard:{height:100, scale:{x:80, y:8, z:1}},
				selectionScale:4,
				radius: 1 , scale:.05//
		};
		loadModel(model2, onLoaded2);
		//units position
		var team1Positions=[{x: 297.5097177611134, y: 0, z: 227.49068714559965}
		,{x: 297.6893219994267, y: 0, z: 243.6025494163561}
		,{x: 297.6483929862446, y: 0, z: 259.4010713425036},{x: 313.58411680637954, y: 0, z: 227.55047008382772}
		,{x: 313.55076793900497, y: 0, z: 243.45584369279445}];
		//enemy units position
		var team2Positions=[{x: 177.73393857389513, y: 0, z: 319.54388206624026},
		{x: 177.74255178969676, y: 0, z: 335.531304091303}
		,{x: 177.72216067437978, y: 0, z: 351.52858765281644}
		,{x: 193.66842182380037, y: 0, z: 319.5213804064838}
		,{x: 193.672910289981, y: 0, z: 335.52189589186986}];
		function onLoaded( object , team) {
			var i = 0, original=object;//55
		    for(i=0;i<15;i++) {
		    	object=cloneFbx(original);
		    	var bbox = { geometry:original.boundingBoxGeometry, matrixWorld:object.matrixWorld };
				bbox._model=object;
				object.bbox=bbox;
				raycaster_models.push(bbox);
		    	
		    	object.mixer = new THREE.AnimationMixer( object );
	    		mixers.push( object.mixer );
	    		object.playAction('free');
	    		var j = i>=5?i%5:i;
		    	object.position.copy(team1Positions[j])//rand(20,480),0, rand(20,480)
		    	scene.add( object );
		    	new MonsterEntity().setModel(object).setRadius(2);
		    	object.entity.attackCooldownTime=1000*0.36666667461395264;
		    	object.entity.topboard=object.topboard=new TopBoard(object.entity, model.topBoard);
		    	new iPhysics(object.entity);
		    	addUpdater(object.entity);
		    	addTeamUnit(object.entity, 1, 1);
//		    	object.entity.audio=new THREE.PositionalAudio( listener );
//		    	object.add(object.entity.audio);
//		    	loadAudio( '../assets/audio/s1.mp3', (function(object){return function ( buffer ) {
//					object.entity.audio.setBuffer( buffer );
//					object.entity.audio.setRefDistance( 20 );
//					object.entity.audio.setVolume( 2 );
//				} })(object) );
		    }
		}
		function onLoaded2( object , team) {
			var i = 0, original=object;//55
			for(i=0;i<15;i++) {
		    	object=cloneFbx(original);
		    	var bbox = { geometry:original.boundingBoxGeometry, matrixWorld:object.matrixWorld };
				bbox._model=object;
				object.bbox=bbox;
				raycaster_models.push(bbox);
		    	
		    	object.mixer = new THREE.AnimationMixer( object );
	    		mixers.push( object.mixer );
	    		object.playAction('free');
	    		var j = i>=5?i%5:i;
	    		object.position.copy(team2Positions[j]);
		    	scene.add( object );
		    	new MonsterEntity().setModel(object).setRadius(2.5);
		    	object.entity.attackCooldownTime=1000*0.36666667461395264;
		    	object.entity.topboard=object.topboard=new TopBoard(object.entity, model2.topBoard);
		    	new iPhysics(object.entity);
		    	addUpdater(object.entity);
		    	addTeamUnit(object.entity, 2, 2);
//		    	object.entity.audio=new THREE.PositionalAudio( listener );
//		    	object.add(object.entity.audio);
//		    	loadAudio( '../assets/audio/s1.mp3', (function(object){return function ( buffer ) {
//					object.entity.audio.setBuffer( buffer );
//					object.entity.audio.setRefDistance( 20 );
//					object.entity.audio.setVolume( 2 );
//				} })(object) );
		    }
		}
	}
	MonsterEntity.prototype =Object.create(iEntity.prototype);
	function MonsterEntity() {
		iEntity.call(this, null);
		var walkSpeed=this.speed=100/4///4;          //移动速度
	    var actRestTme =17000;            //更换待机指令的间隔时间
	    var lastActTime;          //最近一次指令时间
	}
	
	var v3_1=new THREE.Vector3(), actRestTme =17000;  //更换待机指令的间隔时间
	MonsterEntity.prototype.super_update=MonsterEntity.prototype.update;
	MonsterEntity.prototype.update= function (fElapse) {
    	if(this.super_update(fElapse)) return;
    	if(this.lastActTime===undefined) this.lastActTime= now-actRestTme;
        //待机状态，等待actRestTme后重新随机指令
        if (now - this.lastActTime > actRestTme) {
        	this.lastActTime= now;
        	//this.physics.findPath(v3_1.set(rand(1,511),0, rand(1,511)));
        }
	}

})();