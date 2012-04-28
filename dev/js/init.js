/**
 * @package filemanager
 * @author thomas appel <mail@thomas-appel.com>

 * Displays <a href="http://opensource.org/licenses/gpl-3.0.html">GNU Public License</a>
 * @license http://opensource.org/licenses/gpl-3.0.html GNU Public License
 */

(function (window, require, define, Symphony) {
	define('bootstrap', ['fm_settings'], function (settings) {
		return function (id, entry_id, instance) {
			console.log(arguments);
			settings.instances['filemanager-' + instance] = {
				field_id: id,
				instance: instance,
				entry_id: entry_id
			};
		};
	});

	require({
		baseUrl: Symphony.Context.get('root') + '/extensions/filemanager/assets/js',
		paths: {
			'jquery': 'libs/jquery',
			//'jquery': '../../../../symphony/assets/js/jquery',
			'fm_settings': 'settings',
			//'bootstrap': 'bootstrap',
			'orderable': '../../../../symphony/assets/symphony.orderable',
			'jqueryui': 'libs/jquery-ui-1.8.18.custom',
			'underscore': '../../../sym_backbonejs/assets/underscore',
			'backbone': '../../../sym_backbonejs/assets/backbone',
			'text': '../../../sym_requirejs/assets/text'
			//'jquery': 'libs/jquery', // use system default
			//'notify': '../../../../symphony/assets/js/symphony.notify',
			//'timeago': '../../../../symphony/assets/js/symphony.timeago',
			//'jquery': '//ajax.googleapis.com/ajax/libs/jquery/1/jquery',
		},
		//urlArgs: Date.now() // add this during development
	}, ['main']);
}(this, this.require, this.define, this.Symphony));

