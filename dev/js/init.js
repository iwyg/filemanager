/**
 * @package filemanager
 * @author thomas appel <mail@thomas-appel.com>

 * Displays <a href="http://opensource.org/licenses/gpl-3.0.html">GNU Public License</a>
 * @license http://opensource.org/licenses/gpl-3.0.html GNU Public License
 */

(function (window, require, define, Symphony) {
	require({
		baseUrl: Symphony.Context.get('root') + '/extensions/filemanager/assets/js',
		paths: {
			//'jquery': 'libs/jquery', // use system default
			'fm_settings': 'settings',
			'bootstrap': 'bootstrap',
			'jquery': '../../../../symphony/assets/js/jquery',
			'orderable': '../../../../symphony/assets/js/symphony.orderable',
			//'jquery': '//ajax.googleapis.com/ajax/libs/jquery/1/jquery',
			'jqueryui': 'libs/jquery-ui-1.8.18.custom',
			'underscore': '../../../sym_backbonejs/assets/underscore',
			'backbone': '../../../sym_backbonejs/assets/backbone',
			'text': '../../../sym_requirejs/assets/text'
		},
		//urlArgs: Date.now() // add this during development
	}, ['main']);
	console.log('me 1');
}(this, this.require, this.define, this.Symphony));

