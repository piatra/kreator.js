define(function () {
	
	var settings = (function () {

		var settings = '';

		var set = function (data, key) {
			settings = getSettings(key);
			if(key) {
				if(settings.indexOf(data) < 0) {
					settings.push(data);
				}
			} else {
				if(!settings[data[0]]) settings[data[0]] = [];
				if(settings[data[0]].indexOf(data[1]) < 0) {
					var arr = data[1].split(":")[0].trim()
						, prop
						, pass = 1
						, replace;
					settings[data[0]].map(function (attr, idx) {
						prop = attr.split(":")[0].trim();
						if(prop === arr) {
							pass = 0;
							replace = idx;
						}
					});
					if(pass) settings[data[0]].push(data[1]);
					else settings[data[0]][replace] = data[1];
				}
			}
			saveSettings(key);
		};

		var get = function (key) {
			var key = key || 'settings';
			var settings = JSON.parse(localStorage.getItem(key));
			if(settings) {
				if(settings.length == 1) {
					return settings[0];
				} else {
					return settings;
				}
			} else {
				return null;
			}
		};

		var remove = function (keys) {
			if(!Array.isArray(keys)) keys = [keys];
			keys.map(function (key) {
				localStorage.removeItem(key);
			})
		};

		var copy = function(oldkey, newkey) {
			settings = getSettings();
			console.log(settings);
			settings[newkey] = settings[oldkey];
			delete settings[oldkey];
			console.log(settings);
			saveSettings();
		};

		var saveSettings = function (key) {
			if(key) {
				localStorage.setItem(key, JSON.stringify(settings));
			} else {
				localStorage.setItem('settings', JSON.stringify(settings));
			}
		};

		var getSettings = function (key) {
			if(key) {
				return JSON.parse(localStorage.getItem(key)) || [];
			} else {
				return JSON.parse(localStorage.getItem('settings')) || {};
			}
		};

		var clear = function () {
			localStorage.clear();
		}

		return {
			  set: set
			, get: get
			, remove: remove
			, clear: clear
			, copy: copy
		};

	})();
	
	return settings;
});