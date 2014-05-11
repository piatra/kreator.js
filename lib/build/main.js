(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = {
  addListener: function(el) {
    el.addEventListener('click', downloadSlides, false);
  }
};

var parts = [{
  name: 'head.html',
  path: ''
}, {
  name: 'tail.html',
  path: ''
}, {
  name: 'default.css',
  path: 'css'
}, {
  name: 'zenburn.css',
  path: 'lib/css'
}, {
  name: 'head.min.js',
  path: 'lib/js'
}, {
  name: 'reveal.js',
  path: 'js'
}, {
  name: 'main.css',
  path: 'css'
}, {
  name: 'zenburn.css',
  path: 'css'
}, {
  name: 'print.css',
  path: 'css'
}, {
  name: 'classList.js',
  path: 'lib/js'
}, {
  name: 'highlight.js',
  path: 'lib/js'
}, {
  name: 'sky.css',
  path: 'css'
}, {
  name: 'night.css',
  path: 'css'
}, {
  name: 'beige.css',
  path: 'css'
}];

function downloadSlides() {
  var content = [];
  var url = location.origin + '/kreator.js/download/';
  if (location.origin.match('localhost')) { // we are running in development
    console.info('Development mode');
    url = location.origin + '/download/';
    console.info('Download URL points to ' + url);
  }
  var l = parts.length;
  var folders = parts.map(function(p) {
    return p.path;
  });
  parts.map(function(p) {
    return url + p.name;
  }).forEach(function(url, idx) {
    requestPart(url)
      .then(function (resp) {
        content[idx] = resp;
        if (--l === 0) {
          createZip(content, folders);
        }
      });
  });
}

/*
 * Toggle on and off the contentEditable
 * attribute on the slides
 * */
function toggleEditMode(mode) {
  var slides = document.querySelectorAll('section');
  _.each(slides, function(s) {
    s.setAttribute('contentEditable', mode);
  });
}

function createZip(content, folders) {
  toggleEditMode(false);
  content[0] = content[0].replace(/default.css/g, App.theme);
  var slides = '<div class="reveal"><div class="slides">' +
                document.querySelector('.slides').innerHTML +
                '</div></div>';
  var index = content.splice(0,2);
  var zip = new JSZip();
  index.splice(1, 0, slides);
  index = index.join('');
  index.replace(/<title>.*<\/title>/g, '<title>' + App.title + '</title>');
  zip.file('index.html', index);

  for (var i = 2; i < folders.length; i++) {
    var folder = zip.folder(folders[i]);
    folder.file(parts[i].name, content[i - 2]);
  }

  content = zip.generate({type: 'blob'});
  var link = document.querySelector('.js-handler--download-ready');
  link.href = window.URL.createObjectURL(content);
  link.innerHTML = 'Presentation ready. Click here to download';
  link.download = 'YourPresentation.zip';
  toggleEditMode(true);
}

function requestPart(url) {

  var request = new XMLHttpRequest();
  var deferred = Q.defer();

  request.open("GET", url, true);
  request.onload = onload;
  request.onerror = onerror;
  request.send();

  function onload() {
    if (request.status === 200) {
      deferred.resolve(request.responseText);
    } else {
      deferred.reject(new Error("Status code: " + request.status));
    }
  }

  function onerror() {
    deferred.reject(new Error("Request to " + url + " failed"));
  }

  return deferred.promise;
}

},{}],2:[function(require,module,exports){
slide = require('./slide-controller');
menu = require('./menu-controller');
download = require('./kreator-download');
sidemenu = require('./sidemenu-controller');

module.exports = function kreator () {

  window.App = {
    title: 'Kreator.js',
    author: 'Andrei Oprea',
    theme: 'default.css'
  };

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
			{ src: 'lib/marked.js', condition: function() { return !!document.querySelector( '[data-markdown]' ); } },
			{ src: 'lib/markdown.js', condition: function() { return !!document.querySelector( '[data-markdown]' ); } },
			{ src: 'lib/highlight.js', async: true, callback: function() { hljs.initHighlightingOnLoad(); } }
		]
	});

	slide.addListeners(document.querySelector('.js-handler--add-slide-down'),
                    document.querySelector('.js-handler--add-slide-right'));

  menu.addListeners({
    upload: document.querySelector('.js-handler--upload'),
    heading: document.querySelector('.js-handler--headings'),
    color: document.querySelector('.js-handler--color'),
    styleButtons: document.querySelectorAll('.js-handler--style-button'),
    alignment: document.querySelectorAll('.js-handler--align'),
    codeBlock: document.querySelector('.js-handler--code-block'),
    overview: document.querySelectorAll('.js-handler--overview'),
    listButton: document.querySelector('.js-handler--list-button'),
    headingType: document.querySelector('.js-handler--heading-type')
  });

  sidemenu.addListeners({
    presentationTitle: document.querySelector('.js-handler--presentation-name'),
    themeSelector: document.querySelector('.js-handler--theme-selector'),
    hideSidemenu: document.querySelector('.js-handler--hide-sidemenu')
  });

  download.addListener(document.querySelector('.js-handler--download'));

};

},{"./kreator-download":1,"./menu-controller":4,"./sidemenu-controller":6,"./slide-controller":7}],3:[function(require,module,exports){
var kreator = require('./kreator.js');
var pointer = require('./pointer.js')('im289css0byphkt9');
var tour    = require('./tour.js');

kreator();
tour();

pointer.listen(document.querySelector('.js-handler--init-remote'));


},{"./kreator.js":2,"./pointer.js":5,"./tour.js":8}],4:[function(require,module,exports){
/* globals module, _, Reveal, window, document, FileReader, alert, Image */
'use strict';

module.exports = {
  addListeners: function(handler) {
    handler.upload.addEventListener('submit', uploadSlides, false);
    handler.heading.addEventListener('change', setFontSize, false);
    handler.color.addEventListener('change', setColor, false);
    handler.codeBlock.addEventListener('click', createCodeBlock, false);
    _.each(handler.alignment, function(el) {
      el.addEventListener('click', textAlignment, false);
    });
    _.each(handler.overview, function(el) {
      el.addEventListener('click', function() {
        toggleMessage();
        toggleMenu();
        Reveal.toggleOverview();
      }, false);
    });
    _.each(handler.styleButtons, function (el) {
      el.addEventListener('click', setFontStyle, false);
    });
    handler.listButton.addEventListener('click', createListItems, false);
    handler.headingType.addEventListener('change', setHeadingType, false);
  }
};

function toggleMenu() {
  toggle('#topmenu');
}

function toggleMessage() {
  toggle('#message');
}

function toggle(sel) {
  var elem = document.querySelector(sel);
  if(elem.classList.contains('hidden')) {
    elem.classList.remove('hidden');
    return true;
  } else {
    elem.classList.add('hidden');
    return false;
  }
}

/*
 * Wrap current selection in a <li>
 */
function createListItems(e) {
  /*jshint validthis: true*/
  this.classList.toggle('active');
  var currentSlide = document.querySelector('.present');

  if (this.classList.contains('active')) {
    if (getSelectionHtml() === "") {
      var li = document.createElement('li');
      li.innerHTML = 'List item';
      currentSlide.appendChild(li);
    } else {
      replaceSelectionWithHtml('<li>' + getSelectionHtml() + '</li>');
      this.classList.remove('active');
    }
  } else {
    var br = document.createElement('br');
    currentSlide.appendChild(br);
  }
}

/*
 * Handle form submit events
 * reads the file as text
 * */
function uploadSlides(e) {
  /*jshint validthis: true*/
  e.preventDefault();
  var file = this.querySelector('input[type=file]').files[0];
  if (window.File && window.FileReader && window.FileList && window.Blob) {
    var reader = new FileReader();

    reader.onload = (function(file) {
      return parseFile.bind(this, file.type);
    })(file);

    if (file.type.match('text/html'))
      reader.readAsText(file, 'utf8');
    else
      reader.readAsDataURL(file);
  } else {
    alert('File reading not supported');
  }
}

/*
 * Receives the uploaded file
 * Handle text/html and images/* differently
 * */
function parseFile(fileType, e) {
  var content = e.target.result;
  if (fileType.match('text/html')) {
    var dummy = document.createElement('div');
    dummy.innerHTML = content;
    appendContent(dummy.querySelector('.slides').innerHTML);
  } else {
    var img = new Image();
    img.src = e.target.result;
    document.querySelector('.present').appendChild(img); // FIXME
  }
}

/* Appends the parsed content to the page
 * completly replaces the old content
 * */
function appendContent(content) {
  var slides = document.querySelector('.slides');
  slides.innerHTML = content;
  Reveal.toggleOverview();
  Reveal.toggleOverview();
  toggleEditMode(true);
}

/*
 * Toggle on and off the contentEditable
 * attribute on the slides
 * */
function toggleEditMode(mode) {
  var slides = document.querySelectorAll('section');
  _.each(slides, function(s) {
    s.setAttribute('contentEditable', mode);
  });
}

function textAlignment() {
  /*jshint validthis: true*/
  var property = 'display:block;text-align:' + this.getAttribute('data-align');
  replaceSelectionWithHtml('<span style="'+property+'">' + getSelectionHtml() + '</span>');
}

function setFontStyle() {
  /*jshint validthis: true*/
  var value = {
    b: 'font-weight: bold',
    u: 'text-decoration: underline',
    i: 'font-style: italic'
  };
  var property = value[this.innerHTML.toLowerCase()];
  replaceSelectionWithHtml('<span style="'+property+'">' + getSelectionHtml() + '</span>');
}

/*
 * Wraps selected text
 * in a <pre><code> block
 * */
function createCodeBlock() {
  var selectedHtml = getSelectionHtml();
  var language = 'javascript';
  var code = hljs.highlight(language, selectedHtml).value;
  code = '<pre><code>' + code + '</code></pre>';
  replaceSelectionWithHtml(code);
}

/*
 * Set the heading on the current selection
 * */
function setFontSize() {
  /*jshint validthis: true*/
  if (this.value == 'none') return;
  var selection = window.getSelection();
  var range = selection.getRangeAt(0);
  var parentNode = range.startContainer.parentNode;
  var html = parentNode.outerHTML;
  var content = removeTags(/<\/?span ?(style="font-size:[0-9]{0,2}px")*>/g, html);
  replaceSelectionWithHtml('<span style="font-size:'+this.value+'">' + content + '</span>');
  this.value = 'none';
  clearSelection();

}

function setHeadingType() {
    /*jshint validthis: true*/
    if (this.value == 'none') return;
    var selection = window.getSelection();
    var range = selection.getRangeAt(0);
    var parentNode = range.startContainer.parentNode;
    var html = parentNode.outerHTML;
    var element = document.createElement(this.value);
    var content = removeTags(/<\/?h[0-6]{1}>/g, html);
    element.innerHTML = content;
    parentNode.parentNode.replaceChild(element, parentNode);
    this.value = 'none';
    clearSelection();
}

function removeTags(regex, string) {
    return string.replace(regex, '');
}

function setColor() {
  /*jshint validthis: true*/
  replaceSelectionWithHtml('<span style="color:'+this.value+'">' + getSelectionHtml() + '</span>');
  this.value = '#000';
}

function getSelectionHtml() {
    var html = '';
    if (typeof window.getSelection != 'undefined') {
        var sel = window.getSelection();
        if (sel.rangeCount) {
            var container = document.createElement('div');
            for (var i = 0, len = sel.rangeCount; i < len; ++i) {
                container.appendChild(sel.getRangeAt(i).cloneContents());
            }
            html = container.innerHTML;
        }
    } else if (typeof document.selection != 'undefined') {
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

// http://stackoverflow.com/questions/3169786/clear-text-selection-with-javascript
function clearSelection() {
    if (window.getSelection) {
        if (window.getSelection().empty) {  // Chrome
            window.getSelection().empty();
        } else if (window.getSelection().removeAllRanges) {  // Firefox
            window.getSelection().removeAllRanges();
        }
    } else if (document.selection) {  // IE?
        document.selection.empty();
    }
}


},{}],5:[function(require,module,exports){
module.exports = function pointer(key) {
	
	return {
		listen: function (element) {
			listen(key, element);
		}
	}

}

var peerJSKey;

function listen(key, element) {
	peerJSKey = key;
	element.addEventListener('click', init, false);
}

function init(e) {
	e.preventDefault();
	var peer = new Peer({key: peerJSKey});
	peer.on('open', function(id) {
		console.log('My peer ID is: ' + id);
	});
	var conn = peer.connect(prompt("Phone remote id"));
	conn.on('open', function() {
	  // Receive messages
	  conn.on('data', function(data) {
	    if (data == 'left') Reveal.left();
	    if (data == 'right') Reveal.right();
	    console.log('received', data);
		conn.send({
			title: App.title,
			slide: Reveal.getIndices().h
		});
	  });

		conn.send({
			title: App.title,
			slide: Reveal.getIndices().h
		});
	  // Send messages
	});
}


},{}],6:[function(require,module,exports){
/* globals module, _, App */
'use strict';

module.exports = {
  addListeners: function(handler) {
    handler.presentationTitle.addEventListener('keyup', setPresentationTitle, false);
    handler.themeSelector.addEventListener('change', changeTheme, false);
    handler.hideSidemenu.addEventListener('click', hideSidemenu, false);
    document.querySelector('.sidemenu').addEventListener('mouseover', showSidemenu, false);
  }
};

var isSliding = false;

function changeTheme() {
  App.theme = this.value;
  var themes = [
    'default.css', 'night.css', 'beige.css'
  ];
  _.each(themes, removeCSS);
  appendCSS(this.value);
}

function appendCSS(theme) {
  var link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'css/' + theme;
  document.querySelector('head').appendChild(link);
}

function removeCSS(val) {
  var sel = document.querySelector('link[rel=stylesheet][href$="'+val+'"]');
  if (sel) {
    sel.parentNode.removeChild(sel);
  }
}

function hideSidemenu() {
  var el = this.parentNode;
  el.style.mozTransform = 'translateX(-90%)';
  el.style.webkitTransform = 'translateX(-90%)';
  el.style.transform = 'translateX(-90%)';
  isSliding = true;
  window.setTimeout(function () {
    isSliding = false;
  }, 300);
}

function showSidemenu() {
  if (isSliding) {
    return;
  }
  var el = this;
  el.style.mozTransform = 'translateX(0)';
  el.style.webkitTransform = 'translateX(0)';
  el.style.transform = 'translateX(0)';
}

function setPresentationTitle() {
  var value = this.value;
  if (window._timeout) {
    clearInterval(window._timeout);
    window._timeout = 0;
  }
  window._timeout = setTimeout(function() {
    document.title = value;
    App.title = value;
  }, 300);
}

},{}],7:[function(require,module,exports){
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
    slide.innerHTML = '<h3>Add your content here</h3>';
    slide.setAttribute('contentEditable', true);
    return slide;
  }
};

},{}],8:[function(require,module,exports){
module.exports = function () {

    var tourHandler = document.querySelector('.js-handler--restart-tour');

    tourHandler.addEventListener('click', restartTour, false);

    var tour = new Shepherd.Tour({
        defaults: {
            classes: 'shepherd-theme-arrows',
            scrollTo: false
        }
    });

    tour.addStep('intro', {
        text: 'This is a guided introduction to Kreator.js <br> It will show you how to control and style the content <br> You can cancel if you know what to do or click start <br>',
        buttons: [
            {
                text: 'Cancel',
                action: finishTour
            },
            {
                text: 'Start',
                action: tour.next
            }
        ]
    })

    tour.addStep('example-step', {
        text: 'This is the main control for the content',
        attachTo: '.topmenu',
        buttons: [{
            text: 'Next',
            action: tour.next
        }],
        tetherOptions: {
            attachment: 'bottom center',
            targetAttachment: 'top center'
        }
    });

    tour.addStep('example-step', {
        text: 'Set the text to bold, italic or underlined',
        attachTo: '.js-handler--style-button',
        tetherOptions: {
            attachment: 'bottom left',
            targetAttachment: 'top left'
        }
    });

    tour.addStep('example-step', {
        text: 'Make a bullet list',
        attachTo: '.js-handler--list-button',
        tetherOptions: {
            attachment: 'bottom left',
            targetAttachment: 'top left'
        }
    });

    tour.addStep('example-step', {
        text: 'Align left, center or right  ',
        attachTo: '.js-handler--align',
        tetherOptions: {
            attachment: 'bottom left',
            targetAttachment: 'top left'
        }
    });

    tour.addStep('example-step', {
        text: 'Align left, center or right',
        attachTo: '.js-handler--align',
        tetherOptions: {
            attachment: 'bottom left',
            targetAttachment: 'top left'
        }
    });

    tour.addStep('example-step', {
        text: 'Set the text color',
        attachTo: '.js-handler--color',
        tetherOptions: {
            attachment: 'bottom left',
            targetAttachment: 'top left'
        }
    });

    tour.addStep('example-step', {
        text: 'Add slide',
        attachTo: '.js-handler--add-slide-right',
        tetherOptions: {
            attachment: 'top left',
            targetAttachment: 'top right'
        }
    });

    tour.addStep('example-step', {
        text: 'Presentation name',
        attachTo: '.js-handler--presentation-name',
        tetherOptions: {
            attachment: 'top right',
            targetAttachment: 'top left'
        }
    });

    tour.addStep('example-step', {
        text: 'Change the theme',
        attachTo: '.js-handler--theme-selector',
        tetherOptions: {
            attachment: 'top right',
            targetAttachment: 'top left'
        }
    });

    tour.addStep('example-step', {
        text: 'Download when you are all done',
        attachTo: '.js-handler--download',
        tetherOptions: {
            attachment: 'top right',
            targetAttachment: 'top left'
        }
    });

    tour.addStep('example-step', {
        text: 'That is all. I hope you make a great presentation!',
        buttons: [{
            'text': 'Start writing',
            action: finishTour
        }]
    });

    if (!localStorage.getItem('tour')) tour.start();

    function finishTour() {
        localStorage.setItem('tour', 'complete');
        tour.hide();
    }

    function restartTour() {
        tour.start();
    }
}

},{}]},{},[3])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwibGliL2tyZWF0b3ItZG93bmxvYWQuanMiLCJsaWIva3JlYXRvci5qcyIsImxpYi9tYWluLmpzIiwibGliL21lbnUtY29udHJvbGxlci5qcyIsImxpYi9wb2ludGVyLmpzIiwibGliL3NpZGVtZW51LWNvbnRyb2xsZXIuanMiLCJsaWIvc2xpZGUtY29udHJvbGxlci5qcyIsImxpYi90b3VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOVBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIGFkZExpc3RlbmVyOiBmdW5jdGlvbihlbCkge1xuICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZG93bmxvYWRTbGlkZXMsIGZhbHNlKTtcbiAgfVxufTtcblxudmFyIHBhcnRzID0gW3tcbiAgbmFtZTogJ2hlYWQuaHRtbCcsXG4gIHBhdGg6ICcnXG59LCB7XG4gIG5hbWU6ICd0YWlsLmh0bWwnLFxuICBwYXRoOiAnJ1xufSwge1xuICBuYW1lOiAnZGVmYXVsdC5jc3MnLFxuICBwYXRoOiAnY3NzJ1xufSwge1xuICBuYW1lOiAnemVuYnVybi5jc3MnLFxuICBwYXRoOiAnbGliL2Nzcydcbn0sIHtcbiAgbmFtZTogJ2hlYWQubWluLmpzJyxcbiAgcGF0aDogJ2xpYi9qcydcbn0sIHtcbiAgbmFtZTogJ3JldmVhbC5qcycsXG4gIHBhdGg6ICdqcydcbn0sIHtcbiAgbmFtZTogJ21haW4uY3NzJyxcbiAgcGF0aDogJ2Nzcydcbn0sIHtcbiAgbmFtZTogJ3plbmJ1cm4uY3NzJyxcbiAgcGF0aDogJ2Nzcydcbn0sIHtcbiAgbmFtZTogJ3ByaW50LmNzcycsXG4gIHBhdGg6ICdjc3MnXG59LCB7XG4gIG5hbWU6ICdjbGFzc0xpc3QuanMnLFxuICBwYXRoOiAnbGliL2pzJ1xufSwge1xuICBuYW1lOiAnaGlnaGxpZ2h0LmpzJyxcbiAgcGF0aDogJ2xpYi9qcydcbn0sIHtcbiAgbmFtZTogJ3NreS5jc3MnLFxuICBwYXRoOiAnY3NzJ1xufSwge1xuICBuYW1lOiAnbmlnaHQuY3NzJyxcbiAgcGF0aDogJ2Nzcydcbn0sIHtcbiAgbmFtZTogJ2JlaWdlLmNzcycsXG4gIHBhdGg6ICdjc3MnXG59XTtcblxuZnVuY3Rpb24gZG93bmxvYWRTbGlkZXMoKSB7XG4gIHZhciBjb250ZW50ID0gW107XG4gIHZhciB1cmwgPSBsb2NhdGlvbi5vcmlnaW4gKyAnL2tyZWF0b3IuanMvZG93bmxvYWQvJztcbiAgaWYgKGxvY2F0aW9uLm9yaWdpbi5tYXRjaCgnbG9jYWxob3N0JykpIHsgLy8gd2UgYXJlIHJ1bm5pbmcgaW4gZGV2ZWxvcG1lbnRcbiAgICBjb25zb2xlLmluZm8oJ0RldmVsb3BtZW50IG1vZGUnKTtcbiAgICB1cmwgPSBsb2NhdGlvbi5vcmlnaW4gKyAnL2Rvd25sb2FkLyc7XG4gICAgY29uc29sZS5pbmZvKCdEb3dubG9hZCBVUkwgcG9pbnRzIHRvICcgKyB1cmwpO1xuICB9XG4gIHZhciBsID0gcGFydHMubGVuZ3RoO1xuICB2YXIgZm9sZGVycyA9IHBhcnRzLm1hcChmdW5jdGlvbihwKSB7XG4gICAgcmV0dXJuIHAucGF0aDtcbiAgfSk7XG4gIHBhcnRzLm1hcChmdW5jdGlvbihwKSB7XG4gICAgcmV0dXJuIHVybCArIHAubmFtZTtcbiAgfSkuZm9yRWFjaChmdW5jdGlvbih1cmwsIGlkeCkge1xuICAgIHJlcXVlc3RQYXJ0KHVybClcbiAgICAgIC50aGVuKGZ1bmN0aW9uIChyZXNwKSB7XG4gICAgICAgIGNvbnRlbnRbaWR4XSA9IHJlc3A7XG4gICAgICAgIGlmICgtLWwgPT09IDApIHtcbiAgICAgICAgICBjcmVhdGVaaXAoY29udGVudCwgZm9sZGVycyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICB9KTtcbn1cblxuLypcbiAqIFRvZ2dsZSBvbiBhbmQgb2ZmIHRoZSBjb250ZW50RWRpdGFibGVcbiAqIGF0dHJpYnV0ZSBvbiB0aGUgc2xpZGVzXG4gKiAqL1xuZnVuY3Rpb24gdG9nZ2xlRWRpdE1vZGUobW9kZSkge1xuICB2YXIgc2xpZGVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnc2VjdGlvbicpO1xuICBfLmVhY2goc2xpZGVzLCBmdW5jdGlvbihzKSB7XG4gICAgcy5zZXRBdHRyaWJ1dGUoJ2NvbnRlbnRFZGl0YWJsZScsIG1vZGUpO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlWmlwKGNvbnRlbnQsIGZvbGRlcnMpIHtcbiAgdG9nZ2xlRWRpdE1vZGUoZmFsc2UpO1xuICBjb250ZW50WzBdID0gY29udGVudFswXS5yZXBsYWNlKC9kZWZhdWx0LmNzcy9nLCBBcHAudGhlbWUpO1xuICB2YXIgc2xpZGVzID0gJzxkaXYgY2xhc3M9XCJyZXZlYWxcIj48ZGl2IGNsYXNzPVwic2xpZGVzXCI+JyArXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNsaWRlcycpLmlubmVySFRNTCArXG4gICAgICAgICAgICAgICAgJzwvZGl2PjwvZGl2Pic7XG4gIHZhciBpbmRleCA9IGNvbnRlbnQuc3BsaWNlKDAsMik7XG4gIHZhciB6aXAgPSBuZXcgSlNaaXAoKTtcbiAgaW5kZXguc3BsaWNlKDEsIDAsIHNsaWRlcyk7XG4gIGluZGV4ID0gaW5kZXguam9pbignJyk7XG4gIGluZGV4LnJlcGxhY2UoLzx0aXRsZT4uKjxcXC90aXRsZT4vZywgJzx0aXRsZT4nICsgQXBwLnRpdGxlICsgJzwvdGl0bGU+Jyk7XG4gIHppcC5maWxlKCdpbmRleC5odG1sJywgaW5kZXgpO1xuXG4gIGZvciAodmFyIGkgPSAyOyBpIDwgZm9sZGVycy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBmb2xkZXIgPSB6aXAuZm9sZGVyKGZvbGRlcnNbaV0pO1xuICAgIGZvbGRlci5maWxlKHBhcnRzW2ldLm5hbWUsIGNvbnRlbnRbaSAtIDJdKTtcbiAgfVxuXG4gIGNvbnRlbnQgPSB6aXAuZ2VuZXJhdGUoe3R5cGU6ICdibG9iJ30pO1xuICB2YXIgbGluayA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1oYW5kbGVyLS1kb3dubG9hZC1yZWFkeScpO1xuICBsaW5rLmhyZWYgPSB3aW5kb3cuVVJMLmNyZWF0ZU9iamVjdFVSTChjb250ZW50KTtcbiAgbGluay5pbm5lckhUTUwgPSAnUHJlc2VudGF0aW9uIHJlYWR5LiBDbGljayBoZXJlIHRvIGRvd25sb2FkJztcbiAgbGluay5kb3dubG9hZCA9ICdZb3VyUHJlc2VudGF0aW9uLnppcCc7XG4gIHRvZ2dsZUVkaXRNb2RlKHRydWUpO1xufVxuXG5mdW5jdGlvbiByZXF1ZXN0UGFydCh1cmwpIHtcblxuICB2YXIgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICB2YXIgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG5cbiAgcmVxdWVzdC5vcGVuKFwiR0VUXCIsIHVybCwgdHJ1ZSk7XG4gIHJlcXVlc3Qub25sb2FkID0gb25sb2FkO1xuICByZXF1ZXN0Lm9uZXJyb3IgPSBvbmVycm9yO1xuICByZXF1ZXN0LnNlbmQoKTtcblxuICBmdW5jdGlvbiBvbmxvYWQoKSB7XG4gICAgaWYgKHJlcXVlc3Quc3RhdHVzID09PSAyMDApIHtcbiAgICAgIGRlZmVycmVkLnJlc29sdmUocmVxdWVzdC5yZXNwb25zZVRleHQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWZlcnJlZC5yZWplY3QobmV3IEVycm9yKFwiU3RhdHVzIGNvZGU6IFwiICsgcmVxdWVzdC5zdGF0dXMpKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBvbmVycm9yKCkge1xuICAgIGRlZmVycmVkLnJlamVjdChuZXcgRXJyb3IoXCJSZXF1ZXN0IHRvIFwiICsgdXJsICsgXCIgZmFpbGVkXCIpKTtcbiAgfVxuXG4gIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xufVxuIiwic2xpZGUgPSByZXF1aXJlKCcuL3NsaWRlLWNvbnRyb2xsZXInKTtcbm1lbnUgPSByZXF1aXJlKCcuL21lbnUtY29udHJvbGxlcicpO1xuZG93bmxvYWQgPSByZXF1aXJlKCcuL2tyZWF0b3ItZG93bmxvYWQnKTtcbnNpZGVtZW51ID0gcmVxdWlyZSgnLi9zaWRlbWVudS1jb250cm9sbGVyJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ga3JlYXRvciAoKSB7XG5cbiAgd2luZG93LkFwcCA9IHtcbiAgICB0aXRsZTogJ0tyZWF0b3IuanMnLFxuICAgIGF1dGhvcjogJ0FuZHJlaSBPcHJlYScsXG4gICAgdGhlbWU6ICdkZWZhdWx0LmNzcydcbiAgfTtcblxuXHQvLyBGdWxsIGxpc3Qgb2YgY29uZmlndXJhdGlvbiBvcHRpb25zIGF2YWlsYWJsZSBoZXJlOlxuXHQvLyBodHRwczovL2dpdGh1Yi5jb20vaGFraW1lbC9yZXZlYWwuanMjY29uZmlndXJhdGlvblxuXHRSZXZlYWwuaW5pdGlhbGl6ZSh7XG4gICAgY29udHJvbHM6IHRydWUsXG5cdFx0cHJvZ3Jlc3M6IHRydWUsXG5cdFx0aGlzdG9yeTogdHJ1ZSxcbiAgICBjZW50ZXI6IGZhbHNlLFxuXG5cdFx0dGhlbWU6IFJldmVhbC5nZXRRdWVyeUhhc2goKS50aGVtZSwgLy8gYXZhaWxhYmxlIHRoZW1lcyBhcmUgaW4gL2Nzcy90aGVtZVxuXHRcdHRyYW5zaXRpb246IFJldmVhbC5nZXRRdWVyeUhhc2goKS50cmFuc2l0aW9uIHx8ICdkZWZhdWx0JywgLy8gZGVmYXVsdC9jdWJlL3BhZ2UvY29uY2F2ZS96b29tL2xpbmVhci9mYWRlL25vbmVcblxuXHRcdC8vIE9wdGlvbmFsIGxpYnJhcmllcyB1c2VkIHRvIGV4dGVuZCBvbiByZXZlYWwuanNcblx0XHRkZXBlbmRlbmNpZXM6IFtcblx0XHRcdHsgc3JjOiAnbGliL21hcmtlZC5qcycsIGNvbmRpdGlvbjogZnVuY3Rpb24oKSB7IHJldHVybiAhIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoICdbZGF0YS1tYXJrZG93bl0nICk7IH0gfSxcblx0XHRcdHsgc3JjOiAnbGliL21hcmtkb3duLmpzJywgY29uZGl0aW9uOiBmdW5jdGlvbigpIHsgcmV0dXJuICEhZG9jdW1lbnQucXVlcnlTZWxlY3RvciggJ1tkYXRhLW1hcmtkb3duXScgKTsgfSB9LFxuXHRcdFx0eyBzcmM6ICdsaWIvaGlnaGxpZ2h0LmpzJywgYXN5bmM6IHRydWUsIGNhbGxiYWNrOiBmdW5jdGlvbigpIHsgaGxqcy5pbml0SGlnaGxpZ2h0aW5nT25Mb2FkKCk7IH0gfVxuXHRcdF1cblx0fSk7XG5cblx0c2xpZGUuYWRkTGlzdGVuZXJzKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1oYW5kbGVyLS1hZGQtc2xpZGUtZG93bicpLFxuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtaGFuZGxlci0tYWRkLXNsaWRlLXJpZ2h0JykpO1xuXG4gIG1lbnUuYWRkTGlzdGVuZXJzKHtcbiAgICB1cGxvYWQ6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1oYW5kbGVyLS11cGxvYWQnKSxcbiAgICBoZWFkaW5nOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtaGFuZGxlci0taGVhZGluZ3MnKSxcbiAgICBjb2xvcjogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWhhbmRsZXItLWNvbG9yJyksXG4gICAgc3R5bGVCdXR0b25zOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtaGFuZGxlci0tc3R5bGUtYnV0dG9uJyksXG4gICAgYWxpZ25tZW50OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtaGFuZGxlci0tYWxpZ24nKSxcbiAgICBjb2RlQmxvY2s6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1oYW5kbGVyLS1jb2RlLWJsb2NrJyksXG4gICAgb3ZlcnZpZXc6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1oYW5kbGVyLS1vdmVydmlldycpLFxuICAgIGxpc3RCdXR0b246IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1oYW5kbGVyLS1saXN0LWJ1dHRvbicpLFxuICAgIGhlYWRpbmdUeXBlOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtaGFuZGxlci0taGVhZGluZy10eXBlJylcbiAgfSk7XG5cbiAgc2lkZW1lbnUuYWRkTGlzdGVuZXJzKHtcbiAgICBwcmVzZW50YXRpb25UaXRsZTogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWhhbmRsZXItLXByZXNlbnRhdGlvbi1uYW1lJyksXG4gICAgdGhlbWVTZWxlY3RvcjogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWhhbmRsZXItLXRoZW1lLXNlbGVjdG9yJyksXG4gICAgaGlkZVNpZGVtZW51OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtaGFuZGxlci0taGlkZS1zaWRlbWVudScpXG4gIH0pO1xuXG4gIGRvd25sb2FkLmFkZExpc3RlbmVyKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1oYW5kbGVyLS1kb3dubG9hZCcpKTtcblxufTtcbiIsInZhciBrcmVhdG9yID0gcmVxdWlyZSgnLi9rcmVhdG9yLmpzJyk7XG52YXIgcG9pbnRlciA9IHJlcXVpcmUoJy4vcG9pbnRlci5qcycpKCdpbTI4OWNzczBieXBoa3Q5Jyk7XG52YXIgdG91ciAgICA9IHJlcXVpcmUoJy4vdG91ci5qcycpO1xuXG5rcmVhdG9yKCk7XG50b3VyKCk7XG5cbnBvaW50ZXIubGlzdGVuKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1oYW5kbGVyLS1pbml0LXJlbW90ZScpKTtcblxuIiwiLyogZ2xvYmFscyBtb2R1bGUsIF8sIFJldmVhbCwgd2luZG93LCBkb2N1bWVudCwgRmlsZVJlYWRlciwgYWxlcnQsIEltYWdlICovXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBhZGRMaXN0ZW5lcnM6IGZ1bmN0aW9uKGhhbmRsZXIpIHtcbiAgICBoYW5kbGVyLnVwbG9hZC5hZGRFdmVudExpc3RlbmVyKCdzdWJtaXQnLCB1cGxvYWRTbGlkZXMsIGZhbHNlKTtcbiAgICBoYW5kbGVyLmhlYWRpbmcuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgc2V0Rm9udFNpemUsIGZhbHNlKTtcbiAgICBoYW5kbGVyLmNvbG9yLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIHNldENvbG9yLCBmYWxzZSk7XG4gICAgaGFuZGxlci5jb2RlQmxvY2suYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjcmVhdGVDb2RlQmxvY2ssIGZhbHNlKTtcbiAgICBfLmVhY2goaGFuZGxlci5hbGlnbm1lbnQsIGZ1bmN0aW9uKGVsKSB7XG4gICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRleHRBbGlnbm1lbnQsIGZhbHNlKTtcbiAgICB9KTtcbiAgICBfLmVhY2goaGFuZGxlci5vdmVydmlldywgZnVuY3Rpb24oZWwpIHtcbiAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHRvZ2dsZU1lc3NhZ2UoKTtcbiAgICAgICAgdG9nZ2xlTWVudSgpO1xuICAgICAgICBSZXZlYWwudG9nZ2xlT3ZlcnZpZXcoKTtcbiAgICAgIH0sIGZhbHNlKTtcbiAgICB9KTtcbiAgICBfLmVhY2goaGFuZGxlci5zdHlsZUJ1dHRvbnMsIGZ1bmN0aW9uIChlbCkge1xuICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzZXRGb250U3R5bGUsIGZhbHNlKTtcbiAgICB9KTtcbiAgICBoYW5kbGVyLmxpc3RCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjcmVhdGVMaXN0SXRlbXMsIGZhbHNlKTtcbiAgICBoYW5kbGVyLmhlYWRpbmdUeXBlLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIHNldEhlYWRpbmdUeXBlLCBmYWxzZSk7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIHRvZ2dsZU1lbnUoKSB7XG4gIHRvZ2dsZSgnI3RvcG1lbnUnKTtcbn1cblxuZnVuY3Rpb24gdG9nZ2xlTWVzc2FnZSgpIHtcbiAgdG9nZ2xlKCcjbWVzc2FnZScpO1xufVxuXG5mdW5jdGlvbiB0b2dnbGUoc2VsKSB7XG4gIHZhciBlbGVtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWwpO1xuICBpZihlbGVtLmNsYXNzTGlzdC5jb250YWlucygnaGlkZGVuJykpIHtcbiAgICBlbGVtLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xuICAgIHJldHVybiB0cnVlO1xuICB9IGVsc2Uge1xuICAgIGVsZW0uY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbi8qXG4gKiBXcmFwIGN1cnJlbnQgc2VsZWN0aW9uIGluIGEgPGxpPlxuICovXG5mdW5jdGlvbiBjcmVhdGVMaXN0SXRlbXMoZSkge1xuICAvKmpzaGludCB2YWxpZHRoaXM6IHRydWUqL1xuICB0aGlzLmNsYXNzTGlzdC50b2dnbGUoJ2FjdGl2ZScpO1xuICB2YXIgY3VycmVudFNsaWRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnByZXNlbnQnKTtcblxuICBpZiAodGhpcy5jbGFzc0xpc3QuY29udGFpbnMoJ2FjdGl2ZScpKSB7XG4gICAgaWYgKGdldFNlbGVjdGlvbkh0bWwoKSA9PT0gXCJcIikge1xuICAgICAgdmFyIGxpID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcbiAgICAgIGxpLmlubmVySFRNTCA9ICdMaXN0IGl0ZW0nO1xuICAgICAgY3VycmVudFNsaWRlLmFwcGVuZENoaWxkKGxpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVwbGFjZVNlbGVjdGlvbldpdGhIdG1sKCc8bGk+JyArIGdldFNlbGVjdGlvbkh0bWwoKSArICc8L2xpPicpO1xuICAgICAgdGhpcy5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdmFyIGJyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnInKTtcbiAgICBjdXJyZW50U2xpZGUuYXBwZW5kQ2hpbGQoYnIpO1xuICB9XG59XG5cbi8qXG4gKiBIYW5kbGUgZm9ybSBzdWJtaXQgZXZlbnRzXG4gKiByZWFkcyB0aGUgZmlsZSBhcyB0ZXh0XG4gKiAqL1xuZnVuY3Rpb24gdXBsb2FkU2xpZGVzKGUpIHtcbiAgLypqc2hpbnQgdmFsaWR0aGlzOiB0cnVlKi9cbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICB2YXIgZmlsZSA9IHRoaXMucXVlcnlTZWxlY3RvcignaW5wdXRbdHlwZT1maWxlXScpLmZpbGVzWzBdO1xuICBpZiAod2luZG93LkZpbGUgJiYgd2luZG93LkZpbGVSZWFkZXIgJiYgd2luZG93LkZpbGVMaXN0ICYmIHdpbmRvdy5CbG9iKSB7XG4gICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG5cbiAgICByZWFkZXIub25sb2FkID0gKGZ1bmN0aW9uKGZpbGUpIHtcbiAgICAgIHJldHVybiBwYXJzZUZpbGUuYmluZCh0aGlzLCBmaWxlLnR5cGUpO1xuICAgIH0pKGZpbGUpO1xuXG4gICAgaWYgKGZpbGUudHlwZS5tYXRjaCgndGV4dC9odG1sJykpXG4gICAgICByZWFkZXIucmVhZEFzVGV4dChmaWxlLCAndXRmOCcpO1xuICAgIGVsc2VcbiAgICAgIHJlYWRlci5yZWFkQXNEYXRhVVJMKGZpbGUpO1xuICB9IGVsc2Uge1xuICAgIGFsZXJ0KCdGaWxlIHJlYWRpbmcgbm90IHN1cHBvcnRlZCcpO1xuICB9XG59XG5cbi8qXG4gKiBSZWNlaXZlcyB0aGUgdXBsb2FkZWQgZmlsZVxuICogSGFuZGxlIHRleHQvaHRtbCBhbmQgaW1hZ2VzLyogZGlmZmVyZW50bHlcbiAqICovXG5mdW5jdGlvbiBwYXJzZUZpbGUoZmlsZVR5cGUsIGUpIHtcbiAgdmFyIGNvbnRlbnQgPSBlLnRhcmdldC5yZXN1bHQ7XG4gIGlmIChmaWxlVHlwZS5tYXRjaCgndGV4dC9odG1sJykpIHtcbiAgICB2YXIgZHVtbXkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBkdW1teS5pbm5lckhUTUwgPSBjb250ZW50O1xuICAgIGFwcGVuZENvbnRlbnQoZHVtbXkucXVlcnlTZWxlY3RvcignLnNsaWRlcycpLmlubmVySFRNTCk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIGltZyA9IG5ldyBJbWFnZSgpO1xuICAgIGltZy5zcmMgPSBlLnRhcmdldC5yZXN1bHQ7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnByZXNlbnQnKS5hcHBlbmRDaGlsZChpbWcpOyAvLyBGSVhNRVxuICB9XG59XG5cbi8qIEFwcGVuZHMgdGhlIHBhcnNlZCBjb250ZW50IHRvIHRoZSBwYWdlXG4gKiBjb21wbGV0bHkgcmVwbGFjZXMgdGhlIG9sZCBjb250ZW50XG4gKiAqL1xuZnVuY3Rpb24gYXBwZW5kQ29udGVudChjb250ZW50KSB7XG4gIHZhciBzbGlkZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2xpZGVzJyk7XG4gIHNsaWRlcy5pbm5lckhUTUwgPSBjb250ZW50O1xuICBSZXZlYWwudG9nZ2xlT3ZlcnZpZXcoKTtcbiAgUmV2ZWFsLnRvZ2dsZU92ZXJ2aWV3KCk7XG4gIHRvZ2dsZUVkaXRNb2RlKHRydWUpO1xufVxuXG4vKlxuICogVG9nZ2xlIG9uIGFuZCBvZmYgdGhlIGNvbnRlbnRFZGl0YWJsZVxuICogYXR0cmlidXRlIG9uIHRoZSBzbGlkZXNcbiAqICovXG5mdW5jdGlvbiB0b2dnbGVFZGl0TW9kZShtb2RlKSB7XG4gIHZhciBzbGlkZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdzZWN0aW9uJyk7XG4gIF8uZWFjaChzbGlkZXMsIGZ1bmN0aW9uKHMpIHtcbiAgICBzLnNldEF0dHJpYnV0ZSgnY29udGVudEVkaXRhYmxlJywgbW9kZSk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiB0ZXh0QWxpZ25tZW50KCkge1xuICAvKmpzaGludCB2YWxpZHRoaXM6IHRydWUqL1xuICB2YXIgcHJvcGVydHkgPSAnZGlzcGxheTpibG9jazt0ZXh0LWFsaWduOicgKyB0aGlzLmdldEF0dHJpYnV0ZSgnZGF0YS1hbGlnbicpO1xuICByZXBsYWNlU2VsZWN0aW9uV2l0aEh0bWwoJzxzcGFuIHN0eWxlPVwiJytwcm9wZXJ0eSsnXCI+JyArIGdldFNlbGVjdGlvbkh0bWwoKSArICc8L3NwYW4+Jyk7XG59XG5cbmZ1bmN0aW9uIHNldEZvbnRTdHlsZSgpIHtcbiAgLypqc2hpbnQgdmFsaWR0aGlzOiB0cnVlKi9cbiAgdmFyIHZhbHVlID0ge1xuICAgIGI6ICdmb250LXdlaWdodDogYm9sZCcsXG4gICAgdTogJ3RleHQtZGVjb3JhdGlvbjogdW5kZXJsaW5lJyxcbiAgICBpOiAnZm9udC1zdHlsZTogaXRhbGljJ1xuICB9O1xuICB2YXIgcHJvcGVydHkgPSB2YWx1ZVt0aGlzLmlubmVySFRNTC50b0xvd2VyQ2FzZSgpXTtcbiAgcmVwbGFjZVNlbGVjdGlvbldpdGhIdG1sKCc8c3BhbiBzdHlsZT1cIicrcHJvcGVydHkrJ1wiPicgKyBnZXRTZWxlY3Rpb25IdG1sKCkgKyAnPC9zcGFuPicpO1xufVxuXG4vKlxuICogV3JhcHMgc2VsZWN0ZWQgdGV4dFxuICogaW4gYSA8cHJlPjxjb2RlPiBibG9ja1xuICogKi9cbmZ1bmN0aW9uIGNyZWF0ZUNvZGVCbG9jaygpIHtcbiAgdmFyIHNlbGVjdGVkSHRtbCA9IGdldFNlbGVjdGlvbkh0bWwoKTtcbiAgdmFyIGxhbmd1YWdlID0gJ2phdmFzY3JpcHQnO1xuICB2YXIgY29kZSA9IGhsanMuaGlnaGxpZ2h0KGxhbmd1YWdlLCBzZWxlY3RlZEh0bWwpLnZhbHVlO1xuICBjb2RlID0gJzxwcmU+PGNvZGU+JyArIGNvZGUgKyAnPC9jb2RlPjwvcHJlPic7XG4gIHJlcGxhY2VTZWxlY3Rpb25XaXRoSHRtbChjb2RlKTtcbn1cblxuLypcbiAqIFNldCB0aGUgaGVhZGluZyBvbiB0aGUgY3VycmVudCBzZWxlY3Rpb25cbiAqICovXG5mdW5jdGlvbiBzZXRGb250U2l6ZSgpIHtcbiAgLypqc2hpbnQgdmFsaWR0aGlzOiB0cnVlKi9cbiAgaWYgKHRoaXMudmFsdWUgPT0gJ25vbmUnKSByZXR1cm47XG4gIHZhciBzZWxlY3Rpb24gPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCk7XG4gIHZhciByYW5nZSA9IHNlbGVjdGlvbi5nZXRSYW5nZUF0KDApO1xuICB2YXIgcGFyZW50Tm9kZSA9IHJhbmdlLnN0YXJ0Q29udGFpbmVyLnBhcmVudE5vZGU7XG4gIHZhciBodG1sID0gcGFyZW50Tm9kZS5vdXRlckhUTUw7XG4gIHZhciBjb250ZW50ID0gcmVtb3ZlVGFncygvPFxcLz9zcGFuID8oc3R5bGU9XCJmb250LXNpemU6WzAtOV17MCwyfXB4XCIpKj4vZywgaHRtbCk7XG4gIHJlcGxhY2VTZWxlY3Rpb25XaXRoSHRtbCgnPHNwYW4gc3R5bGU9XCJmb250LXNpemU6Jyt0aGlzLnZhbHVlKydcIj4nICsgY29udGVudCArICc8L3NwYW4+Jyk7XG4gIHRoaXMudmFsdWUgPSAnbm9uZSc7XG4gIGNsZWFyU2VsZWN0aW9uKCk7XG5cbn1cblxuZnVuY3Rpb24gc2V0SGVhZGluZ1R5cGUoKSB7XG4gICAgLypqc2hpbnQgdmFsaWR0aGlzOiB0cnVlKi9cbiAgICBpZiAodGhpcy52YWx1ZSA9PSAnbm9uZScpIHJldHVybjtcbiAgICB2YXIgc2VsZWN0aW9uID0gd2luZG93LmdldFNlbGVjdGlvbigpO1xuICAgIHZhciByYW5nZSA9IHNlbGVjdGlvbi5nZXRSYW5nZUF0KDApO1xuICAgIHZhciBwYXJlbnROb2RlID0gcmFuZ2Uuc3RhcnRDb250YWluZXIucGFyZW50Tm9kZTtcbiAgICB2YXIgaHRtbCA9IHBhcmVudE5vZGUub3V0ZXJIVE1MO1xuICAgIHZhciBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0aGlzLnZhbHVlKTtcbiAgICB2YXIgY29udGVudCA9IHJlbW92ZVRhZ3MoLzxcXC8/aFswLTZdezF9Pi9nLCBodG1sKTtcbiAgICBlbGVtZW50LmlubmVySFRNTCA9IGNvbnRlbnQ7XG4gICAgcGFyZW50Tm9kZS5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChlbGVtZW50LCBwYXJlbnROb2RlKTtcbiAgICB0aGlzLnZhbHVlID0gJ25vbmUnO1xuICAgIGNsZWFyU2VsZWN0aW9uKCk7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZVRhZ3MocmVnZXgsIHN0cmluZykge1xuICAgIHJldHVybiBzdHJpbmcucmVwbGFjZShyZWdleCwgJycpO1xufVxuXG5mdW5jdGlvbiBzZXRDb2xvcigpIHtcbiAgLypqc2hpbnQgdmFsaWR0aGlzOiB0cnVlKi9cbiAgcmVwbGFjZVNlbGVjdGlvbldpdGhIdG1sKCc8c3BhbiBzdHlsZT1cImNvbG9yOicrdGhpcy52YWx1ZSsnXCI+JyArIGdldFNlbGVjdGlvbkh0bWwoKSArICc8L3NwYW4+Jyk7XG4gIHRoaXMudmFsdWUgPSAnIzAwMCc7XG59XG5cbmZ1bmN0aW9uIGdldFNlbGVjdGlvbkh0bWwoKSB7XG4gICAgdmFyIGh0bWwgPSAnJztcbiAgICBpZiAodHlwZW9mIHdpbmRvdy5nZXRTZWxlY3Rpb24gIT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgdmFyIHNlbCA9IHdpbmRvdy5nZXRTZWxlY3Rpb24oKTtcbiAgICAgICAgaWYgKHNlbC5yYW5nZUNvdW50KSB7XG4gICAgICAgICAgICB2YXIgY29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gc2VsLnJhbmdlQ291bnQ7IGkgPCBsZW47ICsraSkge1xuICAgICAgICAgICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChzZWwuZ2V0UmFuZ2VBdChpKS5jbG9uZUNvbnRlbnRzKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaHRtbCA9IGNvbnRhaW5lci5pbm5lckhUTUw7XG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBkb2N1bWVudC5zZWxlY3Rpb24gIT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgaWYgKGRvY3VtZW50LnNlbGVjdGlvbi50eXBlID09IFwiVGV4dFwiKSB7XG4gICAgICAgICAgICBodG1sID0gZG9jdW1lbnQuc2VsZWN0aW9uLmNyZWF0ZVJhbmdlKCkuaHRtbFRleHQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGh0bWw7XG59XG5cbmZ1bmN0aW9uIHJlcGxhY2VTZWxlY3Rpb25XaXRoSHRtbChodG1sKSB7XG4gICAgdmFyIHJhbmdlO1xuICAgIGlmICh3aW5kb3cuZ2V0U2VsZWN0aW9uICYmIHdpbmRvdy5nZXRTZWxlY3Rpb24oKS5nZXRSYW5nZUF0KSB7XG4gICAgICAgIHJhbmdlID0gd2luZG93LmdldFNlbGVjdGlvbigpLmdldFJhbmdlQXQoMCk7XG4gICAgICAgIHJhbmdlLmRlbGV0ZUNvbnRlbnRzKCk7XG4gICAgICAgIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICBkaXYuaW5uZXJIVE1MID0gaHRtbDtcbiAgICAgICAgdmFyIGZyYWcgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCksIGNoaWxkO1xuICAgICAgICB3aGlsZSAoIChjaGlsZCA9IGRpdi5maXJzdENoaWxkKSApIHtcbiAgICAgICAgICAgIGZyYWcuYXBwZW5kQ2hpbGQoY2hpbGQpO1xuICAgICAgICB9XG4gICAgICAgIHJhbmdlLmluc2VydE5vZGUoZnJhZyk7XG4gICAgfSBlbHNlIGlmIChkb2N1bWVudC5zZWxlY3Rpb24gJiYgZG9jdW1lbnQuc2VsZWN0aW9uLmNyZWF0ZVJhbmdlKSB7XG4gICAgICAgIHJhbmdlID0gZG9jdW1lbnQuc2VsZWN0aW9uLmNyZWF0ZVJhbmdlKCk7XG4gICAgICAgIGh0bWwgPSAobm9kZS5ub2RlVHlwZSA9PSAzKSA/IG5vZGUuZGF0YSA6IG5vZGUub3V0ZXJIVE1MO1xuICAgICAgICByYW5nZS5wYXN0ZUhUTUwoaHRtbCk7XG4gICAgfVxufVxuXG4vLyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzMxNjk3ODYvY2xlYXItdGV4dC1zZWxlY3Rpb24td2l0aC1qYXZhc2NyaXB0XG5mdW5jdGlvbiBjbGVhclNlbGVjdGlvbigpIHtcbiAgICBpZiAod2luZG93LmdldFNlbGVjdGlvbikge1xuICAgICAgICBpZiAod2luZG93LmdldFNlbGVjdGlvbigpLmVtcHR5KSB7ICAvLyBDaHJvbWVcbiAgICAgICAgICAgIHdpbmRvdy5nZXRTZWxlY3Rpb24oKS5lbXB0eSgpO1xuICAgICAgICB9IGVsc2UgaWYgKHdpbmRvdy5nZXRTZWxlY3Rpb24oKS5yZW1vdmVBbGxSYW5nZXMpIHsgIC8vIEZpcmVmb3hcbiAgICAgICAgICAgIHdpbmRvdy5nZXRTZWxlY3Rpb24oKS5yZW1vdmVBbGxSYW5nZXMoKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSBpZiAoZG9jdW1lbnQuc2VsZWN0aW9uKSB7ICAvLyBJRT9cbiAgICAgICAgZG9jdW1lbnQuc2VsZWN0aW9uLmVtcHR5KCk7XG4gICAgfVxufVxuXG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHBvaW50ZXIoa2V5KSB7XG5cdFxuXHRyZXR1cm4ge1xuXHRcdGxpc3RlbjogZnVuY3Rpb24gKGVsZW1lbnQpIHtcblx0XHRcdGxpc3RlbihrZXksIGVsZW1lbnQpO1xuXHRcdH1cblx0fVxuXG59XG5cbnZhciBwZWVySlNLZXk7XG5cbmZ1bmN0aW9uIGxpc3RlbihrZXksIGVsZW1lbnQpIHtcblx0cGVlckpTS2V5ID0ga2V5O1xuXHRlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaW5pdCwgZmFsc2UpO1xufVxuXG5mdW5jdGlvbiBpbml0KGUpIHtcblx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHR2YXIgcGVlciA9IG5ldyBQZWVyKHtrZXk6IHBlZXJKU0tleX0pO1xuXHRwZWVyLm9uKCdvcGVuJywgZnVuY3Rpb24oaWQpIHtcblx0XHRjb25zb2xlLmxvZygnTXkgcGVlciBJRCBpczogJyArIGlkKTtcblx0fSk7XG5cdHZhciBjb25uID0gcGVlci5jb25uZWN0KHByb21wdChcIlBob25lIHJlbW90ZSBpZFwiKSk7XG5cdGNvbm4ub24oJ29wZW4nLCBmdW5jdGlvbigpIHtcblx0ICAvLyBSZWNlaXZlIG1lc3NhZ2VzXG5cdCAgY29ubi5vbignZGF0YScsIGZ1bmN0aW9uKGRhdGEpIHtcblx0ICAgIGlmIChkYXRhID09ICdsZWZ0JykgUmV2ZWFsLmxlZnQoKTtcblx0ICAgIGlmIChkYXRhID09ICdyaWdodCcpIFJldmVhbC5yaWdodCgpO1xuXHQgICAgY29uc29sZS5sb2coJ3JlY2VpdmVkJywgZGF0YSk7XG5cdFx0Y29ubi5zZW5kKHtcblx0XHRcdHRpdGxlOiBBcHAudGl0bGUsXG5cdFx0XHRzbGlkZTogUmV2ZWFsLmdldEluZGljZXMoKS5oXG5cdFx0fSk7XG5cdCAgfSk7XG5cblx0XHRjb25uLnNlbmQoe1xuXHRcdFx0dGl0bGU6IEFwcC50aXRsZSxcblx0XHRcdHNsaWRlOiBSZXZlYWwuZ2V0SW5kaWNlcygpLmhcblx0XHR9KTtcblx0ICAvLyBTZW5kIG1lc3NhZ2VzXG5cdH0pO1xufVxuXG4iLCIvKiBnbG9iYWxzIG1vZHVsZSwgXywgQXBwICovXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBhZGRMaXN0ZW5lcnM6IGZ1bmN0aW9uKGhhbmRsZXIpIHtcbiAgICBoYW5kbGVyLnByZXNlbnRhdGlvblRpdGxlLmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgc2V0UHJlc2VudGF0aW9uVGl0bGUsIGZhbHNlKTtcbiAgICBoYW5kbGVyLnRoZW1lU2VsZWN0b3IuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgY2hhbmdlVGhlbWUsIGZhbHNlKTtcbiAgICBoYW5kbGVyLmhpZGVTaWRlbWVudS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhpZGVTaWRlbWVudSwgZmFsc2UpO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zaWRlbWVudScpLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlb3ZlcicsIHNob3dTaWRlbWVudSwgZmFsc2UpO1xuICB9XG59O1xuXG52YXIgaXNTbGlkaW5nID0gZmFsc2U7XG5cbmZ1bmN0aW9uIGNoYW5nZVRoZW1lKCkge1xuICBBcHAudGhlbWUgPSB0aGlzLnZhbHVlO1xuICB2YXIgdGhlbWVzID0gW1xuICAgICdkZWZhdWx0LmNzcycsICduaWdodC5jc3MnLCAnYmVpZ2UuY3NzJ1xuICBdO1xuICBfLmVhY2godGhlbWVzLCByZW1vdmVDU1MpO1xuICBhcHBlbmRDU1ModGhpcy52YWx1ZSk7XG59XG5cbmZ1bmN0aW9uIGFwcGVuZENTUyh0aGVtZSkge1xuICB2YXIgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpbmsnKTtcbiAgbGluay5yZWwgPSAnc3R5bGVzaGVldCc7XG4gIGxpbmsuaHJlZiA9ICdjc3MvJyArIHRoZW1lO1xuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdoZWFkJykuYXBwZW5kQ2hpbGQobGluayk7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZUNTUyh2YWwpIHtcbiAgdmFyIHNlbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2xpbmtbcmVsPXN0eWxlc2hlZXRdW2hyZWYkPVwiJyt2YWwrJ1wiXScpO1xuICBpZiAoc2VsKSB7XG4gICAgc2VsLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoc2VsKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBoaWRlU2lkZW1lbnUoKSB7XG4gIHZhciBlbCA9IHRoaXMucGFyZW50Tm9kZTtcbiAgZWwuc3R5bGUubW96VHJhbnNmb3JtID0gJ3RyYW5zbGF0ZVgoLTkwJSknO1xuICBlbC5zdHlsZS53ZWJraXRUcmFuc2Zvcm0gPSAndHJhbnNsYXRlWCgtOTAlKSc7XG4gIGVsLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGVYKC05MCUpJztcbiAgaXNTbGlkaW5nID0gdHJ1ZTtcbiAgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgIGlzU2xpZGluZyA9IGZhbHNlO1xuICB9LCAzMDApO1xufVxuXG5mdW5jdGlvbiBzaG93U2lkZW1lbnUoKSB7XG4gIGlmIChpc1NsaWRpbmcpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIGVsID0gdGhpcztcbiAgZWwuc3R5bGUubW96VHJhbnNmb3JtID0gJ3RyYW5zbGF0ZVgoMCknO1xuICBlbC5zdHlsZS53ZWJraXRUcmFuc2Zvcm0gPSAndHJhbnNsYXRlWCgwKSc7XG4gIGVsLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGVYKDApJztcbn1cblxuZnVuY3Rpb24gc2V0UHJlc2VudGF0aW9uVGl0bGUoKSB7XG4gIHZhciB2YWx1ZSA9IHRoaXMudmFsdWU7XG4gIGlmICh3aW5kb3cuX3RpbWVvdXQpIHtcbiAgICBjbGVhckludGVydmFsKHdpbmRvdy5fdGltZW91dCk7XG4gICAgd2luZG93Ll90aW1lb3V0ID0gMDtcbiAgfVxuICB3aW5kb3cuX3RpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgIGRvY3VtZW50LnRpdGxlID0gdmFsdWU7XG4gICAgQXBwLnRpdGxlID0gdmFsdWU7XG4gIH0sIDMwMCk7XG59XG4iLCJ2YXIgYWRkTGlzdGVuZXJzID0gZnVuY3Rpb24gKGFkZERvd24sIGFkZFJpZ2h0KSB7XG5cdC8vIGpzLWhhbmRsZXItLWFkZC1zbGlkZS1kb3duXG5cdC8vIGpzLWhhbmRsZXItLWFkZC1zbGlkZS1yaWdodFxuXG5cdGFkZERvd24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzbGlkZXNDb250cm9sbGVyLmFkZFNsaWRlRG93biwgJ2ZhbHNlJyk7XG5cdGFkZFJpZ2h0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc2xpZGVzQ29udHJvbGxlci5hZGRTbGlkZVJpZ2h0LCAnZmFsc2UnKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRhZGRMaXN0ZW5lcnM6IGFkZExpc3RlbmVyc1xufTtcblxudmFyIHNsaWRlc0NvbnRyb2xsZXIgPSB7XG4gIHNsaWRlc1BhcmVudDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNsaWRlcycpLFxuICBhZGRTbGlkZURvd246IGZ1bmN0aW9uKCkge1xuICAgIC8vIHRvIGFkZCBhIHNsaWRlIGRvd24gd2UgbXVzdCBhZGQgYSBzZWN0aW9uXG4gICAgLy8gaW5zaWRlIHRoZSBjdXJyZW50IHNsaWRlLlxuICAgIC8vIFdlIHNlbGVjdCBpdCBhbmQgdGhlIHNlY3Rpb24gaW5zaWRlXG4gICAgdmFyIGN1cnJlbnRTbGlkZSA9IHNsaWRlc0NvbnRyb2xsZXIucHJlc2VudFNsaWRlKCk7XG4gICAgdmFyIGNoaWxkcmVuID0gY3VycmVudFNsaWRlLnF1ZXJ5U2VsZWN0b3IoJ3NlY3Rpb24nKTtcbiAgICBpZiAoIWNoaWxkcmVuKSB7XG4gICAgICB2YXIgcGFyZW50U2xpZGUgPSBzbGlkZXNDb250cm9sbGVyLm5ld1NsaWRlKCk7XG4gICAgICB2YXIgc2xpZGUxID0gc2xpZGVzQ29udHJvbGxlci5uZXdTbGlkZSgpO1xuICAgICAgdmFyIHNsaWRlMiA9IHNsaWRlc0NvbnRyb2xsZXIubmV3U2xpZGUoKTtcbiAgICAgIHNsaWRlMS5pbm5lckhUTUwgPSBjdXJyZW50U2xpZGUuaW5uZXJIVE1MO1xuICAgICAgcGFyZW50U2xpZGUuaW5uZXJIVE1MID0gJyc7XG4gICAgICBwYXJlbnRTbGlkZS5hcHBlbmRDaGlsZChzbGlkZTEpO1xuICAgICAgcGFyZW50U2xpZGUuYXBwZW5kQ2hpbGQoc2xpZGUyKTtcbiAgICAgIGN1cnJlbnRTbGlkZS5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChwYXJlbnRTbGlkZSwgY3VycmVudFNsaWRlKTtcbiAgICAgIFJldmVhbC50b2dnbGVPdmVydmlldygpO1xuICAgICAgUmV2ZWFsLnRvZ2dsZU92ZXJ2aWV3KCk7XG4gICAgICBSZXZlYWwuZG93bigpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgc2xpZGUgPSBzbGlkZXNDb250cm9sbGVyLm5ld1NsaWRlKCk7XG4gICAgICBjdXJyZW50U2xpZGUuYXBwZW5kQ2hpbGQoc2xpZGUpO1xuICAgICAgUmV2ZWFsLnRvZ2dsZU92ZXJ2aWV3KCk7XG4gICAgICBSZXZlYWwudG9nZ2xlT3ZlcnZpZXcoKTtcbiAgICAgIFJldmVhbC5kb3duKCk7XG4gICAgfVxuICB9LFxuICBhZGRTbGlkZVJpZ2h0OiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2xpZGUgPSBzbGlkZXNDb250cm9sbGVyLm5ld1NsaWRlKCk7XG4gICAgc2xpZGVzQ29udHJvbGxlci5zbGlkZXNQYXJlbnQuYXBwZW5kQ2hpbGQoc2xpZGUpO1xuICAgIFJldmVhbC5yaWdodCgpO1xuICB9LFxuICBwcmVzZW50U2xpZGU6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucHJlc2VudCcpO1xuICB9LFxuICBuZXdTbGlkZTogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNsaWRlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2VjdGlvbicpO1xuICAgIHNsaWRlLmlubmVySFRNTCA9ICc8aDM+QWRkIHlvdXIgY29udGVudCBoZXJlPC9oMz4nO1xuICAgIHNsaWRlLnNldEF0dHJpYnV0ZSgnY29udGVudEVkaXRhYmxlJywgdHJ1ZSk7XG4gICAgcmV0dXJuIHNsaWRlO1xuICB9XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgdG91ckhhbmRsZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtaGFuZGxlci0tcmVzdGFydC10b3VyJyk7XG5cbiAgICB0b3VySGFuZGxlci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHJlc3RhcnRUb3VyLCBmYWxzZSk7XG5cbiAgICB2YXIgdG91ciA9IG5ldyBTaGVwaGVyZC5Ub3VyKHtcbiAgICAgICAgZGVmYXVsdHM6IHtcbiAgICAgICAgICAgIGNsYXNzZXM6ICdzaGVwaGVyZC10aGVtZS1hcnJvd3MnLFxuICAgICAgICAgICAgc2Nyb2xsVG86IGZhbHNlXG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHRvdXIuYWRkU3RlcCgnaW50cm8nLCB7XG4gICAgICAgIHRleHQ6ICdUaGlzIGlzIGEgZ3VpZGVkIGludHJvZHVjdGlvbiB0byBLcmVhdG9yLmpzIDxicj4gSXQgd2lsbCBzaG93IHlvdSBob3cgdG8gY29udHJvbCBhbmQgc3R5bGUgdGhlIGNvbnRlbnQgPGJyPiBZb3UgY2FuIGNhbmNlbCBpZiB5b3Uga25vdyB3aGF0IHRvIGRvIG9yIGNsaWNrIHN0YXJ0IDxicj4nLFxuICAgICAgICBidXR0b25zOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGV4dDogJ0NhbmNlbCcsXG4gICAgICAgICAgICAgICAgYWN0aW9uOiBmaW5pc2hUb3VyXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRleHQ6ICdTdGFydCcsXG4gICAgICAgICAgICAgICAgYWN0aW9uOiB0b3VyLm5leHRcbiAgICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgIH0pXG5cbiAgICB0b3VyLmFkZFN0ZXAoJ2V4YW1wbGUtc3RlcCcsIHtcbiAgICAgICAgdGV4dDogJ1RoaXMgaXMgdGhlIG1haW4gY29udHJvbCBmb3IgdGhlIGNvbnRlbnQnLFxuICAgICAgICBhdHRhY2hUbzogJy50b3BtZW51JyxcbiAgICAgICAgYnV0dG9uczogW3tcbiAgICAgICAgICAgIHRleHQ6ICdOZXh0JyxcbiAgICAgICAgICAgIGFjdGlvbjogdG91ci5uZXh0XG4gICAgICAgIH1dLFxuICAgICAgICB0ZXRoZXJPcHRpb25zOiB7XG4gICAgICAgICAgICBhdHRhY2htZW50OiAnYm90dG9tIGNlbnRlcicsXG4gICAgICAgICAgICB0YXJnZXRBdHRhY2htZW50OiAndG9wIGNlbnRlcidcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgdG91ci5hZGRTdGVwKCdleGFtcGxlLXN0ZXAnLCB7XG4gICAgICAgIHRleHQ6ICdTZXQgdGhlIHRleHQgdG8gYm9sZCwgaXRhbGljIG9yIHVuZGVybGluZWQnLFxuICAgICAgICBhdHRhY2hUbzogJy5qcy1oYW5kbGVyLS1zdHlsZS1idXR0b24nLFxuICAgICAgICB0ZXRoZXJPcHRpb25zOiB7XG4gICAgICAgICAgICBhdHRhY2htZW50OiAnYm90dG9tIGxlZnQnLFxuICAgICAgICAgICAgdGFyZ2V0QXR0YWNobWVudDogJ3RvcCBsZWZ0J1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICB0b3VyLmFkZFN0ZXAoJ2V4YW1wbGUtc3RlcCcsIHtcbiAgICAgICAgdGV4dDogJ01ha2UgYSBidWxsZXQgbGlzdCcsXG4gICAgICAgIGF0dGFjaFRvOiAnLmpzLWhhbmRsZXItLWxpc3QtYnV0dG9uJyxcbiAgICAgICAgdGV0aGVyT3B0aW9uczoge1xuICAgICAgICAgICAgYXR0YWNobWVudDogJ2JvdHRvbSBsZWZ0JyxcbiAgICAgICAgICAgIHRhcmdldEF0dGFjaG1lbnQ6ICd0b3AgbGVmdCdcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgdG91ci5hZGRTdGVwKCdleGFtcGxlLXN0ZXAnLCB7XG4gICAgICAgIHRleHQ6ICdBbGlnbiBsZWZ0LCBjZW50ZXIgb3IgcmlnaHQgICcsXG4gICAgICAgIGF0dGFjaFRvOiAnLmpzLWhhbmRsZXItLWFsaWduJyxcbiAgICAgICAgdGV0aGVyT3B0aW9uczoge1xuICAgICAgICAgICAgYXR0YWNobWVudDogJ2JvdHRvbSBsZWZ0JyxcbiAgICAgICAgICAgIHRhcmdldEF0dGFjaG1lbnQ6ICd0b3AgbGVmdCdcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgdG91ci5hZGRTdGVwKCdleGFtcGxlLXN0ZXAnLCB7XG4gICAgICAgIHRleHQ6ICdBbGlnbiBsZWZ0LCBjZW50ZXIgb3IgcmlnaHQnLFxuICAgICAgICBhdHRhY2hUbzogJy5qcy1oYW5kbGVyLS1hbGlnbicsXG4gICAgICAgIHRldGhlck9wdGlvbnM6IHtcbiAgICAgICAgICAgIGF0dGFjaG1lbnQ6ICdib3R0b20gbGVmdCcsXG4gICAgICAgICAgICB0YXJnZXRBdHRhY2htZW50OiAndG9wIGxlZnQnXG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHRvdXIuYWRkU3RlcCgnZXhhbXBsZS1zdGVwJywge1xuICAgICAgICB0ZXh0OiAnU2V0IHRoZSB0ZXh0IGNvbG9yJyxcbiAgICAgICAgYXR0YWNoVG86ICcuanMtaGFuZGxlci0tY29sb3InLFxuICAgICAgICB0ZXRoZXJPcHRpb25zOiB7XG4gICAgICAgICAgICBhdHRhY2htZW50OiAnYm90dG9tIGxlZnQnLFxuICAgICAgICAgICAgdGFyZ2V0QXR0YWNobWVudDogJ3RvcCBsZWZ0J1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICB0b3VyLmFkZFN0ZXAoJ2V4YW1wbGUtc3RlcCcsIHtcbiAgICAgICAgdGV4dDogJ0FkZCBzbGlkZScsXG4gICAgICAgIGF0dGFjaFRvOiAnLmpzLWhhbmRsZXItLWFkZC1zbGlkZS1yaWdodCcsXG4gICAgICAgIHRldGhlck9wdGlvbnM6IHtcbiAgICAgICAgICAgIGF0dGFjaG1lbnQ6ICd0b3AgbGVmdCcsXG4gICAgICAgICAgICB0YXJnZXRBdHRhY2htZW50OiAndG9wIHJpZ2h0J1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICB0b3VyLmFkZFN0ZXAoJ2V4YW1wbGUtc3RlcCcsIHtcbiAgICAgICAgdGV4dDogJ1ByZXNlbnRhdGlvbiBuYW1lJyxcbiAgICAgICAgYXR0YWNoVG86ICcuanMtaGFuZGxlci0tcHJlc2VudGF0aW9uLW5hbWUnLFxuICAgICAgICB0ZXRoZXJPcHRpb25zOiB7XG4gICAgICAgICAgICBhdHRhY2htZW50OiAndG9wIHJpZ2h0JyxcbiAgICAgICAgICAgIHRhcmdldEF0dGFjaG1lbnQ6ICd0b3AgbGVmdCdcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgdG91ci5hZGRTdGVwKCdleGFtcGxlLXN0ZXAnLCB7XG4gICAgICAgIHRleHQ6ICdDaGFuZ2UgdGhlIHRoZW1lJyxcbiAgICAgICAgYXR0YWNoVG86ICcuanMtaGFuZGxlci0tdGhlbWUtc2VsZWN0b3InLFxuICAgICAgICB0ZXRoZXJPcHRpb25zOiB7XG4gICAgICAgICAgICBhdHRhY2htZW50OiAndG9wIHJpZ2h0JyxcbiAgICAgICAgICAgIHRhcmdldEF0dGFjaG1lbnQ6ICd0b3AgbGVmdCdcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgdG91ci5hZGRTdGVwKCdleGFtcGxlLXN0ZXAnLCB7XG4gICAgICAgIHRleHQ6ICdEb3dubG9hZCB3aGVuIHlvdSBhcmUgYWxsIGRvbmUnLFxuICAgICAgICBhdHRhY2hUbzogJy5qcy1oYW5kbGVyLS1kb3dubG9hZCcsXG4gICAgICAgIHRldGhlck9wdGlvbnM6IHtcbiAgICAgICAgICAgIGF0dGFjaG1lbnQ6ICd0b3AgcmlnaHQnLFxuICAgICAgICAgICAgdGFyZ2V0QXR0YWNobWVudDogJ3RvcCBsZWZ0J1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICB0b3VyLmFkZFN0ZXAoJ2V4YW1wbGUtc3RlcCcsIHtcbiAgICAgICAgdGV4dDogJ1RoYXQgaXMgYWxsLiBJIGhvcGUgeW91IG1ha2UgYSBncmVhdCBwcmVzZW50YXRpb24hJyxcbiAgICAgICAgYnV0dG9uczogW3tcbiAgICAgICAgICAgICd0ZXh0JzogJ1N0YXJ0IHdyaXRpbmcnLFxuICAgICAgICAgICAgYWN0aW9uOiBmaW5pc2hUb3VyXG4gICAgICAgIH1dXG4gICAgfSk7XG5cbiAgICBpZiAoIWxvY2FsU3RvcmFnZS5nZXRJdGVtKCd0b3VyJykpIHRvdXIuc3RhcnQoKTtcblxuICAgIGZ1bmN0aW9uIGZpbmlzaFRvdXIoKSB7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCd0b3VyJywgJ2NvbXBsZXRlJyk7XG4gICAgICAgIHRvdXIuaGlkZSgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlc3RhcnRUb3VyKCkge1xuICAgICAgICB0b3VyLnN0YXJ0KCk7XG4gICAgfVxufVxuIl19
