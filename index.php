<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html>
<head>
	<title>
	<?php 
		if(!$_GET['pagetitle']) echo "FindHills.com: Find a Hill to Longboard Near You";
		else {
			$title = $_GET['pagetitle'];
			$title = explode("&",$title);
			$pagetitle = $title[0];

			$fb_title = $pagetitle;
			$fb_description = "FindHills helps you find hills to longboard. Go bomb a hill!";

			echo $pagetitle;

			try {
				$title = explode("FindHills.com - ", $title[0]);
				$title = $title[1];

				$title = explode(") ", $title);
				$distance = $title[1];
				$title = $title[0];

				$title = explode(" (", $title);
				$title = $title[0];

				$title = explode(". ", $title);
				$location = $title[0];
				$grade = $title[1];
				$grade_int = explode("%",$grade);
				$grade_int = intval($grade_int[0]);
				if ($grade_int < 0.5) {
					$grade_int = 0;
				} else if ($grade_int >= 0.5 && $grade_int < 3) {
					$grade_int = 3;
				} else if ($grade_int >= 3 && $grade_int < 6) {
					$grade_int = 6;
				} else if ($grade_int >= 6 && $grade_int < 9) {
					$grade_int = 9;
				} else if ($grade_int >= 9) {
					$grade_int = 12;
				}

				$fb_title = "Found a run $distance long and $grade steep on findhills.com";
				$fb_description = "Located in $location";
			} catch (Exception $e) {
				// argh
				echo "<!-- Error $e -->";
			}
		}

		$actual_link = "http://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";

		$fb_img_num = rand(1,3);
	?>
	</title>

	<?php echo "<!-- $grade_int -->"; ?>
	
	<link rel="stylesheet" href="styles.css" type="text/css" media="all" />
	<link rel="image_src" href="http://www.findhills.com/images/fb_link_share_<?php echo $grade_int; ?>pct.jpg" />
	<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css">
	
	<meta name="viewport" content="initial-scale=1.0, user-scalable=no" />
	<meta http-equiv="content-type" content="text/html; charset=UTF-8"/>
	
	<meta property="og:title" content="<?php echo $fb_title ?>" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="<?php echo $actual_link; ?>" />
	<meta property="og:site_name" content="FindHills" />
	<meta property="fb:admins" content="100004388650503" />
	<meta property="og:description" content="<?php echo $fb_description ?>"/>


	<meta property="og:image" content="http://www.findhills.com/images/fb_link_share_<?php echo $grade_int; ?>pct.jpg" />
	<meta property="og:image:url" content="http://www.findhills.com/images/fb_link_share_<?php echo $grade_int; ?>pct.jpg" />
	<meta property="og:width" content="1200" />
	<meta property="og:height" content="627" />
	
	<script type="text/javascript" src="http://www.google.com/jsapi"></script>
	<script type="text/javascript" src="http://maps.google.com/maps/api/js?sensor=false"></script>
	<script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
	<script type="text/javascript" src="js/jquery.ba-bbq.min.js"></script>
	<script type="text/javascript" src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js"></script>
	<script type="text/javascript" src="js/js.js"></script>
	
	<!-- UserVoice -->
	<script type="text/javascript">
		var uvOptions = {};
		(function() {
		var uv = document.createElement('script'); uv.type = 'text/javascript'; uv.async = true;
		uv.src = ('https:' == document.location.protocol ? 'https://' : 'http://') + 'widget.uservoice.com/V8Bpgv5YPxfM4LXUBtcLfQ.js';
		var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(uv, s);
		})();
	</script>
	
	<!-- GA -->
	<script type="text/javascript">

	  var _gaq = _gaq || [];
	  _gaq.push(['_setAccount', 'UA-2431727-51']);
	  _gaq.push(['_trackPageview']);

	  (function() {
		var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
		ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
		var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
	  })();

	</script>
