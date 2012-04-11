
<?php 
require_once(TOOLKIT . '/class.general.php');
require_once(EXTENSIONS . '/filemanager/content/content.settings.php');
require_once(EXTENSIONS . '/filemanager/lib/class.directorytools.php');

Class contentExtensionFilemanagerListing extends contentExtensionFilemanagerSettings
{

	public function __construct(&$parent) 
	{
		parent::__construct($parent);
		if (is_array($_POST)) {
			//print_r($_POST);
		}
	}

	public function process() 
	{
		parent::process();
		// extend settings;
		$this->_settings = array_merge($this->_settings, Administration::Configuration()->get($this->_settings['type']));

		$data = General::getPostData();
		
		/* if there's a POST request, we'll handle the operations based on the */
		if (is_array($data)) {

			switch($data['action']) {
				case 'delete_file': 
					$this->deleteFiles($data['files']);	
					break;
				case 'move_file':
					$this->moveFiles($data['files']);
			}
		}

		$this->getDirectoryListing();
	}

		
	public function deleteFiles($file) {
		if (!$this->_settings['allow_file_delete']) return;
		if (is_array($file)) {
			foreach($file as $f) {
				$this->deleteFiles($this->untrimPath($f));
			}
		}
		General::deleteFile($file, true);
	}

	public function moveFiles($file) {
		if (!$this->_settings['allow_file_move']) return;
		foreach ($file as $f) {

			if (is_dir($f['dest'])) {

				preg_match('/[^\/]*\..*$/i', $f['file'], $fname);
				
				$n_name = $f['dest'] . $fname[0];

				if (is_file($n_name)) {
					$n_name = $this->getUniqueName($n_name);
					print_r($n_name);
				}	
				rename($f['file'], $n_name);
			}
		}
		
	}

	public function deleteDir() 
	{
		
	}

	public function moveDir() 
	{
		
	}

	public function untrimPath($path)
	{
		return WORKSPACE . preg_replace('/workspace/', '', $path);
	}

	public function getUniqueName($filename) 
	{
		$crop  = '30';
		return preg_replace("/([^\/]*)(\.[^\.]+)$/e", "substr('$1', 0, $crop).'-'.uniqid().'$2'", $filename);
	}

	public function getDirectoryListing()
	{
		$tp = $_GET['select']; // if 'select' is set, update information on a specific subdir on the root path

		$dest_path = !isset($tp) ?  $this->get('destination') : '/workspace' . $tp;

		$base_dir = $this->sanitizePath($dest_path);

		$count_level_str = substr(substr($dest_path, strlen($this->get('destination'))), 1); 

		$nesting = !isset($tp) ? 0 : strlen($count_level_str) ? sizeof(explode('/', $count_level_str)) : 0;

		/*
		if (isset($tp)) {
			print_r($nesting);
			$_test = explode('/', substr(substr($dest_path, strlen($this->get('destination'))), 1));
			var_dump(empty($_test));
			print_r(substr(substr($dest_path, strlen($this->get('destination'))), 1));
			print_r(explode('/', substr(substr($dest_path, strlen($this->get('destination'))), 1)));
		}
		 */
		$ignore_files =  $this->get('ignore_files');

		$ignore = base64_decode(Symphony::Configuration()->get('ignore', 'filemanager'));
		$ignore = explode(' ', ((strlen($ignore) > 0 && strlen($ignore_files) > 0) ? $ignore . ' ' : $ignore) . $ignore_files);
		$ignore = sizeof($ignore) > 0 ? '/(' . implode('|', $ignore) . ')/i' : '';
		$excl = $this->sanitizePath(explode(',', FILEMANAGER_EXCLUDE_DIRS));

		//print_r($ignore);

		array_shift($excl);

		$exclude = array_merge($excl, $this->sanitizePath(explode(',', $this->get('exclude_dirs'))));

		$dirs = new DirectoryTools($base_dir, $ignore, $exclude, $nesting);

		$dir_tree = $dirs->getDirectoryTree(true);
		$this->_Result = $dir_tree;

	}

	public function sanitizePath($path) {
		if (is_array($path)) {
			foreach	($path as $p => $d) {
				$path[$p] = $this->sanitizePath($d);
			}
			return $path;
		} 
		return WORKSPACE . substr($path, strlen('/WORKSPACE'));
	}


}
?>
