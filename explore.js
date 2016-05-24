$('#explore').click(function(event)
{
	event.preventDefault();
	if(true || cur_state == state['idle'])
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
			var encounter_chance = Math.floor(Math.random()*2+1);
			npcs = [];
			$('.npc_list > ul').empty();
			if(encounter_chance == 1)
			{
				createNpc(1);
				$(".select_npc")[0].click();
			}
			else if(encounter_chance == 2)
			{
				createNpc(10);
				$(".select_npc")[0].click();
			}
		}, Math.floor(Math.random()*1));
		cur_state = state['encounter'];
	}
});
var moveLocation = function(id)
{
	var npc_id = [];
	var location;
	npcs_info = [];
	move_locations = [];
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
			for(var i = 0; i < location['move_location'].length; i++)
			{
				move_locations.push(result[location['move_location'][i]]);
			}
			//move_locations = location['move_location'];
			/*for(var val in location['encounter_id'])
			{
				npc_id.push(location['encounter_id'][val]);
			}*/
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
			for(var i = 0; i < npc_id.length ; i++)
			{
				npcs_info.push(result[npc_id[i]]);
			}
		}
	});
	$(".bgimg").css("background-image", "url('bg/"+location['bg']+"')");
	$(".location_name").html(location['name']);
}
$("#move_location").click(function(event)
{
	$(".location_list").removeClass("hide");
	$(".location_list > ul").empty();
	for(var i = 0; i < move_locations.length; i++)
	{
		var min_level = move_locations[i]['level']-3 < 1? 1:move_locations[i]['level']-3;
		var max_level = parseInt(move_locations[i]['level'])+3;
		var string_level = min_level+"~"+max_level;
		$(".location_list > ul").append("<a href='#' class='move_location' id='"+move_locations[i]['id']+"'><li style='background-image:url(\"bg/"+move_locations[i]['bg']+"\");background-size:auto 100%'>"+move_locations[i]['name']+" <span style='font-size:0.7em'>레벨대 : "+string_level+"</span></li></a>")
	}
	event.preventDefault();
});