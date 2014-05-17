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
    quillEditor: document.querySelectorAll('.slide-edit-lock'),
    addSlideButtons: document.querySelectorAll('.add-slide')
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
    _.each(handler.addSlideButtons, function(el) {
      el.addEventListener('click', updateQuillEditorListeners, false);
    });
  }
};

// add new event listeners to the edit button
// of newly created slides
function updateQuillEditorListeners() {
  _.each(document.querySelectorAll('.slide-edit-lock'), function (el) {
    el.addEventListener('click', enableQuillEditor, false);
  });
}

// the .present HTML class selector could be present on
// vertical stacks of slides and we don't want that
function getCurrentSlide() {
  return document.querySelector('.present:not(.stack)');
}

var editor = new Quill('#editor div', {
  modules: {
    'toolbar': {container: document.querySelector('#topmenu')}
  },
  theme: 'snow'
});
var editorElem = document.querySelector('#editor');

function enableQuillEditor () {

  var target      = getCurrentSlide();
  var html        = target.querySelector('.kreator-slide-content').innerHTML || 'write your content here';

  this.classList.toggle('active');
  editorElem.classList.toggle('hidden');
  toggleMenu();
  if (this.classList.contains('active')) {
    if (html) editor.setHTML(html);
  } else {
    target.querySelector('.kreator-slide-content').innerHTML = editor.getHTML();
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

function removeTags(regex, string) {
    return string.replace(regex, '');
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
/* globals module, document, Reveal */

var addListeners = function (addDown, addRight) {
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
      var parentSlide = slidesController.newSection();
      var slide1 = slidesController.newSlide('', true);
      var slide2 = slidesController.newSlide();
      parentSlide.appendChild(slide1);
      parentSlide.appendChild(slide2);
      currentSlide.parentNode.replaceChild(parentSlide, currentSlide);
      Reveal.toggleOverview(); // FIXME
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
  newSlide: function(content, clone) { // the new slide is a clone of the current one
    var slide = document.querySelector('.present:not(.stack)').cloneNode(true);
    if (clone) {
      return slide;
    } else {
      var content = slide.querySelector('.kreator-slide-content');
      content.innerHTML = '';
      return slide;
    }
  },
  newSection: function(content) {
    var slide = document.createElement('section');
    slide.innerHTML = content || '';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwibGliL2tyZWF0b3ItZG93bmxvYWQuanMiLCJsaWIva3JlYXRvci5qcyIsImxpYi9tYWluLmpzIiwibGliL21lbnUtY29udHJvbGxlci5qcyIsImxpYi9wb2ludGVyLmpzIiwibGliL3NpZGVtZW51LWNvbnRyb2xsZXIuanMiLCJsaWIvc2xpZGUtY29udHJvbGxlci5qcyIsImxpYi90b3VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBhZGRMaXN0ZW5lcjogZnVuY3Rpb24oZWwpIHtcbiAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGRvd25sb2FkU2xpZGVzLCBmYWxzZSk7XG4gIH1cbn07XG5cbnZhciBwYXJ0cyA9IFt7XG4gIG5hbWU6ICdoZWFkLmh0bWwnLFxuICBwYXRoOiAnJ1xufSwge1xuICBuYW1lOiAndGFpbC5odG1sJyxcbiAgcGF0aDogJydcbn0sIHtcbiAgbmFtZTogJ2RlZmF1bHQuY3NzJyxcbiAgcGF0aDogJ2Nzcydcbn0sIHtcbiAgbmFtZTogJ3plbmJ1cm4uY3NzJyxcbiAgcGF0aDogJ2xpYi9jc3MnXG59LCB7XG4gIG5hbWU6ICdoZWFkLm1pbi5qcycsXG4gIHBhdGg6ICdsaWIvanMnXG59LCB7XG4gIG5hbWU6ICdyZXZlYWwuanMnLFxuICBwYXRoOiAnanMnXG59LCB7XG4gIG5hbWU6ICdtYWluLmNzcycsXG4gIHBhdGg6ICdjc3MnXG59LCB7XG4gIG5hbWU6ICd6ZW5idXJuLmNzcycsXG4gIHBhdGg6ICdjc3MnXG59LCB7XG4gIG5hbWU6ICdwcmludC5jc3MnLFxuICBwYXRoOiAnY3NzJ1xufSwge1xuICBuYW1lOiAnY2xhc3NMaXN0LmpzJyxcbiAgcGF0aDogJ2xpYi9qcydcbn0sIHtcbiAgbmFtZTogJ2hpZ2hsaWdodC5qcycsXG4gIHBhdGg6ICdsaWIvanMnXG59LCB7XG4gIG5hbWU6ICdza3kuY3NzJyxcbiAgcGF0aDogJ2Nzcydcbn0sIHtcbiAgbmFtZTogJ25pZ2h0LmNzcycsXG4gIHBhdGg6ICdjc3MnXG59LCB7XG4gIG5hbWU6ICdiZWlnZS5jc3MnLFxuICBwYXRoOiAnY3NzJ1xufV07XG5cbmZ1bmN0aW9uIGRvd25sb2FkU2xpZGVzKCkge1xuICB2YXIgY29udGVudCA9IFtdO1xuICB2YXIgdXJsID0gbG9jYXRpb24ub3JpZ2luICsgJy9rcmVhdG9yLmpzL2Rvd25sb2FkLyc7XG4gIGlmIChsb2NhdGlvbi5vcmlnaW4ubWF0Y2goJ2xvY2FsaG9zdCcpKSB7IC8vIHdlIGFyZSBydW5uaW5nIGluIGRldmVsb3BtZW50XG4gICAgY29uc29sZS5pbmZvKCdEZXZlbG9wbWVudCBtb2RlJyk7XG4gICAgdXJsID0gbG9jYXRpb24ub3JpZ2luICsgJy9kb3dubG9hZC8nO1xuICAgIGNvbnNvbGUuaW5mbygnRG93bmxvYWQgVVJMIHBvaW50cyB0byAnICsgdXJsKTtcbiAgfVxuICB2YXIgbCA9IHBhcnRzLmxlbmd0aDtcbiAgdmFyIGZvbGRlcnMgPSBwYXJ0cy5tYXAoZnVuY3Rpb24ocCkge1xuICAgIHJldHVybiBwLnBhdGg7XG4gIH0pO1xuICBwYXJ0cy5tYXAoZnVuY3Rpb24ocCkge1xuICAgIHJldHVybiB1cmwgKyBwLm5hbWU7XG4gIH0pLmZvckVhY2goZnVuY3Rpb24odXJsLCBpZHgpIHtcbiAgICByZXF1ZXN0UGFydCh1cmwpXG4gICAgICAudGhlbihmdW5jdGlvbiAocmVzcCkge1xuICAgICAgICBjb250ZW50W2lkeF0gPSByZXNwO1xuICAgICAgICBpZiAoLS1sID09PSAwKSB7XG4gICAgICAgICAgY3JlYXRlWmlwKGNvbnRlbnQsIGZvbGRlcnMpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgfSk7XG59XG5cbi8qXG4gKiBUb2dnbGUgb24gYW5kIG9mZiB0aGUgY29udGVudEVkaXRhYmxlXG4gKiBhdHRyaWJ1dGUgb24gdGhlIHNsaWRlc1xuICogKi9cbmZ1bmN0aW9uIHRvZ2dsZUVkaXRNb2RlKG1vZGUpIHtcbiAgdmFyIHNsaWRlcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ3NlY3Rpb24nKTtcbiAgXy5lYWNoKHNsaWRlcywgZnVuY3Rpb24ocykge1xuICAgIHMuc2V0QXR0cmlidXRlKCdjb250ZW50RWRpdGFibGUnLCBtb2RlKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVppcChjb250ZW50LCBmb2xkZXJzKSB7XG4gIHRvZ2dsZUVkaXRNb2RlKGZhbHNlKTtcbiAgY29udGVudFswXSA9IGNvbnRlbnRbMF0ucmVwbGFjZSgvZGVmYXVsdC5jc3MvZywgQXBwLnRoZW1lKTtcbiAgdmFyIHNsaWRlcyA9ICc8ZGl2IGNsYXNzPVwicmV2ZWFsXCI+PGRpdiBjbGFzcz1cInNsaWRlc1wiPicgK1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zbGlkZXMnKS5pbm5lckhUTUwgK1xuICAgICAgICAgICAgICAgICc8L2Rpdj48L2Rpdj4nO1xuICB2YXIgaW5kZXggPSBjb250ZW50LnNwbGljZSgwLDIpO1xuICB2YXIgemlwID0gbmV3IEpTWmlwKCk7XG4gIGluZGV4LnNwbGljZSgxLCAwLCBzbGlkZXMpO1xuICBpbmRleCA9IGluZGV4LmpvaW4oJycpO1xuICBpbmRleC5yZXBsYWNlKC88dGl0bGU+Lio8XFwvdGl0bGU+L2csICc8dGl0bGU+JyArIEFwcC50aXRsZSArICc8L3RpdGxlPicpO1xuICB6aXAuZmlsZSgnaW5kZXguaHRtbCcsIGluZGV4KTtcblxuICBmb3IgKHZhciBpID0gMjsgaSA8IGZvbGRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgZm9sZGVyID0gemlwLmZvbGRlcihmb2xkZXJzW2ldKTtcbiAgICBmb2xkZXIuZmlsZShwYXJ0c1tpXS5uYW1lLCBjb250ZW50W2kgLSAyXSk7XG4gIH1cblxuICBjb250ZW50ID0gemlwLmdlbmVyYXRlKHt0eXBlOiAnYmxvYid9KTtcbiAgdmFyIGxpbmsgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtaGFuZGxlci0tZG93bmxvYWQtcmVhZHknKTtcbiAgbGluay5ocmVmID0gd2luZG93LlVSTC5jcmVhdGVPYmplY3RVUkwoY29udGVudCk7XG4gIGxpbmsuaW5uZXJIVE1MID0gJ1ByZXNlbnRhdGlvbiByZWFkeS4gQ2xpY2sgaGVyZSB0byBkb3dubG9hZCc7XG4gIGxpbmsuZG93bmxvYWQgPSAnWW91clByZXNlbnRhdGlvbi56aXAnO1xuICB0b2dnbGVFZGl0TW9kZSh0cnVlKTtcbn1cblxuZnVuY3Rpb24gcmVxdWVzdFBhcnQodXJsKSB7XG5cbiAgdmFyIHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgdmFyIGRlZmVycmVkID0gUS5kZWZlcigpO1xuXG4gIHJlcXVlc3Qub3BlbihcIkdFVFwiLCB1cmwsIHRydWUpO1xuICByZXF1ZXN0Lm9ubG9hZCA9IG9ubG9hZDtcbiAgcmVxdWVzdC5vbmVycm9yID0gb25lcnJvcjtcbiAgcmVxdWVzdC5zZW5kKCk7XG5cbiAgZnVuY3Rpb24gb25sb2FkKCkge1xuICAgIGlmIChyZXF1ZXN0LnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICBkZWZlcnJlZC5yZXNvbHZlKHJlcXVlc3QucmVzcG9uc2VUZXh0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGVmZXJyZWQucmVqZWN0KG5ldyBFcnJvcihcIlN0YXR1cyBjb2RlOiBcIiArIHJlcXVlc3Quc3RhdHVzKSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gb25lcnJvcigpIHtcbiAgICBkZWZlcnJlZC5yZWplY3QobmV3IEVycm9yKFwiUmVxdWVzdCB0byBcIiArIHVybCArIFwiIGZhaWxlZFwiKSk7XG4gIH1cblxuICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbn1cbiIsInNsaWRlID0gcmVxdWlyZSgnLi9zbGlkZS1jb250cm9sbGVyJyk7XG5tZW51ID0gcmVxdWlyZSgnLi9tZW51LWNvbnRyb2xsZXInKTtcbmRvd25sb2FkID0gcmVxdWlyZSgnLi9rcmVhdG9yLWRvd25sb2FkJyk7XG5zaWRlbWVudSA9IHJlcXVpcmUoJy4vc2lkZW1lbnUtY29udHJvbGxlcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGtyZWF0b3IgKCkge1xuXG4gIHdpbmRvdy5BcHAgPSB7XG4gICAgdGl0bGU6ICdLcmVhdG9yLmpzJyxcbiAgICBhdXRob3I6ICdBbmRyZWkgT3ByZWEnLFxuICAgIHRoZW1lOiAnZGVmYXVsdC5jc3MnXG4gIH07XG5cblx0Ly8gRnVsbCBsaXN0IG9mIGNvbmZpZ3VyYXRpb24gb3B0aW9ucyBhdmFpbGFibGUgaGVyZTpcblx0Ly8gaHR0cHM6Ly9naXRodWIuY29tL2hha2ltZWwvcmV2ZWFsLmpzI2NvbmZpZ3VyYXRpb25cblx0UmV2ZWFsLmluaXRpYWxpemUoe1xuICAgIGNvbnRyb2xzOiB0cnVlLFxuXHRcdHByb2dyZXNzOiB0cnVlLFxuXHRcdGhpc3Rvcnk6IHRydWUsXG4gICAgY2VudGVyOiBmYWxzZSxcblxuXHRcdHRoZW1lOiBSZXZlYWwuZ2V0UXVlcnlIYXNoKCkudGhlbWUsIC8vIGF2YWlsYWJsZSB0aGVtZXMgYXJlIGluIC9jc3MvdGhlbWVcblx0XHR0cmFuc2l0aW9uOiBSZXZlYWwuZ2V0UXVlcnlIYXNoKCkudHJhbnNpdGlvbiB8fCAnZGVmYXVsdCcsIC8vIGRlZmF1bHQvY3ViZS9wYWdlL2NvbmNhdmUvem9vbS9saW5lYXIvZmFkZS9ub25lXG5cblx0XHQvLyBPcHRpb25hbCBsaWJyYXJpZXMgdXNlZCB0byBleHRlbmQgb24gcmV2ZWFsLmpzXG5cdFx0ZGVwZW5kZW5jaWVzOiBbXG5cdFx0XHR7IHNyYzogJ2xpYi9tYXJrZWQuanMnLCBjb25kaXRpb246IGZ1bmN0aW9uKCkgeyByZXR1cm4gISFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCAnW2RhdGEtbWFya2Rvd25dJyApOyB9IH0sXG5cdFx0XHR7IHNyYzogJ2xpYi9tYXJrZG93bi5qcycsIGNvbmRpdGlvbjogZnVuY3Rpb24oKSB7IHJldHVybiAhIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoICdbZGF0YS1tYXJrZG93bl0nICk7IH0gfSxcblx0XHRcdHsgc3JjOiAnbGliL2hpZ2hsaWdodC5qcycsIGFzeW5jOiB0cnVlLCBjYWxsYmFjazogZnVuY3Rpb24oKSB7IGhsanMuaW5pdEhpZ2hsaWdodGluZ09uTG9hZCgpOyB9IH1cblx0XHRdXG5cdH0pO1xuXG5cdHNsaWRlLmFkZExpc3RlbmVycyhkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtaGFuZGxlci0tYWRkLXNsaWRlLWRvd24nKSxcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWhhbmRsZXItLWFkZC1zbGlkZS1yaWdodCcpKTtcblxuICBtZW51LmFkZExpc3RlbmVycyh7XG4gICAgdXBsb2FkOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtaGFuZGxlci0tdXBsb2FkJyksXG4gICAgaGVhZGluZzogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWhhbmRsZXItLWhlYWRpbmdzJyksXG4gICAgY29sb3I6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1oYW5kbGVyLS1jb2xvcicpLFxuICAgIHN0eWxlQnV0dG9uczogZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLWhhbmRsZXItLXN0eWxlLWJ1dHRvbicpLFxuICAgIGFsaWdubWVudDogZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLWhhbmRsZXItLWFsaWduJyksXG4gICAgY29kZUJsb2NrOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtaGFuZGxlci0tY29kZS1ibG9jaycpLFxuICAgIG92ZXJ2aWV3OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtaGFuZGxlci0tb3ZlcnZpZXcnKSxcbiAgICBsaXN0QnV0dG9uOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtaGFuZGxlci0tbGlzdC1idXR0b24nKSxcbiAgICBoZWFkaW5nVHlwZTogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWhhbmRsZXItLWhlYWRpbmctdHlwZScpLFxuICAgIHF1aWxsRWRpdG9yOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuc2xpZGUtZWRpdC1sb2NrJyksXG4gICAgYWRkU2xpZGVCdXR0b25zOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuYWRkLXNsaWRlJylcbiAgfSk7XG5cbiAgc2lkZW1lbnUuYWRkTGlzdGVuZXJzKHtcbiAgICBwcmVzZW50YXRpb25UaXRsZTogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWhhbmRsZXItLXByZXNlbnRhdGlvbi1uYW1lJyksXG4gICAgdGhlbWVTZWxlY3RvcjogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWhhbmRsZXItLXRoZW1lLXNlbGVjdG9yJyksXG4gICAgaGlkZVNpZGVtZW51OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtaGFuZGxlci0taGlkZS1zaWRlbWVudScpXG4gIH0pO1xuXG4gIGRvd25sb2FkLmFkZExpc3RlbmVyKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1oYW5kbGVyLS1kb3dubG9hZCcpKTtcblxufTtcbiIsInZhciBrcmVhdG9yID0gcmVxdWlyZSgnLi9rcmVhdG9yLmpzJyk7XG52YXIgcG9pbnRlciA9IHJlcXVpcmUoJy4vcG9pbnRlci5qcycpKCdpbTI4OWNzczBieXBoa3Q5Jyk7XG52YXIgdG91ciAgICA9IHJlcXVpcmUoJy4vdG91ci5qcycpO1xuXG5rcmVhdG9yKCk7XG50b3VyKCk7XG5cbnBvaW50ZXIubGlzdGVuKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1oYW5kbGVyLS1pbml0LXJlbW90ZScpKTtcblxuIiwiLyogZ2xvYmFscyBtb2R1bGUsIF8sIFJldmVhbCwgd2luZG93LCBkb2N1bWVudCwgRmlsZVJlYWRlciwgYWxlcnQsIEltYWdlICovXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBhZGRMaXN0ZW5lcnM6IGZ1bmN0aW9uKGhhbmRsZXIpIHtcbiAgICBoYW5kbGVyLnVwbG9hZC5hZGRFdmVudExpc3RlbmVyKCdzdWJtaXQnLCB1cGxvYWRTbGlkZXMsIGZhbHNlKTtcbiAgICBfLmVhY2goaGFuZGxlci5hbGlnbm1lbnQsIGZ1bmN0aW9uKGVsKSB7XG4gICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRleHRBbGlnbm1lbnQsIGZhbHNlKTtcbiAgICB9KTtcbiAgICBfLmVhY2goaGFuZGxlci5vdmVydmlldywgZnVuY3Rpb24oZWwpIHtcbiAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHRvZ2dsZU1lc3NhZ2UoKTtcbiAgICAgICAgdG9nZ2xlTWVudSgpO1xuICAgICAgICBSZXZlYWwudG9nZ2xlT3ZlcnZpZXcoKTtcbiAgICAgIH0sIGZhbHNlKTtcbiAgICB9KTtcbiAgICBfLmVhY2goaGFuZGxlci5zdHlsZUJ1dHRvbnMsIGZ1bmN0aW9uIChlbCkge1xuICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzZXRGb250U3R5bGUsIGZhbHNlKTtcbiAgICB9KTtcbiAgICBfLmVhY2goaGFuZGxlci5xdWlsbEVkaXRvciwgZnVuY3Rpb24gKGVsKSB7XG4gICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGVuYWJsZVF1aWxsRWRpdG9yLCBmYWxzZSk7XG4gICAgfSk7XG4gICAgXy5lYWNoKGhhbmRsZXIuYWRkU2xpZGVCdXR0b25zLCBmdW5jdGlvbihlbCkge1xuICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB1cGRhdGVRdWlsbEVkaXRvckxpc3RlbmVycywgZmFsc2UpO1xuICAgIH0pO1xuICB9XG59O1xuXG4vLyBhZGQgbmV3IGV2ZW50IGxpc3RlbmVycyB0byB0aGUgZWRpdCBidXR0b25cbi8vIG9mIG5ld2x5IGNyZWF0ZWQgc2xpZGVzXG5mdW5jdGlvbiB1cGRhdGVRdWlsbEVkaXRvckxpc3RlbmVycygpIHtcbiAgXy5lYWNoKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5zbGlkZS1lZGl0LWxvY2snKSwgZnVuY3Rpb24gKGVsKSB7XG4gICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBlbmFibGVRdWlsbEVkaXRvciwgZmFsc2UpO1xuICB9KTtcbn1cblxuLy8gdGhlIC5wcmVzZW50IEhUTUwgY2xhc3Mgc2VsZWN0b3IgY291bGQgYmUgcHJlc2VudCBvblxuLy8gdmVydGljYWwgc3RhY2tzIG9mIHNsaWRlcyBhbmQgd2UgZG9uJ3Qgd2FudCB0aGF0XG5mdW5jdGlvbiBnZXRDdXJyZW50U2xpZGUoKSB7XG4gIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucHJlc2VudDpub3QoLnN0YWNrKScpO1xufVxuXG52YXIgZWRpdG9yID0gbmV3IFF1aWxsKCcjZWRpdG9yIGRpdicsIHtcbiAgbW9kdWxlczoge1xuICAgICd0b29sYmFyJzoge2NvbnRhaW5lcjogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3RvcG1lbnUnKX1cbiAgfSxcbiAgdGhlbWU6ICdzbm93J1xufSk7XG52YXIgZWRpdG9yRWxlbSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNlZGl0b3InKTtcblxuZnVuY3Rpb24gZW5hYmxlUXVpbGxFZGl0b3IgKCkge1xuXG4gIHZhciB0YXJnZXQgICAgICA9IGdldEN1cnJlbnRTbGlkZSgpO1xuICB2YXIgaHRtbCAgICAgICAgPSB0YXJnZXQucXVlcnlTZWxlY3RvcignLmtyZWF0b3Itc2xpZGUtY29udGVudCcpLmlubmVySFRNTCB8fCAnd3JpdGUgeW91ciBjb250ZW50IGhlcmUnO1xuXG4gIHRoaXMuY2xhc3NMaXN0LnRvZ2dsZSgnYWN0aXZlJyk7XG4gIGVkaXRvckVsZW0uY2xhc3NMaXN0LnRvZ2dsZSgnaGlkZGVuJyk7XG4gIHRvZ2dsZU1lbnUoKTtcbiAgaWYgKHRoaXMuY2xhc3NMaXN0LmNvbnRhaW5zKCdhY3RpdmUnKSkge1xuICAgIGlmIChodG1sKSBlZGl0b3Iuc2V0SFRNTChodG1sKTtcbiAgfSBlbHNlIHtcbiAgICB0YXJnZXQucXVlcnlTZWxlY3RvcignLmtyZWF0b3Itc2xpZGUtY29udGVudCcpLmlubmVySFRNTCA9IGVkaXRvci5nZXRIVE1MKCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gdG9nZ2xlTWVudSgpIHtcbiAgdG9nZ2xlKCcjdG9wbWVudScpO1xufVxuXG5mdW5jdGlvbiB0b2dnbGVNZXNzYWdlKCkge1xuICB0b2dnbGUoJyNtZXNzYWdlJyk7XG59XG5cbmZ1bmN0aW9uIHRvZ2dsZShzZWwpIHtcbiAgdmFyIGVsZW0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbCk7XG4gIGlmKGVsZW0uY2xhc3NMaXN0LmNvbnRhaW5zKCdoaWRkZW4nKSkge1xuICAgIGVsZW0uY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gZWxzZSB7XG4gICAgZWxlbS5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuLypcbiAqIEhhbmRsZSBmb3JtIHN1Ym1pdCBldmVudHNcbiAqIHJlYWRzIHRoZSBmaWxlIGFzIHRleHRcbiAqICovXG5mdW5jdGlvbiB1cGxvYWRTbGlkZXMoZSkge1xuICAvKmpzaGludCB2YWxpZHRoaXM6IHRydWUqL1xuICBlLnByZXZlbnREZWZhdWx0KCk7XG4gIHZhciBmaWxlID0gdGhpcy5xdWVyeVNlbGVjdG9yKCdpbnB1dFt0eXBlPWZpbGVdJykuZmlsZXNbMF07XG4gIGlmICh3aW5kb3cuRmlsZSAmJiB3aW5kb3cuRmlsZVJlYWRlciAmJiB3aW5kb3cuRmlsZUxpc3QgJiYgd2luZG93LkJsb2IpIHtcbiAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcblxuICAgIHJlYWRlci5vbmxvYWQgPSAoZnVuY3Rpb24oZmlsZSkge1xuICAgICAgcmV0dXJuIHBhcnNlRmlsZS5iaW5kKHRoaXMsIGZpbGUudHlwZSk7XG4gICAgfSkoZmlsZSk7XG5cbiAgICBpZiAoZmlsZS50eXBlLm1hdGNoKCd0ZXh0L2h0bWwnKSlcbiAgICAgIHJlYWRlci5yZWFkQXNUZXh0KGZpbGUsICd1dGY4Jyk7XG4gICAgZWxzZVxuICAgICAgcmVhZGVyLnJlYWRBc0RhdGFVUkwoZmlsZSk7XG4gIH0gZWxzZSB7XG4gICAgYWxlcnQoJ0ZpbGUgcmVhZGluZyBub3Qgc3VwcG9ydGVkJyk7XG4gIH1cbn1cblxuLypcbiAqIFJlY2VpdmVzIHRoZSB1cGxvYWRlZCBmaWxlXG4gKiBIYW5kbGUgdGV4dC9odG1sIGFuZCBpbWFnZXMvKiBkaWZmZXJlbnRseVxuICogKi9cbmZ1bmN0aW9uIHBhcnNlRmlsZShmaWxlVHlwZSwgZSkge1xuICB2YXIgY29udGVudCA9IGUudGFyZ2V0LnJlc3VsdDtcbiAgaWYgKGZpbGVUeXBlLm1hdGNoKCd0ZXh0L2h0bWwnKSkge1xuICAgIHZhciBkdW1teSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGR1bW15LmlubmVySFRNTCA9IGNvbnRlbnQ7XG4gICAgYXBwZW5kQ29udGVudChkdW1teS5xdWVyeVNlbGVjdG9yKCcuc2xpZGVzJykuaW5uZXJIVE1MKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgaW1nID0gbmV3IEltYWdlKCk7XG4gICAgaW1nLnNyYyA9IGUudGFyZ2V0LnJlc3VsdDtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucHJlc2VudCcpLmFwcGVuZENoaWxkKGltZyk7IC8vIEZJWE1FXG4gIH1cbn1cblxuLyogQXBwZW5kcyB0aGUgcGFyc2VkIGNvbnRlbnQgdG8gdGhlIHBhZ2VcbiAqIGNvbXBsZXRseSByZXBsYWNlcyB0aGUgb2xkIGNvbnRlbnRcbiAqICovXG5mdW5jdGlvbiBhcHBlbmRDb250ZW50KGNvbnRlbnQpIHtcbiAgdmFyIHNsaWRlcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zbGlkZXMnKTtcbiAgc2xpZGVzLmlubmVySFRNTCA9IGNvbnRlbnQ7XG4gIFJldmVhbC50b2dnbGVPdmVydmlldygpO1xuICBSZXZlYWwudG9nZ2xlT3ZlcnZpZXcoKTtcbiAgdG9nZ2xlRWRpdE1vZGUodHJ1ZSk7XG59XG5cbi8qXG4gKiBUb2dnbGUgb24gYW5kIG9mZiB0aGUgY29udGVudEVkaXRhYmxlXG4gKiBhdHRyaWJ1dGUgb24gdGhlIHNsaWRlc1xuICogKi9cbmZ1bmN0aW9uIHRvZ2dsZUVkaXRNb2RlKG1vZGUpIHtcbiAgdmFyIHNsaWRlcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ3NlY3Rpb24nKTtcbiAgXy5lYWNoKHNsaWRlcywgZnVuY3Rpb24ocykge1xuICAgIHMuc2V0QXR0cmlidXRlKCdjb250ZW50RWRpdGFibGUnLCBtb2RlKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZVRhZ3MocmVnZXgsIHN0cmluZykge1xuICAgIHJldHVybiBzdHJpbmcucmVwbGFjZShyZWdleCwgJycpO1xufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBwb2ludGVyKGtleSkge1xuXHRcblx0cmV0dXJuIHtcblx0XHRsaXN0ZW46IGZ1bmN0aW9uIChlbGVtZW50KSB7XG5cdFx0XHRsaXN0ZW4oa2V5LCBlbGVtZW50KTtcblx0XHR9XG5cdH1cblxufVxuXG52YXIgcGVlckpTS2V5O1xuXG5mdW5jdGlvbiBsaXN0ZW4oa2V5LCBlbGVtZW50KSB7XG5cdHBlZXJKU0tleSA9IGtleTtcblx0ZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGluaXQsIGZhbHNlKTtcbn1cblxuZnVuY3Rpb24gaW5pdChlKSB7XG5cdGUucHJldmVudERlZmF1bHQoKTtcblx0dmFyIHBlZXIgPSBuZXcgUGVlcih7a2V5OiBwZWVySlNLZXl9KTtcblx0cGVlci5vbignb3BlbicsIGZ1bmN0aW9uKGlkKSB7XG5cdFx0Y29uc29sZS5sb2coJ015IHBlZXIgSUQgaXM6ICcgKyBpZCk7XG5cdH0pO1xuXHR2YXIgY29ubiA9IHBlZXIuY29ubmVjdChwcm9tcHQoXCJQaG9uZSByZW1vdGUgaWRcIikpO1xuXHRjb25uLm9uKCdvcGVuJywgZnVuY3Rpb24oKSB7XG5cdCAgLy8gUmVjZWl2ZSBtZXNzYWdlc1xuXHQgIGNvbm4ub24oJ2RhdGEnLCBmdW5jdGlvbihkYXRhKSB7XG5cdCAgICBpZiAoZGF0YSA9PSAnbGVmdCcpIFJldmVhbC5sZWZ0KCk7XG5cdCAgICBpZiAoZGF0YSA9PSAncmlnaHQnKSBSZXZlYWwucmlnaHQoKTtcblx0ICAgIGNvbnNvbGUubG9nKCdyZWNlaXZlZCcsIGRhdGEpO1xuXHRcdGNvbm4uc2VuZCh7XG5cdFx0XHR0aXRsZTogQXBwLnRpdGxlLFxuXHRcdFx0c2xpZGU6IFJldmVhbC5nZXRJbmRpY2VzKCkuaFxuXHRcdH0pO1xuXHQgIH0pO1xuXG5cdFx0Y29ubi5zZW5kKHtcblx0XHRcdHRpdGxlOiBBcHAudGl0bGUsXG5cdFx0XHRzbGlkZTogUmV2ZWFsLmdldEluZGljZXMoKS5oXG5cdFx0fSk7XG5cdCAgLy8gU2VuZCBtZXNzYWdlc1xuXHR9KTtcbn1cblxuIiwiLyogZ2xvYmFscyBtb2R1bGUsIF8sIEFwcCAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgYWRkTGlzdGVuZXJzOiBmdW5jdGlvbihoYW5kbGVyKSB7XG4gICAgaGFuZGxlci5wcmVzZW50YXRpb25UaXRsZS5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIHNldFByZXNlbnRhdGlvblRpdGxlLCBmYWxzZSk7XG4gICAgaGFuZGxlci50aGVtZVNlbGVjdG9yLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGNoYW5nZVRoZW1lLCBmYWxzZSk7XG4gICAgaGFuZGxlci5oaWRlU2lkZW1lbnUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoaWRlU2lkZW1lbnUsIGZhbHNlKTtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2lkZW1lbnUnKS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW92ZXInLCBzaG93U2lkZW1lbnUsIGZhbHNlKTtcbiAgfVxufTtcblxudmFyIGlzU2xpZGluZyA9IGZhbHNlO1xuXG5mdW5jdGlvbiBjaGFuZ2VUaGVtZSgpIHtcbiAgQXBwLnRoZW1lID0gdGhpcy52YWx1ZTtcbiAgdmFyIHRoZW1lcyA9IFtcbiAgICAnZGVmYXVsdC5jc3MnLCAnbmlnaHQuY3NzJywgJ2JlaWdlLmNzcydcbiAgXTtcbiAgXy5lYWNoKHRoZW1lcywgcmVtb3ZlQ1NTKTtcbiAgYXBwZW5kQ1NTKHRoaXMudmFsdWUpO1xufVxuXG5mdW5jdGlvbiBhcHBlbmRDU1ModGhlbWUpIHtcbiAgdmFyIGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaW5rJyk7XG4gIGxpbmsucmVsID0gJ3N0eWxlc2hlZXQnO1xuICBsaW5rLmhyZWYgPSAnY3NzLycgKyB0aGVtZTtcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaGVhZCcpLmFwcGVuZENoaWxkKGxpbmspO1xufVxuXG5mdW5jdGlvbiByZW1vdmVDU1ModmFsKSB7XG4gIHZhciBzZWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdsaW5rW3JlbD1zdHlsZXNoZWV0XVtocmVmJD1cIicrdmFsKydcIl0nKTtcbiAgaWYgKHNlbCkge1xuICAgIHNlbC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHNlbCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gaGlkZVNpZGVtZW51KCkge1xuICB2YXIgZWwgPSB0aGlzLnBhcmVudE5vZGU7XG4gIGVsLnN0eWxlLm1velRyYW5zZm9ybSA9ICd0cmFuc2xhdGVYKC05MCUpJztcbiAgZWwuc3R5bGUud2Via2l0VHJhbnNmb3JtID0gJ3RyYW5zbGF0ZVgoLTkwJSknO1xuICBlbC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlWCgtOTAlKSc7XG4gIGlzU2xpZGluZyA9IHRydWU7XG4gIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICBpc1NsaWRpbmcgPSBmYWxzZTtcbiAgfSwgMzAwKTtcbn1cblxuZnVuY3Rpb24gc2hvd1NpZGVtZW51KCkge1xuICBpZiAoaXNTbGlkaW5nKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciBlbCA9IHRoaXM7XG4gIGVsLnN0eWxlLm1velRyYW5zZm9ybSA9ICd0cmFuc2xhdGVYKDApJztcbiAgZWwuc3R5bGUud2Via2l0VHJhbnNmb3JtID0gJ3RyYW5zbGF0ZVgoMCknO1xuICBlbC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlWCgwKSc7XG59XG5cbmZ1bmN0aW9uIHNldFByZXNlbnRhdGlvblRpdGxlKCkge1xuICB2YXIgdmFsdWUgPSB0aGlzLnZhbHVlO1xuICBpZiAod2luZG93Ll90aW1lb3V0KSB7XG4gICAgY2xlYXJJbnRlcnZhbCh3aW5kb3cuX3RpbWVvdXQpO1xuICAgIHdpbmRvdy5fdGltZW91dCA9IDA7XG4gIH1cbiAgd2luZG93Ll90aW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICBkb2N1bWVudC50aXRsZSA9IHZhbHVlO1xuICAgIEFwcC50aXRsZSA9IHZhbHVlO1xuICB9LCAzMDApO1xufVxuIiwiLyogZ2xvYmFscyBtb2R1bGUsIGRvY3VtZW50LCBSZXZlYWwgKi9cblxudmFyIGFkZExpc3RlbmVycyA9IGZ1bmN0aW9uIChhZGREb3duLCBhZGRSaWdodCkge1xuXHRhZGREb3duLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc2xpZGVzQ29udHJvbGxlci5hZGRTbGlkZURvd24sICdmYWxzZScpO1xuXHRhZGRSaWdodC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHNsaWRlc0NvbnRyb2xsZXIuYWRkU2xpZGVSaWdodCwgJ2ZhbHNlJyk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0YWRkTGlzdGVuZXJzOiBhZGRMaXN0ZW5lcnNcbn07XG5cbnZhciBzbGlkZXNDb250cm9sbGVyID0ge1xuICBzbGlkZXNQYXJlbnQ6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zbGlkZXMnKSxcbiAgYWRkU2xpZGVEb3duOiBmdW5jdGlvbigpIHtcbiAgICAvLyB0byBhZGQgYSBzbGlkZSBkb3duIHdlIG11c3QgYWRkIGEgc2VjdGlvblxuICAgIC8vIGluc2lkZSB0aGUgY3VycmVudCBzbGlkZS5cbiAgICAvLyBXZSBzZWxlY3QgaXQgYW5kIHRoZSBzZWN0aW9uIGluc2lkZVxuICAgIHZhciBjdXJyZW50U2xpZGUgPSBzbGlkZXNDb250cm9sbGVyLnByZXNlbnRTbGlkZSgpO1xuICAgIHZhciBjaGlsZHJlbiA9IGN1cnJlbnRTbGlkZS5xdWVyeVNlbGVjdG9yKCdzZWN0aW9uJyk7XG4gICAgaWYgKCFjaGlsZHJlbikge1xuICAgICAgdmFyIHBhcmVudFNsaWRlID0gc2xpZGVzQ29udHJvbGxlci5uZXdTZWN0aW9uKCk7XG4gICAgICB2YXIgc2xpZGUxID0gc2xpZGVzQ29udHJvbGxlci5uZXdTbGlkZSgnJywgdHJ1ZSk7XG4gICAgICB2YXIgc2xpZGUyID0gc2xpZGVzQ29udHJvbGxlci5uZXdTbGlkZSgpO1xuICAgICAgcGFyZW50U2xpZGUuYXBwZW5kQ2hpbGQoc2xpZGUxKTtcbiAgICAgIHBhcmVudFNsaWRlLmFwcGVuZENoaWxkKHNsaWRlMik7XG4gICAgICBjdXJyZW50U2xpZGUucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQocGFyZW50U2xpZGUsIGN1cnJlbnRTbGlkZSk7XG4gICAgICBSZXZlYWwudG9nZ2xlT3ZlcnZpZXcoKTsgLy8gRklYTUVcbiAgICAgIFJldmVhbC50b2dnbGVPdmVydmlldygpO1xuICAgICAgUmV2ZWFsLmRvd24oKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHNsaWRlID0gc2xpZGVzQ29udHJvbGxlci5uZXdTbGlkZSgpO1xuICAgICAgY3VycmVudFNsaWRlLmFwcGVuZENoaWxkKHNsaWRlKTtcbiAgICAgIFJldmVhbC50b2dnbGVPdmVydmlldygpO1xuICAgICAgUmV2ZWFsLnRvZ2dsZU92ZXJ2aWV3KCk7XG4gICAgICBSZXZlYWwuZG93bigpO1xuICAgIH1cbiAgfSxcbiAgYWRkU2xpZGVSaWdodDogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNsaWRlID0gc2xpZGVzQ29udHJvbGxlci5uZXdTbGlkZSgpO1xuICAgIHNsaWRlc0NvbnRyb2xsZXIuc2xpZGVzUGFyZW50LmFwcGVuZENoaWxkKHNsaWRlKTtcbiAgICBSZXZlYWwucmlnaHQoKTtcbiAgfSxcbiAgcHJlc2VudFNsaWRlOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnByZXNlbnQnKTtcbiAgfSxcbiAgbmV3U2xpZGU6IGZ1bmN0aW9uKGNvbnRlbnQsIGNsb25lKSB7IC8vIHRoZSBuZXcgc2xpZGUgaXMgYSBjbG9uZSBvZiB0aGUgY3VycmVudCBvbmVcbiAgICB2YXIgc2xpZGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucHJlc2VudDpub3QoLnN0YWNrKScpLmNsb25lTm9kZSh0cnVlKTtcbiAgICBpZiAoY2xvbmUpIHtcbiAgICAgIHJldHVybiBzbGlkZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGNvbnRlbnQgPSBzbGlkZS5xdWVyeVNlbGVjdG9yKCcua3JlYXRvci1zbGlkZS1jb250ZW50Jyk7XG4gICAgICBjb250ZW50LmlubmVySFRNTCA9ICcnO1xuICAgICAgcmV0dXJuIHNsaWRlO1xuICAgIH1cbiAgfSxcbiAgbmV3U2VjdGlvbjogZnVuY3Rpb24oY29udGVudCkge1xuICAgIHZhciBzbGlkZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NlY3Rpb24nKTtcbiAgICBzbGlkZS5pbm5lckhUTUwgPSBjb250ZW50IHx8ICcnO1xuICAgIHJldHVybiBzbGlkZTtcbiAgfVxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIHRvdXJIYW5kbGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWhhbmRsZXItLXJlc3RhcnQtdG91cicpO1xuXG4gICAgdG91ckhhbmRsZXIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCByZXN0YXJ0VG91ciwgZmFsc2UpO1xuXG4gICAgdmFyIHRvdXIgPSBuZXcgU2hlcGhlcmQuVG91cih7XG4gICAgICAgIGRlZmF1bHRzOiB7XG4gICAgICAgICAgICBjbGFzc2VzOiAnc2hlcGhlcmQtdGhlbWUtYXJyb3dzJyxcbiAgICAgICAgICAgIHNjcm9sbFRvOiBmYWxzZVxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICB0b3VyLmFkZFN0ZXAoJ2ludHJvJywge1xuICAgICAgICB0ZXh0OiAnVGhpcyBpcyBhIGd1aWRlZCBpbnRyb2R1Y3Rpb24gdG8gS3JlYXRvci5qcyA8YnI+IEl0IHdpbGwgc2hvdyB5b3UgaG93IHRvIGNvbnRyb2wgYW5kIHN0eWxlIHRoZSBjb250ZW50IDxicj4gWW91IGNhbiBjYW5jZWwgaWYgeW91IGtub3cgd2hhdCB0byBkbyBvciBjbGljayBzdGFydCA8YnI+JyxcbiAgICAgICAgYnV0dG9uczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRleHQ6ICdDYW5jZWwnLFxuICAgICAgICAgICAgICAgIGFjdGlvbjogZmluaXNoVG91clxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0ZXh0OiAnU3RhcnQnLFxuICAgICAgICAgICAgICAgIGFjdGlvbjogdG91ci5uZXh0XG4gICAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICB9KVxuXG4gICAgdG91ci5hZGRTdGVwKCdleGFtcGxlLXN0ZXAnLCB7XG4gICAgICAgIHRleHQ6ICdBZGQgc2xpZGUnLFxuICAgICAgICBhdHRhY2hUbzogJy5qcy1oYW5kbGVyLS1hZGQtc2xpZGUtcmlnaHQnLFxuICAgICAgICB0ZXRoZXJPcHRpb25zOiB7XG4gICAgICAgICAgICBhdHRhY2htZW50OiAndG9wIGxlZnQnLFxuICAgICAgICAgICAgdGFyZ2V0QXR0YWNobWVudDogJ3RvcCByaWdodCdcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgdG91ci5hZGRTdGVwKCdleGFtcGxlLXN0ZXAnLCB7XG4gICAgICAgIHRleHQ6ICdQcmVzZW50YXRpb24gbmFtZScsXG4gICAgICAgIGF0dGFjaFRvOiAnLmpzLWhhbmRsZXItLXByZXNlbnRhdGlvbi1uYW1lJyxcbiAgICAgICAgdGV0aGVyT3B0aW9uczoge1xuICAgICAgICAgICAgYXR0YWNobWVudDogJ3RvcCByaWdodCcsXG4gICAgICAgICAgICB0YXJnZXRBdHRhY2htZW50OiAndG9wIGxlZnQnXG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHRvdXIuYWRkU3RlcCgnZXhhbXBsZS1zdGVwJywge1xuICAgICAgICB0ZXh0OiAnQ2hhbmdlIHRoZSB0aGVtZScsXG4gICAgICAgIGF0dGFjaFRvOiAnLmpzLWhhbmRsZXItLXRoZW1lLXNlbGVjdG9yJyxcbiAgICAgICAgdGV0aGVyT3B0aW9uczoge1xuICAgICAgICAgICAgYXR0YWNobWVudDogJ3RvcCByaWdodCcsXG4gICAgICAgICAgICB0YXJnZXRBdHRhY2htZW50OiAndG9wIGxlZnQnXG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHRvdXIuYWRkU3RlcCgnZXhhbXBsZS1zdGVwJywge1xuICAgICAgICB0ZXh0OiAnRG93bmxvYWQgd2hlbiB5b3UgYXJlIGFsbCBkb25lJyxcbiAgICAgICAgYXR0YWNoVG86ICcuanMtaGFuZGxlci0tZG93bmxvYWQnLFxuICAgICAgICB0ZXRoZXJPcHRpb25zOiB7XG4gICAgICAgICAgICBhdHRhY2htZW50OiAndG9wIHJpZ2h0JyxcbiAgICAgICAgICAgIHRhcmdldEF0dGFjaG1lbnQ6ICd0b3AgbGVmdCdcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgdG91ci5hZGRTdGVwKCdleGFtcGxlLXN0ZXAnLCB7XG4gICAgICAgIHRleHQ6ICdUaGF0IGlzIGFsbC4gSSBob3BlIHlvdSBtYWtlIGEgZ3JlYXQgcHJlc2VudGF0aW9uIScsXG4gICAgICAgIGJ1dHRvbnM6IFt7XG4gICAgICAgICAgICAndGV4dCc6ICdTdGFydCB3cml0aW5nJyxcbiAgICAgICAgICAgIGFjdGlvbjogZmluaXNoVG91clxuICAgICAgICB9XVxuICAgIH0pO1xuXG4gICAgaWYgKCFsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndG91cicpKSB0b3VyLnN0YXJ0KCk7XG5cbiAgICBmdW5jdGlvbiBmaW5pc2hUb3VyKCkge1xuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgndG91cicsICdjb21wbGV0ZScpO1xuICAgICAgICB0b3VyLmhpZGUoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZXN0YXJ0VG91cigpIHtcbiAgICAgICAgdG91ci5zdGFydCgpO1xuICAgIH1cbn1cbiJdfQ==
