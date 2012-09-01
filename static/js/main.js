require.config({
	paths: { 
		jquery: './jquery-1.7.2.min'
	} 
});

require(["script"], function(Kreator) {
	Kreator.init();
});