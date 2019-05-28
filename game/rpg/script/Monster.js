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
				boundingBox:{x:25, y:25, z:25},
				topBoard:{height:40, scale:{x:30, y:3, z:1}},
				selectable:true,
				scale:.1//.16, r:2
		};
		ResourceManager.loadModel(model, onLoaded);
		//loadModel(model, onLoaded0);
		// model
		var model2 = { name:'Monster2',
				url:'../assets/models/hu.FBX',
				animation:'free', animationsFiles:{
					walk: '../assets/models/hu@run.FBX',
					die: '../assets/models/hu@die.FBX',
					attack: '../assets/models/hu@attack.FBX'
				},
				boundingBox:{x:90, y:70, z:90},
				position:{x:193, y: 0, z: 333},
				topBoard:{height:100, scale:{x:80, y:8, z:1}},
				selectionScale:1.7,
				selectable:true,
				radius: 1 , scale:.05//
		};
		ResourceManager.loadModel(model2, onLoaded2);
		//units position
		var team1Positions=[{"x":279.3,"y":0,"z":224.5},{"x":279.5,"y":0,"z":232.5},{"x":279.2,"y":0,"z":240.2},{"x":279.3,"y":0,"z":248.6},{"x":287.4,"y":0,"z":224.5},{"x":287.3,"y":0,"z":232.5},{"x":287.2,"y":0,"z":240.2},{"x":287.4,"y":0,"z":248.4},{"x":295.4,"y":0,"z":224.5},{"x":295.5,"y":0,"z":232.4},{"x":295.2,"y":0,"z":240.6},{"x":295.4,"y":0,"z":248.4},{"x":303.5,"y":0,"z":224.4},{"x":303.4,"y":0,"z":232.5},{"x":303.4,"y":0,"z":240.4}];
		//enemy units position
		var team2Positions=[{"x":191.6,"y":0,"z":293.2},{"x":191.7,"y":0,"z":303.3},{"x":191.6,"y":0,"z":313.5},{"x":191.6,"y":0,"z":323.5},{"x":201.6,"y":0,"z":293.3},{"x":201.7,"y":0,"z":303.3},{"x":201.7,"y":0,"z":313.5},{"x":201.5,"y":0,"z":323.5},{"x":211.5,"y":0,"z":293.4},{"x":211.7,"y":0,"z":303.3},{"x":211.5,"y":0,"z":313.4},{"x":211.5,"y":0,"z":323.4},{"x":221.5,"y":0,"z":293.3},{"x":221.6,"y":0,"z":303.2},{"x":221.7,"y":0,"z":313.1}];
		function onLoaded( object) {
			var i = 0, original=object;//55
		    for(i=0;i<15;i++) {
		    	object=ResourceManager.cloneFbx(original);
				object.actions.attack.timeScale=.8;
	    		object.playAction('free');
	    		var j = i>=15?i%15:i;
		    	object.position.copy(team1Positions[j])//rand(20,480),0, rand(20,480)
		    	var entity = new iEntity();
		    	entity.setModel(object)
		    	entity.setRadius(1.5);
		    	entity.speed=25/1.5;
		    	entity.attackHitTime=0.36666667461395264 -.08;
		    	entity.addTopBoard(model.topBoard);
		    	entity.addAIComponent();
				entity.addToTeam(1, 1);
				entity.addUpdater();
				entity.addToScene();
		    }
		}
		function onLoaded0( object) {
			var i = 0, original=object;//55
		    for(i=0;i<15;i++) {
		    	object=ResourceManager.cloneFbx(original);
				object.actions.attack.timeScale=.8
	    		object.playAction('free');
	    		var j = i>=15?i%15:i;
		    	object.position.copy(team2Positions[j])//rand(20,480),0, rand(20,480)
		    	var entity = new iEntity();
		    	entity.setModel(object)
		    	entity.setRadius(1.5);
		    	entity.attackHitTime=0.36666667461395264 -.08;
		    	entity.addTopBoard(model.topBoard);
		    	entity.addAIComponent();
		    	entity.addUpdater();
		    	entity.addToTeam( 2, 2);
		    	entity.addToScene();
		    }
		}
		function onLoaded2( object) {
			var i = 0, original=object;//55
			for(i=0;i<15;i++) {
		    	object=ResourceManager.cloneFbx(original);
	    		object.playAction('free');
	    		var j = i>=15?i%15:i;
	    		object.position.copy(team2Positions[j]);
	    		var entity = new iEntity();
	    		entity.setModel(object);
	    		entity.setRadius(2.5);
	    		entity.speed=25;
		    	entity.attackHitTime=0.36666667461395264 -.08;
		    	entity.addTopBoard(model2.topBoard);
		    	entity.addAIComponent();
		    	entity.addUpdater();
		    	entity.addToTeam( 2, 2);
		    	entity.addToScene();
//		    	entity.audio=new THREE.PositionalAudio( audioListener );
//		    	entity.model.add(entity.audio);
//		    	loadAudio( '../assets/audio/s1.mp3', (function(object){return function ( buffer ) {
//					entity.audio.setBuffer( buffer );
//					entity.audio.setRefDistance( 20 );
//					entity.audio.setVolume( 2 );
//				} })(object) );
		    }
		}
	}
})();