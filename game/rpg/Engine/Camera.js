//D3DCamera.cpp
//#include "Commen.h"
//#include "I3DObject.h"
//#include "Camera.h"

//////////////////////////////////////////////////////////////////////////
function CCamera( pDevice, /*CameraType*/ type/* = THIRD*/)
{
	THREE.PerspectiveCamera.call(this, 180*0.3, 1.0, 1.0, 10000.0);
    var m_pSource = NULL;
	var m_pd3dDevice,m_position,m_fDistToPlayer,m_cameraType;
	m_position = this.position;
	this.initCamera=function( pDevice,  type/* = THIRD*/)
	{
	    m_pd3dDevice = pDevice;
	    this.setCamareType(type);
	     m_position.set( 0.0, 20.0, -200.0 );
	    this.m_fDistToPlayer = 100.0;
	    this.setDistRange(10.0, 300.0);
	    this.setNearFar(1.0, 10000.0);
	}
	
	this.setNearFar=function( fNear, fFar)
	{
	    m_fNear = fNear;
	    m_fFar = fFar;
	    this.near = m_fNear;
		this.far=m_fFar;
		this.setup3DCamera();
	}
	this.getCameraType=function(){return m_cameraType;}
	this.setCamareType=function( cameraType)
	{
		m_cameraType = cameraType;
	    if (m_pSource) {
	        if (m_cameraType == CCamera.FIRST ) {
	            //m_pSource.show(false);
	        } else {
	           // m_pSource.show(true);
	        }
	    }
	}
	
	this.setDistRange=function( mind,  maxd) {
	    m_distMin = mind;
	    m_distMax = maxd;
	    this.correctDist();
	}
	
	this.setDistance=function( fDistance) {
	    this.m_fDistToPlayer = fDistance;
	    this.correctDist();
	}
	
	/** ½ÃÕý¾àÀëÍæ¼ÒµÄ¾àÀë¡£*/
	this.correctDist=function() {
	    if (this.m_fDistToPlayer<m_distMin) {
	        this.m_fDistToPlayer = m_distMin;
	    } else if (this.m_fDistToPlayer > m_distMax) {
	        this.m_fDistToPlayer = m_distMax;
	    }
	}
	var tempViewPort = { width: 1, height: 1 };
	this.setup3DCamera=function() {
		if(window.getViewport) getViewport(tempViewPort);
	//	D3DXMatrixPerspectiveFovLH(projectionMatrix,D3DX_PI*0.3f,(Width)/(Height),m_fNear, m_fFar);
		this.near = m_fNear;
		this.far=m_fFar;
		this.aspect =tempViewPort.width/tempViewPort.height;
		this.updateProjectionMatrix();
	}
	
	this.initCamera(pDevice, type);
}

CCamera.prototype = Object.create( THREE.PerspectiveCamera.prototype );
CCamera.prototype.constructor= CCamera;
CCamera.FIRST=0;CCamera.THIRD=1;CCamera.FREE=2;
//void CCamera::setup2DCamera(void)
//{
//	/*D3DXMATRIX*/var temp;
//	D3DXMatrixIdentity(temp);
//	m_pd3dDevice.SetTransform(D3DTS_VIEW, temp);
//	D3DXMATRIX projectionMatrix;
//	D3DVIEWPORT9 tempViewPort;
//	m_pd3dDevice.getViewport(tempViewPort);
//	D3DXMatrixOrthoLH(
//        projectionMatrix, 
//		float(tempViewPort.Width),
//		float(tempViewPort.Height), 
//		m_fNear, 
//		m_fFar);
//	m_pd3dDevice.SetTransform(D3DTS_PROJECTION,projectionMatrix);
//}