( function(){
// model
	var anims={  free: '../assets/models/ou_yang@stand.FBX',
			     skill: '../assets/models/ou_yang@skill.FBX',
			     attack: '../assets/models/ou_yang@attack.FBX',//aaa
			     die: '../assets/models/ou_yang@die.FBX'  };
	var model = {
		url: '../assets/models/ou_yang.FBX',
		animation:'walk',
		animationsFiles:anims,
		material:{alphaTest:.5},
		boundingBox:{x:60, y:160, z:60},
		scale:.05,
		position:{x:281.8434354806188, y: 0, z: 259.4504251984771},
		topBoard:{height:280, scale:{x:100, y:10, z:1}},
		selectionScale:3
	};
	
	loadModel(model, onLoaded);
	
	function onLoaded( object ) {
		object.mixer = new THREE.AnimationMixer( object );
		mixers.push( object.mixer );
		//var action = object.mixer.clipAction( object.animations[ 0 ] );
		object.playAction('free');
		
		var bbox = new THREE.Mesh( object.boundingBoxGeometry, MeshBlackMaterial );
		bbox._model=object, bbox.matrixWorld=object.matrixWorld;
		object.bbox=bbox;
		raycaster_models.push(bbox);
		//child.material.color.setHex( 0xffcccc );
		scene.add( object );
		player = object;
		
		camera.setSource&&camera.setSource(player);
		//var Sprite= textSprite({message:'ÕıÃœ11',HP:100});
		//player.add(Sprite);
		new iEntity().setModel(object);
		object.entity.topboard=object.topboard=new TopBoard(object.entity, model.topBoard);
		new iPhysics(object.entity);
		addUpdater(object.entity);
		addTeamUnit(object.entity, 1, 1);
		// ÃÌº”π÷ŒÔ
		addMonster();
	}
})();
