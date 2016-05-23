<?
	session_start();
	include("../config.cfg");
	extract(array_merge($HTTP_GET_VARS, $HTTP_POST_VARS, $HTTP_SESSION_VARS));
	mysql_connect(HOST, "user", "");
	mysql_select_db("blog");
?>
<html>
	<head>
		<meta charset="utf-8">
	</head>
	<body>
		
		<script src="//code.jquery.com/jquery-1.12.3.min.js"></script>
		<script src="//code.jquery.com/ui/1.11.4/jquery-ui.js"></script>
		<script>
			var Character = function()
			{
				var hp;
				var mp;
				var ad;
				var as;
				var ms;
				var armor;
				var resist;
				var level;
				var stat_str;
				var stat_dex;
				var stat_int;
				var stat_end;
			}
			var Npc = function()
			{
				var name;
				var relation;
				
				Character.call(this);
			}
			var Player = function()
			{
				var exp_level;
				var exp_str;
				var exp_dex;
				var exp_int;
				var exp_end;
				var sp;
				var carry_weight;
				var cur_location;
				
				Character.call(this);
			}
			Player.prototype = Character;
			Player.prototype.constructor = Player;
			Player.prototype.createPlayer = function()
			{
				this.hp = 125;
				this.mp = 75;
				this.ad = 40;
				this.as = 40;
				this.ms = 100;
				this.armor = 25;
				this.resist = 25;
				this.level = 1;
				this.stat_str = stat_str;
				this.stat_dex = stat_dex;
				this.stat_int = stat_int;
				this.stat_end = stat_end;
				this.sp = 5;
				this.exp = 0;
				this.exp_str = 0;
				this.exp_dex = 0;
				this.exp_int = 0;
				this.exp_end = 0;
				this.carry_weight = 100;
				this.cur_location = 0;
			}
			Npc.prototype = Character;
			Npc.prototype.constructor = Npc;
			Npc.prototype.createRandom = function(level = 1)
			{
				var name;
				$.ajax({
				url:"defname.json",
				async:false,
				dataType:"json",
				type:"post",
				success:function(result)
				{
					name = result['defname'][Math.floor(Math.random()*result['defname'].length)];
				}
				});
				this.name=name;
				this.relation=0;
				this.hp = Math.floor(Math.random()*50+100);
				this.mp = Math.floor(Math.random()*50+50);
				this.ad = Math.floor(Math.random()*20+30);
				this.as = Math.floor(Math.random()*20+30);
				this.ms = Math.floor(Math.random()*20+90);
				this.armor = Math.floor(Math.random()*10+20);
				this.resist = Math.floor(Math.random()*10+20);
				this.level = level;
				var sp = level*5;
				var reduce_sp = Math.floor(sp/4);
				this.stat_str = Math.floor(Math.random()*reduce_sp+reduce_sp);
				sp -= this.stat_str;
				this.stat_dex = Math.floor(Math.random()*reduce_sp+reduce_sp);
				sp -= this.stat_dex;
				this.stat_int = Math.floor(Math.random()*reduce_sp+reduce_sp);
				sp -= this.stat_int;
				this.stat_end = sp;
				sp -= this.stat_end;
				this.ad += this.stat_str*1;
				this.as += this.stat_dex*1;
				this.ms += this.stat_dex*1;
				this.mp += this.stat_int*2;
				this.hp += this.stat_end*2;
			}
			Npc.prototype.showInfo = function()
			{
				console.log("\nhp:"+this.hp+"\nmp:"+this.mp+"\nad:"+this.ad+"\nas:"+this.as+"\nms:"+this.ms+"\narmor:"+this.armor+"\nresist:"+this.resist+"\nstr:"+this.stat_str+"\ndex:"+this.stat_dex+"\nint:"+this.stat_int+"\nend:"+this.stat_end+"\nname:"+this.name+"\nrelation:"+this.relation);
			}
		</script>
	</body>
</html>