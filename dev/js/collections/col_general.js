(function (define) {
	// body
	define(['underscore', 'backbone'], function (_, Backbone) {
		var Collection = Backbone.Collection.extend({

			addSetting: function (key, value, override) {
				this.settings = this.settings || {};
				if (this.settings[key] && override !== true) {
					throw ('setting ' + key + 'already defined');
				}
				this.settings[key] = value;
				return this;
			}
		});
		Collection.defaults = {};
		return Collection;
	});
}(this.define));

