
//#include "Commen.h"
//#include "NewCamera.h"

function NewCamera(){
	CCamera.call(this, null,CCamera.FIRST);
    var m_elapse=(0.0)
    , m_dirty=(true)
    , m_roll=(0.0)
    , m_pitch=(D3DX_PI*0.25)//rot x axis
    , m_yaw=(0.0)
    , m_look=new THREE.Vector3( 0, 0, 1 )
    , m_up=new THREE.Vector3(0.0, 1.0, 0.0)
    , m_right=new THREE.Vector3(1.0, 0.0, 0.0)
    , m_position=this.position
    , m_speed=(100.0),m_matView;
    //D3DXMatrixIdentity(m_matView);
    this.rotateX(m_pitch);
    this.look=m_look; this.right=m_right; this.up=m_up;
	this.update=function( fElapse)
	{
	    m_elapse = fElapse;
	    this.updateViewMatrixRotation();
	    this.updateViewMatrixPosition();
	}
	
	//this.render=function(pDevice)
	//{
	//    updateViewMatrixRotation();
	//    updateViewMatrixPosition();
	//    pDevice.SetTransform(D3DTS_VIEW, m_matView);
	//}
	
	// Rotations
	this.rotYaw=function(amount) // rotate around y axis
	{
	    m_yaw += amount;  this.rotateY(amount);
	    this.updateViewMatrixRotation();
	    
	}
	
	this.rotPitch=function(amount) // rotate around x axis
	{
	    m_pitch += amount; this.rotateX(amount);
	    this.updateViewMatrixRotation();
	}
	
	this.rotRoll=function(amount) // rotate around z axis
	{
	    m_roll += amount;  this.rotateZ(amount);
	    this.updateViewMatrixRotation();
	}
	
	// Move operations
	var tmp1=new THREE.Vector3();
	this.moveLook=function(positive)
	{
	    if (positive)
	    {
	        //m_position += m_look*(m_speed*m_elapse);
	    	m_position.add( tmp1.copy(m_look).multiplyScalar(m_speed*m_elapse));
	    }
	    else
	    {
	        //m_position -= m_look*(m_speed*m_elapse);
	    	m_position.sub( tmp1.copy(m_look).multiplyScalar(m_speed*m_elapse));
	    }
	    this.updateViewMatrixPosition();
	}
	
	this.moveRight=function(positive)
	{
	    if (positive)
	    {
	        //m_position += m_right*(m_speed*m_elapse);
	    	m_position.add( tmp1.copy(m_right).multiplyScalar(m_speed*m_elapse));
	    }
	    else
	    {
	        //m_position -= m_right*(m_speed*m_elapse);
	        m_position.sub( tmp1.copy(m_right).multiplyScalar(m_speed*m_elapse));
	    }
	    this.updateViewMatrixPosition();
	}
	
	this.moveUp=function(positive)
	{
	    if (positive)
	    {
	        //m_position += m_right*(m_speed*m_elapse);
	    }
	    else
	    {
	        //m_position -= m_right*(m_speed*m_elapse);
	    }
	    this.updateViewMatrixPosition();
	}
	
	this.updateViewMatrixRotation=function()
	{
	//    m_dirty = false;
		this.updateMatrixWorld();
		var m=this.matrixWorldInverse.elements;
		m_right.set(m[ 0 ],m[ 1 ],m[ 2 ]); m_up.set(m[ 4 ],m[ 5 ],m[ 6 ]); m_look.set(m[ 8 ],m[ 9 ],m[ 10 ]);
	//    D3DXMatrixRotationYawPitchRoll(m_matView, m_yaw, m_pitch, m_roll);
	//    D3DXMatrixInverse(m_matView, 0, m_matView);
	//    m_right = D3DXVECTOR3(m_matView._11, m_matView._21, m_matView._31);
	//    m_up    = D3DXVECTOR3(m_matView._12, m_matView._22, m_matView._32);
	//    m_look  = D3DXVECTOR3(m_matView._13, m_matView._23, m_matView._33);
	}
	
	this.updateViewMatrixPosition=function()
	{
	//    m_matView._41 = - D3DXVec3Dot( m_position, m_right); 
	//    m_matView._42 = - D3DXVec3Dot( m_position, m_up);
	//    m_matView._43 = - D3DXVec3Dot( m_position, m_look);
	}
	
	this.viewMatrix=function() 
	{
	    return this.matrixWorldInverse;
	}
	
	this.yawPitchRollFromMatrix=function(/*D3DXMATRIX **/matrix)
	{
	    m_yaw = Math.atan2(matrix._21, matrix._11);
	    m_pitch = Math.atan2(-matrix._31, 
	    		Math.sqrt(matrix._32*matrix._32 + matrix._33*matrix._33));
	    m_roll = Math.atan2(matrix._32, matrix._33);
	}
}
NewCamera.prototype = Object.create( CCamera.prototype );
NewCamera.prototype.constructor= NewCamera;