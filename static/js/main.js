require.config({
	paths: { 
		jquery: './jquery-1.9.1.min'
	} 
});

require(["script"], function(Kreator) {
	Kreator.init();
});