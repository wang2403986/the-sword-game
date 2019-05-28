(function () {
	var memory,i32, objects,f32Array, app, MAP_SIZE;
//	fetch('main.wasm').then(function (response){
//	  return response.arrayBuffer() }
//	).then(function (bytes){ return WebAssembly.instantiate(bytes) }).then(function (results) {
//		app = results.instance.exports;
//		memory = app.memory;
//		i32 = new Uint16Array(memory.buffer, app.getPath());
//		objects = new Float32Array(memory.buffer, app.getObjects());
//		f32Array = new Float32Array(memory.buffer, app.getArray());
//		console.log(MAP_SIZE =app.main());
//	}).catch(console.error);
	window.iPathFinder = new PathFinder();
	iPathFinder.start = function(instance){
		app = instance.exports;
		memory = app.memory;
		i32 = new Uint16Array(memory.buffer, app.getPath());
		objects = new Float32Array(memory.buffer, app.getObjects());
		f32Array = new Float32Array(memory.buffer, app.getArray());
		console.log(MAP_SIZE =app.main());
		SceneManager.addUpdater(this);
	};
	var scaleFactor = 1, invScaleFactor = 1;
	function PathFinder(options) {
		var tasks = [];
		this.findPath = function(unit, type) {
			tasks.push(unit);
			if(type===0 && tasks.length>20){
				tasks.length = tasks.length -1;
				tasks.splice(8, 0, unit);
			}
		};
		/**
	     * 检测两个矩形是否碰撞
	     */
		function isCollisionWithRect( x1,  y1,  w1, x2, y2,  w2) {
			if (x1 >= x2 && x1 >= x2 + w2) {
	            return false;
	        } else if (x1 <= x2 && x1 + w1 <= x2) {
	            return false;
	        } else if (y1 >= y2 && y1 >= y2 + w2) {
	            return false;
	        } else if (y1 <= y2 && y1 + w1 <= y2) {
	            return false;
	        }
	        return true;
	    }
//		function isCollisionWithRect2( x1,  y1,  w1,  h1, x2, y2,  w2,  h2) {
//			if (x1 >= x2 && x1 >= x2 + w2) {
//	            return false;
//	        } else if (x1 <= x2 && x1 + w1 <= x2) {
//	            return false;
//	        } else if (y1 >= y2 && y1 >= y2 + h2) {
//	            return false;
//	        } else if (y1 <= y2 && y1 + h1 <= y2) {
//	            return false;
//	        }
//	        return true;
//	    }
		this.getCollisionObject = function(unit, preferMovingUnit) {
			unit.nextPos = unit.aiComponent.nextPos;
			var nextPos=unit.nextPos;
			var x1= (nextPos.x)>>0;
			var y1= (nextPos.z)>>0;
			var r1=unit.radius;
			x1 = x1- (r1>>0), y1 = y1-(r1>>0);
			var w1=2*r1;
			var units=SceneManager.units;
			var aiComponent, collision, result, pos;
			var length = units.length;
			for (var j=0; j<length;j++) {
				var b = units[j];
				if(b === unit) continue;
				var radius=b.radius;
				pos=b.pos;
				var centerX=(pos.x)>>0, centerY=(pos.z)>>0,
				  startX = centerX- (radius>>0), startY = centerY-(radius>>0);
				var w2=2*radius;
				collision =isCollisionWithRect(x1,  y1,  w1,  startX, startY, w2);
				if (collision) {
					result = b;
					aiComponent=b.aiComponent;
					if(!preferMovingUnit || (aiComponent&&aiComponent.autoMove && !aiComponent.isWaiting)){
						if (preferMovingUnit){
//							b.oppositeDirection= true;
						}
						return b;
					}
				}
			}
			return result;
		}
		var m_startX,m_startY, array2=[];
		this.update=function() {
			if(memory===undefined || !tasks.length) return;
			var unit0 =tasks.shift();
			var scale = scaleFactor;
			var i=0, unitsNumber=0;
			var aiComponent = unit0.aiComponent;
			var avoidance=aiComponent.attackTarget||aiComponent.skillTarget||aiComponent.findPathType === 2;
			avoidance=avoidance || aiComponent.needsFindPath;
			var units = SceneManager.units
			for (var j=0; j<units.length;j++) {
				var obstacleUnit = units[j];
				var component=obstacleUnit.aiComponent;
				if (obstacleUnit === unit0 ||
					(!avoidance&&component&&component.autoMove&&!component.isWaiting)) continue;
				objects[i]=obstacleUnit.pos.x;
				objects[i+1]=obstacleUnit.pos.z;
				objects[i+2]= obstacleUnit.radius;
				i+=3;
				unitsNumber++;
			}
			var target = aiComponent.findPathPosition;
			if(aiComponent.findPathType === 1) target=aiComponent.destPosition;
			
			m_startX=unit0.pos.x*scale, m_startY=unit0.pos.z*scale;
			var  endX = target.x >> 0, endY = target.z >> 0;
			var startX = m_startX>> 0, startY = m_startY>> 0;
			if (aiComponent.path===undefined) aiComponent.path=[];
			aiComponent.currentPathIndex = 2//2;
			aiComponent.path.length=0;
			aiComponent.findPathInProgress=false;
			aiComponent.needsFindPath=false;
			aiComponent.findPathState=1;
			aiComponent.collisionCount=0;
			
			if(aiComponent.findPathDiscarded) return;
			var distanceSqInt = Utils.distanceSqInt;
			if (aiComponent.findPathType === 2) {// auto find attack target
				var arr=aiComponent.entity.attackTargets, tmpPos=aiComponent.entity.pos;
				array2.length=0;
				for(var i=0;i<arr.length;i++){
					if(!arr[i].isDead){
						var acquisitionRange=unit0.acquisitionRange +arr[i].range;
						var distance=distanceSqInt(tmpPos, arr[i].pos);
						if(distance<acquisitionRange*acquisitionRange){
							array2.push(arr[i]);
							arr[array2.length-1]=arr[i];
						}
					}
				}
				arr.length = array2.length;
				arr = array2;
				for(var i=0;i< arr.length;i++){
					arr[i]._cmp=arr[i].pos.distanceToSquared(tmpPos);
				}
				selectSort(arr);
				for(var i=0;i< 16&&i<arr.length;i++){
					f32Array[i*3]=arr[i].pos.x; f32Array[i*3+1]=arr[i].pos.z;
					f32Array[i*3+2]=arr[i].radius;
				}
				var pathSize = app.findPathAttack(unitsNumber, unit0.radius, m_startX, m_startY, arr.length,unit0.attackRange);
				if (pathSize >= 0) {
			    	aiComponent.attackTarget = arr[f32Array[0]];
			    	aiComponent.findPathPosition.copy(arr[f32Array[0]].pos);
			    	aiComponent.isLockTarget=false;
			    	
			    	var chaseRange= aiComponent.entity.acquisitionRange*(2*Math.random()+1.7);
			    	aiComponent.entity.chaseRange = chaseRange;
			    	
			    	aiComponent.attackStartPos.copy(aiComponent.entity.pos);
			    	buildPath(pathSize, i32, unit0)
					aiComponent.isFullPath=true;
					if(aiComponent.path.length>2){
						aiComponent.moveForward( aiComponent.findPathType,1);
					}
			    }
			} else {
				var pathSize = app.findPath(unitsNumber, unit0.radius, m_startX, m_startY,endX, endY);
				if (pathSize=== -1) {
					unit0.pos.x=i32[0]+.5; unit0.pos.z=i32[1]+.5;
					console.error('pathSize=== -1');
					aiComponent.autoFindPathTime = now + 1000;
				} else if (pathSize<=1) {
					aiComponent.finishAutoMove(true)
					aiComponent.autoFindPathTime = now + 1500;
				} else if (pathSize > 2) {
			    	aiComponent.autoFindPathTime = now + 10000;
			    	buildPath(pathSize, i32, unit0)
//				    console.log(aiComponent.path)
				    var distance = unit0.radius*2;
				    var left = startX-MAP_SIZE/2, top=startY-MAP_SIZE/2;
					if(left<0)left=0; if(top<0)top=0;
					var toX = endX-left, toY =endY-top;
					aiComponent.isFullPath=!(toX<0||toY<0||toX>=MAP_SIZE||toY>=MAP_SIZE);
				    //aiComponent.isFullPath = Math.abs(endX-i32[pathSize-1])<=distance &&Math.abs(endY-i32[pathSize])<=distance;
//					if(!window.iDebugData)window.iDebugData=[];
//					iDebugData.length=0;
//					iDebugData.push(unit0.pos.clone());
				    aiComponent.moveForward( aiComponent.findPathType,1);
			    }
			}
			
		}

		function selectSort(arr){
		    var len=arr.length;
		    var minIndex,temp,		count=Math.min(len-1, 16);
		    for(i=0;i<count;i++){
		        minIndex=i;
		        for(j=i+1;j<len;j++){
		            if(arr[j]._cmp<arr[minIndex]._cmp){
		                minIndex=j;
		            }
		        }
			    temp=arr[i];
			    arr[i]=arr[minIndex];
			    arr[minIndex]=temp;
		    }
		    return arr;
		}
		function buildPath(pathSize, i32, unit0){
			var aiComponent=unit0.aiComponent;
			var path = aiComponent.path;
			var length= path.length;
			path.push(unit0.pos.x );
			path.push(unit0.pos.z );
			for(var i=2;i<pathSize;i++) {
		    	path.push((i32[i]+.5) );
		    }
		}
	}
})()