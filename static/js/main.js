var query = {};
location.search.replace( /[A-Z0-9]+?=(\w*)/gi, function(a) {
query[ a.split( '=' ).shift() ] = a.split( '=' ).pop();
} );

Reveal.initialize({
	progress: true
});

google.load("webfont", "1");

require.config({
	paths: { 
		jquery: './jquery-1.9.1.min'
	} 
});

require(["script"], function(Kreator) {
	Kreator.init();
});