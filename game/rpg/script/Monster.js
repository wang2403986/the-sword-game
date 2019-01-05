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
				scale:.1//.16, r:2
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
		var team1Positions=[{"x":279.3,"y":0,"z":224.5},{"x":279.5,"y":0,"z":232.5},{"x":279.2,"y":0,"z":240.2},{"x":279.3,"y":0,"z":248.6},{"x":287.4,"y":0,"z":224.5},{"x":287.3,"y":0,"z":232.5},{"x":287.2,"y":0,"z":240.2},{"x":287.4,"y":0,"z":248.4},{"x":295.4,"y":0,"z":224.5},{"x":295.5,"y":0,"z":232.4},{"x":295.2,"y":0,"z":240.6},{"x":295.4,"y":0,"z":248.4},{"x":303.5,"y":0,"z":224.4},{"x":303.4,"y":0,"z":232.5},{"x":303.4,"y":0,"z":240.4}];
		//enemy units position
		var team2Positions=[{"x":191.6,"y":0,"z":293.2},{"x":191.7,"y":0,"z":303.3},{"x":191.6,"y":0,"z":313.5},{"x":191.6,"y":0,"z":323.5},{"x":201.6,"y":0,"z":293.3},{"x":201.7,"y":0,"z":303.3},{"x":201.7,"y":0,"z":313.5},{"x":201.5,"y":0,"z":323.5},{"x":211.5,"y":0,"z":293.4},{"x":211.7,"y":0,"z":303.3},{"x":211.5,"y":0,"z":313.4},{"x":211.5,"y":0,"z":323.4},{"x":221.5,"y":0,"z":293.3},{"x":221.6,"y":0,"z":303.2},{"x":221.7,"y":0,"z":313.1}];
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
	    		var j = i>=15?i%15:i;
		    	object.position.copy(team1Positions[j])//rand(20,480),0, rand(20,480)
		    	scene.add( object );
		    	new MonsterEntity().setModel(object).setRadius(1.5);
		    	object.entity.attackCooldownTime=1000*0.36666667461395264;
		    	object.entity.topboard=object.topboard=new TopBoard(object.entity, model.topBoard);
		    	new iPhysics(object.entity);
		    	addUpdater(object.entity);
		    	addTeamUnit(object.entity, 1, 1);
//		    	object.entity.audio=new THREE.PositionalAudio( audioListener );
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
	    		var j = i>=15?i%15:i;
	    		object.position.copy(team2Positions[j]);
		    	scene.add( object );
		    	new MonsterEntity().setModel(object).setRadius(2.5).speed=25;
		    	object.entity.attackCooldownTime=1000*0.36666667461395264;
		    	object.entity.topboard=object.topboard=new TopBoard(object.entity, model2.topBoard);
		    	new iPhysics(object.entity);
		    	addUpdater(object.entity);
		    	addTeamUnit(object.entity, 2, 2);
//		    	object.entity.audio=new THREE.PositionalAudio( audioListener );
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
		var walkSpeed=this.speed=25/1.5 ///4;          //移动速度
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