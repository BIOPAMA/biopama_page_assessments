var biopamaAssessmentTable;

(function($){
	var table;
	var filters = {};
	var $spinner = $('#spinner');
	var assessmentMap;

	function setupClearButton(){
		$('#reset_filters').on('click',function(){
			var currentURL = document.location.href;
			if(currentURL.includes('?')) {
				currentURL = currentURL.split('?')[0];
				history.pushState({}, null, currentURL);
			}

			for(k in filters){
				filters[k] = null;
			}
			
			setTableData();
		});
	}

	function setupFilterChangeEvent(){
		$('.cql_filters').on(
			'change',
			function(){
				var currentURL = document.location.href;
				var parameter = $(this).attr('param');
				var value = $(this).val();
				if(currentURL.includes(parameter)) {
					currentURL = removeURLParameter(currentURL, parameter);
				}
				if(value == '%'){
					filters[parameter] = null;
				}
				else{
					filters[parameter] = value;
					qsAddSymbol = currentURL.includes('?')? '&' : '?';
					currentURL = `${currentURL}${qsAddSymbol}${parameter}=${value}`;
				}
				history.pushState({}, null, currentURL);
				setTableData();
			}
		);
	}
	
	function setupFilters(){		
		var $filterContainer = $("#table-assessments-predefined-filters");
		var $filterLabel, $filterItem, $filterItemDefaultOption;
		for(k in response_fields_to_table_map){
			if(response_fields_to_table_map[k].filter){
				$filterLabel = $(`<label for="${k}">${response_fields_to_table_map[k].filter.label}</label>`);
				$filterContainer.append($filterLabel);

				$filterItem = $(`<select class="form-control cql_filters" id="${k}" param="${k}" tabindex="-1">`);
				$filterItemDefaultOption = $(`<option value="${response_fields_to_table_map[k].filter.default_value}">${response_fields_to_table_map[k].filter.default_option}</option>`);
				$filterItem.append($filterItemDefaultOption);
				$filterContainer.append($filterItem);

				filters[k] = null;
			}
		}
		$filterContainer.append($('<button class="btn btn-info" type="button" id="reset_filters">Clear All</button>'));

		var url_string = new URL(window.location.href);
		for(k in filters){
			if(url_string.searchParams.get(k)){
				filters[k] = url_string.searchParams.get(k);
			}
		}

		setupClearButton();
		setupFilterChangeEvent();
	}

	function updateFilters(data){
		$.each($('.cql_filters'),function(){
			$(this).find('option').not(':first').remove();
		});

		var generalFilterList = {}, option_text;
		data.forEach((d, i) => {
			for(k in d){
				if(response_fields_to_table_map[k] && response_fields_to_table_map[k].filter){
					option_text = (response_fields_to_table_map[k].filter.get_value)? response_fields_to_table_map[k].filter.get_value(d) : d[k];
					if(!generalFilterList[k]){
						generalFilterList[k] = {};
					}
					generalFilterList[k][option_text] = {value: d[k]};
				}
			}
		});

		var generalFilterList, sortedKey, valueObj;
		for(k in generalFilterList){
			generalFilterListSortedKeys = Object.keys(generalFilterList[k]).sort();
			for(i in generalFilterListSortedKeys){
				sortedKey = generalFilterListSortedKeys[i];
				valueObj = generalFilterList[k][sortedKey];
				$(`#${k}.cql_filters`).append($(`<option value="${valueObj.value}">${sortedKey}</option>`));
			}

			if(filters[k]){
				$(`#${k}.cql_filters`).val(filters[k]);
			}
		}
	}

	function retrieveTableColumns(fields){
		var columns = [];
		for(k in fields){
			columns.push({
				data: k
			});
		}
		return columns;
	}

	function generateRestArgs(){
		var cleanArgs = '';
		for(var propName in filters){
			if((filters[propName] != null) || (filters[propName] != undefined)){
				cleanArgs += '&' + propName + '=' + filters[propName];
			}
		}
		return cleanArgs;
	}

	function removeURLParameter(url, parameter){
		var urlparts = url.split('?');
		if(urlparts.length >= 2){
			var prefix = encodeURIComponent(parameter)+'=';
			var pars = urlparts[1].split(/[&;]/g);

			for(var i = pars.length; i-- > 0;){
				if(pars[i].includes(parameter)){
					pars.splice(i, 1);
				}
			}

			url = urlparts[0]+(pars.length > 0? '?' : '')+pars.join('&');
			return url;
		}
		else{
			return url;
		}
	}

	function createTable(){
		var $table = $('#table_assessments');

		var $tableHeader = $('<thead><tr></tr></thead>');
		for(k in response_fields_to_table_map){
			$('tr', $tableHeader).append($(`<th>${response_fields_to_table_map[k].name}</th>`));
		}

		$table.append($tableHeader);
		$table.append($('tbody'));
		$table.append($('tfooter'));

		$table.show();
		table = $table.DataTable({
			columns : retrieveTableColumns(response_fields_to_table_map),
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
		$spinner.hide();
	}

	function handleClickOnTableRow(){
		$('#table_assessments tbody tr').on('click', function(){
			if(!$(this).hasClass('selected')){
				var wdpaId = parseInt($(this).find('td:first-child').text());

				$('#table_assessments tbody tr').removeClass('selected');
				$(this).addClass('selected');

				if(assessmentMap){
					assessmentMap.showFeatureById(wdpaId);
				}

				$('html, body').animate({
					scrollTop: $("#pame_assessments_map").offset().top - 100
				}, 1000);
			}
		});
	}

	function setTableData(){
		$spinner.show();		
		var restArguments = generateRestArgs();
		
		var url = "http://my.biopama.org/rest/gd_page?format=json" + restArguments;		
		$.getJSON(url,function(responseData){
			table.clear().draw();
			table.rows.add(responseData).draw();
			
			if(assessmentMap){
				assessmentMap.showFeaturesByIsoAndId(responseData);
			}

			$spinner.hide();

			handleClickOnTableRow();

			updateFilters(responseData);
		});	
	}

	function initAssessmentTable(inputFields, map){
		response_fields_to_table_map = inputFields;
		assessmentMap = map;
		setupFilters();
		createTable();
		setTableData();
	}

	biopamaAssessmentTable = {
		initAssessmentTable: initAssessmentTable
	}
})(jQuery);