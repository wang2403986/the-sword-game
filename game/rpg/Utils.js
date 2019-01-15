var NULL = null, D3DX_PI=Math.PI;
var WM_MOUSEWHEEL = 0, WM_LBUTTONDOWN = 1, WM_RBUTTONDOWN = 2, WM_LBUTTONUP = 3,
	WM_RBUTTONUP = 4, WM_MOUSEMOVE = 5, WM_MOUSELEAVE = 6;
var CM_LDOWN = WM_LBUTTONDOWN, CM_LUP = WM_LBUTTONUP ,CM_RUP = WM_RBUTTONUP,
	CM_RDOWN = WM_RBUTTONDOWN, CM_LEAVE = WM_MOUSELEAVE;
Define = { PS_FREE:'free', PS_MOVE:'walk', PS_ATTACK:'attack', PS_DIE:'die', PS_SKILL:'skill'};

function distanceToSquared(pos, pos2){
	var dx=(pos.x>>0)-(pos2.x>>0),dy=(pos.z>>0)-(pos2.z>>0);
	return dx*dx+dy*dy;
}

var audioLoader = new THREE.AudioLoader();
var audioListener = new THREE.AudioListener();
var audiosData={};
function loadAudio(url, callback){
	if(!audiosData[url]){
		audiosData[url]={};
		var data = audiosData[url];
		data.listeners=[callback];
		audioLoader.load( url, function ( buffer ) {
			data.buffer=buffer;
			for(var i=0;i<data.listeners.length;i++){
				data.listeners[i](buffer);
			}
		} );
	} else {
		if(audiosData[url].buffer) callback(audiosData[url].buffer);
		else audiosData[url].listeners.push(callback);
	}
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

var updateTaskList = []
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
function addTeamUnit(unit, teamId, playerId) {
	if(!window.g_gameTeams) {g_gameTeams=[]; g_gameUnits = []};
	var team=g_gameTeams.find(function(e){return  e.length&& e[0].teamId==teamId});
	var player;
	if(team) player = team.find(function(e){return  e.length&& e[0].playerId==playerId});
	if(!team) {
		team=[]; team.teamId=teamId; g_gameTeams.push(team);
	}
	if(!player){
		player=[];player.teamId=teamId; player.playerId= playerId;
		team.push(player);
	}
	unit.teamId= teamId, unit.playerId= playerId;
	player.push(unit);
	g_gameUnits.push(unit);
}
function removeTeamUnit(unit, teamId, playerId) {
	if(teamId===undefined) teamId=unit.teamId, playerId=unit.playerId;
	var team=g_gameTeams.find(function(e){return  e.length&& e[0].teamId===teamId}), player;
	if(team) player = team.find(function(e){return  e.length&& e[0].playerId===playerId});
	if(player)  player.remove(unit);
	unit.teamId= -1, unit.playerId= -1;
	g_gameUnits.remove(unit);
}

/** 获得Viewport大小。*/
function getViewport(e) {
	 if(e){e.width=innerWidth;e.height=innerHeight;return e;}
	 else return {width: innerWidth, height:innerHeight};
}

//annie = new TextureAnimator( runnerTexture, 10, 1, 10, 75 ); // texture, #horiz, #vert, #total, duration.
function TextureAnimator(texture, tilesHoriz, tilesVert, numTiles, tileDispDuration) 
{	
	// note: texture passed by reference, will be updated by the update function.
		
	this.tilesHorizontal = tilesHoriz;
	this.tilesVertical = tilesVert;
	// how many images does this spritesheet contain?
	//  usually equals tilesHoriz * tilesVert, but not necessarily,
	//  if there at blank tiles at the bottom of the spritesheet. 
	this.numberOfTiles = numTiles;
	texture.wrapS = texture.wrapT = THREE.RepeatWrapping; 
	texture.repeat.set( 1 / this.tilesHorizontal, 1 / this.tilesVertical );

	// how long should each image be displayed?
	this.tileDisplayDuration = tileDispDuration;

	// how long has the current image been displayed?
	this.currentDisplayTime = 0;

	// which image is currently being displayed?
	this.currentTile = 0;
		
	this.update = function( milliSec )
	{
		//milliSec=1000 * milliSec
		this.currentDisplayTime += milliSec;
		while (this.currentDisplayTime > this.tileDisplayDuration)
		{
			this.currentDisplayTime -= this.tileDisplayDuration;
			this.currentTile++;
			if (this.currentTile == this.numberOfTiles)
				this.currentTile = 0;
			var currentColumn = this.currentTile % this.tilesHorizontal;
			texture.offset.x = currentColumn / this.tilesHorizontal;
			var currentRow = Math.floor( this.currentTile / this.tilesHorizontal );
			texture.offset.y = currentRow / this.tilesVertical;
		}
	};
}
function addAnimationMixer(object) {
	var mixer=object.mixer = new THREE.AnimationMixer( object );
	mixers.push( object.mixer );
	var actions =object.actions = {};
	if(object.animations)
		object.animations.forEach(function (clip){
			var action = mixer.clipAction( clip );
			action.weight = 0;
			actions[clip.name] = action;
		})
}
function cloneFbx(fbx) {
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
        //cloneSkinnedMesh.bind(new THREE.Skeleton(orderedCloneBones, skeleton.boneInverses), cloneSkinnedMesh.matrixWorld);

        // For animation to work correctly:
        //clone.skeleton.bones.push(cloneSkinnedMesh);
        //(_clone$skeleton$bones = clone.skeleton.bones).push.apply(_clone$skeleton$bones, orderedCloneBones);
    }
    clone.playAction = fbx.playAction;
    if(fbx.selectionCircleId){
    	clone.selectionCircleId = fbx.selectionCircleId;
    	clone.selectionCircle=clone.children[clone.selectionCircleId];
    }
    if(fbx.boundingBoxGeometry) clone.boundingBoxGeometry=fbx.boundingBoxGeometry;
    return clone;
};
(function() {
	var inverseMatrix = new THREE.Matrix4(), ray = new THREE.Ray(), sphere = new THREE.Sphere(), intersects=[];
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
			if ( geometry.boundingBox !== null ) {
				inverseMatrix.getInverse( matrixWorld );
				ray.copy( raycaster.ray ).applyMatrix4( inverseMatrix );
				if ( ray.intersectsBox( geometry.boundingBox ) === false ) continue;
			}
			object.object=object;
			intersects.push(object);
		}
		return intersects;
	}
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
		//var clip = THREE.AnimationClip.findByName( this.animations, name );
		var action=this.actions[name];
		if(!action)return;
		if(this._preAction ===action) if(!restart)return;
		if(this._preAction) this._preAction.stop();
