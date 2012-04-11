<?php 

require_once(TOOLKIT . '/class.fieldmanager.php');
require_once(EXTENSIONS . '/filemanager/content/content.settings.php');
require_once(EXTENSIONS . '/filemanager/lib/class.directorytools.php');

Class contentExtensionFilemanagerEdit extends contentExtensionFilemanagerSettings
{

	public function __construct(&$parent) 
	{
		//parent::__construct($parent);
		if (isset($_POST['type'])) {
			$this->task($_POST['type']);
		} else {
			$this->handleGeneralError(array('error' => 'can\'t proceed'));
		}

	}

	public function task($type) {
		switch ($type) {
		case 'move':
			// code...
			$this->moveItem();
			break;
		case 'delete':
			// code...
			$this->deleteItem();
			break;
		case 'create':
			// code...
			$this->createDir();
			break;

		default:
			break;
		}
	}

	public function deleteItem() {
		$file = General::sanitize(WORKSPACE . $_POST['file']);
		if (!file_exists($file)) {
			$this->handleGeneralError(array(
				'error' => 'can\'t delete unknown ' . ($_POST['dataType'] == 'file' ? 'file' : 'directory') . ' ' . $_POST['file']
			));

			return false;
		}
		if ($this->deleteFile($file)) {
			$this->_Result = array('success' => 'successfully deleted ' . General::sanitize($_POST['file']));
		}
	}


	public function moveItem() {
		$fn = $_POST['from'];		
		$dstfn = General::sanitize(basename(WORKSPACE . $fn));

		$destDir =  WORKSPACE . $_POST['to'] . '/';

		$newDest = $destDir . $dstfn;
		/*
		if (file_exists($newDest) || is_dir($newDest)) {
			$this->handleGeneralError(array(
				'error' => $_POST['dataType'] == 'file' ? 'file exists' : 'directory exists'
			));
			return;
		}
		*/
		$new_file = WORKSPACE . $fn;	
		if ($this->moveFile($destDir, $dstfn, $new_file)) {
			$this->_Result = array(
				'success' => array(
					'message' => $_POST['dataType'] == 'file' ? 'file {$item} successfully moved to {$to}' : 'directory {$item} successfully moved {$to}',
					'context' => array(
						'to' => $_POST['to'],
						'item' => $fn
					)
				)
			);
		}

	}

	public function process() 
	{
		$this->setSettings(false);

		//print_r($this->_settings);
		//print_r($this->get('allow_dir_upload_files'));
	}

	public function deleteFile($file) {
		if (is_dir($file)) {
			try {
				contentExtensionFilemanagerEdit::rrmdir($file);
				return true;

			} catch (Exception $e) {
				$this->catchedExceptionHanlder($e);
			}
			
		}
		if (is_file($file)) {
			try {
				unlink($file);
				return true;

			} catch (Exception $e) {
				$this->catchedExceptionHanlder($e);
			}
		}
		return false;

	}

	private function moveFile($dest_path, $dest_file, $source_file) {
		$new_file = $dest_path . $dest_file;

		if (!is_dir($dest_path)) {
			$this->handleGeneralError(array(
				'error' => array(
					'message' => 'Directory {$dir} doesn\'t exist',
					'context' => array(
						'dir' => basename($dest_path)
					)
				)
			));
			return false;
		}

		if (file_exists($new_file)) {
			$this->handleGeneralError(array(
				'error' => array(
					'message' => $_POST['dataType'] == 'file' ? 'file {$file} already exists' : 'directory {$file} already exists',
					'context' => array(
						'file' => basename($new_file),
						'path' => $dest_path,
					)
				)
			));
			return false;
		}

		try {
			rename($source_file, $new_file);
			return true;

		} catch (Exception $e) {
			$this->catchedExceptionHanlder($e);
		}
	}

	public function createDir() {

		$name = $_POST['mkdir'];
		$dest_path = WORKSPACE  . $_POST['in'] . '/';

		if (is_dir($dest_path . $name) || file_exists($dest_path . $name)) {
			$this->handleGeneralError(array('error' => array('message' => 'directory {$file} already exists', 'context' => array('file' => $name, 'path' => $dest_path))));
			return false;
		}
		try {
			mkdir($dest_path . $name);
			$this->_Result = array('success' => array(
				'message' => 'Directory {$dir} successfully created in {$path}',
				'context' => array(
					'dir' => $name,
					'path' => substr($dest_path, strlen(WORKSPACE . '/'))
				)
			));
		} catch (Exception $e) {
			$this->catchedExceptionHanlder($e);
		}
		return false; 
	}

	private function catchedExceptionHanlder(&$exception) {
		$this->handleGeneralError(array('error' => array(
				'message' => $exception->getMessage(), 
				'context' => array(
					'trace' => $exception->getTrace() 
				)
			)
		));
	}
	
	/**
	 * recursiv directory deletion
	 * see : http://www.php.net/manual/de/function.rmdir.php#107233
	 */
	public static function rrmdir($dir) {
		if (is_dir($dir)) {
			$objects = scandir($dir);
			foreach ($objects as $object) {
				if ($object != "." && $object != "..") {
					if (filetype($dir."/".$object) == "dir") contentExtensionFilemanagerEdit::rrmdir($dir."/".$object); else unlink($dir."/".$object);
				}
			}
			reset($objects);
			rmdir($dir);
		}
	}

}
?>
