(function (){
	var geometry = new THREE.PlaneBufferGeometry( 10, 10 );
	var vertices = geometry.attributes.position.array;
    for ( var j = 0, l = vertices.length; j < l; j += 3 ) {
    	vertices[ j + 2 ]=-vertices[ j + 1 ];
    	vertices[ j + 1 ]=0;
	}
	var texture = THREE.ImageUtils.loadTexture('../assets/materials/Rune1d.png');
	var material = new THREE.MeshBasicMaterial( {color: 0xff00ff,depthTest: false,depthWrite:false, alphaMap: texture,
		transparent: true,   blending: THREE.NormalBlending } );
	var cone = new THREE.Mesh( geometry, material );
	cone.update = function(deltaTime){
		if(this.visible){
			if(this.lifeTime<now) this.visible=false;
			this.rotation.y+=.05;
			if(this.rotation.y>Math.PI*2)this.rotation.y=0;
		}
	};
	addUpdater(cone);
	window.cursorEntity = cone;
	scene.add( cone );
	var points = [], length = 5;
	for (var i = 0; i < length*3; i++) {
	 points.push(100)
	}
	var geometryPoints = new THREE.BufferGeometry()//.setFromPoints( points );
	geometryPoints.addAttribute( 'position', new THREE.Float32BufferAttribute( points, 3 ) );
	var selectionMaterial = new THREE.LineBasicMaterial({ color: 0xff0000,depthTest: false,depthWrite:false });
	var selectionRect=new THREE.Line(geometryPoints, selectionMaterial);
	
	var rectPositions=[0,0,0,0], selections=[]
	function sign (p1, p2, p3) {
//	    return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
		return (p1.x - p3.x) * (p2.z - p3.z) - (p2.x - p3.x) * (p1.z - p3.z);
	}
	function isPointInTriangle (pt, v1, v2, v3) {
	    var b1, b2, b3;

	    b1 = sign(pt, v1, v2) < 0.0;
	    b2 = sign(pt, v2, v3) < 0.0;
	    b3 = sign(pt, v3, v1) < 0.0;

	    return ((b1 == b2) && (b2 == b3));
	}
	function locateSelectionRect(){
		var arr= geometryPoints.attributes.position.array;
		for(var i=0;i< 5; i++) {
			var j = i>3? 0: i;
			var e = i*3;
			arr[e] = rectPositions[j].x;
			arr[e+1] = rectPositions[j].y
			arr[e+2] = rectPositions[j].z;
		}
		geometryPoints.attributes.position.needsUpdate = true;
		geometryPoints.computeBoundingSphere()
		selections.length=0;
		for (var j=0; j<g_gameUnits.length;j++) {
			var unit = g_gameUnits[j];
			var radius=unit.radius;
			var select =isPointInTriangle(unit.pos,rectPositions[0],rectPositions[1],rectPositions[2])
			 ||isPointInTriangle(unit.pos,rectPositions[0],rectPositions[2],rectPositions[3]);
			unit.model.selectionCircle.visible = select;
			if(select)selections.push(unit);
		}
	}
	
	new cMap().loadMap();
	var selectionStart=false, isDraged=false, mouseStart=new THREE.Vector2(), touchStartX, touchStartY;
	document.addEventListener('mousedown', function(event){
		isDraged = false;
		if (skillTargetMode) return;
		if(event.button == 0){
			selectionStart = true;
			selectionRect.visible =false;
			scene.add(selectionRect);
		}
		touchStartX=event.clientX, touchStartY=event.clientY;
		mouseStart.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		mouseStart.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
	}, false);
	document.addEventListener('mousemove', function(event){
		if (skillTargetMode) return;
		if(!isDraged &&Math.abs(touchStartX-event.clientX)>4||Math.abs(touchStartY-event.clientY)>4){
			isDraged= true;
		}
		if(selectionStart&&isDraged) {
			selectionRect.visible=true;
			mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
			mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
			if (window.terrin===undefined) return;
			var x=mouse.x, y=mouse.y, objects=[terrin];
			raycaster.setFromCamera( mouseStart, camera );
			rectPositions[0] = raycaster.intersectObjects( objects )[0].point;
			mouse.x=x ;mouse.y = mouseStart.y;
			raycaster.setFromCamera( mouse, camera );
			rectPositions[1] = raycaster.intersectObjects( objects )[0].point;
			mouse.x=x ;mouse.y = y;
			raycaster.setFromCamera( mouse, camera );
			rectPositions[2] = raycaster.intersectObjects( objects )[0].point;
			mouse.x=mouseStart.x ;mouse.y = y;
			raycaster.setFromCamera( mouse, camera );
			rectPositions[3] = raycaster.intersectObjects( objects )[0].point;
			locateSelectionRect()
		}
	}, false);
	document.addEventListener('mouseup', mouseupMsg, false);
	document.addEventListener('keydown', function(event){
		if(event.keyCode == 49) {
			skillTargetMode=1;
			document.body.style.cursor='crosshair';
		}else if(event.keyCode == 17){
			controls.enableRotate=true
		}
	}, false);
	document.addEventListener('keyup', function(event){
		if(event.keyCode == 49) {
			
		}else if(event.keyCode == 17){
			controls.enableRotate=false
		}
	}, false);
	var selection=null; var vec1= new THREE.Vector3(); var skillTargetMode=false;
	function mouseupMsg(event) {
		if(selectionStart) scene.remove(selectionRect);
		selectionStart=false;
		mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
		raycaster.setFromCamera( mouse, camera );
		if(event.button == 2){
			skillTargetMode = false;
			document.body.style.cursor='pointer';
			if (window.terrin===undefined) return;
			//if(!window.terrin2) return;
			var intersects=raycaster.intersectBoxs( raycaster_models );
			if(intersects.length > 0 ) {
				var target = intersects[0].object._model.entity, pos = target.pos;
				var entity = window.cursorEntity;
				entity.position.set(pos.x,pos.y,pos.z);
				entity.visible=true; entity.lifeTime=now + 800;
				for (var i=0;i<selections.length;i++) {
					if(selections[i].physics&& selections[i]!==target)
					selections[i].physics.setAttackTarget(target);
				}
				return;
			}
			var intersects = raycaster.intersectObjects( [terrin] );
			if (intersects.length)  {
				var pos =intersects[0].point;
//					player.physics.breakAutoMove();
				var entity = window.cursorEntity;
				entity.position.set(pos.x,pos.y,pos.z);
				entity.visible=true; entity.lifeTime=now + 800;
				//if(selection && !selection._model.entity.isDead)
					//selection._model.entity.physics.findPath(pos);
				for (var i=0;i<selections.length;i++) {
					if(selections[i].physics)
					selections[i].physics.autoFindPathMax = now + 30*1000;
				}
				var centerX = pos.x,centerY=pos.z;
				var size =selections.length;
				var sqrt =  Math.sqrt(size);
				if((sqrt>>0) !== sqrt){
					sqrt=(sqrt>>0)+1;
				}
				var r=sqrt/2.0;
				var left=0,rigt=0;
				if((r>>0) !== r){
					left=-(r>>0) ;
					rigt=(r>>0);
				}else{
					left=-(r>>0)+1;
					rigt=(r>>0);
				}
				var c=0;
				for (var i=left;i<=rigt;i++)
					for (var j=left;j<=rigt;j++) {
						if(c>=size) break;
						if(selections[c].physics){
							var physics=selections[c].physics;
							physics.findPath(vec1.set(centerX+16*i,0,centerY+16*j),0);
						}
						c++;
					}
			}
	         return;
	    }else if(event.button == 0){
	        console.log('left');
	    }
		if(camera.isDraged&&camera.isDraged())
			return 1;
		if(!skillTargetMode && isDraged) return ;
		var intersects=raycaster.intersectBoxs( raycaster_models ), skillTarget;
		if(skillTargetMode) {
			skillTargetMode = false;
			document.body.style.cursor='pointer';
			if(intersects.length > 0 ) {
				skillTarget = intersects[0].object._model.entity;
				player.entity.physics.setSkillTarget(skillTarget);
			}
			return;
		}
		if(intersects.length > 0 ) {
			for (var j=0; j<selections.length;j++) {
				selections[j].model.selectionCircle.visible=false;
			}
			selections.length=0;
			if (selection) {
				selection._model.selectionCircle.visible=false;
			}
			selection = intersects[0].object;
			selection._model.selectionCircle.visible=true;
			setActiveEntity(selection._model.entity);
			selections.push(selection._model.entity)
		} else {
			if(selection) selection._model.selectionCircle.visible=false;
			selection=null
			setActiveEntity(null);
		}
	}
})(window);


