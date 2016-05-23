<?
	if(!empty($save) && $save == 1)
	{
		$player = json_encode($save_data);
		file_put_contents("player.json", $player, FILE_USE_INCLUDE_PATH);
		$senddata['result'] = true;
	}
	else if(!empty($load) && $load == 1)
	{
		$json_player = file_get_contents("player.json");
		$player = json_decode($json_player);
		$senddata['result'] = true;
		$senddata['player'] = $player;
	}
	else if($get_location == 1)
	{
		$json_location = file_get_contents("location.json");
		$location = json_decode($json_location);
		$senddata['result'] = true;
		$senddata['location'] = $location[$location_id];
	}
	else if($get_npc == 1)
	{
		$json_npc = file_get_contents("npc.json");
		$npc = json_decode($json_npc);
		foreach($npc_id as $id)
		{
			$senddata['npc'][] = $npc[$id];
		}
		$senddata['result'] = true;
	}
	echo json_encode($senddata);
?>