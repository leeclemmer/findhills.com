var map = null;
var chart = null;

var geocoderService = null;
var elevationService = null;
var directionsService = null;

var mousemarker = null;
var markers = [];
var polyline = null;
var elevations = null;

var SAMPLES = 256;

var params = $.param.fragment();
var paramsObj = $.deparam(params);

var meter_to_feet = 3.28;
var meter_to_km = 1000;
var feet_to_mile = 5280;

// Load the Visualization API and the piechart package.
google.load("visualization", "1", {
    packages: ["columnchart"]
});

$(function() {
    var myLatlng = new google.maps.LatLng(15, 0);
    var myOptions = {
        zoom: 1,
        center: myLatlng,
        mapTypeId: google.maps.MapTypeId.TERRAIN,
        panControl: false,
        zoomControl: true,
        zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_TOP
        }
    }

    map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
    chart = new google.visualization.ColumnChart(document.getElementById('chart_div'));

    geocoderService = new google.maps.Geocoder();
    elevationService = new google.maps.ElevationService();
    directionsService = new google.maps.DirectionsService();

    google.maps.event.addListener(map, 'click', function (event) {
        addMarker(event.latLng, true);
    });

    google.maps.event.addListener(map, 'rightclick', function (event) {
        reset();
    });

    google.visualization.events.addListener(chart, 'onmouseover', function (e) {
        if (mousemarker == null) {
            mousemarker = new google.maps.Marker({
                position: elevations[e.column].location,
                map: map,
                icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
            });
        } else {
            mousemarker.setPosition(elevations[e.column].location);
        }
    });

    if(paramsObj['location']){
		var points =  paramsObj['location'];
		points = points.split("~");
		
		for(var i = 0; i < points.length; i++) {
			points[i] = points[i].split(",");
		}
		
		var examples = [{
			// Hawaii
			latlngs: points,
			mapType: google.maps.MapTypeId.TERRAIN,
			travelMode: 'driving'
		}];
	} else {
		var examples = [{
			// Hawaii
			latlngs: [
				[20.712807, -156.251335],
				[20.768995, -156.306052]
			],
			mapType: google.maps.MapTypeId.TERRAIN,
			travelMode: 'driving'
		}];
	};
	
	// Bind updateElevation function call to measurement radio buttions
	$('input:radio[name=measurement]').click(function() {
		updateElevation();
	});
	
	// Update measurement system if different from URL; this way bookmarks maintain measurements they were created with
	var url_distancein = getURLParameter('distancein');
	if (url_distancein == 'metric') {
		$('input:radio[name=measurement]')[1].checked = true;
	}
	
	loadExample(examples);
});

// Function to get given URL parameter
function getURLParameter(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
}

