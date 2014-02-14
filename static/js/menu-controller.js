module.exports = {
  addListeners: function(handler) {
    handler.upload.addEventListener('submit', uploadSlides, false);
    handler.heading.addEventListener('change', setHeading, false);
    handler.color.addEventListener('change', setColor, false);
    _.each(handler.styleButtons, function (el) {
      el.addEventListener('click', setFontStyle, false);
    });
  }
};

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
      return parseFile;
    })(file);

    reader.readAsText(file, 'utf8');
  } else {
    alert('File reading not supported');
  }
}

/*
 * Should parse the file and extract the slide content
 * */
function parseFile(e) {
  var content = e.target.result;
  appendContent(content);
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
 * Set the heading on the current selection
 * */
function setHeading() {
  replaceSelectionWithHtml('<span style="font-size:'+this.value+'">' + getSelectionHtml() + '</span>');
}

function setColor() {
  console.log(this.value);
  replaceSelectionWithHtml('<span style="color:'+this.value+'">' + getSelectionHtml() + '</span>');
}

function getSelectionHtml() {
    var html = "";
    if (typeof window.getSelection != "undefined") {
        var sel = window.getSelection();
        if (sel.rangeCount) {
            var container = document.createElement("div");
            for (var i = 0, len = sel.rangeCount; i < len; ++i) {
                container.appendChild(sel.getRangeAt(i).cloneContents());
            }
            html = container.innerHTML;
        }
    } else if (typeof document.selection != "undefined") {
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
