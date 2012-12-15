require.config({
	paths: { 
		jquery: './jquery-1.8.2.min'
	} 
});

require(["script"], function(Kreator) {
	Kreator.init();
});