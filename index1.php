<?
	/*session_start();
	include("../config.cfg");
	extract(array_merge($HTTP_GET_VARS, $HTTP_POST_VARS, $HTTP_SESSION_VARS));
	mysql_connect(HOST, "user", "");
	mysql_select_db("blog");
	if(!empty($logged) && $logged == 1)
	{
		//log_id
		$sql = mysql_query("select user.id, username, nickname from user left join user_info on user.id=user_info.id where user_info.id=$log_id");
		$data = mysql_fetch_array($sql);
		$log_nick = $data[nickname];
		$log_name = $data[username];
		$sql = mysql_query("select * from user left join user_info on user.id=user_info.id where user_info.id=$log_id");
		$data = mysql_fetch_array($sql);
		foreach($data as $key => $value) if(!is_numeric($key)) $returndata[$key] = $value;
		extract($returndata);
	}
	else if(empty($logged) || $logged == 0)
	{
		echo "<script>alert('로그인 해주세요.');location.href='../login.php'</script>";
	}*/
?>
<html>
	<head>
		<title>게임</title>
		<meta charset="utf-8">
		<link type="text/css" href="style.css" rel="stylesheet">
	</head>
	<frameset rows="100%,*" border="0">
		<frame src="/game/main.php" frameborder="0"></frame>
		<frame noresize frameborder="0"></frame>
	</frameset>
</html>