</head>
<body>
	<div id="fb-root"></div>
	<script>(function(d, s, id) {
	  var js, fjs = d.getElementsByTagName(s)[0];
	  if (d.getElementById(id)) return;
	  js = d.createElement(s); js.id = id;
	  js.src = "//connect.facebook.net/en_US/sdk.js#xfbml=1&appId=355307247889949&version=v2.0";
	  fjs.parentNode.insertBefore(js, fjs);
	}(document, 'script', 'facebook-jssdk'));</script>

	<div id="topnav">
		<h1 id="banner">
			<a href="http://www.findhills.com/">FindHills</a>
		</h1>

		<ul id="fblike">
			<!--<li><div class="fb-like" data-href="http://www.findhills.com" data-send="true" data-layout="button_count" data-width="260" data-show-faces="false"></div></li>-->
			<li><script src="http://connect.facebook.net/en_US/all.js#xfbml=1"></script><fb:like href="http://www.facebook.com/findhills" layout="button_count" show_faces="true" width="150"></fb:like></li>
		</ul>
		
		<div id="search">
			<input type="text" id="address" class="form-control" onkeypress="return addressKeyHandler(event)" placeholder="Search for address or location" />
			<div class="btn-group">
				<button id="searchbutton" type="button" class="btn btn-primary active" onclick="reset(); addAddress();return False;"><span class="glyphicon glyphicon-search" aria-hidden="true"></span></button>
				<button id="dropdownbutton" type="button" class="btn btn-danger dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
					<span class="caret"></span>
					<span class="sr-only">Toggle Dropdown</span>
				</button>
				<ul class="dropdown-menu dropdown-menu-form">
					<form id="mode" onchange="updateElevation()">
						<div class="radio">
							<label>
								<input type="radio" name="modeRadio" id="modeRadio1" value="bicycling">
								Bicycling
							</label>
						</div>
						<div class="radio">
							<label>
								<input type="radio" name="modeRadio" id="modeRadio2" value="direct">
								Direct
							</label>
						</div>
						<div class="radio">
							<label>
								<input type="radio" name="modeRadio" id="modeRadio3" value="driving" checked>
								Driving
							</label>
						</div>
						<div class="radio">
							<label>
								<input type="radio" name="modeRadio" id="modeRadio3" value="walking">
								Walking
							</label>
						</div>
					</form>
				</ul>=
			</div>
		</div>

		<ul id="globalnav">
			<li><a id="homelink" href="http://www.findhills.com/">Home</a></li>
			<li><a id="bloglink" href="http://blog.findhills.com/">Blog</a></li>
			<li><a id="fbpagelink" href="http://www.facebook.com/pages/FindHillscom/340839559342189">Facebook</a></li>
			<li><a id="helplink" href="https://www.youtube.com/watch?v=TK_gelmHU-g" target="_blank">How do I use this?</a></li>
		</ul>
	</div>

	<div id="map_canvas"></div>
	
	<div id="leftnav">
		<div id="minmax">
			<table>
				<tr>
					<td>DISTANCE</td>
					<td>GRADE</td>
					<td>STEEPEST</td>
				</tr>
				<tr id="stats">
					<td id="run"></td>
					<td id="grade"></td>
					<td id="steepest"></td>
				</tr>
			</table>

			<table>
				<tr>
					<td>
						<label class="checkbox-inline">
							<input type="radio" name="measurement" value="imperial" checked/> Miles
						</label>

						<label class="checkbox-inline">
							<input type="radio" name="measurement" value="metric"/> Kilometers 
						</label>
					</td>
				</tr>
			</table>
		</div>
		
		<div id="elevation">Total elevation: <span id="rise"></span></div>

		<div id="chart_div" onmouseout="clearMouseMarker()"></div>
		
		<div id="legend"><img src="images/legend2.png" alt="legend" /></div>

		<div id="urlbox">
			<form class="form-inline">
				<button type="button" id="shorten"  onclick="shortenUrl()" class="btn btn-primary">Get short URL</button>
					
				<div class="form-group">
					<input type="text" id="url" onclick="this.select()" class="form-control" value="http://findhills.com/"/>
				</div>
			</form>		
		</div>
	</div>
		
	<div id="clear">
		<button type="button" class="btn btn-danger" onclick="reset();return False;">Clear Map</button>
	</div>
  
</body>
</html>
