var mapPolyHostURL = "https://tiles.biopama.org/BIOPAMA_poly";
var mapPaLayer = "2021_July_ACP";

jQuery(document).ready(function($){

    // Drupal.attachBehaviors($("#pame_assessments_table").get(0));

    mapboxgl.accessToken = 'pk.eyJ1IjoiYmxpc2h0ZW4iLCJhIjoiMEZrNzFqRSJ9.0QBRA2HxTb8YHErUFRMPZg';
	var mymap = new mapboxgl.Map({
		container: 'pame_assessments_map',
		style: 'mapbox://styles/jamesdavy/cjw25laqe0y311dqulwkvnfoc', //Andrews default new RIS v2 style based on North Star
		attributionControl: true,
		renderWorldCopies: true,
		center: [26, -6.66],
        zoom: 2,
		minZoom: 1.4,
		maxZoom: 18
	});
	var mapInteractionControls = ["touchZoomRotate", "doubleClickZoom", "keyboard", "dragPan", "dragRotate", "boxZoom", "scrollZoom"];
	mapInteractionControls.forEach(element => mymap[element].disable());

	$('#page_assessments_map').append('<div id="help-text">Double-click to pan and zoom the map.</div>');
	$('#help-text').fadeIn();

	var mapInteractionControls = ["touchZoomRotate", "doubleClickZoom", "keyboard", "dragPan", "dragRotate", "boxZoom", "scrollZoom"];
	mymap.on("dblclick",function(){
		$('#help-text').fadeOut();
		mapInteractionControls.forEach(element => mymap[element].enable());
	})

	mymap.on("mouseout",function(){
		$('#help-text').fadeIn();
		mapInteractionControls.forEach(element => mymap[element].disable());
	});

    mymap.on('load', function(){		
		mymap.addSource("BIOPAMA_Poly", {
			"type": 'vector',
			"tiles": [mapPolyHostURL+"/{z}/{x}/{y}.pbf"],
			"minZoom": 0,
			"maxZoom": 12,
		});
		
		mymap.addLayer({
			"id": "wdpaBase",
			"type": "fill",
			"source": "BIOPAMA_Poly",
			"source-layer": mapPaLayer,
			"minzoom": 1,
            "paint": {
                "fill-color": [
                    "match",
                    ["get", "MARINE"],
                    ["1"],
                    "hsla(173, 21%, 51%, 0.1)",
                    "hsla(87, 47%, 53%, 0.1)"
                ],
            }
		});
		
		mymap.addLayer({
			"id": "wdpaRegionSelected",
			"type": "fill",
			"source": "BIOPAMA_Poly",
			"source-layer": mapPaLayer,
			"minzoom": 1,
			"layout": {"visibility": "none"},
            "paint": {
                "fill-color": [
                    "match",
                    ["get", "MARINE"],
                    ["1"],
                    "hsla(3, 40%, 50%, 0.7)",
                    "hsla(3, 40%, 50%, 0.7)"
                ],
            }
		});
		
		mymap.addLayer({
			"id": "wdpaSelected",
			"type": "line",
			"source": "BIOPAMA_Poly",
			"source-layer": mapPaLayer,
			"layout": {"visibility": "none"},
			"paint": {
				"line-color": "#679b95",
				"line-width": 2,
			},
			"transition": {
			  "duration": 300,
			  "delay": 0
			}
		});
		
		mymap.on('click', getFeatureInfo);
		
		// var url_string = new URL( window.location.href );
		// for (k in sel_filters){
		// 	if (url_string.searchParams.get(k)){
		// 		sel_filters[k] = url_string.searchParams.get(k);
		// 	}
		// }
		// createDTables();
		// setTableData();
	});

    function getFeatureInfo(e){
		var feature = mymap.queryRenderedFeatures(e.point, {
			layers:["wdpaRegionSelected"],
		});
		if (feature.length !== 0){
			var url = "https://rest-services.jrc.ec.europa.eu/services/d6biopamarest/d6biopama/get_gdpame_biopama?format=json&wdpaid=" + feature[0].properties.WDPAID;
			$.getJSON(url,function(response){
				paPopupContent = '<center class="available"><i class="fas fa-2x fa-paste"></i><p>'+response.records[0].name+' ('+response.records[0].wdpaid+')</p>';
				for (var key in response.records) {
					paPopupContent += '<i>'+response.records[key].pame_methodology+' ('+response.records[key].pame_year+')</i><hr>';
				}
				paPopupContent += '</center>';
				new mapboxgl.Popup()
					.setLngLat(e.lngLat)
					.setHTML(paPopupContent)
					.addTo(mymap);	
			});
		}
	}
});