(function(){
	var m_pActiveEntity=null;
	window.getActiveEntity=function(){ return m_pActiveEntity; };
	window.setActiveEntity=function(e){ return m_pActiveEntity=e; };
	//////////////////////////////////////////////////////////////////////////
	var g_idAllocator = 1000, g_autoAttackDelay=0,g_autoAttackDelayDelta=5;
	///生成id
	function generateID() { return g_idAllocator++; }
	window.iEntity=iEntity;
	iEntity.array1=[];
	function iEntity() {
		this.rangedAttack=false;
		this.attackCooldownTime=650,this.attackCastTime=300,this.attackDamage=1;
		this.id = generateID();
		this.maxHP=100;//满血生命值
		this.HP=100;//生命值
		this.MP=100;//魔法值
		this.EXP=0;//经验
		this.defense=0;//防御
		this.strength=10;//力量
		this.intelligence=10;//天赋
		this.agility=10;//敏捷

		this.radius= 3;//0.5~10, default 3
		this.range= this.radius*1.42;
		this.chaseRange= 44, this.attackRange= this.range + 3;
		this.autoAttackRange= 28;//主动攻击范围
		this._autoAttackDelay = g_autoAttackDelay; g_autoAttackDelay += g_autoAttackDelayDelta;
		this._lastAutoAttackTime = Date.now();

		this.speed =25/1.1 //25;
		this.rotationSpeed = 10;
		this.attackTargets = [];
	}
	iEntity.prototype.setRadius=function(r) {
		this.radius=r; this.range= this.radius*1.42; this.attackRange= this.range + 3;
		return this;
	};
	iEntity.prototype.playAction=function(e,a,b,c,d) { this.model.playAction(e,a,b,c,d); }
	
	iEntity.prototype.update=function(elapse) {
		if (this.HP<1) {
			if(!this.isDead){
				this.onDeadTime = now;
				this.onDead();
			}
			if (now-this.onDeadTime>2000){
				removeTeamUnit(this);
				removeUpdater(this);
				scene.remove(this.model);
				raycaster_models.remove(this.model.bbox);
			}
			return 1;
		}
	    if (this.showDistance > 0) {
	    	//this.show(this.showDistance >= this.distToPlayer());
	    }
	    if (this.physics!==undefined) {
	    	this.physics.update(elapse);
	    }
	    if (this.model && this.autoAttackRange 
	    		&& now > this._autoAttackDelay + this._lastAutoAttackTime) {
	    	if(this.physics&&this.physics.state!==Define.PS_ATTACK){
	    		this.getNearbyUnits(this.pos, this.autoAttackRange, 80, false, true);
		    	this._lastAutoAttackTime = Date.now();
	    	}
	    }
	}
	
	iEntity.prototype.getNearbyUnits  = function(center, radius, limit, friendly,isAutoAttack) {
		if(!window.g_gameTeams) return;
		var targets=isAutoAttack?this.attackTargets:iEntity.array1, target, minDiatance = Infinity;
		targets.length=0;
		var distanceToSquared = window.distanceToSquared;
		for (var i=0; i<g_gameTeams.length;i++) {
			var teamPlayers = g_gameTeams[i];
			if(friendly === true) {
				if(teamPlayers.length && teamPlayers[0].teamId !== this.teamId)
					continue;
			} else if(friendly === false) {
				if(teamPlayers.length && teamPlayers[0].teamId === this.teamId)
					continue;
			}
			for (var j=0; j<teamPlayers.length;j++) {
				var units = teamPlayers[j], unitsLen = units.length;
				for (var k=0; k< unitsLen;k++) {
					var unit = units[k];
					if(unit.isDead)continue;
					var diatanceToMe= distanceToSquared(center, unit.pos);
					var test = (radius+unit.range);
					if (diatanceToMe < test*test) {
						if (limit ===1 &&diatanceToMe<minDiatance) {
							minDiatance = diatanceToMe;
							target = unit;
						}else if(!(targets.length>limit)) {
							targets.push( unit );
						}
					}
				}
			}
		}
		return limit ===1? target : targets;
	};

	iEntity.prototype.isActive = function() {
	    return m_pActiveEntity === this;
	}
	/*************************************************/
	//位置
	iEntity.prototype.getPos=function(){ return this.model.position; };
	iEntity.prototype.setModel=function(m) {
		this.model=m; this.pos= m.position;
		return m.entity = this;
	}
	iEntity.prototype.onHit=function(source) {
		this.HP -= source.attackDamage;
		if(this.topboard){
			this.topboard.update(this.HP/this.maxHP);
		}
	};
	iEntity.prototype.onDead=function() {
		this.isDead = 1;
		this.physics.state=Define.PS_DIE;
		this.playAction('die', false);
		this.physics=null;
	};
/*************************************************/
})()



