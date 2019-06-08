Define = { PS_FREE:'free', PS_MOVE:'walk', PS_ATTACK:'attack', PS_DIE:'die', PS_SKILL:'skill'};


var Utils = {};
(function(){
	Utils.distanceSqInt=distanceSqInt;
	Utils.distanceSq=distanceSq;
	function distanceSqInt(pos, pos2){
		var dx=(pos.x>>0)-(pos2.x>>0),dy=(pos.z>>0)-(pos2.z>>0);
		return dx*dx+dy*dy;
	}
	function distanceSq(pos, pos2){
		var dx=pos.x-pos2.x,dy=pos.z-pos2.z;
		return dx*dx+dy*dy;
	}
	Array.prototype.remove = function (val) {
		var index = this.indexOf(val);
		if (index > -1) {
			this.splice(index, 1);
		}
	};
	if (!Array.prototype.find) {
		Array.prototype.find= function(predicate) {
		  var o = this;
		  var len = o.length >>> 0;
		  var thisArg = arguments[1];
		  var k = 0;
		  while (k < len) {
		    var kValue = o[k];
		    if (predicate.call(thisArg, kValue, k, o)) {
		      return kValue;
		    }
		    k++;
		  }
		  return undefined;
		}
	};
	
	var inverseMatrix = new THREE.Matrix4(), ray = new THREE.Ray(), sphere = new THREE.Sphere(), intersects=[];
	var projectVector = new THREE.Vector3();
	function ascSort( a, b ) {
		return a.distance - b.distance;
	}
	THREE.Raycaster.prototype.intersectBoxs =function (objects) {
		intersects.length=0;
		for (var i=0;i<objects.length;i++){
			var object=objects[i];
			var _this = object, raycaster=this;
			var geometry = _this.geometry, matrixWorld = _this.matrixWorld;
			// Checking boundingSphere distance to ray
			if ( geometry.boundingSphere === null ) geometry.computeBoundingSphere();
			sphere.copy( geometry.boundingSphere );
			sphere.applyMatrix4( matrixWorld );
			if ( raycaster.ray.intersectsSphere( sphere ) === false ) continue;
			// Check boundingBox before continuing
			if (geometry.boundingBox == null)geometry.computeBoundingBox();
			inverseMatrix.getInverse( matrixWorld );
			ray.copy( raycaster.ray ).applyMatrix4( inverseMatrix );
			if ( ray.intersectsBox( geometry.boundingBox ) === false ) continue;

			projectVector.copy(object.model.position).project(camera)
			object.distance=projectVector.z;
			object.object=object;
			intersects.push(object);
		}
		intersects.sort( ascSort );
		return intersects;
	}
})();


