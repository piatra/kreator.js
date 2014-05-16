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
    headingType: document.querySelector('.js-handler--heading-type'),
    quillEditor: document.querySelectorAll('.slide-edit-lock')
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
    _.each(handler.quillEditor, function (el) {
      el.addEventListener('click', enableQuillEditor, false);
    });
  }
};

var editor = null;

function enableQuillEditor () {
  toggleMenu();
  this.classList.toggle('active');
  var target = document.querySelector('.present');
  var html = target.querySelector('.kreator-slide-content').innerHTML;
  if (this.classList.contains('active')) {
    target.classList.add('section--editing');
    if (editor == null) {
      editor = new Quill('.present .quill-slide-content', {
        modules: {
          'toolbar': {container: '#topmenu'}
        },
        theme: 'snow'
      });
    }
    editor.setHTML(html);
  } else {
    target.classList.remove('section--editing');
    var html = editor.getHTML();
    console.log(html);
    target.querySelector('.kreator-slide-content').innerHTML = html;
  }
}

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwibGliL2tyZWF0b3ItZG93bmxvYWQuanMiLCJsaWIva3JlYXRvci5qcyIsImxpYi9tYWluLmpzIiwibGliL21lbnUtY29udHJvbGxlci5qcyIsImxpYi9wb2ludGVyLmpzIiwibGliL3NpZGVtZW51LWNvbnRyb2xsZXIuanMiLCJsaWIvc2xpZGUtY29udHJvbGxlci5qcyIsImxpYi90b3VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0UkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgYWRkTGlzdGVuZXI6IGZ1bmN0aW9uKGVsKSB7XG4gICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBkb3dubG9hZFNsaWRlcywgZmFsc2UpO1xuICB9XG59O1xuXG52YXIgcGFydHMgPSBbe1xuICBuYW1lOiAnaGVhZC5odG1sJyxcbiAgcGF0aDogJydcbn0sIHtcbiAgbmFtZTogJ3RhaWwuaHRtbCcsXG4gIHBhdGg6ICcnXG59LCB7XG4gIG5hbWU6ICdkZWZhdWx0LmNzcycsXG4gIHBhdGg6ICdjc3MnXG59LCB7XG4gIG5hbWU6ICd6ZW5idXJuLmNzcycsXG4gIHBhdGg6ICdsaWIvY3NzJ1xufSwge1xuICBuYW1lOiAnaGVhZC5taW4uanMnLFxuICBwYXRoOiAnbGliL2pzJ1xufSwge1xuICBuYW1lOiAncmV2ZWFsLmpzJyxcbiAgcGF0aDogJ2pzJ1xufSwge1xuICBuYW1lOiAnbWFpbi5jc3MnLFxuICBwYXRoOiAnY3NzJ1xufSwge1xuICBuYW1lOiAnemVuYnVybi5jc3MnLFxuICBwYXRoOiAnY3NzJ1xufSwge1xuICBuYW1lOiAncHJpbnQuY3NzJyxcbiAgcGF0aDogJ2Nzcydcbn0sIHtcbiAgbmFtZTogJ2NsYXNzTGlzdC5qcycsXG4gIHBhdGg6ICdsaWIvanMnXG59LCB7XG4gIG5hbWU6ICdoaWdobGlnaHQuanMnLFxuICBwYXRoOiAnbGliL2pzJ1xufSwge1xuICBuYW1lOiAnc2t5LmNzcycsXG4gIHBhdGg6ICdjc3MnXG59LCB7XG4gIG5hbWU6ICduaWdodC5jc3MnLFxuICBwYXRoOiAnY3NzJ1xufSwge1xuICBuYW1lOiAnYmVpZ2UuY3NzJyxcbiAgcGF0aDogJ2Nzcydcbn1dO1xuXG5mdW5jdGlvbiBkb3dubG9hZFNsaWRlcygpIHtcbiAgdmFyIGNvbnRlbnQgPSBbXTtcbiAgdmFyIHVybCA9IGxvY2F0aW9uLm9yaWdpbiArICcva3JlYXRvci5qcy9kb3dubG9hZC8nO1xuICBpZiAobG9jYXRpb24ub3JpZ2luLm1hdGNoKCdsb2NhbGhvc3QnKSkgeyAvLyB3ZSBhcmUgcnVubmluZyBpbiBkZXZlbG9wbWVudFxuICAgIGNvbnNvbGUuaW5mbygnRGV2ZWxvcG1lbnQgbW9kZScpO1xuICAgIHVybCA9IGxvY2F0aW9uLm9yaWdpbiArICcvZG93bmxvYWQvJztcbiAgICBjb25zb2xlLmluZm8oJ0Rvd25sb2FkIFVSTCBwb2ludHMgdG8gJyArIHVybCk7XG4gIH1cbiAgdmFyIGwgPSBwYXJ0cy5sZW5ndGg7XG4gIHZhciBmb2xkZXJzID0gcGFydHMubWFwKGZ1bmN0aW9uKHApIHtcbiAgICByZXR1cm4gcC5wYXRoO1xuICB9KTtcbiAgcGFydHMubWFwKGZ1bmN0aW9uKHApIHtcbiAgICByZXR1cm4gdXJsICsgcC5uYW1lO1xuICB9KS5mb3JFYWNoKGZ1bmN0aW9uKHVybCwgaWR4KSB7XG4gICAgcmVxdWVzdFBhcnQodXJsKVxuICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlc3ApIHtcbiAgICAgICAgY29udGVudFtpZHhdID0gcmVzcDtcbiAgICAgICAgaWYgKC0tbCA9PT0gMCkge1xuICAgICAgICAgIGNyZWF0ZVppcChjb250ZW50LCBmb2xkZXJzKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gIH0pO1xufVxuXG4vKlxuICogVG9nZ2xlIG9uIGFuZCBvZmYgdGhlIGNvbnRlbnRFZGl0YWJsZVxuICogYXR0cmlidXRlIG9uIHRoZSBzbGlkZXNcbiAqICovXG5mdW5jdGlvbiB0b2dnbGVFZGl0TW9kZShtb2RlKSB7XG4gIHZhciBzbGlkZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdzZWN0aW9uJyk7XG4gIF8uZWFjaChzbGlkZXMsIGZ1bmN0aW9uKHMpIHtcbiAgICBzLnNldEF0dHJpYnV0ZSgnY29udGVudEVkaXRhYmxlJywgbW9kZSk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVaaXAoY29udGVudCwgZm9sZGVycykge1xuICB0b2dnbGVFZGl0TW9kZShmYWxzZSk7XG4gIGNvbnRlbnRbMF0gPSBjb250ZW50WzBdLnJlcGxhY2UoL2RlZmF1bHQuY3NzL2csIEFwcC50aGVtZSk7XG4gIHZhciBzbGlkZXMgPSAnPGRpdiBjbGFzcz1cInJldmVhbFwiPjxkaXYgY2xhc3M9XCJzbGlkZXNcIj4nICtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2xpZGVzJykuaW5uZXJIVE1MICtcbiAgICAgICAgICAgICAgICAnPC9kaXY+PC9kaXY+JztcbiAgdmFyIGluZGV4ID0gY29udGVudC5zcGxpY2UoMCwyKTtcbiAgdmFyIHppcCA9IG5ldyBKU1ppcCgpO1xuICBpbmRleC5zcGxpY2UoMSwgMCwgc2xpZGVzKTtcbiAgaW5kZXggPSBpbmRleC5qb2luKCcnKTtcbiAgaW5kZXgucmVwbGFjZSgvPHRpdGxlPi4qPFxcL3RpdGxlPi9nLCAnPHRpdGxlPicgKyBBcHAudGl0bGUgKyAnPC90aXRsZT4nKTtcbiAgemlwLmZpbGUoJ2luZGV4Lmh0bWwnLCBpbmRleCk7XG5cbiAgZm9yICh2YXIgaSA9IDI7IGkgPCBmb2xkZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGZvbGRlciA9IHppcC5mb2xkZXIoZm9sZGVyc1tpXSk7XG4gICAgZm9sZGVyLmZpbGUocGFydHNbaV0ubmFtZSwgY29udGVudFtpIC0gMl0pO1xuICB9XG5cbiAgY29udGVudCA9IHppcC5nZW5lcmF0ZSh7dHlwZTogJ2Jsb2InfSk7XG4gIHZhciBsaW5rID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWhhbmRsZXItLWRvd25sb2FkLXJlYWR5Jyk7XG4gIGxpbmsuaHJlZiA9IHdpbmRvdy5VUkwuY3JlYXRlT2JqZWN0VVJMKGNvbnRlbnQpO1xuICBsaW5rLmlubmVySFRNTCA9ICdQcmVzZW50YXRpb24gcmVhZHkuIENsaWNrIGhlcmUgdG8gZG93bmxvYWQnO1xuICBsaW5rLmRvd25sb2FkID0gJ1lvdXJQcmVzZW50YXRpb24uemlwJztcbiAgdG9nZ2xlRWRpdE1vZGUodHJ1ZSk7XG59XG5cbmZ1bmN0aW9uIHJlcXVlc3RQYXJ0KHVybCkge1xuXG4gIHZhciByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gIHZhciBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcblxuICByZXF1ZXN0Lm9wZW4oXCJHRVRcIiwgdXJsLCB0cnVlKTtcbiAgcmVxdWVzdC5vbmxvYWQgPSBvbmxvYWQ7XG4gIHJlcXVlc3Qub25lcnJvciA9IG9uZXJyb3I7XG4gIHJlcXVlc3Quc2VuZCgpO1xuXG4gIGZ1bmN0aW9uIG9ubG9hZCgpIHtcbiAgICBpZiAocmVxdWVzdC5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgZGVmZXJyZWQucmVzb2x2ZShyZXF1ZXN0LnJlc3BvbnNlVGV4dCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlZmVycmVkLnJlamVjdChuZXcgRXJyb3IoXCJTdGF0dXMgY29kZTogXCIgKyByZXF1ZXN0LnN0YXR1cykpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIG9uZXJyb3IoKSB7XG4gICAgZGVmZXJyZWQucmVqZWN0KG5ldyBFcnJvcihcIlJlcXVlc3QgdG8gXCIgKyB1cmwgKyBcIiBmYWlsZWRcIikpO1xuICB9XG5cbiAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG59XG4iLCJzbGlkZSA9IHJlcXVpcmUoJy4vc2xpZGUtY29udHJvbGxlcicpO1xubWVudSA9IHJlcXVpcmUoJy4vbWVudS1jb250cm9sbGVyJyk7XG5kb3dubG9hZCA9IHJlcXVpcmUoJy4va3JlYXRvci1kb3dubG9hZCcpO1xuc2lkZW1lbnUgPSByZXF1aXJlKCcuL3NpZGVtZW51LWNvbnRyb2xsZXInKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBrcmVhdG9yICgpIHtcblxuICB3aW5kb3cuQXBwID0ge1xuICAgIHRpdGxlOiAnS3JlYXRvci5qcycsXG4gICAgYXV0aG9yOiAnQW5kcmVpIE9wcmVhJyxcbiAgICB0aGVtZTogJ2RlZmF1bHQuY3NzJ1xuICB9O1xuXG5cdC8vIEZ1bGwgbGlzdCBvZiBjb25maWd1cmF0aW9uIG9wdGlvbnMgYXZhaWxhYmxlIGhlcmU6XG5cdC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9oYWtpbWVsL3JldmVhbC5qcyNjb25maWd1cmF0aW9uXG5cdFJldmVhbC5pbml0aWFsaXplKHtcbiAgICBjb250cm9sczogdHJ1ZSxcblx0XHRwcm9ncmVzczogdHJ1ZSxcblx0XHRoaXN0b3J5OiB0cnVlLFxuICAgIGNlbnRlcjogZmFsc2UsXG5cblx0XHR0aGVtZTogUmV2ZWFsLmdldFF1ZXJ5SGFzaCgpLnRoZW1lLCAvLyBhdmFpbGFibGUgdGhlbWVzIGFyZSBpbiAvY3NzL3RoZW1lXG5cdFx0dHJhbnNpdGlvbjogUmV2ZWFsLmdldFF1ZXJ5SGFzaCgpLnRyYW5zaXRpb24gfHwgJ2RlZmF1bHQnLCAvLyBkZWZhdWx0L2N1YmUvcGFnZS9jb25jYXZlL3pvb20vbGluZWFyL2ZhZGUvbm9uZVxuXG5cdFx0Ly8gT3B0aW9uYWwgbGlicmFyaWVzIHVzZWQgdG8gZXh0ZW5kIG9uIHJldmVhbC5qc1xuXHRcdGRlcGVuZGVuY2llczogW1xuXHRcdFx0eyBzcmM6ICdsaWIvbWFya2VkLmpzJywgY29uZGl0aW9uOiBmdW5jdGlvbigpIHsgcmV0dXJuICEhZG9jdW1lbnQucXVlcnlTZWxlY3RvciggJ1tkYXRhLW1hcmtkb3duXScgKTsgfSB9LFxuXHRcdFx0eyBzcmM6ICdsaWIvbWFya2Rvd24uanMnLCBjb25kaXRpb246IGZ1bmN0aW9uKCkgeyByZXR1cm4gISFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCAnW2RhdGEtbWFya2Rvd25dJyApOyB9IH0sXG5cdFx0XHR7IHNyYzogJ2xpYi9oaWdobGlnaHQuanMnLCBhc3luYzogdHJ1ZSwgY2FsbGJhY2s6IGZ1bmN0aW9uKCkgeyBobGpzLmluaXRIaWdobGlnaHRpbmdPbkxvYWQoKTsgfSB9XG5cdFx0XVxuXHR9KTtcblxuXHRzbGlkZS5hZGRMaXN0ZW5lcnMoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWhhbmRsZXItLWFkZC1zbGlkZS1kb3duJyksXG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1oYW5kbGVyLS1hZGQtc2xpZGUtcmlnaHQnKSk7XG5cbiAgbWVudS5hZGRMaXN0ZW5lcnMoe1xuICAgIHVwbG9hZDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWhhbmRsZXItLXVwbG9hZCcpLFxuICAgIGhlYWRpbmc6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1oYW5kbGVyLS1oZWFkaW5ncycpLFxuICAgIGNvbG9yOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtaGFuZGxlci0tY29sb3InKSxcbiAgICBzdHlsZUJ1dHRvbnM6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1oYW5kbGVyLS1zdHlsZS1idXR0b24nKSxcbiAgICBhbGlnbm1lbnQ6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1oYW5kbGVyLS1hbGlnbicpLFxuICAgIGNvZGVCbG9jazogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWhhbmRsZXItLWNvZGUtYmxvY2snKSxcbiAgICBvdmVydmlldzogZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLWhhbmRsZXItLW92ZXJ2aWV3JyksXG4gICAgbGlzdEJ1dHRvbjogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWhhbmRsZXItLWxpc3QtYnV0dG9uJyksXG4gICAgaGVhZGluZ1R5cGU6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1oYW5kbGVyLS1oZWFkaW5nLXR5cGUnKSxcbiAgICBxdWlsbEVkaXRvcjogZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnNsaWRlLWVkaXQtbG9jaycpXG4gIH0pO1xuXG4gIHNpZGVtZW51LmFkZExpc3RlbmVycyh7XG4gICAgcHJlc2VudGF0aW9uVGl0bGU6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1oYW5kbGVyLS1wcmVzZW50YXRpb24tbmFtZScpLFxuICAgIHRoZW1lU2VsZWN0b3I6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1oYW5kbGVyLS10aGVtZS1zZWxlY3RvcicpLFxuICAgIGhpZGVTaWRlbWVudTogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWhhbmRsZXItLWhpZGUtc2lkZW1lbnUnKVxuICB9KTtcblxuICBkb3dubG9hZC5hZGRMaXN0ZW5lcihkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtaGFuZGxlci0tZG93bmxvYWQnKSk7XG5cbn07XG4iLCJ2YXIga3JlYXRvciA9IHJlcXVpcmUoJy4va3JlYXRvci5qcycpO1xudmFyIHBvaW50ZXIgPSByZXF1aXJlKCcuL3BvaW50ZXIuanMnKSgnaW0yODljc3MwYnlwaGt0OScpO1xudmFyIHRvdXIgICAgPSByZXF1aXJlKCcuL3RvdXIuanMnKTtcblxua3JlYXRvcigpO1xudG91cigpO1xuXG5wb2ludGVyLmxpc3Rlbihkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtaGFuZGxlci0taW5pdC1yZW1vdGUnKSk7XG5cbiIsIi8qIGdsb2JhbHMgbW9kdWxlLCBfLCBSZXZlYWwsIHdpbmRvdywgZG9jdW1lbnQsIEZpbGVSZWFkZXIsIGFsZXJ0LCBJbWFnZSAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgYWRkTGlzdGVuZXJzOiBmdW5jdGlvbihoYW5kbGVyKSB7XG4gICAgaGFuZGxlci51cGxvYWQuYWRkRXZlbnRMaXN0ZW5lcignc3VibWl0JywgdXBsb2FkU2xpZGVzLCBmYWxzZSk7XG4gICAgXy5lYWNoKGhhbmRsZXIuYWxpZ25tZW50LCBmdW5jdGlvbihlbCkge1xuICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0ZXh0QWxpZ25tZW50LCBmYWxzZSk7XG4gICAgfSk7XG4gICAgXy5lYWNoKGhhbmRsZXIub3ZlcnZpZXcsIGZ1bmN0aW9uKGVsKSB7XG4gICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgICAgICB0b2dnbGVNZXNzYWdlKCk7XG4gICAgICAgIHRvZ2dsZU1lbnUoKTtcbiAgICAgICAgUmV2ZWFsLnRvZ2dsZU92ZXJ2aWV3KCk7XG4gICAgICB9LCBmYWxzZSk7XG4gICAgfSk7XG4gICAgXy5lYWNoKGhhbmRsZXIuc3R5bGVCdXR0b25zLCBmdW5jdGlvbiAoZWwpIHtcbiAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc2V0Rm9udFN0eWxlLCBmYWxzZSk7XG4gICAgfSk7XG4gICAgXy5lYWNoKGhhbmRsZXIucXVpbGxFZGl0b3IsIGZ1bmN0aW9uIChlbCkge1xuICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBlbmFibGVRdWlsbEVkaXRvciwgZmFsc2UpO1xuICAgIH0pO1xuICB9XG59O1xuXG52YXIgZWRpdG9yID0gbnVsbDtcblxuZnVuY3Rpb24gZW5hYmxlUXVpbGxFZGl0b3IgKCkge1xuICB0b2dnbGVNZW51KCk7XG4gIHRoaXMuY2xhc3NMaXN0LnRvZ2dsZSgnYWN0aXZlJyk7XG4gIHZhciB0YXJnZXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucHJlc2VudCcpO1xuICB2YXIgaHRtbCA9IHRhcmdldC5xdWVyeVNlbGVjdG9yKCcua3JlYXRvci1zbGlkZS1jb250ZW50JykuaW5uZXJIVE1MO1xuICBpZiAodGhpcy5jbGFzc0xpc3QuY29udGFpbnMoJ2FjdGl2ZScpKSB7XG4gICAgdGFyZ2V0LmNsYXNzTGlzdC5hZGQoJ3NlY3Rpb24tLWVkaXRpbmcnKTtcbiAgICBpZiAoZWRpdG9yID09IG51bGwpIHtcbiAgICAgIGVkaXRvciA9IG5ldyBRdWlsbCgnLnByZXNlbnQgLnF1aWxsLXNsaWRlLWNvbnRlbnQnLCB7XG4gICAgICAgIG1vZHVsZXM6IHtcbiAgICAgICAgICAndG9vbGJhcic6IHtjb250YWluZXI6ICcjdG9wbWVudSd9XG4gICAgICAgIH0sXG4gICAgICAgIHRoZW1lOiAnc25vdydcbiAgICAgIH0pO1xuICAgIH1cbiAgICBlZGl0b3Iuc2V0SFRNTChodG1sKTtcbiAgfSBlbHNlIHtcbiAgICB0YXJnZXQuY2xhc3NMaXN0LnJlbW92ZSgnc2VjdGlvbi0tZWRpdGluZycpO1xuICAgIHZhciBodG1sID0gZWRpdG9yLmdldEhUTUwoKTtcbiAgICBjb25zb2xlLmxvZyhodG1sKTtcbiAgICB0YXJnZXQucXVlcnlTZWxlY3RvcignLmtyZWF0b3Itc2xpZGUtY29udGVudCcpLmlubmVySFRNTCA9IGh0bWw7XG4gIH1cbn1cblxuZnVuY3Rpb24gdG9nZ2xlTWVudSgpIHtcbiAgdG9nZ2xlKCcjdG9wbWVudScpO1xufVxuXG5mdW5jdGlvbiB0b2dnbGVNZXNzYWdlKCkge1xuICB0b2dnbGUoJyNtZXNzYWdlJyk7XG59XG5cbmZ1bmN0aW9uIHRvZ2dsZShzZWwpIHtcbiAgdmFyIGVsZW0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbCk7XG4gIGlmKGVsZW0uY2xhc3NMaXN0LmNvbnRhaW5zKCdoaWRkZW4nKSkge1xuICAgIGVsZW0uY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gZWxzZSB7XG4gICAgZWxlbS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuLypcbiAqIFdyYXAgY3VycmVudCBzZWxlY3Rpb24gaW4gYSA8bGk+XG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUxpc3RJdGVtcyhlKSB7XG4gIC8qanNoaW50IHZhbGlkdGhpczogdHJ1ZSovXG4gIHRoaXMuY2xhc3NMaXN0LnRvZ2dsZSgnYWN0aXZlJyk7XG4gIHZhciBjdXJyZW50U2xpZGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucHJlc2VudCcpO1xuXG4gIGlmICh0aGlzLmNsYXNzTGlzdC5jb250YWlucygnYWN0aXZlJykpIHtcbiAgICBpZiAoZ2V0U2VsZWN0aW9uSHRtbCgpID09PSBcIlwiKSB7XG4gICAgICB2YXIgbGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpO1xuICAgICAgbGkuaW5uZXJIVE1MID0gJ0xpc3QgaXRlbSc7XG4gICAgICBjdXJyZW50U2xpZGUuYXBwZW5kQ2hpbGQobGkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXBsYWNlU2VsZWN0aW9uV2l0aEh0bWwoJzxsaT4nICsgZ2V0U2VsZWN0aW9uSHRtbCgpICsgJzwvbGk+Jyk7XG4gICAgICB0aGlzLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB2YXIgYnIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdicicpO1xuICAgIGN1cnJlbnRTbGlkZS5hcHBlbmRDaGlsZChicik7XG4gIH1cbn1cblxuLypcbiAqIEhhbmRsZSBmb3JtIHN1Ym1pdCBldmVudHNcbiAqIHJlYWRzIHRoZSBmaWxlIGFzIHRleHRcbiAqICovXG5mdW5jdGlvbiB1cGxvYWRTbGlkZXMoZSkge1xuICAvKmpzaGludCB2YWxpZHRoaXM6IHRydWUqL1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG4gIHZhciBmaWxlID0gdGhpcy5xdWVyeVNlbGVjdG9yKCdpbnB1dFt0eXBlPWZpbGVdJykuZmlsZXNbMF07XG4gIGlmICh3aW5kb3cuRmlsZSAmJiB3aW5kb3cuRmlsZVJlYWRlciAmJiB3aW5kb3cuRmlsZUxpc3QgJiYgd2luZG93LkJsb2IpIHtcbiAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcblxuICAgIHJlYWRlci5vbmxvYWQgPSAoZnVuY3Rpb24oZmlsZSkge1xuICAgICAgcmV0dXJuIHBhcnNlRmlsZS5iaW5kKHRoaXMsIGZpbGUudHlwZSk7XG4gICAgfSkoZmlsZSk7XG5cbiAgICBpZiAoZmlsZS50eXBlLm1hdGNoKCd0ZXh0L2h0bWwnKSlcbiAgICAgIHJlYWRlci5yZWFkQXNUZXh0KGZpbGUsICd1dGY4Jyk7XG4gICAgZWxzZVxuICAgICAgcmVhZGVyLnJlYWRBc0RhdGFVUkwoZmlsZSk7XG4gIH0gZWxzZSB7XG4gICAgYWxlcnQoJ0ZpbGUgcmVhZGluZyBub3Qgc3VwcG9ydGVkJyk7XG4gIH1cbn1cblxuLypcbiAqIFJlY2VpdmVzIHRoZSB1cGxvYWRlZCBmaWxlXG4gKiBIYW5kbGUgdGV4dC9odG1sIGFuZCBpbWFnZXMvKiBkaWZmZXJlbnRseVxuICogKi9cbmZ1bmN0aW9uIHBhcnNlRmlsZShmaWxlVHlwZSwgZSkge1xuICB2YXIgY29udGVudCA9IGUudGFyZ2V0LnJlc3VsdDtcbiAgaWYgKGZpbGVUeXBlLm1hdGNoKCd0ZXh0L2h0bWwnKSkge1xuICAgIHZhciBkdW1teSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGR1bW15LmlubmVySFRNTCA9IGNvbnRlbnQ7XG4gICAgYXBwZW5kQ29udGVudChkdW1teS5xdWVyeVNlbGVjdG9yKCcuc2xpZGVzJykuaW5uZXJIVE1MKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgaW1nID0gbmV3IEltYWdlKCk7XG4gICAgaW1nLnNyYyA9IGUudGFyZ2V0LnJlc3VsdDtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucHJlc2VudCcpLmFwcGVuZENoaWxkKGltZyk7IC8vIEZJWE1FXG4gIH1cbn1cblxuLyogQXBwZW5kcyB0aGUgcGFyc2VkIGNvbnRlbnQgdG8gdGhlIHBhZ2VcbiAqIGNvbXBsZXRseSByZXBsYWNlcyB0aGUgb2xkIGNvbnRlbnRcbiAqICovXG5mdW5jdGlvbiBhcHBlbmRDb250ZW50KGNvbnRlbnQpIHtcbiAgdmFyIHNsaWRlcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zbGlkZXMnKTtcbiAgc2xpZGVzLmlubmVySFRNTCA9IGNvbnRlbnQ7XG4gIFJldmVhbC50b2dnbGVPdmVydmlldygpO1xuICBSZXZlYWwudG9nZ2xlT3ZlcnZpZXcoKTtcbiAgdG9nZ2xlRWRpdE1vZGUodHJ1ZSk7XG59XG5cbi8qXG4gKiBUb2dnbGUgb24gYW5kIG9mZiB0aGUgY29udGVudEVkaXRhYmxlXG4gKiBhdHRyaWJ1dGUgb24gdGhlIHNsaWRlc1xuICogKi9cbmZ1bmN0aW9uIHRvZ2dsZUVkaXRNb2RlKG1vZGUpIHtcbiAgdmFyIHNsaWRlcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ3NlY3Rpb24nKTtcbiAgXy5lYWNoKHNsaWRlcywgZnVuY3Rpb24ocykge1xuICAgIHMuc2V0QXR0cmlidXRlKCdjb250ZW50RWRpdGFibGUnLCBtb2RlKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHRleHRBbGlnbm1lbnQoKSB7XG4gIC8qanNoaW50IHZhbGlkdGhpczogdHJ1ZSovXG4gIHZhciBwcm9wZXJ0eSA9ICdkaXNwbGF5OmJsb2NrO3RleHQtYWxpZ246JyArIHRoaXMuZ2V0QXR0cmlidXRlKCdkYXRhLWFsaWduJyk7XG4gIHJlcGxhY2VTZWxlY3Rpb25XaXRoSHRtbCgnPHNwYW4gc3R5bGU9XCInK3Byb3BlcnR5KydcIj4nICsgZ2V0U2VsZWN0aW9uSHRtbCgpICsgJzwvc3Bhbj4nKTtcbn1cblxuZnVuY3Rpb24gc2V0Rm9udFN0eWxlKCkge1xuICAvKmpzaGludCB2YWxpZHRoaXM6IHRydWUqL1xuICB2YXIgdmFsdWUgPSB7XG4gICAgYjogJ2ZvbnQtd2VpZ2h0OiBib2xkJyxcbiAgICB1OiAndGV4dC1kZWNvcmF0aW9uOiB1bmRlcmxpbmUnLFxuICAgIGk6ICdmb250LXN0eWxlOiBpdGFsaWMnXG4gIH07XG4gIHZhciBwcm9wZXJ0eSA9IHZhbHVlW3RoaXMuaW5uZXJIVE1MLnRvTG93ZXJDYXNlKCldO1xuICByZXBsYWNlU2VsZWN0aW9uV2l0aEh0bWwoJzxzcGFuIHN0eWxlPVwiJytwcm9wZXJ0eSsnXCI+JyArIGdldFNlbGVjdGlvbkh0bWwoKSArICc8L3NwYW4+Jyk7XG59XG5cbi8qXG4gKiBXcmFwcyBzZWxlY3RlZCB0ZXh0XG4gKiBpbiBhIDxwcmU+PGNvZGU+IGJsb2NrXG4gKiAqL1xuZnVuY3Rpb24gY3JlYXRlQ29kZUJsb2NrKCkge1xuICB2YXIgc2VsZWN0ZWRIdG1sID0gZ2V0U2VsZWN0aW9uSHRtbCgpO1xuICB2YXIgbGFuZ3VhZ2UgPSAnamF2YXNjcmlwdCc7XG4gIHZhciBjb2RlID0gaGxqcy5oaWdobGlnaHQobGFuZ3VhZ2UsIHNlbGVjdGVkSHRtbCkudmFsdWU7XG4gIGNvZGUgPSAnPHByZT48Y29kZT4nICsgY29kZSArICc8L2NvZGU+PC9wcmU+JztcbiAgcmVwbGFjZVNlbGVjdGlvbldpdGhIdG1sKGNvZGUpO1xufVxuXG4vKlxuICogU2V0IHRoZSBoZWFkaW5nIG9uIHRoZSBjdXJyZW50IHNlbGVjdGlvblxuICogKi9cbmZ1bmN0aW9uIHNldEZvbnRTaXplKCkge1xuICAvKmpzaGludCB2YWxpZHRoaXM6IHRydWUqL1xuICBpZiAodGhpcy52YWx1ZSA9PSAnbm9uZScpIHJldHVybjtcbiAgdmFyIHNlbGVjdGlvbiA9IHdpbmRvdy5nZXRTZWxlY3Rpb24oKTtcbiAgdmFyIHJhbmdlID0gc2VsZWN0aW9uLmdldFJhbmdlQXQoMCk7XG4gIHZhciBwYXJlbnROb2RlID0gcmFuZ2Uuc3RhcnRDb250YWluZXIucGFyZW50Tm9kZTtcbiAgdmFyIGh0bWwgPSBwYXJlbnROb2RlLm91dGVySFRNTDtcbiAgdmFyIGNvbnRlbnQgPSByZW1vdmVUYWdzKC88XFwvP3NwYW4gPyhzdHlsZT1cImZvbnQtc2l6ZTpbMC05XXswLDJ9cHhcIikqPi9nLCBodG1sKTtcbiAgcmVwbGFjZVNlbGVjdGlvbldpdGhIdG1sKCc8c3BhbiBzdHlsZT1cImZvbnQtc2l6ZTonK3RoaXMudmFsdWUrJ1wiPicgKyBjb250ZW50ICsgJzwvc3Bhbj4nKTtcbiAgdGhpcy52YWx1ZSA9ICdub25lJztcbiAgY2xlYXJTZWxlY3Rpb24oKTtcblxufVxuXG5mdW5jdGlvbiBzZXRIZWFkaW5nVHlwZSgpIHtcbiAgICAvKmpzaGludCB2YWxpZHRoaXM6IHRydWUqL1xuICAgIGlmICh0aGlzLnZhbHVlID09ICdub25lJykgcmV0dXJuO1xuICAgIHZhciBzZWxlY3Rpb24gPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCk7XG4gICAgdmFyIHJhbmdlID0gc2VsZWN0aW9uLmdldFJhbmdlQXQoMCk7XG4gICAgdmFyIHBhcmVudE5vZGUgPSByYW5nZS5zdGFydENvbnRhaW5lci5wYXJlbnROb2RlO1xuICAgIHZhciBodG1sID0gcGFyZW50Tm9kZS5vdXRlckhUTUw7XG4gICAgdmFyIGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRoaXMudmFsdWUpO1xuICAgIHZhciBjb250ZW50ID0gcmVtb3ZlVGFncygvPFxcLz9oWzAtNl17MX0+L2csIGh0bWwpO1xuICAgIGVsZW1lbnQuaW5uZXJIVE1MID0gY29udGVudDtcbiAgICBwYXJlbnROb2RlLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKGVsZW1lbnQsIHBhcmVudE5vZGUpO1xuICAgIHRoaXMudmFsdWUgPSAnbm9uZSc7XG4gICAgY2xlYXJTZWxlY3Rpb24oKTtcbn1cblxuZnVuY3Rpb24gcmVtb3ZlVGFncyhyZWdleCwgc3RyaW5nKSB7XG4gICAgcmV0dXJuIHN0cmluZy5yZXBsYWNlKHJlZ2V4LCAnJyk7XG59XG5cbmZ1bmN0aW9uIHNldENvbG9yKCkge1xuICAvKmpzaGludCB2YWxpZHRoaXM6IHRydWUqL1xuICByZXBsYWNlU2VsZWN0aW9uV2l0aEh0bWwoJzxzcGFuIHN0eWxlPVwiY29sb3I6Jyt0aGlzLnZhbHVlKydcIj4nICsgZ2V0U2VsZWN0aW9uSHRtbCgpICsgJzwvc3Bhbj4nKTtcbiAgdGhpcy52YWx1ZSA9ICcjMDAwJztcbn1cblxuZnVuY3Rpb24gZ2V0U2VsZWN0aW9uSHRtbCgpIHtcbiAgICB2YXIgaHRtbCA9ICcnO1xuICAgIGlmICh0eXBlb2Ygd2luZG93LmdldFNlbGVjdGlvbiAhPSAndW5kZWZpbmVkJykge1xuICAgICAgICB2YXIgc2VsID0gd2luZG93LmdldFNlbGVjdGlvbigpO1xuICAgICAgICBpZiAoc2VsLnJhbmdlQ291bnQpIHtcbiAgICAgICAgICAgIHZhciBjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBzZWwucmFuZ2VDb3VudDsgaSA8IGxlbjsgKytpKSB7XG4gICAgICAgICAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHNlbC5nZXRSYW5nZUF0KGkpLmNsb25lQ29udGVudHMoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBodG1sID0gY29udGFpbmVyLmlubmVySFRNTDtcbiAgICAgICAgfVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIGRvY3VtZW50LnNlbGVjdGlvbiAhPSAndW5kZWZpbmVkJykge1xuICAgICAgICBpZiAoZG9jdW1lbnQuc2VsZWN0aW9uLnR5cGUgPT0gXCJUZXh0XCIpIHtcbiAgICAgICAgICAgIGh0bWwgPSBkb2N1bWVudC5zZWxlY3Rpb24uY3JlYXRlUmFuZ2UoKS5odG1sVGV4dDtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gaHRtbDtcbn1cblxuZnVuY3Rpb24gcmVwbGFjZVNlbGVjdGlvbldpdGhIdG1sKGh0bWwpIHtcbiAgICB2YXIgcmFuZ2U7XG4gICAgaWYgKHdpbmRvdy5nZXRTZWxlY3Rpb24gJiYgd2luZG93LmdldFNlbGVjdGlvbigpLmdldFJhbmdlQXQpIHtcbiAgICAgICAgcmFuZ2UgPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCkuZ2V0UmFuZ2VBdCgwKTtcbiAgICAgICAgcmFuZ2UuZGVsZXRlQ29udGVudHMoKTtcbiAgICAgICAgdmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIGRpdi5pbm5lckhUTUwgPSBodG1sO1xuICAgICAgICB2YXIgZnJhZyA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKSwgY2hpbGQ7XG4gICAgICAgIHdoaWxlICggKGNoaWxkID0gZGl2LmZpcnN0Q2hpbGQpICkge1xuICAgICAgICAgICAgZnJhZy5hcHBlbmRDaGlsZChjaGlsZCk7XG4gICAgICAgIH1cbiAgICAgICAgcmFuZ2UuaW5zZXJ0Tm9kZShmcmFnKTtcbiAgICB9IGVsc2UgaWYgKGRvY3VtZW50LnNlbGVjdGlvbiAmJiBkb2N1bWVudC5zZWxlY3Rpb24uY3JlYXRlUmFuZ2UpIHtcbiAgICAgICAgcmFuZ2UgPSBkb2N1bWVudC5zZWxlY3Rpb24uY3JlYXRlUmFuZ2UoKTtcbiAgICAgICAgaHRtbCA9IChub2RlLm5vZGVUeXBlID09IDMpID8gbm9kZS5kYXRhIDogbm9kZS5vdXRlckhUTUw7XG4gICAgICAgIHJhbmdlLnBhc3RlSFRNTChodG1sKTtcbiAgICB9XG59XG5cbi8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMzE2OTc4Ni9jbGVhci10ZXh0LXNlbGVjdGlvbi13aXRoLWphdmFzY3JpcHRcbmZ1bmN0aW9uIGNsZWFyU2VsZWN0aW9uKCkge1xuICAgIGlmICh3aW5kb3cuZ2V0U2VsZWN0aW9uKSB7XG4gICAgICAgIGlmICh3aW5kb3cuZ2V0U2VsZWN0aW9uKCkuZW1wdHkpIHsgIC8vIENocm9tZVxuICAgICAgICAgICAgd2luZG93LmdldFNlbGVjdGlvbigpLmVtcHR5KCk7XG4gICAgICAgIH0gZWxzZSBpZiAod2luZG93LmdldFNlbGVjdGlvbigpLnJlbW92ZUFsbFJhbmdlcykgeyAgLy8gRmlyZWZveFxuICAgICAgICAgICAgd2luZG93LmdldFNlbGVjdGlvbigpLnJlbW92ZUFsbFJhbmdlcygpO1xuICAgICAgICB9XG4gICAgfSBlbHNlIGlmIChkb2N1bWVudC5zZWxlY3Rpb24pIHsgIC8vIElFP1xuICAgICAgICBkb2N1bWVudC5zZWxlY3Rpb24uZW1wdHkoKTtcbiAgICB9XG59XG5cbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcG9pbnRlcihrZXkpIHtcblx0XG5cdHJldHVybiB7XG5cdFx0bGlzdGVuOiBmdW5jdGlvbiAoZWxlbWVudCkge1xuXHRcdFx0bGlzdGVuKGtleSwgZWxlbWVudCk7XG5cdFx0fVxuXHR9XG5cbn1cblxudmFyIHBlZXJKU0tleTtcblxuZnVuY3Rpb24gbGlzdGVuKGtleSwgZWxlbWVudCkge1xuXHRwZWVySlNLZXkgPSBrZXk7XG5cdGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBpbml0LCBmYWxzZSk7XG59XG5cbmZ1bmN0aW9uIGluaXQoZSkge1xuXHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdHZhciBwZWVyID0gbmV3IFBlZXIoe2tleTogcGVlckpTS2V5fSk7XG5cdHBlZXIub24oJ29wZW4nLCBmdW5jdGlvbihpZCkge1xuXHRcdGNvbnNvbGUubG9nKCdNeSBwZWVyIElEIGlzOiAnICsgaWQpO1xuXHR9KTtcblx0dmFyIGNvbm4gPSBwZWVyLmNvbm5lY3QocHJvbXB0KFwiUGhvbmUgcmVtb3RlIGlkXCIpKTtcblx0Y29ubi5vbignb3BlbicsIGZ1bmN0aW9uKCkge1xuXHQgIC8vIFJlY2VpdmUgbWVzc2FnZXNcblx0ICBjb25uLm9uKCdkYXRhJywgZnVuY3Rpb24oZGF0YSkge1xuXHQgICAgaWYgKGRhdGEgPT0gJ2xlZnQnKSBSZXZlYWwubGVmdCgpO1xuXHQgICAgaWYgKGRhdGEgPT0gJ3JpZ2h0JykgUmV2ZWFsLnJpZ2h0KCk7XG5cdCAgICBjb25zb2xlLmxvZygncmVjZWl2ZWQnLCBkYXRhKTtcblx0XHRjb25uLnNlbmQoe1xuXHRcdFx0dGl0bGU6IEFwcC50aXRsZSxcblx0XHRcdHNsaWRlOiBSZXZlYWwuZ2V0SW5kaWNlcygpLmhcblx0XHR9KTtcblx0ICB9KTtcblxuXHRcdGNvbm4uc2VuZCh7XG5cdFx0XHR0aXRsZTogQXBwLnRpdGxlLFxuXHRcdFx0c2xpZGU6IFJldmVhbC5nZXRJbmRpY2VzKCkuaFxuXHRcdH0pO1xuXHQgIC8vIFNlbmQgbWVzc2FnZXNcblx0fSk7XG59XG5cbiIsIi8qIGdsb2JhbHMgbW9kdWxlLCBfLCBBcHAgKi9cbid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGFkZExpc3RlbmVyczogZnVuY3Rpb24oaGFuZGxlcikge1xuICAgIGhhbmRsZXIucHJlc2VudGF0aW9uVGl0bGUuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBzZXRQcmVzZW50YXRpb25UaXRsZSwgZmFsc2UpO1xuICAgIGhhbmRsZXIudGhlbWVTZWxlY3Rvci5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBjaGFuZ2VUaGVtZSwgZmFsc2UpO1xuICAgIGhhbmRsZXIuaGlkZVNpZGVtZW51LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGlkZVNpZGVtZW51LCBmYWxzZSk7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNpZGVtZW51JykuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VvdmVyJywgc2hvd1NpZGVtZW51LCBmYWxzZSk7XG4gIH1cbn07XG5cbnZhciBpc1NsaWRpbmcgPSBmYWxzZTtcblxuZnVuY3Rpb24gY2hhbmdlVGhlbWUoKSB7XG4gIEFwcC50aGVtZSA9IHRoaXMudmFsdWU7XG4gIHZhciB0aGVtZXMgPSBbXG4gICAgJ2RlZmF1bHQuY3NzJywgJ25pZ2h0LmNzcycsICdiZWlnZS5jc3MnXG4gIF07XG4gIF8uZWFjaCh0aGVtZXMsIHJlbW92ZUNTUyk7XG4gIGFwcGVuZENTUyh0aGlzLnZhbHVlKTtcbn1cblxuZnVuY3Rpb24gYXBwZW5kQ1NTKHRoZW1lKSB7XG4gIHZhciBsaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGluaycpO1xuICBsaW5rLnJlbCA9ICdzdHlsZXNoZWV0JztcbiAgbGluay5ocmVmID0gJ2Nzcy8nICsgdGhlbWU7XG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2hlYWQnKS5hcHBlbmRDaGlsZChsaW5rKTtcbn1cblxuZnVuY3Rpb24gcmVtb3ZlQ1NTKHZhbCkge1xuICB2YXIgc2VsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignbGlua1tyZWw9c3R5bGVzaGVldF1baHJlZiQ9XCInK3ZhbCsnXCJdJyk7XG4gIGlmIChzZWwpIHtcbiAgICBzZWwucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzZWwpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGhpZGVTaWRlbWVudSgpIHtcbiAgdmFyIGVsID0gdGhpcy5wYXJlbnROb2RlO1xuICBlbC5zdHlsZS5tb3pUcmFuc2Zvcm0gPSAndHJhbnNsYXRlWCgtOTAlKSc7XG4gIGVsLnN0eWxlLndlYmtpdFRyYW5zZm9ybSA9ICd0cmFuc2xhdGVYKC05MCUpJztcbiAgZWwuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZVgoLTkwJSknO1xuICBpc1NsaWRpbmcgPSB0cnVlO1xuICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgaXNTbGlkaW5nID0gZmFsc2U7XG4gIH0sIDMwMCk7XG59XG5cbmZ1bmN0aW9uIHNob3dTaWRlbWVudSgpIHtcbiAgaWYgKGlzU2xpZGluZykge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgZWwgPSB0aGlzO1xuICBlbC5zdHlsZS5tb3pUcmFuc2Zvcm0gPSAndHJhbnNsYXRlWCgwKSc7XG4gIGVsLnN0eWxlLndlYmtpdFRyYW5zZm9ybSA9ICd0cmFuc2xhdGVYKDApJztcbiAgZWwuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZVgoMCknO1xufVxuXG5mdW5jdGlvbiBzZXRQcmVzZW50YXRpb25UaXRsZSgpIHtcbiAgdmFyIHZhbHVlID0gdGhpcy52YWx1ZTtcbiAgaWYgKHdpbmRvdy5fdGltZW91dCkge1xuICAgIGNsZWFySW50ZXJ2YWwod2luZG93Ll90aW1lb3V0KTtcbiAgICB3aW5kb3cuX3RpbWVvdXQgPSAwO1xuICB9XG4gIHdpbmRvdy5fdGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgZG9jdW1lbnQudGl0bGUgPSB2YWx1ZTtcbiAgICBBcHAudGl0bGUgPSB2YWx1ZTtcbiAgfSwgMzAwKTtcbn1cbiIsInZhciBhZGRMaXN0ZW5lcnMgPSBmdW5jdGlvbiAoYWRkRG93biwgYWRkUmlnaHQpIHtcblx0Ly8ganMtaGFuZGxlci0tYWRkLXNsaWRlLWRvd25cblx0Ly8ganMtaGFuZGxlci0tYWRkLXNsaWRlLXJpZ2h0XG5cblx0YWRkRG93bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHNsaWRlc0NvbnRyb2xsZXIuYWRkU2xpZGVEb3duLCAnZmFsc2UnKTtcblx0YWRkUmlnaHQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzbGlkZXNDb250cm9sbGVyLmFkZFNsaWRlUmlnaHQsICdmYWxzZScpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdGFkZExpc3RlbmVyczogYWRkTGlzdGVuZXJzXG59O1xuXG52YXIgc2xpZGVzQ29udHJvbGxlciA9IHtcbiAgc2xpZGVzUGFyZW50OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2xpZGVzJyksXG4gIGFkZFNsaWRlRG93bjogZnVuY3Rpb24oKSB7XG4gICAgLy8gdG8gYWRkIGEgc2xpZGUgZG93biB3ZSBtdXN0IGFkZCBhIHNlY3Rpb25cbiAgICAvLyBpbnNpZGUgdGhlIGN1cnJlbnQgc2xpZGUuXG4gICAgLy8gV2Ugc2VsZWN0IGl0IGFuZCB0aGUgc2VjdGlvbiBpbnNpZGVcbiAgICB2YXIgY3VycmVudFNsaWRlID0gc2xpZGVzQ29udHJvbGxlci5wcmVzZW50U2xpZGUoKTtcbiAgICB2YXIgY2hpbGRyZW4gPSBjdXJyZW50U2xpZGUucXVlcnlTZWxlY3Rvcignc2VjdGlvbicpO1xuICAgIGlmICghY2hpbGRyZW4pIHtcbiAgICAgIHZhciBwYXJlbnRTbGlkZSA9IHNsaWRlc0NvbnRyb2xsZXIubmV3U2xpZGUoKTtcbiAgICAgIHZhciBzbGlkZTEgPSBzbGlkZXNDb250cm9sbGVyLm5ld1NsaWRlKCk7XG4gICAgICB2YXIgc2xpZGUyID0gc2xpZGVzQ29udHJvbGxlci5uZXdTbGlkZSgpO1xuICAgICAgc2xpZGUxLmlubmVySFRNTCA9IGN1cnJlbnRTbGlkZS5pbm5lckhUTUw7XG4gICAgICBwYXJlbnRTbGlkZS5pbm5lckhUTUwgPSAnJztcbiAgICAgIHBhcmVudFNsaWRlLmFwcGVuZENoaWxkKHNsaWRlMSk7XG4gICAgICBwYXJlbnRTbGlkZS5hcHBlbmRDaGlsZChzbGlkZTIpO1xuICAgICAgY3VycmVudFNsaWRlLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKHBhcmVudFNsaWRlLCBjdXJyZW50U2xpZGUpO1xuICAgICAgUmV2ZWFsLnRvZ2dsZU92ZXJ2aWV3KCk7XG4gICAgICBSZXZlYWwudG9nZ2xlT3ZlcnZpZXcoKTtcbiAgICAgIFJldmVhbC5kb3duKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBzbGlkZSA9IHNsaWRlc0NvbnRyb2xsZXIubmV3U2xpZGUoKTtcbiAgICAgIGN1cnJlbnRTbGlkZS5hcHBlbmRDaGlsZChzbGlkZSk7XG4gICAgICBSZXZlYWwudG9nZ2xlT3ZlcnZpZXcoKTtcbiAgICAgIFJldmVhbC50b2dnbGVPdmVydmlldygpO1xuICAgICAgUmV2ZWFsLmRvd24oKTtcbiAgICB9XG4gIH0sXG4gIGFkZFNsaWRlUmlnaHQ6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzbGlkZSA9IHNsaWRlc0NvbnRyb2xsZXIubmV3U2xpZGUoKTtcbiAgICBzbGlkZXNDb250cm9sbGVyLnNsaWRlc1BhcmVudC5hcHBlbmRDaGlsZChzbGlkZSk7XG4gICAgUmV2ZWFsLnJpZ2h0KCk7XG4gIH0sXG4gIHByZXNlbnRTbGlkZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5wcmVzZW50Jyk7XG4gIH0sXG4gIG5ld1NsaWRlOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2xpZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzZWN0aW9uJyk7XG4gICAgc2xpZGUuaW5uZXJIVE1MID0gJzxoMz5BZGQgeW91ciBjb250ZW50IGhlcmU8L2gzPic7XG4gICAgc2xpZGUuc2V0QXR0cmlidXRlKCdjb250ZW50RWRpdGFibGUnLCB0cnVlKTtcbiAgICByZXR1cm4gc2xpZGU7XG4gIH1cbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciB0b3VySGFuZGxlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1oYW5kbGVyLS1yZXN0YXJ0LXRvdXInKTtcblxuICAgIHRvdXJIYW5kbGVyLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgcmVzdGFydFRvdXIsIGZhbHNlKTtcblxuICAgIHZhciB0b3VyID0gbmV3IFNoZXBoZXJkLlRvdXIoe1xuICAgICAgICBkZWZhdWx0czoge1xuICAgICAgICAgICAgY2xhc3NlczogJ3NoZXBoZXJkLXRoZW1lLWFycm93cycsXG4gICAgICAgICAgICBzY3JvbGxUbzogZmFsc2VcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgdG91ci5hZGRTdGVwKCdpbnRybycsIHtcbiAgICAgICAgdGV4dDogJ1RoaXMgaXMgYSBndWlkZWQgaW50cm9kdWN0aW9uIHRvIEtyZWF0b3IuanMgPGJyPiBJdCB3aWxsIHNob3cgeW91IGhvdyB0byBjb250cm9sIGFuZCBzdHlsZSB0aGUgY29udGVudCA8YnI+IFlvdSBjYW4gY2FuY2VsIGlmIHlvdSBrbm93IHdoYXQgdG8gZG8gb3IgY2xpY2sgc3RhcnQgPGJyPicsXG4gICAgICAgIGJ1dHRvbnM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0ZXh0OiAnQ2FuY2VsJyxcbiAgICAgICAgICAgICAgICBhY3Rpb246IGZpbmlzaFRvdXJcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGV4dDogJ1N0YXJ0JyxcbiAgICAgICAgICAgICAgICBhY3Rpb246IHRvdXIubmV4dFxuICAgICAgICAgICAgfVxuICAgICAgICBdXG4gICAgfSlcblxuICAgIHRvdXIuYWRkU3RlcCgnZXhhbXBsZS1zdGVwJywge1xuICAgICAgICB0ZXh0OiAnVGhpcyBpcyB0aGUgbWFpbiBjb250cm9sIGZvciB0aGUgY29udGVudCcsXG4gICAgICAgIGF0dGFjaFRvOiAnLnRvcG1lbnUnLFxuICAgICAgICBidXR0b25zOiBbe1xuICAgICAgICAgICAgdGV4dDogJ05leHQnLFxuICAgICAgICAgICAgYWN0aW9uOiB0b3VyLm5leHRcbiAgICAgICAgfV0sXG4gICAgICAgIHRldGhlck9wdGlvbnM6IHtcbiAgICAgICAgICAgIGF0dGFjaG1lbnQ6ICdib3R0b20gY2VudGVyJyxcbiAgICAgICAgICAgIHRhcmdldEF0dGFjaG1lbnQ6ICd0b3AgY2VudGVyJ1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICB0b3VyLmFkZFN0ZXAoJ2V4YW1wbGUtc3RlcCcsIHtcbiAgICAgICAgdGV4dDogJ1NldCB0aGUgdGV4dCB0byBib2xkLCBpdGFsaWMgb3IgdW5kZXJsaW5lZCcsXG4gICAgICAgIGF0dGFjaFRvOiAnLmpzLWhhbmRsZXItLXN0eWxlLWJ1dHRvbicsXG4gICAgICAgIHRldGhlck9wdGlvbnM6IHtcbiAgICAgICAgICAgIGF0dGFjaG1lbnQ6ICdib3R0b20gbGVmdCcsXG4gICAgICAgICAgICB0YXJnZXRBdHRhY2htZW50OiAndG9wIGxlZnQnXG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHRvdXIuYWRkU3RlcCgnZXhhbXBsZS1zdGVwJywge1xuICAgICAgICB0ZXh0OiAnTWFrZSBhIGJ1bGxldCBsaXN0JyxcbiAgICAgICAgYXR0YWNoVG86ICcuanMtaGFuZGxlci0tbGlzdC1idXR0b24nLFxuICAgICAgICB0ZXRoZXJPcHRpb25zOiB7XG4gICAgICAgICAgICBhdHRhY2htZW50OiAnYm90dG9tIGxlZnQnLFxuICAgICAgICAgICAgdGFyZ2V0QXR0YWNobWVudDogJ3RvcCBsZWZ0J1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICB0b3VyLmFkZFN0ZXAoJ2V4YW1wbGUtc3RlcCcsIHtcbiAgICAgICAgdGV4dDogJ0FsaWduIGxlZnQsIGNlbnRlciBvciByaWdodCAgJyxcbiAgICAgICAgYXR0YWNoVG86ICcuanMtaGFuZGxlci0tYWxpZ24nLFxuICAgICAgICB0ZXRoZXJPcHRpb25zOiB7XG4gICAgICAgICAgICBhdHRhY2htZW50OiAnYm90dG9tIGxlZnQnLFxuICAgICAgICAgICAgdGFyZ2V0QXR0YWNobWVudDogJ3RvcCBsZWZ0J1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICB0b3VyLmFkZFN0ZXAoJ2V4YW1wbGUtc3RlcCcsIHtcbiAgICAgICAgdGV4dDogJ0FsaWduIGxlZnQsIGNlbnRlciBvciByaWdodCcsXG4gICAgICAgIGF0dGFjaFRvOiAnLmpzLWhhbmRsZXItLWFsaWduJyxcbiAgICAgICAgdGV0aGVyT3B0aW9uczoge1xuICAgICAgICAgICAgYXR0YWNobWVudDogJ2JvdHRvbSBsZWZ0JyxcbiAgICAgICAgICAgIHRhcmdldEF0dGFjaG1lbnQ6ICd0b3AgbGVmdCdcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgdG91ci5hZGRTdGVwKCdleGFtcGxlLXN0ZXAnLCB7XG4gICAgICAgIHRleHQ6ICdTZXQgdGhlIHRleHQgY29sb3InLFxuICAgICAgICBhdHRhY2hUbzogJy5qcy1oYW5kbGVyLS1jb2xvcicsXG4gICAgICAgIHRldGhlck9wdGlvbnM6IHtcbiAgICAgICAgICAgIGF0dGFjaG1lbnQ6ICdib3R0b20gbGVmdCcsXG4gICAgICAgICAgICB0YXJnZXRBdHRhY2htZW50OiAndG9wIGxlZnQnXG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHRvdXIuYWRkU3RlcCgnZXhhbXBsZS1zdGVwJywge1xuICAgICAgICB0ZXh0OiAnQWRkIHNsaWRlJyxcbiAgICAgICAgYXR0YWNoVG86ICcuanMtaGFuZGxlci0tYWRkLXNsaWRlLXJpZ2h0JyxcbiAgICAgICAgdGV0aGVyT3B0aW9uczoge1xuICAgICAgICAgICAgYXR0YWNobWVudDogJ3RvcCBsZWZ0JyxcbiAgICAgICAgICAgIHRhcmdldEF0dGFjaG1lbnQ6ICd0b3AgcmlnaHQnXG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHRvdXIuYWRkU3RlcCgnZXhhbXBsZS1zdGVwJywge1xuICAgICAgICB0ZXh0OiAnUHJlc2VudGF0aW9uIG5hbWUnLFxuICAgICAgICBhdHRhY2hUbzogJy5qcy1oYW5kbGVyLS1wcmVzZW50YXRpb24tbmFtZScsXG4gICAgICAgIHRldGhlck9wdGlvbnM6IHtcbiAgICAgICAgICAgIGF0dGFjaG1lbnQ6ICd0b3AgcmlnaHQnLFxuICAgICAgICAgICAgdGFyZ2V0QXR0YWNobWVudDogJ3RvcCBsZWZ0J1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICB0b3VyLmFkZFN0ZXAoJ2V4YW1wbGUtc3RlcCcsIHtcbiAgICAgICAgdGV4dDogJ0NoYW5nZSB0aGUgdGhlbWUnLFxuICAgICAgICBhdHRhY2hUbzogJy5qcy1oYW5kbGVyLS10aGVtZS1zZWxlY3RvcicsXG4gICAgICAgIHRldGhlck9wdGlvbnM6IHtcbiAgICAgICAgICAgIGF0dGFjaG1lbnQ6ICd0b3AgcmlnaHQnLFxuICAgICAgICAgICAgdGFyZ2V0QXR0YWNobWVudDogJ3RvcCBsZWZ0J1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICB0b3VyLmFkZFN0ZXAoJ2V4YW1wbGUtc3RlcCcsIHtcbiAgICAgICAgdGV4dDogJ0Rvd25sb2FkIHdoZW4geW91IGFyZSBhbGwgZG9uZScsXG4gICAgICAgIGF0dGFjaFRvOiAnLmpzLWhhbmRsZXItLWRvd25sb2FkJyxcbiAgICAgICAgdGV0aGVyT3B0aW9uczoge1xuICAgICAgICAgICAgYXR0YWNobWVudDogJ3RvcCByaWdodCcsXG4gICAgICAgICAgICB0YXJnZXRBdHRhY2htZW50OiAndG9wIGxlZnQnXG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHRvdXIuYWRkU3RlcCgnZXhhbXBsZS1zdGVwJywge1xuICAgICAgICB0ZXh0OiAnVGhhdCBpcyBhbGwuIEkgaG9wZSB5b3UgbWFrZSBhIGdyZWF0IHByZXNlbnRhdGlvbiEnLFxuICAgICAgICBidXR0b25zOiBbe1xuICAgICAgICAgICAgJ3RleHQnOiAnU3RhcnQgd3JpdGluZycsXG4gICAgICAgICAgICBhY3Rpb246IGZpbmlzaFRvdXJcbiAgICAgICAgfV1cbiAgICB9KTtcblxuICAgIGlmICghbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3RvdXInKSkgdG91ci5zdGFydCgpO1xuXG4gICAgZnVuY3Rpb24gZmluaXNoVG91cigpIHtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3RvdXInLCAnY29tcGxldGUnKTtcbiAgICAgICAgdG91ci5oaWRlKCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVzdGFydFRvdXIoKSB7XG4gICAgICAgIHRvdXIuc3RhcnQoKTtcbiAgICB9XG59XG4iXX0=
