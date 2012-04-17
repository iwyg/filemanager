<?php 
/**
 * @package lIb
 * @author thomas appel <mail@thomas-appel.com>
 *
 * @deprecated
 *
 * Displays <a href="http://opensource.org/licenses/gpl-3.0.html">GNU Public License</a>
 * @license http://opensource.org/licenses/gpl-3.0.html GNU Public License
 */ 

require_once(EXTENSIONS . '/filemanager/lib/class.directorytools.php');
Class Upload 
{
	/* error codes */
	const F_ERR = 2;
	const F_ERR_S = 6;
	const D_ERR = 12;
	const P_ERR_R = 24;
	const P_ERR_W = 48;

	static $defaults = array(
		'desination'	=> '/',
		'evaluate_type'	=> '*',
		'max_size'		=> 0,
		'uniqid_names'	=> true
	);

	protected $_settings;

	public function __construct($conf=NULL) 
	{
		$this->_name = 'upload';		

		$this->_files = current(&$_FILES);	
		$this->_errors = array();

		if (is_null($conf)) {
			$conf = Upload::$defaults;
		}

		$this->_settings = array_merge(Upload::$defaults, $conf);
	}

	private static function trimPath($path) {
		return preg_replace('/\/?$/', '/', $path);
	}

	private function _getSettings($key) 
	{
		return $this->_settings[$key];
	}

	private function evaluate(&$file, $fname=NULL) 
	{
		/* sanetize evaluation string and strip out doubled whitespace chars and commas */
		$allowed_types = preg_replace('/(\s+|,\s+?)/m', ' ', $this->_getSettings('evaluate_type'));
		$size = $this->_getSettings('max_size');
		$eval = $allowed_types != '*' ? $allowed_types : false;
		$max_size = $size > 0 ? $size : false;  

		if ($max_size != false && filesize($file) > $max_size) {
			$this->handleFileError($fname, self::F_ERR_S);
			return false;
		} elseif ($eval == false) {
			return true;
		}

		$mime = DirectoryIteratorUtils::getMimeType($file);

		/* prepare for wildcard MIME types (e.g text/*) */
		$wc_mime = preg_replace('/(\/\S+)$/', '\/\*', $mime);

		if (preg_match('/' . $wc_mime . '/mi', $eval) || preg_match('/' . preg_replace('/\//', '\/', $mime) . '/mi', $eval)) {
			return true;			
		} else {
			$this->handleFileError($fname, self::F_ERR);
		}

		return false;
	}

	private function handleFileError($name, $err_type, $mst = NULL)
	{
		

		switch ($err_type) {
		case 2:
			$msg = $name . ': Filetype not allowed';
			break;
		case 6:
			$msg = $name . ': Filesize exeeds allowed value';
			break;
		case 12:
			$msg = $name . ': is not a directory';
			break;
		case 24:
			$msg = 'Directory' . $name . ': you dont have permission to read this directory';
			break;
		case 48:
			$msg = 'Directory' . $name . ': you dont have permission to write to this directory';
			break;
		default:
			$msg = $name . ': undefined error occured';
			break;
		}
		array_push($this->_errors, $msg);
	}

	public function moveFilesTo()
	{
		$dest = Upload::trimPath($this->_getSettings('desination'));
		/* check if desination is writeable/readable */
		if (!is_dir($dest)) {
			$this-handleFileError($dest, self::D_ERR);
		} elseif (!is_readable($dest))  {
			$this-handleFileError($dest, self::P_ERR_R);
		} elseif (!is_writable($dest)) {
			$this-handleFileError($dest, self::P_ERR_W);
		}

		foreach($this->_files['name'] as $index => $file) {
			$tmp_file = &$this->_files['tmp_name'][$index];
			if ($this->evaluate($tmp_file, $file)) {
				$fpath = $this->_getSettings('uniqid_names') ? Upload::trimPath($dest) . $this->getUniqueName($file) : $file;
				move_uploaded_file($tmp_file, $fpath);
			}
		}	

	}
	public function getUniqueName($filename) 
	{
		$crop  = '30';
		return preg_replace("/([^\/]*)(\.[^\.]+)$/e", "substr('$1', 0, $crop).'-'.uniqid().'$2'", $filename);
	}
	public function getErrors()
	{
		if (sizeof($this->_errors > 0)) {
			return $this->_errors;	
		}
		return false;
	}
}
