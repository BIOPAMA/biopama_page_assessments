(function($){
  var fields = {
    "wdpa_id": {
      name: "WDPA ID",
      filter: null
    },
    "title": {
      name: "Country",
      filter: null
    },
    "iso3": {
      name: "ISO3",
      filter: {
        label: "Country",
        default_option: "All Countries",
        default_value: "%",
        get_value: function(json_response_data){
          return $(json_response_data["title"]).text();
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
      name: "Year",
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
    // "data_year": {
    //   name: "Submission Year",
    //   filter: null
    // },
    // "source": {
    //   name: "Source",
    //   filter: null
    // }
  };

  biopamaAssessmentMap.initMap(
    function(){
      biopamaAssessmentTable.initAssessmentTable(fields, biopamaAssessmentMap);
    }
  );
})(jQuery);