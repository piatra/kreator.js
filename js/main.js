var kreator = require('./kreator.js');
var pointer = require('./pointer.js')('im289css0byphkt9');

kreator();

pointer.listen(document.querySelector('.js-handler--init-remote'));
