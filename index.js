var express = require('express'),
	app = express(),
	async = require('async'),
	request = require('request'),
	zip = require('node-native-zip'),
	fs = require('fs'),
	filelist = [
		"http://localhost:3000/get/head.html",
		"http://localhost:3000/get/tail.html",
		"http://localhost:3000/get/main.css",
		"http://localhost:3000/get/head.min.js",
		"http://localhost:3000/get/reveal.js",
		"http://localhost:3000/get/highlight.js",
		"http://localhost:3000/get/classList.js",
		"http://localhost:3000/get/zenburn.css",
		"http://localhost:3000/get/reset.css",
		"http://localhost:3000/get/print.css",
		"http://localhost:3000/get/start.sh",
		"http://localhost:3000/get/kreator.css",
		"http://localhost:3000/get/middle.html",
		"http://localhost:3000/get/night.css"
	],
	pub = __dirname + '/static',
	less = require('less'),
	parser = new(less.Parser),
	generateCSS = require('./lib/css.js'),
	cheerio = require('cheerio');

app.configure(function(){
	app.use(express.bodyParser());
	app.use(express.static(pub));
	app.use(express.errorHandler());
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.locals.pretty = true;
});

var fetch = function(file,cb){
	request.get(file, function(err,response,body){
		if (err) {
			cb(err);
		} else {
			cb(null, body); // First param indicates error, null=> no error
		}
	});
};

app.get('/', function(req, res) {
	res.render('layout');
});

app.get('/get/:file', function(req, res) {
	var filename = __dirname + '/static/download/' + req.params.file;

	var ReadFile = require('./lib/readFile.js');
	ReadFile.get(filename, function(err, readStream){
		if(err) {
			res.end(err);
		} else {
			readStream.pipe(res);
		}
	});
});

app.post('/', function(req, res) {
	
	filelist[0] = 'http://localhost:3000/get/' + req.body.theme + '.html';

	async.map(filelist, fetch, function(err, results){
		if (err) {
			console.log('Error!');
		} else {
			var $ = cheerio.load(results[0]);
			
			$('title').text(req.body.title);
			$('meta[name=author]').attr('content', req.body.author);
			$('meta[name=description]').attr('content', req.body.description);
			var content = $.html();
			content = content.replace('</head></html>', '');
			
			content += req.body.webfont;
			content += results[12];
			
			var slides = req.body.slides;
			var css = results[11] + generateCSS.parse(req.body.params);
			console.log(css);

			parser.parse(css, function (err, tree) {
				if (err) {
					return console.error(err);
				}
				results[11] = tree.toCSS();
			});

			slides = JSON.parse(slides);
			
			for (var i in slides) {
				if(Array.isArray(slides[i])) {
					var array = slides[i];
					content += '<section>';
					array.forEach(function(s){
						var $ = cheerio.load(s);
						$('div').removeAttr('style');
						$('.visible').removeClass('visible');
						var img = $('img');
						img.attr('src', img.attr('data-path'));
						img.removeAttr('data-path');
						content += '<section>' + $.html() + '</section>';
					});
					content += '</section>';
				} else {
					$ = cheerio.load(slides[i]);
					$('div').removeAttr('style');
					$('.visible').removeClass('visible');
					var img = $('img');
					img.attr('src', img.attr('data-path'));
					img.removeAttr('data-path');
					content += $.html();
				}
			}
			content += results[1];
			var archive = new zip();
			archive.add('index.html', new Buffer(content, "utf8"));
			archive.add('css/main.css', new Buffer(results[2], "utf8"));
			archive.add('lib/js/head.min.js', new Buffer(results[3], "utf8"));
			archive.add('js/reveal.js', new Buffer(results[4], "utf8"));
			archive.add('lib/js/highlight.js', new Buffer(results[5], "utf8"));
			archive.add('lib/js/classList.js', new Buffer(results[6], "utf8"));
			archive.add('lib/css/zenburn.css', new Buffer(results[7], "utf8"));
			archive.add('css/reset.css', new Buffer(results[8], "utf8"));
			archive.add('css/print.css', new Buffer(results[9], "utf8"));
			archive.add('start.sh', new Buffer(results[10]));
			archive.add('css/kreator.css', new Buffer(results[11], "utf8"));
			archive.add('css/night.css', new Buffer(results[13], "utf8"));
			res.attachment('kreator_'+(new Date).getTime().toString()+'.zip');
			res.send(archive.toBuffer());
		}
	});
});

app.listen(process.env.PORT || 3000, "localhost");