//		this._preAction = action;
		var _actions= this.mixer._actions, i=0, length = this.mixer._nActiveActions, e;
		for (; i < length; i++){
			e = _actions[i];
			e.stop();
			e.weight=0;
		}
		if(loop!== undefined) {
			action.setLoop(loop?THREE.LoopRepeat: THREE.LoopOnce);
			action.clampWhenFinished = !loop;
		}
		if(clampWhenFinished) action.clampWhenFinished = clampWhenFinished;
		action.play();
		action.weight=1;
		this.mixer.currentAction = action;
	}
	var loader = new THREE.FBXLoader(), loadedModels={};
	var points = [], length = 40, circle = 18;
	for (var i = 0; i <= length; i++) {
	 points.push(new THREE.Vector3(-circle * Math.cos(Math.PI * 2 * i / length), 0, circle * Math.sin(Math.PI * 2 * i / length) ) );
	}
	var selectionGeometry = new THREE.BufferGeometry().setFromPoints( points );delete points;
	var selectionMaterial = new THREE.LineBasicMaterial({ color: 0xff0000,linewidth: 2 });
	window.loadModel = function(model, callback) {
		var anims=model.animationsFiles;
		var keys=Object.keys(anims);
		var key_index=0;
		if (loadedModels[model.name]) {
			var object=cloneFbx(loadedModels[model.name]);
			initializeModel(object)
			callback&&callback(object);
			return object;
		}
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
			object.meshs=[];var helperObject=[];
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
				object.selectionCircle = new THREE.Line(selectionGeometry, selectionMaterial);
				object.selectionCircle.position.set(0,6,0)
				object.selectionCircle.visible=false;
				object.selectionCircleId=object.children.length;
				object.add(object.selectionCircle);
			}
			initializeModel(object)
			if(callback) callback(object);
		}
		function initializeModel( object ) {
			if(model.scale) object.scale.set(model.scale,model.scale,model.scale);
			if(model.position) object.position.set(model.position.x,model.position.y,model.position.z);
			if(model.rotation) object.rotation.set(model.rotation.x,model.rotation.y,model.rotation.z);
			if(model.boundingBox) {
				
			}
			if(model.selectionScale)
				object.selectionCircle.scale.set(model.selectionScale,model.selectionScale,model.selectionScale)
		}
	}
})();