// Takes an array of ElevationResult objects, draws the path on the map
// and plots the elevation profile on a GViz ColumnChart
function plotElevation(results) {
    elevations = results;
    var minElevation = 1000000;
    var maxElevation = 0;

    var path = [];
    for (var i = 0; i < results.length; i++) {
        path.push(elevations[i].location);
    }

    if (polyline) {
        polyline.setMap(null);
    }

    polyline = new google.maps.Polyline({
        path: path,
        strokeColor: "#000000",
        map: map
    });

    // Table to hold elevation data to be displayed in bar chart
	// Has 1 row and SAMPLES number of columns to have different colored bars
	var data = new google.visualization.DataTable();
    data.addRow();
    
	// Smoothing refers to how many bars to "look back" to determine grade within the graph
	var measurement = $("input[name=measurement]:checked").val(); // imperial or metric
	var smoothing = 16;
	var subGrade = 0; // Grade for portion of run
	var maxGrade = 0; // Steepest point
	var distance = document.getElementById('run').innerHTML.split(" ")[0];
	var thecolors = [];
	var subDistance
	if (measurement == 'imperial') {
		subDistance = (distance * 1609) / (SAMPLES/smoothing); // Distance for sub chunk of run; * 1609 convert miles to meters
	} else if (measurement == 'metric') {
		subDistance = (distance * 1000) / (SAMPLES/smoothing);
	}
	
    for (var i = 0; i < results.length; i++) {
        // Add column for each elevation height (row would be: data.addRow(['', elevations[i].elevation]);)
		// and set row value for column to elevation; * 3.28 converts meters to feet
        if (measurement == 'imperial') {
        	data.addColumn('number', 'Elevation at this point (in ft):');
			data.setCell(0,i, Math.round(elevations[i].elevation*meter_to_feet));
		} else if (measurement == 'metric') {
			data.addColumn('number', 'Elevation at this point (in m):');
			data.setCell(0,i, Math.round(elevations[i].elevation));
		}
		
		// Set Minimum and Maximum Elevation
        if (elevations[i].elevation > maxElevation) maxElevation = elevations[i].elevation;
        if (elevations[i].elevation < minElevation) minElevation = elevations[i].elevation;

       
		// Get grades for portions of run and set colors of bar accordingly
		if (i > (smoothing - 1)) {
            subGrade = calcGrade(((elevations[i].elevation) - elevations[i-smoothing].elevation),subDistance);
        } else {
            subGrade = calcGrade(((elevations[i].elevation) - elevations[i+smoothing].elevation),subDistance);
        }
		
		if (Math.abs(subGrade) > maxGrade) maxGrade = Math.abs(subGrade);
		
		thecolors.push("#" + chooseColor(Math.abs(subGrade)));
    }
	
	// Convert to feet
	if (measurement == 'imperial') {
		minElevation *= 3.28;
		maxElevation *= 3.28;
	}
	
	var rise = (maxElevation - minElevation).toFixed(0); 
	var grade = 0;
    if (measurement == 'imperial') {
    	grade = calcGrade(rise, distance * feet_to_mile);
    } else if (measurement == 'metric') {
    	grade = calcGrade(rise,distance * meter_to_km)
    }
    
	// Draw info box    
	document.getElementById('grade').innerHTML = grade + "%";
	if (measurement == 'imperial') {		
		/*document.getElementById('highpoint').innerHTML = maxElevation.toFixed(0) + " ft";
	    document.getElementById('lowpoint').innerHTML = minElevation.toFixed(0) + " ft";*/
	    document.getElementById('rise').innerHTML = rise + " ft";
	} else if (measurement == 'metric') {		
		/*document.getElementById('highpoint').innerHTML = maxElevation.toFixed(0) + " m";
	    document.getElementById('lowpoint').innerHTML = minElevation.toFixed(0) + " m";*/
	    document.getElementById('rise').innerHTML = rise + " m";
	}
    document.getElementById('steepest').innerHTML = maxGrade + "%";
    
	// Unhide info box, chart box, and legend
    document.getElementById('minmax').style.display = 'block';
    document.getElementById('elevation').style.display = 'block';
    document.getElementById('chart_div').style.display = 'block';	
    document.getElementById('legend').style.display = 'block';  
    document.getElementById('urlbox').style.display = 'block';
    
	// Draw the chart
	chart.draw(data, {
		backgroundColor:'#fff',
		titleColor:'#000',
		width:351,
		height: 200,
		legend: 'none',
		titleY: 'Elevation',
		focusBorderColor: '#00ff00',
		colors: thecolors
	});
	
	// Update page title
	updateTitle(grade,maxGrade,distance);
}

// Pick color for section of grade
function chooseColor(grade) {
    if (Math.round(grade) < 0.5) {
        return 'd9d9d9';
    } else if (Math.round(grade) < 3) {
        return '92d050';
    } else if (Math.round(grade) < 6) {
        return 'ffff00';
    } else if (Math.round(grade) < 9) {
        return 'ffc000';
    } else {
        return 'ff0000';
    }
}

// Remove the green rollover marker when the mouse leaves the chart
function clearMouseMarker() {
    if (mousemarker != null) {
        mousemarker.setMap(null);
        mousemarker = null;
    }
}

// Geocode an address and add a marker for the result
function addAddress() {
    var address = document.getElementById('address').value;
    geocoderService.geocode({
        'address': address
    }, function (results, status) {
        //document.getElementById('address').value = "";
        if (status == google.maps.GeocoderStatus.OK) {
            var latlng = results[0].geometry.location;
            addMarker(latlng, true);
            if (markers.length > 1) {
                var bounds = new google.maps.LatLngBounds();
                for (var i in markers) {
                    bounds.extend(markers[i].getPosition());
                }
                map.fitBounds(bounds);
            } else {
                map.fitBounds(results[0].geometry.viewport);
            }
        } else if (status == google.maps.GeocoderStatus.ZERO_RESULTS) {
            alert("Address not found");
        } else {
            alert("Address lookup failed");
        }
    })
}

