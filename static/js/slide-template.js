define(['settings'], function(settings){
	
	var slideTemplate = (function(settings){

		var updateSettings = function(e){
			e.preventDefault();
			e.stopPropagation();
			var color1 = $('input', $(this)).eq(3).val();
			var color2 = $('input', $(this)).eq(4).val();
			var fontsize = $('input', $(this)).eq(5).val();
			var bg = '-webkit-radial-gradient('+color1+', '+color2+')';
			var webkitBg = '-webkit-radial-gradient('+color1+', '+color2+')';
			var mozBg = '-moz-radial-gradient('+color1+', '+color2+')';
			$('body').css('background', bg);
			
			settings.set(['body', 'background: ' + bg + ';background:' + webkitBg + ';background:' + mozBg]);
		};

		var finishedSettings = function(e){
			e.preventDefault();
			e.stopPropagation();
			$('section').html('');
		};

		var addMessage = function(message) {
			var msg = $('<li/>').html('<p>' + message + '</p>');
			$('.notifications').append(msg);
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
				});
				$('form', $(this)).on('submit', updateSettings);
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
								image.classList.add('thumbnail');
								image.src = event.target.result;
								image.dataset.path = 'img/' + theFile.name;
								var li = document.createElement('li');
								li.classList.add('span2');
								li.appendChild(image);
								document.querySelector('.thumbnails').appendChild(li);
								var label = document.querySelector('.label');
								label.innerHTML = parseInt(label.innerHTML) + 1;
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
			addMessage: addMessage,
			previewfile: previewfile,
			uploadImages : uploadImages
		};

	})(settings);

	return slideTemplate;
});