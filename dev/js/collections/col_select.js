/**
 * @package Collections
 * @author thomas appel <mail@thomas-appel.com>
 * @requires underscore collections/col_general

 * Displays <a href="http://opensource.org/licenses/gpl-3.0.html">GNU Public License</a>
 * @license http://opensource.org/licenses/gpl-3.0.html GNU Public License
 */

(function (define) {
	define(['underscore', 'collections/col_general'], function (_, General) {
	    var changes = {};
		var add = General.prototype.constructor.prototype.add;
		function _unsaved() {
			var c = changes[this.cid];
			// some dummy data
			c.push(new Date().getTime());
		}

		function _preventSelect(file) {
			file.set('selected', false);
		}

		function _diff(ref, other) {
			var rl = ref.length, ol = other.length,
			i = 0;

			if (rl !== ol) {
				return true;
			}

			for (; i < rl; i++) {
				if (ref[i] !== other[i]) {
					return true;
				}
			}
			return false;
		}

		var Selection = General.extend({
			initialize: function () {
				this.cid = 'c' + _.uniqueId();
				changes[this.cid] = [];
			},

			record: function () {
				changes[this.cid] = this.pluck('path');
			},

			comparator: function (file) {
				return file.get('sorting');
			},

			getDiff: function () {
				var ref = this.pluck('path');
				return _diff(changes[this.cid], ref);
			},

			add: function (models) {
				var isArray =  _.isArray(models),
				modelsLength = isArray ? models.length : 1,
				//totalLength = this.models.length + modelsLength,
				totalLength = this.models.length,
				ids;
				if ((this.settings.limit !== undefined) && totalLength > this.settings.limit) {
					ids = _.isArray(models) ? _.pluck(models, 'id') : models.id;
					if (isArray) {
						setTimeout(function () {
							_.each(models, _preventSelect);
						}, 0);
					} else {
						setTimeout(function () {
							_preventSelect(models);
						}, 0);
					}
					this.trigger('selectionlimitexceed', ids);
					return false;
				}

				return add.apply(this, arguments);
			},
			hasChanges: function () {
				return !! changes[this.cid].length;
			}
		});
		return Selection;
	});
}(this.define));

