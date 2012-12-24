define(function(){
	var replaceHtmlEntites = (function() {
		var translate_re = /&(nbsp|amp|quot|lt|gt);/g;
		var translate = {
			"nbsp": " ", 
			"amp" : "&", 
			"quot": "\"",
			"lt"  : "<", 
			"gt"  : ">"
		};
		var convertTags = function (content) {
			var string = content.replace(new RegExp(' contenteditable="true"',"g"),'')
				.replace(new RegExp(' contenteditable="false"',"g"),'')
				.replace(new RegExp(' contenteditable',"g"),'')
				.replace(new RegExp('=""',"g"),'');
			
			var $string = $(string);
			var span = $string.children('div');
			$string.children('div').each(function(idx, el){ 
				$(el).replaceWith('<span>' + $(span[idx]).html() + '</span>');
			});
			return string;
		};
		var findTags = function (str) {
			if(str) {
				var regexp = /<h[1-4]>/gi;	
				var matches_array = str.match(regexp);
				if(matches_array && matches_array.length) {
					return matches_array[0].substring(2,3);
				} else {
					return 0;
				}
			} else {
				return 0;
			}
		};
		return {
			  convertTags: convertTags
			, findTags : findTags
		};
	})();
	return replaceHtmlEntites;
});