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
	$("."+$(this).parent().attr("id")).removeClass("hide");
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
	if($(this).parent().attr("id") == "move_location")
	{
		for(var i = 0; i < move_locations.length; i++)
		{
			if(move_locations[i]['type'] == "town") $(".location_list > ul").append("<a href='#' class='move_location' id='"+move_locations[i]['id']+"'><li style='background-image:url(\"bg/"+move_locations[i]['bg']+"\");background-size:auto 100%'>"+move_locations[i]['name']+"</li></a>");
			else
			{
				var cur_level = parseInt(move_locations[i]['level'])
				var min_level = cur_level-3 < 1? 1:cur_level-3;
				var max_level = cur_level+3;
				var string_level = min_level+"~"+max_level;
				$(".location_list > ul").append("<a href='#' class='move_location' id='"+move_locations[i]['id']+"'><li style='background-image:url(\"bg/"+move_locations[i]['bg']+"\");background-size:auto 100%'>"+move_locations[i]['name']+" <span style='font-size:0.7em'>레벨대 : "+string_level+"</span></li></a>");
			}
		}
	}
	else
	{
		for(var i = 0; i < sub_locations.length; i++)
		{
			if(sub_locations[i]['type'] == "town") $(".location_list > ul").append("<a href='#' class='move_location' id='"+sub_locations[i]['id']+"'><li style='background-image:url(\"bg/"+sub_locations[i]['bg']+"\");background-size:auto 100%'>"+sub_locations[i]['name']+"</li></a>");
			else 
			{
				var cur_level = parseInt(move_locations[i]['level'])
				var min_level = cur_level-3 < 1? 1:cur_level-3;
				var max_level = cur_level+3;
				var string_level = min_level+"~"+max_level;
				$(".location_list > ul").append("<a href='#' class='move_location' id='"+sub_locations[i]['id']+"'><li style='background-image:url(\"bg/"+sub_locations[i]['bg']+"\");background-size:auto 100%'>"+sub_locations[i]['name']+" <span style='font-size:0.7em'>레벨대 : "+string_level+"</span></li></a>");
			}
		}
	}
	
});
var state = {dead:0, idle:1, encounter:2, combat:3, explore:4};
var magic_effect_id = {heal:0x1, stun:0x2, silence:0x4, binding:0x8, invisible:0x10, bleeding:0x20, resistance:0x40, debuff:0x80, buff:0x100, damage:0x200};
var magic_effect = {heal:{id:0x1, duration:0, amount:0}};
var heal_effect = {id:0x1, duration:0, amount:0};
var damage_effect = {id:0x200, duration:0, amount:0};
var personality = {good:1, neutral:2, bad:3};
var player;
var followers = [];
var npcs = [];
var active_npc = {};
var active_player = {};
var npcs_info = [];
var player_location = 1;
var npc_all_dead = 0;
var follower_all_dead = 0;
var combat_players = [];
var combat_npcs = [];
var cur_location = 0;
var cur_state = state['idle'];
var move_locations = [];
var sub_locations = [];
var main_location = {};
$('body').on("click", ".move_location", function(event)
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
		$('.player_list').empty();
		$('.npc_list').empty();
		$('.player_list > ul').append("<a href='#' class='select_player' id='player'><li id='player'>"+player['char_name']+" <span id='hp'>"+player['hp']+"</span>/<span id='max_hp'>"+player['max_hp']+"</span></li></a>");
		for(var i = 0; i < followers.length; i++)
		{
			$('.player_list > ul').append("<a href='#' class='select_player'><li id='player_"+i+"'>"+followers[i]['char_name']+" <span id='hp'>"+followers[i]['hp']+"</span>/<span id='max_hp'>"+followers[i]['max_hp']+"</span></li></a>");
		}
		for(var i = 0; i < npcs.length; i++)
		{
			$('.npc_list > ul').append("<a href='#' class='select_npc'><li id='npc_"+i+"'>"+npcs[i]['char_name']+" <span id='hp'>"+npcs[i]['hp']+"</span>/<span id='max_hp'>"+npcs[i]['max_hp']+"</span></li></a>");
		}
	}
	else if(target == "follower")
	{
		$('.player_list ul').empty();
		$('.player_list > ul').append("<a href='#' class='select_player' id='player'><li id='player'>"+player['char_name']+" <span id='hp'>"+player['hp']+"</span>/<span id='max_hp'>"+player['max_hp']+"</span></li></a>");
		for(var i = 0; i < followers.length; i++)
		{
			$('.player_list > ul').append("<a href='#' class='select_player'><li id='player_"+i+"'>"+followers[i]['char_name']+" <span id='hp'>"+followers[i]['hp']+"</span>/<span id='max_hp'>"+followers[i]['max_hp']+"</span></li></a>");
		}
	}
	else if(target == "npc")
	{
		$('.npc_list ul').empty();
		for(var i = 0; i < npcs.length; i++)
		{
			$('.npc_list > ul').append("<a href='#' class='select_npc'><li id='npc_"+i+"'>"+npcs[i]['char_name']+" <span id='hp'>"+npcs[i]['hp']+"</span>/<span id='max_hp'>"+npcs[i]['max_hp']+"</span></li></a>");
		}
	}
}
var reloadList = function(target)
{
	if(target.type == "player" && target != player)
	{
		for(var i = 0; i < followers.length; i++)
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
		for(var i = 0; i < npcs.length; i++)
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
		for(var name in target)
		{
			if(!target.hasOwnProperty(name)) continue;
			$("."+target.type+"_info #"+name).text(target[name]);
		}
	}
	else
	{
		$("."+target.type+"_info #"+stat).text(target[stat]);
	}
	if(target === undefined) target={};
	if(target.sp <= 0) $(".inc_stat").addClass("hide");
	else $(".inc_stat").removeClass("hide");
}
$('#attack').click(function(event)
{
	event.preventDefault();
	if(cur_state == state['encounter'])
	{
		for(var i = 0; i < followers.length; i++)
		{
			combat_players.push(followers[i]);
		}
		combat_players.push(player);
		for(var i = 0; i < npcs.length; i++)
		{
			combat_npcs.push(npcs[i]);
		}
		progressCombat(combat_players, combat_npcs);
	}
	else if(cur_state == state['combat'])
	{
		$('#attack').attr("disabled", "disabled");
		setTimeout(function()
		{
			$('#attack').removeAttr("disabled");
		}, active_player.bat/((100+active_player.as)*0.01)*1000);
		adjustMagicEffect(damage_effect, {duration:1, amount:player.ad, type:"physical"});
		addMagicEffect(active_npc, damage_effect);
		$(".frame").addClass("ani_player_attack");
		setTimeout(function()
		{
			$(".frame").removeClass("ani_player_attack");
		}, 400);
		reload(active_npc, 'hp');
		reloadList(active_npc);
		if(active_npc.hp <= 0)
		{
			for(var i = 0; i < combat_npcs.length; i++)
			{
				if(combat_npcs[i] === active_npc)
				{
					if(i >= combat_npcs.length-1)
					{
						npc_all_dead = 1;
					}
					//gainExpPlayer(npcs[i].exp_gain);
					gainExpPlayer(30);
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
	for(var i = 0; i < followers.length; i++)
	{
		if(select_enemy == followers[i]) select_enemy = followers[i];
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
		adjustMagicEffect(damage_effect, {duration:1, amount:npcs[id].ad, type:"physical"});
		addMagicEffect(select_enemy, damage_effect);
		if(select_enemy == active_player) reload(select_enemy, "hp");
		reloadList(select_enemy);
		setTimeout(combat_npc, npcs[id].bat/((100+npcs[id].as)*0.01)*1000, id, enemy);
	}
}
var combat_follower = function(id, enemy)
{
	var select_enemy = enemy[Math.floor(Math.random()*enemy.length)];
	for(var i = 0; i < npcs.length; i++)
	{
		if(select_enemy == npcs[i]) select_enemy = npcs[i];
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
		adjustMagicEffect(damage_effect, {duration:1, amount:followers[id].ad, type:"physical"});
		addMagicEffect(select_enemy, damage_effect);
		if(select_enemy == active_npc) reload(select_enemy, "hp");
		reloadList(select_enemy);
		setTimeout(combat_follower, followers[id].bat/((100+followers[id].as)*0.01)*1000, id, enemy);
	}
}
var progressCombat = function(combat_players, combat_npcs)
{
	cur_state = state['combat'];
	
	for(var i = 0; i < npcs.length; i++)
	{
		npcs[i]['attack_cycle'] = setTimeout(combat_npc, npcs[i].bat/((100+npcs[i].as)*0.01)*1000, i, combat_players);
	}
	for(var i = 0; i < followers.length; i++)
	{
		followers[i]['attack_cycle'] = setTimeout(combat_follower, followers[i].bat/((100+followers[i].as)*0.01)*1000, i, combat_npcs);
	}
}
var gainExpPlayer = function(exp)
{
	var increase_exp = followers.length * 0.15;
	var gain_exp = Math.floor((exp*(1+increase_exp))/(followers.length+1));
	for(var i = 0; i < followers.length; i++)
	{
		followers[i].gainExp(gain_exp);
	}
	player.gainExp(gain_exp);
}
var img = new Image();
var convertType = function(npc)
{
	var temp = new Player();
	temp.createPlayer();
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
	temp['type'] = "player";
	temp['sp'] = 0;
	addCharList(temp);
	$('.select_npc.active').remove();
	if(!($(".npc_list > ul").children()[0] === undefined)) $(".npc_list > ul").children()[0].click();
	else cur_state = state['idle'];
	//$('.player_list > ul').append("<a href='#' class='select_player'><li id='player_"+id+"'>"+temp['char_name']+" <span id='hp'>"+temp['hp']+"</span>/<span id='max_hp'>"+temp['max_hp']+"</span></li></a>");
}
var addCharList = function(target)
{
	var id;
	if(target === undefined) target = {};
	if(target.type == "player")
	{
		id = followers.length;
		followers.push(target);
	}
	else
	{
		id = npcs.length;
		npcs.push(target);
	}
	$('.'+target.type+'_list > ul').append("<a href='#' class='select_"+target.type+"'><li id='"+target.type+"_"+id+"'>"+target['char_name']+" <span id='hp'>"+target['hp']+"</span>/<span id='max_hp'>"+target['max_hp']+"</span></li></a>");
}
var delCharList = function(target)
{
	if(target.type == "player")
	{
		for(var i = 0; i < followers.length; i++)
		{
			if(followers[i] == target)
			{
				followers.splice(i, 1);
				break;
			}
		}
	}
	else
	{
		for(var i = 0; i < npcs.length; i++)
		{
			if(npcs[i] == target)
			{
				npcs.splice(i, 1);
				break;
			}
		}
	}
}
var createNpc = function(num)
{
	for(var i=0, npc, select_npc; i < num; i++)
	{
		npc=new Npc();
		select_npc = npcs_info[Math.floor(Math.random()*npcs_info.length)];
		npc.createRandom(select_npc);
		addCharList(npc);
	}
}
$('.inc_stat > input[type=button]').click(function(event)
{
	event.preventDefault();
	active_player[$(this).attr('id')] += 1;
	active_player.sp--;
	if($(this).attr('id') == "stat_str")
	{
		active_player.ad += 1;
		active_player.carry_weight += 1;
		reload(active_player, "ad");
		reload(active_player, "carry_weight");
	}
	else if($(this).attr('id') == "stat_agi")
	{
		active_player.as += 1;
		active_player.ms += 1;
		reload(active_player, "as");
		reload(active_player, "ms");
	}
	else if($(this).attr('id') == "stat_int")
	{
		active_player.max_mp += 1;
		reload(active_player, "max_mp");
	}
	else
	{
		active_player.max_hp += 2;
		reload(active_player, "max_hp");
	}
	
	if(active_player.sp <= 0) $('.inc_stat').addClass("hide");
	reload(active_player, $(this).attr('id'));
	reload(active_player, "sp");
});
$('body').on('click', '.select_npc', function(event)
{
	event.preventDefault();
	$('.select_npc').removeClass("active");
	$(this).addClass("active");
	active_npc = npcs[$("li", this).attr("id").split("_")[1]];
	reload(active_npc);
});
$('body').on('click', '.select_player', function(event)
{
	event.preventDefault();
	$('.select_player').removeClass("active");
	$(this).addClass("active");
	if($(this).attr("id") == "player") active_player = player;
	else active_player = followers[$("li", this).attr("id").split("_")[1]];
	reload(active_player);
});
$('#save').click(function(event)
{
	event.preventDefault();
	var save_data = {};
	if(save_data['follower'] === undefined) save_data['follower'] ={};
	if(save_data['npc'] === undefined) save_data['npc'] ={};
	for(var i= 0; i < followers.length; i++)
	{
		for(var data in followers[i])
		{
			if(!followers[i].hasOwnProperty(data)) continue;
			if(followers[i] === undefined) followers[i] = {};
			if(save_data['follower'][i] === undefined) save_data['follower'][i] = {};
			save_data['follower'][i][data] = followers[i][data];
		}
	}
	for(var i= 0; i < npcs.length; i++)
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
	localStorage.save_data = btoa(JSON.stringify(save_data));
});
$('#load').click(function(event)
{
	event.preventDefault();
	var load_data = JSON.parse(atob(localStorage.save_data));
	cur_location = load_data['cur_location'];
	cur_state = load_data['cur_state'];
	moveLocation(cur_location);
	for(var stat in load_data['player'])
	{
		player[stat] = load_data['player'][stat];
	}
	reload(player);
	for(var i = followers.length-1; i >= 0; i--)
	{
		delCharList(followers[i]);
	}
	reloadListAll("follower");
	for(var follower in load_data['follower'])
	{
		var temp = new Player();
		temp.createPlayer();
		for(var val in load_data['follower'][follower])
		{
			if(!load_data['follower'][follower].hasOwnProperty(val)) continue;
			temp[val] = load_data['follower'][follower][val];
		}
		temp['char_name'] =load_data['follower'][follower]['char_name'];
		addCharList(temp);
	}
	for(var i = npcs.length-1; i >= 0; i--)
	{
		delCharList(npcs[i]);
	}
	reloadListAll("npc");
	for(var npc in load_data['npc'])
	{
		var temp = new Npc();
		temp.createRandom();
		for(var val in load_data['npc'][npc])
		{
			if(!load_data['npc'][npc].hasOwnProperty(val)) continue;
			temp[val] = load_data['npc'][npc][val];
		}
		temp['char_name'] =load_data['npc'][npc]['char_name'];
		addCharList(temp);
	}
	$(".select_player")[0].click();
	$(".select_npc")[0].click();
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
			var encounter_chance = Math.floor(Math.random()*10+1);
			npcs = [];
			$('.npc_list > ul').empty();
			if(encounter_chance == 1)
			{
				createNpc(1);
				$(".select_npc")[0].click();
				cur_state = state['encounter'];
			}
			else if(encounter_chance == 2)
			{
				createNpc(2);
				$(".select_npc")[0].click();
				cur_state = state['encounter'];
			}
			else if(encounter_chance == 3)
			{
				createNpc(3);
				$(".select_npc")[0].click();
				cur_state = state['encounter'];
			}
			else cur_state = state['idle'];
		}, Math.floor(Math.random()*4000+1000));
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
	var location;
	var check_sub = 0;
	npcs_info = [];
	move_locations = [];
	//sub_locations = [];
	//main_location = {};
	for(var i = npcs.length-1; i >= 0; i--)
	{
		delCharList(npcs[i]);
	}
	reloadListAll("npc");
	$.ajax({
		url:"location.json",
		dataType:"json",
		type:"get",
		async:false,
		success:function(result)
		{
			location = result[id];
			var location_effects = location['location_effect'];
			for(var i = 0; i < location_effects.length; i++)
			{
				if(location_effects[i]['id'] != 0)
				{
					for(var j = 0; j < followers.length; j++)
					{
						addMagicEffect(followers[j], location_effects[i]);
					}
					addMagicEffect(player, location_effects[i]);
				}
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
			if(check_sub != 1)main_location = location;
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
			npc_id = location['encounter_id'];
		}
	});
		$.ajax({
		url:"npc.json",
		dataType:"json",
		type:"get",
		async:false,
		success:function(result)
		{
			if(npc_id === undefined) npc_id = {};
			for(var i = 0; i < npc_id.length ; i++)
			{
				npcs_info.push(result[npc_id[i]]);
			}
		}
	});
	if(location['type'] == "field")
	{
		player_location = 1;
		$("#move_location").addClass("hide");
	}
	else if(location['type'] == "town")
	{
		$("#move_location").removeClass("hide");
	}
	$(".bgimg").css("background-image", "url('bg/"+location['bg']+"')");
	$(".location_name").html(location['name']);
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
	if(effect === undefined) effect = {};
	if(effect['duration'] == 1)
	{
		if(effect['id'] == magic_effect_id['heal'])
		{
			target.hp+=effect['amount'];
			return;
		}
		else if(effect['id'] == magic_effect_id['damage'])
		{
			var damage;
			if(effect['type'] == "physical") damage = Math.round(effect['amount'] * (100/(100+target.armor)));
			else damage = Math.round(effect['amount'] * (100/(100+target.resist)));
			target.hp-=damage;
			if(target == player)
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
				for(var val in target.magic_effect)
				{
					clearInterval(target.magic_effect[val]['cycle']);
				}
				if(target.type == "player") $(".player_effect > ul").empty();
			}
			return;
		}
	}
	else if(effect['duration'] == 0)
	{
		
	}
	var effect_name = effect['name'];
	if(target.magic_effect === undefined) target.magic_effect = {};
	if(target.magic_effect[effect_name] !== undefined)
	{
		for(var i = 1, effect_name = effect['name'] + "_"+i; target.magic_effect[effect_name] !== undefined; i++)
		{
			effect_name = effect['name'] + "_"+i;
		}
		//target.magic_effect[effect_name]['name'] = effect_name;
	}
	target.magic_effect[effect_name] = {};
	for(var val in effect)
	{
		target.magic_effect[effect_name][val] = effect[val];
	}
	$(".player_effect > ul").append("<li id='"+effect_name+"'>"+target.magic_effect[effect_name]['name']+" <span id='duration'>"+target.magic_effect[effect_name]['duration']+"</span></li>");
	
	if(target.magic_effect[effect_name]['id'] == magic_effect_id['heal'])
	{
		if(target.hp+target.magic_effect[effect_name]['amount'] > target.max_hp) target.hp=target.max_hp;
		else target.hp+=target.magic_effect[effect_name]['amount'];
		reload(target, 'hp');
		target.magic_effect[effect_name]['cycle'] = setInterval(function()
		{
			if(--target.magic_effect[effect_name]['duration'] <= 0)
			{
				clearInterval(target.magic_effect[effect_name]['cycle']);
				$(".player_effect > ul > #"+effect_name).remove();
				delete target.magic_effect[effect_name];
			}
			else
			{
				if(target.hp+target.magic_effect[effect_name]['amount'] > target.max_hp) target.hp=target.max_hp;
				else target.hp+=target.magic_effect[effect_name]['amount'];
				$(".player_effect > ul > #"+effect_name+" #duration").html(target.magic_effect[effect_name]['duration']);
				reload(target, 'hp');
			}
		}, 1000);
	}
	else if(target.magic_effect[effect_name]['id'] == magic_effect_id['damage'])
	{
		var damage;
		if(target.magic_effect[effect_name]['type'] == "physical") damage = Math.round(target.magic_effect[effect_name]['amount'] * (100/(100+target.armor)));
		else damage = Math.round(target.magic_effect[effect_name]['amount'] * (100/(100+target.resist)));
		if(target.hp-damage < 0) target.hp=0;
		else target.hp-=damage;
		reload(target, 'hp');
		var i = 0;
		target.magic_effect[effect_name]['cycle'] = setInterval(function()
		{
			if(--target.magic_effect[effect_name]['duration'] <= 0)
			{
				clearInterval(target.magic_effect[effect_name]['cycle']);
				$(".player_effect > ul > #"+effect_name).remove();
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
				$(".player_effect > ul > #"+effect_name+" #duration").html(target.magic_effect[effect_name]['duration']);
				reload(target, 'hp');
			}
		}, 1000);
	}
}
var adjustMagicEffect = function(effect, opt)
{
	for(var key in opt)
	{
		effect[key] = opt[key];
	}
}
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
	var carry_weight, equip_weight;
	var cur_location;
	var move_location;
	var cur_state;
	
	Character.call(this);
}
var Npc = function()
{
	var relation;
	var exp_gain;
	var gold;
	var personality;
	var id;

	Character.call(this);
}
var item_type = {consume:1, equip:2, etc:3};
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
	this.equip_weight = 0;
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
	this.equip_slot = {head:0, u_body:0, l_body:0, a_hands:0, foot:0, w_hands:0};
	this.magic_effect = {};
	this.inventory = [];
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
	if(this == active_player) 
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
			if(this == active_player) 
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
Npc.prototype.createRandom = function(npc)
{
	this.type = "npc";
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
	this.equip_slot = {head:0, u_body:0, l_body:0, a_hands:0, foot:0, w_lhand:0, w_rhand:0};
	this.magic_effect = {};
	this.inventory = [];
	this.relation=0;
	this.bat = 2.0;
	this.hp = Math.floor(Math.random()*50+100);
	this.mp = Math.floor(Math.random()*50+50);
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
		if(val != "id" || val != "level") this[val] = npc[val];
	}
	if(npc === undefined) npc = {};
	var level = npc['level'];
	var random_level = Math.floor(Math.random()*(10)-3);
	this.level = Math.floor(Math.random()*(random_level)+level);
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
	this.mp += this.stat_int*1;
	this.hp += this.stat_end*2;
	this.max_hp = this.hp;
	this.max_mp = this.mp;
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