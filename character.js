var Character = function()
{
	var char_name;
	var type;
	var bat;
	var hp, max_hp;
	var mp, max_mp;
	var ad;
	var as;
	var ms;
	var armor;
	var resist;
	var level;
	var stat_str, stat_agi, stat_int, stat_end;
	var chg_str, chg_agi, chg_int, chg_end;
	var magic_effect;
	var equip_slot;
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
	var money;
	
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
var Item = function()
{
	var item_id;
	var name;
	var description;
	var value;
	var weight;
	var enchant;
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
	this.equip_slot = {head:0, u_body:0, l_body:0, a_hand:0, foot:0, wl_hand:0, wr_hand:0};
	this.magic_effect = {};
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
	this.equip_slot = {head:0, ubody:0, lbody:0, a_hands:0, foot:0, w_lhand:0, w_rhand:0};
	this.magic_effect = {};
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
}
Npc.prototype.showInfo = function()
{
	console.log("\nhp:"+this.hp+"\nmp:"+this.mp+"\nad:"+this.ad+"\nas:"+this.as+"\nms:"+this.ms+"\narmor:"+this.armor+"\nresist:"+this.resist+"\nstr:"+this.stat_str+"\ndex:"+this.stat_agi+"\nint:"+this.stat_int+"\nend:"+this.stat_end+"\nname:"+this.name+"\nrelation:"+this.relation);
}
/*var Monster = function()
{
	var npc_name;
	var exp_gain;
	var gold;
	var type;
	Character.call(this);
}
Monster.prototype = Character;
Monster.prototype.constructor = Monster;
Monster.prototype.createRandom = function(level)
{
	var level = level || 1;
	$.ajax({
	url:"defname.json",
	async:false,
	dataType:"json",
	type:"get",
	context:this,
	success:function(result)
	{
		this.npc_name = result['defname'][Math.floor(Math.random()*result['defname'].length)];
	}
	});
	this.equip_slot = {head:0, u_body:0, l_body:0, a_hands:0, foot:0, w_lhand:0, w_rhand:0};
	this.magic_effect = {stun:{duration:0}, silence:{duration:0}, binding:{duration:0}, invisible:{duration:0}, bleeding:{duration:0, damage:0}, resistance:{duration:0, type:0}, debuff:{duration:0, type:0, intensity:0}, buff:{duration:0, type:0, intensity:0}};
	this.relation=0;
	this.bat = 2.0;
	this.hp = Math.floor(Math.random()*50+100);
	this.mp = Math.floor(Math.random()*50+50);
	this.ad = Math.floor(Math.random()*20+30);
	this.as = Math.floor(Math.random()*20+30);
	this.ms = Math.floor(Math.random()*20+90);
	this.armor = Math.floor(Math.random()*10+20);
	this.resist = Math.floor(Math.random()*10+20);
	var random_level = Math.floor(Math.random()*(10)-3);
	if(random_level <= 0) random_level = 1;
	this.level = Math.floor(Math.random()*(random_level)+level);
	this.personality = Math.floor(Math.random()*3+1);
	var sp = this.level*3;
	var limit_stat;
	if(sp < 4) limit_stat = 1;
	else limit_stat = Math.floor(sp/4);
	var stat = [];
	for(var i=0; i < 4; i++)
	{
		if(i == 3) stat[i] = sp;
		else stat[i] = Math.floor(Math.random()*limit_stat+limit_stat);
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
	this.stat_str = stat[0];
	this.stat_agi = stat[1];
	this.stat_int = stat[2];
	this.stat_end = stat[3];
	this.ad += this.stat_str*1;
	this.as += this.stat_agi*1;
	this.ms += this.stat_agi*1;
	this.mp += this.stat_int*1;
	this.hp += this.stat_end*2;
	this.max_hp = this.hp;
	this.max_mp = this.mp;
}*/