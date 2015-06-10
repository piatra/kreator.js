(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
/* globals module, _, Reveal, window, document, FileReader, alert, require, Image, Quill */
'use strict';

var menu          = document.querySelector('#topmenu');
var editingSlide  = null;
var editorElem    = document.querySelector('#editor');

var editor = new Quill('#editor div', {
  theme: 'snow'
});
window.editor = editor;

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
      editor.addModule('toolbar', { container: '#topmenu' });
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

},{}]},{},[3])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIva3JlYXRvci1kb3dubG9hZC5qcyIsImxpYi9rcmVhdG9yLmpzIiwibGliL21haW4uanMiLCJsaWIvbWVudS1jb250cm9sbGVyLmpzIiwibGliL3BvaW50ZXIuanMiLCJsaWIvc2lkZW1lbnUtY29udHJvbGxlci5qcyIsImxpYi9zbGlkZS1jb250cm9sbGVyLmpzIiwibGliL3RvdXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIGFkZExpc3RlbmVyOiBmdW5jdGlvbihlbCkge1xuICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZG93bmxvYWRTbGlkZXMsIGZhbHNlKTtcbiAgfVxufTtcblxudmFyIHBhcnRzID0gW3tcbiAgbmFtZTogJ2hlYWQuaHRtbCcsXG4gIHBhdGg6ICcnXG59LCB7XG4gIG5hbWU6ICd0YWlsLmh0bWwnLFxuICBwYXRoOiAnJ1xufSwge1xuICBuYW1lOiAnZGVmYXVsdC5jc3MnLFxuICBwYXRoOiAnY3NzJ1xufSwge1xuICBuYW1lOiAnemVuYnVybi5jc3MnLFxuICBwYXRoOiAnbGliL2Nzcydcbn0sIHtcbiAgbmFtZTogJ2hlYWQubWluLmpzJyxcbiAgcGF0aDogJ2xpYi9qcydcbn0sIHtcbiAgbmFtZTogJ3JldmVhbC5qcycsXG4gIHBhdGg6ICdqcydcbn0sIHtcbiAgbmFtZTogJ21haW4uY3NzJyxcbiAgcGF0aDogJ2Nzcydcbn0sIHtcbiAgbmFtZTogJ3plbmJ1cm4uY3NzJyxcbiAgcGF0aDogJ2Nzcydcbn0sIHtcbiAgbmFtZTogJ3ByaW50LmNzcycsXG4gIHBhdGg6ICdjc3MnXG59LCB7XG4gIG5hbWU6ICdjbGFzc0xpc3QuanMnLFxuICBwYXRoOiAnbGliL2pzJ1xufSwge1xuICBuYW1lOiAnaGlnaGxpZ2h0LmpzJyxcbiAgcGF0aDogJ2xpYi9qcydcbn0sIHtcbiAgbmFtZTogJ3NreS5jc3MnLFxuICBwYXRoOiAnY3NzJ1xufSwge1xuICBuYW1lOiAnbmlnaHQuY3NzJyxcbiAgcGF0aDogJ2Nzcydcbn0sIHtcbiAgbmFtZTogJ2JlaWdlLmNzcycsXG4gIHBhdGg6ICdjc3MnXG59XTtcblxuZnVuY3Rpb24gZG93bmxvYWRTbGlkZXMoKSB7XG4gIHZhciBjb250ZW50ID0gW107XG4gIHZhciB1cmwgPSBsb2NhdGlvbi5vcmlnaW4gKyAnL2tyZWF0b3IuanMvZG93bmxvYWQvJztcbiAgaWYgKGxvY2F0aW9uLm9yaWdpbi5tYXRjaCgnbG9jYWxob3N0JykpIHsgLy8gd2UgYXJlIHJ1bm5pbmcgaW4gZGV2ZWxvcG1lbnRcbiAgICBjb25zb2xlLmluZm8oJ0RldmVsb3BtZW50IG1vZGUnKTtcbiAgICB1cmwgPSBsb2NhdGlvbi5vcmlnaW4gKyAnL2Rvd25sb2FkLyc7XG4gICAgY29uc29sZS5pbmZvKCdEb3dubG9hZCBVUkwgcG9pbnRzIHRvICcgKyB1cmwpO1xuICB9XG4gIHZhciBsID0gcGFydHMubGVuZ3RoO1xuICB2YXIgZm9sZGVycyA9IHBhcnRzLm1hcChmdW5jdGlvbihwKSB7XG4gICAgcmV0dXJuIHAucGF0aDtcbiAgfSk7XG4gIHBhcnRzLm1hcChmdW5jdGlvbihwKSB7XG4gICAgcmV0dXJuIHVybCArIHAubmFtZTtcbiAgfSkuZm9yRWFjaChmdW5jdGlvbih1cmwsIGlkeCkge1xuICAgIHJlcXVlc3RQYXJ0KHVybClcbiAgICAgIC50aGVuKGZ1bmN0aW9uIChyZXNwKSB7XG4gICAgICAgIGNvbnRlbnRbaWR4XSA9IHJlc3A7XG4gICAgICAgIGlmICgtLWwgPT09IDApIHtcbiAgICAgICAgICBjcmVhdGVaaXAoY29udGVudCwgZm9sZGVycyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICB9KTtcbn1cblxuLypcbiAqIFRvZ2dsZSBvbiBhbmQgb2ZmIHRoZSBjb250ZW50RWRpdGFibGVcbiAqIGF0dHJpYnV0ZSBvbiB0aGUgc2xpZGVzXG4gKiAqL1xuZnVuY3Rpb24gdG9nZ2xlRWRpdE1vZGUobW9kZSkge1xuICB2YXIgc2xpZGVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnc2VjdGlvbicpO1xuICBfLmVhY2goc2xpZGVzLCBmdW5jdGlvbihzKSB7XG4gICAgcy5zZXRBdHRyaWJ1dGUoJ2NvbnRlbnRFZGl0YWJsZScsIG1vZGUpO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlWmlwKGNvbnRlbnQsIGZvbGRlcnMpIHtcbiAgdG9nZ2xlRWRpdE1vZGUoZmFsc2UpO1xuICBjb250ZW50WzBdID0gY29udGVudFswXS5yZXBsYWNlKC9kZWZhdWx0LmNzcy9nLCBBcHAudGhlbWUpO1xuICB2YXIgc2xpZGVzID0gJzxkaXYgY2xhc3M9XCJyZXZlYWxcIj48ZGl2IGNsYXNzPVwic2xpZGVzXCI+JyArXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNsaWRlcycpLmlubmVySFRNTCArXG4gICAgICAgICAgICAgICAgJzwvZGl2PjwvZGl2Pic7XG4gIHZhciBpbmRleCA9IGNvbnRlbnQuc3BsaWNlKDAsMik7XG4gIHZhciB6aXAgPSBuZXcgSlNaaXAoKTtcbiAgaW5kZXguc3BsaWNlKDEsIDAsIHNsaWRlcyk7XG4gIGluZGV4ID0gaW5kZXguam9pbignJyk7XG4gIGluZGV4LnJlcGxhY2UoLzx0aXRsZT4uKjxcXC90aXRsZT4vZywgJzx0aXRsZT4nICsgQXBwLnRpdGxlICsgJzwvdGl0bGU+Jyk7XG4gIHppcC5maWxlKCdpbmRleC5odG1sJywgaW5kZXgpO1xuXG4gIGZvciAodmFyIGkgPSAyOyBpIDwgZm9sZGVycy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBmb2xkZXIgPSB6aXAuZm9sZGVyKGZvbGRlcnNbaV0pO1xuICAgIGZvbGRlci5maWxlKHBhcnRzW2ldLm5hbWUsIGNvbnRlbnRbaSAtIDJdKTtcbiAgfVxuXG4gIGNvbnRlbnQgPSB6aXAuZ2VuZXJhdGUoe3R5cGU6ICdibG9iJ30pO1xuICB2YXIgbGluayA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1oYW5kbGVyLS1kb3dubG9hZC1yZWFkeScpO1xuICBsaW5rLmhyZWYgPSB3aW5kb3cuVVJMLmNyZWF0ZU9iamVjdFVSTChjb250ZW50KTtcbiAgbGluay5pbm5lckhUTUwgPSAnUHJlc2VudGF0aW9uIHJlYWR5LiBDbGljayBoZXJlIHRvIGRvd25sb2FkJztcbiAgbGluay5kb3dubG9hZCA9ICdZb3VyUHJlc2VudGF0aW9uLnppcCc7XG4gIHRvZ2dsZUVkaXRNb2RlKHRydWUpO1xufVxuXG5mdW5jdGlvbiByZXF1ZXN0UGFydCh1cmwpIHtcblxuICB2YXIgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICB2YXIgZGVmZXJyZWQgPSBRLmRlZmVyKCk7XG5cbiAgcmVxdWVzdC5vcGVuKFwiR0VUXCIsIHVybCwgdHJ1ZSk7XG4gIHJlcXVlc3Qub25sb2FkID0gb25sb2FkO1xuICByZXF1ZXN0Lm9uZXJyb3IgPSBvbmVycm9yO1xuICByZXF1ZXN0LnNlbmQoKTtcblxuICBmdW5jdGlvbiBvbmxvYWQoKSB7XG4gICAgaWYgKHJlcXVlc3Quc3RhdHVzID09PSAyMDApIHtcbiAgICAgIGRlZmVycmVkLnJlc29sdmUocmVxdWVzdC5yZXNwb25zZVRleHQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWZlcnJlZC5yZWplY3QobmV3IEVycm9yKFwiU3RhdHVzIGNvZGU6IFwiICsgcmVxdWVzdC5zdGF0dXMpKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBvbmVycm9yKCkge1xuICAgIGRlZmVycmVkLnJlamVjdChuZXcgRXJyb3IoXCJSZXF1ZXN0IHRvIFwiICsgdXJsICsgXCIgZmFpbGVkXCIpKTtcbiAgfVxuXG4gIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xufVxuIiwic2xpZGUgPSByZXF1aXJlKCcuL3NsaWRlLWNvbnRyb2xsZXInKTtcbm1lbnUgPSByZXF1aXJlKCcuL21lbnUtY29udHJvbGxlcicpO1xuZG93bmxvYWQgPSByZXF1aXJlKCcuL2tyZWF0b3ItZG93bmxvYWQnKTtcbnNpZGVtZW51ID0gcmVxdWlyZSgnLi9zaWRlbWVudS1jb250cm9sbGVyJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ga3JlYXRvciAoKSB7XG5cbiAgd2luZG93LkFwcCA9IHtcbiAgICB0aXRsZTogJ0tyZWF0b3IuanMnLFxuICAgIGF1dGhvcjogJ0FuZHJlaSBPcHJlYScsXG4gICAgdGhlbWU6ICdkZWZhdWx0LmNzcydcbiAgfTtcblxuICAgIC8vIEZ1bGwgbGlzdCBvZiBjb25maWd1cmF0aW9uIG9wdGlvbnMgYXZhaWxhYmxlIGhlcmU6XG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2hha2ltZWwvcmV2ZWFsLmpzI2NvbmZpZ3VyYXRpb25cbiAgICBSZXZlYWwuaW5pdGlhbGl6ZSh7XG4gICAgICAgIGNvbnRyb2xzOiB0cnVlLFxuICAgICAgICBwcm9ncmVzczogdHJ1ZSxcbiAgICAgICAgaGlzdG9yeTogdHJ1ZSxcbiAgICAgICAgY2VudGVyOiBmYWxzZSxcblxuICAgICAgICB0aGVtZTogUmV2ZWFsLmdldFF1ZXJ5SGFzaCgpLnRoZW1lLCAvLyBhdmFpbGFibGUgdGhlbWVzIGFyZSBpbiAvY3NzL3RoZW1lXG4gICAgICAgIHRyYW5zaXRpb246IFJldmVhbC5nZXRRdWVyeUhhc2goKS50cmFuc2l0aW9uIHx8ICdkZWZhdWx0JywgLy8gZGVmYXVsdC9jdWJlL3BhZ2UvY29uY2F2ZS96b29tL2xpbmVhci9mYWRlL25vbmVcblx0fSk7XG5cblx0c2xpZGUuYWRkTGlzdGVuZXJzKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1oYW5kbGVyLS1hZGQtc2xpZGUtZG93bicpLFxuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtaGFuZGxlci0tYWRkLXNsaWRlLXJpZ2h0JykpO1xuXG4gIG1lbnUuYWRkTGlzdGVuZXJzKHtcbiAgICB1cGxvYWQ6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1oYW5kbGVyLS11cGxvYWQnKSxcbiAgICBoZWFkaW5nOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtaGFuZGxlci0taGVhZGluZ3MnKSxcbiAgICBjb2xvcjogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWhhbmRsZXItLWNvbG9yJyksXG4gICAgc3R5bGVCdXR0b25zOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtaGFuZGxlci0tc3R5bGUtYnV0dG9uJyksXG4gICAgYWxpZ25tZW50OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtaGFuZGxlci0tYWxpZ24nKSxcbiAgICBjb2RlQmxvY2s6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1oYW5kbGVyLS1jb2RlLWJsb2NrJyksXG4gICAgb3ZlcnZpZXc6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5qcy1oYW5kbGVyLS1vdmVydmlldycpLFxuICAgIGxpc3RCdXR0b246IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1oYW5kbGVyLS1saXN0LWJ1dHRvbicpLFxuICAgIGhlYWRpbmdUeXBlOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtaGFuZGxlci0taGVhZGluZy10eXBlJyksXG4gICAgcXVpbGxFZGl0b3I6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5zbGlkZS1lZGl0LWxvY2snKSxcbiAgICBhZGRTbGlkZUJ1dHRvbnM6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5hZGQtc2xpZGUnKVxuICB9KTtcblxuICBzaWRlbWVudS5hZGRMaXN0ZW5lcnMoe1xuICAgIHByZXNlbnRhdGlvblRpdGxlOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtaGFuZGxlci0tcHJlc2VudGF0aW9uLW5hbWUnKSxcbiAgICB0aGVtZVNlbGVjdG9yOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtaGFuZGxlci0tdGhlbWUtc2VsZWN0b3InKSxcbiAgICBoaWRlU2lkZW1lbnU6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1oYW5kbGVyLS1oaWRlLXNpZGVtZW51JylcbiAgfSk7XG5cbiAgZG93bmxvYWQuYWRkTGlzdGVuZXIoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWhhbmRsZXItLWRvd25sb2FkJykpO1xuXG59O1xuIiwidmFyIGtyZWF0b3IgPSByZXF1aXJlKCcuL2tyZWF0b3IuanMnKTtcbnZhciBwb2ludGVyID0gcmVxdWlyZSgnLi9wb2ludGVyLmpzJykoJ2ltMjg5Y3NzMGJ5cGhrdDknKTtcbnZhciB0b3VyICAgID0gcmVxdWlyZSgnLi90b3VyLmpzJyk7XG5cbmtyZWF0b3IoKTtcbnRvdXIoKTtcblxucG9pbnRlci5saXN0ZW4oZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWhhbmRsZXItLWluaXQtcmVtb3RlJykpO1xuXG4iLCIvKiBnbG9iYWxzIG1vZHVsZSwgXywgUmV2ZWFsLCB3aW5kb3csIGRvY3VtZW50LCBGaWxlUmVhZGVyLCBhbGVydCwgcmVxdWlyZSwgSW1hZ2UsIFF1aWxsICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBtZW51ICAgICAgICAgID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3RvcG1lbnUnKTtcbnZhciBlZGl0aW5nU2xpZGUgID0gbnVsbDtcbnZhciBlZGl0b3JFbGVtICAgID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2VkaXRvcicpO1xuXG52YXIgZWRpdG9yID0gbmV3IFF1aWxsKCcjZWRpdG9yIGRpdicsIHtcbiAgdGhlbWU6ICdzbm93J1xufSk7XG53aW5kb3cuZWRpdG9yID0gZWRpdG9yO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgYWRkTGlzdGVuZXJzOiBmdW5jdGlvbihoYW5kbGVyKSB7XG4gICAgaGFuZGxlci51cGxvYWQuYWRkRXZlbnRMaXN0ZW5lcignc3VibWl0JywgdXBsb2FkU2xpZGVzLCBmYWxzZSk7XG4gICAgXy5lYWNoKGhhbmRsZXIub3ZlcnZpZXcsIGZ1bmN0aW9uKGVsKSB7XG4gICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgICAgICB0b2dnbGVNZXNzYWdlKCk7XG4gICAgICAgIHRvZ2dsZU1lbnUoKTtcbiAgICAgICAgUmV2ZWFsLnRvZ2dsZU92ZXJ2aWV3KCk7XG4gICAgICB9LCBmYWxzZSk7XG4gICAgfSk7XG5cbiAgICBfLmVhY2goaGFuZGxlci5xdWlsbEVkaXRvciwgZnVuY3Rpb24gKGVsKSB7XG4gICAgICBlZGl0b3IuYWRkTW9kdWxlKCd0b29sYmFyJywgeyBjb250YWluZXI6ICcjdG9wbWVudScgfSk7XG4gICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGVuYWJsZVF1aWxsRWRpdG9yLCBmYWxzZSk7XG4gICAgfSk7XG5cbiAgICBfLmVhY2goaGFuZGxlci5hZGRTbGlkZUJ1dHRvbnMsIGZ1bmN0aW9uKGVsKSB7XG4gICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHVwZGF0ZVF1aWxsRWRpdG9yTGlzdGVuZXJzLCBmYWxzZSk7XG4gICAgfSk7XG5cbiAgICAvLyB3aGVuIHRoZSBzbGlkZSBjaGFuZ2VzLCBlaXRoZXIgZHVlIHRvIGFkZGluZyBhIG5ldyBzbGlkZVxuICAgIC8vIG9yIGp1c3Qgc3dpdGNoaW5nIHZpZXcsIHdlIHdhbnQgdG8gc2F2ZSBhbnkgbW9kaWZpZWQgY29udGVudFxuICAgIFJldmVhbC5hZGRFdmVudExpc3RlbmVyKCdzbGlkZWNoYW5nZWQnLCBmdW5jdGlvbigpIHtcbiAgICAgIGNvbW1pdENoYW5nZXMoKTtcbiAgICAgIHRvZ2dsZUVkaXRvcigpO1xuICAgICAgZWRpdGluZ1NsaWRlID0gbnVsbDtcbiAgICB9KTtcblxuICB9XG59O1xuXG4vLyBhZGQgbmV3IGV2ZW50IGxpc3RlbmVycyB0byB0aGUgZWRpdCBidXR0b25cbi8vIG9mIG5ld2x5IGNyZWF0ZWQgc2xpZGVzXG5mdW5jdGlvbiB1cGRhdGVRdWlsbEVkaXRvckxpc3RlbmVycygpIHtcbiAgXy5lYWNoKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5zbGlkZS1lZGl0LWxvY2snKSwgZnVuY3Rpb24gKGVsKSB7XG4gICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBlbmFibGVRdWlsbEVkaXRvciwgZmFsc2UpO1xuICB9KTtcbn1cblxuLy8gdGhlIC5wcmVzZW50IEhUTUwgY2xhc3Mgc2VsZWN0b3IgY291bGQgYmUgcHJlc2VudCBvblxuLy8gdmVydGljYWwgc3RhY2tzIG9mIHNsaWRlcyBhbmQgd2UgZG9uJ3Qgd2FudCB0aGF0XG5mdW5jdGlvbiBnZXRDdXJyZW50U2xpZGUoKSB7XG4gIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucHJlc2VudDpub3QoLnN0YWNrKScpO1xufVxuXG5mdW5jdGlvbiBlbmFibGVRdWlsbEVkaXRvciAoKSB7XG5cbiAgZWRpdGluZ1NsaWRlID0gZ2V0Q3VycmVudFNsaWRlKCk7XG4gIHZhciBodG1sICAgICA9IGVkaXRpbmdTbGlkZS5xdWVyeVNlbGVjdG9yKCcua3JlYXRvci1zbGlkZS1jb250ZW50JykuaW5uZXJIVE1MIHx8ICd3cml0ZSB5b3VyIGNvbnRlbnQgaGVyZSc7XG5cbiAgdG9nZ2xlRWRpdG9yKCk7XG4gIGlmICh0aGlzLmNsYXNzTGlzdC5jb250YWlucygnYWN0aXZlJykpIHtcbiAgICBlZGl0b3Iuc2V0SFRNTChodG1sKTtcbiAgfSBlbHNlIHtcbiAgICBjb21taXRDaGFuZ2VzKCk7XG4gICAgZWRpdGluZ1NsaWRlID0gbnVsbDtcbiAgfVxufVxuXG5mdW5jdGlvbiB0b2dnbGVFZGl0b3IoKSB7XG4gIGlmIChlZGl0aW5nU2xpZGUpIHtcbiAgICB2YXIgZWRpdEJ0biA9IGVkaXRpbmdTbGlkZS5xdWVyeVNlbGVjdG9yKCcuc2xpZGUtZWRpdC1sb2NrJyk7XG4gICAgZWRpdEJ0bi5jbGFzc0xpc3QudG9nZ2xlKCdhY3RpdmUnKTtcbiAgICBlZGl0b3JFbGVtLmNsYXNzTGlzdC50b2dnbGUoJ3Zpc3VhbGx5LWhpZGRlbicpO1xuICAgIG1lbnUuY2xhc3NMaXN0LnRvZ2dsZSgndmlzdWFsbHktaGlkZGVuJyk7XG4gIH1cbn1cblxuLy8gc2F2ZSBlZGl0b3IgY2hhbmdlcyBhZ2FpbnN0IHRoZSBwcmVzZW50IHNsaWRlXG5mdW5jdGlvbiBjb21taXRDaGFuZ2VzKCkge1xuICBpZiAoZWRpdGluZ1NsaWRlKSB7XG4gICAgZWRpdGluZ1NsaWRlLnF1ZXJ5U2VsZWN0b3IoJy5rcmVhdG9yLXNsaWRlLWNvbnRlbnQnKS5pbm5lckhUTUwgPSBlZGl0b3IuZ2V0SFRNTCgpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHRvZ2dsZU1lbnUoKSB7XG4gIHRvZ2dsZSgnI3RvcG1lbnUnKTtcbn1cblxuZnVuY3Rpb24gdG9nZ2xlTWVzc2FnZSgpIHtcbiAgdG9nZ2xlKCcjbWVzc2FnZScpO1xufVxuXG5mdW5jdGlvbiB0b2dnbGUoc2VsKSB7XG4gIHZhciBlbGVtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWwpO1xuICBpZihlbGVtLmNsYXNzTGlzdC5jb250YWlucygnaGlkZGVuJykpIHtcbiAgICBlbGVtLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xuICAgIHJldHVybiB0cnVlO1xuICB9IGVsc2Uge1xuICAgIGVsZW0uY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbi8qXG4gKiBIYW5kbGUgZm9ybSBzdWJtaXQgZXZlbnRzXG4gKiByZWFkcyB0aGUgZmlsZSBhcyB0ZXh0XG4gKiAqL1xuZnVuY3Rpb24gdXBsb2FkU2xpZGVzKGUpIHtcbiAgLypqc2hpbnQgdmFsaWR0aGlzOiB0cnVlKi9cbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICB2YXIgZmlsZSA9IHRoaXMucXVlcnlTZWxlY3RvcignaW5wdXRbdHlwZT1maWxlXScpLmZpbGVzWzBdO1xuICBpZiAod2luZG93LkZpbGUgJiYgd2luZG93LkZpbGVSZWFkZXIgJiYgd2luZG93LkZpbGVMaXN0ICYmIHdpbmRvdy5CbG9iKSB7XG4gICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG5cbiAgICByZWFkZXIub25sb2FkID0gKGZ1bmN0aW9uKGZpbGUpIHtcbiAgICAgIHJldHVybiBwYXJzZUZpbGUuYmluZCh0aGlzLCBmaWxlLnR5cGUpO1xuICAgIH0pKGZpbGUpO1xuXG4gICAgaWYgKGZpbGUudHlwZS5tYXRjaCgndGV4dC9odG1sJykpXG4gICAgICByZWFkZXIucmVhZEFzVGV4dChmaWxlLCAndXRmOCcpO1xuICAgIGVsc2VcbiAgICAgIHJlYWRlci5yZWFkQXNEYXRhVVJMKGZpbGUpO1xuICB9IGVsc2Uge1xuICAgIGFsZXJ0KCdGaWxlIHJlYWRpbmcgbm90IHN1cHBvcnRlZCcpO1xuICB9XG59XG5cbi8qXG4gKiBSZWNlaXZlcyB0aGUgdXBsb2FkZWQgZmlsZVxuICogSGFuZGxlIHRleHQvaHRtbCBhbmQgaW1hZ2VzLyogZGlmZmVyZW50bHlcbiAqICovXG5mdW5jdGlvbiBwYXJzZUZpbGUoZmlsZVR5cGUsIGUpIHtcbiAgdmFyIGNvbnRlbnQgPSBlLnRhcmdldC5yZXN1bHQ7XG4gIGlmIChmaWxlVHlwZS5tYXRjaCgndGV4dC9odG1sJykpIHtcbiAgICB2YXIgZHVtbXkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBkdW1teS5pbm5lckhUTUwgPSBjb250ZW50O1xuICAgIGFwcGVuZENvbnRlbnQoZHVtbXkucXVlcnlTZWxlY3RvcignLnNsaWRlcycpLmlubmVySFRNTCk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIGltZyA9IG5ldyBJbWFnZSgpO1xuICAgIGltZy5zcmMgPSBlLnRhcmdldC5yZXN1bHQ7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnByZXNlbnQnKS5hcHBlbmRDaGlsZChpbWcpOyAvLyBGSVhNRVxuICB9XG59XG5cbi8qIEFwcGVuZHMgdGhlIHBhcnNlZCBjb250ZW50IHRvIHRoZSBwYWdlXG4gKiBjb21wbGV0bHkgcmVwbGFjZXMgdGhlIG9sZCBjb250ZW50XG4gKiAqL1xuZnVuY3Rpb24gYXBwZW5kQ29udGVudChjb250ZW50KSB7XG4gIHZhciBzbGlkZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2xpZGVzJyk7XG4gIHNsaWRlcy5pbm5lckhUTUwgPSBjb250ZW50O1xuICBSZXZlYWwudG9nZ2xlT3ZlcnZpZXcoKTtcbiAgUmV2ZWFsLnRvZ2dsZU92ZXJ2aWV3KCk7XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHBvaW50ZXIoa2V5KSB7XG5cdFxuXHRyZXR1cm4ge1xuXHRcdGxpc3RlbjogZnVuY3Rpb24gKGVsZW1lbnQpIHtcblx0XHRcdGxpc3RlbihrZXksIGVsZW1lbnQpO1xuXHRcdH1cblx0fVxuXG59XG5cbnZhciBwZWVySlNLZXk7XG5cbmZ1bmN0aW9uIGxpc3RlbihrZXksIGVsZW1lbnQpIHtcblx0cGVlckpTS2V5ID0ga2V5O1xuXHRlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaW5pdCwgZmFsc2UpO1xufVxuXG5mdW5jdGlvbiBpbml0KGUpIHtcblx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHR2YXIgcGVlciA9IG5ldyBQZWVyKHtrZXk6IHBlZXJKU0tleX0pO1xuXHRwZWVyLm9uKCdvcGVuJywgZnVuY3Rpb24oaWQpIHtcblx0XHRjb25zb2xlLmxvZygnTXkgcGVlciBJRCBpczogJyArIGlkKTtcblx0fSk7XG5cdHZhciBjb25uID0gcGVlci5jb25uZWN0KHByb21wdChcIlBob25lIHJlbW90ZSBpZFwiKSk7XG5cdGNvbm4ub24oJ29wZW4nLCBmdW5jdGlvbigpIHtcblx0ICAvLyBSZWNlaXZlIG1lc3NhZ2VzXG5cdCAgY29ubi5vbignZGF0YScsIGZ1bmN0aW9uKGRhdGEpIHtcblx0ICAgIGlmIChkYXRhID09ICdsZWZ0JykgUmV2ZWFsLmxlZnQoKTtcblx0ICAgIGlmIChkYXRhID09ICdyaWdodCcpIFJldmVhbC5yaWdodCgpO1xuXHQgICAgY29uc29sZS5sb2coJ3JlY2VpdmVkJywgZGF0YSk7XG5cdFx0Y29ubi5zZW5kKHtcblx0XHRcdHRpdGxlOiBBcHAudGl0bGUsXG5cdFx0XHRzbGlkZTogUmV2ZWFsLmdldEluZGljZXMoKS5oXG5cdFx0fSk7XG5cdCAgfSk7XG5cblx0XHRjb25uLnNlbmQoe1xuXHRcdFx0dGl0bGU6IEFwcC50aXRsZSxcblx0XHRcdHNsaWRlOiBSZXZlYWwuZ2V0SW5kaWNlcygpLmhcblx0XHR9KTtcblx0ICAvLyBTZW5kIG1lc3NhZ2VzXG5cdH0pO1xufVxuXG4iLCIvKiBnbG9iYWxzIG1vZHVsZSwgXywgQXBwICovXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBhZGRMaXN0ZW5lcnM6IGZ1bmN0aW9uKGhhbmRsZXIpIHtcbiAgICBoYW5kbGVyLnByZXNlbnRhdGlvblRpdGxlLmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgc2V0UHJlc2VudGF0aW9uVGl0bGUsIGZhbHNlKTtcbiAgICBoYW5kbGVyLnRoZW1lU2VsZWN0b3IuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgY2hhbmdlVGhlbWUsIGZhbHNlKTtcbiAgICBoYW5kbGVyLmhpZGVTaWRlbWVudS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhpZGVTaWRlbWVudSwgZmFsc2UpO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zaWRlbWVudScpLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlb3ZlcicsIHNob3dTaWRlbWVudSwgZmFsc2UpO1xuICB9XG59O1xuXG52YXIgaXNTbGlkaW5nID0gZmFsc2U7XG5cbmZ1bmN0aW9uIGNoYW5nZVRoZW1lKCkge1xuICBBcHAudGhlbWUgPSB0aGlzLnZhbHVlO1xuICB2YXIgdGhlbWVzID0gW1xuICAgICdkZWZhdWx0LmNzcycsICduaWdodC5jc3MnLCAnYmVpZ2UuY3NzJ1xuICBdO1xuICBfLmVhY2godGhlbWVzLCByZW1vdmVDU1MpO1xuICBhcHBlbmRDU1ModGhpcy52YWx1ZSk7XG59XG5cbmZ1bmN0aW9uIGFwcGVuZENTUyh0aGVtZSkge1xuICB2YXIgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpbmsnKTtcbiAgbGluay5yZWwgPSAnc3R5bGVzaGVldCc7XG4gIGxpbmsuaHJlZiA9ICdjc3MvJyArIHRoZW1lO1xuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdoZWFkJykuYXBwZW5kQ2hpbGQobGluayk7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZUNTUyh2YWwpIHtcbiAgdmFyIHNlbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2xpbmtbcmVsPXN0eWxlc2hlZXRdW2hyZWYkPVwiJyt2YWwrJ1wiXScpO1xuICBpZiAoc2VsKSB7XG4gICAgc2VsLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoc2VsKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBoaWRlU2lkZW1lbnUoKSB7XG4gIHZhciBlbCA9IHRoaXMucGFyZW50Tm9kZTtcbiAgZWwuc3R5bGUubW96VHJhbnNmb3JtID0gJ3RyYW5zbGF0ZVgoLTkwJSknO1xuICBlbC5zdHlsZS53ZWJraXRUcmFuc2Zvcm0gPSAndHJhbnNsYXRlWCgtOTAlKSc7XG4gIGVsLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGVYKC05MCUpJztcbiAgaXNTbGlkaW5nID0gdHJ1ZTtcbiAgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgIGlzU2xpZGluZyA9IGZhbHNlO1xuICB9LCAzMDApO1xufVxuXG5mdW5jdGlvbiBzaG93U2lkZW1lbnUoKSB7XG4gIGlmIChpc1NsaWRpbmcpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIGVsID0gdGhpcztcbiAgZWwuc3R5bGUubW96VHJhbnNmb3JtID0gJ3RyYW5zbGF0ZVgoMCknO1xuICBlbC5zdHlsZS53ZWJraXRUcmFuc2Zvcm0gPSAndHJhbnNsYXRlWCgwKSc7XG4gIGVsLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGVYKDApJztcbn1cblxuZnVuY3Rpb24gc2V0UHJlc2VudGF0aW9uVGl0bGUoKSB7XG4gIHZhciB2YWx1ZSA9IHRoaXMudmFsdWU7XG4gIGlmICh3aW5kb3cuX3RpbWVvdXQpIHtcbiAgICBjbGVhckludGVydmFsKHdpbmRvdy5fdGltZW91dCk7XG4gICAgd2luZG93Ll90aW1lb3V0ID0gMDtcbiAgfVxuICB3aW5kb3cuX3RpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgIGRvY3VtZW50LnRpdGxlID0gdmFsdWU7XG4gICAgQXBwLnRpdGxlID0gdmFsdWU7XG4gIH0sIDMwMCk7XG59XG4iLCIvKiBnbG9iYWxzIG1vZHVsZSwgZG9jdW1lbnQsIFJldmVhbCAqL1xuXG52YXIgYWRkTGlzdGVuZXJzID0gZnVuY3Rpb24gKGFkZERvd24sIGFkZFJpZ2h0KSB7XG5cdGFkZERvd24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzbGlkZXNDb250cm9sbGVyLmFkZFNsaWRlRG93biwgJ2ZhbHNlJyk7XG5cdGFkZFJpZ2h0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc2xpZGVzQ29udHJvbGxlci5hZGRTbGlkZVJpZ2h0LCAnZmFsc2UnKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRhZGRMaXN0ZW5lcnM6IGFkZExpc3RlbmVyc1xufTtcblxudmFyIHNsaWRlc0NvbnRyb2xsZXIgPSB7XG4gIHNsaWRlc1BhcmVudDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNsaWRlcycpLFxuICBhZGRTbGlkZURvd246IGZ1bmN0aW9uKCkge1xuICAgIC8vIHRvIGFkZCBhIHNsaWRlIGRvd24gd2UgbXVzdCBhZGQgYSBzZWN0aW9uXG4gICAgLy8gaW5zaWRlIHRoZSBjdXJyZW50IHNsaWRlLlxuICAgIC8vIFdlIHNlbGVjdCBpdCBhbmQgdGhlIHNlY3Rpb24gaW5zaWRlXG4gICAgdmFyIGN1cnJlbnRTbGlkZSA9IHNsaWRlc0NvbnRyb2xsZXIucHJlc2VudFNsaWRlKCk7XG4gICAgdmFyIGNoaWxkcmVuID0gY3VycmVudFNsaWRlLnF1ZXJ5U2VsZWN0b3IoJ3NlY3Rpb24nKTtcbiAgICBpZiAoIWNoaWxkcmVuKSB7XG4gICAgICB2YXIgcGFyZW50U2xpZGUgPSBzbGlkZXNDb250cm9sbGVyLm5ld1NlY3Rpb24oKTtcbiAgICAgIHZhciBzbGlkZTEgPSBzbGlkZXNDb250cm9sbGVyLm5ld1NsaWRlKCcnLCB0cnVlKTtcbiAgICAgIHZhciBzbGlkZTIgPSBzbGlkZXNDb250cm9sbGVyLm5ld1NsaWRlKCk7XG4gICAgICBwYXJlbnRTbGlkZS5hcHBlbmRDaGlsZChzbGlkZTEpO1xuICAgICAgcGFyZW50U2xpZGUuYXBwZW5kQ2hpbGQoc2xpZGUyKTtcbiAgICAgIGN1cnJlbnRTbGlkZS5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChwYXJlbnRTbGlkZSwgY3VycmVudFNsaWRlKTtcbiAgICAgIFJldmVhbC50b2dnbGVPdmVydmlldygpOyAvLyBGSVhNRVxuICAgICAgUmV2ZWFsLnRvZ2dsZU92ZXJ2aWV3KCk7XG4gICAgICBSZXZlYWwuZG93bigpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgc2xpZGUgPSBzbGlkZXNDb250cm9sbGVyLm5ld1NsaWRlKCk7XG4gICAgICBjdXJyZW50U2xpZGUuYXBwZW5kQ2hpbGQoc2xpZGUpO1xuICAgICAgUmV2ZWFsLnRvZ2dsZU92ZXJ2aWV3KCk7XG4gICAgICBSZXZlYWwudG9nZ2xlT3ZlcnZpZXcoKTtcbiAgICAgIFJldmVhbC5kb3duKCk7XG4gICAgfVxuICB9LFxuICBhZGRTbGlkZVJpZ2h0OiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2xpZGUgPSBzbGlkZXNDb250cm9sbGVyLm5ld1NsaWRlKCk7XG4gICAgc2xpZGVzQ29udHJvbGxlci5zbGlkZXNQYXJlbnQuYXBwZW5kQ2hpbGQoc2xpZGUpO1xuICAgIFJldmVhbC5yaWdodCgpO1xuICB9LFxuICBwcmVzZW50U2xpZGU6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucHJlc2VudCcpO1xuICB9LFxuICBuZXdTbGlkZTogZnVuY3Rpb24oY29udGVudCwgY2xvbmUpIHsgLy8gdGhlIG5ldyBzbGlkZSBpcyBhIGNsb25lIG9mIHRoZSBjdXJyZW50IG9uZVxuICAgIHZhciBzbGlkZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5wcmVzZW50Om5vdCguc3RhY2spJykuY2xvbmVOb2RlKHRydWUpO1xuICAgIGlmIChjbG9uZSkge1xuICAgICAgcmV0dXJuIHNsaWRlO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgY29udGVudCA9IHNsaWRlLnF1ZXJ5U2VsZWN0b3IoJy5rcmVhdG9yLXNsaWRlLWNvbnRlbnQnKTtcbiAgICAgIGNvbnRlbnQuaW5uZXJIVE1MID0gJyc7XG4gICAgICByZXR1cm4gc2xpZGU7XG4gICAgfVxuICB9LFxuICBuZXdTZWN0aW9uOiBmdW5jdGlvbihjb250ZW50KSB7XG4gICAgdmFyIHNsaWRlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2VjdGlvbicpO1xuICAgIHNsaWRlLmlubmVySFRNTCA9IGNvbnRlbnQgfHwgJyc7XG4gICAgcmV0dXJuIHNsaWRlO1xuICB9XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgdG91ckhhbmRsZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtaGFuZGxlci0tcmVzdGFydC10b3VyJyk7XG5cbiAgICB0b3VySGFuZGxlci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHJlc3RhcnRUb3VyLCBmYWxzZSk7XG5cbiAgICB2YXIgdG91ciA9IG5ldyBTaGVwaGVyZC5Ub3VyKHtcbiAgICAgICAgZGVmYXVsdHM6IHtcbiAgICAgICAgICAgIGNsYXNzZXM6ICdzaGVwaGVyZC10aGVtZS1hcnJvd3MnLFxuICAgICAgICAgICAgc2Nyb2xsVG86IGZhbHNlXG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHRvdXIuYWRkU3RlcCgnaW50cm8nLCB7XG4gICAgICAgIHRleHQ6ICdUaGlzIGlzIGEgZ3VpZGVkIGludHJvZHVjdGlvbiB0byBLcmVhdG9yLmpzIDxicj4gSXQgd2lsbCBzaG93IHlvdSBob3cgdG8gY29udHJvbCBhbmQgc3R5bGUgdGhlIGNvbnRlbnQgPGJyPiBZb3UgY2FuIGNhbmNlbCBpZiB5b3Uga25vdyB3aGF0IHRvIGRvIG9yIGNsaWNrIHN0YXJ0IDxicj4nLFxuICAgICAgICBidXR0b25zOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGV4dDogJ0NhbmNlbCcsXG4gICAgICAgICAgICAgICAgYWN0aW9uOiBmaW5pc2hUb3VyXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRleHQ6ICdTdGFydCcsXG4gICAgICAgICAgICAgICAgYWN0aW9uOiB0b3VyLm5leHRcbiAgICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgIH0pXG5cbiAgICB0b3VyLmFkZFN0ZXAoJ2V4YW1wbGUtc3RlcCcsIHtcbiAgICAgICAgdGV4dDogJ0FkZCBzbGlkZScsXG4gICAgICAgIGF0dGFjaFRvOiAnLmpzLWhhbmRsZXItLWFkZC1zbGlkZS1yaWdodCcsXG4gICAgICAgIHRldGhlck9wdGlvbnM6IHtcbiAgICAgICAgICAgIGF0dGFjaG1lbnQ6ICd0b3AgbGVmdCcsXG4gICAgICAgICAgICB0YXJnZXRBdHRhY2htZW50OiAndG9wIHJpZ2h0J1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICB0b3VyLmFkZFN0ZXAoJ2V4YW1wbGUtc3RlcCcsIHtcbiAgICAgICAgdGV4dDogJ1ByZXNlbnRhdGlvbiBuYW1lJyxcbiAgICAgICAgYXR0YWNoVG86ICcuanMtaGFuZGxlci0tcHJlc2VudGF0aW9uLW5hbWUnLFxuICAgICAgICB0ZXRoZXJPcHRpb25zOiB7XG4gICAgICAgICAgICBhdHRhY2htZW50OiAndG9wIHJpZ2h0JyxcbiAgICAgICAgICAgIHRhcmdldEF0dGFjaG1lbnQ6ICd0b3AgbGVmdCdcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgdG91ci5hZGRTdGVwKCdleGFtcGxlLXN0ZXAnLCB7XG4gICAgICAgIHRleHQ6ICdDaGFuZ2UgdGhlIHRoZW1lJyxcbiAgICAgICAgYXR0YWNoVG86ICcuanMtaGFuZGxlci0tdGhlbWUtc2VsZWN0b3InLFxuICAgICAgICB0ZXRoZXJPcHRpb25zOiB7XG4gICAgICAgICAgICBhdHRhY2htZW50OiAndG9wIHJpZ2h0JyxcbiAgICAgICAgICAgIHRhcmdldEF0dGFjaG1lbnQ6ICd0b3AgbGVmdCdcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgdG91ci5hZGRTdGVwKCdleGFtcGxlLXN0ZXAnLCB7XG4gICAgICAgIHRleHQ6ICdEb3dubG9hZCB3aGVuIHlvdSBhcmUgYWxsIGRvbmUnLFxuICAgICAgICBhdHRhY2hUbzogJy5qcy1oYW5kbGVyLS1kb3dubG9hZCcsXG4gICAgICAgIHRldGhlck9wdGlvbnM6IHtcbiAgICAgICAgICAgIGF0dGFjaG1lbnQ6ICd0b3AgcmlnaHQnLFxuICAgICAgICAgICAgdGFyZ2V0QXR0YWNobWVudDogJ3RvcCBsZWZ0J1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICB0b3VyLmFkZFN0ZXAoJ2V4YW1wbGUtc3RlcCcsIHtcbiAgICAgICAgdGV4dDogJ1RoYXQgaXMgYWxsLiBJIGhvcGUgeW91IG1ha2UgYSBncmVhdCBwcmVzZW50YXRpb24hJyxcbiAgICAgICAgYnV0dG9uczogW3tcbiAgICAgICAgICAgICd0ZXh0JzogJ1N0YXJ0IHdyaXRpbmcnLFxuICAgICAgICAgICAgYWN0aW9uOiBmaW5pc2hUb3VyXG4gICAgICAgIH1dXG4gICAgfSk7XG5cbiAgICBpZiAoIWxvY2FsU3RvcmFnZS5nZXRJdGVtKCd0b3VyJykpIHRvdXIuc3RhcnQoKTtcblxuICAgIGZ1bmN0aW9uIGZpbmlzaFRvdXIoKSB7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCd0b3VyJywgJ2NvbXBsZXRlJyk7XG4gICAgICAgIHRvdXIuaGlkZSgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlc3RhcnRUb3VyKCkge1xuICAgICAgICB0b3VyLnN0YXJ0KCk7XG4gICAgfVxufVxuIl19
