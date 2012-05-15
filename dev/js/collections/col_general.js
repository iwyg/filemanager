/**
 * @package Collections
 * @author thomas appel <mail@thomas-appel.com>
 * @requires underscore backbone

 * Displays <a href="http://opensource.org/licenses/gpl-3.0.html">GNU Public License</a>
 * @license http://opensource.org/licenses/gpl-3.0.html GNU Public License
 */

(function (define) {
	// body
	define(['underscore', 'backbone'], function (_, Backbone) {
		var constructor = Backbone.Collection.prototype.constructor,
		General = function () {
			this.settings = this.settings || {};
			constructor.apply(this, arguments);
		},
		Collection;
		General.prototype = Backbone.Collection.prototype;

		General.extend =  Backbone.Collection.extend;

		Collection = General.extend({
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

