var ReadFile = (function() {

	var fs = require('fs');

	var get = function(filename, cb) {
		fs.stat(filename, function(err, stat) {
			if(err) {
				if(err.code === 'ENOENT') {
					console.log('not found',filename);
					cb('File not found :(', null);
				} else {
					console.log('error',filename)
					cb('An error occured', null);
				}
			} else {
				var readStream = fs.createReadStream(filename);
				cb(null, readStream);
			}
		});	
	};

	return {
		get: get
	}

})();

module.exports = ReadFile;