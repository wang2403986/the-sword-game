(function(){
	new MiniMap();
	var v0 =new THREE.Vector2( 0,  40);//3,47,7
	var left = 0, right= worldSize.x - 40;
	function MiniMap(){
		var c=document.getElementById("mini_map");
		var size = 256;var cellSize=8;
		var self = this;
		window.moveCamera = function(moveX, moveY){
			moveX += v0.x;
			moveY += v0.y;
			moveX = moveX-camera.position.x ;
			moveY= moveY-camera.position.z ;
			camera.position.x+=moveX;
			camera.position.z+=moveY;
			controls.target.x+=moveX;
			controls.target.z+=moveY;
			
			light.position.x+=moveX;
			light.position.z+=moveY;
			light.target.position.x+=moveX;
			light.target.position.z+=moveY;
			self.time = -1;
			self.update();
		};
		c.addEventListener( 'mouseup', function ( event ) {
			var moveX=event.offsetX *(worldSize.x/size);
			var moveY=event.offsetY*(worldSize.y/size);
			window.moveCamera(moveX, moveY);
		} );
		c.addEventListener( 'mousemove', function ( e ) {
			e.stopPropagation()
			mouse.moveX= mouse.moveY=0;
		} );
		c.style.width = ''+size+'px';c.style.height = ''+size+'px';
		c.setAttribute('width',size);c.setAttribute('height',size);
		var ctx=c.getContext("2d");
		//ctx.fillStyle="#FF0000";
		ctx.fillRect(0,0,size,size);
		ctx.fillStyle="#FF0000";
		ctx.strokeStyle="#FF0000";ctx.strokeWidth=cellSize;
		
		
		this.update = function(){
			if(this.time===undefined ||now-this.time>1000){
				this.time=now;
				ctx.clearRect(1,1,size-2,size-2);
//				if(!(window.iDebugData&&iDebugData.length)) return;
//				var left=iDebugData[0].x, top=iDebugData[0].z;
//				for(var i=0;i<iDebugData.length;i++){
//					if(iDebugData[i].x<left)left=iDebugData[i].x;
//					if(iDebugData[i].z<top)top=iDebugData[i].z;
//				}
//				left -=2;
//				top -=2;
//				ctx.fillRect((iDebugData[0].x-left)*cellSize-2,(iDebugData[0].z-top)*cellSize-2, 4,4);
//				ctx.beginPath();
//				ctx.moveTo((iDebugData[0].x-left)*cellSize,(iDebugData[0].z-top)*cellSize);
//				for(var i=0;i<iDebugData.length;i++){
//					ctx.lineTo((iDebugData[i].x-left)*cellSize,(iDebugData[i].z-top)*cellSize);
//					//ctx.fillRect((iDebugData[i].x-left)*cellSize,(iDebugData[i].z-top)*cellSize, cellSize,cellSize);
//				}
//				ctx.stroke();
				
				if(!window.g_gameUnits) return;
				for (var j=0; j<g_gameUnits.length;j++) {
					var unit = g_gameUnits[j];
					var r = unit.radius;
					var x=unit.pos.x,y=unit.pos.z;
					x=x-r/2;y=y-r/2;
					r=r<4?4:r;
					ctx.fillRect(x/2,y/2,r,r);
				}
				var ratio = (size/worldSize.x);
				var x=(camera.position.x-v0.x)*ratio,y=(camera.position.z-v0.y)*ratio;
				ctx.beginPath();
				ctx.moveTo(x-10,y-10);
				ctx.lineTo(x+10,y-10);
				ctx.lineTo(x+10,y+10);
				ctx.lineTo(x-10,y+10);
				ctx.closePath();
				ctx.stroke();
			}
		}
		addUpdater(this);
	}

})();