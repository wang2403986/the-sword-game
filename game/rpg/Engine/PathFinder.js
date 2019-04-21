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
	};
	var scaleFactor = 1, invScaleFactor = 1;
	function PathFinder(options) {
		var tasks = [];
		this.findPath = function(unit, target) {
			tasks.push(unit);
		};
		/**
	     * 检测两个矩形是否碰撞
	     */
		function isCollisionWithRect( x1,  y1,  w1,  h1, x2, y2,  w2,  h2) {
			if (x1 >= x2 && x1 >= x2 + w2) {
	            return false;
	        } else if (x1 <= x2 && x1 + w1 <= x2) {
	            return false;
	        } else if (y1 >= y2 && y1 >= y2 + h2) {
	            return false;
	        } else if (y1 <= y2 && y1 + h1 <= y2) {
	            return false;
	        }
	        return true;
	    }
		this.getCollisionObject = function(unit0, preferMovingUnit) {
			var scale=scaleFactor;
			unit0.nextPos=unit0.aiComponent.nextPos;
			var x0= (unit0.pos.x*scale)>>0;
			var y0= (unit0.pos.z*scale)>>0;
			var x1= (unit0.nextPos.x*scale)>>0;
			var y1= (unit0.nextPos.z*scale)>>0;
			var r0=unit0.radius, collision, result;
			x1 = x1- (r0>>0), y1 = y1-(r0>>0);
			var aiComponent,g_gameUnits=window.g_gameUnits;
			for (var j=0; j<g_gameUnits.length;j++) {
				var unit = g_gameUnits[j];
				if(unit === unit0) continue;
				var radius=unit.radius;
				var centerX=(unit.pos.x)>>0, centerY=(unit.pos.z)>>0,
				  startX = centerX- (radius>>0), startY = centerY-(radius>>0);
				collision =isCollisionWithRect(x1,  y1,  2*r0, 2*r0,  startX, startY, 2*radius,  2*radius);
				if (collision) {
					result = unit; aiComponent=unit.aiComponent;
					if(!preferMovingUnit || (aiComponent&&aiComponent.autoMove && !aiComponent.isWaiting))
						return unit;
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
			for (var j=0; j<g_gameUnits.length;j++) {
				var obstacleUnit = g_gameUnits[j];
				var component=obstacleUnit.aiComponent;
				if (obstacleUnit === unit0 ||
					(!avoidance&&component&&component.autoMove&&!component.isWaiting)) continue;
				objects[i]=obstacleUnit.pos.x;
				objects[i+1]=obstacleUnit.pos.z;
				objects[i+2]= obstacleUnit.radius;
				i+=3; unitsNumber++;
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
			if (aiComponent.findPathType === 2) {// auto find attack target
				var arr=aiComponent.source.attackTargets, tmpPos=aiComponent.source.pos;
				array2.length=0;
				for(var i=0;i<arr.length;i++){
					if(!arr[i].isDead){
						var acquisitionRange=unit0.acquisitionRange +arr[i].range;
						var distance=distanceToSquared(tmpPos, arr[i].pos);
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
			    	if(aiComponent.findPathDiscarded) return;
			    	aiComponent.attackTarget = arr[f32Array[0]];
			    	aiComponent.findPathPosition.copy(arr[f32Array[0]].pos);
			    	aiComponent.isLockTarget=false;
			    	
			    	var chaseRange= aiComponent.source.acquisitionRange*(2*Math.random()+1.7);
			    	aiComponent.source.chaseRange = chaseRange;
			    	
			    	aiComponent.attackStartPos.copy(aiComponent.source.pos);
			    	buildPath(pathSize, i32, unit0)
					aiComponent.isFullPath=true;
					if(aiComponent.path.length>2){
						smoothPath(aiComponent);
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
			    	if(aiComponent.findPathDiscarded) return;
			    	buildPath(pathSize, i32, unit0)
//				    console.log(aiComponent.path)
				    var distance = unit0.radius*2;
				    var left = startX-MAP_SIZE/2, top=startY-MAP_SIZE/2;
					if(left<0)left=0; if(top<0)top=0;
					var toX = endX-left, toY =endY-top;
					aiComponent.isFullPath=!(toX<0||toY<0||toX>=MAP_SIZE||toY>=MAP_SIZE);
				    //aiComponent.isFullPath = Math.abs(endX-i32[pathSize-1])<=distance &&Math.abs(endY-i32[pathSize])<=distance;
					if(!window.iDebugData)window.iDebugData=[];
					iDebugData.length=0;
					iDebugData.push(unit0.pos.clone());
					smoothPath(aiComponent);
				    aiComponent.moveForward( aiComponent.findPathType,1);
			    }
			}
			
		}
		addUpdater(this);

		function selectSort(arr){
		    var len=arr.length;
		    var minIndex,temp,		count=Math.min(len-1, 16);
		    for(i=0;i<count;i++){//for(i=0;i<len-1;i++){
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
		function smoothPath(aiComponent){
//			if(!aiComponent.arr2)aiComponent.arr2=[];
//			aiComponent.arr2.length=0;
//			var arr2=aiComponent.arr2;
//			var path = aiComponent.path;
//			var length = path.length;
//			var i=0, j=0;
//			arr2.push(path[0]); arr2.push(path[1]);
//			for (j=2; j<length;j+=2){
//				if(arr2[arr2.length-2]===path[j]&&arr2[arr2.length-1]===path[j+1]) continue;
//				arr2.push(path[j]); arr2.push(path[j+1]);
//				i=j-2;
//				var moveX, moveY, nextX, nextY;
//				moveX=undefined;
//				if(j+3< length&& 1){
//					if((path[i]>>0)===(path[i+2]>>0) &&path[j+1]===path[j+3]){
//						if(path[i+3]-path[i+1]>=1){
//						    moveY = (path[j+1]>>0) -0.4375;
//						    moveX = path[j];
//						    nextY = path[j+1];
//						    nextX =(path[j]<path[j+2])? path[j]+1  :   path[j]-1;
//						    arr2[arr2.length-2]=moveX;
//						    arr2[arr2.length-1]=moveY;
//						    arr2.push(nextX);
//						    arr2.push(nextY);
//						}else if(path[i+1]-path[i+3]>=1){
//							moveY = (path[j+1]>>0)+1 +0.4375;
//							moveX = path[j];
//							nextY = path[j+1];
//							nextX =(path[j]<path[j+2])? path[j]+1  :   path[j]-1;
//							arr2[arr2.length-2]=moveX;
//						    arr2[arr2.length-1]=moveY;
//						    arr2.push(nextX);
//						    arr2.push(nextY);
//			            }
//					}else if(path[i+1]>>0===path[i+3]>>0 &&path[j]===path[j+2]){
//						if(path[i+2]-path[i]>=1){
//							moveX = (path[j]>>0) -0.4375;
//							moveY = path[j+1];
//							nextX = path[j];
//							nextY =(path[j+1]<path[j+3])? (path[j+1]+1)  :   (path[j+1]-1);
//							arr2[arr2.length-2]=moveX;
//						    arr2[arr2.length-1]=moveY;
//						    arr2.push(nextX);
//						    arr2.push(nextY);
//						}else if(path[i]-path[i+2]>=1){
//				            moveX = (path[j]>>0)+1 +0.4375;
//				            moveY = path[j+1];
//				            nextX = path[j];
//				            nextY =(path[j+1]<path[j+3])? path[j+1]+1  :   path[j+1]-1;
//				            arr2[arr2.length-2]=moveX;
//						    arr2[arr2.length-1]=moveY;
//						    arr2.push(nextX);
//						    arr2.push(nextY);
//				        }
//					}
//				}
//			}
//			aiComponent.path=arr2; aiComponent.arr2=path;
		}
	}
})()