<?
	session_start();
	include("config.cfg");
	extract(array_merge($HTTP_GET_VARS, $HTTP_POST_VARS, $HTTP_SESSION_VARS));
	mysql_connect(HOST, "user", "");
	mysql_select_db("blog");
	
	if($chk_name == 1)
	{
		$result = preg_match("/[a-z0-9_-]{5,20}/", $user_name, $matches);
		if($matches[0] != $user_name || empty($matches[0]))
		{
			$senddata['result'] = true;
			$senddata['error_type'] = 2;
		}
		else
		{
			$sql = mysql_query("select username from user where username='$user_name'");
			$data = mysql_fetch_array($sql);
			if(!empty($data))
			{
				$senddata['result'] = true;
				$senddata['error_type'] = 1;
			}
			else
			{
				$senddata['result'] = true;
				$senddata['error_type'] = 0;
			}
		}
		echo json_encode($senddata);
		exit;
	}
	else if($chk_pwd == 1)
	{
		preg_match("/[^ \t\r\n\v\f]{5,20}/", $user_pwd, $matches);
		if($matches[0] != $user_pwd || empty($matches[0]))
		{
			$senddata['result'] = true;
			$senddata['error_type'] = 1;
		}
		else
		{
			$senddata['result'] = true;
			$senddata['error_type'] = 0;
		}
		echo json_encode($senddata);
		exit;
	}
	else if($chk_item == 1)
	{
		$result = preg_match("/[^ \t\r\n\v\f.]{5,20}/", $item_name, $matches);
		if($matches[0] != $item_name || empty($matches[0]))
		{
			$senddata['result'] = true;
			$senddata['error_type'] = 2;
		}
		else
		{
			$sql = mysql_query("select * from item where item_image like '".$item_name.".%'");
			$data = mysql_fetch_array($sql);
			if(!empty($data))
			{
				$senddata['result'] = true;
				$senddata['error_type'] = 1;
			}
			else
			{
				$senddata['result'] = true;
				$senddata['error_type'] = 0;
			}
		}
		echo json_encode($senddata);
		exit;
	}
?>
<html>
	<head>
		<meta charset="utf-8">
		<link type="text/css" href="style.css" rel="stylesheet">
	</head>
	<body>
		
		<script src="//code.jquery.com/jquery-1.12.3.min.js"></script>
		<script src="//code.jquery.com/ui/1.11.4/jquery-ui.js"></script>
		<script>
		
		</script>
	</body>
</html>
<?
include("footer.php");
?>