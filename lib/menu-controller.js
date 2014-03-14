/* globals module, _, App, Reveal */
'use strict';

module.exports = {
  addListeners: function(handler) {
    handler.upload.addEventListener('submit', uploadSlides, false);
    handler.heading.addEventListener('change', setHeading, false);
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
  } else {
    elem.classList.add('hidden');
  }
}

/*
 * Handle form submit events
 * reads the file as text
 * */
function uploadSlides(e) {
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

function textAlignment() {
  var property = 'display:block;text-align:' + this.getAttribute('data-align');
  replaceSelectionWithHtml('<span style="'+property+'">' + getSelectionHtml() + '</span>');
}

function setFontStyle() {
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
function setHeading() {
  replaceSelectionWithHtml('<span style="font-size:'+this.value+'">' + getSelectionHtml() + '</span>');
  this.value = 'none';
}

function setColor() {
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
