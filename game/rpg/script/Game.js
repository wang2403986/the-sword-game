(function (){
	var loader2 = new THREE.JSONLoader();
	window.showClickEffects=function(){};
	loader2.load("../assets/models/RallyArrow2.json", function(geometry,matls){
		matls[0].skinning= matls[0].transparent=true;matls[0].color.setRGB(34/256,177/256,76/256);
		var mesh = new THREE.SkinnedMesh(geometry, matls[0] );

		mesh.scale.set(.06,.06,.06);
		mesh.rotateX(-Math.PI/2);
		scene.add( mesh );
        //geometry.animations[0].resetDuration()
        var mixer = new THREE.AnimationMixer( mesh );
        var action=mixer.clipAction(geometry.animations[0] );
        action.clampWhenFinished = true;
		action.loop = THREE.LoopOnce;
		action.reset().play();
		window.cursorEntity=mesh;
		window.showClickEffects=function(){
			action.reset();
			action.play();
		};
        mixers.push(mixer);
    });
	
	
	var points = [], length = 5;
	for (var i = 0; i < length*3; i++) {
	 points.push(100)
	}
	var geometryPoints = new THREE.BufferGeometry()//.setFromPoints( points );
	geometryPoints.addAttribute( 'position', new THREE.Float32BufferAttribute( points, 3 ) );
	var selectionMaterial = new THREE.LineBasicMaterial({ color: 0xff0000,depthTest: false,depthWrite:false });
	var selectionRect=new THREE.Line(geometryPoints, selectionMaterial);
	
	var rectPositions=[new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3()];
	var selections=[]
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
	function selectObjectsInRect(x,y,w,h){
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
		var units = SceneManager.units;
		for (var j=0; j<units.length;j++) {
			var unit = units[j];
			var radius=unit.radius;
			if(unit.model.selectionCircle){
				var pos = rectPositions[0].copy(unit.pos).project(camera);
				var isSelected = x<=pos.x&& pos.x<=x+w && y<=pos.y&& pos.y<=y+h;
//				var select =isPointInTriangle(unit.pos,rectPositions[0],rectPositions[1],rectPositions[2])
//				 ||isPointInTriangle(unit.pos,rectPositions[0],rectPositions[2],rectPositions[3]);
				unit.model.selectionCircle.visible = isSelected;
				if(isSelected)selections.push(unit);
			}
		}
	}
	
	new cMap().loadMap();// TODO
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
		if(selectionStart && isDraged) {
			selectionRect.visible=true;
			mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
			mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
			if (window.terrin===undefined) return;
			var x=mouse.x, y=mouse.y//, objects=[terrin];
			rectPositions[0].set(mouseStart.x,mouseStart.y,0).unproject(camera);
			rectPositions[1].set(x,mouseStart.y,0).unproject(camera);
			rectPositions[2].set(x,y,0).unproject(camera);
			rectPositions[3].set(mouseStart.x,y,0).unproject(camera);
			var w=Math.abs(x-mouseStart.x), h=Math.abs(y-mouseStart.y);
			if(x>mouseStart.x) x=mouseStart.x;
			if(y>mouseStart.y) y=mouseStart.y;
			selectObjectsInRect(x,y, w, h);
		}
	}, false);
	document.addEventListener('mouseup', mouseupMsg, false);
	window.castSkill=castSkill;
	function castSkill(){
		skillTargetMode=1;
		document.body.style.cursor='url("../assets/pic/cursor.ico"),auto';//crosshair
	}
	document.addEventListener('keydown', function(event){
		if(event.keyCode == 49) {
			castSkill();
		}else if(event.keyCode == 17){
			//controls.enableRotate=true //TODO
		}
	}, false);
	document.addEventListener('keyup', function(event){
		if(event.keyCode == 49) {
			
		}else if(event.keyCode == 17){
			controls.enableRotate=false
		}
	}, false);
	var selection=null;
	var vec1= new THREE.Vector3();
	var skillTargetMode=false;
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
			var intersects=raycaster.intersectBoxs( SceneManager.boundingBoxes );
			var isAttack=true;
			if(intersects.length > 0 ) {
				var target = intersects[0].object.model.entity, pos = target.pos;
				var entity = window.cursorEntity;
				showClickEffects()
				entity.position.set(pos.x,pos.y,pos.z);
				entity.visible=true;
				entity.lifeTime=now + 800;
				for (var i=0;i<selections.length;i++) {
					if(selections[i].aiComponent&& selections[i]!==target ){
						if(selections[i].teamId!==target.teamId)
							selections[i].aiComponent.setAttackTarget(target);
						else {
							selections[i].aiComponent.autoFindPathMax = now + 30*1000;
							selections[i].aiComponent.findPath(vec1.copy(target.pos),0);
							this.attackToMode = false;
						}
					}
				}
				return;
			}
			var intersects = raycaster.intersectObjects( [terrin] );
			if (intersects.length)  {
				var pos =intersects[0].point;
//					player.aiComponent.breakAutoMove();
				var entity = window.cursorEntity;
				showClickEffects()
				entity.position.set(pos.x,pos.y,pos.z);
				entity.visible=true;
				entity.lifeTime=now + 800;
				var maxRadius=0;
				for (var i=0;i<selections.length;i++) {
					if(selections[i].aiComponent){
						selections[i].aiComponent.autoFindPathMax = now + 30*1000;
						if(selections[i].radius>maxRadius) maxRadius=selections[i].radius
					}
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
				var c=0; maxRadius=4*maxRadius * 1.42;
				for (var i=left;i<=rigt;i++)
					for (var j=left;j<=rigt;j++) {
						if(c>=size) break;
						if(selections[c].aiComponent){
							var px=centerX+maxRadius*i,  py=centerY+maxRadius*j;
							selections[c].aiComponent.findPath(vec1.set(px,0,py),0);
						}
						c++;
					}
			}
	         return;
	    }else if(event.button == 0){
	        'left';
	    }
		if(camera.isDraged && camera.isDraged())
			return 1;
		if(!skillTargetMode && isDraged) return ;
		var intersects=raycaster.intersectBoxs( SceneManager.boundingBoxes );
		var skillTarget;
		if(skillTargetMode) {
			skillTargetMode = false;
			document.body.style.cursor='pointer';
			if(intersects.length > 0 ) {
				skillTarget = intersects[0].object.model.entity;
				player.entity.aiComponent.setSkillTarget(skillTarget);
			}
			return;
		}
		if(intersects.length > 0 ) {
			for (var j=0; j<selections.length;j++) {
				selections[j].model.selectionCircle.visible=false;
			}
			selections.length=0;
			selection = intersects[0].object;
			selection.model.selectionCircle.visible=true;
			selections.push(selection.model.entity)
		}
	}
})(window);


