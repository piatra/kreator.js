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
  var url = location.origin + '/download/../'; // up one folder hack due to url hash /#/
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
