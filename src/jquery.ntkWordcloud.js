/*
* jquery.ntkWordcloud.js
*
* Renders a wordcloud, words can be added dynamically by using the "addWord" call.
* Wordcloud can be initialized by "jQuery UI-like" style like: $("<css selector>").ntkWordcloud({setting: "settingValue"})
* For a detailed list of available settings please check README
*/
(function($) {

  var WordCloud = function($element, options) {
    //Public variables
    this.options = options;

    //Private variables
    var words = [],
      width = $element.width(),
      height = $element.height();

    var svg = d3.select($element[0]).append("svg")
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", "0 0 " + width + " " + height);

    var text = svg.selectAll('text');
    var color = d3.scale.category20();

    var force = d3.layout
      .force()
      .nodes(words)
      .gravity(options.gravity)
      .size([width, height]);

    //Public functions
    this.render = function() {
      text = text.data(words, function(d) { return d.text; });

      text.enter()
        .append('text')
        .attr("text-anchor", "middle")
        .attr("font-family", function(d) {
          return d.fontFamily;
        })
        .attr("font-size", function(d) {
          return d.fontSize;
        })
        .attr("fill", function(d, i) {
          if(d.color === "random"){
            return color(i);
          }else{
            return d.color;
          }
        })
        .text(function(d){ return d.text })

      force.nodes(words).start();
    }.bind(this);

    this.addWords = function(newWords) {
      var self = this;
      newWords.forEach(function(w) { self.addWord(w) });
    }.bind(this);

    this.addWord = function(word) {
      var existing = words.find(function(w){
        return w.text === word.text;
      });

      if(existing){
        existing.increaseTo = existing.increaseTo ?
          existing.increaseTo + existing.wordIncreaseBy : existing.wordIncreaseBy;
      } else {
        words.push($.extend({}, this.options.wordDefaults, word));
      }
    }.bind(this);

    this.destroy = function() {
      svg.node().remove();
    }.bind(this);

    function collide(node) {
    	return function(quad, x1, y1, x2, y2) {
    		var updated = false;
    		if (quad.point && (quad.point !== node)) {

    			var x = node.x - quad.point.x,
    				y = node.y - quad.point.y,
    				xSpacing = (quad.point.width + node.width) / 2,
    				ySpacing = (quad.point.height + node.height) / 2,
    				absX = Math.abs(x),
    				absY = Math.abs(y),
    				l,
    				lx,
    				ly;

    			if (absX < xSpacing && absY < ySpacing) {
    				l = Math.sqrt(x * x + y * y);

    				lx = (absX - xSpacing) / l;
    				ly = (absY - ySpacing) / l;

    				// the one that's barely within the bounds probably triggered the collision
    				if (Math.abs(lx) > Math.abs(ly)) {
    					lx = 0;
    				} else {
    					ly = 0;
    				}

    				node.x -= x *= lx;
    				node.y -= y *= ly;
    				quad.point.x += x;
    				quad.point.y += y;

    				updated = true;
    			}
    		}
    		return updated;
    	};
    }

    force.on('tick', function() {

      text.each(function(d) {
        if(!d.originalFontSize) d.originalFontSize = d.fontSize;
        if(d.increasedBy < d.increaseTo){
          d.increasedBy += 0.5;
          d.fontSize = d.originalFontSize + d.increasedBy;
        }

        var bbox = this.getBBox();

        d.width = bbox.width;
        d.height = bbox.height;
      })

      var q = d3.geom.quadtree(words),
		    i = 0,
	      n = words.length;

	    while (++i < n) {
		    q.visit(collide(words[i]));
	    }

      text
        .attr('font-size', function(d){ return d.fontSize})
        .attr('x', function(d) {
          return d.x;
        })
        .attr('y', function(d) {
          return d.y;
        })
    });

  }

  $.fn.extend({
    ntkWordcloud: function(options, arg) {
      //Merge the passed arguments with the default arguments defined at the bottom of the page.
      if (options && typeof(options) === 'object') {
        options = $.extend({}, $.ntkWordcloud.defaults, options);
      } else if (!options) {
        options = $.extend({}, $.ntkWordcloud.defaults);
      }

      this.each(function() {
        $.ntkWordcloud(jQuery(this), options, arg);
      });
      return this;
    }
  });

  function getWordCloud($element) {
    var instance = $element.data('wordcloud');
    return instance;
  }

  function createWordCloud($element, options) {
    var instance = getWordCloud($element);
    if (instance) instance.destroy();

    var newInstance = new WordCloud($element, options);
    $element.data('wordcloud', newInstance);
  }

  $.ntkWordcloud = function($element, options, arg) {
    var instance = getWordCloud($element);

    if (options && typeof(options) === 'string') {
      //publicFns[options].apply(elem, [arg]);
      if (!instance) throw new Error('Not a wordcloud!');
      if(options === 'reset') {
        createWordCloud($element, instance.options);
      } else {
        instance[options].apply(instance, [arg]);
      }
    } else if (options && typeof(options) === 'object') {
      createWordCloud($element, options);
    }

    if (instance) instance.render();
  };


  $.ntkWordcloud.defaults = {
    words: [],
    gravity: 0.1, //Decides how quick the words will go to the center of gravity
    wordDefaults: {
      increasedBy: 0,
      increaseTo: 0,
      text: "Lorum",
      color: "random", //Can either be a HEX string or "random" <- means random color will be generated
      fontSize: 30,
      wordIncreaseBy: 5, //How much will the fontSize be increased if the word already exists (percentage),
      fontFamily: 'Helvetica'
    },
    defaultCharge: -1500, //Decides if nodes are attracted to each or not, positive means attraction, negative means repel
    chargeMultiplier: -50 //Charge is calculated from fontSize like this (fontSize * chargeMultiplier)
  };

})(jQuery);
