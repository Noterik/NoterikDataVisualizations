(function($) {

  $.fn.extend({
    ntkPieChart: function(options, arg) {
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

  var PieChart = function(element, settings){
    console.log("new PieChart(", settings , ")");
    settings = jQuery.extend({}, this.defaults, settings);

    if (!settings.width)
      settings.width = element.width()

    if (!settings.height)
      settings.height = element.height();

    if (!settings.radius)
      settings.radius = Math.min(settings.width, settings.height) / 2;

    var pie = d3.layout.pie()
      .sort(null)
      .value(function(d) {
        return d.value;
      });

    var color = d3.scale.category20();

    var svg = d3.select(element[0]).append("svg")
      .attr("width", settings.width)
      .attr("height", settings.height)
      .append("g")
      .attr("transform", "translate(" + settings.width / 2 + "," + settings.height / 2 + ")");

    var arc = d3.svg.arc()
      .outerRadius(settings.radius)
      .innerRadius(0);

    var path = svg.selectAll("path")
      .data(pie(settings.data));

    var render = function(){
      path.enter().append("path")
      .attr("d", arc)
      .style("fill", function(d, i){ return color(i); })
      .each(function(d){
        this._current = d;
      })

    }

    render();

    this.reset = function(){

    };

    this.update = function(data){
      path = path.data(pie(settings.data));
      render();
      animate();
    };

    function animate(){
      path.transition().duration(750).attrTween("d", arcTween);
    }

    function arcTween(a) {
      console.log(this._current);
      var i = d3.interpolate(this._current, a);
      this._current = i(0);
      return function(t) {
        return arc(i(t));
      };
    }
  };
  PieChart.prototype = Object.create({});
  PieChart.prototype.defaults = {
    data: [],
    fontFamily: "Verdana,sans-serif",
    fontColor: "#FFFFFF",
  }

  $.ntkPieChart = function(elem, options, arg) {
    var $elem = $(elem);
    var init = function(elem, options) {
      //Width can be passed as arguments, otherwise just take full element space
      $elem.data('ntk_piechart', new PieChart($elem, options));
    }

    if (options && typeof(options) == 'string') {
      var pie = $elem.data('ntk_piechart');
      if(typeof pie[options] === 'function'){
        pie[options].apply(pie, [arg]);
      }
      return;
    } else if (options && typeof(options) == 'object') {
      init(elem, options);
    }
  };

})(jQuery);
