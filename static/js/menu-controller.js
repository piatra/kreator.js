module.exports = {
  addListeners: function(handler) {
    handler.upload.addEventListener('submit', uploadSlides, false);
    console.log(handler.upload);
  }
};

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

function parseFile(e) {
  var content = e.target.result;
  appendContent(content);
}

function appendContent(content) {
  var slides = document.querySelector('.slides');
  slides.innerHTML = content;
  Reveal.toggleOverview();
  Reveal.toggleOverview();
}
