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
		var team1Positions=[{"x":279.3859593973951,"y":0,"z":224.50814575732892},{"x":279.5,"y":0,"z":232.5},{"x":279.2736644799938,"y":0,"z":240.25749765713618},{"x":279.3634253300587,"y":0,"z":248.6365746699413},{"x":287.485,"y":0,"z":224.52},{"x":287.3103781279533,"y":0,"z":232.5316036453411},{"x":287.2686725991591,"y":0,"z":240.2301180323523},{"x":287.4741862761547,"y":0,"z":248.43546569038665},{"x":295.48,"y":0,"z":224.515},{"x":295.58596500450034,"y":0,"z":232.4140349954997},{"x":295.2468796297932,"y":0,"z":240.6150875270616},{"x":295.448687222434,"y":0,"z":248.49745984449328},{"x":303.52,"y":0,"z":224.48499999999999},{"x":303.4944903476878,"y":0,"z":232.5137741307804},{"x":303.43374176906104,"y":0,"z":240.40061265359154}];
		//enemy units position
		var team2Positions=[{"x":191.63606812732485,"y":0,"z":293.2915993078097},{"x":191.74039900648802,"y":0,"z":303.3317206954584},{"x":191.65622648654838,"y":0,"z":313.55467927029196},{"x":191.6887925859137,"y":0,"z":323.56135759042195},{"x":201.60241486516924,"y":0,"z":293.3475964297283},{"x":201.74039900648802,"y":0,"z":303.3317206954584},{"x":201.71256843763197,"y":0,"z":313.56908474223036},{"x":201.59368917904058,"y":0,"z":323.5304489831882},{"x":211.50229208013968,"y":0,"z":293.49655676666936},{"x":211.71991820847504,"y":0,"z":303.3460572540675},{"x":211.51044846358485,"y":0,"z":313.4059638277364},{"x":211.51044846358485,"y":0,"z":323.4059638277364},{"x":221.5777652475772,"y":0,"z":293.38268825630803},{"x":221.6654878389735,"y":0,"z":303.24647842300897},{"x":221.70153050489128,"y":0,"z":313.19596307899235}];
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
	    		var j = i>=15?i%15:i;
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