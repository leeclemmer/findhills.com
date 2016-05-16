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

				$fb_title = "This run: $distance long and $grade steep - FindHills.com";
				$fb_description = "Located in $location";
			} catch (Exception $e) {
				// argh
				echo "<!-- Error $e -->";
			}
		}
	?>
	</title>
	
	<link rel="stylesheet" href="/styles.css" type="text/css" media="all" />
	<link rel="image_src" href="http://www.findhills.com/images/fb_link_share_01.jpg" />

	
	<meta name="viewport" content="initial-scale=1.0, user-scalable=no" />
	<meta http-equiv="content-type" content="text/html; charset=UTF-8"/>
	
	<meta property="og:title" content="<?php echo $fb_title ?>" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="http://www.findhills.com" />
	<meta property="og:site_name" content="FindHills" />
	<meta property="fb:admins" content="100004388650503" />
	<meta property="og:description" content="<?php echo $fb_description ?>"/>


	<meta property="og:image" content="http://www.findhills.com/images/fb_link_share_01.jpg" />
	<meta property="og:image:url" content="http://www.findhills.com/images/fb_link_share_01.jpg" />
	<meta property="og:width" content="1200" />
	<meta property="og:height" content="627" />
	
	<script type="text/javascript" src="http://www.google.com/jsapi"></script>
	<script type="text/javascript" src="http://maps.google.com/maps/api/js?sensor=false"></script>
	<script type="text/javascript" src="/js/jquery-1.7.2.min.js"></script>
	<script type="text/javascript" src="/js/jquery.ba-bbq.min.js"></script>
	<script type="text/javascript" src="/js/js.js"></script>
	
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
	<!-- FB Code 
	<div id="fb-root"></div>
	<script>(function(d, s, id) {
	  var js, fjs = d.getElementsByTagName(s)[0];
	  if (d.getElementById(id)) return;
	  js = d.createElement(s); js.id = id;
	  js.src = "//connect.facebook.net/en_US/all.js#xfbml=1";
	  fjs.parentNode.insertBefore(js, fjs);
	}(document, 'script', 'facebook-jssdk'));</script>-->
	
	<div id="leftnav">
		<p>
			<a href="http://www.findhills.com/"><img src="/images/banner_gnarly3.png" alt="FindHills.com - Find Hills to Longboard."/></a>
		</p>
		
		<div id="globalnav">
			<ul>
				<!-- <li><div class="fb-like" data-href="http://www.findhills.com" data-send="true" data-layout="button_count" data-width="260" data-show-faces="false"></div></li>-->
				<li><script src="http://connect.facebook.net/en_US/all.js#xfbml=1"></script><fb:like href="http://www.facebook.com/findhills" layout="button_count" show_faces="true" width="150"></fb:like></li>
				<li><a href="http://www.findhills.com/">Home</a></li>
				<li><a href="http://blog.findhills.com/">Blog</a></li>
				<li><a href="http://www.facebook.com/pages/FindHillscom/340839559342189">Facebook</a></li>
			</ul>
		</div>
		
		<p>
			Address <input type="text" id="address" size="45" onkeypress="return addressKeyHandler(event)"/>
		</p>
		
		<p>
			Mode of travel
			<select id="mode" onchange="updateElevation()">
				<option value="direct">Direct</option>
				<option value="driving">Driving</option>
				<option value="bicycling">Bicycling</option>
				<option value="walking">Walking</option>
			</select>
		</p>
		
		<p>
			Distances in:
			<input type="radio" name="measurement" value="imperial" checked /> feet (imperial)
			<input type="radio" name="measurement" value="metric" /> meters (metric)
		</p>
		
		<div id="minmax">
			<table>
				<tr class="highlight">
					<td>Grade</td>
					<td id="grade" class="highlightno"></td>
				<tr class="highlight">
					<td>Distance</td>
					<td id="run" class="highlightno"></td>
				</tr>
				<tr>
					<td>High Point</td>
					<td id="highpoint"></td>
				</tr>
				<tr>
					<td style="width:100px">Low Point</td>
					<td id="lowpoint"></td>
				</tr>
				<tr>
					<td>Elevation Change</td>
					<td id="rise"></td>
				</tr>
				<tr>
					<td>Steepest Point</td>
					<td id="steepest"></td>
				</tr>
			</table>
		</div>
		
		<div id="chart_div" onmouseout="clearMouseMarker()"></div>
		
		<div id="legend"><img src="/images/legend.png" alt="legend" /></div>
		
		<p>
			<input id="clear" type="button" value="Clear points (or right-click on map)" onclick="reset()"/>
		</p>		
	</div>
	<div id="urlbox">
		Page URL
		<input type="text" id="url" size="40" onclick="this.select()"/>
		<input type="button" id="shorten"  onclick="shortenUrl()" value="Shorten"/>
	</div>
	<div id="map_canvas"></div>
  
</body>
</html>
