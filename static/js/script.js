var showError = function () {
	var modal = $('#modal');
	if(!modal.length) modal = $('<div/>').attr('id', 'modal');
	else modal.toggleClass('hide');
	var body = $('body');
	modal.load('./layouts/errorHandler.html', function(){
		modal.appendTo(body);

		$('#error-close', $(this)).on('click', function () {
			modal.remove();
		});
	});
};

define(['text', 'jquery', 'htmlEntites', 'buttonHandler', 'slide-template', 'settings', 'canvas'], 
	function(textStyle, $, htmlEntites, bHandler, slideTemplate, settings, canvas){

	var Kreator = (function (options) {
		var $ = options.jquery,
			Reveal = options.reveal,
			$span,
			hljs = options.hljs;

		var init = function() {
			
			var confirmExit = function () {
				return "Did you download ? ";
			};

			//window.onbeforeunload = confirmExit;

			options.right = $('.add-slide.add-right')
					.on('click', function(){
						Kreator.addSlideRight();
						Reveal.navigateRight();
					});
			
			options.down = $('.add-slide.add-down')
					.on('click', function(){
						Kreator.addSlideDown();
						Reveal.navigateDown();
					});
			
			settings.clear();

			$('body').append(options.right).append(options.down);

			$('section').on('click', addContentToSlide);

			$('#download').on('click', function(){
				var s = $('.slides>section');
				var slides = {};
				
				s.each(function(idx, slide){
					slide = $(slide);
					if($('section', slide).length) {
						slides['slide'+idx] = [];
						$('section', slide).each(function(i, sl){
							sl = $(sl);
							content = sl.html();
							content = htmlEntites.convertTags(content);
							slides['slide'+idx].push(content);
						});
					} else {
						content = slide.html();
						content = htmlEntites.convertTags(content);
						slides['slide'+idx] = '<section>' + content + '</section>';
					}
				});
		
				var html = document.querySelector('html'),
					theme;
				if(html.classList.length) {
					theme = html.classList[0];
					if(theme.length>12) {
						theme = 'head';
					}
				} else {
					theme = 'head';
				}

				var webfonts = '';
				var fonts = settings.get('webfont');
				if(fonts)
					if(Array.isArray(fonts)) webfonts = fonts.map(function (font) {
							return "<link href='http://fonts.googleapis.com/css?family="+font+"' rel='stylesheet' type='text/css'>";
						}).join('');
					else webfonts = "<link href='http://fonts.googleapis.com/css?family="+fonts+"' rel='stylesheet' type='text/css'>";

				var title = settings.get('title') || 'kreator.js presentation';
				var description = settings.get('description') || 'kreator.js presentation';
				var author = settings.get('author') || 'kreator.js presentation';

				$.ajax({
					  type: 'POST'
					, url : '.'
					, dataType : 'jsonpi'
					, params : {
						slides : slides,
						params: settings.get(),
						theme: theme,
						webfont: webfonts,
						title: title,
						description: description,
						author: author
					}
				});
			});

			$('#settings-btn').on('click', function(){
				slideTemplate.showSettings.call($('.reveal'));
			});

			$('.btn-group a').on('click', function(e){
				e.preventDefault();
				var tag = $(this).data('textstyle');
				$(this).toggleClass('active');
				if(tag === 'li') {
					if($(this).hasClass('active'))
						$span = $('<span contentEditable><li></li></span>')
							.on('click', editSpan)
							.appendTo(Kreator.getCurrentSlide())
							.trigger('click').focus();
				}
				if(['b', 'i'].indexOf(tag)>=0) {
					$(this).toggleClass('active');
					$span.html(textStyle.format(tag, $span));
				} else if(['blockquote'].indexOf(tag)>=0) {
					$(this).toggleClass('active');
					textStyle.paragraph(tag, $span);
				} else if(['left', 'center', 'right'].indexOf(tag)>=0) {
					$(this).toggleClass('active');
					textStyle.align(tag, $span);
				} else if(tag === 'a') {
					$(this).toggleClass('active');
					textStyle.insertHiperlink(this, $span);
				} else if(tag === 'move') {
					$(this).toggleClass('btn-info');
					var section = $('.reveal section');
					if(!$(this).hasClass('active') && $('span', $('.present')).length ) {
						$('.present span').off('mousedown', bHandler.moveSpan).attr('contentEditable', true);
					} else {
						if(!$span) $span = $('.present span').eq(0);
						$('.present span').on('mousedown', bHandler.moveSpan).attr('contentEditable', false);
					}
					$('.present').toggleClass('crosshair');
				} else if(tag === 'grid') {
					if($(this).hasClass('active')) {
						canvas.init();
					} else {
						canvas.remove();
					}
				} else if(tag === 'remove') {
					
					$(this).toggleClass('btn-info');
					
					if($(this).hasClass('active')) {
						$('.present').addClass('crosshair');
						$('span').on('click', bHandler.removeSpan);
					} else {
						$('.crosshair').removeClass('crosshair');
						$('span').off('click', bHandler.removeSpan);
					}
				} else if(tag === 'grid-clear') {
					$(this).toggleClass('active');
					settings.remove(['canvasPoints']);
				} else if(tag === 'upload') {
					slideTemplate.uploadImages.call($(this));
				} else if(tag === 'images') {
					$('.thumbnails').toggle();
				} else if(tag === 'resize') {
					$('.present').toggleClass('resize');
					var imgs = document.querySelectorAll('img');
					if($(this).hasClass('active'))
						[].forEach.call(imgs, function(img){
							bHandler.imageResize(img);
						});
				} else if (tag === 'textcolor') {
					var that = $(this);
					if($('input[type=color]').length) {
						$('.active').removeClass('active');
						$('input[type=color]').remove();
					} else {
						var input = $('<input type="color">');
						that.append(input);
						input.on('click', function(e){
							e.stopPropagation();
						}).on('change', function(){
							var color = $(this).val(); // the new text color
							$span.html(textStyle.format('span', $span));
							var coloredText = $('span:not([style])', $span);
							var className = coloredText.attr('class') || Kreator.generateClassName();
							coloredText.css('color', color).addClass(className);
							settings.set(['.' + className, 'color:' + color]);
							$(this).remove();
							that.trigger('click');
						});
					}
				} else if (tag === 'fullscreen' || tag === 'settings') {
					$(this).removeClass('active');
				} else if (tag === 'bgcolor') {
					var that = $(this);
					if($('input[type=color]').length) {
						$('.active').removeClass('active');
						$('input[type=color]').remove();
					} else {
					var input = $('<input type="color">');
						that.append(input);
						input.on('click', function(e){
							e.stopPropagation();
						}).on('change', function(){
							console.log('settings bg color');
							var color = $(this).val();
							$span.html(textStyle.format('span', $span));
							var bgSpan = $('span:not([style])', $span);
							var className = bgSpan.attr('class') || bgSpan.addClass(Kreator.generateClassName()) && bgSpan.attr('class');
							bgSpan.css('background', color);
							settings.set(['.' + className, 'background:' + color]);
							$(this).remove();
							that.trigger('click');
						});
					}

				} else if (tag === 'overview') {
					$('.menu').toggleClass('hidden');
					Reveal.toggleOverview();
				}
			});

			$(window).on('movemouseup', function () {
				var className = $span.attr('class') || $span.addClass(Kreator.generateClassName()) && $span.attr('class');
				settings.set(['.'+className, 'position:absolute;top:'+$span.css('top')+';left:'+$span.css('left')]);
			});

			$(window).on('resized', function(e){ // after the image has been resized
				var img = $('.resizing');
				if(img.length) {
					img.removeClass('resizing');
					var className = $(img).attr('class') || $(img).addClass(Kreator.generateClassName()) && $(img).attr('class');
					settings.set(['.'+className, 'width :' + img.width() + 'px']);
				}
			});
	
			$('.thumbnails img').live('click', function () {
				var el = $('<img>').attr('src', $(this).attr('src'))
					.css('width', '200px')
					.attr('data-path', $(this).attr('data-path'));
				var s = $('<span/>').append(el).appendTo('.present');
				s.on('click', function (e) {
					editSpan(e, this);
				});
			});

			$('#duplicate').on('click', function () {
				var slide = Kreator.getCurrentSlide();
				var $this = $(this);

				console.log(slide.html());

				if($this.hasClass('btn-group')) {
					if($('.duplicate-direction').hasClass('right')) {
						Kreator.addSlideRight(slide);
						Reveal.navigateRight();
					} else {
						Kreator.addSlideDown(slide);
						Reveal.navigateDown();
					}
					return;
				}

				var btn = $('<button/>').addClass('btn');
				$this.addClass('btn-group').removeClass('btn');
				btn.clone().html('<i class="icon-arrow-down"></i>')
							.hover(function(e){
								$(this).addClass('duplicate-direction down');
							}, function(e) {
								$(this).removeClass('duplicate-direction down');
								bHandler.cancelDuplicate(e, this);
							}).appendTo($this);

				btn.clone().html('<i class="icon-arrow-right"></i>')
							.hover(function(e){
								$(this).addClass('duplicate-direction right');
							}, function(e) {
								$(this).removeClass('duplicate-direction right');
								bHandler.cancelDuplicate(e, this);
							}).appendTo($this);
			});

			$('#remove-slide').on('click', function () {
				var coords = Reveal.getIndices();
				var s = Kreator.getCurrentSlide();
				if(coords.h || coords.v) {
					if (coords.v) {
						s.remove();
						Reveal.navigateTo(coords.h, coords.v-1);
					} else {
						s.remove();
						Reveal.navigateTo(coords.h-1, coords.v);
					}
				}
			});

			$('#select-dimensions').on('change', function () {
				// create H headings
				var h = $(this).val();
				var html = textStyle.removeHeadings($span.html());
				$span.html('<' + h + '>' + html + '</' + h + '>');
			});

			$('#cl-dimensions').on('change', function(){
				var tag = $(this).val(),
				string = textStyle.paragraph(tag, $span);
				if(string) {
					$span.html(string);
				}
			});

			$('.fullscreen').on('click', function(){
				bHandler.toggleFullscreen();
			});

			// needs fixing
			// $(window).on('paste', function(e){
			// 	setTimeout(function(){textStyle.formatCode.call(Kreator, $span);}, 100);
			// });

			$('.menu li').on('click', function () {
				var $this = $(this);
				var action = $this.attr('data-title');
				var clsName = $span.attr('class');
				if($this.hasClass('active')) {
					$('.menu .active').removeClass('active');
					$('#range-handler').parent().hide();
					return;
				} else {
					if($this.children('input').length) return;
					$('.menu .active').removeClass('active');
					$('#range-handler').parent().hide();
					$this.toggleClass('active');
				}
				if(action === 'rotate') {

					$span.css('transform','rotate(10deg)');
					$('#menu-input').val('10deg');

					if(!document.querySelector('#range-handler')) {
						var li = document.createElement('li');
						var range = bHandler.createRangeEl();
						li.appendChild(range);
						document.querySelector('.menu').appendChild(li);
					} else {
						$('#range-handler').parent().show();
						document.querySelector('#range-handler').addEventListener('change', function () {
							$('#menu-input').val(this.value + ' deg').trigger('keyup');
						}, false);
					}

				} else if(action === 'add class') {
					$('#menu-input').attr('placeholder', 'class name').val(clsName);
				} else if(action === 'clear') {
					settings.remove(clsName);
					$span.removeClass().css({
						'transform': 'none',
						'font-family': 'inherit'
					});
				} else if(action === 'font') {
					$('#menu-input').attr('placeholder', 'font family').val($span.css('font-family'));
					clsName = $span.attr('class') || $span.addClass(Kreator.generateClassName()) && $span.attr('class');
				}

			});

			$('#menu-input').on('keyup', function (e) {
				var value = parseInt($(this).val(), 10) || 0,
					action = $('.menu .active').attr('data-title'),
					img = $('img', $span),
					clsName;

				if(!img.length)
					clsName = $span.attr('class') || $span.addClass(Kreator.generateClassName()) && $span.attr('class');
				else {
					clsName = img.attr('class') || img.addClass(Kreator.generateClassName()) && img.attr('class');
				}
				
				if(action === 'rotate') {
					$span.css('transform','rotate('+value+'deg)');
					if(clsName) {
						var prop = '-webkit-transform: rotate('+value+'deg);-moz-transform: rotate('+value+'deg);transform: rotate('+value+'deg)';
						settings.set(['.'+clsName, prop]);
					}
				} else if (action === 'add class') {
					if(e.keyCode == 13) {
						var oldCls = $span.attr('class');
						var newCls = $(this).val();
						$span.removeClass().addClass(newCls);
						$('#menu-input').val('');
						settings.copy('.'+oldCls, '.'+newCls);
					}
				} else if (action === 'font') {
					
					if(e.keyCode == 13) {
						
						var family = $(this).val();
						WebFont.load({
							google: {
								families: [ family ]
							},
							active: function () {
								$span.css('font-family', family);
								if($('*', $span).length) {
									$('*', $span).css('font-family', family);
								}
								if(clsName) {
									settings.set(['.'+clsName, 'font-family: ' + family]);
								}
								settings.set(family, 'webfont');
							}
						});
					}
				}
			});

		};

		var generateClassName = function (testClass) {
			var n = 1;
			while ($('.kreator-class-' + n).length)
				n++;
			return 'kreator-class-' + n;
		};

		var addContentToSlide = function() {
			
			var present = Kreator.getCurrentSlide();
			if ($('.present').hasClass('crosshair')) return;

			var d = $('<span contentEditable></span>').on('click', function(e){
				editSpan(e, d);
			});

			d.appendTo($(present)).trigger('click').focus();

			var list = ($('.btn.active').attr('data-textstyle') === 'li');
			if(list) {
				$('.active').trigger('click');
			}
		};
		
		var getLastSpan = function() {
			var s = Kreator.getCurrentSlide();
			var spans = $('span', s);
			return spans.eq(spans.length-1);
		};

		var getCurrentSlide = function(jquery) {
			var present;
			var slides = document.querySelectorAll('.present');
			[].forEach.call(slides, function(s){
				if(!s.classList.contains('stack')) {
					present = s;
				}
			});
			if(!jquery) return $(present);
			return present;
		};

		var addSlideRight = function(slide) {
			var newSlide = document.createElement('section');
			$(newSlide).on('click', addContentToSlide);
			if(slide) newSlide.innerHTML = slide.html();
			var cSlide = document.querySelector('.present:not(.stack)');
			if(cSlide.parentNode.classList.contains('stack')) {
				cSlide = cSlide.parentNode;
				cSlide.parentNode.insertBefore(newSlide, cSlide.nextSibling);
			} else
				cSlide.parentNode.insertBefore(newSlide, cSlide.nextSibling);
			$('span', $(newSlide)).on('click', editSpan);
		};

		var addSlideDown = function(slide) {
			var ind = Reveal.getIndices();
			var newSlide = slide || $('<section/>');
			newSlide.on('click', addContentToSlide);
			var d;
			if(ind.v) {
				var parent = document.querySelector('.stack.present');
				slide = $('<section></section>').html(newSlide.html())
										.on('click', addContentToSlide)
										.appendTo($(parent));
				d = $('span', slide).on('click', function(e){
					editSpan(e, d);
				});
			} else {
				var content = $('.present').html();
				var holder = $('<section></section>');
				$('.present').replaceWith(holder);
				$('<section/>').on('click', addContentToSlide)
								.html(content).appendTo(holder);
				newSlide.appendTo(holder);
				d = $('span', holder).on('click', function(e){
					editSpan(e, d);
				});
			}
			Reveal.navigateDown();
			$('.menu').addClass('hidden');
		};

		var editSpan = function(e, that) {
			
			e.stopPropagation();
			$span = $(that) || $(this);
			var textStyle = htmlEntites.findTags($span.html());
			
			if(textStyle >= 0) {
				$('#select-dimensions option:eq('+textStyle+')').attr('selected', 'selected');
			}

			$('.menu')
				.removeClass('hidden')
				.css({'top' : e.currentTarget.offsetTop + 27})
				.children('.active').trigger('click');
			
		};

		return {
			addSlideDown: addSlideDown,
			addSlideRight: addSlideRight,
			editSpan: editSpan,
			getCurrentSlide: getCurrentSlide,
			generateClassName: generateClassName,
			init: init
		};
	})({
		jquery: $,
		reveal: Reveal,
		hljs: hljs,
		settings: settings
	});

	return Kreator;
});