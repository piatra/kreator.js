define(['settings'], function(settings){
	
	var slideTemplate = (function(settings){

		var updateSettings = function(e){
			e.preventDefault();
			e.stopPropagation();
			var color1 = $('input', $('#modal')).eq(3).val();
			var color2 = $('input', $('#modal')).eq(4).val();
			var fontsize = $('input', $('#modal')).eq(5).val();
			var unprefixBg = 'radial-gradient(circle, '+color1+', '+color2+')';
			var webkitBg = '-webkit-'+unprefixBg;
			var mozBg = '-moz-'+unprefixBg;
			$('body').css('background', webkitBg);
			
			settings.set(['body', 'background:' + webkitBg + ';background:' + mozBg + ';background:' + unprefixBg]);
		};

		var finishedSettings = function(e){
			e.preventDefault();
			e.stopPropagation();
			$('section').html('');
		};

		var showSettings = function(s) {
			var modal = $('#modal');
			if(!modal.length) modal = $('<div/>').attr('id', 'modal');
			else modal.toggleClass('hide');
			var that = this;
			modal.load('./layouts/settings.html', function(){
				modal.appendTo(that);
				$('input[type=range]', $(this)).on('change', function(){
					$('.reveal section').css({
						'font-size' : this.value + 'px'
					});
					settings.set(['body', 'font-size: '+this.value+'px']);
				});
				$('#select-theme').on('change', function(){
					var theme =  $(this).val();
					$('body').removeAttr('style');
					$('html').removeClass().addClass(theme);
					theme = theme.split('-')[1];
					if(theme === 'night')
						$('head').append( $('<link rel="stylesheet" type="text/css" />').attr('href', 'get/night.css') );
				});
				$('input[type=color]', $(this)).on('change', updateSettings);
				$('.close', $(this)).on('click', function(){
					modal.toggleClass('hide');
				});
				$('#settings-finished', $(this)).on('click', function(){
					modal.toggleClass('hide');
				});
				$('#presentation-title', $(this)).on('focusout', function(){
					var title = $(this).val();
					settings.remove('title');
					settings.set(title, 'title');
					document.title = title;
				});
				$('#presentation-author', $(this)).on('focusout', function () {
					var author = $(this).val();
					settings.set(author, 'author');
				});
				$('#presentation-description', $(this)).on('focusout', function () {
					var description = $(this).val();
					settings.set(description, 'description');
				});
				$('#clear-storage', $(this)).on('click', function () {
					if(confirm('Delete settings ?')) {
						settings.clear();
					}
				});
			});
		};

		var uploadImages = function () {
			var modal = $('#modal');
			if(!modal.length) modal = $('<div/>').attr('id', 'modal');
			else modal.toggleClass('hide');
			var that = this;
			modal.load('./layouts/uploadImages.html', function(){
				modal.appendTo($('.reveal'));
				$('.close', $(this)).on('click', function(){
					modal.toggleClass('hide');
					that.removeClass('active');
				});
				$('.btn', $(this)).on('click', function(){
					modal.toggleClass('hide');
					that.removeClass('active');
				});
				document.querySelector('#upload').addEventListener('change', function (evt) {
					var files = evt.target.files; // FileList object

					// Loop through the FileList and render image files as thumbnails.
					for (var i = 0, f; f = files[i]; i++) {
						
						// Only process image files.
						if (!f.type.match('image.*')) {
							continue;
						}
						var reader = new FileReader();
						// Closure to capture the file information.
						reader.onload = (function(theFile) {
							return function(event) {
								var image = new Image();
								var span = document.createElement('span');
								span.appendChild(image);
								image.classList.add('thumbnail');
								image.src = event.target.result;
								image.dataset.path = 'img/' + theFile.name;
								document.querySelector('.present').appendChild(span);
							};
						})(f);
						// Read in the image file as a data URL.
						reader.readAsDataURL(f);
					}
				}, false);
			});
		};

		var previewfile = function (holder, file) {
			var reader = new FileReader();
			reader.onload = function (event) {
				var span = document.createElement('span');
				var image = new Image();
				image.src = event.target.result;
				image.width = 250; // a fake resize
				span.appendChild(image);
				holder.appendChild(span);
			};

			reader.readAsDataURL(file);
		};

		return {
			showSettings: showSettings,
			previewfile: previewfile,
			uploadImages : uploadImages
		};

	})(settings);

	return slideTemplate;
});