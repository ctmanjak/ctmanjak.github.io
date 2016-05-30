<?
	session_start();
	include("config.cfg");
	extract(array_merge($HTTP_GET_VARS, $HTTP_POST_VARS, $HTTP_SESSION_VARS));
	mysql_connect(HOST, "user", "");
	mysql_select_db("blog");
	
	if($addall == 1)
	{
		if($category == "location")
		{
			$json_locations = file_get_contents("location.json");
			$locations = json_decode($json_locations, true);
			$id = count($locations);
			$check = @getimagesize($_FILES["image"]["tmp_name"]);
			if($check !== false) $upload = 1;
			else $upload = 0;
			if($upload == 1)
			{
				$name = strip_tags($name);
				$desc = strip_tags($desc);
				$filename = $_FILES['image']['name'];
				$filename = iconv('utf-8', 'euckr', $filename);
				if(!file_exists("./bg/".$filename))
				{
					$dest = "./bg/".$filename;
					$src = $_FILES['image']['tmp_name'];
					move_uploaded_file($src, $dest);
				}
				else
				{
					$ext = pathinfo($filename, PATHINFO_EXTENSION);
					$filename2 = basename($filename, ".".$ext);
					for($i = 1; file_exists("./bg/".$filename); $i++)
					{
						$filename = $filename2."_".$i.".".$ext;
					}
					$dest = "./bg/".$filename;
					$src = $_FILES['image']['tmp_name'];
					move_uploaded_file($src, $dest);
				}
				foreach($location_effect as $val)
				{
					if($val == "resistance") $location_effects[] = array("id" => 7, "type" => $resist_type);
					else if($val == "debuff") $location_effects[] = array("id" => 8, "type" => $debuff_type, "intensity" => $debuff_intensity, "intensity_type" => $debuff_intensity_type);
					else if($val == "buff") $location_effects[] = array("id" => 9, "type" => $buff_type, "intensity" => $buff_intensity, "intensity_type" => $buff_intensity_type);
					else if($val == "silence") $location_effects[] = array("id" => 3);
					else if($val == "nothing"); $location_effects[] = array("id" => 0);
				}
				$move_locations = explode(",", $move_location);
				$sub_locations = explode(",", $sub_location);
				$encounter_ids = explode(",", $encounter_id);
				if(!empty($move_locations)) $data['move_location'] = $move_locations;
				if(!empty($sub_locations)) $data['sub_location'] = $sub_locations;
				if(!empty($encounter_ids)) $data['encounter_id'] = $encounter_ids;
				if(!empty($level)) $data['level'] = $level;
				$data['id'] = $id;
				$data["type"]=$type;
				$data["name"]=$name;
				$data["bg"]=$filename;
				$locations[] = $data;
				$locations = json_encode($locations);
				file_put_contents("location.json", $locations);
				print "<script>history.go(-1)</script>";
			}else print "<script>alert('이미지 파일만 업로드할 수 있습니다.');history.go(-1)</script>";
		}
		else if($category == "npc")
		{
			$json_npcs = file_get_contents("npc.json");
			$npcs = json_decode($json_npcs, true);
			$npc_id = count($npcs);
			foreach($_FILES["image"]["tmp_name"] as $key => $val)
			{
				$check[$key] = @getimagesize($_FILES["image"]["tmp_name"][$key]);
			}
			foreach($check as $val)
			{
				if($val !== false)
				{
					$upload = 1;
					break;
				}
				else $upload = 0;
			}
			if($upload == 1)
			{
				foreach($name as $key => $val)
				{
					$name[$key] = strip_tags($name[$key]);
					$desc[$key] = strip_tags($desc[$key]);
					$filename[$key] = $_FILES['image']['name'][$key];
					$filename[$key] = iconv('utf-8', 'euckr', $filename[$key]);
					if(!file_exists("./npc/".$filename[$key]))
					{
						$dest[$key] = "./npc/".$filename[$key];
						$src[$key] = $_FILES['image']['tmp_name'][$key];
						move_uploaded_file($src[$key], $dest[$key]);
					}
					else
					{
						$ext[$key] = pathinfo($filename[$key], PATHINFO_EXTENSION);
						$filename2[$key] = basename($filename[$key], ".".$ext[$key]);
						for($i = 1; file_exists("./npc/".$filename[$key]); $i++)
						{
							$filename[$key] = $filename2[$key]."_".$i.".".$ext[$key];
						}
						$dest[$key] = "./npc/".$filename[$key];
						$src[$key] = $_FILES['image']['tmp_name'][$key];
						move_uploaded_file($src[$key], $dest[$key]);
					}
					$data["npcs"][$key]['char_name'] = $name[$key];
					$data["npcs"][$key]['level'] = $level[$key];
					$data["npcs"][$key]['image'] = $filename[$key];
					if(!empty($dialogue[$key])) $data["npcs"][$key]['dialogue'] = explode(",", $dialogue[$key]);
					if(!empty($max_hp[$key])) $data["npcs"][$key]['max_hp'] = $max_hp[$key];
					if(!empty($max_mp[$key])) $data["npcs"][$key]['max_mp'] = $max_mp[$key];
					if(!empty($ad[$key])) $data["npcs"][$key]['ad'] = $ad[$key];
					if(!empty($as[$key])) $data["npcs"][$key]['as'] = $as[$key];
					if(!empty($ms[$key])) $data["npcs"][$key]['ms'] = $ms[$key];
					if(!empty($armor[$key])) $data["npcs"][$key]['armor'] = $armor[$key];
					if(!empty($resist[$key])) $data["npcs"][$key]['resist'] = $resist[$key];
					if(!empty($stat_str[$key])) $data["npcs"][$key]['stat_str'] = $stat_str[$key];
					if(!empty($stat_agi[$key])) $data["npcs"][$key]['stat_agi'] = $stat_agi[$key];
					if(!empty($stat_int[$key])) $data["npcs"][$key]['stat_int'] = $stat_int[$key];
					if(!empty($stat_end[$key])) $data["npcs"][$key]['stat_end'] = $stat_end[$key];
					if(!empty($inventory[$key]))
					{
						$data["npcs"][$key]['inventory'] = array();
						$inventory_temp = explode(",",$inventory[$key]);
						for($i = 0; $i < count($inventory_temp); $i++)
						{
							$data["npcs"][$key]['inventory'][$i] = $inventory_temp[$i];
						}
					}
					if(!empty($equip_slot[$key]))
					{
						$data["npcs"][$key]['equip_slot'] = explode(",", $equip_slot[$key]);
					}
					if(!empty($quest[$key]))
					{
						$data["npcs"][$key]['quest'] = explode(",", $quest[$key]);
					}
				}
				$data['group_name'] = $group_name;
				$data['id'] = $npc_id;
				$npcs[] = $data;
				$npcs = json_encode($npcs);
				file_put_contents("npc.json", $npcs);
				print "<script>history.go(-1)</script>";
			}else print "<script>alert('이미지 파일만 업로드할 수 있습니다.');history.go(-1)</script>";
		}
		else if($category == "monster")
		{
			$json_monsters = file_get_contents("monster.json");
			$monsters = json_decode($json_monsters, true);
			$monster_id = count($monsters);
			$check = @getimagesize($_FILES["image"]["tmp_name"]);
			if($check !== false) $upload = 1;
			else $upload = 0;
			if($upload == 1)
			{
				$name = strip_tags($name);
				$desc = strip_tags($desc);
				$filename = $_FILES['image']['name'];
				$filename = iconv('utf-8', 'euckr', $filename);
				if(!file_exists("./monster/".$filename))
				{
					$dest = "./monster/".$filename;
					$src = $_FILES['image']['tmp_name'];
					move_uploaded_file($src, $dest);
				}
				else
				{
					$ext = pathinfo($filename, PATHINFO_EXTENSION);
					$filename2 = basename($filename, ".".$ext);
					for($i = 1; file_exists("./monster/".$filename); $i++)
					{
						$filename = $filename2."_".$i.".".$ext;
					}
					$dest = "./monster/".$filename;
					$src = $_FILES['image']['tmp_name'];
					move_uploaded_file($src, $dest);
				}
				$data['id'] = $monster_id;
				$data['char_name'] = $name;
				$data['level'] = $level;
				if(!empty($max_hp)) $data['max_hp'] = $max_hp;
				if(!empty($max_mp)) $data['max_mp'] = $max_mp;
				if(!empty($ad)) $data['ad'] = $ad;
				if(!empty($as)) $data['as'] = $as;
				if(!empty($ms)) $data['ms'] = $ms;
				if(!empty($armor)) $data['armor'] = $armor;
				if(!empty($resist)) $data['resist'] = $resist;
				if(!empty($stat_str)) $data['stat_str'] = $stat_str;
				if(!empty($stat_agi)) $data['stat_agi'] = $stat_agi;
				if(!empty($stat_int)) $data['stat_int'] = $stat_int;
				if(!empty($stat_end)) $data['stat_end'] = $stat_end;
				if(!empty($inventory))
				{
					$data['inventory'] = array();
					$inventory = explode(",",$inventory);
					for($i = 0; $i < count($inventory); $i++)
					{
						$data['inventory'][$i] = $inventory[$i];
					}
				}
				if(!empty($equip_slot))
				{
					$data['equip_slot'] = explode(",", $equip_slot);
				}
				$monsters[] = $data;
				$monsters = json_encode($monsters);
				file_put_contents("monster.json", $monsters);
				print "<script>history.go(-1)</script>";
			}else print "<script>alert('이미지 파일만 업로드할 수 있습니다.');history.go(-1)</script>";
		}
		else if($category == "item")
		{
			$json_items = file_get_contents("item.json");
			$items = json_decode($json_items, true);
			$item_id = count($items);
			$check = @getimagesize($_FILES["image"]["tmp_name"]);
			if($check !== false) $upload = 1;
			else $upload = 0;
			if($upload == 1)
			{
				$name = strip_tags($name);
				$desc = strip_tags($desc);
				$filename = $_FILES['image']['name'];
				$filename = iconv('utf-8', 'euckr', $filename);
				if(!file_exists("./item/".$filename))
				{
					$dest = "./item/".$filename;
					$src = $_FILES['image']['tmp_name'];
					move_uploaded_file($src, $dest);
				}
				else
				{
					$ext = pathinfo($filename, PATHINFO_EXTENSION);
					$filename2 = basename($filename, ".".$ext);
					for($i = 1; file_exists("./item/".$filename); $i++)
					{
						$filename = $filename2."_".$i.".".$ext;
					}
					$dest = "./item/".$filename;
					$src = $_FILES['image']['tmp_name'];
					move_uploaded_file($src, $dest);
				}
				foreach($item_effect as $val)
				{
					if($val == "resistance") $item_effects[] = array("id" => 7, "type" => $resist_type);
					else if($val == "debuff")
					{
						if($type == "equip") $item_effects[] = array("id" => 8, "type" => $debuff_type, "intensity" => $debuff_intensity, "intensity_type" => $debuff_intensity_type);
						else $item_effects[] = array("id" => 8, "type" => $debuff_type, "intensity" => $debuff_intensity, "intensity_type" => $debuff_intensity_type);
						
					}
					else if($val == "buff")
					{
						if($type == "equip") $item_effects[] = array("id" => 9, "type" => $buff_type, "intensity" => $buff_intensity, "intensity_type" => $buff_intensity_type);
						else $item_effects[] = array("id" => 9, "type" => $buff_type, "intensity" => $buff_intensity, "intensity_type" => $buff_intensity_type);
					}
					else if($val == "silence") $item_effects[] = array("id" => 3);
					else if($val == "nothing") $item_effects[] = array("id" => 0);
				}
				$data["id"] = $item_id;
				$data["type"]=$type;
				$data["name"]=$name;
				$data["desc"]=$desc;
				$data["image"]=$filename;
				$data['weight']=$weight;
				if(!empty($item_effects)) $data["item_effect"] = $item_effects;
				if(!empty($equip_slot)) $data["equip_slot"] = $equip_slot;
				if(!empty($weapon_type)) $data["weapon_type"] = $weapon_type;
				if(!empty($effect_duration)) $data["effect_duration"]=$effect_duration;
				
				$items[] = $data;
				$items = json_encode($items);
				file_put_contents("item.json", $items);
				print "<script>history.go(-1)</script>";
			}else print "<script>alert('이미지 파일만 업로드할 수 있습니다.');history.go(-1)</script>";
		}
		else if($category == "quest")
		{
			$json_quests = file_get_contents("quest.json");
			$quests = json_decode($json_quests, true);
			$quest_id = count($quests);
			
			$data['id'] = $quest_id;
			$data['name'] = $name;
			$data['desc'] = $desc;
			$data['complete'] = 0;
			$data['begin_dialogue'] = $begin_dialogue;
			$data['progress_dialogue'] = $progress_dialogue;
			$data['complete_dialogue'] = $complete_dialogue;
			foreach($complete_event as $key => $val)
			{
				$data['complete_condition'][$key]['event'] = $val;
				if($val == "1")
				{
					$data['complete_condition'][$key]['condition']['npc'] = $visit_npc[$key];
				}
				else if($val == "2")
				{
					$data['complete_condition'][$key]['condition']['location'] = $visit_location[$key];
				}
				else if($val == "3")
				{
					$data['complete_condition'][$key]['condition']['npc'] = $give_item_npc[$key];
					$data['complete_condition'][$key]['condition']['item'] = $give_item_id[$key];
				}
				$data['complete_condition'][$key]['state'] = 0;
			}
			foreach($reward as $val)
			{
				if($val == "exp") $data['reward']['exp'][] = $exp_amount;
				else if($val == "money") $data['reward']['money'][] = $money_amount;
			}
			$quests[] = $data;
			$quests = json_encode($quests);
			file_put_contents("quest.json", $quests);
			print "<script>history.go(-1)</script>";
		}
		else if($category == "dialogue")
		{
			$json_dialogues = file_get_contents("dialogue.json");
			$dialogues = json_decode($json_dialogues, true);
			$dialogue_id = count($dialogues);
			
			$data['id'] = $dialogue_id;
			$data['content'] = $content;
			foreach($answer_content as $key => $val)
			{
				$data['answer'][$key]['answer_content'] = $val;
			}
			foreach($answer_event_type as $key => $val)
			{
				$data['answer'][$key]['answer_event_type'] = $val;
			}
			foreach($answer_event as $key => $val)
			{
				$data['answer'][$key]['answer_event'] = $val;
			}
			$dialogues[] = $data;
			$dialogues = json_encode($dialogues);
			file_put_contents("dialogue.json", $dialogues);
			print "<script>history.go(-1)</script>";
		}
	}
