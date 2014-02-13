(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
slide = require('./slide-controller');
menu = require('./menu-controller');

module.exports = function kreator () {

	// Full list of configuration options available here:
	// https://github.com/hakimel/reveal.js#configuration
	Reveal.initialize({
    controls: true,
		progress: true,
		history: true,
    center: false,

		theme: Reveal.getQueryHash().theme, // available themes are in /css/theme
		transition: Reveal.getQueryHash().transition || 'default', // default/cube/page/concave/zoom/linear/fade/none

		// Optional libraries used to extend on reveal.js
		dependencies: [
			{ src: 'js/marked.js', condition: function() { return !!document.querySelector( '[data-markdown]' ); } },
			{ src: 'js/markdown.js', condition: function() { return !!document.querySelector( '[data-markdown]' ); } },
			{ src: 'js/highlight.js', async: true, callback: function() { hljs.initHighlightingOnLoad(); } },
			{ src: 'js/zoom.js', async: true, condition: function() { return !!document.body.classList; } },
			{ src: 'js/notes.js', async: true, condition: function() { return !!document.body.classList; } }
		]
	});

	slide.addListeners(document.querySelector('.js-handler--add-slide-down'),
                    document.querySelector('.js-handler--add-slide-right'));

  menu.addListeners({
    upload: document.querySelector('.js-handler--upload'),
    heading: document.querySelector('.js-handler--headings'),
    color: document.querySelector('.js-handler--color')
  });

};

},{"./menu-controller":3,"./slide-controller":4}],2:[function(require,module,exports){
var kreator = require('./kreator.js');

kreator();

},{"./kreator.js":1}],3:[function(require,module,exports){
module.exports = {
  addListeners: function(handler) {
    handler.upload.addEventListener('submit', uploadSlides, false);
    handler.heading.addEventListener('change', setHeading, false);
    handler.color.addEventListener('change', setColor, false);
  }
};

/*
 * Handle form submit events
 * reads the file as text
 * */
function uploadSlides(e) {
  e.preventDefault();
  var file = this.querySelector('input[type=file]').files[0];
  if (window.File && window.FileReader && window.FileList && window.Blob) {
    var reader = new FileReader();

    reader.onload = (function(file) {
      return parseFile;
    })(file);

    reader.readAsText(file, 'utf8');
  } else {
    alert('File reading not supported');
  }
}

/*
 * Should parse the file and extract the slide content
 * */
function parseFile(e) {
  var content = e.target.result;
  appendContent(content);
}

/* Appends the parsed content to the page
 * completly replaces the old content
 * */
function appendContent(content) {
  var slides = document.querySelector('.slides');
  slides.innerHTML = content;
  Reveal.toggleOverview();
  Reveal.toggleOverview();
}

/*
 * Set the heading on the current selection
 * */
function setHeading() {
  replaceSelectionWithHtml('<span style="font-size:'+this.value+'">' + getSelectionHtml() + '</span>');
}

function setColor() {
  console.log(this.value);
  replaceSelectionWithHtml('<span style="color:'+this.value+'">' + getSelectionHtml() + '</span>');
}

function getSelectionHtml() {
    var html = "";
    if (typeof window.getSelection != "undefined") {
        var sel = window.getSelection();
        if (sel.rangeCount) {
            var container = document.createElement("div");
            for (var i = 0, len = sel.rangeCount; i < len; ++i) {
                container.appendChild(sel.getRangeAt(i).cloneContents());
            }
            html = container.innerHTML;
        }
    } else if (typeof document.selection != "undefined") {
        if (document.selection.type == "Text") {
            html = document.selection.createRange().htmlText;
        }
    }
    return html;
}

function replaceSelectionWithHtml(html) {
    var range;
    if (window.getSelection && window.getSelection().getRangeAt) {
        range = window.getSelection().getRangeAt(0);
        range.deleteContents();
        var div = document.createElement("div");
        div.innerHTML = html;
        var frag = document.createDocumentFragment(), child;
        while ( (child = div.firstChild) ) {
            frag.appendChild(child);
        }
        range.insertNode(frag);
    } else if (document.selection && document.selection.createRange) {
        range = document.selection.createRange();
        html = (node.nodeType == 3) ? node.data : node.outerHTML;
        range.pasteHTML(html);
    }
}

},{}],4:[function(require,module,exports){
var addListeners = function (addDown, addRight) {
	// js-handler--add-slide-down
	// js-handler--add-slide-right

	addDown.addEventListener('click', slidesController.addSlideDown, 'false');
	addRight.addEventListener('click', slidesController.addSlideRight, 'false');
};

module.exports = {
	addListeners: addListeners
};

var slidesController = {
  slidesParent: document.querySelector('.slides'),
  addSlideDown: function() {
    // to add a slide down we must add a section
    // inside the current slide.
    // We select it and the section inside
    var currentSlide = slidesController.presentSlide();
    var children = currentSlide.querySelector('section');
    if (!children) {
      var parentSlide = slidesController.newSlide();
      var slide1 = slidesController.newSlide();
      var slide2 = slidesController.newSlide();
      slide1.innerHTML = currentSlide.innerHTML;
      parentSlide.innerHTML = '';
      parentSlide.appendChild(slide1);
      parentSlide.appendChild(slide2);
      currentSlide.parentNode.replaceChild(parentSlide, currentSlide);
      Reveal.toggleOverview();
      Reveal.toggleOverview();
      Reveal.down();
    } else {
      var slide = slidesController.newSlide();
      currentSlide.appendChild(slide);
      Reveal.toggleOverview();
      Reveal.toggleOverview();
      Reveal.down();
    }
  },
  addSlideRight: function() {
    var slide = slidesController.newSlide();
    slidesController.slidesParent.appendChild(slide);
    Reveal.right();
  },
  presentSlide: function() {
    return document.querySelector('.present');
  },
  newSlide: function() {
    var slide = document.createElement('section');
    slide.innerHTML = '<h2>Add your content here</h2>';
    return slide;
  }
};

},{}]},{},[2])