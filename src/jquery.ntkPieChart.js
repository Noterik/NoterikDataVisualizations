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
    var self = this;
    settings = jQuery.extend({}, this.defaults, settings);

    if (!settings.width){
      settings.width = element.width();
    }

    if (!settings.height){
      settings.height = element.height();
    }

    if (!settings.radius){
      settings.radius = Math.min(settings.width, settings.height) / 2;
    }

    var pie = d3.layout.pie()
      .sort(null)
      .value(function(d) {
        return d.value;
      });

    var color = d3.scale.category20();

    var svg = d3.select(element[0]).append("svg")
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("viewBox", "0 0 " + settings.width + " " + settings.height)
      .append("g")
      .attr("transform", "translate(" + settings.width / 2 + "," + settings.height / 2 + ")");

    var arc = d3.svg.arc()
      .outerRadius(settings.radius)
      .innerRadius(0);

    var path = svg.selectAll("path")
      .data(pie(settings.data));

    var text = svg.selectAll("text")
      .data(pie(settings.data));

    var render = function(){
      path.exit().remove();
      text.exit().remove();

      path.enter().append("path")
        .style("fill", function(d, i){
          if(d.data.color){
            return d.data.color;
          }
          return color(i);
        })
        .each(function(d){
          this._current = d;
        });


      text.enter().append("text")
        .text(function(d){
          return d.data.label;
        })
        .attr("transform", function(d){
          return "translate(" + arc.centroid(d) + ")";
        })
        .style("font-family", function(d){
          if(d.fontFamily){
            return d.fontFamily;
          }else{
            return settings.fontFamily;
          }
        })
        .style("fill", function(d){
          if(d.fontColor){
            return d.fontColor;
          }else{
            return settings.fontColor;
          }
        })
        .each(function(d){
          this._current = d;
        });

    };

    render();
    animate();

    this.redraw = function(){
      var pieData = pie(settings.data);
      path = path.data(pieData);
      text = text.data(pieData);
      render();
      animate();
    };

    this.setData = function(data){
      settings.data = data;
    };

    function animate(){
      path.transition().duration(500).attrTween("d", arcTween).style("fill", function(d, i){
        if(d.data.color){
          return d.data.color;
        }
        return color(i);
      });
      text.transition().text(function(d){
        return d.data.label;
      });
      text.transition().duration(750).attrTween("transform", textTween);
    }

    function textTween(a){
      var i = d3.interpolate(this._current, a);
      this._current = i(0);
      return function(t){
        return "translate(" + arc.centroid(i(t)) + ")";
      };
    }

    function arcTween(a) {
      var i;
      if(!this._startAnimationDone){
        this._startAnimationDone = true;
        var start = {
          startAngle: a.endAngle,
          endAngle: a.endAngle
        };
        i = d3.interpolate(start, a);
        return function(t) {
          return arc(i(t));
        };
      }else{
        i = d3.interpolate(this._current, a);
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
      };
    }
  };
  PieChart.prototype = Object.create({});
  PieChart.prototype.defaults = {
    data: [],
    fontFamily: "Verdana,sans-serif",
    fontColor: "#FFFFFF",
  };

  $.ntkPieChart = function(elem, options, arg) {
    var $elem = $(elem);
    var init = function(elem, options) {
      //Width can be passed as arguments, otherwise just take full element space
      $elem.data('ntk_piechart', new PieChart($elem, options));
    };

    if (options && typeof(options) === 'string') {
      var pie = $elem.data('ntk_piechart');
      if(typeof pie[options] === 'function'){
        pie[options].apply(pie, [arg]);
      }
      return;
    } else if (options && typeof(options) === 'object') {
      init(elem, options);
    }
  };

})(jQuery);
