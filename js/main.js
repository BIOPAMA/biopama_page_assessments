/* MAIN SCRIPOT TO LOAD CARDS APPLICATIONS */
(function($){
  var response_fields_to_table_map = {
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

  biopamaSimpleMap.initMap(
    biopamaSimpleAssessmentTable.initAssessmentTable,
    response_fields_to_table_map
  );
})(jQuery);