// Add a marker and trigger recalculation of the path and elevation
function addMarker(latlng, doQuery) {
    if (markers.length < 10) {
	
		var marker = new google.maps.Marker({
            position: latlng,
            map: map,
            draggable: true
        })		
		
		google.maps.event.addListener(marker, 'dragend', function (e) {			
			updateLocationHash();
            updateElevation();
        });

        markers.push(marker);
		
		updateLocationHash();

        if (doQuery) {
            updateElevation();
        }

        if (markers.length == 10) {
            document.getElementById('address').disabled = true;
        }
    } else {
        alert("No more than 10 points can be added");
    }
}

// Trigger the elevation query for point to point
// or submit a directions request for the path between points
function updateElevation() {
    console.log($('input[name=modeRadio]:checked', '#mode').val());
    if (markers.length > 1) {
        //var travelMode = document.getElementById("mode").checked
        var travelMode = $('input[name=modeRadio]:checked', '#mode').val();
        if (travelMode != 'direct') {
            calcRoute(travelMode);
        } else {
            var latlngs = [];
            for (var i in markers) {
                latlngs.push(markers[i].getPosition())
            }
            elevationService.getElevationAlongPath({
                path: latlngs,
                samples: SAMPLES
            }, plotElevation);
        }
    }
}

// Submit a directions request for the path between points and an
// elevation request for the path once returned
function calcRoute(travelMode) {
    var origin = markers[0].getPosition();
    var destination = markers[markers.length - 1].getPosition();
    var distance = 0;
    var measurement = $("input[name=measurement]:checked").val();

    var waypoints = [];
    for (var i = 1; i < markers.length - 1; i++) {
        waypoints.push({
            location: markers[i].getPosition(),
            stopover: true
        });
    }

    var request = {
        origin: origin,
        destination: destination,
        waypoints: waypoints
    };

    switch (travelMode) {
    case "bicycling":
        request.travelMode = google.maps.DirectionsTravelMode.BICYCLING;
        break;
    case "driving":
        request.travelMode = google.maps.DirectionsTravelMode.DRIVING;
        break;
    case "walking":
        request.travelMode = google.maps.DirectionsTravelMode.WALKING;
        break;
    }

    directionsService.route(request, function (response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            elevationService.getElevationAlongPath({
                path: response.routes[0].overview_path,
                samples: SAMPLES
            }, plotElevation);
            
			// Calculate distance and update page with it
            for (var i = 0; i < response.routes[0].legs.length; i++) {
                distance += response.routes[0].legs[i].distance.value;
            }
            if (measurement == 'imperial') {
            	distance *= meter_to_feet;
            	document.getElementById('run').innerHTML = (distance / feet_to_mile).toFixed(2) + " mi";
            } else if (measurement == 'metric') {
            	document.getElementById('run').innerHTML = (distance / meter_to_km).toFixed(2) + ' km';
            }

        } else if (status == google.maps.DirectionsStatus.ZERO_RESULTS) {
            alert("Could not find a route between these points");
        } else {
            alert("Directions request failed");
        }
    });
}

// Trigger a geocode request when the Return key is
// pressed in the address field
function addressKeyHandler(e) {
    var keycode;
    if (window.event) {
        keycode = window.event.keyCode;
    } else if (e) {
        keycode = e.which;
    } else {
        return true;
    }

    if (keycode == 13) {
        reset();
        addAddress();
        return false;
    } else {
        return true;
    }
}

function loadExample(examples) {
    reset();
    map.setMapTypeId(examples[0].mapType);
    //document.getElementById('mode').value = examples[0].travelMode;
    var bounds = new google.maps.LatLngBounds();
    for (var i = 0; i < examples[0].latlngs.length; i++) {
        var latlng = new google.maps.LatLng(
        examples[0].latlngs[i][0], examples[0].latlngs[i][1]);
        addMarker(latlng, false);
        bounds.extend(latlng);
    }
    map.fitBounds(bounds);
    updateElevation();
}

