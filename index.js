var express = require('express'),
	app = express(),
	cheerio = require('cheerio');

app.configure(function(){
	app.set('port', process.env.PORT || 3000);
	app.set('views', path.join(__dirname, 'views'));
	app.set('view engine', 'jade');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.json());
	app.use(express.urlencoded());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(require('stylus').middleware(path.join(__dirname, 'static')));
	app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));
	app.use(express.static(path.join(__dirname, 'static')));
	app.locals.pretty = true;
});

app.get('/', function(req, res) {
	res.render('index');
});


app.listen(3000);
console.log('Listening on port 3000');
