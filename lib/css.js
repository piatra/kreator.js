var GenerateCSS = (function(){
	
	var parse = function (params) {
		if(params !== 'null') {
			params = JSON.parse(params);
			var css = ''
				, keys = Object.keys(params);
			keys.forEach(function(key){
				if(Array.isArray(params[key])) {
					var declarations = params[key].join(';');
					css += ' ' + key + '{' + declarations + '}';
				} else {
					css += ' ' + key + ' {' + params[key] + '}';
				}
			})

			return css;

		} else 
			return '';
	};

	return {
		parse: parse
	}

})();

module.exports = GenerateCSS;