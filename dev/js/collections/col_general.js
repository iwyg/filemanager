/**
 * @package filemanager
 * @author thomas appel <mail@thomas-appel.com>

 * Displays <a href="http://opensource.org/licenses/gpl-3.0.html">GNU Public License</a>
 * @license http://opensource.org/licenses/gpl-3.0.html GNU Public License
 */

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

