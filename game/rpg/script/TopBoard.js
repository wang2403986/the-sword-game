(function(){
var up=new THREE.Vector3(0,1,0);
window.TopBoard=TopBoard;
var spriteMap = new THREE.TextureLoader().load( "../assets/materials/TopBoard.png" );
spriteMap.wrapS=THREE.ClampToEdgeWrapping; spriteMap.wrapT=THREE.ClampToEdgeWrapping;
spriteMap.magFilter=spriteMap.minFilter=THREE.NearestFilter;
TopBoardMap=spriteMap;
var spriteMaterial = new THREE.SpriteMaterial( { map:spriteMap, color: 0xffffff } );
function TopBoard(entity, p) {
	var mapOffset=spriteMaterial.map.offset,offsetX=-1;
	function onBeforeRender() {
		mapOffset.x=offsetX;
	};
	this.update =function(hp) {
		offsetX=-.5+ (1-hp);
    };
    this.start =function() {
    	var sprite = new THREE.Sprite( spriteMaterial );
    	sprite.onBeforeRender=onBeforeRender;
    	//sprite.position.copy(entity.pos);
    	sprite.position.y=p.height//280;
    	sprite.scale.copy(p.scale);
    	entity.model.add( sprite );//scene
    }
    this.start();
}
})()