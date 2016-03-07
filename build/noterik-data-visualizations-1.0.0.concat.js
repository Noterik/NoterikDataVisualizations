/*! noterik-data-visualizations - v1.0.0 - 2016-03-07 */(function($) {

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
      .attr("width", settings.width)
      .attr("height", settings.height)
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
      path.transition().duration(500).attrTween("d", arcTween);
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

(function($) {

  $.fn.extend({
    ntkWordcloud: function(options, arg) {
      //Merge the passed arguments with the default arguments defined at the bottom of the page.
      if (options && typeof(options) === 'object') {
        options = $.extend({}, $.ntkWordcloud.defaults, options);
      } else if (!options) {
        options = $.extend({}, $.ntkWordcloud.defaults);
      }

      // this creates a plugin for each element in
      // the selector or runs the function once per
      // selector.  To have it do so for just the
      // first element (once), return false after
      // creating the plugin to stop the each iteration
      this.each(function() {
        $.ntkWordcloud(this, options, arg);
      });
      return this;
    }
  });

  $.ntkWordcloud = function(elem, options, arg) {

    //The functions that are re
    var publicFns = {
      addWord: function(word){
        var $elem = $(this);

        var settings = $elem.data('ntk_wordcloud_settings');
        var words = settings.words;

        var alreadyExists = false;
        var existingWords = words.forEach(function(w){
          if(w.text === word.text){
            alreadyExists = true;

            if(w.wantedFontSize){
              w.wantedFontSize += w.fontSizeIncrease;
            }else{
              w.wantedFontSize = w.fontSize + w.fontSizeIncrease;
            }
          }
        });
        if(!alreadyExists){
          words.push($.extend({}, settings.wordDefaults, word));
        }
        startForce(elem);
      },
      reset: function(){
        $(this).html('');
        var settings = $(this).data('ntk_wordcloud_settings');
        settings.words = [];
        init(this);
      }
    };

    var startForce = function(elem) {
      var $elem = $(elem);
      var settings = $elem.data('ntk_wordcloud_settings');

      var force = settings._force;
      var svg = settings._svg;
      var words = settings.words;

      force.start();
      svg.selectAll("text").remove();

      elem = svg.selectAll("g myCircleText")
        .data(words.slice(1));

      var color = d3.scale.category20();

      var elemEnter = elem.enter()
        .append("text")
        .text(function(d) {
          return d.text;
        })
        .style("font-family", function(d){
          return d.fontFamily;
        })
        .attr("dx", function(d) {
          return this.getComputedTextLength() / 2;
        })
        .attr("fill", function(d, i) {
          if(d.color === "random"){
            return color(i);
          }else{
            return d.color;
          }
        });

      svg.selectAll("text").each(function(d) {
        var boundingBox = this.getBoundingClientRect();
        d.textHeight = boundingBox.height;
        d.textWidth = boundingBox.width;
        d.x2 = function() {
          return d.x + d.textWidth;
        };
        d.y2 = function() {
          return d.y + d.textHeight;
        };
      });
    };

    var init = function(elem, options) {
      var $elem = $(elem);
      var existingSettings = $elem.data('ntk_wordcloud_settings');
      var settings = options ? options : existingSettings;

      //Width can be passed as arguments, otherwise just take full element space
      if(!settings.width){
        settings.width = $elem.width();
      }

      if(!settings.height){
        settings.height = $elem.height();
      }

      //Create root element for force layout
      var root = {
        radius: 0,
        fixed: true
      };

      //Add required parameters that might be missing to the words
      settings.words = settings.words.map(function(word){
        return $.extend({}, settings.wordDefaults, word);
      });

      //Add the root
      settings.words.unshift(root);

      //Initialize force layout
      settings._force = d3.layout.force()
        .gravity(settings.gravity)
        .charge(function(d, i) {
          return d.fontSize ? d.fontSize * settings.chargeMultiplier : settings.defaultCharge;
        })
        .nodes(settings.words)
        .size([settings.width, settings.height]);

      settings._svg = d3.select(elem).append("svg")
        .attr("width", settings.width)
        .attr("height", settings.height);

      $elem.data('ntk_wordcloud_settings', settings);

      //Callback for animations
      settings._force.on('tick', function(e){
        settings._svg.selectAll("text")
          .attr("transform", function(d){
            var str;
            if(!d.x || !d.y){
              d.x = 0;
              d.y = 0;
            }
            return "translate("+d.x+","+d.y+")";
          })
          .style("font-size", function(d){
            if(d.wantedFontSize && d.wantedFontSize > d.fontSize){
              d.fontSize++;
            }
            return d.fontSize + "px";
          });
      });

      startForce(elem);
    };

    if (options && typeof(options) === 'string') {
      publicFns[options].apply(elem, [arg]);
      return;
    } else if (options && typeof(options) === 'object') {
      init(elem, options);
    }
  };

  $.ntkWordcloud.defaults = {
    words: [],
    gravity: 0.4, //Decides how quick the words will go to the center of gravity
    wordDefaults: {
      text: "Lorum",
      color: "random", //Can either be a HEX string or "random" <- means random color will be generated
      fontSize: 30,
      fontSizeIncrease: 10, //How much will the fontSize be increased if the word already exists,
      fontFamily: 'Helvetica'
    },
    defaultCharge: -1500, //Decides if nodes are attracted to each or not, positive means attraction, negative means repel
    chargeMultiplier: -50 //Charge is calculated from fontSize like this (fontSize * chargeMultiplier)
  };

})(jQuery);
