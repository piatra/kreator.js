var kreator = require('./kreator.js');
var pointer = require('./pointer.js')('im289css0byphkt9');
var tour    = require('./tour.js');

kreator();
tour();

pointer.listen(document.querySelector('.js-handler--init-remote'));