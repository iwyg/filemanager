/**
 * @package filemanager
 * @author thomas appel <mail@thomas-appel.com>

 * Displays <a href="http://opensource.org/licenses/gpl-3.0.html">GNU Public License</a>
 * @license http://opensource.org/licenses/gpl-3.0.html GNU Public License
 */

(function (window, require, define, Symphony) {

	function setUp(url) {
		require({
			baseUrl: url + '/extensions/filemanager/assets/js',
			paths: {
				'jquery': 'libs/jquery',
				//'jquery': '//ajax.googleapis.com/ajax/libs/jquery/1/jquery',
				'jqueryui': 'libs/jquery-ui-1.8.18.custom',
				'underscore': '../../../sym_backbonejs/assets/underscore',
				'backbone': '../../../sym_backbonejs/assets/backbone',
				'text': '../../../sym_requirejs/assets/text'
			},
			urlArgs: Date.now() // add this during development
		}, ['main']);
	}

	/* wait until Symphony Singleton is populated */
	function trace() {
		if (!Symphony.Context.get('root')) {
			setTimeout(function () {
				trace();
			}, 5);
		} else {
			setUp(Symphony.Context.get('root'));
		}
	}
	trace();

}(this, this.require, this.define, this.Symphony));

