module.exports = {
  addListeners: function(handler) {
    handler.presentationTitle.addEventListener('keyup', setPresentationTitle, false);
    handler.themeSelector.addEventListener('change', changeTheme, false);
  }
};

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
