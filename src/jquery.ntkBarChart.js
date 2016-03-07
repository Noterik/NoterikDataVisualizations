(function($) {

  $.fn.extend({
    ntkBarChart: function(options, arg) {
      // the selector or runs the function once per
      // selector.  To have it do so for just the
      // first element (once), return false after
      // creating the plugin to stop the each iteration
      this.each(function() {
        $.ntkBarChart(this, options, arg);
      });
      return this;
    }
  });

  var BarChart = function(element, settings) {
    var self = this;
    settings = jQuery.extend({}, this.defaults, settings);

    if (!settings.width){
      settings.width = element.width() - settings.margin.left - settings.margin.right;
    }

    if (!settings.height){
      settings.height = element.height() - settings.margin.top - settings.margin.bottom;
    }

    var svg = d3.select(element[0]).append("svg")
      .attr("width", settings.width + settings.margin.left + settings.margin.right)
      .attr("height", settings.height + settings.margin.top + settings.margin.bottom)
      .append("g")
      .attr("transform", "translate(" + settings.margin.left + "," + settings.margin.top + ")");

    var x = d3.scale.ordinal()
      .rangeRoundBands([0, settings.width], 0.1);

    var color = d3.scale.category20();

    var y = d3.scale.linear()
      .range([settings.height, 0]);

    var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

    var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .ticks(10, "%");

    x.domain(settings.data.map(function(d) {
      return d.label;
    }));

    y.domain([0, d3.max(settings.data, function(d) {
      return d.value;
    })]);

    svg.append("g")
      .attr("class", "xAxis")
      .attr("transform", "translate(0," + (settings.height) + ")")
      .call(xAxis);

    svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Occurences");

    svg.selectAll(".bar")
      .data(settings.data)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) {
        return x(d.label);
      })
      .attr("width", x.rangeBand())
      .attr("y", function(d) {
        return y(d.value);
      })
      .attr("height", function(d) {
        return settings.height - y(d.value);
      })
      .attr("fill", function(d, i){
        return color(i);
      });
  };
  BarChart.prototype = Object.create({});
  BarChart.prototype.defaults = {
    data: [],
    fontFamily: "Verdana,sans-serif",
    fontColor: "#FFFFFF",
    margin: {
      top: 20,
      right: 20,
      bottom: 30,
      left: 60
    }
  };

  $.ntkBarChart = function(elem, options, arg) {
    var $elem = $(elem);
    var init = function(elem, options) {
      //Width can be passed as arguments, otherwise just take full element space
      $elem.data('ntk_barchart', new BarChart($elem, options));
    };

    if (options && typeof(options) === 'string') {
      var barchart = $elem.data('ntk_barchart');
      if (typeof barchart[options] === 'function') {
        barchart[options].apply(barchart, [arg]);
      }
      return;
    } else if (options && typeof(options) === 'object') {
      init(elem, options);
    }
  };

})(jQuery);
