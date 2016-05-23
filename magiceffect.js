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