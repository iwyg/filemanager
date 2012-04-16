<?php 
/**
 * @package content
 * @author thomas appel <mail@thomas-appel.com>

 * Displays <a href="http://opensource.org/licenses/gpl-3.0.html">GNU Public License</a>
 * @license http://opensource.org/licenses/gpl-3.0.html GNU Public License
 */ 

require_once(EXTENSIONS . '/filemanager/lib/class.jsonpage.php');
require_once(TOOLKIT . '/class.fieldmanager.php');

Class contentExtensionFilemanagerSettings extends JSONPage
{
	static $exclude = array('/workspace/data-sources', '/workspace/events', '/workspace/pages', '/workspace/translations');	

	public function __construct(&$parent) 
	{
		GenericExceptionHandler::$enabled = false;
		parent::__construct($parent);
		$post = General::getPostData();

		$this->_fid = intval($_GET['field_id'], 10);

		if (isset($post['set'])) {
			//print_r($post);
			if (is_array($post['set'])) {
				foreach($post['set'] as $attr => $val) {
					$this->setAttribute($attr, $val);
				}
			}
			//contentExtensionFilemanagerSettings::save($this->_fid);	
		}
		$this->process();
	
	}
	public function process() {
		$this->setSettings();
	}
	public function setAttribute($attrib, $val=NULL) {
		if ($val == NULL) {
			return NULL;
		}
		contentExtensionFilemanagerSettings::setFieldSettings($this->_fid, $attrib, 'test');
	}
	public function setSettings($add=true)
	{
		$this->_settings = contentExtensionFilemanagerSettings::getFieldSettings($this->_fid);
		if (!isset($this->_settings['allowed_types'])) {
			$std_mime_types = Symphony::Configuration()->get('mimetypes', 'filemanager'); 
			$this->_settings['allowed_types'] = $std_mime_types ? $std_mime_types : '*./*';
		}
		$max_upload_size = Symphony::Configuration()->get('max_upload_size', 'admin'); 
		$this->_settings['max_upload_size'] = $max_upload_size ? intval($max_upload_size) : 0;

		$exp_allowed_types = '(' . implode('|', explode(' ', $this->get('allowed_types'))) . ')';
		$exp_allowed_types = preg_replace('/\/\*/i', '/.*', $exp_allowed_types);

		$this->_settings['allowed_types'] = preg_replace('/\//', '\\\/',$exp_allowed_types);

		if ($add) $this->_Result = $this->convertSettings($this->_settings);
	}

	private function convertSettings(&$settings) 
	{
		foreach($settings as $item => $val) {
			if (substr($item, 0, 6) == 'allow_') {
				$settings[$item] = ($val == 0) ? false : true;
			}
		}
		$settings['exclude'] = explode(',', $settings['exclude']);
		if (strlen($settings['exclude'][0]) > 0) {
			$settings['exclude'] = array_merge($settings['exclude'], self::$exclude);
		} else {
			$settings['exclude'] = self::$exclude;
		}
		return $settings;
	}

	public function get($key = NULL) {
		if (!$key) return;
		$val = $this->_settings[$key];
		return isset($val) ? $val : NULL;
	}
	
	public static function getFieldSettings($field_id = NULL, $setting = NULL)
	{
		$f_mng = new FieldManager(Administration::instance());
		return $f_mng->fetch($field_id)->get($setting);
	}
	
	public static function setFieldSettings($field_id = NULL, $attrib = NULL, $val = NULL)
	{
		$f_mng = new FieldManager(Administration::instance());
		$field = $f_mng->fetch($field_id);
		$field->set($attrib, $val);
		$field->commit();
	}
	
	public static function save($id) {
		$f_mng = new FieldManager(Administration::instance());
		return $f_mng->fetch($id)->commit();
	}

	public function sanitizePathFragment($path) {
		return preg_replace('/(\/|\\\)/i', DIRECTORY_SEPARATOR, $path);
	}

}
