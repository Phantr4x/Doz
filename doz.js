(function (global, factory) {
	'use strict';

	if (typeof module === "object" && typeof module.exports === "object") {
		module.exports = global.document ?
			factory(global, true) :
			function (w) {
				if (!w.document) {
					throw new Error("jQuery requires a window with a document");
				}
				return factory(w);
			};
	} else {
		factory(global);
	}

	if (!window.requestAnimationFrame) {
		window.requestAnimationFrame =
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			window.msRequestAnimationFrame ||
			window.oRequestAnimationFrame ||
			function (callback) {
				return window.setTimeout(callback, 1000 / 60);
			};
	}

})(typeof window !== "undefined" ? window : this, function (window) {

	function Doz(elt, options) {
		var canvas = document.body.querySelector(elt);
		var context = canvas.getContext('2d');

		var defaults = {
			dot: {
				color: 'rgba(255,255,255,.5)',
				size: 3
			},
			line: {
				color: 'rgba(255,255,255,.5)',
				size: 0.3
			},
			posX: 0,
			posY: 0,
			width: window.innerWidth,
			height: window.innerHeight,
			velocity: 1,
      force: 0.01,
      bounce: -1,
			length: 100,
			distance: 120,
			radius: 150,
			dots: []
		};

    var mergeOptions = function (opts, defs) {
			for (var item in defs) {
				!opts[item] && (opts[item] = defs[item]);
        // console.log(opts[item], typeof opts[item] === 'object');
				typeof opts[item] === 'object' && mergeOptions(opts[item], defs[item]);
			}
			return opts;
		}

		opts = mergeOptions(options || {}, defaults);
		// console.log(opts);

		function Dot() {
			this.x = Math.random() * canvas.width;
			this.y = Math.random() * canvas.height;

			this.vx = opts.velocity * (Math.random(21)/10-1);
			this.vy = opts.velocity * (Math.random(21)/10-1);
      this.ax = Math.cos(Math.random() * Math.PI * 2) * opts.force;
      this.ay = Math.sin(Math.random() * Math.PI * 2) * opts.force;
      this.bo = opts.bounce;

			this.radius = Math.random() * opts.dot.size;
		}



		Dot.prototype = {

			create: function () {
				context.beginPath();
				context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
				context.fill();
			},

			animate: function () {
				for (var i = 0; i < opts.length; i++) {
					var dot = opts.dots[i];
					if (dot.y < 0 || dot.y > canvas.height) {
						dot.vx = dot.vx;
						dot.vy *= this.bo;
					} else if (dot.x < 0 || dot.x > canvas.width) {
						dot.vx *= this.bo;
						dot.vy = dot.vy;
					}
          dot.vx += dot.ax;
          dot.vy += dot.ay;
					dot.x += dot.vx;
					dot.y += dot.vy;
				}
			},

			combine: function () {
				var len = opts.length;
				var iDot, jDot;
				for (var i = 0; i < len; i++) {
					for (var j = 0; j < len; j++) {
						iDot = opts.dots[i];
						jDot = opts.dots[j];

						if (
							iDot.x - jDot.x < opts.distance &&
							iDot.y - jDot.y < opts.distance &&
							iDot.x - jDot.x > -opts.distance &&
							iDot.y - jDot.y > -opts.distance &&
							iDot.x - opts.posX < opts.radius &&
							iDot.y - opts.posY < opts.radius &&
							iDot.x - opts.posX > -opts.radius &&
							iDot.y - opts.posY > -opts.radius
						) {

							context.beginPath();
							context.moveTo(iDot.x, iDot.y);
							context.lineTo(jDot.x, jDot.y);
							context.stroke();
							context.closePath();
						}
					}
				}
			}
		};

		this.createDots = function () {
			var length = opts.length;

			context.clearRect(0, 0, canvas.width, canvas.height);

			for (var i = 0; i < length; i++) {
				opts.dots.push(new Dot());
				var dot = opts.dots[i];

				dot.create();
			}

			dot.combine();
			dot.animate();
		};

		this.setCanvas = function () {
			canvas.width = opts.width;
			canvas.height = opts.height;
		};

		this.setContext = function () {
      context.fillStyle = opts.dot.color;
      context.strokeStyle = opts.line.color;
			context.lineWidth = opts.line.width;
		};

		this.setInitialPosition = function () {
			if (!options || !options.hasOwnProperty('position')) {
				opts.posX = canvas.width * 0.5;
				opts.posY = canvas.height * 0.5;
			}
		};

		this.loop = function (callback) {
			callback && callback();

			window.requestAnimationFrame(function () {
				this.loop(callback);
			}.bind(this));
		};

		this.bind = function () {
			canvas.onmousemove = function (e) {
				opts.posX = e.pageX - canvas.offsetLeft;
				opts.posY = e.pageY - canvas.offsetTop;
			};
		};

		this.init = function () {
			this.setCanvas();
			this.setContext();
			this.setInitialPosition();
			this.loop(this.createDots);
			this.bind();
		}

		return this.init();
	};

	window.doz = window.Doz = Doz;

});
