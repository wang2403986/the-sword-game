(function(){
	window.UnitManager={};
	UnitManager.addUnits=addUnits;
	UnitManager.addUnits();
	function addUnits(){
		// models
		var models=[
		{
			name:'Monster1',
			url:'../assets/models/hou_zi.FBX',
			animation:'walk',
			animationsFiles:{
				free: '../assets/models/hou_zi@free.FBX',
				die: '../assets/models/hou_zi@die.FBX',
				attack: '../assets/models/hou_zi@attack.FBX'
			},
			boundingBox:{x:20, y:20, z:25},
			topBoard:{height:40, scale:{x:30, y:3, z:1}},
			selectable:true,
			radius: 1.5 ,
			scale:.1,//.16, r:2
			speed:25/1.5,
			attackHitTime:0.36666667461395264 -.08
		},
		{ 		
			name:'Monster2',
			url:'../assets/models/hu.FBX',
			animation:'free',
			animationsFiles:{
				walk: '../assets/models/hu@run.FBX',
				die: '../assets/models/hu@die.FBX',
				attack: '../assets/models/hu@attack.FBX'
			},
			boundingBox:{x:60, y:70, z:95},
			topBoard:{height:100, scale:{x:80, y:8, z:1}},
			selectionScale:1.7,
			selectable:true,
			radius: 2.5 ,
			scale:.05,//
			speed:25,
			attackHitTime:0.36666667461395264 -.08
				
		},
		{ name:'Building1',
			url:'../assets/models/Building1.FBX',
			animation:'free',
			animationsFiles:{ },
			boundingBox:{x:300, y:300, z:300},
			selectionScale:12,
			selectable:false,
			radius: 2.5,
			scale:.015//.2 .05
		},
		{ name:'shu01',
			url:'../assets/models/shu01.FBX',
			animation:'free',
			animationsFiles:{ },
			boundingBox:{x:300, y:300, z:300},
			selectionScale:0.1 ,
			selectable:false,
			radius: 2.5,
			material:{alphaMap:null},
			scale:3//.2 .05
		},
		{
			name:'hero1',
			url: '../assets/models/ou_yang.FBX',
			animation:'walk',
			animationsFiles:{
				free: '../assets/models/ou_yang@stand.FBX',
				skill: '../assets/models/ou_yang@skill.FBX',
				attack: '../assets/models/ou_yang@attack.FBX',//aaa
				die: '../assets/models/ou_yang@die.FBX'  },
			material:{alphaTest:.5},
			boundingBox:{x:70, y:180, z:70},
			scale:.03,//.04
			topBoard:{height:280, scale:{x:100, y:10, z:1}},
			selectable:true,
			radius:1.5,
			rangedAttack:true,
			attackHitTime:0.89,
			attackRange:15
		}
		];
		//units position
		var team1Positions=[{"x":279.3,"y":0,"z":224.5},{"x":279.5,"y":0,"z":232.5},{"x":279.2,"y":0,"z":240.2},{"x":279.3,"y":0,"z":248.6},{"x":287.4,"y":0,"z":224.5},{"x":287.3,"y":0,"z":232.5},{"x":287.2,"y":0,"z":240.2},{"x":287.4,"y":0,"z":248.4},{"x":295.4,"y":0,"z":224.5},{"x":295.5,"y":0,"z":232.4},{"x":295.2,"y":0,"z":240.6},{"x":295.4,"y":0,"z":248.4},{"x":303.5,"y":0,"z":224.4},{"x":303.4,"y":0,"z":232.5},{"x":303.4,"y":0,"z":240.4}];
		//enemy units position
		var team2Positions=[{"x":191.6,"y":0,"z":293.2},{"x":191.7,"y":0,"z":303.3},{"x":191.6,"y":0,"z":313.5},{"x":191.6,"y":0,"z":323.5},{"x":201.6,"y":0,"z":293.3},{"x":201.7,"y":0,"z":303.3},{"x":201.7,"y":0,"z":313.5},{"x":201.5,"y":0,"z":323.5},{"x":211.5,"y":0,"z":293.4},{"x":211.7,"y":0,"z":303.3},{"x":211.5,"y":0,"z":313.4},{"x":211.5,"y":0,"z":323.4},{"x":221.5,"y":0,"z":293.3},{"x":221.6,"y":0,"z":303.2},{"x":221.7,"y":0,"z":313.1}];
		
		var units = [];
		for (var ii=0;ii<team1Positions.length;ii++){
			units.push({teamId:1, playerId:1, model:'Monster1', pos:team1Positions[ii]});
		}
		for (var ii=0;ii<team2Positions.length;ii++){
			units.push({teamId:2, playerId:2, model:'Monster2', pos:team2Positions[ii]});
		}
		for (var ii=0;ii< 155; ii++){
			units.push({update:false,teamId:-1, playerId:-1, model:'Building1', pos:{x:512*Math.random(),y:0, z:512*Math.random()}});
		}
		for (var ii=0;ii< 155; ii++){
			units.push({update:false,teamId:-1, playerId:-1, model:'shu01', pos:{x:512*Math.random(),y:0, z:512*Math.random()}});
		}
		
		var hero = {teamId:1, playerId:1,model:'hero1',maxHP:1000, glory:{}, pos:{x:281.8, y: 0, z: 259.4}};
		var hero2 = {teamId:1, playerId:1,model:'hero1',maxHP:1000, glory:{}, pos:{x:286.8, y: 0, z: 269.4}};
		units.push(hero);
		units.push(hero2);
		
		
		for(var ii=0;ii<models.length;ii++)
			ResourceManager.loadModel(models[ii]);
		ResourceManager.onLoad(onLoaded);
		function onLoaded() {
			var terrain = SceneManager.getTerrain();
			for (var ii=0;ii<units.length;ii++){
				var unit = units[ii];
				var model=ResourceManager.getModel(unit.model);
		    	if(unit.model==='Monster1')
		    		model.actions.attack.timeScale=.8;
		    	if (unit.model==='Building1'){
		    		console.log(unit.model);
		    	}
		    	if (unit.model==='hero1'){
		    		window.hero=model;
		    		console.log(unit.model);
		    	}
		    	if(model.mixer) model.playAction('free');
		    	var entity = new iEntity();
		    	entity.setModel(model)
		    	entity.pos.copy(unit.pos);
		    	entity.pos.y = terrain.getHeight(entity.pos.x, entity.pos.z);
		    	entity.setRadius(unit.radius||model.properties.radius||entity.radius);
		    	entity.speed=unit.speed||model.properties.speed||entity.speed;
		    	entity.attackHitTime= model.properties.attackHitTime||entity.attackHitTime;
		    	entity.rangedAttack=model.properties.rangedAttack||entity.rangedAttack;
		    	entity.attackRange=model.properties.attackRange||entity.attackRange;
		    	entity.maxHP= unit.maxHP||entity.maxHP;
		    	entity.HP=entity.maxHP;
		    	
		    	entity.addTopBoard(model.properties.topBoard);
		    	entity.addAIComponent();
				entity.addToTeam(unit.teamId, unit.playerId);
				entity.addToScene();
				if(unit.update !== false)
					entity.addUpdater();
				if(unit.glory )
					entity.addGlory();
			}
		}
	}
})();