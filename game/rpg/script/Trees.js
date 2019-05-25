(function(){
	function addTrees(){
		// model
		var models = [
//		{ name:'Building3',
//				url:'../assets/models/Building3.FBX',//
//				animation:'free', animationsFiles:{
//					
//				},
//				boundingBox:{x:300, y:300, z:300},
//				position:{x:200, y:0, z:200},
//				selectionScale:12,
//				scale:.04//.2 .05
//		},
//		{ name:'Building2',
//			url:'../assets/models/Building2.FBX',
//			animation:'free', animationsFiles:{
//				
//			},
//			material: { alphaTest:.5 },
//			boundingBox:{x:300, y:300, z:300},
//			position:{x:320, y:0, z:200},
//			selectionScale:12,
//			scale:.04//.2 .05
//		},
		{ name:'Building1',
			url:'../assets/models/Building1.FBX',
			animation:'free', animationsFiles:{
				
			},
			boundingBox:{x:300, y:300, z:300},
			position:{x:260, y:0, z:240},
			selectionScale:12,
			scale:.015//.2 .05
		},
		{ name:'shu01',
			//url:'../assets/models/Building1.FBX',
			url:'../assets/models/shu01.FBX',
			animation:'free', animationsFiles:{
				
			},
			boundingBox:{x:300, y:300, z:300},
			position:{x:260, y:0, z:240},
			selectionScale:0.1 ,
			selectable:false,
			material:{alphaMap:null},
			scale:3//.2 .05
		}
		];
		for(var i=0;i< models.length;i++){
			loadModel(models[i], onLoaded);
		}
		function onLoaded( object, callback ) {
			var i = 155, original=object;//55
		    while(i--) {
		    	object=cloneFbx(original);
			var bbox = { geometry:original.boundingBoxGeometry, matrixWorld:object.matrixWorld };
				bbox._model=object; object.bbox=bbox;
				if(original.selectable!==false)
					raycaster_models.push(bbox);
		    	
		    	//object.mixer = new THREE.AnimationMixer( object );
	    		//mixers.push( object.mixer );
	    		//object.playAction('free');
		    	object.position.set(512*Math.random(),0, 512*Math.random())
		    	var pMap = getMap();
		    	object.position.y = pMap.getHeight(object.position.x, object.position.z);
		    	scene.add( object );
		    	new iEntity().setModel(object).setRadius(3);
		    	//new AIComponent(object.entity);
		    	//addUpdater(object.entity);
		    	addTeamUnit(object.entity, -1, -1);
		    }
		}
	}
	addTrees()
})();