var SceneManager ={};
SceneManager.teams=[];
SceneManager.units=[];
SceneManager.boundingBoxes=[];
(function(){
	var updateTaskList = [];
	var teams=SceneManager.teams;
	var units=SceneManager.units;
	SceneManager.update =function (fElapse){
		for ( var i = 0; i < mixers.length; i ++ )
			mixers[ i ].update( fElapse );
		for(var i=0;i<updateTaskList.length;i++) {
			updateTaskList[i].update(fElapse);
		}
		
		var selectionCircles=SceneManager.selectionCircles;
		if(selectionCircles){
			selectionCircles.children.length=0;
			terrin.renderOrder = -2;
			var units = SceneManager.units;
			for (var i=0; i<units.length;i++) {
				var unit = units[i];
				var model=unit.model;
				var circle=model.selectionCircle;
				if(model.glory){
					selectionCircles.add(model.glory);
					model.glory.position.set(unit.pos.x,unit.pos.y+.6,unit.pos.z);
				}
				if(circle&&circle.visible){
					selectionCircles.add(circle);
					circle.renderOrder = -1;
					circle.position.set(unit.pos.x,unit.pos.y,unit.pos.z);
				}
			}
		}
	}
	SceneManager.add = function(e){
		scene.add(e);
	};
	SceneManager.remove = function(e){
		scene.remove(e);
		mixers.remove(e.mixer);
		SceneManager.boundingBoxes.remove(e.bbox);
	};
	SceneManager.addUpdater=addUpdater;
	SceneManager.removeUpdater=removeUpdater;
	SceneManager.addUnitToTeam=addUnitToTeam;
	SceneManager.removeUnitFromTeam=removeUnitFromTeam;
	function addUpdater(e)
	{
		updateTaskList.push(e);
	}
	function removeUpdater(e) {  updateTaskList.remove(e);  }
	/**
	 * 添加单位到玩家所在队伍
	 * @param unit 单位
	 * @param teamId 所在队伍
	 * @param playerId 所属玩家Id
	 */
	function addUnitToTeam(unit, teamId, playerId) {
		var team=teams.find(function(e){return  e.length&& e[0].teamId==teamId});
		var player;
		if(team) player = team.find(function(e){return  e.length&& e[0].playerId==playerId});
		if(!team) {
			team=[];
			team.teamId=teamId;
			teams.push(team);
		}
		if(!player){
			player=[];
			player.teamId=teamId;
			player.playerId= playerId;
			team.push(player);
		}
		unit.teamId= teamId, unit.playerId= playerId;
		player.push(unit);
		units.push(unit);
	}
	function removeUnitFromTeam(unit, teamId, playerId) {
		if(teamId===undefined) {
			teamId=unit.teamId;
			playerId=unit.playerId;
		}
		var team=teams.find(function(e){return  e.length&& e[0].teamId===teamId});
		var player;
		if(team) player = team.find(function(e){ return  e.length&& e[0].playerId===playerId });
		if(player)  player.remove(unit);
		unit.teamId= unit.playerId= undefined;
		units.remove(unit);
	}
})();
var ResourceManager ={};
(function() {
	var audioLoader = new THREE.AudioLoader();
	var audioListener = new THREE.AudioListener();
	var audiosData={};
	ResourceManager.audioListener=audioListener;
	ResourceManager.loadAudio=function(url, callback){
		if(!audiosData[url]){
			var data =audiosData[url]={listeners:[callback]};
			audioLoader.load( url, function ( buffer ) {
				data.buffer=buffer;
				for(var i=0;i<data.listeners.length;i++)
					data.listeners[i](buffer);
			} );
		} else {
			if(audiosData[url].buffer) callback(audiosData[url].buffer);
			else audiosData[url].listeners.push(callback);
		}
	}

	function initAnimationMixer(object) {
		if(object.animations && object.animations.length){
			var mixer=object.mixer = new THREE.AnimationMixer( object );
			var actions =object.actions = {};
			object.animations.forEach(function (clip){
				var action = mixer.clipAction( clip );
				action.weight = 0;
				actions[clip.name] = action;
			})
		}
	}

	var points = [], length = 40, circle = 2.2;
	for (var i = 0; i <= length; i++) {
	 points.push(new THREE.Vector3(-circle * Math.cos(Math.PI * 2 * i / length), 0, circle * Math.sin(Math.PI * 2 * i / length) ) );
	}
	var selectionGeometry = new THREE.BufferGeometry().setFromPoints( points );delete points;
	var selectionMaterial = new THREE.LineBasicMaterial({ color: 0xff0000,linewidth: 2, depthTest: false,depthWrite:false });

	ResourceManager.cloneFbx =function(fbx) {
	    var clone = fbx.clone(true);
	    clone.animations = fbx.animations;
	    var skinnedMeshes = {};

	    fbx.traverse(function (node) {
	        if (node.isSkinnedMesh) {
	            skinnedMeshes[node.name] = node;
	        }
	    });
	    var cloneBones = {};
	    var cloneSkinnedMeshes = {};

	    clone.traverse(function (node) {
	        if (node.isBone) {
	            cloneBones[node.name] = node;
	        }
	        if (node.isSkinnedMesh) {
	            cloneSkinnedMeshes[node.name] = node;
	        }
	    });

	    for (var name in skinnedMeshes) {
	        var _clone$skeleton$bones;

	        var skinnedMesh = skinnedMeshes[name];
	        var skeleton = skinnedMesh.skeleton;
	        var cloneSkinnedMesh = cloneSkinnedMeshes[name];

	        var orderedCloneBones = [];
	        for (var i = 0; i < skeleton.bones.length; i++) {
	            var cloneBone = cloneBones[skeleton.bones[i].name];
	            orderedCloneBones.push(cloneBone);
	        }
	        cloneSkinnedMesh.bind(new THREE.Skeleton(orderedCloneBones));
	    }
	    clone.playAction = fbx.playAction;
	    if(fbx.selectionCircle){
	    	clone.selectionCircle = new THREE.Line(selectionGeometry, selectionMaterial);
	    	clone.selectionCircle.visible=false;
	    	clone.selectionCircle.model = clone;
	    	clone.selectionCircle.scale.copy(fbx.selectionCircle.scale);
	    	clone.selectionCircle.onBeforeRender = fbx.selectionCircle.onBeforeRender;
	    }
	    if(fbx.boundingBoxGeometry) clone.boundingBoxGeometry=fbx.boundingBoxGeometry;
	    if(fbx.animations){
	    	initAnimationMixer(clone);
	    }
	    clone.properties=fbx.properties;
	    return clone;
	};

	function initMeshAnimation(object, speed) {
		object.animations.forEach(function (clip) {
			var tracks=clip.tracks, start, times;
			if(tracks) for(var i00=0;i00<tracks.length;i00++) {
				start= tracks[i00].times[0], times=tracks[i00].times;
	    		for(var j00=0;j00<times.length;j00++) {
	    			if(start>.1) times[j00]-= start;
	    			if(speed) times[j00]/= speed;
	        	}
	    	}
	    	clip.resetDuration();
	    });
	}
	function playAction(name, loop, clampWhenFinished, restart) {
		var action=this.actions[name];
		if(!action)return;
		var _actions= this.mixer._actions, i=0, length = this.mixer._nActiveActions, e;
		for (; i < length; i++){
			e = _actions[i];
			e.weight=0;
		}
		this.mixer.stopAllAction();
		if(loop!== undefined) {
			action.setLoop(loop?THREE.LoopRepeat: THREE.LoopOnce);
			action.clampWhenFinished = !loop;
		}
		if(clampWhenFinished) action.clampWhenFinished = clampWhenFinished;
		action.play();
		action.weight=1;
		this.currentAction = action;
	}
	var loader = new THREE.FBXLoader(), loadedModels={};
	var onLoadlisteners=[];
	var pendings = 0;
	function fireOnLoadEvent(){
		if(pendings===0){
			onLoadlisteners.forEach(function(e){ e(); })
			onLoadlisteners.length=0;
		}
	}
	ResourceManager.onLoad = function(e) {
		onLoadlisteners.push(e);
		if(pendings===0) fireOnLoadEvent();
	}
	ResourceManager.getModel = function(name) {
		var model =loadedModels[name];
		if(model){
			if(model.busy) return ResourceManager.cloneFbx(model);
			model.busy = true;
		}
		return model;
	}
	ResourceManager.loadModel = function(model, callback) {
		var anims=model.animationsFiles;
		var keys=Object.keys(anims);
		var key_index=0;
		if (loadedModels[model.name]) {
			var object=ResourceManager.cloneFbx(loadedModels[model.name]);
			initModel(object)
			callback&&callback(object);
			return object;
		}
		pendings++;
		if (keys.length<1) loader.load( model.url, onLoaded);
		else loadAnim();
		function loadAnim() {
			loader.load( anims[keys[key_index]],  function(e){
				anims[keys[key_index]] = e;
				if(key_index >= keys.length-1) {
					loader.load( model.url, onLoaded);
				} else{
					key_index++;
					loadAnim();
				}
			});
		}
		function onLoaded( object ) {
			if(model.name) loadedModels[model.name] = object;
			if(object.animations&& object.animations.length){
				initMeshAnimation(object);
				object.animations[0].name = model.animation;
				for(var i=0;i<keys.length;i++) {
					var subModel = anims[keys[i]];
					initMeshAnimation(subModel);
					subModel.animations[0].name = keys[i];
					object.animations.push(subModel.animations[0]);
				}
			}
			object.playAction = playAction;
			object.meshs=[];
			var helperObject=[];
			object.traverse( function ( child ) {
				if ( child.isMesh ) {
					child.castShadow = true; //child.receiveShadow = true;
					Object.assign(child.material, model.material)
					object.meshs.push(child);
				}  if ( child.isLight||child.isCamera) helperObject.push(child);
			} );
			for(var i=0;i<helperObject.length;i++)
				object.remove(helperObject[i]);
			if(model.boundingBox){
				var bboxGeometry = new THREE.BoxBufferGeometry(model.boundingBox.x, model.boundingBox.y, model.boundingBox.z);
				object.boundingBoxGeometry=bboxGeometry;
				var arr= bboxGeometry.attributes.position.array;
				for(var e=1;e<arr.length;e+=3) {
					arr[e]+= model.boundingBox.y/2;
				}
			}
			if(model.selectable){
				object.selectionCircle = new THREE.Line(selectionGeometry, selectionMaterial);
				object.selectionCircle.visible=false;
				object.selectionCircle.model = object;
				object.selectionCircle.onBeforeRender = onBeforeRender;
				var scale = model.selectionScale;
				if(scale) object.selectionCircle.scale.set(scale,scale,scale);
			}
			initModel(object)
			initAnimationMixer( object );
			pendings--;
			object.properties=model;
			if(callback) callback(object);
			fireOnLoadEvent();
		}
		function onBeforeRender(){
			if(this.model.entity )
				if(this.model.entity.teamId===1)
					this.material.color.setRGB( 0,1,0);
				else this.material.color.setRGB( 1,0,0);
		}
		function initModel( object ) {
			if(model.scale) object.scale.set(model.scale,model.scale,model.scale);
			if(model.position) object.position.copy(model.position);
			if(model.rotation) object.rotation.copy(model.rotation);
		}
	}
})();
