define(function(){
	var buttonHandler = {
		containerPosX : 0
		,	containerPosY : 0
		,	mouseX : 0
		,	mouseY : 0
		,	that : null
		,	lines : null
		,	height : 0
		,	width : 0
		,	page_width : 0
		,	ratio : 0
		,
		toggleFullscreen: function() {
				if ((document.fullScreenElement && document.fullScreenElement !== null) ||    // alternative standard method
					(!document.mozFullScreen && !document.webkitIsFullScreen)) {               // current working methods
					if (document.documentElement.requestFullScreen) {
						document.documentElement.requestFullScreen();
					} else if (document.documentElement.mozRequestFullScreen) {
						document.documentElement.mozRequestFullScreen();
					} else if (document.documentElement.webkitRequestFullScreen) {
						document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
					}
					Reveal.navigateTo(0,0);
				} else {
					if (document.cancelFullScreen) {
						document.querySelector('body').classList.remove('fullscreen');
						document.cancelFullScreen();
					} else if (document.mozCancelFullScreen) {
						document.querySelector('body').classList.remove('fullscreen');
					document.mozCancelFullScreen();
					} else if (document.webkitCancelFullScreen) {
					document.querySelector('body').classList.remove('fullscreen');
					document.webkitCancelFullScreen();

					}
					document.querySelector('body').classList.remove('fullscreen');
				}
		},	
		removeSpan : function(e){
				e.preventDefault();
				e.stopPropagation();
				$(this).remove();
		},
		pDistance: function (x, y, x1, y1, x2, y2) {
			
			var A = x - x1;
			var B = y - y1;
			var C = x2 - x1;
			var D = y2 - y1;

			var dot = A * C + B * D;
			var len_sq = C * C + D * D;
			var param = dot / len_sq;

			var xx, yy;

			if (param < 0 || (x1 == x2 && y1 == y2)) {
				xx = x1;
				yy = y1;
			}
			else if (param > 1) {
				xx = x2;
				yy = y2;
			}
			else {
				xx = x1 + param * C;
				yy = y1 + param * D;
			}

			var dx = x - xx;
			var dy = y - yy;
			return Math.sqrt(dx * dx + dy * dy);
		},
		moveSpan : function(e){
			
			e.stopPropagation();
			var that = this
			,	frame = $('.present').eq(0).offset()
			;
			
			that.style.position = 'absolute';
			this.style.width = 'auto';
			that.style.left = e.pageX - that.clientWidth / 2 - frame.left + 'px';
			that.style.top = e.pageY - that.clientHeight / 2 - frame.top + 'px';

			mouseX = e.pageX;
			mouseY = e.pageY;

			lines = JSON.parse(localStorage.getItem('canvasPoints')) || [];

			$(document).on('mousemove', function (e) {
				buttonHandler.move.call(that, e);
			});

			$(document).on('mouseup', function () {
				$(window).trigger('movemouseup');
				$(document).off('mousemove');
			});
		},
		cancelDuplicate : function (e, that) {
			setTimeout(function () {
				if(!$('.duplicate-direction').length)
				$('#duplicate')
					.removeClass('btn-group')
					.addClass('btn-warning btn')
					.html('Duplicate');
				}, 1000);
		},

		move : function (e) {
			
			var   left = 0
				, right = 0
				, top = 0
				, l = $('.snap-line')
				, snapped = false
				, that = this
				, frame = $('.present').eq(0).offset()
				;

			left = e.pageX - that.clientWidth / 2 - frame.left;
			top = e.pageY - that.clientHeight / 2 - frame.top;
			
			lines.map(function (line) {
				var dl = buttonHandler.pDistance(left, top, line.from[0], line.from[1], line.to[0], line.to[1]);
				var dr = buttonHandler.pDistance(right, top, line.from[0], line.from[1], line.to[0], line.to[1]);
				
				if(dl<30 && dl != dr) {
					if(!l.length) l = $('<div/>').addClass('snap-line');
					else l.removeClass('snap-line').addClass('snap-line');
					if(line.from[0] == line.to[0]) {
						l.css({
							'width' : '2px',
							'height' : line.to[1] - line.from[1],
							'top' : line.from[1],
							'left' : line.from[0]
						}).appendTo('.present');
						if(left > line.from[0]) {
							that.style.left = left - dl + 'px';
							that.style.top = top + 'px';
							snapped = true;
						}
					}
				} else if(dr<30 && dl != dr) {
					if(!l.length) l = $('<div/>').addClass('snap-line');
					else l.removeClass('snap-line').addClass('snap-line');
					if(line.from[0] == line.to[0]) {
						l.css({
							'height' : line.to[1] - line.from[1],
							'top' : line.from[1],
							'left' : line.from[0],
							'width' : '2px'
						}).appendTo('.present');
						if(right < line.from[0]) {
							that.style.top = top + 'px';
							snapped = true;
							that.style.left = right - that.clientWidth + dr + 'px';
						}
					}
				} else if (dr == dl && dl < 40 || dl == that.clientHeight) {
					if(!l.length) l = $('<div/>').addClass('snap-line');
					else l.removeClass('snap-line').addClass('snap-line');
					
					if(line.from[1] == line.to[1]) {
						l.css({
							'width' : Math.abs(line.to[0] - line.from[0]),
							'top' : line.from[1],
							'left' : Math.min(line.from[0], line.to[0]),
							'height' : '2px'
						}).appendTo('.present');

						if(top > line.from[1]) {
							that.style.top = top - dr + 'px';
							snapped = true;
						}
						if (top < line.from[1]) {
							that.style.top = top + dl - that.clientHeight + 'px';
							snapped = true;
						}
					}
				}
			});

			if(!snapped && left && top) {
				that.style.left = left + 'px';
				that.style.top = top + 'px';
			}
		},

		updateResizeBars: function (resizeR, resizeL, resizeB, img) {
			buttonHandler.initR(resizeR, img);
			buttonHandler.initL(resizeL, img);
			buttonHandler.initB(resizeB, img);
		},

		resize_r: function (e) {
			var img = $('.resizing').eq(0);
			width = img.width();
			height = img.height();
			var offset = img.offset();
			var img_width = e.pageX - offset.left;
			if (img_width > 50) {
				img.width(img_width);
				img.height(img_width * ratio);
			}
		},
		
		resize_l: function (e) {
			var img = $('.resizing').eq(0);
			width = img.width();
			height = img.height();
			var offset = img.offset();
			var offsetRight = window.innerWidth - parseInt(img.width(), 10) - offset.left;
			var img_width = window.innerWidth - e.pageX - offsetRight;
			if (img_width > 50) {
				img.width(img_width);
				img.height(img.width() * ratio);
			}
		},

		resize_b: function (e) {
			var img = $('.resizing').eq(0);
			width = img.width();
			height = img.height();
			var offset = img.offset();
			var img_height = e.pageY - offset.top;

			if (img_height > 50) {
				img.height(img_height);
				img.width(ratio * img_height);
			}
		},

		mousemove: function (e) {
			var img = $('#active-image')
			,   frame = $('.present').eq(0).offset()
			,	position = img.position();

			width = img.width();
			height = img.height();

			img.css({
				left: (e.pageX -img.width() / 2 - frame.left)+ 'px',
				top: (e.pageY - img.height() / 2 - frame.top) + 'px'
			});
		},

		initR: function (obj, img) {
			obj.style.height = img.height + 'px';
			obj.style.left = parseInt(img.offsetLeft, 10) + img.width - 10 + 'px';
			obj.style.top = parseInt(img.offsetTop, 10) + 'px';
		},

		initT: function (obj, img) {
			obj.style.width = img.width + 'px';
			obj.style.left = parseInt(img.offsetLeft, 10) + 'px';
			obj.style.top = parseInt(img.offsetTop, 10) - 10 + 'px';
		},

		initL: function (obj, img) {
			obj.style.height = img.height + 'px';
			obj.style.left = parseInt(img.offsetLeft, 10) - 10 + 'px';
			obj.style.top = parseInt(img.offsetTop, 10) + 1 + 'px';
		},

		initB: function (obj, img) {
			obj.style.width = img.width + 'px';
			obj.style.left = parseInt(img.offsetLeft, 10) + 'px';
			obj.style.top = parseInt(img.offsetTop, 10) + img.height - 10 + 'px';
		},
		clearResize: function (img) {
			console.log('remove');

			img.classList.remove('resizing');
			img.removeEventListener('mousemove', buttonHandler.attachImageMove);
			var resizeR = document.querySelector('.resize-right')
			,	resizeL = document.querySelector('.resize-left')
			,	resizeB = document.querySelector('.resize-bottom')
			;

			resizeR.parentNode.removeChild(resizeR);
			resizeB.parentNode.removeChild(resizeB);
			resizeL.parentNode.removeChild(resizeL);
		},
		attachImageMove : function () {
			if(document.querySelector('#active-image'))
				document.querySelector('#active-image').id = '';
			this.id = 'active-image';
			this.classList.add('moving');
			window.addEventListener('mousemove', buttonHandler.mousemove, false);
		},
		disableInsert : function () {
			if(!$(this).hasClass('crosshair')) {
				$('.present span').attr('contentEditable', true);
			} else {
				$('.present span').attr('contentEditable', false);
			}
		},
		imageResize: function (img) {

			var resizeR = document.createElement('div')
			,	resizeL = document.createElement('div')
			,	resizeB = document.createElement('div')
			;



			resizeR.classList.add('resize-right');
			resizeL.classList.add('resize-left');
			resizeB.classList.add('resize-bottom');
			img.parentNode.appendChild(resizeR);
			img.parentNode.appendChild(resizeL);
			img.parentNode.appendChild(resizeB);
			img.classList.add('resizing');

			img.ondragstart = function() { return false; };

			img.addEventListener('mousedown', buttonHandler.attachImageMove, false);

			resizeR.addEventListener('mousedown', function () {
				ratio = img.height / img.width;
				if (img.style.left == 'auto') {
					img.style.left = parseInt(img.offsetLeft, 10);
					img.style.right = 'auto';
				}
				window.addEventListener('mousemove', buttonHandler.resize_r, false);
			}, false);

			resizeL.addEventListener('mousedown', function () {
				ratio = img.height / img.width;
				var frameOffset = $('.present').offset();
				var offsetRight = window.innerWidth - img.width - img.offsetLeft - 2*frameOffset.left;
				img.style.left = 'auto';
				img.style.right = offsetRight + 'px';
				console.log(offsetRight);
				window.addEventListener('mousemove', buttonHandler.resize_l, false);
			}, false);

			resizeB.addEventListener('mousedown', function () {
				ratio = img.width / img.height;
				if (img.style.top == 'auto') {
                    img.style.top = img.offsetTop;
                    img.style.bottom = 'auto';
                }
				window.addEventListener('mousemove', buttonHandler.resize_b, false);
			}, false);

			window.addEventListener('mouseup', function(e) {
				img.classList.remove('moving');
				window.removeEventListener('mousemove', buttonHandler.resize_r, false);
				window.removeEventListener('mousemove', buttonHandler.resize_l, false);
				window.removeEventListener('mousemove', buttonHandler.resize_b, false);
				window.removeEventListener('mousemove', buttonHandler.mousemove, false);

				buttonHandler.updateResizeBars(resizeR, resizeL, resizeB, img);

			}, false);

			buttonHandler.updateResizeBars(resizeR, resizeL, resizeB, img);	
		},
		
		showLine: function(x1, y1, x2, y2) {
			var $line = $('.snap-line').removeClass('fade-out');
			if(!$line.length) $line = $('<div/>').addClass('snap-line');
			if(x1 == x2) {
				$line.css({
					'top' : y1,
					'left' : x1,
					'height' : y2-y1
				});
			} else {
				$line.css({
					'top' : y1,
					'left' : x1,
					'width' : x2-x1
				});
			}
			$line.appendTo('.present').addClass('fade-out');
		},
		round: function(x, step) {
			if(x%step > step/2) {
				x += step - x%step;
				return x;
			} else {
				x -= x%step;
				return x;
			}
		},
		createRangeEl: function() {
			var range = document.createElement('input');
			range.type="range";
			range.id ="range-handler";
			range.min=-180;
			range.max=180;
			return range;
		}
	};
	return buttonHandler;
});