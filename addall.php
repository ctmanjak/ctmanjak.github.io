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
					if($val == "resistance") $location_effects[] = array("id" => 0x40, "type" => $resist_type);
					else if($val == "debuff") $location_effects[] = array("id" => 0x80, "type" => $debuff_type, "intensity" => $debuff_intensity);
					else if($val == "buff") $location_effects[] = array("id" => 0x100, "type" => $buff_type, "intensity" => $buff_intensity);
					else if($val == "silence") $location_effects[] = array("id" => 0x4);
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
			$check = @getimagesize($_FILES["image"]["tmp_name"]);
			if($check !== false) $upload = 1;
			else $upload = 0;
			if($upload == 1)
			{
				$name = strip_tags($name);
				$desc = strip_tags($desc);
				$filename = $_FILES['image']['name'];
				$filename = iconv('utf-8', 'euckr', $filename);
				if(!file_exists("./npc/".$filename))
				{
					$dest = "./npc/".$filename;
					$src = $_FILES['image']['tmp_name'];
					move_uploaded_file($src, $dest);
				}
				else
				{
					$ext = pathinfo($filename, PATHINFO_EXTENSION);
					$filename2 = basename($filename, ".".$ext);
					for($i = 1; file_exists("./npc/".$filename); $i++)
					{
						$filename = $filename2."_".$i.".".$ext;
					}
					$dest = "./npc/".$filename;
					$src = $_FILES['image']['tmp_name'];
					move_uploaded_file($src, $dest);
				}
				$npcs[] = array("id"=>$npc_id, "char_name"=>$name, "level"=>$level);
				$npcs = json_encode($npcs);
				file_put_contents("npc.json", $npcs);
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
					if($val == "resistance") $item_effects[] = array("id" => 0x40, "type" => $resist_type);
					else if($val == "debuff")
					{
						if($type == "equip") $item_effects[] = array("id" => 0x80, "type" => $debuff_type, "intensity" => $debuff_intensity, "intensity_type" => $debuff_intensity_type);
						else $item_effects[] = array("id" => 0x80, "type" => $debuff_type, "intensity" => $debuff_intensity, "intensity_type" => $debuff_intensity_type, "duration"=>$debuff_duration);
						
					}
					else if($val == "buff")
					{
						if($type == "equip") $item_effects[] = array("id" => 0x100, "type" => $buff_type, "intensity" => $buff_intensity, "intensity_type" => $buff_intensity_type);
						else $item_effects[] = array("id" => 0x100, "type" => $buff_type, "intensity" => $buff_intensity, "intensity_type" => $buff_intensity_type, "duration"=>$buff_duration);
					}
					else if($val == "silence") $item_effects[] = array("id" => 0x4);
					else if($val == "nothing") $item_effects[] = array("id" => 0);
				}
				$data["id"] = $item_id;
				$data["type"]=$type;
				$data["name"]=$name;
				$data["desc"]=$desc;
				$data["image"]=$filename;
				if(!empty($item_effects)) $data["item_effect"] = $item_effects;
				if(!empty($equip_slot)) $data["equip_slot"] = $equip_slot;
				$items[] = $data;
				$items = json_encode($items);
				file_put_contents("item.json", $items);
				print "<script>history.go(-1)</script>";
			}else print "<script>alert('이미지 파일만 업로드할 수 있습니다.');history.go(-1)</script>";
		}
	}
