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

var editor = null;

// add new event listeners to the edit button
// of newly created slides
function updateQuillEditorListeners() {
  _.each(document.querySelectorAll('.slide-edit-lock'), function (el) {
    el.addEventListener('click', enableQuillEditor, false);
  });
}

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
  newSlide: function() { // the new slide is a clone of the current one
    var slide = document.querySelector('.present').cloneNode(true);
    var content = slide.querySelector('.kreator-slide-content');
    content.innerHTML = '';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwibGliL2tyZWF0b3ItZG93bmxvYWQuanMiLCJsaWIva3JlYXRvci5qcyIsImxpYi9tYWluLmpzIiwibGliL21lbnUtY29udHJvbGxlci5qcyIsImxpYi9wb2ludGVyLmpzIiwibGliL3NpZGVtZW51LWNvbnRyb2xsZXIuanMiLCJsaWIvc2xpZGUtY29udHJvbGxlci5qcyIsImxpYi90b3VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3REQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBhZGRMaXN0ZW5lcjogZnVuY3Rpb24oZWwpIHtcbiAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGRvd25sb2FkU2xpZGVzLCBmYWxzZSk7XG4gIH1cbn07XG5cbnZhciBwYXJ0cyA9IFt7XG4gIG5hbWU6ICdoZWFkLmh0bWwnLFxuICBwYXRoOiAnJ1xufSwge1xuICBuYW1lOiAndGFpbC5odG1sJyxcbiAgcGF0aDogJydcbn0sIHtcbiAgbmFtZTogJ2RlZmF1bHQuY3NzJyxcbiAgcGF0aDogJ2Nzcydcbn0sIHtcbiAgbmFtZTogJ3plbmJ1cm4uY3NzJyxcbiAgcGF0aDogJ2xpYi9jc3MnXG59LCB7XG4gIG5hbWU6ICdoZWFkLm1pbi5qcycsXG4gIHBhdGg6ICdsaWIvanMnXG59LCB7XG4gIG5hbWU6ICdyZXZlYWwuanMnLFxuICBwYXRoOiAnanMnXG59LCB7XG4gIG5hbWU6ICdtYWluLmNzcycsXG4gIHBhdGg6ICdjc3MnXG59LCB7XG4gIG5hbWU6ICd6ZW5idXJuLmNzcycsXG4gIHBhdGg6ICdjc3MnXG59LCB7XG4gIG5hbWU6ICdwcmludC5jc3MnLFxuICBwYXRoOiAnY3NzJ1xufSwge1xuICBuYW1lOiAnY2xhc3NMaXN0LmpzJyxcbiAgcGF0aDogJ2xpYi9qcydcbn0sIHtcbiAgbmFtZTogJ2hpZ2hsaWdodC5qcycsXG4gIHBhdGg6ICdsaWIvanMnXG59LCB7XG4gIG5hbWU6ICdza3kuY3NzJyxcbiAgcGF0aDogJ2Nzcydcbn0sIHtcbiAgbmFtZTogJ25pZ2h0LmNzcycsXG4gIHBhdGg6ICdjc3MnXG59LCB7XG4gIG5hbWU6ICdiZWlnZS5jc3MnLFxuICBwYXRoOiAnY3NzJ1xufV07XG5cbmZ1bmN0aW9uIGRvd25sb2FkU2xpZGVzKCkge1xuICB2YXIgY29udGVudCA9IFtdO1xuICB2YXIgdXJsID0gbG9jYXRpb24ub3JpZ2luICsgJy9rcmVhdG9yLmpzL2Rvd25sb2FkLyc7XG4gIGlmIChsb2NhdGlvbi5vcmlnaW4ubWF0Y2goJ2xvY2FsaG9zdCcpKSB7IC8vIHdlIGFyZSBydW5uaW5nIGluIGRldmVsb3BtZW50XG4gICAgY29uc29sZS5pbmZvKCdEZXZlbG9wbWVudCBtb2RlJyk7XG4gICAgdXJsID0gbG9jYXRpb24ub3JpZ2luICsgJy9kb3dubG9hZC8nO1xuICAgIGNvbnNvbGUuaW5mbygnRG93bmxvYWQgVVJMIHBvaW50cyB0byAnICsgdXJsKTtcbiAgfVxuICB2YXIgbCA9IHBhcnRzLmxlbmd0aDtcbiAgdmFyIGZvbGRlcnMgPSBwYXJ0cy5tYXAoZnVuY3Rpb24ocCkge1xuICAgIHJldHVybiBwLnBhdGg7XG4gIH0pO1xuICBwYXJ0cy5tYXAoZnVuY3Rpb24ocCkge1xuICAgIHJldHVybiB1cmwgKyBwLm5hbWU7XG4gIH0pLmZvckVhY2goZnVuY3Rpb24odXJsLCBpZHgpIHtcbiAgICByZXF1ZXN0UGFydCh1cmwpXG4gICAgICAudGhlbihmdW5jdGlvbiAocmVzcCkge1xuICAgICAgICBjb250ZW50W2lkeF0gPSByZXNwO1xuICAgICAgICBpZiAoLS1sID09PSAwKSB7XG4gICAgICAgICAgY3JlYXRlWmlwKGNvbnRlbnQsIGZvbGRlcnMpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgfSk7XG59XG5cbi8qXG4gKiBUb2dnbGUgb24gYW5kIG9mZiB0aGUgY29udGVudEVkaXRhYmxlXG4gKiBhdHRyaWJ1dGUgb24gdGhlIHNsaWRlc1xuICogKi9cbmZ1bmN0aW9uIHRvZ2dsZUVkaXRNb2RlKG1vZGUpIHtcbiAgdmFyIHNsaWRlcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ3NlY3Rpb24nKTtcbiAgXy5lYWNoKHNsaWRlcywgZnVuY3Rpb24ocykge1xuICAgIHMuc2V0QXR0cmlidXRlKCdjb250ZW50RWRpdGFibGUnLCBtb2RlKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVppcChjb250ZW50LCBmb2xkZXJzKSB7XG4gIHRvZ2dsZUVkaXRNb2RlKGZhbHNlKTtcbiAgY29udGVudFswXSA9IGNvbnRlbnRbMF0ucmVwbGFjZSgvZGVmYXVsdC5jc3MvZywgQXBwLnRoZW1lKTtcbiAgdmFyIHNsaWRlcyA9ICc8ZGl2IGNsYXNzPVwicmV2ZWFsXCI+PGRpdiBjbGFzcz1cInNsaWRlc1wiPicgK1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zbGlkZXMnKS5pbm5lckhUTUwgK1xuICAgICAgICAgICAgICAgICc8L2Rpdj48L2Rpdj4nO1xuICB2YXIgaW5kZXggPSBjb250ZW50LnNwbGljZSgwLDIpO1xuICB2YXIgemlwID0gbmV3IEpTWmlwKCk7XG4gIGluZGV4LnNwbGljZSgxLCAwLCBzbGlkZXMpO1xuICBpbmRleCA9IGluZGV4LmpvaW4oJycpO1xuICBpbmRleC5yZXBsYWNlKC88dGl0bGU+Lio8XFwvdGl0bGU+L2csICc8dGl0bGU+JyArIEFwcC50aXRsZSArICc8L3RpdGxlPicpO1xuICB6aXAuZmlsZSgnaW5kZXguaHRtbCcsIGluZGV4KTtcblxuICBmb3IgKHZhciBpID0gMjsgaSA8IGZvbGRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgZm9sZGVyID0gemlwLmZvbGRlcihmb2xkZXJzW2ldKTtcbiAgICBmb2xkZXIuZmlsZShwYXJ0c1tpXS5uYW1lLCBjb250ZW50W2kgLSAyXSk7XG4gIH1cblxuICBjb250ZW50ID0gemlwLmdlbmVyYXRlKHt0eXBlOiAnYmxvYid9KTtcbiAgdmFyIGxpbmsgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtaGFuZGxlci0tZG93bmxvYWQtcmVhZHknKTtcbiAgbGluay5ocmVmID0gd2luZG93LlVSTC5jcmVhdGVPYmplY3RVUkwoY29udGVudCk7XG4gIGxpbmsuaW5uZXJIVE1MID0gJ1ByZXNlbnRhdGlvbiByZWFkeS4gQ2xpY2sgaGVyZSB0byBkb3dubG9hZCc7XG4gIGxpbmsuZG93bmxvYWQgPSAnWW91clByZXNlbnRhdGlvbi56aXAnO1xuICB0b2dnbGVFZGl0TW9kZSh0cnVlKTtcbn1cblxuZnVuY3Rpb24gcmVxdWVzdFBhcnQodXJsKSB7XG5cbiAgdmFyIHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgdmFyIGRlZmVycmVkID0gUS5kZWZlcigpO1xuXG4gIHJlcXVlc3Qub3BlbihcIkdFVFwiLCB1cmwsIHRydWUpO1xuICByZXF1ZXN0Lm9ubG9hZCA9IG9ubG9hZDtcbiAgcmVxdWVzdC5vbmVycm9yID0gb25lcnJvcjtcbiAgcmVxdWVzdC5zZW5kKCk7XG5cbiAgZnVuY3Rpb24gb25sb2FkKCkge1xuICAgIGlmIChyZXF1ZXN0LnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICBkZWZlcnJlZC5yZXNvbHZlKHJlcXVlc3QucmVzcG9uc2VUZXh0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGVmZXJyZWQucmVqZWN0KG5ldyBFcnJvcihcIlN0YXR1cyBjb2RlOiBcIiArIHJlcXVlc3Quc3RhdHVzKSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gb25lcnJvcigpIHtcbiAgICBkZWZlcnJlZC5yZWplY3QobmV3IEVycm9yKFwiUmVxdWVzdCB0byBcIiArIHVybCArIFwiIGZhaWxlZFwiKSk7XG4gIH1cblxuICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbn1cbiIsInNsaWRlID0gcmVxdWlyZSgnLi9zbGlkZS1jb250cm9sbGVyJyk7XG5tZW51ID0gcmVxdWlyZSgnLi9tZW51LWNvbnRyb2xsZXInKTtcbmRvd25sb2FkID0gcmVxdWlyZSgnLi9rcmVhdG9yLWRvd25sb2FkJyk7XG5zaWRlbWVudSA9IHJlcXVpcmUoJy4vc2lkZW1lbnUtY29udHJvbGxlcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGtyZWF0b3IgKCkge1xuXG4gIHdpbmRvdy5BcHAgPSB7XG4gICAgdGl0bGU6ICdLcmVhdG9yLmpzJyxcbiAgICBhdXRob3I6ICdBbmRyZWkgT3ByZWEnLFxuICAgIHRoZW1lOiAnZGVmYXVsdC5jc3MnXG4gIH07XG5cblx0Ly8gRnVsbCBsaXN0IG9mIGNvbmZpZ3VyYXRpb24gb3B0aW9ucyBhdmFpbGFibGUgaGVyZTpcblx0Ly8gaHR0cHM6Ly9naXRodWIuY29tL2hha2ltZWwvcmV2ZWFsLmpzI2NvbmZpZ3VyYXRpb25cblx0UmV2ZWFsLmluaXRpYWxpemUoe1xuICAgIGNvbnRyb2xzOiB0cnVlLFxuXHRcdHByb2dyZXNzOiB0cnVlLFxuXHRcdGhpc3Rvcnk6IHRydWUsXG4gICAgY2VudGVyOiBmYWxzZSxcblxuXHRcdHRoZW1lOiBSZXZlYWwuZ2V0UXVlcnlIYXNoKCkudGhlbWUsIC8vIGF2YWlsYWJsZSB0aGVtZXMgYXJlIGluIC9jc3MvdGhlbWVcblx0XHR0cmFuc2l0aW9uOiBSZXZlYWwuZ2V0UXVlcnlIYXNoKCkudHJhbnNpdGlvbiB8fCAnZGVmYXVsdCcsIC8vIGRlZmF1bHQvY3ViZS9wYWdlL2NvbmNhdmUvem9vbS9saW5lYXIvZmFkZS9ub25lXG5cblx0XHQvLyBPcHRpb25hbCBsaWJyYXJpZXMgdXNlZCB0byBleHRlbmQgb24gcmV2ZWFsLmpzXG5cdFx0ZGVwZW5kZW5jaWVzOiBbXG5cdFx0XHR7IHNyYzogJ2xpYi9tYXJrZWQuanMnLCBjb25kaXRpb246IGZ1bmN0aW9uKCkgeyByZXR1cm4gISFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCAnW2RhdGEtbWFya2Rvd25dJyApOyB9IH0sXG5cdFx0XHR7IHNyYzogJ2xpYi9tYXJrZG93bi5qcycsIGNvbmRpdGlvbjogZnVuY3Rpb24oKSB7IHJldHVybiAhIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoICdbZGF0YS1tYXJrZG93bl0nICk7IH0gfSxcblx0XHRcdHsgc3JjOiAnbGliL2hpZ2hsaWdodC5qcycsIGFzeW5jOiB0cnVlLCBjYWxsYmFjazogZnVuY3Rpb24oKSB7IGhsanMuaW5pdEhpZ2hsaWdodGluZ09uTG9hZCgpOyB9IH1cblx0XHRdXG5cdH0pO1xuXG5cdHNsaWRlLmFkZExpc3RlbmVycyhkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtaGFuZGxlci0tYWRkLXNsaWRlLWRvd24nKSxcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWhhbmRsZXItLWFkZC1zbGlkZS1yaWdodCcpKTtcblxuICBtZW51LmFkZExpc3RlbmVycyh7XG4gICAgdXBsb2FkOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtaGFuZGxlci0tdXBsb2FkJyksXG4gICAgaGVhZGluZzogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWhhbmRsZXItLWhlYWRpbmdzJyksXG4gICAgY29sb3I6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1oYW5kbGVyLS1jb2xvcicpLFxuICAgIHN0eWxlQnV0dG9uczogZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLWhhbmRsZXItLXN0eWxlLWJ1dHRvbicpLFxuICAgIGFsaWdubWVudDogZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpzLWhhbmRsZXItLWFsaWduJyksXG4gICAgY29kZUJsb2NrOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtaGFuZGxlci0tY29kZS1ibG9jaycpLFxuICAgIG92ZXJ2aWV3OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuanMtaGFuZGxlci0tb3ZlcnZpZXcnKSxcbiAgICBsaXN0QnV0dG9uOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtaGFuZGxlci0tbGlzdC1idXR0b24nKSxcbiAgICBoZWFkaW5nVHlwZTogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWhhbmRsZXItLWhlYWRpbmctdHlwZScpLFxuICAgIHF1aWxsRWRpdG9yOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuc2xpZGUtZWRpdC1sb2NrJyksXG4gICAgYWRkU2xpZGVCdXR0b25zOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuYWRkLXNsaWRlJylcbiAgfSk7XG5cbiAgc2lkZW1lbnUuYWRkTGlzdGVuZXJzKHtcbiAgICBwcmVzZW50YXRpb25UaXRsZTogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWhhbmRsZXItLXByZXNlbnRhdGlvbi1uYW1lJyksXG4gICAgdGhlbWVTZWxlY3RvcjogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWhhbmRsZXItLXRoZW1lLXNlbGVjdG9yJyksXG4gICAgaGlkZVNpZGVtZW51OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtaGFuZGxlci0taGlkZS1zaWRlbWVudScpXG4gIH0pO1xuXG4gIGRvd25sb2FkLmFkZExpc3RlbmVyKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1oYW5kbGVyLS1kb3dubG9hZCcpKTtcblxufTtcbiIsInZhciBrcmVhdG9yID0gcmVxdWlyZSgnLi9rcmVhdG9yLmpzJyk7XG52YXIgcG9pbnRlciA9IHJlcXVpcmUoJy4vcG9pbnRlci5qcycpKCdpbTI4OWNzczBieXBoa3Q5Jyk7XG52YXIgdG91ciAgICA9IHJlcXVpcmUoJy4vdG91ci5qcycpO1xuXG5rcmVhdG9yKCk7XG50b3VyKCk7XG5cbnBvaW50ZXIubGlzdGVuKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1oYW5kbGVyLS1pbml0LXJlbW90ZScpKTtcblxuIiwiLyogZ2xvYmFscyBtb2R1bGUsIF8sIFJldmVhbCwgd2luZG93LCBkb2N1bWVudCwgRmlsZVJlYWRlciwgYWxlcnQsIEltYWdlICovXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBhZGRMaXN0ZW5lcnM6IGZ1bmN0aW9uKGhhbmRsZXIpIHtcbiAgICBoYW5kbGVyLnVwbG9hZC5hZGRFdmVudExpc3RlbmVyKCdzdWJtaXQnLCB1cGxvYWRTbGlkZXMsIGZhbHNlKTtcbiAgICBfLmVhY2goaGFuZGxlci5hbGlnbm1lbnQsIGZ1bmN0aW9uKGVsKSB7XG4gICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRleHRBbGlnbm1lbnQsIGZhbHNlKTtcbiAgICB9KTtcbiAgICBfLmVhY2goaGFuZGxlci5vdmVydmlldywgZnVuY3Rpb24oZWwpIHtcbiAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHRvZ2dsZU1lc3NhZ2UoKTtcbiAgICAgICAgdG9nZ2xlTWVudSgpO1xuICAgICAgICBSZXZlYWwudG9nZ2xlT3ZlcnZpZXcoKTtcbiAgICAgIH0sIGZhbHNlKTtcbiAgICB9KTtcbiAgICBfLmVhY2goaGFuZGxlci5zdHlsZUJ1dHRvbnMsIGZ1bmN0aW9uIChlbCkge1xuICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzZXRGb250U3R5bGUsIGZhbHNlKTtcbiAgICB9KTtcbiAgICBfLmVhY2goaGFuZGxlci5xdWlsbEVkaXRvciwgZnVuY3Rpb24gKGVsKSB7XG4gICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGVuYWJsZVF1aWxsRWRpdG9yLCBmYWxzZSk7XG4gICAgfSk7XG4gICAgXy5lYWNoKGhhbmRsZXIuYWRkU2xpZGVCdXR0b25zLCBmdW5jdGlvbihlbCkge1xuICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB1cGRhdGVRdWlsbEVkaXRvckxpc3RlbmVycywgZmFsc2UpO1xuICAgIH0pO1xuICB9XG59O1xuXG52YXIgZWRpdG9yID0gbnVsbDtcblxuLy8gYWRkIG5ldyBldmVudCBsaXN0ZW5lcnMgdG8gdGhlIGVkaXQgYnV0dG9uXG4vLyBvZiBuZXdseSBjcmVhdGVkIHNsaWRlc1xuZnVuY3Rpb24gdXBkYXRlUXVpbGxFZGl0b3JMaXN0ZW5lcnMoKSB7XG4gIF8uZWFjaChkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuc2xpZGUtZWRpdC1sb2NrJyksIGZ1bmN0aW9uIChlbCkge1xuICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZW5hYmxlUXVpbGxFZGl0b3IsIGZhbHNlKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGVuYWJsZVF1aWxsRWRpdG9yICgpIHtcbiAgdG9nZ2xlTWVudSgpO1xuICB0aGlzLmNsYXNzTGlzdC50b2dnbGUoJ2FjdGl2ZScpO1xuICB2YXIgdGFyZ2V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnByZXNlbnQnKTtcbiAgdmFyIGh0bWwgPSB0YXJnZXQucXVlcnlTZWxlY3RvcignLmtyZWF0b3Itc2xpZGUtY29udGVudCcpLmlubmVySFRNTDtcbiAgaWYgKHRoaXMuY2xhc3NMaXN0LmNvbnRhaW5zKCdhY3RpdmUnKSkge1xuICAgIHRhcmdldC5jbGFzc0xpc3QuYWRkKCdzZWN0aW9uLS1lZGl0aW5nJyk7XG4gICAgaWYgKGVkaXRvciA9PSBudWxsKSB7XG4gICAgICBlZGl0b3IgPSBuZXcgUXVpbGwoJy5wcmVzZW50IC5xdWlsbC1zbGlkZS1jb250ZW50Jywge1xuICAgICAgICBtb2R1bGVzOiB7XG4gICAgICAgICAgJ3Rvb2xiYXInOiB7Y29udGFpbmVyOiAnI3RvcG1lbnUnfVxuICAgICAgICB9LFxuICAgICAgICB0aGVtZTogJ3Nub3cnXG4gICAgICB9KTtcbiAgICB9XG4gICAgZWRpdG9yLnNldEhUTUwoaHRtbCk7XG4gIH0gZWxzZSB7XG4gICAgdGFyZ2V0LmNsYXNzTGlzdC5yZW1vdmUoJ3NlY3Rpb24tLWVkaXRpbmcnKTtcbiAgICB2YXIgaHRtbCA9IGVkaXRvci5nZXRIVE1MKCk7XG4gICAgY29uc29sZS5sb2coaHRtbCk7XG4gICAgdGFyZ2V0LnF1ZXJ5U2VsZWN0b3IoJy5rcmVhdG9yLXNsaWRlLWNvbnRlbnQnKS5pbm5lckhUTUwgPSBodG1sO1xuICB9XG59XG5cbmZ1bmN0aW9uIHRvZ2dsZU1lbnUoKSB7XG4gIHRvZ2dsZSgnI3RvcG1lbnUnKTtcbn1cblxuZnVuY3Rpb24gdG9nZ2xlTWVzc2FnZSgpIHtcbiAgdG9nZ2xlKCcjbWVzc2FnZScpO1xufVxuXG5mdW5jdGlvbiB0b2dnbGUoc2VsKSB7XG4gIHZhciBlbGVtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWwpO1xuICBpZihlbGVtLmNsYXNzTGlzdC5jb250YWlucygnaGlkZGVuJykpIHtcbiAgICBlbGVtLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xuICAgIHJldHVybiB0cnVlO1xuICB9IGVsc2Uge1xuICAgIGVsZW0uY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbi8qXG4gKiBIYW5kbGUgZm9ybSBzdWJtaXQgZXZlbnRzXG4gKiByZWFkcyB0aGUgZmlsZSBhcyB0ZXh0XG4gKiAqL1xuZnVuY3Rpb24gdXBsb2FkU2xpZGVzKGUpIHtcbiAgLypqc2hpbnQgdmFsaWR0aGlzOiB0cnVlKi9cbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICB2YXIgZmlsZSA9IHRoaXMucXVlcnlTZWxlY3RvcignaW5wdXRbdHlwZT1maWxlXScpLmZpbGVzWzBdO1xuICBpZiAod2luZG93LkZpbGUgJiYgd2luZG93LkZpbGVSZWFkZXIgJiYgd2luZG93LkZpbGVMaXN0ICYmIHdpbmRvdy5CbG9iKSB7XG4gICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG5cbiAgICByZWFkZXIub25sb2FkID0gKGZ1bmN0aW9uKGZpbGUpIHtcbiAgICAgIHJldHVybiBwYXJzZUZpbGUuYmluZCh0aGlzLCBmaWxlLnR5cGUpO1xuICAgIH0pKGZpbGUpO1xuXG4gICAgaWYgKGZpbGUudHlwZS5tYXRjaCgndGV4dC9odG1sJykpXG4gICAgICByZWFkZXIucmVhZEFzVGV4dChmaWxlLCAndXRmOCcpO1xuICAgIGVsc2VcbiAgICAgIHJlYWRlci5yZWFkQXNEYXRhVVJMKGZpbGUpO1xuICB9IGVsc2Uge1xuICAgIGFsZXJ0KCdGaWxlIHJlYWRpbmcgbm90IHN1cHBvcnRlZCcpO1xuICB9XG59XG5cbi8qXG4gKiBSZWNlaXZlcyB0aGUgdXBsb2FkZWQgZmlsZVxuICogSGFuZGxlIHRleHQvaHRtbCBhbmQgaW1hZ2VzLyogZGlmZmVyZW50bHlcbiAqICovXG5mdW5jdGlvbiBwYXJzZUZpbGUoZmlsZVR5cGUsIGUpIHtcbiAgdmFyIGNvbnRlbnQgPSBlLnRhcmdldC5yZXN1bHQ7XG4gIGlmIChmaWxlVHlwZS5tYXRjaCgndGV4dC9odG1sJykpIHtcbiAgICB2YXIgZHVtbXkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBkdW1teS5pbm5lckhUTUwgPSBjb250ZW50O1xuICAgIGFwcGVuZENvbnRlbnQoZHVtbXkucXVlcnlTZWxlY3RvcignLnNsaWRlcycpLmlubmVySFRNTCk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIGltZyA9IG5ldyBJbWFnZSgpO1xuICAgIGltZy5zcmMgPSBlLnRhcmdldC5yZXN1bHQ7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnByZXNlbnQnKS5hcHBlbmRDaGlsZChpbWcpOyAvLyBGSVhNRVxuICB9XG59XG5cbi8qIEFwcGVuZHMgdGhlIHBhcnNlZCBjb250ZW50IHRvIHRoZSBwYWdlXG4gKiBjb21wbGV0bHkgcmVwbGFjZXMgdGhlIG9sZCBjb250ZW50XG4gKiAqL1xuZnVuY3Rpb24gYXBwZW5kQ29udGVudChjb250ZW50KSB7XG4gIHZhciBzbGlkZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2xpZGVzJyk7XG4gIHNsaWRlcy5pbm5lckhUTUwgPSBjb250ZW50O1xuICBSZXZlYWwudG9nZ2xlT3ZlcnZpZXcoKTtcbiAgUmV2ZWFsLnRvZ2dsZU92ZXJ2aWV3KCk7XG4gIHRvZ2dsZUVkaXRNb2RlKHRydWUpO1xufVxuXG4vKlxuICogVG9nZ2xlIG9uIGFuZCBvZmYgdGhlIGNvbnRlbnRFZGl0YWJsZVxuICogYXR0cmlidXRlIG9uIHRoZSBzbGlkZXNcbiAqICovXG5mdW5jdGlvbiB0b2dnbGVFZGl0TW9kZShtb2RlKSB7XG4gIHZhciBzbGlkZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdzZWN0aW9uJyk7XG4gIF8uZWFjaChzbGlkZXMsIGZ1bmN0aW9uKHMpIHtcbiAgICBzLnNldEF0dHJpYnV0ZSgnY29udGVudEVkaXRhYmxlJywgbW9kZSk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiByZW1vdmVUYWdzKHJlZ2V4LCBzdHJpbmcpIHtcbiAgICByZXR1cm4gc3RyaW5nLnJlcGxhY2UocmVnZXgsICcnKTtcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcG9pbnRlcihrZXkpIHtcblx0XG5cdHJldHVybiB7XG5cdFx0bGlzdGVuOiBmdW5jdGlvbiAoZWxlbWVudCkge1xuXHRcdFx0bGlzdGVuKGtleSwgZWxlbWVudCk7XG5cdFx0fVxuXHR9XG5cbn1cblxudmFyIHBlZXJKU0tleTtcblxuZnVuY3Rpb24gbGlzdGVuKGtleSwgZWxlbWVudCkge1xuXHRwZWVySlNLZXkgPSBrZXk7XG5cdGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBpbml0LCBmYWxzZSk7XG59XG5cbmZ1bmN0aW9uIGluaXQoZSkge1xuXHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdHZhciBwZWVyID0gbmV3IFBlZXIoe2tleTogcGVlckpTS2V5fSk7XG5cdHBlZXIub24oJ29wZW4nLCBmdW5jdGlvbihpZCkge1xuXHRcdGNvbnNvbGUubG9nKCdNeSBwZWVyIElEIGlzOiAnICsgaWQpO1xuXHR9KTtcblx0dmFyIGNvbm4gPSBwZWVyLmNvbm5lY3QocHJvbXB0KFwiUGhvbmUgcmVtb3RlIGlkXCIpKTtcblx0Y29ubi5vbignb3BlbicsIGZ1bmN0aW9uKCkge1xuXHQgIC8vIFJlY2VpdmUgbWVzc2FnZXNcblx0ICBjb25uLm9uKCdkYXRhJywgZnVuY3Rpb24oZGF0YSkge1xuXHQgICAgaWYgKGRhdGEgPT0gJ2xlZnQnKSBSZXZlYWwubGVmdCgpO1xuXHQgICAgaWYgKGRhdGEgPT0gJ3JpZ2h0JykgUmV2ZWFsLnJpZ2h0KCk7XG5cdCAgICBjb25zb2xlLmxvZygncmVjZWl2ZWQnLCBkYXRhKTtcblx0XHRjb25uLnNlbmQoe1xuXHRcdFx0dGl0bGU6IEFwcC50aXRsZSxcblx0XHRcdHNsaWRlOiBSZXZlYWwuZ2V0SW5kaWNlcygpLmhcblx0XHR9KTtcblx0ICB9KTtcblxuXHRcdGNvbm4uc2VuZCh7XG5cdFx0XHR0aXRsZTogQXBwLnRpdGxlLFxuXHRcdFx0c2xpZGU6IFJldmVhbC5nZXRJbmRpY2VzKCkuaFxuXHRcdH0pO1xuXHQgIC8vIFNlbmQgbWVzc2FnZXNcblx0fSk7XG59XG5cbiIsIi8qIGdsb2JhbHMgbW9kdWxlLCBfLCBBcHAgKi9cbid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGFkZExpc3RlbmVyczogZnVuY3Rpb24oaGFuZGxlcikge1xuICAgIGhhbmRsZXIucHJlc2VudGF0aW9uVGl0bGUuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBzZXRQcmVzZW50YXRpb25UaXRsZSwgZmFsc2UpO1xuICAgIGhhbmRsZXIudGhlbWVTZWxlY3Rvci5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBjaGFuZ2VUaGVtZSwgZmFsc2UpO1xuICAgIGhhbmRsZXIuaGlkZVNpZGVtZW51LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgaGlkZVNpZGVtZW51LCBmYWxzZSk7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNpZGVtZW51JykuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VvdmVyJywgc2hvd1NpZGVtZW51LCBmYWxzZSk7XG4gIH1cbn07XG5cbnZhciBpc1NsaWRpbmcgPSBmYWxzZTtcblxuZnVuY3Rpb24gY2hhbmdlVGhlbWUoKSB7XG4gIEFwcC50aGVtZSA9IHRoaXMudmFsdWU7XG4gIHZhciB0aGVtZXMgPSBbXG4gICAgJ2RlZmF1bHQuY3NzJywgJ25pZ2h0LmNzcycsICdiZWlnZS5jc3MnXG4gIF07XG4gIF8uZWFjaCh0aGVtZXMsIHJlbW92ZUNTUyk7XG4gIGFwcGVuZENTUyh0aGlzLnZhbHVlKTtcbn1cblxuZnVuY3Rpb24gYXBwZW5kQ1NTKHRoZW1lKSB7XG4gIHZhciBsaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGluaycpO1xuICBsaW5rLnJlbCA9ICdzdHlsZXNoZWV0JztcbiAgbGluay5ocmVmID0gJ2Nzcy8nICsgdGhlbWU7XG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2hlYWQnKS5hcHBlbmRDaGlsZChsaW5rKTtcbn1cblxuZnVuY3Rpb24gcmVtb3ZlQ1NTKHZhbCkge1xuICB2YXIgc2VsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignbGlua1tyZWw9c3R5bGVzaGVldF1baHJlZiQ9XCInK3ZhbCsnXCJdJyk7XG4gIGlmIChzZWwpIHtcbiAgICBzZWwucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzZWwpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGhpZGVTaWRlbWVudSgpIHtcbiAgdmFyIGVsID0gdGhpcy5wYXJlbnROb2RlO1xuICBlbC5zdHlsZS5tb3pUcmFuc2Zvcm0gPSAndHJhbnNsYXRlWCgtOTAlKSc7XG4gIGVsLnN0eWxlLndlYmtpdFRyYW5zZm9ybSA9ICd0cmFuc2xhdGVYKC05MCUpJztcbiAgZWwuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZVgoLTkwJSknO1xuICBpc1NsaWRpbmcgPSB0cnVlO1xuICB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgaXNTbGlkaW5nID0gZmFsc2U7XG4gIH0sIDMwMCk7XG59XG5cbmZ1bmN0aW9uIHNob3dTaWRlbWVudSgpIHtcbiAgaWYgKGlzU2xpZGluZykge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgZWwgPSB0aGlzO1xuICBlbC5zdHlsZS5tb3pUcmFuc2Zvcm0gPSAndHJhbnNsYXRlWCgwKSc7XG4gIGVsLnN0eWxlLndlYmtpdFRyYW5zZm9ybSA9ICd0cmFuc2xhdGVYKDApJztcbiAgZWwuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZVgoMCknO1xufVxuXG5mdW5jdGlvbiBzZXRQcmVzZW50YXRpb25UaXRsZSgpIHtcbiAgdmFyIHZhbHVlID0gdGhpcy52YWx1ZTtcbiAgaWYgKHdpbmRvdy5fdGltZW91dCkge1xuICAgIGNsZWFySW50ZXJ2YWwod2luZG93Ll90aW1lb3V0KTtcbiAgICB3aW5kb3cuX3RpbWVvdXQgPSAwO1xuICB9XG4gIHdpbmRvdy5fdGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgZG9jdW1lbnQudGl0bGUgPSB2YWx1ZTtcbiAgICBBcHAudGl0bGUgPSB2YWx1ZTtcbiAgfSwgMzAwKTtcbn1cbiIsIi8qIGdsb2JhbHMgbW9kdWxlLCBkb2N1bWVudCwgUmV2ZWFsICovXG5cbnZhciBhZGRMaXN0ZW5lcnMgPSBmdW5jdGlvbiAoYWRkRG93biwgYWRkUmlnaHQpIHtcblx0YWRkRG93bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHNsaWRlc0NvbnRyb2xsZXIuYWRkU2xpZGVEb3duLCAnZmFsc2UnKTtcblx0YWRkUmlnaHQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzbGlkZXNDb250cm9sbGVyLmFkZFNsaWRlUmlnaHQsICdmYWxzZScpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdGFkZExpc3RlbmVyczogYWRkTGlzdGVuZXJzXG59O1xuXG52YXIgc2xpZGVzQ29udHJvbGxlciA9IHtcbiAgc2xpZGVzUGFyZW50OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2xpZGVzJyksXG4gIGFkZFNsaWRlRG93bjogZnVuY3Rpb24oKSB7XG4gICAgLy8gdG8gYWRkIGEgc2xpZGUgZG93biB3ZSBtdXN0IGFkZCBhIHNlY3Rpb25cbiAgICAvLyBpbnNpZGUgdGhlIGN1cnJlbnQgc2xpZGUuXG4gICAgLy8gV2Ugc2VsZWN0IGl0IGFuZCB0aGUgc2VjdGlvbiBpbnNpZGVcbiAgICB2YXIgY3VycmVudFNsaWRlID0gc2xpZGVzQ29udHJvbGxlci5wcmVzZW50U2xpZGUoKTtcbiAgICB2YXIgY2hpbGRyZW4gPSBjdXJyZW50U2xpZGUucXVlcnlTZWxlY3Rvcignc2VjdGlvbicpO1xuICAgIGlmICghY2hpbGRyZW4pIHtcbiAgICAgIHZhciBwYXJlbnRTbGlkZSA9IHNsaWRlc0NvbnRyb2xsZXIubmV3U2xpZGUoKTtcbiAgICAgIHZhciBzbGlkZTEgPSBzbGlkZXNDb250cm9sbGVyLm5ld1NsaWRlKCk7XG4gICAgICB2YXIgc2xpZGUyID0gc2xpZGVzQ29udHJvbGxlci5uZXdTbGlkZSgpO1xuICAgICAgc2xpZGUxLmlubmVySFRNTCA9IGN1cnJlbnRTbGlkZS5pbm5lckhUTUw7XG4gICAgICBwYXJlbnRTbGlkZS5pbm5lckhUTUwgPSAnJztcbiAgICAgIHBhcmVudFNsaWRlLmFwcGVuZENoaWxkKHNsaWRlMSk7XG4gICAgICBwYXJlbnRTbGlkZS5hcHBlbmRDaGlsZChzbGlkZTIpO1xuICAgICAgY3VycmVudFNsaWRlLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKHBhcmVudFNsaWRlLCBjdXJyZW50U2xpZGUpO1xuICAgICAgUmV2ZWFsLnRvZ2dsZU92ZXJ2aWV3KCk7XG4gICAgICBSZXZlYWwudG9nZ2xlT3ZlcnZpZXcoKTtcbiAgICAgIFJldmVhbC5kb3duKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBzbGlkZSA9IHNsaWRlc0NvbnRyb2xsZXIubmV3U2xpZGUoKTtcbiAgICAgIGN1cnJlbnRTbGlkZS5hcHBlbmRDaGlsZChzbGlkZSk7XG4gICAgICBSZXZlYWwudG9nZ2xlT3ZlcnZpZXcoKTtcbiAgICAgIFJldmVhbC50b2dnbGVPdmVydmlldygpO1xuICAgICAgUmV2ZWFsLmRvd24oKTtcbiAgICB9XG4gIH0sXG4gIGFkZFNsaWRlUmlnaHQ6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzbGlkZSA9IHNsaWRlc0NvbnRyb2xsZXIubmV3U2xpZGUoKTtcbiAgICBzbGlkZXNDb250cm9sbGVyLnNsaWRlc1BhcmVudC5hcHBlbmRDaGlsZChzbGlkZSk7XG4gICAgUmV2ZWFsLnJpZ2h0KCk7XG4gIH0sXG4gIHByZXNlbnRTbGlkZTogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5wcmVzZW50Jyk7XG4gIH0sXG4gIG5ld1NsaWRlOiBmdW5jdGlvbigpIHsgLy8gdGhlIG5ldyBzbGlkZSBpcyBhIGNsb25lIG9mIHRoZSBjdXJyZW50IG9uZVxuICAgIHZhciBzbGlkZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5wcmVzZW50JykuY2xvbmVOb2RlKHRydWUpO1xuICAgIHZhciBjb250ZW50ID0gc2xpZGUucXVlcnlTZWxlY3RvcignLmtyZWF0b3Itc2xpZGUtY29udGVudCcpO1xuICAgIGNvbnRlbnQuaW5uZXJIVE1MID0gJyc7XG4gICAgcmV0dXJuIHNsaWRlO1xuICB9XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgdG91ckhhbmRsZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtaGFuZGxlci0tcmVzdGFydC10b3VyJyk7XG5cbiAgICB0b3VySGFuZGxlci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHJlc3RhcnRUb3VyLCBmYWxzZSk7XG5cbiAgICB2YXIgdG91ciA9IG5ldyBTaGVwaGVyZC5Ub3VyKHtcbiAgICAgICAgZGVmYXVsdHM6IHtcbiAgICAgICAgICAgIGNsYXNzZXM6ICdzaGVwaGVyZC10aGVtZS1hcnJvd3MnLFxuICAgICAgICAgICAgc2Nyb2xsVG86IGZhbHNlXG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHRvdXIuYWRkU3RlcCgnaW50cm8nLCB7XG4gICAgICAgIHRleHQ6ICdUaGlzIGlzIGEgZ3VpZGVkIGludHJvZHVjdGlvbiB0byBLcmVhdG9yLmpzIDxicj4gSXQgd2lsbCBzaG93IHlvdSBob3cgdG8gY29udHJvbCBhbmQgc3R5bGUgdGhlIGNvbnRlbnQgPGJyPiBZb3UgY2FuIGNhbmNlbCBpZiB5b3Uga25vdyB3aGF0IHRvIGRvIG9yIGNsaWNrIHN0YXJ0IDxicj4nLFxuICAgICAgICBidXR0b25zOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGV4dDogJ0NhbmNlbCcsXG4gICAgICAgICAgICAgICAgYWN0aW9uOiBmaW5pc2hUb3VyXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRleHQ6ICdTdGFydCcsXG4gICAgICAgICAgICAgICAgYWN0aW9uOiB0b3VyLm5leHRcbiAgICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgIH0pXG5cbiAgICB0b3VyLmFkZFN0ZXAoJ2V4YW1wbGUtc3RlcCcsIHtcbiAgICAgICAgdGV4dDogJ1RoaXMgaXMgdGhlIG1haW4gY29udHJvbCBmb3IgdGhlIGNvbnRlbnQnLFxuICAgICAgICBhdHRhY2hUbzogJy50b3BtZW51JyxcbiAgICAgICAgYnV0dG9uczogW3tcbiAgICAgICAgICAgIHRleHQ6ICdOZXh0JyxcbiAgICAgICAgICAgIGFjdGlvbjogdG91ci5uZXh0XG4gICAgICAgIH1dLFxuICAgICAgICB0ZXRoZXJPcHRpb25zOiB7XG4gICAgICAgICAgICBhdHRhY2htZW50OiAnYm90dG9tIGNlbnRlcicsXG4gICAgICAgICAgICB0YXJnZXRBdHRhY2htZW50OiAndG9wIGNlbnRlcidcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgdG91ci5hZGRTdGVwKCdleGFtcGxlLXN0ZXAnLCB7XG4gICAgICAgIHRleHQ6ICdTZXQgdGhlIHRleHQgdG8gYm9sZCwgaXRhbGljIG9yIHVuZGVybGluZWQnLFxuICAgICAgICBhdHRhY2hUbzogJy5qcy1oYW5kbGVyLS1zdHlsZS1idXR0b24nLFxuICAgICAgICB0ZXRoZXJPcHRpb25zOiB7XG4gICAgICAgICAgICBhdHRhY2htZW50OiAnYm90dG9tIGxlZnQnLFxuICAgICAgICAgICAgdGFyZ2V0QXR0YWNobWVudDogJ3RvcCBsZWZ0J1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICB0b3VyLmFkZFN0ZXAoJ2V4YW1wbGUtc3RlcCcsIHtcbiAgICAgICAgdGV4dDogJ01ha2UgYSBidWxsZXQgbGlzdCcsXG4gICAgICAgIGF0dGFjaFRvOiAnLmpzLWhhbmRsZXItLWxpc3QtYnV0dG9uJyxcbiAgICAgICAgdGV0aGVyT3B0aW9uczoge1xuICAgICAgICAgICAgYXR0YWNobWVudDogJ2JvdHRvbSBsZWZ0JyxcbiAgICAgICAgICAgIHRhcmdldEF0dGFjaG1lbnQ6ICd0b3AgbGVmdCdcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgdG91ci5hZGRTdGVwKCdleGFtcGxlLXN0ZXAnLCB7XG4gICAgICAgIHRleHQ6ICdBbGlnbiBsZWZ0LCBjZW50ZXIgb3IgcmlnaHQgICcsXG4gICAgICAgIGF0dGFjaFRvOiAnLmpzLWhhbmRsZXItLWFsaWduJyxcbiAgICAgICAgdGV0aGVyT3B0aW9uczoge1xuICAgICAgICAgICAgYXR0YWNobWVudDogJ2JvdHRvbSBsZWZ0JyxcbiAgICAgICAgICAgIHRhcmdldEF0dGFjaG1lbnQ6ICd0b3AgbGVmdCdcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgdG91ci5hZGRTdGVwKCdleGFtcGxlLXN0ZXAnLCB7XG4gICAgICAgIHRleHQ6ICdBbGlnbiBsZWZ0LCBjZW50ZXIgb3IgcmlnaHQnLFxuICAgICAgICBhdHRhY2hUbzogJy5qcy1oYW5kbGVyLS1hbGlnbicsXG4gICAgICAgIHRldGhlck9wdGlvbnM6IHtcbiAgICAgICAgICAgIGF0dGFjaG1lbnQ6ICdib3R0b20gbGVmdCcsXG4gICAgICAgICAgICB0YXJnZXRBdHRhY2htZW50OiAndG9wIGxlZnQnXG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHRvdXIuYWRkU3RlcCgnZXhhbXBsZS1zdGVwJywge1xuICAgICAgICB0ZXh0OiAnU2V0IHRoZSB0ZXh0IGNvbG9yJyxcbiAgICAgICAgYXR0YWNoVG86ICcuanMtaGFuZGxlci0tY29sb3InLFxuICAgICAgICB0ZXRoZXJPcHRpb25zOiB7XG4gICAgICAgICAgICBhdHRhY2htZW50OiAnYm90dG9tIGxlZnQnLFxuICAgICAgICAgICAgdGFyZ2V0QXR0YWNobWVudDogJ3RvcCBsZWZ0J1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICB0b3VyLmFkZFN0ZXAoJ2V4YW1wbGUtc3RlcCcsIHtcbiAgICAgICAgdGV4dDogJ0FkZCBzbGlkZScsXG4gICAgICAgIGF0dGFjaFRvOiAnLmpzLWhhbmRsZXItLWFkZC1zbGlkZS1yaWdodCcsXG4gICAgICAgIHRldGhlck9wdGlvbnM6IHtcbiAgICAgICAgICAgIGF0dGFjaG1lbnQ6ICd0b3AgbGVmdCcsXG4gICAgICAgICAgICB0YXJnZXRBdHRhY2htZW50OiAndG9wIHJpZ2h0J1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICB0b3VyLmFkZFN0ZXAoJ2V4YW1wbGUtc3RlcCcsIHtcbiAgICAgICAgdGV4dDogJ1ByZXNlbnRhdGlvbiBuYW1lJyxcbiAgICAgICAgYXR0YWNoVG86ICcuanMtaGFuZGxlci0tcHJlc2VudGF0aW9uLW5hbWUnLFxuICAgICAgICB0ZXRoZXJPcHRpb25zOiB7XG4gICAgICAgICAgICBhdHRhY2htZW50OiAndG9wIHJpZ2h0JyxcbiAgICAgICAgICAgIHRhcmdldEF0dGFjaG1lbnQ6ICd0b3AgbGVmdCdcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgdG91ci5hZGRTdGVwKCdleGFtcGxlLXN0ZXAnLCB7XG4gICAgICAgIHRleHQ6ICdDaGFuZ2UgdGhlIHRoZW1lJyxcbiAgICAgICAgYXR0YWNoVG86ICcuanMtaGFuZGxlci0tdGhlbWUtc2VsZWN0b3InLFxuICAgICAgICB0ZXRoZXJPcHRpb25zOiB7XG4gICAgICAgICAgICBhdHRhY2htZW50OiAndG9wIHJpZ2h0JyxcbiAgICAgICAgICAgIHRhcmdldEF0dGFjaG1lbnQ6ICd0b3AgbGVmdCdcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgdG91ci5hZGRTdGVwKCdleGFtcGxlLXN0ZXAnLCB7XG4gICAgICAgIHRleHQ6ICdEb3dubG9hZCB3aGVuIHlvdSBhcmUgYWxsIGRvbmUnLFxuICAgICAgICBhdHRhY2hUbzogJy5qcy1oYW5kbGVyLS1kb3dubG9hZCcsXG4gICAgICAgIHRldGhlck9wdGlvbnM6IHtcbiAgICAgICAgICAgIGF0dGFjaG1lbnQ6ICd0b3AgcmlnaHQnLFxuICAgICAgICAgICAgdGFyZ2V0QXR0YWNobWVudDogJ3RvcCBsZWZ0J1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICB0b3VyLmFkZFN0ZXAoJ2V4YW1wbGUtc3RlcCcsIHtcbiAgICAgICAgdGV4dDogJ1RoYXQgaXMgYWxsLiBJIGhvcGUgeW91IG1ha2UgYSBncmVhdCBwcmVzZW50YXRpb24hJyxcbiAgICAgICAgYnV0dG9uczogW3tcbiAgICAgICAgICAgICd0ZXh0JzogJ1N0YXJ0IHdyaXRpbmcnLFxuICAgICAgICAgICAgYWN0aW9uOiBmaW5pc2hUb3VyXG4gICAgICAgIH1dXG4gICAgfSk7XG5cbiAgICBpZiAoIWxvY2FsU3RvcmFnZS5nZXRJdGVtKCd0b3VyJykpIHRvdXIuc3RhcnQoKTtcblxuICAgIGZ1bmN0aW9uIGZpbmlzaFRvdXIoKSB7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCd0b3VyJywgJ2NvbXBsZXRlJyk7XG4gICAgICAgIHRvdXIuaGlkZSgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlc3RhcnRUb3VyKCkge1xuICAgICAgICB0b3VyLnN0YXJ0KCk7XG4gICAgfVxufVxuIl19
