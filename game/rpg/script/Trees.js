(function(){
	function addTrees(){
		// model
		var models = [{ name:'tree3',
				url:'../assets/models/Building3.FBX',//
				animation:'free', animationsFiles:{
					
				},
				boundingBox:{x:300, y:300, z:300},
				position:{x:200, y:0, z:200},
				selectionScale:12,
				scale:.05//.2 .05
		},
		{ name:'tree2',
			url:'../assets/models/Building2.FBX',
			animation:'free', animationsFiles:{
				
			},
			material: { alphaTest:.5 },
			boundingBox:{x:300, y:300, z:300},
			position:{x:320, y:0, z:200},
			selectionScale:12,
			scale:.05//.2 .05
		},
		{ name:'tree1',
			url:'../assets/models/Building1.FBX',
			animation:'free', animationsFiles:{
				
			},
			boundingBox:{x:300, y:300, z:300},
			position:{x:260, y:0, z:240},
			selectionScale:12,
			scale:.05//.2 .05
		}
		];
		for(var i=0;i< models.length;i++){
			loadModel(models[i], onLoaded);
		}
		function onLoaded( object, callback ) {
			var i = 55, original=object;//55
		    //while(i--) {
		    	//object=cloneFbx(original);
		    	var bbox = new THREE.Mesh(original.boundingBoxGeometry, MeshBlackMaterial );
				bbox._model=object, bbox.matrixWorld=object.matrixWorld;
				raycaster_models.push(bbox);
		    	
		    	//object.mixer = new THREE.AnimationMixer( object );
	    		//mixers.push( object.mixer );
	    		//object.playAction('free');
		    	//object.position.set(200,0, 200)
		    	scene.add( object );
		    	new iEntity().setModel(object).radius = 8;
		    	//new iPhysics(object.entity);
		    	//addUpdater(object.entity);
		    	addTeamUnit(object.entity, 1, 1);
		    //}
		}
	}
	addTrees()
})();