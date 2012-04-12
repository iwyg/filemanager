(function (define) {
	define(['underscore', 'collections/col_general'], function (_, General) {
	    var changes = {};
		var add = General.prototype.constructor.prototype.add;
		function _unsaved() {
			var c = changes[this.cid];
			// some dummy data
			c.push(new Date().getTime());
		}
		var Selection = General.extend({
			initialize: function () {
				this.cid = 'c' + _.uniqueId();
				changes[this.cid] = [];
				this.on('add remove', _.bind(_unsaved, this));
			},

			add: function (models) {
				var modelsLength = _.isArray(models) ? models.length : 1,
				totalLength = this.models.length + modelsLength,
				ids;

				if (this.settings.limit && totalLength > this.settings.limit) {
					ids = _.isArray(models) ? _.pluck(models, 'id') : models.id;
					this.trigger('selectionlimitexceed', ids);
					return false;
				}

				add.apply(this, arguments);
			},
			hasChanges: function () {
				return !! changes[this.cid].length;
			}
		});
		return Selection;
	});
}(this.define));

