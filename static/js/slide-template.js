define(['settings'], function(settings){
	
	var slideTemplate = (function(settings){

		var updateSettings = function(e){
			e.preventDefault();
			e.stopPropagation();
			var color1 = $('input', $(this)).eq(1).val();
			var color2 = $('input', $(this)).eq(2).val();
			var fontsize = $('input', $(this)).eq(3).val();
			var webkitBg = '-webkit-radial-gradient('+color1+', '+color2+')';
			$('body').css('background', webkitBg);
			
			settings.set(['body', 'background: ' + webkitBg]);
			settings.set(['.highlight', 'color: #f05']);
		};

		var finishedSettings = function(e){
			e.preventDefault();
			e.stopPropagation();
			$('section').html('');
		};

		var addMessage = function(message) {
			var msg = $('<li/>').html('<p>' + message + '</p>');
			$('.notifications').append(msg);
		}

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
				document.querySelector('#upload').addEventListener('change', function (e) {
					var files = e.target.files;
					var reader = new FileReader();
					reader.onload = function (event) {
						var image = new Image();
						image.src = event.target.result;
						image.width = 50; // a fake resize
						var figure = document.createElement('figure')
						figure.appendChild(image);
						document.querySelector('.showreel').appendChild(figure);
					};
					
					for (var i = files.length - 1; i >= 0; i--) {
						reader.readAsDataURL(files[i]);
					};
					
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