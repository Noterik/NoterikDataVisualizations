/*jslint browser: true */
(function($, d3, window) {

    $.fn.extend({
        ntkLogo: function(options, arg) {
            //Merge the passed arguments with the default arguments defined at the bottom of the page.
            if (options && typeof(options) === 'object') {
                options = $.extend({}, $.ntkLogo.defaults, options);
            } else if (!options) {
                options = $.extend({}, $.ntkLogo.defaults);
            }

            // this creates a plugin for each element in
            // the selector or runs the function once per
            // selector.  To have it do so for just the
            // first element (once), return false after
            // creating the plugin to stop the each iteration
            this.each(function() {
                $.ntkLogo(this, options, arg);
            });
            return this;
        }
    });


    function Logo(elem, options){
      var $elem = jQuery(elem);

      options = Object.assign($.ntkLogo.defaults, options);

      var idleAnimation = null;
      var idleAnimationIntervalObj = null;
      var currentAnimation = null;
      var left = null;
      var right = null;

      var animations = {
        rotate: function(duration){
          duration = duration || options.animationLength;

          var deferred = jQuery.Deferred();
          setTimeout(function(){
            deferred.resolve();
          }, duration);

          left.transition()
            .duration(duration)
            .attrTween("d", arcTween(Math.PI));

          right.transition()
            .duration(duration)
            .attrTween("d", arcTween(Math.PI));

          return deferred;
        }
      };

      var settings = {
        width: 500,
        height: 500,
        outerRadius : 250,
        outerColor: 'rgb(48, 142, 209)',
        innerColor: 'rgb(134, 205, 77)',
        leftStartAngle: 0,
        leftEndAngle: Math.PI,
        rightStartAngle: Math.PI,
        rightEndAngle: Math.PI * 2
      };

      var svg = d3.select($elem[0]).append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 " + settings.width + " " + settings.height)
        .append("g")
        .attr("transform", "translate(" + settings.width / 2 + "," + settings.height / 2 + ")");

      var arc = d3.svg.arc()
        .innerRadius(settings.outerRadius * 0.78)
        .outerRadius(settings.outerRadius)
        .padAngle(0.1);

      var centerArc = d3.svg.arc()
        .innerRadius(0)
        .outerRadius(settings.outerRadius * 0.4)
        .startAngle(0)
        .endAngle(Math.PI * 2);

      left = svg.append("path")
        .datum({
          startAngle: settings.leftStartAngle,
          endAngle: settings.leftEndAngle
        })
        .attr("d", arc)
        .style("fill", settings.outerColor);

      right = svg.append("path")
        .datum({
          startAngle: settings.rightStartAngle,
          endAngle: settings.rightEndAngle
        })
        .attr("d", arc)
        .style("fill", settings.outerColor);

      svg.append("path")
        .attr("d", centerArc)
        .style("fill", settings.innerColor);

      var text = svg.append("text")
        .datum({
          text: "1"
        })
        .style("text-anchor", "middle")
        .style("fill", options.textColor)
        .style("font-family",options.fontFamily)
        .style("font-size", options.fontSize)
        .attr("transform", "translate(0, " + (options.fontSize / 3 ) + ")")
        .text(function(d){
          return d.text;
        });


      function arcTween(newAngle){
        return function(d){

          var startInterpolate = d3.interpolate(d.startAngle, d.startAngle + newAngle);
          var endInterpolate = d3.interpolate(d.endAngle, d.endAngle + newAngle);
          return function(t){
            d.startAngle = startInterpolate(t);
            d.endAngle = endInterpolate(t);
            return arc(d);
          };
        };
      }

      if(options.animation){

        if(animations[options.animation]){
          idleAnimation = animations[options.animation];
          startIdleAnimation();
        }
      }

      function startIdleAnimation(){
        stopIdleAnimation();
        idleAnimationIntervalObj = setInterval(function(){
          idleAnimation();
        }, options.animationInterval);
      }

      function stopIdleAnimation(){
        if(idleAnimationIntervalObj){
          clearInterval(idleAnimationIntervalObj);
        }
      }

      function animate(animation, length){
        length = length || options.animationLength;

        if(!currentAnimation){
          currentAnimation = animation(length);
          currentAnimation.then(function(){
            currentAnimation = null;
          });
        }
      }

      return {
        setText: function(valueObj){
          text.datum({text: valueObj.text});

          text.transition()
            .duration(250)
            .text(function(d){
              return d.text;
            });

          if(valueObj.animation && animations[valueObj.animation]){
            animate(animations[valueObj.animation]);
          }
        }
      };
    }

    $.ntkLogo = function(elem, options, arg) {
        var updater = null;
        var $elem = $(elem);
        var publicFns = {
            setText: function(value) {
              if($elem.data('ntk_logo')){
                $elem.data('ntk_logo').setText(value);
              }
            }
        };

        function init(options, arg) {
          $elem.data('ntk_logo', new Logo(elem, options, arg));
          $elem.data('ntk_logo_settings', options);
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

    $.ntkLogo.defaults = {
      animationLength: 750,
      animationInterval: 1000,
      textColor: '#FFFFFF',
      fontFamily: 'Verdana, Arial',
      fontSize: 40
    };
})(jQuery, d3, window);
