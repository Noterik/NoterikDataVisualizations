/*
* jquery.ntkWordcloud.js
*
* Renders a wordcloud, words can be added dynamically by using the "addWord" call.
* Wordcloud can be initialized by "jQuery UI-like" style like: $("<css selector>").ntkWordcloud({setting: "settingValue"})
* For a detailed list of available settings please check README
*/
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
