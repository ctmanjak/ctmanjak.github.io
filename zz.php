<?
	session_start();
	include("../config.cfg");
	extract(array_merge($HTTP_GET_VARS, $HTTP_POST_VARS, $HTTP_SESSION_VARS));
	mysql_connect(HOST, "user", "");
	mysql_select_db("blog");
	
		$file_location = file_get_contents("location.json");
		$location = json_decode($file_location, true);
		print_r($location);
		print_r($file_location);
		$senddata['location'] = $location[$location_id];
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
			/*var exp_table = {};
			var points = 0;
			var output = 0;
			var minlevel = 2;
			var maxlevel = 150;

			for (lvl = 1; lvl <= maxlevel; lvl++)
			{
			  points += Math.floor(lvl + 300 * Math.pow(2, lvl / 7.));
			  if (lvl >= minlevel)
			  {
				document.writeln('Level ' + (lvl) + ' - ' + output + ' xp');
				exp_table[lvl] = output;
			  }
			  output = Math.floor(points / 4);
			}
			var exp = JSON.stringify(exp_table);*/
		</script>
	</body>
</html>
<?
include("../footer.php");
?>