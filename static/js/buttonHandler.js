define(function(){
	var buttonHandler = {
		containerPosX : 0
		, containerPosY : 0
		, mouseX : 0
		, mouseY : 0
		, that : null
		, lines : null
		, toggleFullscreen: function() {
				if ((document.fullScreenElement && document.fullScreenElement !== null) ||    // alternative standard method
					(!document.mozFullScreen && !document.webkitIsFullScreen)) {               // current working methods
					if (document.documentElement.requestFullScreen) {
						document.documentElement.requestFullScreen();
					} else if (document.documentElement.mozRequestFullScreen) {
						document.documentElement.mozRequestFullScreen();
					} else if (document.documentElement.webkitRequestFullScreen) {
						document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
					}
					
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
			that = this;
			
			that.style.position = 'absolute';
			this.style.width = 'auto';

			containerPosX = that.offsetLeft || document.width/2 - this.clientWidth;
			containerPosY = that.offsetTop;

			mouseX = e.pageX;
			mouseY = e.pageY;

			lines = JSON.parse(localStorage.getItem('canvasPoints')) || [];

			$(document).on('mousemove', function (e) {
				buttonHandler.move(e);
			});

			$(document).on('mouseup', function () {
				$(document).off('mousemove');
			});
		},
		move : function (e) {
			
			var   left = 0
				, right = 0
				, top = 0
				, l = $('.snap-line')
				, snapped = false
				;

			if(e.pageX != mouseX) {
				left = containerPosX + e.pageX - mouseX;
				right = left + that.clientWidth + 1;
			}
			if(e.pageY != mouseY) {
				top = containerPosY + e.pageY - mouseY;
			}
			
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
		imageResize: function (img) {
			img.ondragstart = function (e) {
				var that = this;
				window.onmousemove = function (e) {
					if($('a.btn.active').eq(1).attr('data-textstyle') !== 'resize') return;
					that.style.width = e.pageX - that.offsetLeft + 'px';
				};
				e.preventDefault();
				window.onmouseup = function (e) {
					window.onmousemove = null;
					window.onmouseup = null;
					console.log('resize removed');
				};
			};
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
		}
	};
	return buttonHandler;
});