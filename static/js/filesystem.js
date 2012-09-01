define(function () {
	var fs = (function(){

		var directory;

		var getDirectory = function () {
			directory = localStorage.getItem('directory') || '';
		};

		var init = function () {
			window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
			window.requestFileSystem(window.TEMPORARY, 5*1024*1024, initFS, errorHandler);
		};

		var initFS = function (fs) {
			alert("Welcome to Filesystem! It's showtime :)"); // Just to check if everything is OK :)
			// place the functions you will learn bellow here
		};

		var createDir = function (dirname) {
			directory = dirname || 'Kreator';
			localStorage.setItem(directory);

			fs.root.getDirectory(directory, {create: true}, function(dirEntry) {
				alert('You have just created the ' + dirEntry.name + ' directory.');
			}, errorHandler);
		};

		var createFile = function (fname) {
			if(!directory) getDirectory();

			fs.root.getFile(dirname+'/slides.txt', {create: true, exclusive: true}, function(fileEntry) {
				alert('A file ' + fileEntry.name + ' was created successfully.');
			}, errorHandler);
		};

		var writeToFile = function (content) {
			if(!directory) getDirectory();
			fs.root.getFile(dirname+'/test.txt', {create: false}, function(fileEntry) {
				fileEntry.createWriter(function(fileWriter) {
					window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder; 
					var bb = new BlobBuilder();
					bb.append(content);
					fileWriter.write(bb.getBlob('text/plain')); 
				}, errorHandler);
			}, errorHandler);			
		};

		var getContent = function () {
			if(!directory) getDirectory();
			fs.root.getFile(dirname+'/test.txt', {}, function(fileEntry) {
				fileEntry.file(function(file) {
					var reader = new FileReader();
					reader.onloadend = function(e) {
						console.log(this.result);          
					};
					reader.readAsText(file);
				}, errorHandler);
			}, errorHandler);
		};

		var errorHandler = function (err) {
			var msg = 'An error occured: ';

			switch (err.code) { 
				case FileError.NOT_FOUND_ERR: 
				msg += 'File or directory not found'; 
				break;

				case FileError.NOT_READABLE_ERR: 
				msg += 'File or directory not readable'; 
				break;

				case FileError.PATH_EXISTS_ERR: 
				msg += 'File or directory already exists'; 
				break;

				case FileError.TYPE_MISMATCH_ERR: 
				msg += 'Invalid filetype'; 
				break;

				default:
				msg += 'Unknown Error'; 
				break;
			}

			console.log(msg);
		};

		return {
			init: init
		};

	})();

	return fs;
});