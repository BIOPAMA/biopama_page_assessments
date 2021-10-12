var table_columns = {
	"wdpa_id": {
        name: "WDPA ID",
        filter: null
    },
	"title": {
        name: "Country",
        filter: null
    },
	"iso2": {
        name: "ISO2",
        filter: {
            label: "Country",
            default_option: "All Countries",
            default_value: "%",
			get_value: function(json_response_data){
				return jQuery(json_response_data["title"]).text();
			}
        }
    },
	"pa": {
        name: "Protected Area",
        filter: null
    },    
    "ass_link": {
        name: "Link",
        filter: null
    },
    "ass_method": {
        name: "Methodology",
        filter: {
            label: "Tool",
            default_option: "All Methodologies",
            default_value: "%"
        }
    },
    "ass_year": {
        name: "Assessment Year",
        filter: {
            label: "Year",
            default_option: "All Years",
            default_value: "%"
        }
    },
    "dataset_title": {
        name: "Title",
        filter: null
    }
    //"data_year": {
    //     name: "Submission Year",
    //     filter: null
    // },
    //"source": {
    //     name: "Source",
    //     filter: null
    // }
};

var dt_table;

(function($){
	var selectedFilters = {};

	var DOPAgetWdpaExtent = "https://rest-services.jrc.ec.europa.eu/services/d6biopamarest/d6biopama/get_wdpa_extent?format=json&wdpa_id=";

	function retrieveDtColumns(cols){
		var columns = [];
		for(k in cols){
			columns.push({
				data: k
			});
		}
		return columns;
	}

	function setupFilters(){		
		var filteredColumns = [];
		
		var $filterContainer = $("#table-assessments-predefined-filters");
		var $filterLabel, $filterItem, $filterItemDefaultOption;
		for(k in table_columns){
			if(table_columns[k].filter){
				$filterLabel = $(`<label for="${k}">${table_columns[k].filter.label}</label>`);
				$filterContainer.append($filterLabel);

				$filterItem = $(`<select class="form-control cql_filters" id="${k}" param="${k}" tabindex="-1">`);
				$filterItemDefaultOption = $(`<option value="${table_columns[k].filter.default_value}">${table_columns[k].filter.default_option}</option>`);
				$filterItem.append($filterItemDefaultOption);
				$filterContainer.append($filterItem);

				selectedFilters[k] = null;
			}
		}

		$filterContainer.append($('<button class="btn btn-info" type="button" id="reset_filters">Clear All</button>'));
	}

	function updateFilters(data){
		$.each($('.cql_filters'),function(){
			$(this).find('option').not(':first').remove();
		});

		var generalFilterList = {}, option_text;
		data.forEach((d, i) => {
			for(k in d){
				if(table_columns[k] && table_columns[k].filter){
					option_text = (table_columns[k].filter.get_value)? table_columns[k].filter.get_value(d) : d[k];
					if(!generalFilterList[k]){
						generalFilterList[k] = {};
					}
					generalFilterList[k][option_text] = {value: d[k]};
				}
			}
		});

		var specificSortedFilterList;
		for(k in generalFilterList){
			specificSortedFilterList = Object.keys(generalFilterList[k]).sort();
			for(j in specificSortedFilterList){
				$(`#${k}.cql_filters`).append($(`<option value="${generalFilterList[k][j].value}">${j}</option>`));
			}
			// generalFilterList = Object.values(specificSortedFilterList);
			// $(`#${k}.cql_filters`).add(Object.values(generalFilterList[k]));
		}
	}

	function createDTables(){
		var $table = $('#table_assessments');
		var $tableHeader = $('<thead><tr></tr></thead>');

		for(k in table_columns){
			$('tr', $tableHeader).append($(`<th>${table_columns[k].name}</th>`));
		}

		$table.append($tableHeader);
		$table.append($('tbody'));
		$table.append($('tfooter'));

		$table.show();
		dt_table = $table.DataTable({
			"columns" : retrieveDtColumns(table_columns),
			dom: 'Bfrtip',
			buttons: [
				{
				extend: 'print',
				customize: function ( win ) {
					$(win.document.body)
						.prepend(
							'<p>Data Source: Global Database on Protected Area Management Effectiveness (GD-PAME) | <b>https://pame.protectedplanet.net/ </b></p>'
						);
					$(win.document.body).find( 'table' )
						.addClass( 'compact row-border' )
						.css( 'font-size', 'inherit' );
				}
				},
				{
					extend: 'pdfHtml5',
					orientation: 'landscape',
					pageSize: 'LEGAL',
					customize: function (doc){
					doc['header'] = 'Data Source: https://pame.protectedplanet.net/ | Global Database on Protected Area Management Effectiveness (GD-PAME)';
					}
				},
				{
					extend: 'excel',
					text: 'XLSX',
					messageTop: "Data Source: https://pame.protectedplanet.net/ | Global Database on Protected Area Management Effectiveness (GD-PAME)'"
				}
			]
		});
		
		$('#table_assessments_filter').prepend($('.dt-buttons.btn-group'));
		$('#spinner').hide();
	}

	function generateRestArgs(){
		var cleanArgs = '';
		for(var propName in selectedFilters){
			if((selectedFilters[propName] != null) || (selectedFilters[propName] != undefined)){
				cleanArgs += '&' + propName + '=' + selectedFilters[propName];
			}
		}
		return cleanArgs;
	}

	function removeURLParameter(url, parameter) {
		var urlparts= url.split('?');   
		if (urlparts.length>=2) {

			var prefix= encodeURIComponent(parameter)+'=';
			var pars= urlparts[1].split(/[&;]/g);

			for (var i= pars.length; i-- > 0;) {    
				if (pars[i].includes(parameter)) {  
					pars.splice(i, 1);
				}
			}
			url= urlparts[0]+'?'+pars.join('&');
			return url;
		} else {
			return url;
		}
	}

	function setTableData(){
		$('#spinner').show();
		
		var restArguments = generateRestArgs();
		
		// var url = "https://rest-services.jrc.ec.europa.eu/services/d6biopamarest/d6biopama/get_gdpame_biopama?format=json" + restArguments;
		var url = "http://my.biopama.org/rest/gd_page?format=json" + restArguments;
		
		$.getJSON(url,function(response){
			// var assessmentsByWDPA = ['in', 'WDPAID'];
			// var currentCountries = [];

			dt_table.clear().draw();
			dt_table.rows.add(response).draw();
			$('#spinner').hide();

			// $.each(response.records,function(idx,obj){
			// 	var thisWdpa = parseInt(obj.wdpaid, 10);
			// 	if(assessmentsByWDPA.indexOf(thisWdpa) === -1) assessmentsByWDPA.push(thisWdpa); //collect all wdpa IDs
			// 	if(currentCountries.indexOf(obj.iso3) === -1) currentCountries.push(obj.iso3); //collect all countries to zoom to the group
			// });

			// mymap.setFilter("wdpaRegionSelected", assessmentsByWDPA);	
			// mymap.setLayoutProperty("wdpaRegionSelected", 'visibility', 'visible');	
			// url = 'https://rest-services.jrc.ec.europa.eu/services/d6biopamarest/d6biopama/get_bbox_for_countries_dateline_safe?iso3codes='+currentCountries.toString()+'&format=json&includemetadata=false';
			
			// $.getJSON(url,function(response){
			// 	mymap.fitBounds(jQuery.parseJSON(response.records[0].get_bbox_for_countries_dateline_safe));
			// });

			// $('#table_assessments tbody tr').on('click',function(){
			// 	var wdpa = parseInt($(this).find('td:first-child').text());
			// 	zoomToPA(wdpa)

			// 	$('#table_assessments tbody tr').removeClass('selected');
			// 	$(this).addClass('selected');

			// 	mymap.setFilter("wdpaSelected", ['==', 'WDPAID', wdpa]);	
			// 	mymap.setLayoutProperty("wdpaSelected", 'visibility', 'visible');	
				
			// 	mymap.on('click',function(){
			// 		mymap.setLayoutProperty("wdpaSelected", 'visibility', 'none');	
			// 	},200);
			// 	$('html, body').animate({
			// 		scrollTop: $("#pame_assessments_map").offset().top - 100
			// 	}, 1000);
			// });

			updateFilters(response);
		});	
	}


	setupFilters();
	createDTables();
	setTableData();
})(jQuery);