(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var kreator = require('./kreator.js');
var pointer = require('./pointer.js')('im289css0byphkt9');
var tour    = require('./tour.js');

kreator();
tour();

pointer.listen(document.querySelector('.js-handler--init-remote'));


},{"./kreator.js":3,"./pointer.js":5,"./tour.js":8}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
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

},{"./kreator-download":2,"./menu-controller":4,"./sidemenu-controller":6,"./slide-controller":7}],4:[function(require,module,exports){
/* globals module, _, Reveal, window, document, FileReader, alert, require, Image, Quill */
'use strict';

module.exports = {
  addListeners: function(handler) {
    handler.upload.addEventListener('submit', uploadSlides, false);
    _.each(handler.overview, function(el) {
      el.addEventListener('click', function() {
        toggleMessage();
        toggleMenu();
        Reveal.toggleOverview();
      }, false);
    });

    _.each(handler.quillEditor, function (el) {
      el.addEventListener('click', enableQuillEditor, false);
    });

    _.each(handler.addSlideButtons, function(el) {
      el.addEventListener('click', updateQuillEditorListeners, false);
    });

    // when the slide changes, either due to adding a new slide
    // or just switching view, we want to save any modified content
    Reveal.addEventListener('slidechanged', function() {
      commitChanges();
      toggleEditor();
      editingSlide = null;
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

var menu          = document.querySelector('#topmenu');
var editingSlide  = null;
var editorElem    = document.querySelector('#editor');
var editor        = new Quill('#editor div', {
  modules: {
    'toolbar': {container: document.querySelector('#topmenu')}
  },
  theme: 'snow'
});

function enableQuillEditor () {

  editingSlide = getCurrentSlide();
  var html     = editingSlide.querySelector('.kreator-slide-content').innerHTML || 'write your content here';

  toggleEditor();
  if (this.classList.contains('active')) {
    editor.setHTML(html);
  } else {
    commitChanges();
    editingSlide = null;
  }
}

function toggleEditor() {
  if (editingSlide) {
    var editBtn = editingSlide.querySelector('.slide-edit-lock');
    editBtn.classList.toggle('active');
    editorElem.classList.toggle('visually-hidden');
    menu.classList.toggle('visually-hidden');
  }
}

// save editor changes against the present slide
function commitChanges() {
  if (editingSlide) {
    editingSlide.querySelector('.kreator-slide-content').innerHTML = editor.getHTML();
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

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvbWFpbi5qcyIsImxpYi9rcmVhdG9yLWRvd25sb2FkLmpzIiwibGliL2tyZWF0b3IuanMiLCJsaWIvbWVudS1jb250cm9sbGVyLmpzIiwibGliL3BvaW50ZXIuanMiLCJsaWIvc2lkZW1lbnUtY29udHJvbGxlci5qcyIsImxpYi9zbGlkZS1jb250cm9sbGVyLmpzIiwibGliL3RvdXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIGtyZWF0b3IgPSByZXF1aXJlKCcuL2tyZWF0b3IuanMnKTtcbnZhciBwb2ludGVyID0gcmVxdWlyZSgnLi9wb2ludGVyLmpzJykoJ2ltMjg5Y3NzMGJ5cGhrdDknKTtcbnZhciB0b3VyICAgID0gcmVxdWlyZSgnLi90b3VyLmpzJyk7XG5cbmtyZWF0b3IoKTtcbnRvdXIoKTtcblxucG9pbnRlci5saXN0ZW4oZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWhhbmRsZXItLWluaXQtcmVtb3RlJykpO1xuXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgYWRkTGlzdGVuZXI6IGZ1bmN0aW9uKGVsKSB7XG4gICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBkb3dubG9hZFNsaWRlcywgZmFsc2UpO1xuICB9XG59O1xuXG52YXIgcGFydHMgPSBbe1xuICBuYW1lOiAnaGVhZC5odG1sJyxcbiAgcGF0aDogJydcbn0sIHtcbiAgbmFtZTogJ3RhaWwuaHRtbCcsXG4gIHBhdGg6ICcnXG59LCB7XG4gIG5hbWU6ICdkZWZhdWx0LmNzcycsXG4gIHBhdGg6ICdjc3MnXG59LCB7XG4gIG5hbWU6ICd6ZW5idXJuLmNzcycsXG4gIHBhdGg6ICdsaWIvY3NzJ1xufSwge1xuICBuYW1lOiAnaGVhZC5taW4uanMnLFxuICBwYXRoOiAnbGliL2pzJ1xufSwge1xuICBuYW1lOiAncmV2ZWFsLmpzJyxcbiAgcGF0aDogJ2pzJ1xufSwge1xuICBuYW1lOiAnbWFpbi5jc3MnLFxuICBwYXRoOiAnY3NzJ1xufSwge1xuICBuYW1lOiAnemVuYnVybi5jc3MnLFxuICBwYXRoOiAnY3NzJ1xufSwge1xuICBuYW1lOiAncHJpbnQuY3NzJyxcbiAgcGF0aDogJ2Nzcydcbn0sIHtcbiAgbmFtZTogJ2NsYXNzTGlzdC5qcycsXG4gIHBhdGg6ICdsaWIvanMnXG59LCB7XG4gIG5hbWU6ICdoaWdobGlnaHQuanMnLFxuICBwYXRoOiAnbGliL2pzJ1xufSwge1xuICBuYW1lOiAnc2t5LmNzcycsXG4gIHBhdGg6ICdjc3MnXG59LCB7XG4gIG5hbWU6ICduaWdodC5jc3MnLFxuICBwYXRoOiAnY3NzJ1xufSwge1xuICBuYW1lOiAnYmVpZ2UuY3NzJyxcbiAgcGF0aDogJ2Nzcydcbn1dO1xuXG5mdW5jdGlvbiBkb3dubG9hZFNsaWRlcygpIHtcbiAgdmFyIGNvbnRlbnQgPSBbXTtcbiAgdmFyIHVybCA9IGxvY2F0aW9uLm9yaWdpbiArICcva3JlYXRvci5qcy9kb3dubG9hZC8nO1xuICBpZiAobG9jYXRpb24ub3JpZ2luLm1hdGNoKCdsb2NhbGhvc3QnKSkgeyAvLyB3ZSBhcmUgcnVubmluZyBpbiBkZXZlbG9wbWVudFxuICAgIGNvbnNvbGUuaW5mbygnRGV2ZWxvcG1lbnQgbW9kZScpO1xuICAgIHVybCA9IGxvY2F0aW9uLm9yaWdpbiArICcvZG93bmxvYWQvJztcbiAgICBjb25zb2xlLmluZm8oJ0Rvd25sb2FkIFVSTCBwb2ludHMgdG8gJyArIHVybCk7XG4gIH1cbiAgdmFyIGwgPSBwYXJ0cy5sZW5ndGg7XG4gIHZhciBmb2xkZXJzID0gcGFydHMubWFwKGZ1bmN0aW9uKHApIHtcbiAgICByZXR1cm4gcC5wYXRoO1xuICB9KTtcbiAgcGFydHMubWFwKGZ1bmN0aW9uKHApIHtcbiAgICByZXR1cm4gdXJsICsgcC5uYW1lO1xuICB9KS5mb3JFYWNoKGZ1bmN0aW9uKHVybCwgaWR4KSB7XG4gICAgcmVxdWVzdFBhcnQodXJsKVxuICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlc3ApIHtcbiAgICAgICAgY29udGVudFtpZHhdID0gcmVzcDtcbiAgICAgICAgaWYgKC0tbCA9PT0gMCkge1xuICAgICAgICAgIGNyZWF0ZVppcChjb250ZW50LCBmb2xkZXJzKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gIH0pO1xufVxuXG4vKlxuICogVG9nZ2xlIG9uIGFuZCBvZmYgdGhlIGNvbnRlbnRFZGl0YWJsZVxuICogYXR0cmlidXRlIG9uIHRoZSBzbGlkZXNcbiAqICovXG5mdW5jdGlvbiB0b2dnbGVFZGl0TW9kZShtb2RlKSB7XG4gIHZhciBzbGlkZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdzZWN0aW9uJyk7XG4gIF8uZWFjaChzbGlkZXMsIGZ1bmN0aW9uKHMpIHtcbiAgICBzLnNldEF0dHJpYnV0ZSgnY29udGVudEVkaXRhYmxlJywgbW9kZSk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVaaXAoY29udGVudCwgZm9sZGVycykge1xuICB0b2dnbGVFZGl0TW9kZShmYWxzZSk7XG4gIGNvbnRlbnRbMF0gPSBjb250ZW50WzBdLnJlcGxhY2UoL2RlZmF1bHQuY3NzL2csIEFwcC50aGVtZSk7XG4gIHZhciBzbGlkZXMgPSAnPGRpdiBjbGFzcz1cInJldmVhbFwiPjxkaXYgY2xhc3M9XCJzbGlkZXNcIj4nICtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2xpZGVzJykuaW5uZXJIVE1MICtcbiAgICAgICAgICAgICAgICAnPC9kaXY+PC9kaXY+JztcbiAgdmFyIGluZGV4ID0gY29udGVudC5zcGxpY2UoMCwyKTtcbiAgdmFyIHppcCA9IG5ldyBKU1ppcCgpO1xuICBpbmRleC5zcGxpY2UoMSwgMCwgc2xpZGVzKTtcbiAgaW5kZXggPSBpbmRleC5qb2luKCcnKTtcbiAgaW5kZXgucmVwbGFjZSgvPHRpdGxlPi4qPFxcL3RpdGxlPi9nLCAnPHRpdGxlPicgKyBBcHAudGl0bGUgKyAnPC90aXRsZT4nKTtcbiAgemlwLmZpbGUoJ2luZGV4Lmh0bWwnLCBpbmRleCk7XG5cbiAgZm9yICh2YXIgaSA9IDI7IGkgPCBmb2xkZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGZvbGRlciA9IHppcC5mb2xkZXIoZm9sZGVyc1tpXSk7XG4gICAgZm9sZGVyLmZpbGUocGFydHNbaV0ubmFtZSwgY29udGVudFtpIC0gMl0pO1xuICB9XG5cbiAgY29udGVudCA9IHppcC5nZW5lcmF0ZSh7dHlwZTogJ2Jsb2InfSk7XG4gIHZhciBsaW5rID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWhhbmRsZXItLWRvd25sb2FkLXJlYWR5Jyk7XG4gIGxpbmsuaHJlZiA9IHdpbmRvdy5VUkwuY3JlYXRlT2JqZWN0VVJMKGNvbnRlbnQpO1xuICBsaW5rLmlubmVySFRNTCA9ICdQcmVzZW50YXRpb24gcmVhZHkuIENsaWNrIGhlcmUgdG8gZG93bmxvYWQnO1xuICBsaW5rLmRvd25sb2FkID0gJ1lvdXJQcmVzZW50YXRpb24uemlwJztcbiAgdG9nZ2xlRWRpdE1vZGUodHJ1ZSk7XG59XG5cbmZ1bmN0aW9uIHJlcXVlc3RQYXJ0KHVybCkge1xuXG4gIHZhciByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gIHZhciBkZWZlcnJlZCA9IFEuZGVmZXIoKTtcblxuICByZXF1ZXN0Lm9wZW4oXCJHRVRcIiwgdXJsLCB0cnVlKTtcbiAgcmVxdWVzdC5vbmxvYWQgPSBvbmxvYWQ7XG4gIHJlcXVlc3Qub25lcnJvciA9IG9uZXJyb3I7XG4gIHJlcXVlc3Quc2VuZCgpO1xuXG4gIGZ1bmN0aW9uIG9ubG9hZCgpIHtcbiAgICBpZiAocmVxdWVzdC5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgZGVmZXJyZWQucmVzb2x2ZShyZXF1ZXN0LnJlc3BvbnNlVGV4dCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlZmVycmVkLnJlamVjdChuZXcgRXJyb3IoXCJTdGF0dXMgY29kZTogXCIgKyByZXF1ZXN0LnN0YXR1cykpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIG9uZXJyb3IoKSB7XG4gICAgZGVmZXJyZWQucmVqZWN0KG5ldyBFcnJvcihcIlJlcXVlc3QgdG8gXCIgKyB1cmwgKyBcIiBmYWlsZWRcIikpO1xuICB9XG5cbiAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG59XG4iLCJzbGlkZSA9IHJlcXVpcmUoJy4vc2xpZGUtY29udHJvbGxlcicpO1xubWVudSA9IHJlcXVpcmUoJy4vbWVudS1jb250cm9sbGVyJyk7XG5kb3dubG9hZCA9IHJlcXVpcmUoJy4va3JlYXRvci1kb3dubG9hZCcpO1xuc2lkZW1lbnUgPSByZXF1aXJlKCcuL3NpZGVtZW51LWNvbnRyb2xsZXInKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBrcmVhdG9yICgpIHtcblxuICB3aW5kb3cuQXBwID0ge1xuICAgIHRpdGxlOiAnS3JlYXRvci5qcycsXG4gICAgYXV0aG9yOiAnQW5kcmVpIE9wcmVhJyxcbiAgICB0aGVtZTogJ2RlZmF1bHQuY3NzJ1xuICB9O1xuXG4gICAgLy8gRnVsbCBsaXN0IG9mIGNvbmZpZ3VyYXRpb24gb3B0aW9ucyBhdmFpbGFibGUgaGVyZTpcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vaGFraW1lbC9yZXZlYWwuanMjY29uZmlndXJhdGlvblxuICAgIFJldmVhbC5pbml0aWFsaXplKHtcbiAgICAgICAgY29udHJvbHM6IHRydWUsXG4gICAgICAgIHByb2dyZXNzOiB0cnVlLFxuICAgICAgICBoaXN0b3J5OiB0cnVlLFxuICAgICAgICBjZW50ZXI6IGZhbHNlLFxuXG4gICAgICAgIHRoZW1lOiBSZXZlYWwuZ2V0UXVlcnlIYXNoKCkudGhlbWUsIC8vIGF2YWlsYWJsZSB0aGVtZXMgYXJlIGluIC9jc3MvdGhlbWVcbiAgICAgICAgdHJhbnNpdGlvbjogUmV2ZWFsLmdldFF1ZXJ5SGFzaCgpLnRyYW5zaXRpb24gfHwgJ2RlZmF1bHQnLCAvLyBkZWZhdWx0L2N1YmUvcGFnZS9jb25jYXZlL3pvb20vbGluZWFyL2ZhZGUvbm9uZVxuXHR9KTtcblxuXHRzbGlkZS5hZGRMaXN0ZW5lcnMoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWhhbmRsZXItLWFkZC1zbGlkZS1kb3duJyksXG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1oYW5kbGVyLS1hZGQtc2xpZGUtcmlnaHQnKSk7XG5cbiAgbWVudS5hZGRMaXN0ZW5lcnMoe1xuICAgIHVwbG9hZDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWhhbmRsZXItLXVwbG9hZCcpLFxuICAgIGhlYWRpbmc6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1oYW5kbGVyLS1oZWFkaW5ncycpLFxuICAgIGNvbG9yOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtaGFuZGxlci0tY29sb3InKSxcbiAgICBzdHlsZUJ1dHRvbnM6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1oYW5kbGVyLS1zdHlsZS1idXR0b24nKSxcbiAgICBhbGlnbm1lbnQ6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1oYW5kbGVyLS1hbGlnbicpLFxuICAgIGNvZGVCbG9jazogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWhhbmRsZXItLWNvZGUtYmxvY2snKSxcbiAgICBvdmVydmlldzogZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLWhhbmRsZXItLW92ZXJ2aWV3JyksXG4gICAgbGlzdEJ1dHRvbjogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWhhbmRsZXItLWxpc3QtYnV0dG9uJyksXG4gICAgaGVhZGluZ1R5cGU6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1oYW5kbGVyLS1oZWFkaW5nLXR5cGUnKSxcbiAgICBxdWlsbEVkaXRvcjogZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnNsaWRlLWVkaXQtbG9jaycpLFxuICAgIGFkZFNsaWRlQnV0dG9uczogZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmFkZC1zbGlkZScpXG4gIH0pO1xuXG4gIHNpZGVtZW51LmFkZExpc3RlbmVycyh7XG4gICAgcHJlc2VudGF0aW9uVGl0bGU6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1oYW5kbGVyLS1wcmVzZW50YXRpb24tbmFtZScpLFxuICAgIHRoZW1lU2VsZWN0b3I6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1oYW5kbGVyLS10aGVtZS1zZWxlY3RvcicpLFxuICAgIGhpZGVTaWRlbWVudTogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWhhbmRsZXItLWhpZGUtc2lkZW1lbnUnKVxuICB9KTtcblxuICBkb3dubG9hZC5hZGRMaXN0ZW5lcihkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtaGFuZGxlci0tZG93bmxvYWQnKSk7XG5cbn07XG4iLCIvKiBnbG9iYWxzIG1vZHVsZSwgXywgUmV2ZWFsLCB3aW5kb3csIGRvY3VtZW50LCBGaWxlUmVhZGVyLCBhbGVydCwgcmVxdWlyZSwgSW1hZ2UsIFF1aWxsICovXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBhZGRMaXN0ZW5lcnM6IGZ1bmN0aW9uKGhhbmRsZXIpIHtcbiAgICBoYW5kbGVyLnVwbG9hZC5hZGRFdmVudExpc3RlbmVyKCdzdWJtaXQnLCB1cGxvYWRTbGlkZXMsIGZhbHNlKTtcbiAgICBfLmVhY2goaGFuZGxlci5vdmVydmlldywgZnVuY3Rpb24oZWwpIHtcbiAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHRvZ2dsZU1lc3NhZ2UoKTtcbiAgICAgICAgdG9nZ2xlTWVudSgpO1xuICAgICAgICBSZXZlYWwudG9nZ2xlT3ZlcnZpZXcoKTtcbiAgICAgIH0sIGZhbHNlKTtcbiAgICB9KTtcblxuICAgIF8uZWFjaChoYW5kbGVyLnF1aWxsRWRpdG9yLCBmdW5jdGlvbiAoZWwpIHtcbiAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZW5hYmxlUXVpbGxFZGl0b3IsIGZhbHNlKTtcbiAgICB9KTtcblxuICAgIF8uZWFjaChoYW5kbGVyLmFkZFNsaWRlQnV0dG9ucywgZnVuY3Rpb24oZWwpIHtcbiAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdXBkYXRlUXVpbGxFZGl0b3JMaXN0ZW5lcnMsIGZhbHNlKTtcbiAgICB9KTtcblxuICAgIC8vIHdoZW4gdGhlIHNsaWRlIGNoYW5nZXMsIGVpdGhlciBkdWUgdG8gYWRkaW5nIGEgbmV3IHNsaWRlXG4gICAgLy8gb3IganVzdCBzd2l0Y2hpbmcgdmlldywgd2Ugd2FudCB0byBzYXZlIGFueSBtb2RpZmllZCBjb250ZW50XG4gICAgUmV2ZWFsLmFkZEV2ZW50TGlzdGVuZXIoJ3NsaWRlY2hhbmdlZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgY29tbWl0Q2hhbmdlcygpO1xuICAgICAgdG9nZ2xlRWRpdG9yKCk7XG4gICAgICBlZGl0aW5nU2xpZGUgPSBudWxsO1xuICAgIH0pO1xuXG4gIH1cbn07XG5cbi8vIGFkZCBuZXcgZXZlbnQgbGlzdGVuZXJzIHRvIHRoZSBlZGl0IGJ1dHRvblxuLy8gb2YgbmV3bHkgY3JlYXRlZCBzbGlkZXNcbmZ1bmN0aW9uIHVwZGF0ZVF1aWxsRWRpdG9yTGlzdGVuZXJzKCkge1xuICBfLmVhY2goZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnNsaWRlLWVkaXQtbG9jaycpLCBmdW5jdGlvbiAoZWwpIHtcbiAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGVuYWJsZVF1aWxsRWRpdG9yLCBmYWxzZSk7XG4gIH0pO1xufVxuXG4vLyB0aGUgLnByZXNlbnQgSFRNTCBjbGFzcyBzZWxlY3RvciBjb3VsZCBiZSBwcmVzZW50IG9uXG4vLyB2ZXJ0aWNhbCBzdGFja3Mgb2Ygc2xpZGVzIGFuZCB3ZSBkb24ndCB3YW50IHRoYXRcbmZ1bmN0aW9uIGdldEN1cnJlbnRTbGlkZSgpIHtcbiAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5wcmVzZW50Om5vdCguc3RhY2spJyk7XG59XG5cbnZhciBtZW51ICAgICAgICAgID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3RvcG1lbnUnKTtcbnZhciBlZGl0aW5nU2xpZGUgID0gbnVsbDtcbnZhciBlZGl0b3JFbGVtICAgID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2VkaXRvcicpO1xudmFyIGVkaXRvciAgICAgICAgPSBuZXcgUXVpbGwoJyNlZGl0b3IgZGl2Jywge1xuICBtb2R1bGVzOiB7XG4gICAgJ3Rvb2xiYXInOiB7Y29udGFpbmVyOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjdG9wbWVudScpfVxuICB9LFxuICB0aGVtZTogJ3Nub3cnXG59KTtcblxuZnVuY3Rpb24gZW5hYmxlUXVpbGxFZGl0b3IgKCkge1xuXG4gIGVkaXRpbmdTbGlkZSA9IGdldEN1cnJlbnRTbGlkZSgpO1xuICB2YXIgaHRtbCAgICAgPSBlZGl0aW5nU2xpZGUucXVlcnlTZWxlY3RvcignLmtyZWF0b3Itc2xpZGUtY29udGVudCcpLmlubmVySFRNTCB8fCAnd3JpdGUgeW91ciBjb250ZW50IGhlcmUnO1xuXG4gIHRvZ2dsZUVkaXRvcigpO1xuICBpZiAodGhpcy5jbGFzc0xpc3QuY29udGFpbnMoJ2FjdGl2ZScpKSB7XG4gICAgZWRpdG9yLnNldEhUTUwoaHRtbCk7XG4gIH0gZWxzZSB7XG4gICAgY29tbWl0Q2hhbmdlcygpO1xuICAgIGVkaXRpbmdTbGlkZSA9IG51bGw7XG4gIH1cbn1cblxuZnVuY3Rpb24gdG9nZ2xlRWRpdG9yKCkge1xuICBpZiAoZWRpdGluZ1NsaWRlKSB7XG4gICAgdmFyIGVkaXRCdG4gPSBlZGl0aW5nU2xpZGUucXVlcnlTZWxlY3RvcignLnNsaWRlLWVkaXQtbG9jaycpO1xuICAgIGVkaXRCdG4uY2xhc3NMaXN0LnRvZ2dsZSgnYWN0aXZlJyk7XG4gICAgZWRpdG9yRWxlbS5jbGFzc0xpc3QudG9nZ2xlKCd2aXN1YWxseS1oaWRkZW4nKTtcbiAgICBtZW51LmNsYXNzTGlzdC50b2dnbGUoJ3Zpc3VhbGx5LWhpZGRlbicpO1xuICB9XG59XG5cbi8vIHNhdmUgZWRpdG9yIGNoYW5nZXMgYWdhaW5zdCB0aGUgcHJlc2VudCBzbGlkZVxuZnVuY3Rpb24gY29tbWl0Q2hhbmdlcygpIHtcbiAgaWYgKGVkaXRpbmdTbGlkZSkge1xuICAgIGVkaXRpbmdTbGlkZS5xdWVyeVNlbGVjdG9yKCcua3JlYXRvci1zbGlkZS1jb250ZW50JykuaW5uZXJIVE1MID0gZWRpdG9yLmdldEhUTUwoKTtcbiAgfVxufVxuXG5mdW5jdGlvbiB0b2dnbGVNZW51KCkge1xuICB0b2dnbGUoJyN0b3BtZW51Jyk7XG59XG5cbmZ1bmN0aW9uIHRvZ2dsZU1lc3NhZ2UoKSB7XG4gIHRvZ2dsZSgnI21lc3NhZ2UnKTtcbn1cblxuZnVuY3Rpb24gdG9nZ2xlKHNlbCkge1xuICB2YXIgZWxlbSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsKTtcbiAgaWYoZWxlbS5jbGFzc0xpc3QuY29udGFpbnMoJ2hpZGRlbicpKSB7XG4gICAgZWxlbS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSBlbHNlIHtcbiAgICBlbGVtLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG4vKlxuICogSGFuZGxlIGZvcm0gc3VibWl0IGV2ZW50c1xuICogcmVhZHMgdGhlIGZpbGUgYXMgdGV4dFxuICogKi9cbmZ1bmN0aW9uIHVwbG9hZFNsaWRlcyhlKSB7XG4gIC8qanNoaW50IHZhbGlkdGhpczogdHJ1ZSovXG4gIGUucHJldmVudERlZmF1bHQoKTtcbiAgdmFyIGZpbGUgPSB0aGlzLnF1ZXJ5U2VsZWN0b3IoJ2lucHV0W3R5cGU9ZmlsZV0nKS5maWxlc1swXTtcbiAgaWYgKHdpbmRvdy5GaWxlICYmIHdpbmRvdy5GaWxlUmVhZGVyICYmIHdpbmRvdy5GaWxlTGlzdCAmJiB3aW5kb3cuQmxvYikge1xuICAgIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuXG4gICAgcmVhZGVyLm9ubG9hZCA9IChmdW5jdGlvbihmaWxlKSB7XG4gICAgICByZXR1cm4gcGFyc2VGaWxlLmJpbmQodGhpcywgZmlsZS50eXBlKTtcbiAgICB9KShmaWxlKTtcblxuICAgIGlmIChmaWxlLnR5cGUubWF0Y2goJ3RleHQvaHRtbCcpKVxuICAgICAgcmVhZGVyLnJlYWRBc1RleHQoZmlsZSwgJ3V0ZjgnKTtcbiAgICBlbHNlXG4gICAgICByZWFkZXIucmVhZEFzRGF0YVVSTChmaWxlKTtcbiAgfSBlbHNlIHtcbiAgICBhbGVydCgnRmlsZSByZWFkaW5nIG5vdCBzdXBwb3J0ZWQnKTtcbiAgfVxufVxuXG4vKlxuICogUmVjZWl2ZXMgdGhlIHVwbG9hZGVkIGZpbGVcbiAqIEhhbmRsZSB0ZXh0L2h0bWwgYW5kIGltYWdlcy8qIGRpZmZlcmVudGx5XG4gKiAqL1xuZnVuY3Rpb24gcGFyc2VGaWxlKGZpbGVUeXBlLCBlKSB7XG4gIHZhciBjb250ZW50ID0gZS50YXJnZXQucmVzdWx0O1xuICBpZiAoZmlsZVR5cGUubWF0Y2goJ3RleHQvaHRtbCcpKSB7XG4gICAgdmFyIGR1bW15ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgZHVtbXkuaW5uZXJIVE1MID0gY29udGVudDtcbiAgICBhcHBlbmRDb250ZW50KGR1bW15LnF1ZXJ5U2VsZWN0b3IoJy5zbGlkZXMnKS5pbm5lckhUTUwpO1xuICB9IGVsc2Uge1xuICAgIHZhciBpbWcgPSBuZXcgSW1hZ2UoKTtcbiAgICBpbWcuc3JjID0gZS50YXJnZXQucmVzdWx0O1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5wcmVzZW50JykuYXBwZW5kQ2hpbGQoaW1nKTsgLy8gRklYTUVcbiAgfVxufVxuXG4vKiBBcHBlbmRzIHRoZSBwYXJzZWQgY29udGVudCB0byB0aGUgcGFnZVxuICogY29tcGxldGx5IHJlcGxhY2VzIHRoZSBvbGQgY29udGVudFxuICogKi9cbmZ1bmN0aW9uIGFwcGVuZENvbnRlbnQoY29udGVudCkge1xuICB2YXIgc2xpZGVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNsaWRlcycpO1xuICBzbGlkZXMuaW5uZXJIVE1MID0gY29udGVudDtcbiAgUmV2ZWFsLnRvZ2dsZU92ZXJ2aWV3KCk7XG4gIFJldmVhbC50b2dnbGVPdmVydmlldygpO1xufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBwb2ludGVyKGtleSkge1xuXHRcblx0cmV0dXJuIHtcblx0XHRsaXN0ZW46IGZ1bmN0aW9uIChlbGVtZW50KSB7XG5cdFx0XHRsaXN0ZW4oa2V5LCBlbGVtZW50KTtcblx0XHR9XG5cdH1cblxufVxuXG52YXIgcGVlckpTS2V5O1xuXG5mdW5jdGlvbiBsaXN0ZW4oa2V5LCBlbGVtZW50KSB7XG5cdHBlZXJKU0tleSA9IGtleTtcblx0ZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGluaXQsIGZhbHNlKTtcbn1cblxuZnVuY3Rpb24gaW5pdChlKSB7XG5cdGUucHJldmVudERlZmF1bHQoKTtcblx0dmFyIHBlZXIgPSBuZXcgUGVlcih7a2V5OiBwZWVySlNLZXl9KTtcblx0cGVlci5vbignb3BlbicsIGZ1bmN0aW9uKGlkKSB7XG5cdFx0Y29uc29sZS5sb2coJ015IHBlZXIgSUQgaXM6ICcgKyBpZCk7XG5cdH0pO1xuXHR2YXIgY29ubiA9IHBlZXIuY29ubmVjdChwcm9tcHQoXCJQaG9uZSByZW1vdGUgaWRcIikpO1xuXHRjb25uLm9uKCdvcGVuJywgZnVuY3Rpb24oKSB7XG5cdCAgLy8gUmVjZWl2ZSBtZXNzYWdlc1xuXHQgIGNvbm4ub24oJ2RhdGEnLCBmdW5jdGlvbihkYXRhKSB7XG5cdCAgICBpZiAoZGF0YSA9PSAnbGVmdCcpIFJldmVhbC5sZWZ0KCk7XG5cdCAgICBpZiAoZGF0YSA9PSAncmlnaHQnKSBSZXZlYWwucmlnaHQoKTtcblx0ICAgIGNvbnNvbGUubG9nKCdyZWNlaXZlZCcsIGRhdGEpO1xuXHRcdGNvbm4uc2VuZCh7XG5cdFx0XHR0aXRsZTogQXBwLnRpdGxlLFxuXHRcdFx0c2xpZGU6IFJldmVhbC5nZXRJbmRpY2VzKCkuaFxuXHRcdH0pO1xuXHQgIH0pO1xuXG5cdFx0Y29ubi5zZW5kKHtcblx0XHRcdHRpdGxlOiBBcHAudGl0bGUsXG5cdFx0XHRzbGlkZTogUmV2ZWFsLmdldEluZGljZXMoKS5oXG5cdFx0fSk7XG5cdCAgLy8gU2VuZCBtZXNzYWdlc1xuXHR9KTtcbn1cblxuIiwiLyogZ2xvYmFscyBtb2R1bGUsIF8sIEFwcCAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgYWRkTGlzdGVuZXJzOiBmdW5jdGlvbihoYW5kbGVyKSB7XG4gICAgaGFuZGxlci5wcmVzZW50YXRpb25UaXRsZS5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIHNldFByZXNlbnRhdGlvblRpdGxlLCBmYWxzZSk7XG4gICAgaGFuZGxlci50aGVtZVNlbGVjdG9yLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGNoYW5nZVRoZW1lLCBmYWxzZSk7XG4gICAgaGFuZGxlci5oaWRlU2lkZW1lbnUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBoaWRlU2lkZW1lbnUsIGZhbHNlKTtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2lkZW1lbnUnKS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW92ZXInLCBzaG93U2lkZW1lbnUsIGZhbHNlKTtcbiAgfVxufTtcblxudmFyIGlzU2xpZGluZyA9IGZhbHNlO1xuXG5mdW5jdGlvbiBjaGFuZ2VUaGVtZSgpIHtcbiAgQXBwLnRoZW1lID0gdGhpcy52YWx1ZTtcbiAgdmFyIHRoZW1lcyA9IFtcbiAgICAnZGVmYXVsdC5jc3MnLCAnbmlnaHQuY3NzJywgJ2JlaWdlLmNzcydcbiAgXTtcbiAgXy5lYWNoKHRoZW1lcywgcmVtb3ZlQ1NTKTtcbiAgYXBwZW5kQ1NTKHRoaXMudmFsdWUpO1xufVxuXG5mdW5jdGlvbiBhcHBlbmRDU1ModGhlbWUpIHtcbiAgdmFyIGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaW5rJyk7XG4gIGxpbmsucmVsID0gJ3N0eWxlc2hlZXQnO1xuICBsaW5rLmhyZWYgPSAnY3NzLycgKyB0aGVtZTtcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaGVhZCcpLmFwcGVuZENoaWxkKGxpbmspO1xufVxuXG5mdW5jdGlvbiByZW1vdmVDU1ModmFsKSB7XG4gIHZhciBzZWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdsaW5rW3JlbD1zdHlsZXNoZWV0XVtocmVmJD1cIicrdmFsKydcIl0nKTtcbiAgaWYgKHNlbCkge1xuICAgIHNlbC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHNlbCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gaGlkZVNpZGVtZW51KCkge1xuICB2YXIgZWwgPSB0aGlzLnBhcmVudE5vZGU7XG4gIGVsLnN0eWxlLm1velRyYW5zZm9ybSA9ICd0cmFuc2xhdGVYKC05MCUpJztcbiAgZWwuc3R5bGUud2Via2l0VHJhbnNmb3JtID0gJ3RyYW5zbGF0ZVgoLTkwJSknO1xuICBlbC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlWCgtOTAlKSc7XG4gIGlzU2xpZGluZyA9IHRydWU7XG4gIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICBpc1NsaWRpbmcgPSBmYWxzZTtcbiAgfSwgMzAwKTtcbn1cblxuZnVuY3Rpb24gc2hvd1NpZGVtZW51KCkge1xuICBpZiAoaXNTbGlkaW5nKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciBlbCA9IHRoaXM7XG4gIGVsLnN0eWxlLm1velRyYW5zZm9ybSA9ICd0cmFuc2xhdGVYKDApJztcbiAgZWwuc3R5bGUud2Via2l0VHJhbnNmb3JtID0gJ3RyYW5zbGF0ZVgoMCknO1xuICBlbC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlWCgwKSc7XG59XG5cbmZ1bmN0aW9uIHNldFByZXNlbnRhdGlvblRpdGxlKCkge1xuICB2YXIgdmFsdWUgPSB0aGlzLnZhbHVlO1xuICBpZiAod2luZG93Ll90aW1lb3V0KSB7XG4gICAgY2xlYXJJbnRlcnZhbCh3aW5kb3cuX3RpbWVvdXQpO1xuICAgIHdpbmRvdy5fdGltZW91dCA9IDA7XG4gIH1cbiAgd2luZG93Ll90aW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICBkb2N1bWVudC50aXRsZSA9IHZhbHVlO1xuICAgIEFwcC50aXRsZSA9IHZhbHVlO1xuICB9LCAzMDApO1xufVxuIiwiLyogZ2xvYmFscyBtb2R1bGUsIGRvY3VtZW50LCBSZXZlYWwgKi9cblxudmFyIGFkZExpc3RlbmVycyA9IGZ1bmN0aW9uIChhZGREb3duLCBhZGRSaWdodCkge1xuXHRhZGREb3duLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc2xpZGVzQ29udHJvbGxlci5hZGRTbGlkZURvd24sICdmYWxzZScpO1xuXHRhZGRSaWdodC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHNsaWRlc0NvbnRyb2xsZXIuYWRkU2xpZGVSaWdodCwgJ2ZhbHNlJyk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0YWRkTGlzdGVuZXJzOiBhZGRMaXN0ZW5lcnNcbn07XG5cbnZhciBzbGlkZXNDb250cm9sbGVyID0ge1xuICBzbGlkZXNQYXJlbnQ6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zbGlkZXMnKSxcbiAgYWRkU2xpZGVEb3duOiBmdW5jdGlvbigpIHtcbiAgICAvLyB0byBhZGQgYSBzbGlkZSBkb3duIHdlIG11c3QgYWRkIGEgc2VjdGlvblxuICAgIC8vIGluc2lkZSB0aGUgY3VycmVudCBzbGlkZS5cbiAgICAvLyBXZSBzZWxlY3QgaXQgYW5kIHRoZSBzZWN0aW9uIGluc2lkZVxuICAgIHZhciBjdXJyZW50U2xpZGUgPSBzbGlkZXNDb250cm9sbGVyLnByZXNlbnRTbGlkZSgpO1xuICAgIHZhciBjaGlsZHJlbiA9IGN1cnJlbnRTbGlkZS5xdWVyeVNlbGVjdG9yKCdzZWN0aW9uJyk7XG4gICAgaWYgKCFjaGlsZHJlbikge1xuICAgICAgdmFyIHBhcmVudFNsaWRlID0gc2xpZGVzQ29udHJvbGxlci5uZXdTZWN0aW9uKCk7XG4gICAgICB2YXIgc2xpZGUxID0gc2xpZGVzQ29udHJvbGxlci5uZXdTbGlkZSgnJywgdHJ1ZSk7XG4gICAgICB2YXIgc2xpZGUyID0gc2xpZGVzQ29udHJvbGxlci5uZXdTbGlkZSgpO1xuICAgICAgcGFyZW50U2xpZGUuYXBwZW5kQ2hpbGQoc2xpZGUxKTtcbiAgICAgIHBhcmVudFNsaWRlLmFwcGVuZENoaWxkKHNsaWRlMik7XG4gICAgICBjdXJyZW50U2xpZGUucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQocGFyZW50U2xpZGUsIGN1cnJlbnRTbGlkZSk7XG4gICAgICBSZXZlYWwudG9nZ2xlT3ZlcnZpZXcoKTsgLy8gRklYTUVcbiAgICAgIFJldmVhbC50b2dnbGVPdmVydmlldygpO1xuICAgICAgUmV2ZWFsLmRvd24oKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHNsaWRlID0gc2xpZGVzQ29udHJvbGxlci5uZXdTbGlkZSgpO1xuICAgICAgY3VycmVudFNsaWRlLmFwcGVuZENoaWxkKHNsaWRlKTtcbiAgICAgIFJldmVhbC50b2dnbGVPdmVydmlldygpO1xuICAgICAgUmV2ZWFsLnRvZ2dsZU92ZXJ2aWV3KCk7XG4gICAgICBSZXZlYWwuZG93bigpO1xuICAgIH1cbiAgfSxcbiAgYWRkU2xpZGVSaWdodDogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNsaWRlID0gc2xpZGVzQ29udHJvbGxlci5uZXdTbGlkZSgpO1xuICAgIHNsaWRlc0NvbnRyb2xsZXIuc2xpZGVzUGFyZW50LmFwcGVuZENoaWxkKHNsaWRlKTtcbiAgICBSZXZlYWwucmlnaHQoKTtcbiAgfSxcbiAgcHJlc2VudFNsaWRlOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnByZXNlbnQnKTtcbiAgfSxcbiAgbmV3U2xpZGU6IGZ1bmN0aW9uKGNvbnRlbnQsIGNsb25lKSB7IC8vIHRoZSBuZXcgc2xpZGUgaXMgYSBjbG9uZSBvZiB0aGUgY3VycmVudCBvbmVcbiAgICB2YXIgc2xpZGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucHJlc2VudDpub3QoLnN0YWNrKScpLmNsb25lTm9kZSh0cnVlKTtcbiAgICBpZiAoY2xvbmUpIHtcbiAgICAgIHJldHVybiBzbGlkZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGNvbnRlbnQgPSBzbGlkZS5xdWVyeVNlbGVjdG9yKCcua3JlYXRvci1zbGlkZS1jb250ZW50Jyk7XG4gICAgICBjb250ZW50LmlubmVySFRNTCA9ICcnO1xuICAgICAgcmV0dXJuIHNsaWRlO1xuICAgIH1cbiAgfSxcbiAgbmV3U2VjdGlvbjogZnVuY3Rpb24oY29udGVudCkge1xuICAgIHZhciBzbGlkZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NlY3Rpb24nKTtcbiAgICBzbGlkZS5pbm5lckhUTUwgPSBjb250ZW50IHx8ICcnO1xuICAgIHJldHVybiBzbGlkZTtcbiAgfVxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIHRvdXJIYW5kbGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWhhbmRsZXItLXJlc3RhcnQtdG91cicpO1xuXG4gICAgdG91ckhhbmRsZXIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCByZXN0YXJ0VG91ciwgZmFsc2UpO1xuXG4gICAgdmFyIHRvdXIgPSBuZXcgU2hlcGhlcmQuVG91cih7XG4gICAgICAgIGRlZmF1bHRzOiB7XG4gICAgICAgICAgICBjbGFzc2VzOiAnc2hlcGhlcmQtdGhlbWUtYXJyb3dzJyxcbiAgICAgICAgICAgIHNjcm9sbFRvOiBmYWxzZVxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICB0b3VyLmFkZFN0ZXAoJ2ludHJvJywge1xuICAgICAgICB0ZXh0OiAnVGhpcyBpcyBhIGd1aWRlZCBpbnRyb2R1Y3Rpb24gdG8gS3JlYXRvci5qcyA8YnI+IEl0IHdpbGwgc2hvdyB5b3UgaG93IHRvIGNvbnRyb2wgYW5kIHN0eWxlIHRoZSBjb250ZW50IDxicj4gWW91IGNhbiBjYW5jZWwgaWYgeW91IGtub3cgd2hhdCB0byBkbyBvciBjbGljayBzdGFydCA8YnI+JyxcbiAgICAgICAgYnV0dG9uczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRleHQ6ICdDYW5jZWwnLFxuICAgICAgICAgICAgICAgIGFjdGlvbjogZmluaXNoVG91clxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0ZXh0OiAnU3RhcnQnLFxuICAgICAgICAgICAgICAgIGFjdGlvbjogdG91ci5uZXh0XG4gICAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICB9KVxuXG4gICAgdG91ci5hZGRTdGVwKCdleGFtcGxlLXN0ZXAnLCB7XG4gICAgICAgIHRleHQ6ICdBZGQgc2xpZGUnLFxuICAgICAgICBhdHRhY2hUbzogJy5qcy1oYW5kbGVyLS1hZGQtc2xpZGUtcmlnaHQnLFxuICAgICAgICB0ZXRoZXJPcHRpb25zOiB7XG4gICAgICAgICAgICBhdHRhY2htZW50OiAndG9wIGxlZnQnLFxuICAgICAgICAgICAgdGFyZ2V0QXR0YWNobWVudDogJ3RvcCByaWdodCdcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgdG91ci5hZGRTdGVwKCdleGFtcGxlLXN0ZXAnLCB7XG4gICAgICAgIHRleHQ6ICdQcmVzZW50YXRpb24gbmFtZScsXG4gICAgICAgIGF0dGFjaFRvOiAnLmpzLWhhbmRsZXItLXByZXNlbnRhdGlvbi1uYW1lJyxcbiAgICAgICAgdGV0aGVyT3B0aW9uczoge1xuICAgICAgICAgICAgYXR0YWNobWVudDogJ3RvcCByaWdodCcsXG4gICAgICAgICAgICB0YXJnZXRBdHRhY2htZW50OiAndG9wIGxlZnQnXG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHRvdXIuYWRkU3RlcCgnZXhhbXBsZS1zdGVwJywge1xuICAgICAgICB0ZXh0OiAnQ2hhbmdlIHRoZSB0aGVtZScsXG4gICAgICAgIGF0dGFjaFRvOiAnLmpzLWhhbmRsZXItLXRoZW1lLXNlbGVjdG9yJyxcbiAgICAgICAgdGV0aGVyT3B0aW9uczoge1xuICAgICAgICAgICAgYXR0YWNobWVudDogJ3RvcCByaWdodCcsXG4gICAgICAgICAgICB0YXJnZXRBdHRhY2htZW50OiAndG9wIGxlZnQnXG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHRvdXIuYWRkU3RlcCgnZXhhbXBsZS1zdGVwJywge1xuICAgICAgICB0ZXh0OiAnRG93bmxvYWQgd2hlbiB5b3UgYXJlIGFsbCBkb25lJyxcbiAgICAgICAgYXR0YWNoVG86ICcuanMtaGFuZGxlci0tZG93bmxvYWQnLFxuICAgICAgICB0ZXRoZXJPcHRpb25zOiB7XG4gICAgICAgICAgICBhdHRhY2htZW50OiAndG9wIHJpZ2h0JyxcbiAgICAgICAgICAgIHRhcmdldEF0dGFjaG1lbnQ6ICd0b3AgbGVmdCdcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgdG91ci5hZGRTdGVwKCdleGFtcGxlLXN0ZXAnLCB7XG4gICAgICAgIHRleHQ6ICdUaGF0IGlzIGFsbC4gSSBob3BlIHlvdSBtYWtlIGEgZ3JlYXQgcHJlc2VudGF0aW9uIScsXG4gICAgICAgIGJ1dHRvbnM6IFt7XG4gICAgICAgICAgICAndGV4dCc6ICdTdGFydCB3cml0aW5nJyxcbiAgICAgICAgICAgIGFjdGlvbjogZmluaXNoVG91clxuICAgICAgICB9XVxuICAgIH0pO1xuXG4gICAgaWYgKCFsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndG91cicpKSB0b3VyLnN0YXJ0KCk7XG5cbiAgICBmdW5jdGlvbiBmaW5pc2hUb3VyKCkge1xuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgndG91cicsICdjb21wbGV0ZScpO1xuICAgICAgICB0b3VyLmhpZGUoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZXN0YXJ0VG91cigpIHtcbiAgICAgICAgdG91ci5zdGFydCgpO1xuICAgIH1cbn1cbiJdfQ==
