define(function () {
	var canvas = (function () {

		var canvas = {
			height: 598,
			width: 898
		},
			range = 30;

		var init = function () {
			canvas.$el = $('<canvas id="canvas">').appendTo($('.present'));
			canvas.$el.css({
				'position' : 'absolute',
				'top' : 0,
				'left' :0
			});
			canvas.el = document.querySelector('#canvas');
			canvas.el.width=canvas.width;
			canvas.el.height=canvas.height;
			canvas.ctx = canvas.el.getContext('2d');
			canvas.points = JSON.parse(localStorage.getItem("canvasPoints")) || [];

				if(canvas.points.length) redraw();

			localStorage.removeItem('canvasPoints');

			$('section').on('mousedown', initLine);
			
			$('section').on('mouseup', function(e){
				
				$(this).off('mousemove');

				var x1 = extendLineX(canvas.lastPos.x, canvas.lastPos.y);
				var x2 = extendLineX(e.offsetX, e.offsetY);
				var y1 = extendLineY(canvas.lastPos.x, canvas.lastPos.y);
				var y2 = extendLineY(e.offsetX, e.offsetY);

				if (x1 == x2 || y1 == y2) return;

				var len = dist(x1,y1,x2,y2);
				console.log(len);
				if (len < 500) {
					clearCanvas();
					redraw();
					return;
				}
	
				if( Math.abs( y1 - y2 ) < range ) {
					y2 = y1;
				}
				if( Math.abs(x1-x2) < range) {
					x2 = x1;
				}

				var points = {
					from: [x1, y1],
					to: [x2, y2]
				};

				canvas.points.push(points);
				localStorage.setItem('canvasPoints', JSON.stringify(canvas.points));
				redraw();

			});
		};

		var extendLineX = function (x, y) {
			var dist1 = dist(0, y, x, y);
			var dist2 = dist(canvas.width, y, x, y);
			if(dist1 < 100) {
				return 0;
			}
			if(dist2 < 100) {
				return canvas.width;
			}
			return x;
		};

		var extendLineY = function (x, y) {
			var dist1 = dist(x, 0, x, y);
			var dist2 = dist(x, canvas.height, x, y);
			if(dist1 < 100) {
				return 0;
			}
			if(dist2 < 100) {
				return canvas.height;
			}
			return y;
		};

		var dist = function (x1, y1, x2, y2) {
			return Math.sqrt( Math.pow( ( x1 - x2 ), 2) + Math.pow( ( y1 - y2 ) , 2) );
		};

		var remove = function () {
			canvas.$el.remove();
			$('section').off('mouseup').off('mousedown');
		};

		var initLine = function (e) {

			$('section').on('mousemove', drawLine);

			var x = e.offsetX; // 598
			var y = e.offsetY ;// 898
			console.log('mousedown at', x,y);

			canvas.lastPos = {
				x : x,
				y: y
			};
			
		};

		var redraw = function () {
			var points = canvas.points;
			if(points.length) {
				
				for (var i = 0; i < points.length; i++) {
					draw(points[i].from, points[i].to);
				}
			}
		};

		var draw = function (from, to) {
			canvas.ctx.strokeStyle = '#fff';
			canvas.ctx.beginPath();
			canvas.ctx.lineWidth = 2;
			var coords = aproximate(from, to);
			canvas.ctx.moveTo(coords.from[0], coords.from[1]);
			canvas.ctx.lineTo(coords.to[0], coords.to[1]);
			canvas.ctx.stroke();
		};

		var aproximate = function (from, to) {

			var y1 = from[1]
				, y2 = to[1]
				, x1 = from[0]
				, x2 = to[0]

			if( Math.abs( y1 - y2 ) < range ) {
				y2 = y1;	
			}
			if( Math.abs(x1-x2) < range) {
				x2 = x1;
			}

			return {
				from : [x1, y1],
				to : [x2, y2]
			}
		}

		var drawLine = function (e) {
			clearCanvas();
			redraw();

			var y1 = canvas.lastPos.y
				, y2 = e.offsetY
				, x1 = canvas.lastPos.x
				, x2 = e.offsetX;

			if( Math.abs( y1 - y2 ) < range ) {
				y2 = y1;	
			}
			if( Math.abs(x1-x2) < range) {
				x2 = x1;
			}

			canvas.ctx.strokeStyle = '#fff';
			canvas.ctx.beginPath();
			canvas.ctx.lineWidth = 2;
			canvas.ctx.moveTo(x1, y1);  
			canvas.ctx.lineTo(x2, y2);
			canvas.ctx.stroke();
		}

		var clearCanvas = function () {
			canvas.ctx.clearRect(0, 0, canvas.el.width, canvas.el.height);
			var w = canvas.el.width;
			canvas.el.width = 1;
			canvas.el.width = w;
		}

		return {
			init: init,
			remove: remove
		}		

	})();

	return canvas;
});