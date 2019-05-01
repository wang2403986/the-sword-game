(function(){
	var PS_MOVE=Define.PS_MOVE, PS_ATTACK=Define.PS_ATTACK, PS_FREE=Define.PS_FREE, PS_SKILL=Define.PS_SKILL;
	var playerFindPathType = 0,autoFindPathType = 1, autoAttackFindPathType = 2;
	var nextPos = new THREE.Vector3();
	var up=new THREE.Vector3(0, 1, 0)
	window.AIComponent=AIComponent;
	function AIComponent(source) {
		this.source = 0,
		this.autoMove = false,
		this.state = PS_FREE;
		if (source) {
			this.source = source;
			source.aiComponent=this;
		}
		this.nextPos=nextPos;
		this.findPathPosition = new THREE.Vector3(Infinity,0,0);
		this.moveToPosition = new THREE.Vector3(Infinity, 0, 0);
		this.oldPosition = new THREE.Vector3(0, 0, 0);
		this.destPosition = new THREE.Vector3(Infinity, 0, 0);
		this.stopPosition = new THREE.Vector3(Infinity, 0, 0);
		this.attackStartPos=new THREE.Vector3(Infinity, 0, 0);
		this.rotStart = new THREE.Quaternion();
		this.rotTarget = new THREE.Quaternion();
		this.rotateElapse = -1;
	}
	AIComponent.prototype.updateAnimation= function(fElapse) {
		var mixer=this.source.model.mixer;
		var _actions= mixer._actions, i=0, len = mixer._nActiveActions, e;
		var nActions = len - 1;
		if(nActions>0){
			var riseSpeed = fElapse * 3;
			var current = mixer.currentAction;
			if(!current) return;
			var w =current.weight + riseSpeed;
			current.weight= Math.min(w,1);
			for (; i < len; i++){
				e = _actions[i];
				if(current===e) continue;
				e.weight -= riseSpeed/nActions;
				if(e.weight<=0){
					e.weight = 0;
					e.stop();
					len--;
					i--;
					if(i<0)break;
				}
			}
		}
	}
	AIComponent.prototype.update= function(fElapse) {
	    if (!this.source) return;
	    //Auto Find Path
	    this.isAutoFindPath=false;
	    if(this.autoFindPathMax>now && !this.findPathInProgress) {
	    	if (this.autoFindPathTime < now && !this.autoMove) {
	    		this.isAutoFindPath=true, this.autoFindPathTime=now + 1000;
	    	}
	    }
	    this.updateAnimation(fElapse);
	    this.updateOrientation(fElapse);
	    this.updateRotateAnimation(fElapse);
	    this.updateAutoMove(fElapse);
	    //地形高度
	    this.updateHeight(fElapse);
	    if(this.state===PS_ATTACK)
	    	this.updateAttackState();
	    else if(this.autoMove)
	    	this.updateMoveState();
	    else if(this.state===PS_FREE)
	    	this.updateFreeState();
	    else if(this.state===PS_SKILL)
	    	this.updateSkillState();
	}
	AIComponent.prototype.attackTo=function(target){
		this.autoFindPathMax = now + 10*60*1000;
		this.findPath(target, 0);
		this.attackToMode = true;
	};
	AIComponent.prototype.setAttackTarget=function(target){// TODO
		this.attackToMode = 0;
		this.stopSkill();
		this.stopAttack();
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
	AIComponent.prototype.setSkillTarget=function(skillTarget){
		this.attackToMode = 0;
		this.stopSkill();
		this.stopAttack();
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
	AIComponent.prototype.startSkill=function() {
		this.skillStartTime = now;
		this.autoMove = false;//stop move state
		this.findPathDiscarded = true;//stop findPath
		this.stopAttack()//stop Attack
		this.setState(PS_SKILL);
		if(this.skillTarget.pos){
			new BurstEffect(this.skillTarget.pos);
			//showSkillEffect(0,this.source,this.skillTarget);
		}
		console.log('startSkill')
	}
	AIComponent.prototype.stopSkill=function() {
		if (!this.skillTarget) return;
		console.log('stopSkill');
		this.skillStartTime = 0;
		this.skillTarget=null;
		this.autoMove = false;//stop move state
		this.setState(PS_FREE);
	}
	AIComponent.prototype.stopChase=function() {
		console.log('stopChase');
		this.attackTarget=null;
		this.isLockTarget=false;
		this.autoMove = false;//stop move state
		this.setState(PS_FREE);
	}
	AIComponent.prototype.startAttack=function() {
		console.log('startAttack')
		this.autoMove = false;//stop move state
		this.findPathDiscarded = true;//stop findPath
		if(this.isLockTarget) this.destPosition.copy(this.stopPosition.copy(this.source.pos));
		this.setState(PS_ATTACK);
		this.lastActionTime = 0;
		this.isHit=false;
		this.fired=false;
		var aiComponent=this.attackTarget.aiComponent;
		if(aiComponent&& !aiComponent.attacker) aiComponent.attacker=this.source;
	}
	AIComponent.prototype.stopAttack=function() {
		if(!this.attackTarget) return;
		console.log('stopAttack')
		var aiComponent=this.attackTarget.aiComponent;
		if(aiComponent && aiComponent.attacker===this.source) aiComponent.attacker=false;
		this.attackTarget=null;
		this.isLockTarget=false;
		this.autoMove = false;//stop move state
		this.setState(PS_FREE);
	}
	AIComponent.prototype.stopMoveState=function() {
		this.autoMove=false;
		this.setState(PS_FREE);
	}
	AIComponent.prototype.updateSkillState = function() {
		if (now- this.skillStartTime>2600){
			this.stopSkill();
		}
	};
	AIComponent.prototype.updateAttackState = function() {
		//定时寻路
		if (this.isAutoFindPath) {
			this.findPath(null, autoFindPathType);
		}
		var auto = !this.isLockTarget;
		var attackTarget=this.attackTarget, source=this.source;
		var aiComponent=attackTarget.aiComponent;
		if(aiComponent&& !aiComponent.attacker) aiComponent.attacker=source;
		var faceDir = v3_4.subVectors(attackTarget.pos , source.pos);
	    faceDir.y = 0.0;
	    this.faceToDir(faceDir);
		
	    var time=source.model.mixer.currentAction.time;
	    if (!source.rangedAttack && !this.isHit&& (time >= source.attackHitTime || this.lastActionTime>time)) {
			if(source.audio) {
				if(source.audio.isPlaying) source.audio.stop();
				source.audio.play();
			}
    		this.attackTarget.onHit && this.attackTarget.onHit(source);
    		this.isHit = true;
	    }
	    if (this.lastActionTime>time) { // at each animation finished
	    	this.isHit = false;
	    	this.fired=false;
	    	var chaseDistance=source.pos.distanceToSquared(this.stopPosition);
			var distance=distanceToSquared(source.pos, attackTarget.pos);
			var chaseRange = attackTarget.range+ source.chaseRange;
			var acquisitionRange = attackTarget.range+ source.acquisitionRange;
			var attackRange = attackTarget.range+ source.attackRange + 3;
	    	if(distance>acquisitionRange*acquisitionRange){
				//target outside acquisitionRange, move back
				this.stopAttack();
				this.findPath(this.destPosition);
			} else if(distance>attackRange*attackRange){
				// target outside attackRange, stop attack
				this.stopAttack();
				// target outside chaseRange, move back
				if((chaseDistance>chaseRange*chaseRange) &&auto)
					this.findPath(this.destPosition);
			} else if (attackTarget.isDead) { // stop attack if target isDead
				this.stopAttack();
			}
	    }
	    if(source.rangedAttack&& !this.fired&& time >=source.attackCastTime){
			this.fired=true;
			new Projectile(source, attackTarget);
		}
		
	    this.lastActionTime=time;
	};
	
	AIComponent.prototype.updateMoveState = function() {
		var source=this.source;
		var target= this.skillTarget || this.attackTarget, auto = !this.isLockTarget;
		if (this.skillTarget) { // have casted a skill
			var distance=target.pos.distanceToSquared(source.pos);
			var attackRange = target.range+ 10;
			if(distance<=attackRange*attackRange){// target is inside spell range, do skill
				this.startSkill()
			}
		} else if(this.attackTarget) {
			var distance=distanceToSquared(source.pos,target.pos);
			var acquisitionRange = target.range+ source.acquisitionRange;
			var attackRange = target.range+ source.attackRange;
			if(auto&&distance>acquisitionRange*acquisitionRange){
				// target is outside acquisition range, stop Chase
				this.stopChase();
				this.findPath(this.destPosition);
			}else if(distance<=attackRange*attackRange){
				// target is inside attack range, do attack
				this.startAttack()
			}else if(auto&&source.pos.distanceToSquared(this.stopPosition)>source.chaseRange*source.chaseRange){
				// target is outside max chase range, stop chasing
				this.stopChase(); //this.attackStartPos.equals
				this.findPath(this.destPosition);
			}else if(target.isDead){
				// target is Dead, stop chasing
				this.stopChase();
			}else if(!this.findPathInProgress){
				var findPos=this.findPathPosition, pos = target.pos; findPos.x=pos.x, findPos.z=pos.z;
			}
		} else if(this.attackToMode){
			if(!(this.findPathInProgress&&this.findPathType===autoAttackFindPathType)&&source.attackTargets.length)
				this.findPath(null, autoAttackFindPathType);
		}
	};
	AIComponent.prototype.updateFreeState = function() {
		if(this.destPosition.x===Infinity)
			this.stopPosition.copy(this.destPosition.copy(this.source.pos));
		var source=this.source;
		if (this.skillTarget) { // have casted a skill
			var distance=distanceToSquared(this.skillTarget.pos,source.pos);
			var attackRange = this.skillTarget.range+ source.attackRange;
			if(distance<=attackRange*attackRange)// do start Skill
				this.startSkill();
		} else if(this.attackTarget) {
			var distance=distanceToSquared(this.attackTarget.pos,source.pos);
			var attackRange = this.attackTarget.range+ source.attackRange;
			if(distance<=attackRange*attackRange)// do start Attack
				this.startAttack();
		} else if(!this.findPathInProgress && this.source.attackTargets.length) {
			this.findPath(null, autoAttackFindPathType);
		} else if (!this.findPathInProgress && this.isAutoFindPath) {//FindPath for each time interval
			this.findPath(null, autoFindPathType);
		}
	};
	AIComponent.prototype.findPath=function(/*D3DXVECTOR3*/ dest, type) {
		this.findPathDiscarded = false;
		this.findPathType=type;
		if(dest) this.findPathPosition.copy(dest);
		if(type===playerFindPathType) {
			this.destPosition.copy(dest),
			this.stopPosition.copy(dest);
			
			this.attackToMode = 0;
			this.stopSkill();
			this.stopAttack();
		}
		if (!this.findPathInProgress) {
			this.findPathInProgress=true
			iPathFinder.findPath(this.source, dest);
		}
	}
	AIComponent.prototype.updateHeight=function(elapse) {
		if(this.source===undefined) return;
		var position=this.source.pos;
//	    if (position.x<0) position.x=0;
//	    if (position.z<0) position.z=0;
	    var pMap = getMap();
	    if (this.fixedHeight || null === pMap) {
	        return;
	    }
	    var mh = pMap.getHeight(position.x, position.z);
	    var h = mh + 0//this.lockHeight;
//	    if (position.y > h) {
//	    	position.y -= 9800.0*.001*elapse;//自由下落
//	    }
	    if (position.y !== h) {
	    	position.y = h;
	    }
	}
	var v_look=new THREE.Vector3(0, 1, 0);
	//缓慢转动到目标点  
	AIComponent.prototype.updateRotateAnimation=function(fElapse) {
		if(this.rotateElapse > -1) {
			this.rotateElapse +=  fElapse*5;//5
			var t=this.rotateElapse / this.rotateTotal;
			if(t < 1){
				var quaternion = this.source.model.quaternion;
				THREE.Quaternion.slerp( this.rotStart, this.rotTarget, quaternion, t);
			}else {
				this.rotateElapse= -1;
				if(t >= 1) this.source.model.quaternion.copy(this.rotTarget);
			}
		}
	}
	var orientation=new THREE.Quaternion();
	AIComponent.prototype.updateOrientation=function(fElapse) {
		if (!this.backOrientation) return;
		this.orientationElapse +=  fElapse*100;//12
		var t= this.orientationElapse / this.rotateTotal;
		if(this.rotateTotal > 0.000000005) {
			THREE.Quaternion.slerp( this.rotStart, this.rotTarget, orientation, t);
			v_look.set(0,0,1).applyQuaternion( orientation );
		    v_lookAt.set(this.dx, 0, this.dy);
			var angle = v_look.angleTo(v_lookAt);
			if(angle<= Math.PI/2) this.backOrientation=0;
		} else
			this.backOrientation=0;
	}
	var quat1=new THREE.Quaternion(); var v_lookAt=new THREE.Vector3();
	AIComponent.prototype.faceToDir=function(dir) {
		if (!this.source)
			return;
		var lookAt =  v_lookAt.copy(dir), m_pSource=this.source;
		lookAt.add(m_pSource.pos).y = 0;
		this.rotStart.copy(m_pSource.model.quaternion);
	    m_pSource.model.lookAt(lookAt);
	    this.rotTarget.copy(m_pSource.model.quaternion);
	    m_pSource.model.quaternion.copy(this.rotStart);
	    lookAt.set(0,0,1).applyQuaternion(this.rotStart);
	    
	    var angle = lookAt.angleTo(dir);
	    this.rotateTotal = angle;
	    this.rotateElapse=0;
	    this.orientationElapse=0;
	    this.backOrientation=1;
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
	AIComponent.prototype.moveForward=function( findPathType, firstStep) {
		var path =this.path, endIndex = path.length-1;
		if(this.state===PS_ATTACK && findPathType===autoFindPathType) {
			if(this.isLockTarget&&this.attackTarget) return;
			if(Math.abs(path[endIndex-1]-this.stopPosition.x)<=32 &&
					Math.abs(path[endIndex]-this.stopPosition.z)<=32)
				return;
			console.log('autoFindPathType stopAttack!');
			this.stopAttack();
		}
		if(findPathType===autoFindPathType)
			this.findPathPosition.copy(this.destPosition);
		var i=this.currentPathIndex-2, j=this.currentPathIndex, moveX, moveY, threshold= 0.5, offset = 0.4375;
//		if(path[i]===path[j] &&path[i+1]===path[j+1] ){
//			this.currentPathIndex+=2;
//			i=this.currentPathIndex-2, j=this.currentPathIndex;
//		}
		this.moveToElapse=0;
		this.moveToPosition.set(path[this.currentPathIndex], 0, path[this.currentPathIndex+1]);
//		if(j+3<= endIndex&& 1){//Make the path smoother
//			if(path[i]>>0===path[i+2]>>0 &&path[j+1]===path[j+3]){
//				var diff = path[i+3]-path[i+1];
//				if(Math.abs(diff)>=threshold){
//					moveY =diff>0 ? (path[j+1]>>0) -offset :  (path[j+1]>>0)+1 +offset;
//					if(Math.abs(diff)<1) moveY = diff>0 ? (path[j+1]>>0) +0.05 : (path[j+1]>>0)+1 -0.05;
//				    moveX = path[j];
//		            path[j] =(path[j]<path[j+2])? path[j]+1  :   path[j]-1;
//		            if(path[j]!==path[j+2])this.currentPathIndex -=2;
//				}
//			}else if(path[i+1]>>0===path[i+3]>>0 &&path[j]===path[j+2]){
//				var diff = path[i+2]-path[i];
//				if(Math.abs(diff)>=threshold){
//					moveX = diff>0? (path[j]>>0) -offset : (path[j]>>0)+1 +offset;
//					if(Math.abs(diff)<1) moveX =diff>0? (path[j]>>0) +0.05 : (path[j]>>0)+1 -0.05;
//					moveY = path[j+1];
//					path[j+1] =(path[j+1]<path[j+3])? path[j+1]+1  :   path[j+1]-1;
//					if(path[j+1]!==path[j+3])this.currentPathIndex -=2;
//				}
//			}
//			if(moveX!==undefined) this.moveToPosition.set(moveX,0,moveY);
//		}
	    this.oldPosition.copy(this.source.pos);
//	    iDebugData.push(this.moveToPosition.clone());// TODO

	    var dx = this.moveToPosition.x-this.oldPosition.x;
	    var dy = this.moveToPosition.z-this.oldPosition.z;
	    var $dx = Math.abs(dx), $dy=Math.abs(dy);
	    if ($dx > $dy) {
	    	this.stepByX = true;
	    	this.steps = $dx;
	    } else{
	    	this.stepByX = false;
	    	this.steps = $dy;
	    }
	    var distance = Math.sqrt(dx*dx+dy*dy);
	    if(distance<=0.001)
	    	return;
	    this.stepSpeed= this.source.speed * this.steps/ distance;
	    this.dx=dx / this.steps;
	    this.dy=dy / this.steps;
	    
	    this.autoMove = true;
	    this.setState(PS_MOVE);
	    this.currentPathIndex +=2;

	    var faceDir = v3_4.set(dx ,0, dy);
	    this.faceToDir(faceDir);
	}
	AIComponent.prototype.updateAutoMove=function( fElapse) {
		fElapse=fElapse> 0.016*3 ? 0.016*3 : fElapse;
	    if (!this.autoMove || this.autoMoveWaitTime > now || this.backOrientation)
	        return;
	    if(this.needsFindPath)
	    	return this.findPath(this.findPathPosition);
	    if(this.isWaiting) this.setState(PS_MOVE),this.isWaiting = false;
    	var moveToElapse = this.moveToElapse + fElapse;
		var reached = this.calculateNextPos(moveToElapse);

    	var isEndPath =reached && this.currentPathIndex >= this.path.length;
    	var continueToMove=(isEndPath &&  ((!this.isFullPath)||this.isContinueToFollow()));
    	if(continueToMove) this.findPath(this.findPathPosition);
    	if(reached && !continueToMove) {
        	if(isEndPath) {
	            this.finishAutoMove();
        	} else {
        		this._moveToNextPath(fElapse);
        	}
        } else {
        	var collision=this.getCollisionObject(true);
        	if (collision) {
        		var aiComponent=collision.aiComponent;
        		if(aiComponent&&aiComponent.autoMove&&!aiComponent.isWaiting) this.setWaitTime();
    			this.needsFindPath=true;
        	} else {
        		this.source.pos.set(this.nextPos.x, 0, this.nextPos.z);
        		this.moveToElapse = moveToElapse;
        	}
        }
	}
	AIComponent.prototype.calculateNextPos= function(moveToElapse) {
		var k = this.stepSpeed*moveToElapse , x, y;
		if (this.stepByX) {
			x = this.oldPosition.x + this.dx * k;
			k = Math.abs( x - this.oldPosition.x );
		    y = this.oldPosition.z + this.dy * k;
		} else {
			y = this.oldPosition.z + this.dy * k;
			k = Math.abs( y - this.oldPosition.z );
			x = this.oldPosition.x + this.dx * k;
		}
		if (x<0) x=0;
		if (y<0) y=0;
		if (k>= this.steps) {
			this.nextPos.copy(this.moveToPosition);
			return true;
		} else
			this.nextPos.set(x,0,y);
		return false;
	};
	AIComponent.prototype._moveToNextPath= function(fElapse) {
		var source=this.source, m_nextPos=this.nextPos, pos=source.pos;
		if(this.stepByX) {
			fElapse -= Math.abs(pos.x-this.moveToPosition.x)/this.stepSpeed;
		}else
			fElapse -= Math.abs(pos.z-this.moveToPosition.z)/this.stepSpeed;
		if(fElapse<0)fElapse=0;
		
		source.pos = m_nextPos.copy(this.moveToPosition);
		this.moveForward();
		source.pos = pos;
		
		this.calculateNextPos(fElapse);
		if(!this.getCollisionObject(0)){
			pos.set(m_nextPos.x, 0, m_nextPos.z);
    		this.moveToElapse = fElapse;
		} else this.needsFindPath=true;
	};
	AIComponent.prototype.isContinueToFollow= function(needsProceed) {
		var lockedTarget= this.skillTarget || this.moveToTarget;
		if(lockedTarget){
			var targetPos = lockedTarget.pos;
			this.stopPosition.copy(targetPos);
			this.destPosition.copy(targetPos);
			return this.findPathPosition.copy(targetPos);
		} else if (this.attackTarget) {
			var targetPos = this.attackTarget.pos;
			if(this.isLockTarget){
				this.stopPosition.copy(targetPos);
				this.destPosition.copy(targetPos);
			}
			return this.findPathPosition.copy(targetPos);
		}
	};
	AIComponent.prototype.getCollisionObject= function(preferMovingUnit) {
		return iPathFinder.getCollisionObject(this.source, preferMovingUnit);
	};

	AIComponent.prototype.setWaitTime=function(time) {
		this.isWaiting = true;
		this.setState(PS_FREE);
		this.autoMoveWaitTime = time===undefined? ( Date.now() + 700) :time;
	};

	AIComponent.prototype.onMoveToFinished= function () {};

	AIComponent.prototype.finishAutoMove= function (noPathFound) {
		if (noPathFound){
			if (this.findPathType===autoFindPathType){
				return;
			}
		}
	    if (this.autoMove) this.stopMoveState();

	    if (this.skillTarget || this.moveToTarget){
			if(this.findPathState) {
				this.skillTarget=false;
				this.stopPosition.copy(this.source.pos);
			}
		}else if(this.attackTarget){
			if (this.findPathState){
				if (this.isLockTarget) this.stopPosition.copy(this.source.pos);
				this.attackTarget=this.isLockTarget=false;
			}
		} else 
			this.stopPosition.copy(this.source.pos);
	    this.onMoveToFinished();
	}
	
	AIComponent.prototype.getState=function() { return this.state; };
	
	AIComponent.prototype.setState=function( state) { 
	    if (this.state === state) return ;
	    var oldState = this.state;
	    this.state = state;
	    this.onStateChange(oldState);
	}
	AIComponent.prototype.onStateChange=function(oldState) {
		if (!this.source) return;
		var model=this.source.model;
		var mixer= model.mixer;
		mixer.currentAction = model.actions[this.state];
		if(mixer.currentAction && !mixer.currentAction.isScheduled()){
			mixer.currentAction.play();
		}
	}
})();