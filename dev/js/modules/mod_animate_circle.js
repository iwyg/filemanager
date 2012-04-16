/**
 * @package filemanager
 * @author thomas appel <mail@thomas-appel.com>

 * Displays <a href="http://opensource.org/licenses/gpl-3.0.html">GNU Public License</a>
 * @license http://opensource.org/licenses/gpl-3.0.html GNU Public License
 */

(function (window, define) {
	var PI = Math.PI,
	CIRC = PI * 2,
	QUART = PI / 2;

	define(['jquery', 'underscore'], function ($, _) {

		function _darkenColorByPerc(val, c) {
			return  Math.max(Math.round(((((c / 255) * 100) - val) / 100) * 255), 0);

		}

		function _lightenColorByPerc(val, c) {
			return  Math.min(Math.round(((((c / 255) * 100) + val) / 100) * 255), 255);

		}

		function _darkenColor(color, perc) {
			var r = color[0], g = color[1], b = color[2],
			nr = _darkenColorByPerc(perc, r),
			ng = _darkenColorByPerc(perc, g),
			nb = _darkenColorByPerc(perc, b);
			return [nr, ng, nb];
		}

		function _lightenColor(color, perc) {
			var r = color[0], g = color[1], b = color[2],
			nr = _lightenColorByPerc(perc, r),
			ng = _lightenColorByPerc(perc, g),
			nb = _lightenColorByPerc(perc, b);
			return [nr, ng, nb];
		}

		function _arrayToColor(arr) {
			var prefix = arr.length > 3 ? 'rgba(' : 'rgb(';
			return prefix + arr.join(',') + ')';
		}

		function _addLineGrag(carray) {
			var halfH = (this._ch / 2);
			var innerRad = halfH - this.settings.lineWidth;
			this._grad = this.ctx.createRadialGradient(halfH, halfH, innerRad, halfH, halfH, halfH);

			this._grad.addColorStop(0,  _arrayToColor(_darkenColor(carray, 10)));
			this._grad.addColorStop(0.3,  _arrayToColor(carray));
			this._grad.addColorStop(0.7,  _arrayToColor(carray));
			this._grad.addColorStop(1,  _arrayToColor(_darkenColor(carray, 10)));
		}

		function AnimateCircle(options) {
			this.settings = _.extend(_.clone(AnimateCircle.defaults), options || {});
			this.canvas = this.settings.canvas;

			this.ctx = this.canvas.getContext('2d');
			this._begin = - QUART;

			this._cw = this.canvas.width;
			this._ch = this.canvas.height;

			this._last = [0];
			this._ao = jQuery({p: 0 });

			// setup color:
			this._calcColDiff();

			this.ctx.arc((this._cw / 2), (this._ch / 2), (this._ch / 2) - (this.settings.lineWidth), 0, CIRC, false);

			var halfH = (this._ch / 2);
			var innerRad = halfH - this.settings.lineWidth;

			this._grad = this.ctx.createRadialGradient(halfH, halfH, innerRad, halfH, halfH, halfH);
			_addLineGrag.call(this, [220, 220, 220]);
			//this._grad.addColorStop(0.8,  _arrayToColor(this.settings.startColor));
			//this._grad.addColorStop(0.2, _arrayToColor(this.settings.startColor));
			//this._grad.addColorStop(0, _arrayToColor(_darkenColor(this.settings.startColor, 20)));
			this.ctx.beginPath();
			this.ctx.lineWidth = this.settings.lineWidth;
			//this.ctx.strokeStyle = 'rgb(' + this.settings.startColor.join(',') + ')';
			this.ctx.strokeStyle = this._grad;
			this.ctx.closePath();
			this.ctx.fill();

			this.ctx.arc((this._cw / 2), (this._ch / 2), (this._ch / 2) - (this.settings.lineWidth / 2), -QUART, 100 - QUART, false);
			this.ctx.stroke();
			this._imd = this.ctx.getImageData(0, 0, this._cw, this._ch);

		}
		AnimateCircle.prototype = {
			_prop: function (val) {
				return {
					p: val
				};
			},
			_complete: function (callback) {
				if (typeof callback === 'function') {
					setTimeout(callback, 0);
				}
			},

			drawFullCircle: function (color) {
				_addLineGrag.call(this, color);
				this.ctx.putImageData(this._imd, 0, 0);
				this.ctx.strokeStyle = this._grad;
				this.ctx.arc((this._cw / 2), (this._ch / 2), (this._ch / 2) - (this.settings.lineWidth / 2), -QUART, 100 - QUART, false);
				this.ctx.stroke();
				this.ctx.closePath();
			},

			clearAnimation: function () {
				this._ao.stop();
				this._ao.dequeue();
			},

			animate: function (to, callback) {
				this._ao[0].p = this._last.pop() || 0;
				this._ao.stop().animate(
				this._last.push(to) && this._prop(to), {
					duration: this.settings.stepTime,
					step: _.bind(this._step, this),
					complete: _.bind(this._complete, this, callback)
				});

			},
			_step: function (a) {
				var l = (CIRC / 100) * a;
				this._draw(l, this._getCurrentColor(a));
				//console.log(arguments);
			},


			_draw: function (to, color) {
				if ((to !== 0 && to === this._begin) || to >= CIRC) {
					this.clearAnimation();
					return false;
				}
				_addLineGrag.call(this, this._cCol);
				this.ctx.putImageData(this._imd, 0, 0);
				this.ctx.beginPath();
				this.ctx.strokeStyle = this._grad;
				this.ctx.arc((this._cw / 2), (this._ch / 2), (this._ch / 2) - (this.settings.lineWidth / 2), -QUART, to - QUART, false);
				this.ctx.stroke();
			},

			_calcColDiff: function () {
				var sc = this.settings.startColor, ec = this.settings.endColor;
				this._colDiff = sc;
				this._cMatrix = [];
				this._cCol = [];

				this._cMatrix[0] = (ec[0] - sc[0]) / 100;
				this._cMatrix[1] = (ec[1] - sc[1]) / 100;
				this._cMatrix[2] = (ec[2] - sc[2]) / 100;
			},

			_getCurrentColor: function (step) {

				this._cCol[0] =  Math.round(this._colDiff[0] + (this._cMatrix[0] * step));
				this._cCol[1] =  Math.round(this._colDiff[1] + (this._cMatrix[1] * step));
				this._cCol[2] =  Math.round(this._colDiff[2] + (this._cMatrix[2] * step));

				return 'rgb(' + this._cCol.join(',') + ')';
			},


			update: function () {

			}
		};
		AnimateCircle.defaults = {
			canvas: document.createElement('canvas'),
			startColor: [89, 123, 198],
			endColor: [126, 222, 79],
			background: 'rgb(250, 250, 250)',
			stepTime: 250,
			lineWidth: 5
		};

		return AnimateCircle;
	});
} (this, this.define));