// Clear all overlays, reset the array of points, and hide the chart
function reset() {
    if (polyline) {
        polyline.setMap(null);
    }

    for (var i in markers) {
        markers[i].setMap(null);
    }

    markers = [];

    document.getElementById('minmax').style.display = 'none';
    document.getElementById('elevation').style.display = 'none';
    document.getElementById('chart_div').style.display = 'none';
	document.getElementById('legend').style.display = 'none';
    document.getElementById('urlbox').style.display = 'none';
	
	$.bbq.removeState(['location']);
	paramsObj['location'] = "";
	
	$('#url').val("");
}

// Calculates and returns grade
function calcGrade(rise,run) {
	return (rise/run*100).toFixed(2);
}

// Traverses current markes on map, gets their location, and sets location hash property accordingly
function updateLocationHash() {
	var newpoint = "";
	
	for (var i = 0; i < markers.length; i++) {
		if (newpoint != "") newpoint += "~"; // so ~ isn't added to before first point
		newpoint += markers[i].getPosition().lat() + "," + markers[i].getPosition().lng();
	}
	
	var state = {};
	state['location'] = newpoint;
	$.bbq.pushState(state); // push to state
	
	$('#url').val(window.location);
}

// Call up bitly.php to get shortened URL
function shortenUrl() {
	$.ajax({
		type:"GET",
		url:"bitlyxml.php",
		data: { url: $('#url').val() + "" },
		dataType:"xml",
		success:function(xml) {
			$('#url').val($(xml).find('shorturl').text());
		}
	}).done(function() {
        document.getElementById('url').style.visibility = 'visible';
		$('#url').select();
	});
}

// Update page title in form "USA: Bryn Mawr, PA. 6% (max 8%) 0.47 mi. - FindHills.com"
function updateTitle(grade,maxGrade,distance) {
	var origin = markers[0].getPosition();
	var town = "";
	var state = "";
	var country = "";
	var title = "";
	var newUrl = "";
    var measurement = $("input[name=measurement]:checked").val();
	var mi_or_km = ' mi.';
	if (measurement == 'metric') { mi_or_km = ' km'; }
	
	
	geocoderService.geocode({
        'location': origin
    }, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {	
			// Get address components from results and find town, state, and country
			for(var i = 0; i<results[0].address_components.length;i++) {
				if(results[0].address_components[i].types[0] == 'locality') town = results[0].address_components[i].long_name;
				else if(results[0].address_components[i].types[0] == 'administrative_area_level_2' && town == "") town = results[0].address_components[i].long_name;
				else if(results[0].address_components[i].types[0] == 'administrative_area_level_1') state = results[0].address_components[i].long_name;
				else if(results[0].address_components[i].types[0] == 'country') country = results[0].address_components[i].long_name;				
			}
			
			// Assemble new page title
			title = "FindHills.com - " + country + ": " + town + " " + state + ". " + grade + "% (max " + maxGrade + "%) " + distance + mi_or_km;
			
			// Assemble new URL
			if(window.location.href.search("hill\\?pagetitle") > -1) {
                console.log("1a. Found 'hill?pagetitle' in href.\nhref=" + window.location.href);
                newUrl = window.location.href.split("hill?pagetitle")[0] + "hill?pagetitle=" + escape(title) + escape("&") + 'distancein=' + measurement + "#" + window.location.href.split("#")[1];
                console.log("1b. Found 'hill?pagetitle' in href.\nnewUrl" + newUrl);
            } else if(window.location.href.search("pagetitle") > -1) {
                console.log("2a. Found '?pagetitle' in href.\nhref=" + window.location.href);
                newUrl = window.location.href.split("?pagetitle")[0] + "hill?pagetitle=" + escape(title) + escape("&") + 'distancein=' + measurement + "#" + window.location.href.split("#")[1];
                console.log("2b. Found '?pagetitle' in href.\nnewUrl" + newUrl);
			} else {
                console.log("3a. Did NOT find '?pagetitle' in href.\nhref=" + window.location.href);
				newUrl = window.location.href.split("#")[0] + "hill?pagetitle=" + escape(title) +  escape("&") + 'distancein=' + measurement + "#" + window.location.href.split("#")[1];
                console.log("3b. Did NOT find '?pagetitle' in href.\nnewUrl" + newUrl);
			}
			
			// Update browser and box URL dynamically with new url as well as current document title
			$('#url').val(newUrl);
			window.history.pushState("", title, newUrl);
			document.title = title;
        } else if (status == google.maps.GeocoderStatus.ZERO_RESULTS) {
            alert("Address not found");
        } else {
            alert("Address lookup failed");
        }
    });
}
