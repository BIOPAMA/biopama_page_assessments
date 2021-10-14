var mapPolyHostUrl = "https://tiles.biopama.org/BIOPAMA_poly";
var getFeatureInfoUrl = "https://rest-services.jrc.ec.europa.eu/services/d6biopamarest/d6biopama/get_gdpame_biopama";
var DOPAgetWdpaExtentUrl = "https://rest-services.jrc.ec.europa.eu/services/d6biopamarest/d6biopama/get_wdpa_extent";
var getCountryBboxUrl = "https://rest-services.jrc.ec.europa.eu/services/d6biopamarest/d6biopama/get_bbox_for_countries_dateline_safe";

var mapPaLayer = "2021_July_ACP";

var biopamaAssessmentMap;

(function($){
	
	var map;
	function initMap(onceMapLoadedcallback){
		mapboxgl.accessToken = 'pk.eyJ1IjoiYmxpc2h0ZW4iLCJhIjoiMEZrNzFqRSJ9.0QBRA2HxTb8YHErUFRMPZg';
		map = new mapboxgl.Map({
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
		mapInteractionControls.forEach(element => map[element].disable());

		$('#pame_assessments_map').append('<div id="help-text">Double-click to pan and zoom the map.</div>');
		$('#help-text').fadeIn();

		var mapInteractionControls = ["touchZoomRotate", "doubleClickZoom", "keyboard", "dragPan", "dragRotate", "boxZoom", "scrollZoom"];
		map.on("dblclick",function(){
			$('#help-text').fadeOut();
			mapInteractionControls.forEach(element => map[element].enable());
		})

		map.on("mouseout",function(){
			$('#help-text').fadeIn();
			mapInteractionControls.forEach(element => map[element].disable());
		});

		map.on('load', function(){		
			map.addSource("BIOPAMA_Poly", {
				"type": 'vector',
				"tiles": [mapPolyHostUrl+"/{z}/{x}/{y}.pbf"],
				"minZoom": 0,
				"maxZoom": 12,
			});
			
			map.addLayer({
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
			
			map.addLayer({
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
			
			map.addLayer({
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
			
			map.on('click', getFeatureInfo);

			// Callback to be eventually executed when the map has been successfully loaded.
			if(onceMapLoadedcallback){
				onceMapLoadedcallback();
			}
		});
	}

    function getFeatureInfo(e){
		var features = map.queryRenderedFeatures(
			e.point,
			{
				layers: ["wdpaRegionSelected"]
			}
		);

		if(features.length > 0){
			$.getJSON(
				getFeatureInfoUrl+'?format=json&wdpaid='+features[0].properties.WDPAID,
				function(result){
					var data = result.records, paPopupContent;
					if(data.length > 0){
						paPopupContent = '<center class="available"><i class="fas fa-2x fa-paste"></i><p>'+
										data[0].name+' ('+data[0].wdpaid+')</p>';
						for(var key in data){
							paPopupContent += '<i>'+data[key].pame_methodology+' ('+data[key].pame_year+')</i><hr>';
						}
						paPopupContent += '</center>';
						
					}
					else{
						paPopupContent  = '<center class="available"><i class="fas fa-2x fa-paste"></i><p>No results found to be displayed.</p></center>';
					}
					new mapboxgl.Popup()
							.setLngLat(e.lngLat)
							.setHTML(paPopupContent)
							.addTo(map);
				}
			);
		}
	}

	function showFeatureById(wdpaId){
		zoomToPA(wdpaId);

		map.setFilter("wdpaSelected", ['==', 'WDPAID', wdpaId]);
		map.setLayoutProperty("wdpaSelected", 'visibility', 'visible');	
		
		map.on(
			'click',
			function(){
				map.setLayoutProperty("wdpaSelected", 'visibility', 'none');	
			},
			200
		);
	}

	function showFeaturesByIdAndIso(wdpaIds, currentCountries){
		// Initialize the variables used to display the right layer and the right viewport on the map.
		var assessmentsByWDPA = ['in', 'WDPAID'].concat(wdpaIds);

		// Set the "wdpaRegionSelected" layer visible.
		map.setFilter("wdpaRegionSelected", assessmentsByWDPA);	
		map.setLayoutProperty("wdpaRegionSelected", 'visibility', 'visible');

		// Move the map viewport to the properly display the bbox cotaining the selected countries.
		$.getJSON(
			getCountryBboxUrl+'?format=json&includemetadata=false&iso3codes='+currentCountries.toString(),
			function(responseData){
				map.fitBounds(jQuery.parseJSON(responseData.records[0].get_bbox_for_countries_dateline_safe));
			}
		);
	}

	function zoomToPA(wdpaid){
		$.ajax({
			url: DOPAgetWdpaExtentUrl+'?format=json&wdpa_id='+wdpaid,
			dataType: 'json',
			success: function(data){
				map.fitBounds(
					$.parseJSON(data.records[0].extent),
					{
						padding: {top: 100, bottom:100, left: 100, right: 100}
					}
				);
			},
			error: function(){
				console.log("Something is wrong with the REST servce for PA bounds.");
			}
		});
	}

	biopamaAssessmentMap = {
		initMap: initMap,
		showFeatureById: showFeatureById,
		showFeaturesByIdAndIso: showFeaturesByIdAndIso
	}
})(jQuery);