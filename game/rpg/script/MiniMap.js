(function(){
	new MiniMap();
	function MiniMap(){
		var c=document.getElementById("mini_map");
		var size = 256;var cellSize=8;
		c.style.width = ''+size+'px';c.style.height = ''+size+'px';
		c.setAttribute('width',size);c.setAttribute('height',size);
		var ctx=c.getContext("2d");
		//ctx.fillStyle="#FF0000";
		ctx.fillRect(0,0,size,size);
		ctx.fillStyle="#FF0000";
		ctx.strokeStyle="#FF0000";ctx.strokeWidth=cellSize;
//		[3, 8, 0, 5, 0, 0, 3, 0]
//		[279, 253, 276, 250, 276, 245, 279, 245]
//		[279.5, 253.5, 276.5, 250.5, 277.5, 245.5, 279.5, 245.5];
//		collision{x: 279.3, y: 0, z: 248.6} r:1.5;
//		pathCurrent:6;
//		moveToPosition : Vector3 {x: 277.5, y: 0, z: 245.5};1.5,0.5;
//		oldPosition Vector3 {x: 276.5, y: 0, z: 250.25};0.5,5.25;//276,245
//		stepByX false
//		stepSpeed 0.9785497849867489
//		steps 4.75;
//		xIncrement 0.21052631578947367
//		yIncrement -1;
//		k 2.6235164227602525;
		
		
		
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
				var x=camera.position.x/2-20,y=camera.position.z/2-20;
				ctx.beginPath();
				ctx.moveTo(x,y);
				ctx.lineTo(x+20,y); ctx.lineTo(x+20,y+20);
				ctx.lineTo(x,y+20); ctx.lineTo(x,y);
				ctx.stroke();
			}
		}
		addUpdater(this);
	}

})();