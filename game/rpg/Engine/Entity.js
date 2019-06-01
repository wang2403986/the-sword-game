(function(){
	var m_pActiveEntity=null;
	window.getActiveEntity=function(){ return m_pActiveEntity; };
	window.setActiveEntity=function(e){ return m_pActiveEntity=e; };
	//////////////////////////////////////////////////////////////////////////
	var g_idAllocator = 1000, g_autoAttackDelay=0, g_autoAttackDelayDelta=5;
	///生成id
	function generateID() { return g_idAllocator++; }
	window.iEntity=iEntity;
	var array1=[];
	function iEntity() {
		this.id = generateID();

		this.maxHP=100;// max Health point满血生命值
		this.HP=100;//Health point
		this.MP=100;//魔法值
		this.EXP=0;//经验
		this.defense=0;//防御
		this.strength=10;//力量
		this.intelligence=10;//天赋
		this.agility=10;//敏捷
		this.speed =25/1.1;//速度

		this.radius= 3;//0.5~10, default 3
		this.range= this.radius*1.42;
		this.chaseRange= 44;
		this.attackRange= this.range + 3;
		this.acquisitionRange= 28;//主动攻击范围
		this._autoAttackDelay = g_autoAttackDelay;
		g_autoAttackDelay += g_autoAttackDelayDelta;
		this._lastAutoAttackTime = Date.now();
		this.rangedAttack=false;
		this.attackHitTime=0.28;
		this.attackDamage=1;

		this.attackTargets = [];
	}
	iEntity.prototype.setRadius=function(r) {
		this.radius=r;
		this.range= this.radius*1.42;
		this.attackRange= this.range + 3;
		return this;
	};
	iEntity.prototype.playAction=function(e,a,b,c,d) { this.model.playAction(e,a,b,c,d); }

	iEntity.prototype.update=function(elapse) {
		if (this.HP<=0) {
			if(!this.isDead){
				this.onDeadTime = now;
				this.onDead();
			}
			if (now-this.onDeadTime>2000){
				this.destroy()
			}
			return 1;
		}
	    if (this.showDistance > 0) {
	    	//this.show(this.showDistance >= this.distToPlayer());
	    }
	    if (this.aiComponent!==undefined) {
	    	this.aiComponent.update(elapse);
	    	if (this.model && this.acquisitionRange 
		    		&& now > this._autoAttackDelay + this._lastAutoAttackTime) {
		    	if(this.aiComponent.state!==Define.PS_ATTACK){
		    		this.getNearbyUnits(this.pos, this.acquisitionRange, 50, false, true);
			    	this._lastAutoAttackTime = Date.now();
		    	}
		    }
	    }
	}
	
	iEntity.prototype.isActive = function() {
	    return m_pActiveEntity === this;
	}
	iEntity.prototype.setModel=function(m) {
		this.model=m;
		this.pos= m.position;
		
		return m.entity = this;
	}
	iEntity.prototype.onHit=function(source) {
		this.HP -= source.attackDamage;
		if(this.topBoard){
			this.topBoard.update(this.HP/this.maxHP);
		}
	};
	iEntity.prototype.onDead=function() {
		this.isDead = 1;
		this.aiComponent.state=Define.PS_DIE;
		this.playAction('die', false);
		this.aiComponent=null;
	};
	iEntity.prototype.destroy=function() {
		SceneManager.removeUnitFromTeam(this);
		SceneManager.removeUpdater(this);
		SceneManager.remove(this.model);
	};
	var wireframeMaterial=new THREE.MeshBasicMaterial({wireframe : true});
	iEntity.prototype.addToScene=function() {
		var model = this.model;
		if(model.selectionCircle){
			var bbox = { geometry:model.boundingBoxGeometry, matrixWorld:model.matrixWorld };
			bbox.model=model;
			model.bbox=bbox;
			SceneManager.boundingBoxes.push(model.bbox);
//			var cube = new THREE.Mesh(model.boundingBoxGeometry, wireframeMaterial);
//			scene.add( cube );
//			cube.matrixWorld=model.matrixWorld;
//			cube.matrixAutoUpdate=false;
		}
		if(model.mixer)
			mixers.push(model.mixer);
		scene.add( model );
	};
	iEntity.prototype.addUpdater=function() {
		SceneManager.addUpdater(this);
	};
	iEntity.prototype.addToTeam=function(teamId, playerId) {
		if(Number.isInteger(playerId))
			SceneManager.addUnitToTeam(this, teamId, playerId);
	};
	iEntity.prototype.addAIComponent=function() { new AIComponent(this); };
	
	iEntity.prototype.addTopBoard =function(options) {
		if (options) {
			this.topBoard=new TopBoard(this, options);
		}
	};

	var gloryGeometry = new THREE.PlaneBufferGeometry( 4, 4 );
	var vertices = gloryGeometry.attributes.position.array;
    for ( var j = 0, l = vertices.length; j < l; j += 3 ) {
    	vertices[ j + 2 ]=-vertices[ j + 1 ];
    	vertices[ j + 1 ]=0;
	}
	var gloryMap = THREE.ImageUtils.loadTexture('../assets/materials/Rune1d.png');
	var gloryMaterial = new THREE.MeshBasicMaterial( {color: 0xff0000,depthTest: true,depthWrite:false, map: gloryMap,//alphaMap
		transparent: true,   blending: THREE.AdditiveBlending } );
	iEntity.prototype.addGlory =function(options) {
		var glory = new THREE.Mesh( gloryGeometry, gloryMaterial );
		glory.renderOrder = -1;
    	glory.model=this.model;
    	model.glory=glory;
	}

	iEntity.prototype.getNearbyUnits  = function(center, radius, limit, friendly,isAutoAttack) {
		var targets = isAutoAttack ? this.attackTargets : array1;
		targets.length=0;
		var target;
		var minDiatance = Infinity;
		var distanceSqInt = Utils.distanceSqInt;
		var teams= SceneManager.teams;
		for (var i=0; i<teams.length;i++) {
			var teamPlayers = teams[i];
			var teamId = undefined;
			if(teamPlayers.length) teamId=teamPlayers[0].teamId;
			if(friendly === true) {
				if(teamId !== this.teamId)
					continue;
			} else if(friendly === false) {
				if(teamId === this.teamId)
					continue;
			}
			if(isAutoAttack && teamId === -1) continue;
			for (var j=0; j<teamPlayers.length;j++) {
				var units = teamPlayers[j], unitsLen = units.length;
				for (var k=0; k< unitsLen;k++) {
					var unit = units[k];
					if(unit.isDead)continue;
					var diatanceToMe= distanceSqInt(center, unit.pos);
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
})()



