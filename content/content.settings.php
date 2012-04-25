<?php 
/**
 * @package content
 * @author thomas appel <mail@thomas-appel.com>

 * Displays <a href="http://opensource.org/licenses/gpl-3.0.html">GNU Public License</a>
 * @license http://opensource.org/licenses/gpl-3.0.html GNU Public License
 */ 

require_once(EXTENSIONS . '/filemanager/lib/class.jsonpage.php');
require_once(TOOLKIT . '/class.fieldmanager.php');
require_once(EXTENSIONS . '/filemanager/fields/field.filemanager.php');

Class contentExtensionFilemanagerSettings extends JSONPage {
	static $exclude = array('/workspace/data-sources', '/workspace/events', '/workspace/pages', '/workspace/translations');	

	protected $_roots = array();
	protected $_fid = NULL;

	public function __construct(&$parent) {
		parent::__construct($parent);

		GenericExceptionHandler::$enabled = false;
		$post = General::getPostData();

		$this->_roots = $this->sanitizePath($this->_getRootPaths());
		$this->_fid = isset($_GET['field_id']) ? intval($_GET['field_id'], 10) : NULL;

		if (is_null($this->_fid)) {
			return;
		}

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

	/**
	 * fetch the fieldsetting array 
	 * @param boolean $add convert settings or not
	 */ 
	public function setSettings($add=true) {

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

	/**
	 * converts truthy and falthy 0 and 1 values in boolean values
	 * and sanitizes exclude values
	 *
	 * @param array $settings the setting array to convert
	 */ 
	private function convertSettings(&$settings) {
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

	/**
	 * fetches a the value from the setting array 
	 *
	 * @param string $key key name of setting
	 */ 
	public function get($key = NULL) {
		if (!$key) return;
		$val = $this->_settings[$key];
		return isset($val) ? $val : NULL;
	}

	/**
	 * Fetch the fieldsetting by a field id
	 * returns a single setting value or the whole setting array if no setting 
	 * name is specified
	 *
	 * @param mixed $field_id the field id 
	 * @param string $setting setting name which should be fetched
	 *
	 * @return mixed  
	 */
	public static function getFieldSettings($field_id = NULL, $setting = NULL) {
		$f_mng = new FieldManager(Administration::instance());
		return $f_mng->fetch($field_id)->get($setting);
	}
	
	/**
	 * Set a fieldsetting by a field id
	 *
	 * @param mixed $field_id the field id 
	 * @param string $attrib setting name which should be set
	 * @param string $val setting value which should be set
	 *
	 * @return void  
	 */
	public static function setFieldSettings($field_id = NULL, $attrib = NULL, $val = NULL) {
		$f_mng = new FieldManager(Administration::instance());
		$field = $f_mng->fetch($field_id);
		$field->set($attrib, $val);
		$field->commit();
	}
	
	public static function save($id) {
		$f_mng = new FieldManager(Administration::instance());
		return $f_mng->fetch($id)->commit();
	}
	
	/**
	 * Sanitize a Path(fragment) String by replacing the `\` or `/` with the `DIRECTORY_SEPARATOR` constant
	 *
	 * @param string $path
	 * @return string sanitized pathfragment
	 */ 
	public function sanitizePathFragment($path) {
		return preg_replace('/(\/|\\\)/i', DIRECTORY_SEPARATOR, $path);
	}

	/**
	 * converts relative relative (rel to workspace) path to a full path
	 * @param mixed $path string or array
	 *
	 * @return mixed string or array
	 */
	public function sanitizePath($path) {
		if (is_array($path)) {
			foreach	($path as $p => $d) {
				$path[$p] = $this->sanitizePath($d);
			}
			return $path;
		} 
		return FILEMANAGER_WORKSPACE . substr($path, strlen(DIRECTORY_SEPARATOR . 'WORKSPACE'));
	}
	
	public function getRootPaths() {
		return $this->_roots;
	}

	protected function _getRootPaths() {
		$dest = array();
		$q = Symphony::Database()->fetch('SELECT `destination` FROM `sym_fields_filemanager`');

		if (isset($q) && is_array($q)) {
			foreach($q as $d) {
				if (isset($d['destination'])) {
					$dest[] = $d['destination'];
				}
			}
		}
		return $dest;
	}

	public function isRoot($path, $sanitize=NULL) {
		if ($sanitize) {
			$path = $this->sanitizePath($path);
		}
		return in_array($path, $this->_roots);
	}

}
