# NoterikDataVisualizations
Data Visualization plugins for jQuery using d3.js, contains several jQuery plugins that can be used to visualize data.

##Dependencies

-jQuery
-d3

##Building

Make sure you have npm installed, go to NoterikDataVisualization root directory and run:

```javascript
npm install
```

After that run:

```
grunt
```

In NoterikDataVisualization root directory.

##Usage

You can use them by adding them to your webpage like:

```html
<script src="noterik-data-visualizations-1.0.0.min.js">
```

All plugins use jQueryUI like initialization:

```javascript
$("#wordcloud").ntkWordcloud({setting: 'settingValue'})
```

Examples can be found in the /examples folder and can be run without a webserver.

##Wordcloud

Renders words in a cloud. When a new word is added, it "shoots" it into the existing cloud. If a word is added that
already exists, the size of the existing word will be increased. Example can be found in /examples/wordcloud.html.

A wordcloud can be initialized like this:

```javascript
$('#wordcloud').ntkWordcloud();
```

A word can be passed like this:

```javascript
$('#wordcloud').ntkWordcloud('addWord', {
    text: "Lorum"
});
```

###Settings

All the settings can be passed when initializing the wordcloud, example:

```javascript
$("#wordcloud").ntkWordcloud({
  gravity: 0.5
});
```

####Wordcloud generic settings
Setting    |  Type | Explanation
-----------|-------|-------------
words      | Array | The array of words that you want to show when initialization the words. (predefined words)
gravity    | Double| The gravity that the center of the cloud has, defines how fast words shoot to the wordcloud, and how hard they are pulled to the center.
wordDefaults | Object | The default settings for the word that is being added, please check table below for available word settings.
defaultCharge | Integer | Decides if nodes are attracted to each or not, positive means attraction, negative means repel.
chargeMultiplier | Integer | Charge is calculated from fontSize like this : fontSize * chargeMultiplier, larger font means lower charge.

####Wordcloud word settings
These are passed as an object in the generic wordDefaults object like:

```javascript
$('#wordcloud').ntkWordcloud({
  gravity: 0.5,
  wordDefaults: { //<-- These are the default word settings
    fontFamilty: 'Arial'
  }
});
```
They can also be overwritten specifically by changing the values of the word object passed in the "addWord" method like:

```javascript
$("#wordcloud").ntkWordcloud('addWord', {
  text: 'Lorum',
  fontFamily: 'Helvetica',
  color: '#123456'
});
```