?>
<html>
	<head>
		<meta charset="utf-8">
	</head>
	<body>
		<form method="post" action="addall.php" enctype="multipart/form-data" autocomplete="off" id="additem">
			<input type="hidden" name="MAX_FILE_SIZE" value="1048576">
			<input type="hidden" name="addall" value="1">
			<!--<input type="file" name="image" accept="image/*"><br>-->
			<select name="category" id="category">
				<option selected value="location">장소
				<option value="npc">NPC
				<option value="monster">몬스터
				<option value="quest">퀘스트
				<option value="dialogue">대사
				<option value="item">아이템
			</select><br>
			<div class="add_info">
				타입 : <select name="type"><option value="town">마을<option value="field">필드<option value="dungeon">던전</select><br>
				이름 : <input type="text" name="name" id="add_name"><span></span><br>
				장소효과 : <select name="location_effect[]" class="magic_effect" id="location_effect" multiple><option value="nothing" selected>없음<option value="silence">침묵<option value="resistance">면역<option value="debuff">약화<option value="buff">강화</select><div></div>
				배경 : <input type="file" name="image" accept="image/*"><br>
				레벨대 : <input type="number" name="level" min="1" max="150"><br>
				하위 지역 ID : <input type="text" name="sub_location"><br>
				이동 가능 지역 ID : <input type="text" name="move_location"><br>
				인카운터 NPC ID : <input type="text" name="encounter_id"><br>
			</div>
			<input type="submit">
		</form>
		<script src="//<?=HOST?>/js/jquery.min.js"></script>
		<script src="//<?=HOST?>/js/jquery-ui.min.js"></script>
		<script>
			var regex = new RegExp("[^ \t\r\n\v\f]{5,20}");
			var category = "location";
			$('body').on('change', '.magic_effect', function(event)
			{
				var magic_effect=$(this).val();
				$(this).next().html("");
				if($("#item_type").val() == "consume") $(this).next().append("지속시간 : <input type='range' name='effect_duration' min='5' max='100' step='5'><span></span><br>");
				for(var val in magic_effect)
				{
					if(magic_effect[val] == "silence" && category == "item")
					{
						//$(this).next().append("지속시간 : <input type='range' name='silence_duration' min='5' max='100' step='5'><span></span><br>");
					}
					if(magic_effect[val] == "resistance")
					{
						$(this).next().append("면역효과 : <select name='resist_type'><option value='physical'>물리<option value='magic'>마법</select><br>");
					}
					if(magic_effect[val] == "debuff")
					{
						$(this).next().append("약화효과 : <select name='debuff_type'><option value='stat_str'>힘<option value='stat_agi'>민첩<option value='stat_int'>지능<option value='stat_end'>인내<option value='ad'>공격력<option value='as'>공격속도<option value='max_hp'>HP<option value='max_mp'>MP<option value='ms'>이동속도<option value='armor'>방어력<option value='resist'>마법저항력</select><br>");
						$(this).next().append("약화효과강도 : <input type='range' name='debuff_intensity' min='5' max='1000' step='5'><span></span><br><input type='radio' name='debuff_intensity_type' value='percent'>%<br><input type='radio' name='debuff_intensity_type' value='value' checked>값<br>");
						
					}
					if(magic_effect[val] == "buff")
					{
						$(this).next().append("강화효과 : <select name='buff_type'><option value='stat_str'>힘<option value='stat_agi'>민첩<option value='stat_int'>지능<option value='stat_end'>인내<option value='ad'>공격력<option value='as'>공격속도<option value='max_hp'>HP<option value='max_mp'>MP<option value='ms'>이동속도<option value='armor'>방어력<option value='resist'>마법저항력</select><br>");
						$(this).next().append("강화효과강도 : <input type='range' name='buff_intensity' min='5' max='1000' step='5'><span></span><br><input type='radio' name='buff_intensity_type' value='percent'>%<br><input type='radio' name='buff_intensity_type' value='value' checked>값<br>");
					}
				}
			});
			$('body').on('change', 'input[type="range"]', function(event)
			{
				console.log("range");
				$(this).next().replaceWith("<span> "+$(this).val()+"</span>");
			});
			$('#category').change(function(event)
			{
				category = $(this).val();
				console.log(category);
				$(".add_info").html("");
				if(category == "npc")
				{
					$(".add_info").append('그룹 이름 : <input type="text" name="group_name"><span></span><br>'+
					'이름 : <input type="text" name="name[]"><span></span><br>'+
					'레벨 : <input type="number" name="level[]" min="1" max="150"><br>'+
					'사진 : <input type="file" name="image[]" accept="image/*"><br>'+
					'HP : <input type="number" name="max_hp[]"><br>'+
					'MP : <input type="number" name="max_mp[]"><br>'+
					'공격력 : <input type="number" name="ad[]"><br>'+
					'공격속도 : <input type="number" name="as[]"><br>'+
					'이동속도 : <input type="number" name="ms[]"><br>'+
					'방어력 : <input type="number" name="armor[]"><br>'+
					'마법저항력 : <input type="number" name="resist[]"><br>'+
					'힘 : <input type="number" name="stat_str[]"><br>'+
					'민첩 : <input type="number" name="stat_agi[]"><br>'+
					'지능 : <input type="number" name="stat_int[]"><br>'+
					'인내 : <input type="number" name="stat_end[]"><br>'+
					'인벤토리 : <input type="text" name="inventory[]"> ,로 구분<br>'+
					'착용아이템 : <input type="text" name="equip_slot[]"> ,로 구분, 같은 부위 아이템 착용시키면 뒤에 쓴 것 적용, 인벤토리에 있는 순서를 써야함(0부터)<br>'+
					'퀘스트 : <input type="text" name="quest[]"> ,로 구분<br>'+
					'대사 : <input type="text" name="dialogue[]"> ,로 구분<br>'+
					'돈 : <input type="number" name="money[]"> <input type="button" id="add_npc" value="NPC 추가"><div></div>');
				}
				if(category == "monster")
				{
					$(".add_info").append('이름 : <input type="text" name="name"><span></span><br>'+
					'레벨 : <input type="number" name="level" min="1" max="150"><br>'+
					'사진 : <input type="file" name="image" accept="image/*"><br>'+
					'HP : <input type="number" name="max_hp"><br>'+
					'MP : <input type="number" name="max_mp"><br>'+
					'공격력 : <input type="number" name="ad"><br>'+
					'공격속도 : <input type="number" name="as"><br>'+
					'이동속도 : <input type="number" name="ms"><br>'+
					'방어력 : <input type="number" name="armor"><br>'+
					'마법저항력 : <input type="number" name="resist"><br>'+
					'힘 : <input type="number" name="stat_str"><br>'+
					'민첩 : <input type="number" name="stat_agi"><br>'+
					'지능 : <input type="number" name="stat_int"><br>'+
					'인내 : <input type="number" name="stat_end"><br>'+
					'인벤토리 : <input type="text" name="inventory"> ,로 구분<br>'+
					'착용아이템 : <input type="text" name="equip_slot"> ,로 구분, 같은 부위 아이템 착용시키면 뒤에 쓴 것 적용, 인벤토리에 있는 순서를 써야함(0부터)<br>'+
					'돈 : <input type="number" name="money"><br>');
				}
				else if(category == "location")
				{
					$(".add_info").append('타입 : <select name="type"><option value="town">마을<option value="field">필드<option value="dungeon">던전</select><br>'+
					'이름 : <input type="text" name="name" id="add_name"><span></span><br>'+
					'장소효과 : <select name="location_effect[]" class="magic_effect" id="location_effect" multiple><option value="nothing" selected>없음<option value="silence">침묵<option value="resistance">면역<option value="debuff">약화<option value="buff">강화</select><div></div>'+
					'배경 : <input type="file" name="bg" accept="image/*"><br>'+
					'레벨대 : <input type="number" name="level" min="1" max="150"><br>'+
					'하위 지역 ID : <input type="text" name="sub_location"><br>'+
					'이동 가능 지역 ID : <input type="text" name="move_location"><br>'+
					'인카운터 NPC ID : <input type="text" name="encounter_id"><br>');
				}
				else if(category == "quest")
				{
					$(".add_info").append('타입 : <select name="complete_event[]" id="quest_type" multiple><option value="0">없음<option value="1">npc 방문<option value="2">장소 방문<option value="3">아이템 주기<option value="4">돈 주기<option value="5">npc 죽이기</select><div></div>'+
					'조건 : <select name="type" id="quest_condition" multiple><option value="0">없음<option value="1">첫만남<option value="2">진행중인 퀘스트<option value="3">완료한 퀘스트<option value="4">완료하지 않은 퀘스트<option value="5">스탯</select><div></div>'+
					'이름 : <input type="text" name="name" id="add_desc"><br>'+
					'설명 : <input type="text" name="desc" id="add_desc"><br>'+
					'시작 대사 ID : <input type="text" name="begin_dialogue" id="add_dialogue"><br>'+
					'진행중 대사 ID : <input type="text" name="progress_dialogue" id="add_dialogue"><br>'+
					'완료 대사 ID : <input type="text" name="complete_dialogue" id="add_dialogue"><br>'+
					'보상 : <select name="reward[]" id="quest_reward" multiple><option value="exp">경험치<option value="money">돈</select><div></div><br>');
				}
				else if(category == "dialogue")
				{
					$(".add_info").append('내용 : <input type="text" name="content"><div></div>'+
					'대답 : <input type="text" name="answer_content[]" value="다음"><br>대답 시 이벤트 : <select name="answer_event_type[]" id="dialogue_event" multiple><option value="1" selected>없음<option value="2">다음 대사<option value="3">장소 이동<option value="4">아이템 주기<option value="5">돈 주기<option value="6">npc 바꾸기<option value="7">이펙트주기<option value="8">퀘스트 추가<option value="9">퀘스트 완료</select><div><input type="hidden" name="answer_event[]" value="0"></div> <input type="button" id="add_answer" value="대답 추가"><div></div>');
				}
				else if(category == "item")
				{
					$(".add_info").append('타입 : <select name="type" id="item_type"><option value="consume">소모품<option value="equip">장비<option value="etc">기타</select><div></div>'+
					'사진 : <input type="file" name="image" accept="image/*"><br>'+
					'이름 : <input type="text" name="name"><span></span><br>'+
					'설명 : <input type="text" name="desc" id="add_desc"><br>'+
					'아이템효과 : <select name="item_effect[]" class="magic_effect" id="item_effect" multiple><option value="nothing" selected>없음<option value="silence">침묵<option value="resistance">면역<option value="debuff">약화<option value="buff">강화</select><div></div>'+
					'무게 : <input type="number" name="weight" value="1"><br>'+
					'가격 : <input type="number" name="price" value="100"><br>');
				}
			});
			$("body").on("change", "#item_type", function(event)
			{
				var item_type = $(this).val();
				$(this).next().empty();
				if(item_type == "equip")
				{
					$(this).next().append("부위 : <select name='equip_slot' id='equip_slot'><option value='head'>머리<option value='u_body'>상체<option value='l_body'>하체<option value='a_hands'>손(방어구)<option value='foot'>발<option value='w_hands'>손(무기)</select><div></div>");
				}
			});
			$("body").on("change", "#equip_slot", function(event)
			{
				var equip_slot = $(this).val();
				$(this).next().empty();
				if(equip_slot == "w_hands")
				{
					$(this).next().append("타입 : <select name='weapon_type'><option value='onehand'>한손<option value='twohands'>양손<option value='range'>원거리");
				}
			});
			$("body").on("change", "#quest_type", function(event)
			{
				var quest_type = $(this).val();
				$(this).next().empty();
				for(var i = 0; i < quest_type.length; i++)
				{
					if(quest_type[i] == "1")
					{
						$(this).next().append("방문할 NPC ID : <input type='text' name='visit_npc[]'>");
					}
					else if(quest_type[i] == "2")
					{
						$(this).next().append("방문할 장소 ID : <input type='text' name='visit_location[]'>");
					}
					else if(quest_type[i] == "3")
					{
						$(this).next().append("NPC ID : <input type='text' name='give_item_npc[]'>");
						$(this).next().append("아이템 ID : <input type='text' name='give_item_id[]'>");
					}
				}
			});
			$("body").on("click", "#add_answer", function(event)
			{
				$(this).next().append("대답 : <input type='text' name='answer_content[]'><br>대답 시 이벤트 : <select name='answer_event_type[]' id='dialogue_event' multiple><option value='1' selected>없음<option value='2'>다음 대사<option value='3'>장소 이동<option value='4'>아이템 주기<option value='5'>돈 주기<option value='6'>npc 바꾸기<option value='7'>이펙트주기<option value='8'>퀘스트 추가<option value='9'>퀘스트 완료</select><div><input type='hidden' name='answer_event[]' value='0'></div> <input type='button' id='add_answer' value='대답 추가'><div></div>");
				$(this).remove();
			});
			$("body").on("change", "#dialogue_event", function(event)
			{
				var dialogue_event = $(this).val();
				$(this).next().empty();
				if(dialogue_event == "1")
				{
					$(this).next().append("<input type='hidden' name='answer_event[]' value='0'>");
				}
				else if(dialogue_event == "2")
				{
					$(this).next().append("다음 대사 : <input type='number' name='answer_event[]'>");
				}
				else if(dialogue_event == "8")
				{
					$(this).next().append("추가할 퀘스트 : <input type='number' name='answer_event[]'>");
				}
				else if(dialogue_event == "9")
				{
					$(this).next().append("완료할 퀘스트 : <input type='number' name='answer_event[]'>");
				}
			});
			$("body").on("change", "#quest_reward", function(event)
			{
				var quest_reward = $(this).val();
				$(this).next().empty();
				for(var i = 0; i < quest_reward.length; i++)
				{
					if(quest_reward[i] == "exp")
					{
						$(this).next().append("경험치량 : <input type='number' name='exp_amount' value='10'><br>");
					}
					if(quest_reward[i] == "money")
					{
						$(this).next().append("돈 액수 : <input type='number' name='money_amount' value='10'><br>");
					}
				}
			});
			$("body").on("click", "#add_npc", function()
			{
				$(this).next().append('이름 : <input type="text" name="name[]"><span></span><br>'+
					'레벨 : <input type="number" name="level[]" min="1" max="150"><br>'+
					'사진 : <input type="file" name="image[]" accept="image/*"><br>'+
					'HP : <input type="number" name="max_hp[]"><br>'+
					'MP : <input type="number" name="max_mp[]"><br>'+
					'공격력 : <input type="number" name="ad[]"><br>'+
					'공격속도 : <input type="number" name="as[]"><br>'+
					'이동속도 : <input type="number" name="ms[]"><br>'+
					'방어력 : <input type="number" name="armor[]"><br>'+
					'마법저항력 : <input type="number" name="resist[]"><br>'+
					'힘 : <input type="number" name="stat_str[]"><br>'+
					'민첩 : <input type="number" name="stat_agi[]"><br>'+
					'지능 : <input type="number" name="stat_int[]"><br>'+
					'인내 : <input type="number" name="stat_end[]"><br>'+
					'인벤토리 : <input type="text" name="inventory[]"> ,로 구분<br>'+
					'착용아이템 : <input type="text" name="equip_slot[]"> ,로 구분, 같은 부위 아이템 착용시키면 뒤에 쓴 것 적용, 인벤토리에 있는 순서를 써야함(0부터)<br>'+
					'퀘스트 : <input type="text" name="quest[]"> ,로 구분<br>'+
					'대사 : <input type="text" name="dialogue[]"> ,로 구분<br>'+
					'돈 : <input type="number" name="money[]"> <input type="button" id="add_npc" value="NPC 추가"><div></div>');
				$(this).remove();
			});
			/*$('#additem').submit(function()
			{
				if(!($('#item_name').hasClass("checked"))) event.preventDefault();
			});
			$('#item_name').blur(function()
			{
				$.ajax({
						url:"check_regex.php",
						dataType:"json",
						type:"post",
						data:{'chk_item':1, 'item_name':$("#item_name").val()},
						success:function(result)
						{
							if(result['result'] == true)
							{
								if(result['error_type'] == 2)
								{
									$("#item_name").next().replaceWith("<span style='color:#f00;font-weight:bold'> 5~20자의 공백과 .을 제외한 문자만 사용 가능합니다.</span>");
									$("#item_name").removeClass("checked");
								}
								else if(result['error_type'] == 1)
								{
									$("#item_name").next().replaceWith("<span style='color:#f00;font-weight:bold'> 중복되는 아이템 이름이 있습니다.</span>");
									$("#item_name").removeClass("checked");
								}
								else
								{
									$("#item_name").next().replaceWith("<span style='color:#0f0;font-weight:bold'> 사용가능한 이름입니다.</span>");
									$("#item_name").addClass("checked");
								}
							}
						}
					});
			});*/
		</script>
	</body>
</html>