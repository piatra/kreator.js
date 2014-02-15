module.exports = {
  addListener: function(el) {
    el.addEventListener('click', downloadSlides, false);
  }
};


function downloadSlides() {
  var parts = ['head.html', 'tail.html'];
  var content = [];
  var url = location.origin + '/download/';
  var l = parts.length;
  parts.map(function(p) {
    return url + p;
  }).forEach(function(url) {
    requestPart(url)
      .then(function (resp) {
        content.push(resp);
        if (--l === 0) {
          createZip(content);
        }
      });
  });
}

function createZip(content) {
  var slides = document.querySelector('.slides').innerHTML;
  content.splice(1,0,slides);
  content = content.join('');
  var zip = new JSZip();
  zip.file('index.html', content);

  content = zip.generate({type: 'blob'});
  var link = document.querySelector('.js-handler--download-ready');
  link.href = window.URL.createObjectURL(content);
  link.download = 'You presentation';
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
