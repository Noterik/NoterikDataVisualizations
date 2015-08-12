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

  var BarChart = function(element, settings){
    console.log("new BarChart(", settings , ")");
    var self = this;
    settings = jQuery.extend({}, this.defaults, settings);

    if (!settings.width)
      settings.width = element.width()

    if (!settings.height)
      settings.height = element.height();

    var svg = d3.select(element[0]).append("svg")
      .attr("width", settings.width)
      .attr("height", settings.height)
      .append("g")
      .attr("transform", "translate(" + settings.width / 2 + "," + settings.height / 2 + ")");

    var render = function(){

    }

    render();
    animate();

    this.reset = function(){
    };

    this.update = function(data){
      var pieData = pie(settings.data);
      path = path.data(pieData);
      text = text.data(pieData);
      render();
      animate();
    };

    function animate(){
      path.transition().duration(500).attrTween("d", arcTween);
      text.transition().duration(750).attrTween("transform", textTween);
    }

    function textTween(a){
      var i = d3.interpolate(this._current, a);
      this._current = i(0);
      return function(t){
        return "translate(" + arc.centroid(i(t)) + ")";
      }
    }

    function arcTween(a) {
      console.log(this._current);
      if(!this._startAnimationDone){
        this._startAnimationDone = true;
        var start = {
          startAngle: a.endAngle,
          endAngle: a.endAngle
        }
        var i = d3.interpolate(start, a);
        return function(t) {
          return arc(i(t));
        }
      }else{
        var i = d3.interpolate(this._current, a);
        this._current = i(0);
        return function(t) {
          return arc(i(t));
        };
      }
    }

    function newPartTween(a){
      var b = {
        startAngle: 0,
        endAngle: 0
      };
      var i = d3.interpolate(b, a);
      return function(t){
        return arc(i(t));
      }
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
