var Character = function()
{
	var char_name;
	var type;
	var bat;
	var hp, max_hp, total_hp;
	var mp, max_mp, total_mp;
	var ad, total_ad;
	var as, total_as;
	var ms, total_ms;
	var armor, total_armor;
	var resist, total_resist;
	var level;
	var stat_str, stat_agi, stat_int, stat_end;
	var total_str, total_agi, total_int, total_end;
	var magic_effect;
	var equip_slot;
	var inventory;
	var money;
}
var Player = function()
{
	var lvlup_exp;
	var exp_level, exp_str, exp_agi, exp_int, exp_end;
	var sp;
	var cur_location;
	var move_location;
	var cur_state;
	var quest_state;
	var cur_weight, carry_weight;
	
	Character.call(this);
}
var Npc = function()
{
	var relation;
	var exp_gain;
	var gold;
	var personality;
	var id;
	var subtype;

	Character.call(this);
}
var item_type = {consume:0, equip:1, etc:2};
var Item = function()
{
	var id;
	var type;
	var name;
	var desc;
	var value;
	var weight;
	var magic_effect;
}
Player.prototype = Character;
Player.prototype.constructor = Player;
Player.prototype.createPlayer = function()
{
	this.type="player";
	this.bat = 1.7;
	this.hp = 125;
	this.max_hp = 125;
	this.mp = 75;
	this.max_mp = 75;
	this.ad = 40;
	this.as = 40;
	this.ms = 100;
	this.armor = 25;
	this.resist = 25;
	this.level = 1;
	this.stat_str = 10;
	this.stat_agi = 10;
	this.stat_int = 10;
	this.stat_end = 10;
	this.sp = 3;
	$.ajax({
		url:"exp_table.json",
		dataType:"json",
		type:"get",
		context:this,
		async:false,
		success:function(result)
		{
			this.lvlup_exp = result[this.level+1];
		}
	});
	this.exp_level = 0;
	this.exp_str = 0;
	this.exp_agi = 0;
	this.exp_int = 0;
	this.exp_end = 0;
	this.carry_weight = 100;
	this.cur_weight = 0;
	this.cur_location = 0;
	this.cur_state = 0;
	this.money = 0;
	this.ad += this.stat_str*1;
	this.carry_weight += this.stat_str*1;
	this.as += this.stat_agi*1;
	this.ms += this.stat_agi*1;
	this.mp += this.stat_int*1;
	this.hp += this.stat_end*2;
	this.max_hp = this.hp;
	this.max_mp = this.mp;
	this.equip_slot = {head:"none", u_body:"none", l_body:"none", a_hands:"none", foot:"none", w_hands:["none", "none"]};
	this.magic_effect = {};
	this.inventory = {};
	this.quest_state = {in_progress:[], complete:[]};
	this.base_hp = this.hp;
	this.base_mp = this.mp;
	this.base_ad = this.ad;
	this.base_as = this.as;
	this.base_ms = this.ms;
	this.base_armor = this.armor;
	this.base_resist = this.resist;
	this.base_str = this.stat_str;
	this.base_agi = this.stat_agi;
	this.base_int = this.stat_int;
	this.base_end = this.stat_end;
}
Player.prototype.levelUp = function(exp, num, stat)
{
	var stat = stat || 'level';
	if(stat=='level') 
	{
		this[stat]+=num;
		this.sp+=3*num;
	}
	else this["stat_"+stat]+=num;
	this["exp_"+stat] = exp;
	if(this == active_unit || this == player) 
	{
		reload(this, 'level');
		reload(this, 'sp');
	}
}
Player.prototype.gainExp = function(exp, stat)
{
	var stat = stat || 'level';
	this["exp_"+stat] += exp;
	$.ajax({
		url:"exp_table.json",
		dataType:"json",
		type:"get",
		context:this,
		success:function(result)
		{
			var i;
			for(i=0, total = result[i+2]; this["exp_"+stat] >= result[i+2]; this["exp_"+stat]-=result[i+2], i++){}
			this["lvlup_exp"] = result[i+2];
			if(this == active_unit || this == player) 
			{
				reload(this, 'exp_'+stat);
				reload(this, 'lvlup_exp');
			}
			this.levelUp(this["exp_"+stat], i, stat);
		}
	});
}
Player.prototype.moveLocation = function(id)
{
	$.ajax({
		url:"location.json",
		dataType:"json",
		type:"get",
		context:this,
		async:false,
		success:function(result)
		{
			if(result[id] === undefined) result[id] = {};
			if(result[id]['magic_effect'] === undefined) result[id]['magic_effect'] = {};
			var magic_effect = result[id]['magic_effect']['name'];
			if(magic_effect != "nothing") this.magic_effect[magic_effect] = result[id]['magic_effect']['data'];
			this.cur_location = result[id];
		}
	});
}
Npc.prototype = Character;
Npc.prototype.constructor = Npc;
Npc.prototype.createNpc = function(npc)
{
	this.type = "npc";
	this.subtype = "npc";
	this.relation=0;
	this.bat = 2.0;
	this.max_hp = Math.floor(Math.random()*50+100);
	this.max_mp = Math.floor(Math.random()*50+50);
	this.ad = Math.floor(Math.random()*20+30);
	this.as = Math.floor(Math.random()*20+30);
	this.ms = Math.floor(Math.random()*20+90);
	this.armor = Math.floor(Math.random()*10+20);
	this.resist = Math.floor(Math.random()*10+20);
	this.personality = Math.floor(Math.random()*3+1);
	this.stat_str = 0;
	this.stat_agi = 0;
	this.stat_int = 0;
	this.stat_end = 0;
	for(var val in npc)
	{
		if(val != "id" || val != "level" || val != "char_name" || val != "inventory" || val != "equip_slot" || val != "quest") this[val] = parseInt(npc[val]);
	}
	this.equip_slot = {head:"none", u_body:"none", l_body:"none", a_hands:"none", foot:"none", w_hands:["none", "none"]};
	this.magic_effect = {};
	this.inventory = {};
	this.quest = [];
	this.char_name = npc.char_name;
	if(npc === undefined) npc = {};
	this.ad += this.stat_str*1;
	this.as += this.stat_agi*1;
	this.ms += this.stat_agi*1;
	this.max_mp += this.stat_int*1;
	this.max_hp += this.stat_end*2;
	this.hp = this.max_hp;
	this.mp = this.max_mp;
	this.base_hp = this.max_hp;
	this.base_mp = this.max_mp;
	this.base_ad = this.ad;
	this.base_as = this.as;
	this.base_ms = this.ms;
	this.base_armor = this.armor;
	this.base_resist = this.resist;
	this.base_str = this.stat_str;
	this.base_agi = this.stat_agi;
	this.base_int = this.stat_int;
	this.base_end = this.stat_end;
	active_unit_inventory = {};
	if(npc['quest'] === undefined) npc['quest'] = [];
	for(var i = 0; i < npc['quest'].length; i++)
	{
		this.quest.push(npc['quest'][i]);
	}
	if(npc['inventory'] === undefined) npc['inventory'] = [];
	for(var i = 0; i < npc['inventory'].length; i++)
	{
		giveItem(this, npc['inventory'][i]);
	}
	if(cur_location_info['location_effect'] !== undefined) addMagicEffect(this, {name:cur_location_info['name'],effect_name:"location_"+cur_location_info['id'], duration:"passive", effect:cur_location_info['location_effect']});
	if(npc['equip_slot'] === undefined) npc['equip_slot'] = [];
	for(var i = 0; i < npc['equip_slot'].length; i++)
	{
		equipItem(this, npc['equip_slot'][i]);
	}
}
Npc.prototype.createMonster = function(npc)
{
	this.type = "npc";
	this.subtype = "monster";
	/*$.ajax({
	url:"defname.json",
	async:false,
	dataType:"json",
	type:"get",
	context:this,
	success:function(result)
	{
		this.npc_name = result['defname'][Math.floor(Math.random()*result['defname'].length)];
	}
	});*/
	this.relation=0;
	this.bat = 2.0;
	this.max_hp = Math.floor(Math.random()*50+100);
	this.max_mp = Math.floor(Math.random()*50+50);
	this.ad = Math.floor(Math.random()*20+30);
	this.as = Math.floor(Math.random()*20+30);
	this.ms = Math.floor(Math.random()*20+90);
	this.armor = Math.floor(Math.random()*10+20);
	this.resist = Math.floor(Math.random()*10+20);
	this.personality = Math.floor(Math.random()*3+1);
	this.stat_str = 0;
	this.stat_agi = 0;
	this.stat_int = 0;
	this.stat_end = 0;
	for(var val in npc)
	{
		if(val != "id" || val != "level" || val != "char_name" || val != "inventory" || val != "equip_slot") this[val] = parseInt(npc[val]);
	}
	this.equip_slot = {head:"none", u_body:"none", l_body:"none", a_hands:"none", foot:"none", w_hands:["none", "none"]};
	this.magic_effect = {};
	this.inventory = {};
	this.char_name = npc.char_name;
	if(npc === undefined) npc = {};
	var level = npc['level'];
	var random_level = Math.floor(Math.random()*(11)-5);
	this.level += Math.floor(Math.random()*random_level);
	if(this.level <= 0) this.level = 1;
	var sp = this.level*3;
	var limit_stat;
	if(sp < 4) limit_stat = 1;
	else limit_stat = Math.floor(sp/4);
	var random_limit = Math.floor(Math.random()*limit_stat);
	var stat = [];
	for(var i=0; i < 4; i++)
	{
		if(i == 3) stat[i] = sp;
		else stat[i] = Math.floor(Math.random()*(this.level+1)+1);
		if(sp-stat[i] < 0) stat[i] = 0;
		sp -= stat[i];
	}
	for(var i=0, tmp, a, b; i < 4; i++)
	{
		a = Math.floor(Math.random()*4);
		b = Math.floor(Math.random()*4);
		tmp = stat[a];
		stat[a] = stat[b];
		stat[b] = tmp;
	}
	this.stat_str += stat[0];
	this.stat_agi += stat[1];
	this.stat_int += stat[2];
	this.stat_end += stat[3];
	this.ad += this.stat_str*1;
	this.as += this.stat_agi*1;
	this.ms += this.stat_agi*1;
	this.max_mp += this.stat_int*1;
	this.max_hp += this.stat_end*2;
	this.hp = this.max_hp;
	this.mp = this.max_mp;
	this.base_hp = this.max_hp;
	this.base_mp = this.max_mp;
	this.base_ad = this.ad;
	this.base_as = this.as;
	this.base_ms = this.ms;
	this.base_armor = this.armor;
	this.base_resist = this.resist;
	this.base_str = this.stat_str;
	this.base_agi = this.stat_agi;
	this.base_int = this.stat_int;
	this.base_end = this.stat_end;
	active_unit_inventory = {};
	if(npc['inventory'] === undefined) npc['inventory'] = [];
	for(var i = 0; i < npc['inventory'].length; i++)
	{
		giveItem(this, npc['inventory'][i]);
	}
	addMagicEffect(this, {name:cur_location_info['name'],effect_name:"location_"+cur_location_info['id'], duration:"passive", effect:cur_location_info['location_effect']});
	if(npc['equip_slot'] === undefined) npc['equip_slot'] = [];
	for(var i = 0; i < npc['equip_slot'].length; i++)
	{
		equipItem(this, npc['equip_slot'][i]);
	}
}
$(".control_category li").hover(function(event)
{
	$(this).css("font-weight", "bold");
},function()
{
	if(!$(this).hasClass("active")) $(this).css("font-weight", "normal");
});
$(".control_category li").click(function(event)
{
	event.preventDefault();
	$(".control_category li").css("font-weight", "normal");
	$(".control_category li").removeClass("active");
	$(this).css("font-weight", "bold");
	$(this).addClass("active");
	$(".controlscreen").children().addClass("hide");
	$("."+$(this).attr("id")).removeClass("hide");
});
$(".control_category li#active_unit_inventory").click(function(event)
{
	event.preventDefault();
	if(active_unit.hp > 0)
	{
		$(".active_unit_inventory").addClass("hide");
	}
});
$(".location_category li").hover(function(event)
{
	$(this).css("font-weight", "bold");
},function()
{
	if(!$(this).hasClass("active")) $(this).css("font-weight", "normal");
});
$(".location_category li").click(function(event)
{
	event.preventDefault();
	$(".location_category li").css("font-weight", "normal");
	$(".location_category li").removeClass("active");
	$(this).css("font-weight", "bold");
	$(this).addClass("active");
	$(".location_list ul").empty();
	if($(this).attr("id") == "move_location")
	{
		for(var i = 0; i < move_locations.length; i++)
		{
			if(move_locations[i]['type'] == "town") $(".location_list > ul").append("<li id='"+move_locations[i]['id']+"' style='background-image:url(\"bg/"+move_locations[i]['bg']+"\");background-size:auto 100%'>"+move_locations[i]['name']+"</li>");
			else
			{
				var cur_level = parseInt(move_locations[i]['level'])
				var min_level = cur_level-3 < 1? 1:cur_level-3;
				var max_level = cur_level+3;
				var string_level = min_level+"~"+max_level;
				$(".location_list > ul").append("<li id='"+move_locations[i]['id']+"' style='background-image:url(\"bg/"+move_locations[i]['bg']+"\");background-size:auto 100%'>"+move_locations[i]['name']+" <span style='font-size:0.7em'>레벨대 : "+string_level+"</span></li>");
			}
		}
	}
	else
	{
		for(var i = 0; i < sub_locations.length; i++)
		{
			if(sub_locations[i]['type'] == "town") $(".location_list > ul").append("<li id='"+sub_locations[i]['id']+"' style='background-image:url(\"bg/"+sub_locations[i]['bg']+"\");background-size:auto 100%'>"+sub_locations[i]['name']+"</li>");
			else 
			{
				var cur_level = parseInt(move_locations[i]['level'])
				var min_level = cur_level-3 < 1? 1:cur_level-3;
				var max_level = cur_level+3;
				var string_level = min_level+"~"+max_level;
				$(".location_list > ul").append("<li id='"+sub_locations[i]['id']+"' style='background-image:url(\"bg/"+sub_locations[i]['bg']+"\");background-size:auto 100%'>"+sub_locations[i]['name']+" <span style='font-size:0.7em'>레벨대 : "+string_level+"</span></li>");
			}
		}
	}
	
});
var state = {dead:0, idle:1, encounter:2, combat:3, explore:4};
var magic_effect_id = {heal:1, stun:2, silence:3, binding:4, invisible:5, bleeding:6, resistance:7, debuff:8, buff:9, damage:10};
var magic_effect = {heal:{id:1, amount:0}};
var heal_effect = {id:1, amount:0};
var damage_effect = {id:10, amount:0};
var personality = {good:1, neutral:2, bad:3};
var player;
var followers = {};
var npcs = {};
var active_unit = {};
var npcs_info = [];
var monsters_info = [];
var player_location = 1;
var npc_all_dead = 0;
var follower_all_dead = 0;
var combat_players = [];
var combat_npcs = [];
var cur_location = 0;
var cur_location_info = {};
var cur_state = state['idle'];
var move_locations = [];
var sub_locations = [];
var main_location = {};
$('body').on("click", ".location_list li", function(event)
{
	event.preventDefault();
	moveLocation($(this).attr("id"));
	$(this).parent().parent().parent().addClass("hide");
});
$(".close").click(function(event)
{
	event.preventDefault();
	$(this).parent().parent().addClass("hide");
});
var reloadListAll = function(target)
{
	var target = target || "all";
	if(target == "all")
	{
		$('.npc_list > ul').empty();
		$('.follower_list > ul').empty();
		for(var i = 0; i < Object.keys(followers).length; i++)
		{
			$('.follower_list > ul').append("<li class='select_follower' id='player_"+i+"'>"+followers[i]['char_name']+" <span id='hp'>"+followers[i]['hp']+"</span>/<span id='max_hp'>"+followers[i]['max_hp']+"</span></li>");
		}
		for(var i = 0; i < Object.keys(npcs).length; i++)
		{
			$('.npc_list > ul').append("<li class='select_npc' id='npc_"+i+"'>"+npcs[i]['char_name']+" <span id='hp'>"+npcs[i]['hp']+"</span>/<span id='max_hp'>"+npcs[i]['max_hp']+"</span></li>");
		}
	}
	else if(target == "follower")
	{
		$('.follower_list ul').empty();
		for(var i = 0; i < Object.keys(followers).length; i++)
		{
			$('.follower_list > ul').append("<li class='select_follower' id='player_"+i+"'>"+followers[i]['char_name']+" <span id='hp'>"+followers[i]['hp']+"</span>/<span id='max_hp'>"+followers[i]['max_hp']+"</span></li>");
		}
	}
	else if(target == "npc")
	{
		$('.npc_list ul').empty();
		for(var i = 0; i < Object.keys(npcs).length; i++)
		{
			$('.npc_list > ul').append("<li class='select_npc' id='npc_"+i+"'>"+npcs[i]['char_name']+" <span id='hp'>"+npcs[i]['hp']+"</span>/<span id='max_hp'>"+npcs[i]['max_hp']+"</span></li></a>");
		}
	}
}
var reloadList = function(target)
{
	if(target.type == "follower")
	{
		for(var i = 0; i < Object.keys(followers).length; i++)
		{
			if(followers[i] == target)
			{
				$('.'+target.type+'_list li[id='+target.type+'_'+i+']>span[id=hp]').text(target.hp);
				$('.'+target.type+'_list li[id='+target.type+'_'+i+']>span[id=max_hp]').text(target.max_hp);
				break;
			}
		}
		return;
	}
	else if(target.type == "npc")
	{
		for(var i = 0; i < Object.keys(npcs).length; i++)
		{
			if(npcs[i] == target)
			{
				$('.'+target.type+'_list li[id='+target.type+'_'+i+']>span[id=hp]').text(target.hp);
				$('.'+target.type+'_list li[id='+target.type+'_'+i+']>span[id=max_hp]').text(target.max_hp);
				break;
			}
		}
		return;
	}
	else
	{
		$('.'+target.type+'_list li[id='+target.type+']>span[id=hp]').text(target.hp);
		$('.'+target.type+'_list li[id='+target.type+']>span[id=max_hp]').text(target.max_hp);
		return;
	}
}
var reload = function(target, stat)
{
	var stat = stat || 'all';
	if(stat == 'all')
	{
		if(target == player)
		{
			for(var name in target)
			{
				if(!target.hasOwnProperty(name)) continue;
				$(".player_info #"+name).text(target[name]);
			}
		}
		else
		{
			for(var name in target)
			{
				if(!target.hasOwnProperty(name)) continue;
				$(".npc_info #"+name).text(target[name]);
			}
		}
	}
	else
	{
		if(target == player) $(".player_info #"+stat).text(target[stat]);
		else $(".npc_info #"+stat).text(target[stat]);
	}
	if(target === undefined) target={};
	if(target == player)
	{
		if(target.sp <= 0) $(".player_info .inc_stat").addClass("hide");
		else $(".player_info .inc_stat").removeClass("hide");
	}
	else if(target.type == "follower")
	{
		if(target.sp <= 0) $(".npc_info .inc_stat").addClass("hide");
		else $(".npc_info .inc_stat").removeClass("hide");
	}
}
$('#attack').click(function(event)
{
	event.preventDefault();
	if(cur_state == state['encounter'])
	{
		//if(confirm("정말 공격하시겠습니까? 대상 : "+active_unit['char_name']) != 1) return;
		for(var i = 0; i < Object.keys(followers).length; i++)
		{
			combat_players.push(followers[i]);
		}
		combat_players.push(player);
		for(var i = 0; i < Object.keys(npcs).length; i++)
		{
			combat_npcs.push(npcs[i]);
		}
		progressCombat(combat_players, combat_npcs);
	}
	else if(cur_state == state['combat'])
	{
		$('#attack').attr("disabled", "disabled");
		if(player.as < 0) var as = 0;
		else var as = player.as;
		setTimeout(function()
		{
			$('#attack').removeAttr("disabled");
		}, player.bat/((100+as)*0.01)*1000);
		adjustMagicEffect(damage_effect, {amount:player.ad, type:"physical"});
		addMagicEffect(active_unit, {duration:1, effect:[damage_effect]});
		/*$(".frame").addClass("ani_player_attack");
		setTimeout(function()
		{
			$(".frame").removeClass("ani_player_attack");
		}, 400);*/
		reload(active_unit, 'hp');
		reloadList(active_unit);
		if(active_unit.hp <= 0)
		{
			for(var i = 0; i < Object.keys(combat_npcs).length; i++)
			{
				if(combat_npcs[i] === active_unit)
				{
					if(i >= Object.keys(combat_npcs).length-1)
					{
						npc_all_dead = 1;
					}
					gainExpPlayer(npcs[i].exp_gain);
					//gainExpPlayer(30);
					if(npc_all_dead != 1) $(".select_npc.active").next()[0].click();
					combat_npcs.splice(i, 1);
					break;
				}
			}
			if(npc_all_dead == 1)
			{
				cur_state = state['idle'];
			}
		}
	}
});
var gameOver = function()
{
	if(cur_state != state['dead'])
	{
		cur_state=state['dead'];
		console.log("Game Over!!!!");
	}
}
var combat_npc = function(id, enemy)
{
	var select_enemy = enemy[Math.floor(Math.random()*enemy.length)];
	if(select_enemy == player)
	{
		select_enemy = player;
	}
	for(var follower in followers)
	{
		if(select_enemy == followers[follower]) select_enemy = followers[follower];
	}
	if(select_enemy !== undefined && select_enemy.hp <= 0)
	{
		if(select_enemy == player) gameOver();
		for(var i = 0; i < enemy.length; i++)
		{
			if(enemy[i] === select_enemy)
			{
				enemy.splice(i, 1);
				break;
			}
		}
		select_enemy = enemy[Math.floor(Math.random()*enemy.length)];
	}
	if(!(cur_state==state['dead']) && !(npcs[id].hp <= 0))
	{
		adjustMagicEffect(damage_effect, {amount:npcs[id].ad, type:"physical"});
		addMagicEffect(select_enemy, {name:npcs[id]['char_name'], duration:1, effect:[damage_effect]});
		if(select_enemy == active_unit) reload(select_enemy, "hp");
		reloadList(select_enemy);
		if(npcs[id].as < 0) var as = 0;
		else var as = npcs[id].as;
		setTimeout(combat_npc, npcs[id].bat/((100+as)*0.01)*1000, id, enemy);
	}
}
var combat_follower = function(id, enemy)
{
	var select_enemy = enemy[Math.floor(Math.random()*enemy.length)];
	for(var npc in npcs)
	{
		if(select_enemy == npcs[npc]) select_enemy = npcs[npc];
	}
	if(select_enemy !== undefined && select_enemy.hp <= 0 && npc_all_dead != 1)
	{
		for(var i = 0; i < enemy.length; i++)
		{
			if(enemy[i] === select_enemy)
			{
				if(i >= enemy.length-1)
				{
					npc_all_dead = 1;
				}
				//gainExpPlayer(enemy[i].exp_gain);
				gainExpPlayer(30);
				enemy.splice(i, 1);
				break;
			}
		}
		select_enemy = enemy[Math.floor(Math.random()*enemy.length)];
	}
	if(!(cur_state==state['dead']) && !(followers[id].hp <= 0) && !(npc_all_dead == 1))
	{
		adjustMagicEffect(damage_effect, {amount:followers[id].ad, type:"physical"});
		addMagicEffect(select_enemy, {name:followers[id]['char_name'], duration:1, effect:[damage_effect]});
		if(select_enemy == active_unit) reload(select_enemy, "hp");
		reloadList(select_enemy);
		if(followers[id].as < 0) var as = 0;
		else var as = followers[id].as;
		setTimeout(combat_follower, followers[id].bat/((100+as)*0.01)*1000, id, enemy);
	}
}
var progressCombat = function(combat_players, combat_npcs)
{
	cur_state = state['combat'];
	
	for(var npc in npcs)
	{
		npcs[npc]['attack_cycle'] = setTimeout(combat_npc, npcs[npc].bat/((100+npcs[npc].as)*0.01)*1000, npc, combat_players);
	}
	for(var follower in followers)
	{
		followers[follower]['attack_cycle'] = setTimeout(combat_follower, followers[follower].bat/((100+followers[follower].as)*0.01)*1000, follower, combat_npcs);
	}
}
var gainExpPlayer = function(exp)
{
	if(followers === undefined) followers = {};
	var increase_exp = Object.keys(followers).length * 0.15;
	var gain_exp = Math.floor((exp*(1+increase_exp))/(Object.keys(followers).length+1));
	for(var i = 0; i < Object.keys(followers).length; i++)
	{
		followers[i].gainExp(gain_exp);
		//if(followers[i] == active_unit) reload(followers[i]);
	}
	player.gainExp(gain_exp);
	//reload(player);
}
var img = new Image();
var convertType = function(npc)
{
	const temp = new Npc();
	temp.createRandom();
	for(var val in npc)
	{
		if(!temp.hasOwnProperty(val)) continue;
		temp[val] = npc[val];
	}
	var temp_name;
	if(confirm("정말 동료로 영입하시겠습니까?") == false)
	{
		return;
	}
	if(temp_name = prompt("동료의 별명을 입력해주세요. 입력하지 않거나 취소를 누르면 원래 이름으로 등록됩니다.") == "" || temp_name == null)
	{
		temp['char_name'] = npc['char_name'];
	}
	else temp['char_name'] = temp_name;
	temp['type'] = "follower";
	temp['exp_level'] = 0;
	temp['sp'] = 0;
	addCharList(temp);
	delCharList(npc);
	$('.select_npc.active').remove();
	if(!($(".npc_list > ul").children()[0] === undefined)) $(".select_npc")[0].click();
	else cur_state = state['idle'];
	//$('.player_list > ul').append("<a href='#' class='select_player'><li id='player_"+id+"'>"+temp['char_name']+" <span id='hp'>"+temp['hp']+"</span>/<span id='max_hp'>"+temp['max_hp']+"</span></li></a>");
}
var addCharList = function(target)
{
	var id;
	if(target === undefined) target = {};
	if(target.type == "follower")
	{
		id = Object.keys(followers).length;
		followers[id] = target;
	}
	else
	{
		id = Object.keys(npcs).length;
		npcs[id] = target;
	}
	$('.'+target.type+'_list > ul').append("<li class='select_"+target.type+"' id='"+target.type+"_"+id+"' style='background:#fff'>"+target['char_name']+" <span id='hp'>"+target['hp']+"</span>/<span id='max_hp'>"+target['max_hp']+"</span></li>");
}
var delCharList = function(target)
{
	if(target.type == "follower")
	{
		for(var i = 0; i < Object.keys(followers).length; i++)
		{
			if(followers[i] == target)
			{
				delete followers[i];
				break;
			}
		}
	}
	else
	{
		for(var i = 0; i < Object.keys(npcs).length; i++)
		{
			if(npcs[i] == target)
			{
				delete npcs[i];
				break;
			}
		}
	}
}
var createMonster = function(num)
{
	for(var i=0, npc, select_npc; i < num; i++)
	{
		npc=new Npc();
		select_npc = monsters_info[Math.floor(Math.random()*monsters_info.length)];
		npc.createMonster(select_npc);
		addCharList(npc);
	}
}
var createNpc = function(group)
{
	for(var i in npcs_info[group]['npcs'])
	{
		var npc=new Npc();
		select_npc = npcs_info[group]['npcs'][i];
		npc.createNpc(select_npc);
		addCharList(npc);
	}
}
$('.player_info .inc_stat > input[type=button]').click(function(event)
{
	event.preventDefault();
	var chg_str = player['base_str'];
	var chg_agi = player['base_agi'];
	var chg_int = player['base_int'];
	var chg_end = player['base_end'];
	var item_id = [];
	for(var slot in player.equip_slot)
	{
		if(slot == "w_hands")
		{
			if(player.equip_slot[slot][0] != "none")
			{
				item_id.push(player.equip_slot[slot][0]);
				equipItem(player, player.equip_slot[slot][0]);
			}
			if(player.equip_slot[slot][1] != "none")
			{
				item_id.push(player.equip_slot[slot][1]);
				equipItem(player, player.equip_slot[slot][1]);
			}
		}
		else if(player.equip_slot[slot] != "none")
		{
			item_id.push(player.equip_slot[slot]);
			equipItem(player, player.equip_slot[slot]);
		}
	}
	player["base_"+$(this).attr('id').split("_")[1]] += 1;
	player[$(this).attr('id')] += 1;
	player.sp--;
	if($(this).attr('id') == "stat_str")
	{
		player.base_ad += 1;
		player.ad += 1;
		player.carry_weight += 1;
		reload(player, "ad");
		reload(player, "carry_weight");
	}
	else if($(this).attr('id') == "stat_agi")
	{
		player.base_as += 1;
		player.base_ms += 1;
		player.as += 1;
		player.ms += 1;
		reload(player, "as");
		reload(player, "ms");
	}
	else if($(this).attr('id') == "stat_int")
	{
		player.base_mp += 1;
		player.max_mp += 1;
		reload(player, "max_mp");
	}
	else
	{
		player.base_hp += 2;
		player.max_hp += 2;
		reload(player, "max_hp");
	}
	if(player.sp <= 0) $('.inc_stat').addClass("hide");
	reload(player, $(this).attr('id'));
	reload(player, "sp");
	for(var i = 0; i < item_id.length; i++)
	{
		equipItem(player, item_id[i]);
	}
});
$('.npc_info .inc_stat > input[type=button]').click(function(event)
{
	event.preventDefault();
	var chg_str = active_unit['base_str'];
	var chg_agi = active_unit['base_agi'];
	var chg_int = active_unit['base_int'];
	var chg_end = active_unit['base_end'];
	var item_id = [];
	for(var slot in active_unit.equip_slot)
	{
		if(slot == "w_hands")
		{
			if(active_unit.equip_slot[slot][0] != "none")
			{
				item_id.push(active_unit.equip_slot[slot][0]);
				equipItem(active_unit, active_unit.equip_slot[slot][0]);
			}
			if(active_unit.equip_slot[slot][1] != "none")
			{
				item_id.push(active_unit.equip_slot[slot][1]);
				equipItem(active_unit, active_unit.equip_slot[slot][1]);
			}
		}
		else if(active_unit.equip_slot[slot] != "none")
		{
			item_id.push(active_unit.equip_slot[slot]);
			equipItem(active_unit, active_unit.equip_slot[slot]);
		}
	}
	active_unit["base_"+$(this).attr('id').split("_")[1]] += 1;
	active_unit[$(this).attr('id')] += 1;
	active_unit.sp--;
	if($(this).attr('id') == "stat_str")
	{
		active_unit.base_ad += 1;
		active_unit.ad += 1;
		active_unit.carry_weight += 1;
		reload(active_unit, "ad");
		reload(active_unit, "carry_weight");
	}
	else if($(this).attr('id') == "stat_agi")
	{
		active_unit.base_as += 1;
		active_unit.base_ms += 1;
		active_unit.as += 1;
		active_unit.ms += 1;
		reload(active_unit, "as");
		reload(active_unit, "ms");
	}
	else if($(this).attr('id') == "stat_int")
	{
		active_unit.base_mp += 1;
		active_unit.max_mp += 1;
		reload(active_unit, "max_mp");
	}
	else
	{
		active_unit.base_hp += 2;
		active_unit.max_hp += 2;
		reload(active_unit, "max_hp");
	}
	if(active_unit.sp <= 0) $('.inc_stat').addClass("hide");
	reload(active_unit, $(this).attr('id'));
	reload(active_unit, "sp");
	for(var i = 0; i < item_id.length; i++)
	{
		equipItem(active_unit, item_id[i]);
	}
});
$('body').on('click', '.select_npc', function(event)
{
	event.preventDefault();
	active_unit = npcs[$(this).attr("id").split("_")[1]];
	finishDialogue();
	$("#attack").removeClass("hide");
	if(active_unit.subtype != "monster") $("#dialogue").removeClass("hide");
	$('.select_follower').removeClass("active");
	$('.select_npc').removeClass("active");
	$(this).addClass("active");
	reloadEffectlist(active_unit);
	if(active_unit.hp <= 0) reloadInventory(active_unit);
	reload(active_unit);
});
$('body').on('click', '.select_follower', function(event)
{
	event.preventDefault();
	finishDialogue();
	$('.select_follower').removeClass("active");
	$('.select_npc').removeClass("active");
	$(this).addClass("active");
	active_unit = followers[$(this).attr("id").split("_")[1]];
	reloadEffectlist(active_unit);
	reloadInventory(active_unit);
	reload(active_unit);
});
$('#save').click(function(event)
{
	event.preventDefault();
	var save_data = {};
	//localStorage.save_data = "";
	if(save_data['follower'] === undefined) save_data['follower'] ={};
	if(save_data['npc'] === undefined) save_data['npc'] ={};
	for(var i= 0; i < Object.keys(followers).length; i++)
	{
		for(var data in followers[i])
		{
			if(!followers[i].hasOwnProperty(data)) continue;
			if(followers[i] === undefined) followers[i] = {};
			if(save_data['follower'][i] === undefined) save_data['follower'][i] = {};
			save_data['follower'][i][data] = followers[i][data];
		}
	}
	for(var i= 0; i < Object.keys(npcs).length; i++)
	{
		for(var data in npcs[i])
		{
			if(!npcs[i].hasOwnProperty(data)) continue;
			if(npcs[i] === undefined) npcs[i] = {};
			if(save_data['npc'][i] === undefined) save_data['npc'][i] = {};
			save_data['npc'][i][data] = npcs[i][data];
		}
	}
	if(save_data['player'] === undefined) save_data['player'] ={};
	for(var data in player)
	{
		if(!player.hasOwnProperty(data)) continue;
		save_data['player'][data] = player[data];
	}
	save_data['cur_location'] = cur_location;
	save_data['cur_state'] = cur_state;
	localStorage.save_data = btoa(escape(JSON.stringify(save_data)));
});
$('#load').click(function(event)
{
	event.preventDefault();
	var load_data = JSON.parse(unescape(atob(localStorage.save_data)));
	cur_location = load_data['cur_location'];
	cur_state = load_data['cur_state'];
	moveLocation(cur_location);
	for(var stat in load_data['player'])
	{
		player[stat] = load_data['player'][stat];
	}
	reload(player);
	for(var i = Object.keys(followers).length-1; i >= 0; i--)
	{
		delCharList(followers[i]);
	}
	reloadListAll("follower");
	for(var follower in load_data['follower'])
	{
		const temp = new Npc();
		temp.createRandom();
		for(var val in load_data['follower'][follower])
		{
			if(!load_data['follower'][follower].hasOwnProperty(val)) continue;
			temp[val] = load_data['follower'][follower][val];
		}
		temp['char_name'] = load_data['follower'][follower]['char_name'];
		temp['type'] = "follower";
		temp['exp_level'] = load_data['follower'][follower]['exp_level'];
		temp['sp'] = load_data['follower'][follower]['sp'];
		addCharList(temp);
	}
	for(var i = Object.keys(npcs).length-1; i >= 0; i--)
	{
		delCharList(npcs[i]);
	}
	reloadListAll("npc");
	for(var npc in load_data['npc'])
	{
		const temp = new Npc();
		temp.createRandom();
		for(var val in load_data['npc'][npc])
		{
			if(!load_data['npc'][npc].hasOwnProperty(val)) continue;
			temp[val] = load_data['npc'][npc][val];
		}
		temp['char_name'] =load_data['npc'][npc]['char_name'];
		addCharList(temp);
	}
	//reloadInventory(active_unit);
});
$('#explore').click(function(event)
{
	event.preventDefault();
	if(cur_state == state['idle'])
	{
		if(player_location++ >= 10) $("#move_location").removeClass("hide");
		cur_state = state['explore'];
		$('.bgimg').addClass("ani_bg");
		setTimeout(function()
		{
			var bg_pos_string = $('.bgimg').css("background-position");
			var bg_pos = bg_pos_string.split("px");
			img.src = $(".bgimg").css("background-image").split("\"")[1];
			var bg_width = img.width*($(".bgimg").height()/img.height);
			$('.bgimg').removeClass("ani_bg");
			$('.bgimg').css("background-position", bg_pos_string);
			if(parseInt(bg_pos[0])<-500)
			{
				var pos_x =parseInt(bg_pos[0])+bg_width;
				var dest_x = pos_x-500;
				$('#movebg').html("@keyframes movebg{0%{background-position:"+pos_x+"px}100%{background-position:"+bg_pos[0]+"px;}}");
			}
			else
			{
				var pos_x =parseInt(bg_pos[0])-500;
				$('#movebg').html("@keyframes movebg{0%{background-position:"+bg_pos[0]+"px}100%{background-position:"+pos_x+"px;}}");
			}
			var encounter_chance = Math.floor(Math.random()*1+1);
			npcs = [];
			$('.npc_list > ul').empty();
			if(encounter_chance == 1)
			{
				createMonster(1);
				cur_state = state['encounter'];
				$(".select_npc")[0].click();
			}
			else if(encounter_chance == 2)
			{
				createMonster(1);
				cur_state = state['encounter'];
				$(".select_npc")[0].click();
			}
			else if(encounter_chance == 3)
			{
				createMonster(2);
				cur_state = state['encounter'];
				$(".select_npc")[0].click();
			}
			else cur_state = state['idle'];
		}, Math.floor(Math.random()*4+1));
	}
});
$("#main_location").click(function(event)
{
	moveLocation(main_location['id']);
	$(this).addClass("hide");
});
var moveLocation = function(id)
{
	var npc_id = [];
	var monster_id = [];
	var location;
	var check_sub = 0;
	npcs_info = [];
	monsters_info = [];
	move_locations = [];
	//sub_locations = [];
	//main_location = {};
	$("#attack").addClass("hide");
	$("#dialogue").addClass("hide");
	for(var i = Object.keys(npcs).length-1; i >= 0; i--)
	{
		delCharList(npcs[i]);
	}
	for(var j = 0; j < Object.keys(followers).length; j++)
	{
		delMagicEffect(followers[j], "location_"+cur_location);
	}
	delMagicEffect(player, "location_"+cur_location);
	
	reloadListAll("npc");
	$.ajax({
		url:"location.json",
		dataType:"json",
		type:"post",
		async:false,
		success:function(result)
		{
			cur_location_info = location = result[id];
			var location_effects = location['location_effect'];
			if(location_effects !== undefined)
			{
				for(var j = 0; j < Object.keys(followers).length; j++)
				{
					addMagicEffect(followers[j], {name:location['name'],effect_name:"location_"+id, duration:"passive", effect:location_effects});
				}
				addMagicEffect(player, {name:location['name'],effect_name:"location_"+id, duration:"passive", effect:location_effects});
			}
			cur_location = location['id'];
			for(var i = 0; i < sub_locations.length; i++)
			{
				if(location['id'] == sub_locations[i]['id'])
				{
					$("#main_location").removeClass("hide");
					check_sub = 1;
				}
			}
			sub_locations = [];
			if(check_sub != 1) main_location = location;
			if(location['sub_location'] === undefined) location['sub_location'] = {};
			for(var i = 0; i < location['sub_location'].length; i++)
			{
				sub_locations.push(result[location['sub_location'][i]]);
			}
			if(location['move_location'] === undefined) location['move_location'] = {};
			for(var i = 0; i < location['move_location'].length; i++)
			{
				move_locations.push(result[location['move_location'][i]]);
			}
			npc_id = location['encounter_id']['npc'];
			monster_id = location['encounter_id']['monster'];
		}
	});
	$.ajax({
		url:"npc.json",
		dataType:"json",
		type:"post",
		async:false,
		success:function(result)
		{
			if(npc_id === undefined) npc_id = [];
			for(var i = 0; i < npc_id.length ; i++)
			{
				npcs_info.push(result[npc_id[i]]);
			}
		}	
	});
	$.ajax({
		url:"monster.json",
		dataType:"json",
		type:"post",
		async:false,
		success:function(result)
		{
			if(monster_id === undefined) monster_id = [];
			for(var i = 0; i < monster_id.length ; i++)
			{
				if(result[monster_id[i]] === undefined);
				else monsters_info.push(result[monster_id[i]]);
			}
		}	
	});
	if(location['type'] == "field")
	{
		player_location = 1;
		$("#explore").removeClass("hide");
		$("#visit").addClass("hide");
		//$("#move_location").addClass("hide");
	}
	else if(location['type'] == "town")
	{
		$("#explore").addClass("hide");
		$("#visit").removeClass("hide");
		$("#move_location").removeClass("hide");
	}
	$(".bgimg").css("background-image", "url('bg/"+location['bg']+"')");
	$(".location_name").html(location['name']);
	$(".visit_list > ul").empty();
	for(var i = 0; i < npcs_info.length; i++)
	{
		$(".visit_list > ul").append("<li class='select_visit_npc' id='npc_"+i+"'><img src='npc/"+npcs_info[i]['npcs'][0]['image']+"'><div class='npc_name'>"+npcs_info[i]['group_name']+"</div></li>");
	}
}
$("#move_location").click(function(event)
{
	event.preventDefault();
	$(".location_list_window").removeClass("hide");
	$(".location_list").removeClass("hide");
	$(".location_list > ul").empty();
	$(".location_category li")[0].click();
});
var addMagicEffect = function(target, effect)
{
	var effect_name;
	if(effect === undefined) effect = {};
	effect_name = effect['effect_name'];
	if(target.magic_effect[effect_name] !== undefined)
	{
		for(var i = 1, effect_name = effect['name'] + "_"+i; target.magic_effect[effect_name] !== undefined; i++)
		{
			effect_name = effect['name'] + "_"+i;
		}
		if(target.magic_effect[effect_name] === undefined) target.magic_effect[effect_name] = {};
		target.magic_effect[effect_name]['effect_name'] = effect_name;
	}
	if(effect['name'] === undefined) effect['name'] = "";
	if(effect['duration'] != 1) addEffectlist(target, effect);
	for(var a = 0; a < effect['effect'].length; a++)
	{
		if(effect['duration'] == 1)
		{
			if(effect['effect'][a]['id'] == magic_effect_id['heal'])
			{
				target.hp+=effect['effect'][a]['amount'];
				reload(target);
				return;
			}
			else if(effect['effect'][a]['id'] == magic_effect_id['damage'])
			{
				var damage;
				if(effect['effect'][a]['type'] == "physical")
				{
					if(target.armor >= 0)
						damage = Math.round(effect['effect'][a]['amount'] * (100/(100+target.armor)));
					else
						damage = Math.round(effect['effect'][a]['amount'] * (2-100/(100-target.armor)));
				}
				else
				{
					if(target.resist >= 0)
						damage = Math.round(effect['effect'][a]['amount'] * (100/(100+target.resist)));
					else
						damage = Math.round(effect['effect'][a]['amount'] * (2-100/(100-target.resist)));
				}
				if(damage < 0) damage = 0;
				target.hp-=damage;
				reload(target);
				if(target == player && damage > 0)
				{
					$(".front").addClass("ani_npc_attack");
					setTimeout(function()
					{
						$(".front").removeClass("ani_npc_attack");
					}, 300);
				}
				if(target.hp <= 0)
				{
					target.hp = 0;
					for(var effect in target.magic_effect)
					{
						clearInterval(target.magic_effect[effect]['cycle']);
					}
					if(target == active_unit) $(".npc_effect > ul").empty();
				}
				return;
			}
		}
		if(target.magic_effect === undefined) target.magic_effect = {};
		
		if(target.magic_effect[effect_name] === undefined) target.magic_effect[effect_name] = {};
		if(target.magic_effect[effect_name]['effect'] === undefined) target.magic_effect[effect_name]['effect'] = [];
		if(target.magic_effect[effect_name]['effect'][a] === undefined) target.magic_effect[effect_name]['effect'][a] = {};
		for(var val in effect['effect'][a])
		{
			target.magic_effect[effect_name]['effect'][a][val] = effect['effect'][a][val];
		}
		target.magic_effect[effect_name]['effect_name'] = effect_name;
		target.magic_effect[effect_name]['name'] = effect['name'];
		target.magic_effect[effect_name]['duration'] = effect['duration'];
		if(target.magic_effect[effect_name]['effect'][a]['id'] == magic_effect_id['heal'])
		{
			if(target.hp+target.magic_effect[effect_name]['effect'][a]['amount'] > target.max_hp) target.hp=target.max_hp;
			else target.hp+=target.magic_effect[effect_name]['effect'][a]['amount'];
			reload(target, 'hp');
			if(effect['duration'] != "passive") 
			{
				target.magic_effect[effect_name]['cycle'] = setInterval(function()
				{
					if(--target.magic_effect[effect_name]['duration'] <= 0)
					{
						clearInterval(target.magic_effect[effect_name]['cycle']);
						for(var i = 0; i < target.magic_effect[effect_name].length; i++)
						{
							if(target == player) $(".player_effect > ul > #"+effect_name).remove();
							else $(".npc_effect > ul > #"+effect_name).remove();
						}
						delete target.magic_effect[effect_name];
					}
					else
					{
						if(target.hp+target.magic_effect[effect_name][i]['amount'] > target.max_hp) target.hp=target.max_hp;
						else target.hp+=target.magic_effect[effect_name][i]['amount'];
						if(target == player) $(".player_effect > ul > #"+effect_name+" #duration").html(target.magic_effect[effect_name]['duration']);
						else $(".npc_effect > ul > #"+effect_name+" #duration").html(target.magic_effect[effect_name]['duration']);
						reload(target, 'hp');
					}
				}, 1000);
			}
		}
		else if(target.magic_effect[effect_name]['effect'][a]['id'] == magic_effect_id['damage'])
		{
			var damage;
			if(target.magic_effect[effect_name]['effect'][a]['type'] == "physical")
			{
				if(target.armor >= 0)
					damage = Math.round(target.magic_effect[effect_name]['effect'][a]['amount'] * (100/(100+target.armor)));
				else
					damage = Math.round(target.magic_effect[effect_name]['effect'][a]['amount'] * (2-100/(100-target.armor)));
			}
			else
			{
				if(target.resist >= 0)
					damage = Math.round(target.magic_effect[effect_name]['effect'][a]['amount'] * (100/(100+target.resist)));
				else
					damage = Math.round(target.magic_effect[effect_name]['effect'][a]['amount'] * (2-100/(100-target.resist)));
			}
			
			if(damage < 0) damage = 0;
			if(target.hp-damage < 0) target.hp=0;
			else target.hp-=damage;
			reload(target, 'hp');
			if(effect['duration'] != "passive")
			{
				target.magic_effect[effect_name]['cycle'] = setInterval(function()
				{
					if(--target.magic_effect[effect_name]['duration'] <= 0)
					{
						clearInterval(target.magic_effect[effect_name]['cycle']);
						for(var i = 0; i < target.magic_effect[effect_name].length; i++)
						{
							if(target == player) $(".player_effect > ul > #"+effect_name).remove();
							else $(".npc_effect > ul > #"+effect_name).remove();
						}
						delete target.magic_effect[effect_name];
					}
					else
					{
						if(target.hp-damage < 0) target.hp=0;
						else target.hp-=damage;
						if(target == player)
						{
							$(".front").addClass("ani_npc_attack");
							setTimeout(function()
							{
								$(".front").removeClass("ani_npc_attack");
							}, 300);
						}
						if(target == player) $(".player_effect > ul > #"+effect_name+" #duration").html(target.magic_effect[effect_name]['duration']);
						else $(".npc_effect > ul > #"+effect_name+" #duration").html(target.magic_effect[effect_name]['duration']);
						reload(target, 'hp');
					}
				}, 1000);
			}
		}
		else if(target.magic_effect[effect_name]['effect'][a]['id'] == magic_effect_id['buff'])
		{
			var buff = target.magic_effect[effect_name]['effect'][a]['type'];
			var base_name;
			if(target.magic_effect[effect_name]['effect'][a]['intensity_type'] == "value")
			{
				target[target.magic_effect[effect_name]['effect'][a]['type']] += parseInt(target.magic_effect[effect_name]['effect'][a]['intensity']);
			}
			else
			{
				base_name = target.magic_effect[effect_name]['effect'][a]['type'].split("_")[0] == "stat"?target.magic_effect[effect_name]['effect'][a]['type'].split("_")[1] : target.magic_effect[effect_name]['effect'][a]['type'];
				target[target.magic_effect[effect_name]['effect'][a]['type']] += (parseInt(target.magic_effect[effect_name]['effect'][a]['intensity'])*0.01)*target["base_"+base_name];
			}
			if(buff == "stat_str")
			{
				if(target.magic_effect[effect_name]['effect'][a]['intensity_type'] == "value")
				{
					target.ad += parseInt(target.magic_effect[effect_name]['effect'][a]['intensity']);
					target.carry_weight += parseInt(target.magic_effect[effect_name]['effect'][a]['intensity']);
				}
				else
				{
					target.ad += (parseInt(target.magic_effect[effect_name]['effect'][a]['intensity'])*0.01)*target["base_"+base_name];
					target.carry_weight += (parseInt(target.magic_effect[effect_name]['effect'][a]['intensity'])*0.01)*target["base_"+base_name];
				}
			}
			else if(buff == "stat_agi")
			{
				if(target.magic_effect[effect_name]['effect'][a]['intensity_type'] == "value")
				{
					target.as+= parseInt(target.magic_effect[effect_name]['effect'][a]['intensity']);
					target.ms += parseInt(target.magic_effect[effect_name]['effect'][a]['intensity']);
				}
				else
				{
					target.as += (parseInt(target.magic_effect[effect_name]['effect'][a]['intensity'])*0.01)*target["base_"+base_name];
					target.ms += (parseInt(target.magic_effect[effect_name]['effect'][a]['intensity'])*0.01)*target["base_"+base_name];
				}
			}
			else if(buff == "stat_int")
			{
				if(target.magic_effect[effect_name]['effect'][a]['intensity_type'] == "value")
				{
					target.max_mp += parseInt(target.magic_effect[effect_name]['effect'][a]['intensity']);
				}
				else
				{
					target.max_mp += (parseInt(target.magic_effect[effect_name]['effect'][a]['intensity'])*0.01)*target["base_"+base_name];
				}
			}
			else if(buff == "stat_end")
			{
				if(target.magic_effect[effect_name]['effect'][a]['intensity_type'] == "value")
				{
					target.max_hp += parseInt(target.magic_effect[effect_name]['effect'][a]['intensity'])*2;
				}
				else
				{
					target.max_hp += ((parseInt(target.magic_effect[effect_name]['effect'][a]['intensity'])*0.01)*target["base_"+base_name])*2;
				}
			}
			reload(target);
			if(effect['duration'] != "passive" && a == 0)
			{
				target.magic_effect[effect_name]['cycle'] = setInterval(function()
				{
					if(--target.magic_effect[effect_name]['duration'] <= 0)
					{
						clearInterval(target.magic_effect[effect_name]['cycle']);
						for(var i = 0; i < target.magic_effect[effect_name]['effect'].length; i++)
						{
							if(target.magic_effect[effect_name]['effect'][i]['intensity_type'] == "value")
							{
								target[target.magic_effect[effect_name]['effect'][i]['type']] -= parseInt(target.magic_effect[effect_name]['effect'][i]['intensity']);
							}
							else
							{
								target[target.magic_effect[effect_name]['effect'][i]['type']] -= (parseInt(target.magic_effect[effect_name]['effect'][i]['intensity'])*0.01)*target["base_"+base_name];
							}
							reload(target, target.magic_effect[effect_name]['effect'][i]['type']);
							if(target == player) $(".player_effect > ul > #"+effect_name).remove();
							else $(".npc_effect > ul > #"+effect_name).remove();
						}
						delete target.magic_effect[effect_name];
					}
					else
					{
						if(target == player) $(".player_effect > ul > #"+effect_name+" #duration").html(target.magic_effect[effect_name]['duration']);
						else $(".npc_effect > ul > #"+effect_name+" #duration").html(target.magic_effect[effect_name]['duration']);
					}
				}, 1000);
			}
		}
		else if(target.magic_effect[effect_name]['effect'][a]['id'] == magic_effect_id['debuff'])
		{
			var debuff = target.magic_effect[effect_name]['effect'][a]['type'];
			var base_name;
			if(target.magic_effect[effect_name]['effect'][a]['intensity_type'] == "value")
			{
				target[target.magic_effect[effect_name]['effect'][a]['type']] -= parseInt(target.magic_effect[effect_name]['effect'][a]['intensity']);
			}
			else
			{
				base_name = target.magic_effect[effect_name]['effect'][a]['type'].split("_")[0] == "stat"?target.magic_effect[effect_name]['effect'][a]['type'].split("_")[1] : target.magic_effect[effect_name]['effect'][a]['type'];
				target[target.magic_effect[effect_name]['effect'][a]['type']] -= (parseInt(target.magic_effect[effect_name]['effect'][a]['intensity'])*0.01)*target["base_"+base_name];
			}
			if(debuff == "stat_str")
			{
				if(target.magic_effect[effect_name]['effect'][a]['intensity_type'] == "value")
				{
					target.ad -= parseInt(target.magic_effect[effect_name]['effect'][a]['intensity']);
					target.carry_weight -= parseInt(target.magic_effect[effect_name]['effect'][a]['intensity']);
				}
				else
				{
					target.ad -= (parseInt(target.magic_effect[effect_name]['effect'][a]['intensity'])*0.01)*target["base_"+base_name];
					target.carry_weight -= (parseInt(target.magic_effect[effect_name]['effect'][a]['intensity'])*0.01)*target["base_"+base_name];
				}
			}
			else if(debuff == "stat_agi")
			{
				if(target.magic_effect[effect_name]['effect'][a]['intensity_type'] == "value")
				{
					target.as-= parseInt(target.magic_effect[effect_name]['effect'][a]['intensity']);
					target.ms -= parseInt(target.magic_effect[effect_name]['effect'][a]['intensity']);
				}
				else
				{
					target.as -= (parseInt(target.magic_effect[effect_name]['effect'][a]['intensity'])*0.01)*target["base_"+base_name];
					target.ms -= (parseInt(target.magic_effect[effect_name]['effect'][a]['intensity'])*0.01)*target["base_"+base_name];
				}
			}
			else if(debuff == "stat_int")
			{
				if(target.magic_effect[effect_name]['effect'][a]['intensity_type'] == "value")
				{
					target.max_mp -= parseInt(target.magic_effect[effect_name]['effect'][a]['intensity']);
				}
				else
				{
					target.max_mp -= (parseInt(target.magic_effect[effect_name]['effect'][a]['intensity'])*0.01)*target["base_"+base_name];
				}
			}
			else if(debuff == "stat_end")
			{
				if(target.magic_effect[effect_name]['effect'][a]['intensity_type'] == "value")
				{
					target.max_hp -= parseInt(target.magic_effect[effect_name]['effect'][a]['intensity'])*2;
				}
				else
				{
					target.max_hp -= ((parseInt(target.magic_effect[effect_name]['effect'][a]['intensity'])*0.01)*target["base_"+base_name])*2;
				}
			}
			reload(target);
			if(effect['duration'] != "passive")
			{
				const i = a;
				target.magic_effect[effect_name][i]['cycle'] = setInterval(function()
				{
					if(i == target.magic_effect[effect_name].length-1) target.magic_effect[effect_name]['duration']--;
					if(target.magic_effect[effect_name]['duration'] <= 0)
					{
						clearInterval(target.magic_effect[effect_name][i]['cycle']);
						for(var i = 0; i < target.magic_effect[effect_name].length; i++)
						{
							if(target.magic_effect[effect_name][i]['intensity_type'] == "value")
							{
								target[target.magic_effect[effect_name][i]['type']] += parseInt(target.magic_effect[effect_name][i]['intensity']);
							}
							else
							{
								target[target.magic_effect[effect_name][i]['type']] += (parseInt(target.magic_effect[effect_name][i]['intensity'])*0.01)*target["base_"+base_name];
							}
							reload(target, target.magic_effect[effect_name][i]['type']);
							if(target == player) $(".player_effect > ul > #"+effect_name).remove();
							else $(".npc_effect > ul > #"+effect_name).remove();
						}
						delete target.magic_effect[effect_name];
					}
					else
					{
						if(target == player) $(".player_effect > ul > #"+effect_name+" #duration").html(target.magic_effect[effect_name]['duration']);
						else $(".npc_effect > ul > #"+effect_name+" #duration").html(target.magic_effect[effect_name]['duration']);
					}
				}, 1000);
			}
		}
	}
}
var delMagicEffect = function(target, effect_id)
{
	var base_name;
	for(var effect in target.magic_effect)
	{
		if(effect == effect_id)
		{
			for(var i = 0; i < target.magic_effect[effect]['effect'].length; i++)
			{
				if(target.magic_effect[effect]['effect'][i] === undefined) target.magic_effect[effect]['effect'][i] = {};
				if(target.magic_effect[effect]['effect'][i]['id'] == magic_effect_id['buff'])
				{
					if(target.magic_effect[effect]['effect'][i]['intensity_type'] == "value")
					{
						target[target.magic_effect[effect]['effect'][i]['type']] -= parseInt(target.magic_effect[effect]['effect'][i]['intensity']);
					}
					else
					{
						base_name = target.magic_effect[effect_name]['effect'][i]['type'].split("_")[0] == "stat"?target.magic_effect[effect_name]['effect'][i]['type'].split("_")[1] : target.magic_effect[effect_name]['effect'][i]['type'];
						target[target.magic_effect[effect]['effect'][i]['type']] -= (parseInt(target.magic_effect[effect]['effect'][i]['intensity'])*0.01)*target["base_"+base_name];
					}
					if(target.magic_effect[effect]['effect'][i]['type'] == "stat_str")
					{
						if(target.magic_effect[effect]['effect'][i]['intensity_type'] == "value")
						{
							target.ad -= parseInt(target.magic_effect[effect]['effect'][i]['intensity']);
							target.carry_weight -= parseInt(target.magic_effect[effect]['effect'][i]['intensity']);
						}
						else
						{
							target.ad -= (parseInt(target.magic_effect[effect]['effect'][i]['intensity'])*0.01)*target["base_"+target.magic_effect[effect]['effect'][i]['type']];
							target.carry_weight -= (parseInt(target.magic_effect[effect]['effect'][i]['intensity'])*0.01)*target["base_"+target.magic_effect[effect]['effect'][i]['type']];
						}
					}
					else if(target.magic_effect[effect]['effect'][i]['type'] == "stat_agi")
					{
						if(target.magic_effect[effect]['effect'][i]['intensity_type'] == "value")
						{
							target.as-= parseInt(target.magic_effect[effect]['effect'][i]['intensity']);
							target.ms -= parseInt(target.magic_effect[effect]['effect'][i]['intensity']);
						}
						else
						{
							target.as -= (parseInt(target.magic_effect[effect]['effect'][i]['intensity'])*0.01)*target["base_"+target.magic_effect[effect]['effect'][i]['type']];
							target.ms -= (parseInt(target.magic_effect[effect]['effect'][i]['intensity'])*0.01)*target["base_"+target.magic_effect[effect]['effect'][i]['type']];
						}
					}
					else if(target.magic_effect[effect]['effect'][i]['type'] == "stat_int")
					{
						if(target.magic_effect[effect]['effect'][i]['intensity_type'] == "value")
						{
							target.max_mp -= parseInt(target.magic_effect[effect]['effect'][i]['intensity']);
						}
						else
						{
							target.max_mp -= (parseInt(target.magic_effect[effect]['effect'][i]['intensity'])*0.01)*target["base_"+target.magic_effect[effect]['effect'][i]['type']];
						}
					}
					else if(target.magic_effect[effect]['effect'][i]['type'] == "stat_end")
					{
						if(target.magic_effect[effect]['effect'][i]['intensity_type'] == "value")
						{
							target.max_hp -= parseInt(target.magic_effect[effect]['effect'][i]['intensity'])*2;
						}
						else
						{
							target.max_hp -= ((parseInt(target.magic_effect[effect]['effect'][i]['intensity'])*0.01)*target["base_"+target.magic_effect[effect]['effect'][i]['type']])*2;
						}
					}
				}
				else if(target.magic_effect[effect]['effect'][i]['id'] == magic_effect_id['debuff'])
				{
					if(target.magic_effect[effect]['effect'][i]['intensity_type'] == "value")
					{
						target[target.magic_effect[effect]['effect'][i]['type']] += parseInt(target.magic_effect[effect]['effect'][i]['intensity']);
					}
					else
					{
						target[target.magic_effect[effect]['effect'][i]['type']] += (parseInt(target.magic_effect[effect]['effect'][i]['intensity'])*0.01)*target["base_"+target.magic_effect[effect]['effect'][i]['type']];
					}
					if(target.magic_effect[effect]['effect'][i]['type'] == "stat_str")
					{
						if(target.magic_effect[effect]['effect'][i]['intensity_type'] == "value")
						{
							target.ad += parseInt(target.magic_effect[effect]['effect'][i]['intensity']);
							target.carry_weight += parseInt(target.magic_effect[effect]['effect'][i]['intensity']);
						}
						else
						{
							target.ad += (parseInt(target.magic_effect[effect]['effect'][i]['intensity'])*0.01)*target["base_"+target.magic_effect[effect]['effect'][i]['type']];
							target.carry_weight += (parseInt(target.magic_effect[effect]['effect'][i]['intensity'])*0.01)*target["base_"+target.magic_effect[effect]['effect'][i]['type']];
						}
					}
					else if(target.magic_effect[effect]['effect'][i]['type'] == "stat_agi")
					{
						if(target.magic_effect[effect]['effect'][i]['intensity_type'] == "value")
						{
							target.as+= parseInt(target.magic_effect[effect]['effect'][i]['intensity']);
							target.ms += parseInt(target.magic_effect[effect]['effect'][i]['intensity']);
						}
						else
						{
							target.as += (parseInt(target.magic_effect[effect]['effect'][i]['intensity'])*0.01)*target["base_"+target.magic_effect[effect]['effect'][i]['type']];
							target.ms += (parseInt(target.magic_effect[effect]['effect'][i]['intensity'])*0.01)*target["base_"+target.magic_effect[effect]['effect'][i]['type']];
						}
					}
					else if(target.magic_effect[effect]['effect'][i]['type'] == "stat_int")
					{
						if(target.magic_effect[effect]['effect'][i]['intensity_type'] == "value")
						{
							target.max_mp += parseInt(target.magic_effect[effect]['effect'][i]['intensity']);
						}
						else
						{
							target.max_mp += (parseInt(target.magic_effect[effect]['effect'][i]['intensity'])*0.01)*target["base_"+target.magic_effect[effect]['effect'][i]['type']];
						}
					}
					else if(target.magic_effect[effect]['effect'][i]['type'] == "stat_end")
					{
						if(target.magic_effect[effect]['effect'][i]['intensity_type'] == "value")
						{
							target.max_hp += parseInt(target.magic_effect[effect]['effect'][i]['intensity'])*2;
						}
						else
						{
							target.max_hp += ((parseInt(target.magic_effect[effect]['effect'][i]['intensity'])*0.01)*target["base_"+target.magic_effect[effect]['effect'][i]['type']])*2;
						}
					}
				}
				reload(target);
			}
			delete target.magic_effect[effect];
			if(target == player) $(".player_effect > ul li#"+effect_id).remove();
			else $(".npc_effect > ul li#"+effect_id).remove();
		}
	}
}
var adjustMagicEffect = function(effect, opt)
{
	for(var key in opt)
	{
		effect[key] = opt[key];
	}
}
var inventory_item_info = {};
var active_unit_inventory = {};
var reloadEffectlist = function(target)
{
	$(".npc_effect > ul").empty();
	for(var effect in target.magic_effect)
	{
		addEffectlist(target, target.magic_effect[effect]);
	}
}
var addEffectlist = function(target, effect)
{
	if(target != active_unit && target != player) return;
	var effect_name = effect['effect_name'];
	var effect_info = "";
	for(var a = 0; a < effect['effect'].length; a++)
	{
		if(effect['effect'][a]['type'] == "ad") effect_info += "공격력";
		else if(effect['effect'][a]['type'] == "as") effect_info += "공격속도";
		else if(effect['effect'][a]['type'] == "hp") effect_info += "HP";
		else if(effect['effect'][a]['type'] == "mp") effect_info += "MP";
		else if(effect['effect'][a]['type'] == "ms") effect_info += "이동속도";
		else if(effect['effect'][a]['type'] == "armor") effect_info += "방어력";
		else if(effect['effect'][a]['type'] == "resist") effect_info += "마법저항력";
		else if(effect['effect'][a]['type'] == "stat_str") effect_info += "힘";
		else if(effect['effect'][a]['type'] == "stat_agi") effect_info += "민첩";
		else if(effect['effect'][a]['type'] == "stat_int") effect_info += "지능";
		else if(effect['effect'][a]['type'] == "stat_end") effect_info += "인내";
		if(effect['effect'][a]['id'] == magic_effect_id["buff"])
		{
			effect_info += "+";
		}
		else if(effect['effect'][a]['id'] == magic_effect_id["debuff"])
		{
			effect_info += "-";
		}
		effect_info += effect['effect'][a]['intensity']+(effect['effect'][a]['intensity_type']=="percent"?"%<br>":"<br>");
	}
	if(effect['duration'] == "passive")
	{
		if(target == player) $(".player_effect > ul#passive").append("<li id='"+effect_name+"'>"+effect['name']+"</li>");
		else $(".npc_effect > ul#passive").append("<li id='"+effect_name+"'>"+effect['name']+"</li>");
	}
	else 
	{
		if(target == player) $(".player_effect > ul#active").append("<li id='"+effect_name+"'>"+effect['name']+" <span id='duration'>"+effect['duration']+"</span></li>");
		else $(".npc_effect > ul#active").append("<li id='"+effect_name+"'>"+effect['name']+" <span id='duration'>"+effect['duration']+"</span></li>");
	}
}
var reloadInventory = function(target)
{
	var inventory;
	if(target == player)
	{
		inventory = inventory_item_info;
		$(".player_inventory > .inventory_list").empty();
	}
	else
	{
		inventory = active_unit_inventory;
		$(".active_unit_inventory > .inventory_list").empty();
	}
	$.ajax({
		url:"item.json",
		dataType:"json",
		type:"post",
		async:false,
		success:function(result)
		{
			if(inventory === undefined) inventory = {};
			if(target.inventory === undefined) target.inventory = {};
			for(var item in target.inventory)
			{
				inventory[item] = result[target.inventory[item]];
			}
		}
	});
	for(var i = 0; i < Object.keys(target.inventory).length; i++)
	{
		addInventory(target, Object.keys(target.inventory)[i]);
	}
}
$("body").on({
mouseenter : function(event)
{
	var id = $(this).attr("id").split("_")[1];
	var item_info;
	if($(this).parent().parent().hasClass("player_inventory")) item_info = inventory_item_info[id];
	else item_info = active_unit_inventory[id];
	var item_id = item_info['id'];
	var item_name = item_info['name'];
	var item_desc = item_info['desc'];
	var item_duration;
	if(item_info['effect_duration'] === undefined) item_duration = "";
	else item_duration = "지속시간 : "+item_info['effect_duration']+"초<br>";
	var item_effects = item_info['item_effect'];
	var item_effect = "<li>";
	item_effect += getEffectInfo({effect:item_effects});
	var item_slot;
	if(item_info['type'] == item_type["consume"]) item_slot = "소모품";
	else if(item_info['type'] == item_type["etc"]) item_slot = "기타";
	else if(item_info['equip_slot'] == "head")
	{
		item_slot = "투구";
	}
	else if(item_info['equip_slot'] == "u_body")
	{
		item_slot = "갑옷";
	}
	else if(item_info['equip_slot'] == "l_body")
	{
		item_slot = "바지";
	}
	else if(item_info['equip_slot'] == "a_hands")
	{
		item_slot = "장갑";
	}
	else if(item_info['equip_slot'] == "foot")
	{
		item_slot = "신발";
	}
	else if(item_info['equip_slot'] == "w_hands")
	{
		item_slot = "무기";
	}
	item_effect += "</li>";
	$(".item_detail .item_name").text(item_name);
	$(".item_detail .item_slot").text(item_slot);
	$(".item_detail .item_desc").text(item_desc);
	$(".item_detail .item_duration").html(item_duration);
	$(".item_detail .item_effect > ul").html(item_effect);
	$(".item_detail").removeClass("hide");
	if($('body').height() - $(this).offset().top >= 200) $(".item_detail").css("top", $(this).offset().top-8);
	else
	{
		$(".item_detail").css("top", $(this).offset().top-174);
		$(".item_detail .item_effect").css("text-align", "right");
	}
	$(".item_detail").css("left", $(this).offset().left-8);
	$(this).css("z-index", "2");
},
mouseleave : function(event)
{
	$(this).css("z-index", "0");
	$(".item_detail .item_effect").css("text-align", "left");
	$(".item_detail").addClass("hide");
}}, ".inventory_item");
$("body").on("click",".player_inventory .inventory_item",function(event)
{
	var item_effects = [];
	event.preventDefault();
	equipItem(player, $(this).attr("id").split("_")[1]);
});
$("body").on("click",".active_unit_inventory .inventory_item",function(event)
{
	var item_effects = [];
	event.preventDefault();
	if(active_unit.type == "follower") equipItem(active_unit, $(this).attr("id").split("_")[1]);
	else if(active_unit.hp <= 0)
	{
		giveItem(player, active_unit_inventory[$(this).attr("id").split("_")[1]]['id']);
		delItem(active_unit, $(this).attr("id").split("_")[1]);
	}
});
var checkWeight = function()
{
	if(player.cur_weight > player.carry_weight)
	{
		var debuff_weight = [{id:8, type:"stat_agi", intensity:"70", intensity_type:"percent"}];
		addMagicEffect(player, {name:"무게초과", effect_name:"weight", duration:"passive", effect:debuff_weight});
	}
	else
	{
		for(var val in player.magic_effect)
		{
			if(val == "weight")
			{
				delMagicEffect(player, "weight");
				break;
			}
		}
	}
}
var delItem = function(target, item_id)
{
	if(target == player)
	{
		player.cur_weight -= inventory_item_info[item_id]['weight'];
		delete inventory_item_info[item_id];
	}
	else delete active_unit.inventory[item_id];
	//$(".player_inventory #item_"+item_id).next().remove();
	if(target == player) $(".player_inventory #item_"+item_id).remove();
	else $(".active_unit_inventory #item_"+item_id).remove();
	$(".item_detail").addClass("hide");
}
var equipItem = function(target, item)
{
	var item_id = item;
	var item;
	if(target == player) item = inventory_item_info[item_id];
	else item = active_unit_inventory[item_id];
	var equip_state = 0;
	//var item_type = item['type'];
	var item_effects = [];
	if(item['type'] == item_type["equip"])
	{
		for(var slot in target.equip_slot)
		{
			if(item === undefined) item = {};
			if(slot == item.equip_slot)
			{
				if(slot == "w_hands")
				{
					if(item.weapon_type == "twohands" || item.weapon_type == "range" )
					{
						for(var i = 0; i < target.equip_slot[slot].length ; i++)
						{
							if(target.equip_slot[slot][i] != "none" && target.equip_slot[slot][i] != item_id)
							{
								equipItem(target, target.equip_slot[slot][i]);
								if(i == 1)
								{
									target.equip_slot[slot][0] = item_id;
									target.equip_slot[slot][1] = item_id;
									equip_state = 1;
								}
							}
							else if(target.equip_slot[slot][i] == item_id)
							{
								target.equip_slot[slot][0] = "none";
								target.equip_slot[slot][1] = "none";
								equip_state = 2;
								break;
							}
							else if(target.equip_slot[slot][0] == "none" && target.equip_slot[slot][1] == "none")
							{
								target.equip_slot[slot][0] = item_id;
								target.equip_slot[slot][1] = item_id;
								equip_state = 1;
								break;
							}
						}
					}
					else
					{
						for(var i = 0; i < target.equip_slot[slot].length ; i++)
						{
							if(target.equip_slot[slot][0] == "none" && target.equip_slot[slot][1] != item_id)
							{
								target.equip_slot[slot][i] = item_id;
								equip_state = 1;
								break;
							}
							else if(target.equip_slot[slot][i] == item_id)
							{
								target.equip_slot[slot][i] = "none";
								equip_state = 2;
								break;
							}
							else
							{
								if(i == 0) continue;
								if(target.equip_slot[slot][i] != "none") equipItem(target, target.equip_slot[slot][i]);
								target.equip_slot[slot][i] = item_id;
								equip_state = 1;
							}
						}
					}
				}
				else
				{
					if(target.equip_slot[slot] == "none")
					{
						target.equip_slot[slot] = item_id;
						equip_state = 1;
					}
					else if(target.equip_slot[slot] == item_id)
					{
						target.equip_slot[slot] = "none";
						equip_state = 2;
					}
					else
					{
						equipItem(target, target.equip_slot[slot]);
						target.equip_slot[slot] = item_id;
						equip_state = 1;
					}
				}
				break;
			}
		}
		if(equip_state == 1)
		{
			for(var i = 0; i < item.item_effect.length; i++)
			{
				if(item.item_effect[i] === undefined) item.item_effect[i] = {};
				item_effects.push(item.item_effect[i]);
			}
			addMagicEffect(target, {name:item['name'], effect_name:"equip_"+item_id, duration:"passive", effect:item_effects});
			if(target == player) $(".player_inventory .inventory_item#item_"+item_id).addClass("equipped");
			else $(".active_unit_inventory .inventory_item#item_"+item_id).addClass("equipped");
		}
		else if(equip_state == 2)
		{
			for(var i = 0; i < item.item_effect.length; i++)
			{
				if(item.item_effect[i] === undefined) item.item_effect[i] = {};
				adjustMagicEffect(item.item_effect[i], {name:item['name'], effect_id:"item_"+item_id});
				reload(target, item.item_effect[i]['type']);
			}
			delMagicEffect(target, "equip_"+item_id);
			if(target == player) $(".player_inventory .inventory_item#item_"+item_id).removeClass("equipped");
			else $(".active_unit_inventory .inventory_item#item_"+item_id).removeClass("equipped");
		}
	}
	else if(item['type'] == item_type["consume"])
	{
		for(var i = 0; i < item['item_effect'].length; i++)
			item_effects.push(item['item_effect'][i]);
		addMagicEffect(player, {name:item['name'],effect_name:"consume_"+item_id, duration:item['effect_duration'], effect:item_effects});
		delItem(player, item_id);
	}
}
var giveItem = function(target, id, num)
{
	var num = num || 1;
	if(num < 0) return;
	$.ajax({
		url:"item.json",
		dataType:"json",
		type:"post",
		async:false,
		success:function(result)
		{
			if(inventory_item_info === undefined) inventory_item_info = {};
			if(target.inventory === undefined) target.inventory = {};
			if(target == player)
			{
				while(num--)
				{
					target.inventory[Object.keys(target.inventory).length] = id;
					inventory_item_info[Object.keys(inventory_item_info).length] = result[id];
					inventory_item_info[Object.keys(inventory_item_info).length-1]['id'] = id;
					player.cur_weight += parseInt(result[id]['weight']);
					console.log(inventory_item_info);
					addInventory(target, Object.keys(inventory_item_info).length-1);
				}
			}
			else
			{
				while(num--)
				{
					target.inventory[Object.keys(target.inventory).length] = id;
					active_unit_inventory[Object.keys(active_unit_inventory).length] = result[id];
					active_unit_inventory[Object.keys(active_unit_inventory).length-1]['id'] = id;
					addInventory(target, Object.keys(active_unit_inventory).length-1);
				}
			}
		}
	});
}
var getEffectInfo = function(effect)
{
	var effect_info = "";
	for(var a = 0; a < effect['effect'].length; a++)
	{
		if(effect['effect'][a]['type'] == "ad") effect_info += "공격력";
		else if(effect['effect'][a]['type'] == "as") effect_info += "공격속도";
		else if(effect['effect'][a]['type'] == "hp") effect_info += "HP";
		else if(effect['effect'][a]['type'] == "mp") effect_info += "MP";
		else if(effect['effect'][a]['type'] == "ms") effect_info += "이동속도";
		else if(effect['effect'][a]['type'] == "armor") effect_info += "방어력";
		else if(effect['effect'][a]['type'] == "resist") effect_info += "마법저항력";
		else if(effect['effect'][a]['type'] == "stat_str") effect_info += "힘";
		else if(effect['effect'][a]['type'] == "stat_agi") effect_info += "민첩";
		else if(effect['effect'][a]['type'] == "stat_int") effect_info += "지능";
		else if(effect['effect'][a]['type'] == "stat_end") effect_info += "인내";
		if(effect['effect'][a]['id'] == magic_effect_id["buff"])
		{
			effect_info += "+";
		}
		else if(effect['effect'][a]['id'] == magic_effect_id["debuff"])
		{
			effect_info += "-";
		}
		effect_info += effect['effect'][a]['intensity']+(effect['effect'][a]['intensity_type']=="percent"?"%<br>":"<br>");
	}
	return effect_info;
}
var addInventory = function(target, id)
{
	var i = id;
	var item_info;
	if(target == player) item_info = inventory_item_info[i];
	else item_info = active_unit_inventory[i];
	var item_image = "/item/"+item_info['image'];
	if(target == player) $(".player_inventory .inventory_list").append('<div class="inventory_item" id="item_'+i+'"><div class="inventory_image"><img src="'+item_image+'"></div></div>');
	else $(".active_unit_inventory .inventory_list").append('<div class="inventory_item" id="item_'+i+'"><div class="inventory_image"><img src="'+item_image+'"></div></div>');
	for(var slot in target.equip_slot)
	{
		if(slot == "w_hands")
		{
			if(target.equip_slot[slot][0] == i || target.equip_slot[slot][1] == i)
			{
				if(target == player) $(".player_inventory .inventory_item#item_"+i).addClass("equipped");
				else $(".active_unit_inventory .inventory_item#item_"+i).addClass("equipped");
			}
		}
		else if(target.equip_slot[slot] == i)
		{
			if(target == player) $(".player_inventory .inventory_item#item_"+i).addClass("equipped");
			else $(".active_unit_inventory .inventory_item#item_"+i).addClass("equipped");
		}
	}
}
$("body").on({
mouseenter : function(event)
{
	$(".effect_detail").removeClass("hide");
	$(".effect_detail").css("top", $(this).offset().top+$(this).height()+2);
	$(".effect_detail").css("left", $(this).offset().left-8);
	$(".effect_detail").css("width", $(this).width());
	if($(this).parent().parent().hasClass("player_effect")) $(".effect_intensity").html(getEffectInfo(player.magic_effect[$(this).attr("id")]));
	else $(".effect_intensity").html(getEffectInfo(active_unit.magic_effect[$(this).attr("id")]));
	$(".effect_detail").css("z-index", "1");
},
mouseleave : function(event)
{
	$(".effect_detail").addClass("hide");
}}, ".effect_list > ul li");