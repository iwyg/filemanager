<?php 

require_once(TOOLKIT . '/class.fieldmanager.php');
require_once(EXTENSIONS . '/filemanager/lib/class.upload.php');
require_once(EXTENSIONS . '/filemanager/content/content.settings.php');
require_once(EXTENSIONS . '/filemanager/lib/class.directorytools.php');

Class contentExtensionFilemanagerUpload extends contentExtensionFilemanagerSettings
{

	public function __construct(&$parent) 
	{
		parent::__construct($parent);
		$this->moveUploadedFiles();


	}
	/**
	 * Validate uploaded file for mimetype and filesize
	 * @param {String} $tempname uploaded file
	 */
	public function validateUploadedFile($tempname) {
		$max_upload_size = intval($this->get('max_upload_size'));
		$allowed_types =  '/' . $this->get('allowed_types') . '/i';
		$mime_type = DirectoryTools::getMimeType($tempname);

		if (!preg_match($allowed_types, $mime_type)) {
			$this->handleGeneralError(array('error' => array('message' => 'file type not allowed', 'context' => array('file' => $file))));
			return false;
		}
		if (filesize($tempname) > $max_upload_size) {
			$this->handleGeneralError(array('error' => array('message' => 'file size limit exceeds', 'context' => array('file' => $file))));
			return true;
		}
		return true;
	}

	public function process() {
		$this->setSettings(false);

		//print_r($this->_settings);
		//print_r($this->get('allow_dir_upload_files'));
	}

	public function moveUploadedFiles() {
		$data = General::getPostData();

		if (isset($data['iframe'])) {
			$this->_iframe_transport = true;
			//$this->_Result = $data;
			//return;
		}


		$unique = intval($this->get('unique_file_name'), 10) == 1;
		$dest = $data['destination'] . '/';
		$results = array();

		if (is_array($data['file'])) {
			foreach($data['file'] as $i => $file) {
				if (!$this->validateUploadedFile($file['tmp_name'])) {
					return false;	
				}
				if (!is_dir(WORKSPACE . $dest)) {
					// invalid destination error
					$this->handleGeneralError(array('error' => array('message' => 'invalid destination: {$dir}', 'context' => array('dir' => $dest))));	
					return false;
				}

				$new_file = $unique ? DirectoryTools::getUniqueName($file['name']) : $file['name'];

				if (is_file(WORKSPACE . $dest . $new_file)) {
					// file exists error 					
					$this->handleGeneralError(array('error' => array('message' => 'file {$file} already exists', 'context' => array('file' => $new_file))));	
					return false;
				}

				if (General::uploadFile(WORKSPACE . $dest, $new_file, $file['tmp_name'])) {
					$results[] = array(
						'file' => 'ok',
						'name' => $new_file,
						'src' => $this->getHttpPath($dest . $new_file)
					);
				} else {
					$this->handleGeneralError(array('error' => array('message' => 'Cannot upload {$file}', 'context' => array('file' => $new_file))));
					return false;		
				}
			}

			$this->success($results);	
		}
	}
	public function success($data) {
		$this->_Result = $data;
	}
	public function getHttpPath ($path) {
		return URL . '/workspace' . $path;
	}
}
