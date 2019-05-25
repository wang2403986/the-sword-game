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
		scale:.03,//.04
		position:{x:281.8434354806188, y: 0, z: 259.4504251984771},
		topBoard:{height:280, scale:{x:100, y:10, z:1}},
		selectionScale:3
	};
	
	loadModel(model, onLoaded);
	
	function onLoaded( object ) {
		addAnimationMixer( object );
		//var action = object.mixer.clipAction( object.animations[ 0 ] );
		object.playAction('free');
		
		var bbox = { geometry:object.boundingBoxGeometry, matrixWorld:object.matrixWorld };
		bbox._model=object, object.bbox=bbox;
		raycaster_models.push(bbox);
		//child.material.color.setHex( 0xffcccc );
		scene.add( object );
		player = object;
		
		camera.setSource&&camera.setSource(player);
		new iEntity().setModel(object).setRadius(1.5).rangedAttack=true;
		object.entity.topboard=object.topboard=new TopBoard(object.entity, model.topBoard);
		new AIComponent(object.entity);
		addUpdater(object.entity);
		addTeamUnit(object.entity, 1, 1);
		// ÃÌº”π÷ŒÔ
		addMonster();
		object.entity.attackHitTime=0.89;
		object.entity.rangedAttack=true;
		object.entity.attackRange=15;
		object.entity.maxHP= object.entity.HP=1000;
//		object.entity.audio=new THREE.PositionalAudio( audioListener );
//		loadAudio( '../assets/audio/EtherealMediumHit3.wav', function ( buffer ) {
//			object.entity.audio.setBuffer( buffer );
//			object.entity.audio.setVolume( 10 );
//			object.entity.audio.setRefDistance( 20 );
//		} );
//    	object.add(object.entity.audio);
    	
    	var geometry = new THREE.PlaneBufferGeometry( 150, 150 );
    	var vertices = geometry.attributes.position.array;
        for ( var j = 0, l = vertices.length; j < l; j += 3 ) {
        	vertices[ j + 2 ]=-vertices[ j + 1 ];
        	vertices[ j + 1 ]=2;
    	}
    	var texture = THREE.ImageUtils.loadTexture('../assets/materials/Rune1d.png');
    	var material = new THREE.MeshBasicMaterial( {color: 0xff0000,depthTest: true,depthWrite:true, map: texture,//alphaMap
    		transparent: true,   blending: THREE.AdditiveBlending } );
    	var cone = new THREE.Mesh( geometry, material );
    	cone.update = function(deltaTime){
    		if(this.visible){
    			if(this.lifeTime<now) this.visible=false;
    			this.rotation.y+=.05;
    			if(this.rotation.y>Math.PI*2)this.rotation.y=0;
    		}
    	};
    	//addUpdater(cone);
    	object.add(cone)
	}
})();
