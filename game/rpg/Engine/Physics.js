(function(){
	var PS_MOVE=Define.PS_MOVE, PS_ATTACK=Define.PS_ATTACK, PS_FREE=Define.PS_FREE, PS_SKILL=Define.PS_SKILL;
	var playerFindPathType = 0,autoFindPathType = 1, autoAttackFindPathType = 2;
	window.iPhysics=iPhysics;
	function iPhysics(source) {
		this.source = NULL,
		this.autoMove = false,
		this.state = PS_FREE,
		this.lockHeight = 0.0;
		if (source) {
			this.source = source;
			source.physics=this;
		}
		this.findPathPosition = new THREE.Vector3(Infinity,0,0);
		this.nextPos=new THREE.Vector3(), this.rotTarget = new THREE.Quaternion();
		this.moveToPosition = new THREE.Vector3(Infinity, 0, 0);
		this.oldPosition = new THREE.Vector3(0, 0, 0);
		this.destPosition = new THREE.Vector3(Infinity, 0, 0);
		this.stopPosition = new THREE.Vector3(Infinity, 0, 0);
		this.attackStartPos=new THREE.Vector3(Infinity, 0, 0);
	}
	iPhysics.prototype.smoothRotate=function(fElapse) {
		if(!(this.autoMove||this.state===Define.PS_ATTACK)) return;
		var quaternion = this.source.model.quaternion;
	    //缓慢转动到目标点  
		var t =fElapse*4 > 1? 1 : fElapse*4;
		THREE.Quaternion.slerp( quaternion, this.rotTarget, quaternion, t);
	}
	var g_v3_1=new THREE.Vector3();
	iPhysics.prototype.update= function(fElapse) {
	    if (!this.source) return;
	    //Auto Find Path
	    this.isAutoFindPath=false;
	    if(this.autoFindPathMax>now && !this.isFindPath) {
	    	if (this.autoFindPathTime < now && !this.autoMove) {
	    		this.isAutoFindPath=true, this.autoFindPathTime=now+700;
	    	}
	    }
	    this.updateAutoMove(fElapse);
	    //地形高度
	    //this.updateHeight(fElapse);
	    this.smoothRotate(fElapse);
	    if(this.state===PS_ATTACK)
	    	this.updateAttackState();
	    else if(this.autoMove)
	    	this.updateMoveState();
	    else if(this.state===PS_FREE||this.state===PS_MOVE)
	    	this.updateFreeState();
	    else if(this.state===PS_SKILL)
	    	this.updateSkillState();
	}
	iPhysics.prototype.attackTo=function(target){
		this.autoFindPathMax = now + 10*60*1000;
		this.findPath(target, 0);
		this.attackToMode = true;
	};
	iPhysics.prototype.setAttackTarget=function(target){// TODO
		this.attackToMode = 0;
		var distance=distanceToSquared(this.source.pos, target.pos);
		var attackRange = target.range+ this.source.attackRange;
		if(distance<=attackRange*attackRange) {// do startAttack
			this.attackTarget=target;
			this.isLockTarget=true;
			this.startAttack();
		} else {
			this.findPath(target.pos, 0);
			this.findPathState=0;
			this.attackTarget=target;
			this.isLockTarget=true;
		}
	};
	iPhysics.prototype.setSkillTarget=function(skillTarget){
		this.attackToMode = 0;
		var distance=skillTarget.pos.distanceToSquared(this.source.pos);
		var attackRange = skillTarget.range+ 10;
		if(distance<=attackRange*attackRange){// do skill
			this.skillTarget=skillTarget;
			this.startSkill();
		} else {
			this.findPath(skillTarget.pos, 0);
			this.findPathState=0;
			this.skillTarget=skillTarget;
		}
	};
	iPhysics.prototype.startSkill=function() {
		this.skillStartTime = now;
		this.autoMove = false;//stop move state
		this.findPathDiscarded = true;//stop findPath
		this.stopAttack()//stop Attack
		this.setState(PS_SKILL);
		if(this.skillTarget.pos)
			new BurstEffect(this.skillTarget.pos);
		console.log('startSkill')
	}
	iPhysics.prototype.stopSkill=function() {
		this.skillStartTime = 0;
		console.log('stopSkill');
		this.skillTarget=null;
		this.setState(PS_FREE);
	}
	iPhysics.prototype.stopChase=function() {
		console.log('stopChase');
		this.autoMove = false;//stop move state
		this.setState(PS_FREE);
		this.attackTarget=null;
		this.isLockTarget=false;
	}
	iPhysics.prototype.updateSkillState = function() {
		if (now- this.skillStartTime>2600){
			this.stopSkill();
		}
	};
	iPhysics.prototype.startAttack=function() {
		console.log('startAttack')
		this.autoMove = false;//stop move state
		this.findPathDiscarded = true;//stop findPath
		if(this.isLockTarget) this.destPosition.copy(this.stopPosition.copy(this.source.pos));
		this.setState(PS_ATTACK);
		this.attackStartTime = now;
		this.isCasted=false;
		var targetPhysics=this.attackTarget.physics;
		if(targetPhysics&& !targetPhysics.attacker) targetPhysics.attacker=this.source;
	}
	iPhysics.prototype.stopAttack=function() {
		if(!this.attackTarget) return;
		this.autoMove = false;//stop move state
		this.setState(PS_FREE);
		console.log('stopAttack')
		var targetPhysics=this.attackTarget.physics;
		if(targetPhysics&& targetPhysics.attacker===this.source) targetPhysics.attacker=false;
		this.attackTarget=null;
		this.isLockTarget=false;
	}
	iPhysics.prototype.stopMoveState=function() {
		this.autoMove=false;
		this.setState(PS_FREE);
	}
	iPhysics.prototype.updateAttackState = function() {
		//定时寻路
		if (this.isAutoFindPath) {
			this.findPath(null, autoFindPathType);
		}
		var auto = !this.isLockTarget;
		var attackTarget=this.attackTarget, source=this.source;
		var chaseDistance=source.pos.distanceToSquared(this.stopPosition);
		var distance=distanceToSquared(source.pos, attackTarget.pos);
		var chaseRange = attackTarget.range+ source.chaseRange;
		var autoAttackRange = attackTarget.range+ source.autoAttackRange;
		var attackRange = attackTarget.range+ source.attackRange + 3;
		
		var targetPhysics=attackTarget.physics;
		if(targetPhysics&& !targetPhysics.attacker) targetPhysics.attacker=source;
		var faceDir = v3_4.subVectors(attackTarget.pos , source.pos);
	    faceDir.y = 0.0;
	    this.faceToDir(faceDir);
		
		if(now-this.attackStartTime>=source.attackCooldownTime){
			//this.source.audio.play();
			this.isCasted=false;
			this.attackStartTime=now;
			this.attackTarget.onHit && this.attackTarget.onHit(source);
			
			if(distance>autoAttackRange*autoAttackRange){
				this.stopAttack();//stop attack and move back
				this.findPath(this.destPosition);
			} else if(distance>attackRange*attackRange){// stop attack or Pursuit
				this.stopAttack();
				if((chaseDistance>chaseRange*chaseRange) &&auto)
					this.findPath(this.destPosition);
			} else if (attackTarget.isDead) {
				this.stopAttack();
			}
		}else {
			if(source.rangedAttack&&!this.isCasted&&now-this.attackStartTime>=source.attackCooldownTime/2){
				this.isCasted=true;
				new Projectile(source, attackTarget);
			}
		}
	};
	
	iPhysics.prototype.updateMoveState = function() {
		var source=this.source;
		var skillTarget=this.skillTarget, aTarget=this.attackTarget, auto = !this.isLockTarget;
		//已下达施放技能命令
		if (skillTarget) {
			var distance=skillTarget.pos.distanceToSquared(source.pos);
			var attackRange = skillTarget.range+ 10;
			if(distance<=attackRange*attackRange){// do skill
				this.startSkill()
			}
		} else if(this.attackTarget) {
			var distance=distanceToSquared(source.pos,aTarget.pos);
			var autoAttackRange = aTarget.range+ source.autoAttackRange;
			var attackRange = aTarget.range+ source.attackRange;
			if(auto&&distance>autoAttackRange*autoAttackRange){// target is outside pursuit range
				this.stopChase();
				this.findPath(this.destPosition);
			}else if(distance<=attackRange*attackRange){// do attack
				this.startAttack()
			}else if(auto&&source.pos.distanceToSquared(this.attackStartPos)>source.chaseRange*source.chaseRange){
				this.stopChase();
				if(!this.attackStartPos.equals(this.stopPosition)){
					this.findPath(this.destPosition);
				}
			}else if(aTarget.isDead){
				this.stopChase();
			}else if(!this.isFindPath){
				var findPos=this.findPathPosition, pos = aTarget.pos; findPos.x=pos.x, findPos.z=pos.z;
			}
		} else if(this.attackToMode){
			if(!(this.isFindPath&&this.findPathType===autoAttackFindPathType)&&source.attackTargets.length)
				this.findPath(null, autoAttackFindPathType);
		}
	};
	iPhysics.prototype.updateFreeState = function() {
		if(this.destPosition.x===Infinity)
			this.stopPosition.copy(this.destPosition.copy(this.source.pos));
		var source=this.source;
		//已下达施放技能命令
		if (this.skillTarget) {
			var distance=distanceToSquared(this.skillTarget.pos,source.pos);
			var attackRange = this.skillTarget.range+ source.attackRange;
			if(distance<=attackRange*attackRange)// do start Skill
				this.startSkill();
		} else if(this.attackTarget) {
			var distance=distanceToSquared(this.attackTarget.pos,source.pos);
			var attackRange = this.attackTarget.range+ source.attackRange;
			if(distance<=attackRange*attackRange)// do start Attack
				this.startAttack();
		} else if(!this.isFindPath && this.source.attackTargets.length) {
			this.findPath(null, autoAttackFindPathType);
		} else if (!this.isFindPath && this.isAutoFindPath) {//定时移动
			this.findPath(null, autoFindPathType);
		}
	};
	iPhysics.prototype.findPath=function(/*D3DXVECTOR3*/ dest, type) {
		this.findPathDiscarded = false;
		if(dest)
			this.findPathPosition.copy(dest);
		this.nextPos.copy(this.source.pos);
		if(type===playerFindPathType) {
			this.destPosition.copy(dest),
			this.stopPosition.copy(dest);
			if(this.state===PS_ATTACK) this.stopAttack();
			this.attackTarget=this.isLockTarget=false;
			this.skillTarget=false;
		}
		this.findPathType=type;
		if (!this.isFindPath) {
			this.isFindPath=true
			iPathFinder.findPath(this.source, dest);
		}
	}
	iPhysics.prototype.updateHeight=function(elapse) {
		if(this.source===undefined) return;
		var position=this.source.pos;
	    if (position.x<0) position.x=0;
	    if (position.z<0) position.z=0;
	    var pMap = getMap();
	    if (!this.lockHInMap || NULL === pMap) {
	        return;
	    }
	    var mh = pMap.getHeight(position.x, position.z);
	    var h = mh + this.lockHeight;
//	    if (position.y > h) {
//	    	position.y -= 9800.0*.001*elapse;//自由下落
//	    }
	    if (position.y !== h) {
	    	position.y = h;
	    }
	}
	
	var g_v3_2=new THREE.Vector3(), quat_1 = new THREE.Quaternion();
	iPhysics.prototype.faceToDir=function(dir) {
		if (!this.source)
			return;
		var look =  g_v3_2.copy(dir), m_pSource=this.source;
	//  look.y = 0.0;  // !!!
		look.add(m_pSource.pos);
		quat_1.copy(m_pSource.model.quaternion);
	    m_pSource.model.lookAt(look);
	    this.rotTarget.copy(m_pSource.model.quaternion);
	    m_pSource.model.quaternion.copy(quat_1);
	//    var/*D3DXVECTOR3*/ look(dir), up(0, 1, 0), right;
	//    look.y = 0.0f;
	//    D3DXVec3Normalize(look, look);
	//    D3DXVec3Cross(right, up, look);
	//    D3DXVec3Normalize(right, right);
	//    D3DXVec3Cross(up, look, right);
	//    D3DXVec3Normalize(up, up);
	//    m_pSource.m_vLook = look;
	//    m_pSource.m_vUp = up;
	//    m_pSource.m_vRight = right;
	}

	var v3_4=new THREE.Vector3();
	iPhysics.prototype.moveForward=function( findPathType, firstStep) {
		var path =this.path, endIndex = path.length-1;
		if(this.state===PS_ATTACK && findPathType===autoFindPathType) {
			if(this.isLockTarget&&this.attackTarget) return;
			if(Math.abs(path[endIndex-1]-this.stopPosition.x)<=32 &&
					Math.abs(path[endIndex]-this.stopPosition.z)<=32)
				return;
			console.log('autoFindPathType!!');
			this.stopAttack();
		}
		if(findPathType===autoFindPathType)
			this.findPathPosition.copy(this.destPosition);
		this.moveToState=0;
		var i=this.pathCurrent-2, j=this.pathCurrent, moveX, moveY;
//		if(path[i]===path[j] &&path[i+1]===path[j+1] ){
//			if(j+2> endIndex){
//				console.error(path);
//			}
//			this.pathCurrent+=2;
//			i=this.pathCurrent-2, j=this.pathCurrent;
//		}
		this.moveToElapse=0;
		this.moveToPosition.set(path[this.pathCurrent], 0, path[this.pathCurrent+1]);
		if(j+3<= endIndex&& 1){
			if(path[i]>>0===path[i+2]>>0 &&path[j+1]===path[j+3]){
				if(path[i+3]-path[i+1]>=1){
					moveY = (path[j+1]>>0) -0.4375;
				    moveX = path[j];
		            path[j] =(path[j]<path[j+2])? path[j]+1  :   path[j]-1;
		            if(path[j]!==path[j+2])this.pathCurrent -=2;
				}else if(path[i+1]-path[i+3]>=1){
					moveY = (path[j+1]>>0)+1 +0.4375;
					moveX = path[j];
					path[j] =(path[j]<path[j+2])? path[j]+1  :   path[j]-1;
					if(path[j]!==path[j+2])this.pathCurrent -=2;
	            }
			}else if(path[i+1]>>0===path[i+3]>>0 &&path[j]===path[j+2]){
				if(path[i+2]-path[i]>=1){
					moveX = (path[j]>>0) -0.4375;
					moveY = path[j+1];
					path[j+1] =(path[j+1]<path[j+3])? path[j+1]+1  :   path[j+1]-1;
					if(path[j+1]!==path[j+3])this.pathCurrent -=2;
				}else if(path[i]-path[i+2]>=1){
					moveX = (path[j]>>0)+1 +0.4375;
		            moveY = path[j+1];
		            path[j+1] =(path[j+1]<path[j+3])? path[j+1]+1  :   path[j+1]-1;
		            if(path[j+1]!==path[j+3])this.pathCurrent -=2;
		        }
			}
			if(moveX!==undefined) this.moveToPosition.set(moveX,0,moveY);
		}
	    this.oldPosition.copy(this.source.pos);
	    iDebugData.push(this.moveToPosition.clone());// TODO
	    var distance = this.moveToPosition.distanceTo(this.oldPosition);
	    if(distance<=0.001) {
	    	return;
	    }
	    var faceDir = v3_4.subVectors(this.moveToPosition , this.oldPosition);
	    faceDir.y = 0.0;
	    this.faceToDir(faceDir);
	    
	    var dy = this.moveToPosition.z-this.oldPosition.z;
	    var dx = this.moveToPosition.x-this.oldPosition.x;
	    var abs_dx = Math.abs(dx), abs_dy=Math.abs(dy);
	    if (abs_dx>abs_dy) {
	    	this.steps = abs_dx;  this.stepByX=true;
	    } else {
	    	this.steps = abs_dy;  this.stepByX=false;
	    }
	    this.stepSpeed=this.steps/ distance;
	    this.xIncrement = dx / this.steps;          //x每步骤增量
	    this.yIncrement = dy / this.steps;          //y的每步增量
	    this.autoMove = true;
	    this.setState(PS_MOVE);
	    this.pathCurrent +=2;
	}
	iPhysics.prototype.updateAutoMove=function( fElapse) {
		var now = window.now;
		fElapse=fElapse> 0.016*3 ? 0.016*3 : fElapse;
	    if (!this.autoMove || this.autoMoveWaitTime > now)
	        return;
	    if(this.needsFindPath)
	    	return this.findPath(this.findPathPosition);
	    if(this.isWaiting) this.setState(PS_MOVE),this.isWaiting = false;
	    var moveToElapse=this.moveToElapse + fElapse;
	    var m_pSource=this.source, reached =false, m_nextPos=this.nextPos, pos=m_pSource.pos;
	//	var faceDir = v3_1.subVectors(this.moveToPosition , m_pSource.m_vPos); faceDir.y = 0.0;
		//var m_vLook= v3_1.set( 0, 0, 1 ).applyQuaternion( m_model.quaternion );
	  //m_nextPos.copy(m_model.position).add(m_vLook.multiplyScalar(m_pSource.m_speed*fElapse ));
	    var k = (m_pSource.speed*this.stepSpeed*moveToElapse);
		var x = this.oldPosition.x + this.xIncrement*k;
		var y = this.oldPosition.z + this.yIncrement*k;
		if(x<0) x=0;	if(y<0) y=0;
		m_nextPos.set(x,0,y);

    	if (this.stepByX) {
    		if(this.oldPosition.x<this.moveToPosition.x){
    			if(m_nextPos.x>=this.moveToPosition.x)reached = true;
    		}else if(m_nextPos.x<=this.moveToPosition.x)reached = true;
    	} else{
    		if(this.oldPosition.z<this.moveToPosition.z){
    			if(m_nextPos.z>=this.moveToPosition.z)reached = true;
    		}else if(m_nextPos.z<=this.moveToPosition.z)reached = true;
    	}
    	var isEndPath =reached && this.pathCurrent >= this.path.length;
    	var needsProceed=(isEndPath &&  ((!this.isFullPath)||this.isContinueToFollow()));
    	if(needsProceed) this.findPath(this.findPathPosition);
    	if(reached && !needsProceed) {
        	if(isEndPath) {
	            this.path.length=0;
	            this.pathCurrent=0;
	            this.finishAutoMove();
        	} else {
        		moveToElapse -= this.steps/(m_pSource.speed*this.stepSpeed);
        		m_pSource.pos=m_nextPos.copy(this.moveToPosition);
        		this.moveForward();
        		m_pSource.pos=pos;
        		
        		k = (m_pSource.speed*this.stepSpeed*moveToElapse);
        		k = (k<0)?0:((k>this.steps)? (this.steps):k);
        		var x = this.oldPosition.x + this.xIncrement*k;
        		var y = this.oldPosition.z + this.yIncrement*k;
        		m_nextPos.set(x,0,y);
        		if(x>0&&y>0&&!this.getCollisionObject(0)){
        			pos.set( m_nextPos.x, 0, m_nextPos.z );this.moveToElapse = moveToElapse;
        		} else this.needsFindPath=true;
        	}
        } else {
        	var collision=this.getCollisionObject(true);
        	if (collision)  {
        		var physics=collision.physics;
        		if(physics&&physics.autoMove&&!physics.isWaiting) this.setWaitTime();
        		this.needsFindPath=true;
        		this.path.length=0;
        		this.pathCurrent=0;
        	} else {
        		pos.set(m_nextPos.x, 0, m_nextPos.z); this.moveToElapse = moveToElapse;
        	}
        }
	}
	iPhysics.prototype.isContinueToFollow= function(needsProceed) {
		if (this.attackTarget) {
			var targetPos = this.attackTarget.pos;
			if(this.isLockTarget){
				this.stopPosition.copy(targetPos);
				this.destPosition.copy(targetPos);
			}
			return this.findPathPosition.copy(targetPos);
		} else if(this.skillTarget){
			var targetPos = this.skillTarget.pos;
			this.stopPosition.copy(targetPos);
			this.destPosition.copy(targetPos);
			return this.findPathPosition.copy(targetPos);
		}
	};
	iPhysics.prototype.getCollisionObject= function(preferMovingUnit) {
		return iPathFinder.getCollisionObject(this.source, preferMovingUnit);
	};

	iPhysics.prototype.setWaitTime=function(time) {
		this.isWaiting = true;
		this.setState(PS_FREE);
		this.autoMoveWaitTime = time===undefined? ( Date.now() + 700) :time;
	};

	iPhysics.prototype.onMoveToFinished= function () {};

	iPhysics.prototype.finishAutoMove= function (noPathFound) {
		if (noPathFound){
			if (this.findPathType===playerFindPathType)
				this.stopPosition.copy(this.source.pos);
			if (this.findPathType===autoFindPathType){
				return;
			}
		}
	    if (this.autoMove) {
	    	this.autoMove = false, this.setState(PS_FREE);
		    if(!this.attackTarget)
		    	this.stopPosition.copy(this.source.pos);
	    }
	    if(this.skillTarget && this.findPathState){
			this.skillTarget=false;
			this.stopPosition.copy(this.source.pos);
		}
		if(this.attackTarget && this.findPathState&& this.isLockTarget){
			this.attackTarget=false;
			this.stopPosition.copy(this.source.pos);
		}
		if(!this.isLockTarget) this.attackTarget=false;
	    this.onMoveToFinished();
	}
	
	iPhysics.prototype.getState=function() { return this.state; };
	
	iPhysics.prototype.setState=function( state) { 
	    if (this.state === state) return ;
	    var oldState = this.state;
	    this.state = state;
	    this.onStateChange(state,oldState);
	}
	iPhysics.prototype.onStateChange=function(newstate, oldSate) {
		if (!this.source) return;
		if (this.state === PS_FREE)
			this.source.playAction(PS_FREE)
		else if( this.state === PS_MOVE)
			this.source.playAction(PS_MOVE)
		else if(this.state === PS_ATTACK )
			this.source.playAction(PS_ATTACK)
		else if( this.state === Define.PS_DEAD )
			this.source.playAction(Define.PS_DEAD);
		else if( this.state === PS_SKILL )
			this.source.playAction(PS_SKILL);
	}
})();