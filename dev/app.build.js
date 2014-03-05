({
    appDir: "js",
    baseUrl: ".",
    dir: "../build/js",
    //Comment out the optimize line if you want
    //the code minified by UglifyJS.
    //optimize: "none",

	paths: {
		'jquery': 'libs/jquery',
		//'fm_settings': 'settings',
		//'bootstrap': 'bootstrap',
		'orderable': '../../../../symphony/assets/js/symphony.orderable',
		//'jqueryui': 'libs/jquery-ui-1.8.18.custom',
		'jqueryui': 'libs/jquery-ui-1.10.3.custom.min',
		'underscore': '../../../sym_backbonejs/assets/underscore',
		'backbone': '../../../sym_backbonejs/assets/backbone',
		'text': '../../../sym_requirejs/assets/text'
	},
	skipModuleInsertion: false,
    modules: [
        {
			name: "main",
			exclude: ['jquery', 'jqueryui', 'underscore', 'backbone', 'text', 'orderable']
        }
    ]
})
