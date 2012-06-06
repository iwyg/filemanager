/**
 * @package filemanager
 * @author thomas appel <mail@thomas-appel.com>

 * Displays <a href="http://opensource.org/licenses/gpl-3.0.html">GNU Public License</a>
 * @license http://opensource.org/licenses/gpl-3.0.html GNU Public License
 */

(function (define) {
	define('bootstrap', ['fm_settings'], function (settings) {
		return function (id, instance) {
			settings.instances['filemanager-' + instance] = {
				field_id: id,
				instance: instance
			};
		};
	});
}(this.define));