?>
<html>
	<head>
		<meta charset="utf-8">
		<link type="text/css" href="style.css" rel="stylesheet">
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
				<option value="item">아이템
				<option value="item">퀘스트
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
				for(var val in magic_effect)
				{
					if(magic_effect[val] == "silence" && category == "item")
					{
						$(this).next().append("지속시간 : <input type='range' name='silence_duration' min='5' max='100' step='5'><span></span><br>");
					}
					if(magic_effect[val] == "resistance")
					{
						$(this).next().append("면역효과 : <select name='resist_type'><option value='physical'>물리<option value='magic'>마법</select><br>");
					}
					if(magic_effect[val] == "debuff")
					{
						$(this).next().append("약화효과 : <select name='debuff_type'><option value='stat_str'>힘<option value='stat_agi'>민첩<option value='stat_int'>지능<option value='stat_end'>인내<option value='ad'>공격력<option value='as'>공격속도<option value='hp'>HP<option value='mp'>MP<option value='ms'>이동속도<option value='armor'>방어력<option value='resist'>마법저항력</select><br>");
						$(this).next().append("효과강도(%) : <input type='range' name='debuff_intensity' min='5' max='1000' step='5'><span></span><input type='radio' name='debuff_intensity_type' value='percent'><br>");
						$(this).next().append("효과강도(value) : <input type='range' name='debuff_intensity' min='5' max='1000' step='5'><span></span><input type='radio' name='debuff_intensity_type' value='value' checked><br>");
						if($("#item_type").val() == "consume") $(this).next().append("지속시간 : <input type='range' name='debuff_duration' min='5' max='100' step='5'><span></span><br>");
					}
					if(magic_effect[val] == "buff")
					{
						$(this).next().append("강화효과 : <select name='buff_type'><option value='stat_str'>힘<option value='stat_agi'>민첩<option value='stat_int'>지능<option value='stat_end'>인내<option value='ad'>공격력<option value='as'>공격속도<option value='hp'>HP<option value='mp'>MP<option value='ms'>이동속도<option value='armor'>방어력<option value='resist'>마법저항력</select><br>");
						$(this).next().append("효과강도(%) : <input type='range' name='buff_intensity' min='5' max='1000' step='5'><span></span><input type='radio' name='buff_intensity_type' value='percent'><br>");
						$(this).next().append("효과강도(value) : <input type='range' name='buff_intensity' min='5' max='1000' step='5'><span></span><input type='radio' name='buff_intensity_type' value='value' checked><br>");
						if($("#item_type").val() == "consume") $(this).next().append("지속시간 : <input type='range' name='buff_duration' min='5' max='100' step='5'><span></span><br>");
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
					$(".add_info").append('이름 : <input type="text" name="name"><span></span><br>'+
					'레벨 : <input type="number" name="level" min="1" max="150"><br>'+
					'사진 : <input type="file" name="image" accept="image/*"><br>'+
					'HP : <input type="number" name="hp" min="1"><br>'+
					'MP : <input type="number" name="mp" min="1"><br>'+
					'공격력 : <input type="number" name="ad" min="1"><br>'+
					'공격속도 : <input type="number" name="as" min="1"><br>'+
					'이동속도 : <input type="number" name="ms" min="1"><br>'+
					'방어력 : <input type="number" name="armor" min="1"><br>'+
					'마법저항력 : <input type="number" name="resist" min="1"><br>'+
					'힘 : <input type="number" name="stat_str" min="1"><br>'+
					'민첩 : <input type="number" name="stat_agi" min="1"><br>'+
					'지능 : <input type="number" name="stat_int" min="1"><br>'+
					'인내 : <input type="number" name="stat_end" min="1"><br>'+
					'아이템 : <input type="text" name="equip_slot" min="1"><br>'+
					'돈 : <input type="number" name="money" min="1"><br>');
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
				else if(category == "monster")
				{
					
				}
				else if(category == "item")
				{
					$(".add_info").append('타입 : <select name="type" id="item_type"><option value="consume">소모품<option value="equip">장비<option value="etc">기타</select><span></span><br>'+
					'사진 : <input type="file" name="image" accept="image/*"><br>'+
					'이름 : <input type="text" name="name"><span></span><br>'+
					'설명 : <input type="text" name="desc" id="add_desc"><br>'+
					'아이템효과 : <select name="item_effect[]" class="magic_effect" id="item_effect" multiple><option value="nothing" selected>없음<option value="silence">침묵<option value="resistance">면역<option value="debuff">약화<option value="buff">강화</select><div></div>'+
					'가격 : <input type="number" name="price" value="100"><br>');
				}
			});
			$("body").on("change", "#item_type", function(event)
			{
				var item_type = $(this).val();
				$(this).next().empty();
				if(item_type == "equip")
				{
					$(this).next().append("부위 : <select name='equip_slot'><option value='head'>머리<option value='u_body'>상체<option value='l_body'>하체<option value='a_hands'>손(방어구)<option value='foot'>발<option value='w_hands'>손(무기)");
				}
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