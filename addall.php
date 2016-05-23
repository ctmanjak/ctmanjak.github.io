<?
	session_start();
	include("../config.cfg");
	extract(array_merge($HTTP_GET_VARS, $HTTP_POST_VARS, $HTTP_SESSION_VARS));
	mysql_connect(HOST, "user", "");
	mysql_select_db("blog");
	
	if($addall == 1)
	{
		if($category == "location")
		{
			$json_locations = file_get_contents("location.json");
			$locations = json_decode($json_locations, true);
			$location_id = count($locations);
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
				$encounter_ids = explode(",", $encounter_id);
				$locations[] = array("id"=>$location_id, "type"=>$type, "name"=>$name, "location_effect"=>$location_effects, "bg"=>$filename, "level"=>$level, "move_location"=>$move_locations, "encounter_id"=>$encounter_ids);
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
			$npcs[] = array("id"=>$npc_id, "char_name"=>$name, "level"=>$level);
			$npcs = json_encode($npcs);
			file_put_contents("npc.json", $npcs);
			print "<script>history.go(-1)</script>";
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
			</select><br>
			<div class="add_info">
				타입 : <select name="type"><option value="town">마을<option value="field">필드<option value="dungeon">던전</select><br>
				이름 : <input type="text" name="name" id="add_name"><span></span><br>
				장소효과 : <select name="location_effect[]" id="location_effect" multiple><option value="nothing">없음<option value="silence">침묵<option value="resistance">면역<option value="debuff">약화<option value="buff">강화</select><div></div>
				배경 : <input type="file" name="image" accept="image/*"><br>
				레벨대 : <input type="number" name="level" min="1" max="150"><br>
				이동 가능 지역 ID : <input type="text" name="move_location"><br>
				인카운터 NPC ID : <input type="text" name="encounter_id"><br>
			</div>
			<input type="submit">
		</form>
		<script src="//<?=HOST?>/js/jquery.min.js"></script>
		<script src="//<?=HOST?>/js/jquery-ui.min.js"></script>
		<script>
			var regex = new RegExp("[^ \t\r\n\v\f]{5,20}");
			$('body').on('change', '#location_effect', function(event)
			{
				var location_effect=$(this).val();
				$(this).next().html("");
				for(var val in location_effect)
				{
					if(location_effect[val] == "resistance")
					{
						$(this).next().append("면역효과 : <select name='resist_type'><option value='physical'>물리<option value='magic'>마법</select><br>");
					}
					if(location_effect[val] == "debuff")
					{
						$(this).next().append("약화효과 : <select name='debuff_type'><option value='stat_str'>힘<option value='stat_agi'>민첩<option value='stat_int'>지능<option value='stat_end'>인내</select><br>");
						$(this).next().append("효과강도 : <input type='range' name='debuff_intensity' min='10' max='90' step='10'><span></span><br>");
					}
					if(location_effect[val] == "buff")
					{
						$(this).next().append("강화효과 : <select name='buff_type'><option value='stat_str'>힘<option value='stat_agi'>민첩<option value='stat_int'>지능<option value='stat_end'>인내</select><br>");
						$(this).next().append("효과강도 : <input type='range' name='buff_intensity' min='10' max='90' step='10'><span></span><br>");
					}
				}
			});
			$('body').on('change', 'input[type="range"]', function(event)
			{
				console.log("range");
				$(this).next().replaceWith("<span> "+$(this).val()+"%</span>");
			});
			$('#category').change(function(event)
			{
				var category = $(this).val();
				console.log(category);
				$(".add_info").html("");
				if(category == "npc")
				{
					$(".add_info").append('이름 : <input type="text" name="name" id="add_name"><span></span><br>'+
					'설명 : <input type="text" name="desc" id="add_desc"><br>'+
					'레벨 : <input type="number" name="level" min="1" max="150" id="add_price"><br>');
				}
				else if(category == "location")
				{
					$(".add_info").append('타입 : <select name="type"><option value="town">마을<option value="field">필드<option value="dungeon">던전</select><br>'+
					'이름 : <input type="text" name="name" id="add_name"><span></span><br>'+
					'장소효과 : <select name="location_effect" class="location_effect"><option value=0>없음<option value=0x4>침묵<option value=0x40>면역<option value=0x80>약화<option value=0x100>강화</select><div></div>'+
					'배경 : <input type="file" name="bg" accept="image/*"><br>'+
					'레벨대 : <input type="number" name="level" min="1" max="150"><br>'+
					'이동 가능 지역 ID : <input type="text" name="move_location"><br>'+
					'인카운터 NPC ID : <input type="text" name="encounter_id"><br>');
				}
				else if(category == "monster")
				{
					
				}
				else if(category == "item")
				{
					$(".add_info").append('이름 : <input type="text" name="name" id="add_name"><span></span><br>'+
					'설명 : <input type="text" name="desc" id="add_desc"><br>'+
					'가격 : <input type="number" name="price" value="100" id="add_price"><br>'+
					'인챈트 : <input type="number" name="price" value="100" id="add_price"><br>'+
					'가격 : <input type="number" name="price" value="100" id="add_price"><br>');
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