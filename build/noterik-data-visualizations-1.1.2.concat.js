/*! noterik-data-visualizations - v1.1.2 - 2016-08-09 */(function($) {

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

(function($, d3, window) {

    $.fn.extend({
        ntkWaterball: function(options, arg) {
            //Merge the passed arguments with the default arguments defined at the bottom of the page.
            if (options && typeof(options) === 'object') {
                options = $.extend({}, $.ntkWaterball.defaults, options);
            } else if (!options) {
                options = $.extend({}, $.ntkWaterball.defaults);
            }

            // this creates a plugin for each element in
            // the selector or runs the function once per
            // selector.  To have it do so for just the
            // first element (once), return false after
            // creating the plugin to stop the each iteration
            this.each(function() {
                $.ntkWaterball(this, options, arg);
            });
            return this;
        }
    });


    function Waterball(elem, settings, arg){
      var updater = null;
      var id = window.performance.now();
      var $elem = $(elem);
      settings = settings ? settings : $elem.data('ntk_waterball_settings');

      settings.width = settings.width ? settings.width : $elem.width();
      settings.height = settings.height ? settings.height : $elem.height();

      var svg = d3.select(elem).append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 " + settings.width + " " + settings.height);

      var value = arg ? arg : settings.minValue;

      var gauge = svg;
      var radius = Math.min(settings.width, settings.height) / 2;
      var locationX = settings.width / 2 - radius;
      var locationY = settings.height / 2 - radius;
      var fillPercent = Math.max(settings.minValue, Math.min(settings.maxValue, value)) / settings.maxValue;

      var waveHeightScale;
      if (settings.waveHeightScaling) {
          waveHeightScale = d3.scale.linear()
              .range([0, settings.waveHeight, 0])
              .domain([0, 50, 100]);
      } else {
          waveHeightScale = d3.scale.linear()
              .range([settings.waveHeight, settings.waveHeight])
              .domain([0, 100]);
      }

      var textPixels = (settings.textSize * radius / 2);
      var textFinalValue = parseFloat(value).toFixed(2);
      var textStartValue = settings.valueCountUp ? settings.minValue : textFinalValue;
      var percentText = settings.displayPercent ? "%" : "";
      var circleThickness = settings.circleThickness * radius;
      var circleFillGap = settings.circleFillGap * radius;
      var fillCircleMargin = circleThickness + circleFillGap;
      var fillCircleRadius = radius - fillCircleMargin;
      var waveHeight = fillCircleRadius * waveHeightScale(fillPercent * 100);

      var waveLength = fillCircleRadius * 2 / settings.waveCount;
      var waveClipCount = 1 + settings.waveCount;
      var waveClipWidth = waveLength * waveClipCount;

      // Rounding functions so that the correct number of decimal places is always displayed as the value counts up.
      var textRounder = function(value) {
          return Math.round(value);
      };
      if (parseFloat(textFinalValue) !== parseFloat(textRounder(textFinalValue))) {
          textRounder = function(value) {
              return parseFloat(value).toFixed(1);
          };
      }
      if (parseFloat(textFinalValue) !== parseFloat(textRounder(textFinalValue))) {
          textRounder = function(value) {
              return parseFloat(value).toFixed(2);
          };
      }

      // Data for building the clip wave area.
      var data = [];
      for (var i = 0; i <= 40 * waveClipCount; i++) {
          data.push({
              x: i / (40 * waveClipCount),
              y: (i / (40))
          });
      }

      // Scales for drawing the outer circle.
      var gaugeCircleX = d3.scale.linear().range([0, 2 * Math.PI]).domain([0, 1]);
      var gaugeCircleY = d3.scale.linear().range([0, radius]).domain([0, radius]);

      // Scales for controlling the size of the clipping path.
      var waveScaleX = d3.scale.linear().range([0, waveClipWidth]).domain([0, 1]);
      var waveScaleY = d3.scale.linear().range([0, waveHeight]).domain([0, 1]);

      // Scales for controlling the position of the clipping path.
      var waveRiseScale = d3.scale.linear()
          // The clipping area size is the height of the fill circle + the wave height, so we position the clip wave
          // such that the it will overlap the fill circle at all when at 0%, and will totally cover the fill
          // circle at 100%.
          .range([(fillCircleMargin + fillCircleRadius * 2 + waveHeight), (fillCircleMargin - waveHeight)])
          .domain([0, 1]);
      var waveAnimateScale = d3.scale.linear()
          .range([0, waveClipWidth - fillCircleRadius * 2]) // Push the clip area one full wave then snap back.
          .domain([0, 1]);

      // Scale for controlling the position of the text within the gauge.
      var textRiseScaleY = d3.scale.linear()
          .range([fillCircleMargin + fillCircleRadius * 2, (fillCircleMargin + textPixels * 0.7)])
          .domain([0, 1]);

      // Center the gauge within the parent SVG.
      var gaugeGroup = gauge.append("g")
          .attr('transform', 'translate(' + locationX + ',' + locationY + ')');

      // Draw the outer circle.
      var gaugeCircleArc = d3.svg.arc()
          .startAngle(gaugeCircleX(0))
          .endAngle(gaugeCircleX(1))
          .outerRadius(gaugeCircleY(radius))
          .innerRadius(gaugeCircleY(radius - circleThickness));
      gaugeGroup.append("path")
          .attr("d", gaugeCircleArc)
          .style("fill", settings.circleColor)
          .attr('transform', 'translate(' + radius + ',' + radius + ')');

      // Text where the wave does not overlap.
      var text1 = gaugeGroup.append("text")
          .text(textRounder(textStartValue) + percentText)
          .attr("class", "liquidFillGaugeText")
          .attr("text-anchor", "middle")
          .attr("font-size", textPixels + "px")
          .style("fill", settings.textColor)
          .attr('transform', 'translate(' + radius + ',' + textRiseScaleY(settings.textVertPosition) + ')');

      // The clipping wave area.
      var clipArea = d3.svg.area()
          .x(function(d) {
              return waveScaleX(d.x);
          })
          .y0(function(d) {
              return waveScaleY(Math.sin(Math.PI * 2 * settings.waveOffset * -1 + Math.PI * 2 * (1 - settings.waveCount) + d.y * 2 * Math.PI));
          })
          .y1(function(d) {
              return (fillCircleRadius * 2 + waveHeight);
          });
      var waveGroup = gaugeGroup.append("defs")
          .append("clipPath")
          .attr("id", "clipWave" + id);
      var wave = waveGroup.append("path")
          .datum(data)
          .attr("d", clipArea)
          .attr("T", 0);

      // The inner circle with the clipping wave attached.
      var fillCircleGroup = gaugeGroup.append("g")
          .attr("clip-path", "url(#clipWave" + id + ")");
      fillCircleGroup.append("circle")
          .attr("cx", radius)
          .attr("cy", radius)
          .attr("r", fillCircleRadius)
          .style("fill", settings.waveColor);

      // Text where the wave does overlap.
      var text2 = fillCircleGroup.append("text")
          .text(textRounder(textStartValue) + percentText)
          .attr("class", "liquidFillGaugeText")
          .attr("text-anchor", "middle")
          .attr("font-size", textPixels + "px")
          .style("fill", settings.waveTextColor)
          .attr('transform', 'translate(' + radius + ',' + textRiseScaleY(settings.textVertPosition) + ')');

      // Make the value count up.
      if (settings.valueCountUp) {
          var textTween = function() {
              var i = d3.interpolate(this.textContent, textFinalValue);
              return function(t) {
                  this.textContent = textRounder(i(t)) + percentText;
              };
          };
          text1.transition()
              .duration(settings.waveRiseTime)
              .tween("text", textTween);
          text2.transition()
              .duration(settings.waveRiseTime)
              .tween("text", textTween);
      }

      // Make the wave rise. wave and waveGroup are separate so that horizontal and vertical movement can be controlled independently.
      var waveGroupXPosition = fillCircleMargin + fillCircleRadius * 2 - waveClipWidth;
      if (settings.waveRise) {
          waveGroup.attr('transform', 'translate(' + waveGroupXPosition + ',' + waveRiseScale(0) + ')')
              .transition()
              .duration(settings.waveRiseTime)
              .attr('transform', 'translate(' + waveGroupXPosition + ',' + waveRiseScale(fillPercent) + ')')
              .each("start", function() {
                  wave.attr('transform', 'translate(1,0)');
              }); // This transform is necessary to get the clip wave positioned correctly when waveRise=true and waveAnimate=false. The wave will not position correctly without this, but it's not clear why this is actually necessary.
      } else {
          waveGroup.attr('transform', 'translate(' + waveGroupXPosition + ',' + waveRiseScale(fillPercent) + ')');
      }

      if (settings.waveAnimate){
        animateWave();
      }

      function animateWave() {
          wave.attr('transform', 'translate(' + waveAnimateScale(wave.attr('T')) + ',0)');
          wave.transition()
              .duration(settings.waveAnimateTime * (1 - wave.attr('T')))
              .ease('linear')
              .attr('transform', 'translate(' + waveAnimateScale(1) + ',0)')
              .attr('T', 1)
              .each('end', function() {
                  wave.attr('T', 0);
                  animateWave(settings.waveAnimateTime);
              });
      }

      function GaugeUpdater() {
          this.update = function(value) {
              var newFinalValue = parseFloat(value).toFixed(2);
              var textRounderUpdater = function(value) {
                  return Math.round(value);
              };
              if (parseFloat(newFinalValue) !== parseFloat(textRounderUpdater(newFinalValue))) {
                  textRounderUpdater = function(value) {
                      return parseFloat(value).toFixed(1);
                  };
              }
              if (parseFloat(newFinalValue) !== parseFloat(textRounderUpdater(newFinalValue))) {
                  textRounderUpdater = function(value) {
                      return parseFloat(value).toFixed(2);
                  };
              }

              var textTween = function() {
                  var i = d3.interpolate(this.textContent, parseFloat(value).toFixed(2));
                  return function(t) {
                      this.textContent = textRounderUpdater(i(t)) + percentText;
                  };
              };

              text1.transition()
                  .duration(settings.waveRiseTime)
                  .tween("text", textTween);
              text2.transition()
                  .duration(settings.waveRiseTime)
                  .tween("text", textTween);

              var fillPercent = Math.max(settings.minValue, Math.min(settings.maxValue, value)) / settings.maxValue;
              var waveHeight = fillCircleRadius * waveHeightScale(fillPercent * 100);
              var waveRiseScale = d3.scale.linear()
                  // The clipping area size is the height of the fill circle + the wave height, so we position the clip wave
                  // such that the it will overlap the fill circle at all when at 0%, and will totally cover the fill
                  // circle at 100%.
                  .range([(fillCircleMargin + fillCircleRadius * 2 + waveHeight), (fillCircleMargin - waveHeight)])
                  .domain([0, 1]);
              var newHeight = waveRiseScale(fillPercent);
              var waveScaleX = d3.scale.linear().range([0, waveClipWidth]).domain([0, 1]);
              var waveScaleY = d3.scale.linear().range([0, waveHeight]).domain([0, 1]);
              var newClipArea;
              if (settings.waveHeightScaling) {
                  newClipArea = d3.svg.area()
                      .x(function(d) {
                          return waveScaleX(d.x);
                      })
                      .y0(function(d) {
                          return waveScaleY(Math.sin(Math.PI * 2 * settings.waveOffset * -1 + Math.PI * 2 * (1 - settings.waveCount) + d.y * 2 * Math.PI));
                      })
                      .y1(function(d) {
                          return (fillCircleRadius * 2 + waveHeight);
                      });
              } else {
                  newClipArea = clipArea;
              }

              var newWavePosition = settings.waveAnimate ? waveAnimateScale(1) : 0;
              wave.transition()
                  .duration(0)
                  .transition()
                  .duration(settings.waveAnimate ? (settings.waveAnimateTime * (1 - wave.attr('T'))) : (settings.waveRiseTime))
                  .ease('linear')
                  .attr('d', newClipArea)
                  .attr('transform', 'translate(' + newWavePosition + ',0)')
                  .attr('T', '1')
                  .each("end", function() {
                      if (settings.waveAnimate) {
                          wave.attr('transform', 'translate(' + waveAnimateScale(0) + ',0)');
                          animateWave(settings.waveAnimateTime);
                      }
                  });
              waveGroup.transition()
                  .duration(settings.waveRiseTime)
                  .attr('transform', 'translate(' + waveGroupXPosition + ',' + newHeight + ')');
          };
      }
      updater = new GaugeUpdater();

      return {
        update: function(val){
          updater.update(val);
        }
      };
    }

    $.ntkWaterball = function(elem, options, arg) {
        var updater = null;
        var $elem = $(elem);
        var publicFns = {
            update: function(value) {
              if($elem.data('ntk_waterball')){
                $elem.data('ntk_waterball').update(value);
              }
            }
        };

        function init(options, arg) {
          $elem.data('ntk_waterball', new Waterball(elem, options, arg));
          $elem.data('ntk_waterball_settings', options);
        }

        if (options && typeof(options) === 'string') {
            publicFns[options].apply(elem, [arg]);
            return;
        } else if (options && typeof(options) === 'object') {
            if (typeof(arg) === "undefined" || typeof(arg) === "number") {
                init(options, arg);
            } else {
                throw "Please pass a number as argument";
            }
        }
    };

    $.ntkWaterball.defaults = {
        minValue: 0, // The gauge minimum value.
        maxValue: 100, // The gauge maximum value.
        circleThickness: 0.05, // The outer circle thickness as a percentage of it's radius.
        circleFillGap: 0.05, // The size of the gap between the outer circle and wave circle as a percentage of the outer circles radius.
        circleColor: "#178BCA", // The color of the outer circle.
        waveHeight: 0.05, // The wave height as a percentage of the radius of the wave circle.
        waveCount: 1, // The number of full waves per width of the wave circle.
        waveRiseTime: 1000, // The amount of time in milliseconds for the wave to rise from 0 to it's final height.
        waveAnimateTime: 18000, // The amount of time in milliseconds for a full wave to enter the wave circle.
        waveRise: true, // Control if the wave should rise from 0 to it's full height, or start at it's full height.
        waveHeightScaling: true, // Controls wave size scaling at low and high fill percentages. When true, wave height reaches it's maximum at 50% fill, and minimum at 0% and 100% fill. This helps to prevent the wave from making the wave circle from appear totally full or empty when near it's minimum or maximum fill.
        waveAnimate: true, // Controls if the wave scrolls or is static.
        waveColor: "#178BCA", // The color of the fill wave.
        waveOffset: 0, // The amount to initially offset the wave. 0 = no offset. 1 = offset of one full wave.
        textVertPosition: 0.5, // The height at which to display the percentage text withing the wave circle. 0 = bottom, 1 = top.
        textSize: 1, // The relative height of the text to display in the wave circle. 1 = 50%
        valueCountUp: true, // If true, the displayed value counts up from 0 to it's final value upon loading. If false, the final value is displayed.
        displayPercent: true, // If true, a % symbol is displayed after the value.
        textColor: "#045681", // The color of the value text when the wave does not overlap it.
        waveTextColor: "#A4DBf8" // The color of the value text when the wave overlaps it.
    };
})(jQuery, d3, window);

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

    //The functions that are public
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
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 " + settings.width + " " + settings.height);

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
