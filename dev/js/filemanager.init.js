/**
 * @package filemanager
 * @author thomas appel <mail@thomas-appel.com>

 * Displays <a href="http://opensource.org/licenses/gpl-3.0.html">GNU Public License</a>
 * @license http://opensource.org/licenses/gpl-3.0.html GNU Public License
 */

(function (window, require, define, Symphony) {

	define('settings', [], function () {
		return {
			root: Symphony.Context.get('root'),
			instances: {}
		};
	});

	define('bootstrap', ['settings'], function (settings) {
		return function (id, instance) {
			settings.instances['filemanager-' + instance] = {
				field_id: id,
				instance: instance
			};
		};
	});

	require({
		baseUrl: Symphony.Context.get('root') + '/extensions/filemanager/assets/js',
		paths: {
			//'jquery':		'../../../../symphony/assets/js/jquery',
			'jquery':		'libs/jquery',
			'orderable':	'../../../../symphony/assets/js/symphony.orderable',
			//'jqueryui':		'libs/jquery-ui-1.10.3.custom',
			'jqueryui':		'libs/jquery-ui-1.8.18.custom',
			'underscore':	'../../../sym_backbonejs/assets/underscore',
			'backbone':		'../../../sym_backbonejs/assets/backbone',
			'text':			'../../../sym_requirejs/assets/text'
		},
		//urlArgs: Date.now() // add this during development
	}, ['main']);
}(this, this.require, this.define, this.Symphony));

