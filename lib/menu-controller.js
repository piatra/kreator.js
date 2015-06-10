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
