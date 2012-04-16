<?php 
	/**
	 * @package filemanager
	 * @author thomas appel <mail@thomas-appel.com>

	 * Displays <a href="http://opensource.org/licenses/gpl-3.0.html">GNU Public License</a>
	 * @license http://opensource.org/licenses/gpl-3.0.html GNU Public License
	 */ 

	require_once(TOOLKIT . '/class.alert.php');

	define('FILEMANAGER_WORKSPACE', preg_replace('/\//i', DIRECTORY_SEPARATOR , WORKSPACE)); 
	define('FILEMANAGER_EXCLUDE_DIRS', ',/workspace/events,/workspace/data-sources,/workspace/text-formatters,/workspace/pages,/workspace/utilities,/workspace/translations');

	Class extension_filemanager extends Extension 
	{

		public function __construct(Array $args) 
		{
			parent::__construct($args);
		}
		public function about() 
		{
			return array(
				'name' => 'Filemanager',
				'type'	=> 'field',
				'version' => 'dev 1.4.2',
				'release-date' => '2012-04-17',
				'author' => array(
					'name' => 'Thomas Appel',
					'email' => 'mail@thomas-appel.com',
					'website' => 'http://thomas-appel.com'
				),
				'description' => 'a workspace filemanager',
				'compatibility' => array(
					'2.2.5' => true
				)
			);
		}

		public function getSubscribedDelegates()
		{
			return array(

				// Subsection Manager
				array(
					'page' => '/backend/',
					'delegate' => 'AdminPagePreGenerate',
					'callback' => '__appendAssets'
				),
				array(
					'page' => '/system/preferences/',
					'delegate' => 'AddCustomPreferenceFieldsets',
					'callback' => '__appendPreferences'
				),				
				array(
					'page' => '/system/preferences/',
					'delegate' => 'Save',
					'callback' => 'save'
				),				
				array(
					'page' => '/backend/',
					'delegate' => 'AppendPageAlert',
					'callback' => '__checkDependencies'
				),				
			);
		}

		/**
		 * TODO: Fix error catching
		 */ 
		public function uninstall() 
		{
			/* Drop configuration array */
			Symphony::Configuration()->remove('filemanager');
			Administration::instance()->saveConfig();	
			/* Drop database tables */
			try {
				Symphony::Database()->query("DROP TABLE `tbl_fields_filemanager`");
			} catch (DatabaseException $db_err) {
				
			}
			return true;
		}

		public function install() 
		{
			if (!Symphony::Configuration()->get('filemanager')) {
				Symphony::Configuration()->set('mimetypes', 'application/pdf image/jpeg image/png text/*', 'filemanager');
				Symphony::Configuration()->set('ignore', base64_encode('^\..*'), 'filemanager');
				//Symphony::Configuration()->set('ignore', '/\..*/i', 'filemanager');
			}

			Administration::instance()->saveConfig();	

			Symphony::Database()->query(
				"CREATE TABLE `tbl_fields_filemanager` (
					`id` int(11) unsigned NOT NULL auto_increment,
					`field_id` int(11) unsigned NOT NULL,
					`destination` varchar(255) NOT NULL,
					`exclude_dirs` varchar(8000) default NULL,
					`ignore_files` varchar(255),
					`limit_files` int(11) default NULL,
					`allow_file_delete` tinyint(1) default '0',
					`select_uploaded_files` tinyint(1) default '0',
					`unique_file_name` tinyint(1) default '0',
					`allow_file_move` tinyint(1) default '0',
					`allow_dir_delete` tinyint(1) default '0',
					`allow_dir_move` tinyint(1) default '0',
					`allow_dir_create` tinyint(1) default '0',
					`allow_dir_upload_files` tinyint(1) default '0',
					`allowed_types` varchar(255),
					PRIMARY KEY (`id`),
					KEY `field_id` (`field_id`)
				) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;"
			);
			return true;
		}

		/**
		 * apend needed css an js files to the document head
		 */
		public function __appendAssets($context) {
			$callback = Symphony::Engine()->getPageCallback();
			// Append styles for publish area
			if($callback['driver'] == 'publish') {
			}
			if($callback['driver'] == 'publish' && $callback['context']['page'] != 'index') {
				Administration::instance()->Page->addStylesheetToHead(URL . '/extensions/filemanager/assets/css/filemanager.publish.css', 'screen', 100, false);
				Administration::instance()->Page->addScriptToHead(URL . '/extensions/filemanager/assets/js/init.js', 112, false);
			}
		}

		/**
		 * set fields for preference page
		 */
		public function __appendPreferences(&$context) {
			$group = new XMLElement('fieldset');
			$group->setAttribute('class', 'settings');
			$group->appendChild(new XMLElement('legend', 'Filemanager'));

			$label = Widget::Label(__('Default MIME types'));
			$label->appendChild(
				Widget::Input(
					'settings[filemanager][mimetypes]',
					General::Sanitize(Symphony::Configuration()->get('mimetypes', 'filemanager'))
				)
			);
			$help = new XMLElement('p', __('Define the default mimetypes separated be a whitespace character that should be allowed for uploading. <br/> You can use wildcards as well, e.g. <code>text/*</code> will allow all text based mimetypes. Use a single <code>*</code> to allow all types of files (not recomended).'), array('class' => 'help'));
			$ca = array();
			array_push($ca, $label, $help);

			$group->appendChildArray($ca);

			$label = Widget::Label(__('Ignore files'));
			$label->appendChild(
				Widget::Input(
					'settings[filemanager][ignore]',
					//General::Sanitize(Symphony::Configuration()->get('ignore', 'filemanager'))
					base64_decode(Symphony::Configuration()->get('ignore', 'filemanager'))
				)
			);
			$help = new XMLElement('p', __('<code>RegExp:</code> Define which files should be ignored by the directory listing (default: ignores all dot-files <code>^\..*</code>. Separate expressions with a whitespace)'), array('class' => 'help'));

			$ca = array();
			array_push($ca, $label, $help);

			$group->appendChildArray($ca);

			$context['wrapper']->appendChild($group);
		}	

		public function save(&$context) {
			if (!empty($context['settings']['filemanager']['ignore'])) {
				$context['settings']['filemanager']['ignore'] = base64_encode($context['settings']['filemanager']['ignore']);
			}
		}	
		/**
		 * @see http://symphony-cms.com/learn/api/2.2/toolkit/extension/#update
		 */
		public function update($previousVersion) {
			$previousVersion = preg_replace('/^\w+\s?/i', '', $previousVersion);

			if(version_compare($previousVersion, '1.2', '<')) {
				// sanitatize broken ignore regexp form beta 1.1 release
				$ignore = base64_decode(Symphony::Configuration()->get('ignore','filemanager'));
				$ignore = preg_replace('/(\/i?|\(|\))/i', '', $ignore);

				Symphony::Configuration()->set('ignore', base64_encode($ignore), 'filemanager');
				Administration::instance()->saveConfig();	
			}
		}

		/**
		 * TODO: translate alerts
		 */
		public function __checkDependencies(&$context) {
			if(!class_exists('extension_sym_requirejs')) {
				Symphony::Engine()->Page->Alert = new Alert('Filemanager requires requirejs. Please make sure the extension sym_requirejs is installed', Alert::ERROR);
			}
			if(!class_exists('extension_sym_backbonejs')) {
				Symphony::Engine()->Page->Alert = new Alert('Filemanager requires backbonejs Please make sure extension sym_backbonejs is installed', Alert::ERROR);
			}
		}
	}
