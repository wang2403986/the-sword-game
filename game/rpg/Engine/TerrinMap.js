cMap.g_map_ = NULL;
function getMap()
{
    return cMap.g_map_;
}

/** 线性插值*/
function lerp( a,  b,  t)
{
   return a - (a*t) + (b*t);
}
//////////////////////////////////////////////////////////////////////////
function cMap(source){
	cMap.g_map_ = this;
	var g_map_ = this, m_pTerrin,
    //m_pTData = new TerrinData(),
    m_pSource = source,
    m_usefull = false,
    //m_renderNodes = [], m_mapNodes=[],
    m_pActiveObj = NULL,
    m_pSelectObj = NULL,
    mapTexture, m_pTData, m_vrows = 41, m_vcols= 41;
	//var group = new THREE.Group();
	//scene.add(group); 
	/** 根据地图文件名，加载地图。地图文件包含地图的高度图，行列等信息。*/
	this.loadMap=function( mapName, callback) {
		mapTexture = THREE.ImageUtils.loadTexture('../assets/materials/sand.png');
		var material = new THREE.MeshLambertMaterial({//MeshLambertMaterial
			map: mapTexture, color:0x999999
		});
		
		var geometry = new THREE.PlaneBufferGeometry(worldSize.x, worldSize.y,m_vrows-1, m_vcols-1);
		//geometry.rotateX( - Math.PI / 2 );
        var plane = new THREE.Mesh(geometry, material);
        var offset=0, xZoom = 6, yZoom = 18, noiseStrength = 1.5,simplex = new SimplexNoise();
        xZoom = 58, yZoom = 58, noiseStrength = 9.5
        var vertices = geometry.attributes.position.array;
        m_pTData=new Float32Array((m_vrows)*(m_vcols))
        for ( var i = 0, j = 0, l = vertices.length; j < l; i ++, j += 3 ) {
        	vertices[ j + 2 ]=-vertices[ j + 1 ];
        	var x = vertices[ j ] / xZoom;
        	var y = vertices[ j + 2 ] / yZoom;//2
        	var noise = simplex.noise2D(x, y + offset) * noiseStrength;
        	//noise=0
        	vertices[ j + 1 ] = noise;//1
        	m_pTData[i]=(noise);
		}
        geometry.translate(worldSize.x/2, 0, worldSize.y/2);
        geometry.computeVertexNormals(); //geometry.computeFaceNormals();
//        scene.add(plane);terrin2 = plane;
	    m_usefull = true;
	    return true;
	}

	function getHeight0( r,  c) {
	    var y;
	    if(r >= 0 && c >= 0 && r <m_vrows && c < m_vcols) {
	        y =  (m_pTData[r*m_vcols + c]);
	    } else {
	        y = 0;
	    }
	    return y;
	}
	this.getHeight=function(x, z) {
		if (!m_usefull) return 0;
	    x *= ((m_vrows-1)/worldSize.x);
	    z *= ((m_vcols-1)/worldSize.y);
		
		    //计算x,z坐标所在的行列值
		    var col = (x>>0);//向下取整
		    var row = (z>>0);
		
		    // 获取如下图4个顶点的高度
		    // 
		    //  A   B
		    //  *---*
		    //  | / |
		    //  *---*  
		    //  C   D
		
		    var A = getHeight0(row,   col);
		    var  B = getHeight0(row,   col+1);
		    var C = getHeight0(row+1, col);
		    var  D = getHeight0(row+1, col+1);
		
		    var dx = x - col;
		    var dz = z - row;
		
		    var height = 0.0;
		    if(dz < 1.0 - dx)//(x,z)点在ABC三角形上
		    {
		    	var uy = B - A;
		    	var vy = C - A;
		
		        height = A + lerp(0.0, uy, dx) + lerp(0.0, vy, dz);//线形插值得到高度
		    }
		    else//(x,z)点在BCD三角形上
		    {
		        var uy = C - D;
		        var vy = B - D;
		
		        height = D + lerp(0.0, uy, 1.0 - dx) + lerp(0.0, vy, 1.0 - dz);
		    }
		
		    return height;
	}
	
//	this.setShowLevel=function( level)
//	{
//	    m_showLevel = level;
//	    if (m_showLevel < 0)
//	    {
//	        m_showLevel = 0;
//	    }
//	    else if (m_showLevel > m_nodeR/2)
//	    {
//	        m_showLevel = m_nodeR/2;
//	    }
//	}
	
	 this.xMin=function()
	{
	    return -this.width()/2.0;
	}
	
	this.xMax=function()
	{
	    return this.width()/2.0;
	}
	
	this.zMin=function()
	{
	    return -this.height()/2.0;
	}
	
	this.zMax=function()
	{
	    return this.height()/2.0;
	}
	
	this.width=function()
	{
	    return /*(float)*/m_pTData.width();
	}
	
	this.height=function()
	{
	    return /*(float)*/m_pTData.height();
	}
}
