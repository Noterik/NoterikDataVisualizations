(function($) {

  function allTransitionsDone(transition, callback) {
    if (typeof callback !== "function") throw new Error("Wrong callback in endall");
    if (transition.size() === 0) { callback(); }
    var n = 0;
    transition
      .each(function() { ++n; })
      .each("end", function() { if (!--n) callback.apply(this, arguments); });
  }

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

  function pipe(){
    var fns = Array.prototype.slice.call(arguments);
    console.log('fns = ', fns);
    return function(subject){
      fns.reduce(function(acc, fn){
        return fn.apply(subject, [subject]);
      }, subject);
    };
  }

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
      .attr("width", settings.width)
      .attr("height", settings.height)
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

    var textPipeFns = [
      function(element) {
        return element.text(function(d){
          return d.data.label;
        });
      },
      function(element) {
        return element.attr("transform", function(d) {
          return "translate(" + arc.centroid(d) + ")";
        });
      },
      function(element) {
        return element.style("font-family", function(d){
          if(d.fontFamily){
            return d.fontFamily;
          }else{
            return settings.fontFamily;
          }
        });
      },
      function(element) {
        return element.style("fill", function(d){
          if(d.fontColor){
            return d.fontColor;
          }else{
            return settings.fontColor;
          }
        });
      },
      function(element) {
        return element.each(function(d){
          this._current = d;
        });
      }
    ];

    if(settings.labelCallback) textPipeFns.push(settings.labelCallback);
    var textPipe = pipe.apply(this, textPipeFns);

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
        .attr("class", function(d){
          return settings.style;
        })
        .each(function(d){
          this._current = d;
        });

      textPipe(text.enter().append("text"));
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
      var sliceDone = false, textDone = false;

      function isFinished(){
        if (sliceDone && textDone){
          element.trigger('animation-finished');
        }
      }

      if (settings.style !== "") {
        path.transition().duration(settings.sliceAnimationDuration).attrTween("d", arcTween).call(allTransitionsDone, function(){
          element.trigger('slice-animation-finished');
          sliceDone = true;
          isFinished();
        });

        path.attr("class", function(d){
          return d.data.style;
        });
      } else {
        path.transition().duration(settings.sliceAnimationDuration).attrTween("d", arcTween).style("fill", function(d, i){
          if(d.data.color){
            return d.data.color;
          }
          return color(i);
        });
      }

      text.transition().text(function(d){
        return d.data.label;
      });
      text.transition().duration(settings.textAnimationDuration).attrTween("transform", textTween).call(allTransitionsDone, function(){
        element.trigger('text-animation-finished');
        textDone = true;
        isFinished();
      });
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
    labelCallback: null,
    sliceAnimationDuration: 500,
    textAnimationDuration: 750,
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
