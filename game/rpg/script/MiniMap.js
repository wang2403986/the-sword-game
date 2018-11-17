(function(){
	new MiniMap();
	function MiniMap(){
		var c=document.getElementById("mini_map");
		var ctx=c.getContext("2d");
		//ctx.fillStyle="#FF0000";
		ctx.fillRect(0,0,256,256);
		ctx.fillStyle="#FF0000";
		ctx.strokeStyle="#FF0000";ctx.strokeWidth=1;
		this.update = function(){
			if(this.time===undefined ||now-this.time>1000){
				this.time=now;
				ctx.clearRect(1,1,254,254);
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