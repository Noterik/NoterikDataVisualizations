(function($) {

  $.fn.extend({
    ntkPieChart: function(options, arg) {
      if (options && typeof(options) == 'object') {
        options = $.extend({}, $.ntkPieChart.defaults, options);
      } else if (!options) {
        options = $.extend({}, $.ntkPieChart.defaults);
      }

      // this creates a plugin for each element in
      // the selector or runs the function once per
      // selector.  To have it do so for just the
      // first element (once), return false after
      // creating the plugin to stop the each iteration
      this.each(function() {
        $.ntkPieChart(this, options, arg);
      });
      return this;
    }
  });

  $.ntkPieChart = function(elem, options, arg) {

    var publicFns = {
      reset: function() {
        $(this).html('');
        var settings = $(this).data('ntk_piechart_settings');
        settings.data = [];
        init(this);
      },
      update: function(data) {
        var settings = $(this).data('ntk_piechart_settings');

        function arcTween(a) {
          var i = d3.interpolate(this._current, a);
          this._current = i(0);
          return function(t) {
            return d3.svg.arc().outerRadius(settings.radius)(i(t));
          };
        }

        function textTween(a){
          var i = d3.interpolate(this._current, a);
          this._current = i(0);
          return function(t){
            return "translate(" + settings._arc.centroid(i(t)) + ")";
          }
        }

        settings._svg.selectAll("path").data(settings._pie(data))
          .transition().duration(750).attrTween("d", arcTween);

        settings._svg.selectAll("text").data(settings._pie(data))
          .transition().duration(750).attrTween("transform", textTween);
      }
    }

    var init = function(elem, options) {
      var $elem = $(elem);
      var existingSettings = $elem.data('ntk_piechart_settings');
      var settings = options ? options : existingSettings;

      //Width can be passed as arguments, otherwise just take full element space
      if (!settings.width)
        settings.width = $elem.width()

      if (!settings.height)
        settings.height = $elem.height();

      if (!settings.radius)
        settings.radius = Math.min(settings.width, settings.height) / 2;

      settings._arc = d3.svg.arc()
        .outerRadius(settings.radius)
        .innerRadius(0);

      settings._svg = d3.select(elem).append("svg")
        .attr("width", settings.width)
        .attr("height", settings.height)
        .append("g")
        .attr("transform", "translate(" + settings.width / 2 + "," + settings.height / 2 + ")")

      settings._color = d3.scale.category20();

      settings._pie = d3.layout.pie()
        .sort(null)
        .value(function(d) {
          return d.value
        });

      var g = settings._svg.selectAll(".arc")
        .data(settings._pie(settings.data))
        .enter().append("g")
        .attr("class", "arc");

      g.append("path")
        .attr("d", settings._arc)
        .style("fill", function(d, i) {
          if (d.data.color) {
            return d.data.color;
          } else {
            return settings._color(i);
          }
        })
        .each(function(d) { this._current = d; });

      g.append("text")
        .attr("transform", function(d) {
          return "translate(" + settings._arc.centroid(d) + ")";
        })
        .attr("dy", ".35em")
        .style("text-anchor", "middle")
        .text(function(d) {
          return d.data.label;
        })
        .each(function(d){ return this._current = d});

      $elem.data('ntk_piechart_settings', settings);
    }

    if (options && typeof(options) == 'string') {
      publicFns[options].apply(elem, [arg]);
      return;
    } else if (options && typeof(options) == 'object') {
      init(elem, options);
    }
  };

  $.ntkPieChart.defaults = {
    data: []
  };

})(jQuery);
