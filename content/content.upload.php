<?php
/**
 * @package content
 * @author thomas appel <mail@thomas-appel.com>

 * Displays <a href="http://opensource.org/licenses/gpl-3.0.html">GNU Public License</a>
 * @license http://opensource.org/licenses/gpl-3.0.html GNU Public License
 */

require_once(TOOLKIT . '/class.fieldmanager.php');
require_once(EXTENSIONS . '/filemanager/content/content.settings.php');
require_once(EXTENSIONS . '/filemanager/lib/class.directorytools.php');

/**
 * contentExtensionFilemanagerUpload
 *
 * @uses contentExtensionFilemanagerSettings
 */
class contentExtensionFilemanagerUpload extends contentExtensionFilemanagerSettings
{

    /**
     * __construct
     *
     * @access public
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
        $this->moveUploadedFiles();
    }

    /**
     * Validate uploaded file for mimetype and filesize
     * @param string $tempname uploaded file
     */
    public function validateUploadedFile($tempname, $file, $error)
    {

        if ($error !== 0) {
            $msg = '';

            switch ($error) {
                case 1:
                    $msg = 'file size ({$f_size}) limit exceeds allowed size';
                break;
                case 2:
                    $msg = 'file size ({$f_size}) limit exceeds allowed size';
                break;
                case 3:
                    $msg = "$file was only partially uploaded";
                break;
                case 4:
                    $msg = "$file was not uploaded";
                break;
                case 6:
                    $msg = "temprary upload directory is missing";
                break;
                case 7:
                    $msg = "couldn't write $file to disk";
                break;
                case 8:
                    $msg = "Upload has stopped for $file";
                break;
                default:
                    $msg = "undefined error";
                break;
            }

            $this->handleGeneralError($msg, array('f_size' => filesize($tempname)));
            return false;
        }

        $max_upload_size = intval($this->get('max_upload_size'));

        $allowed_types =  '/' . $this->get('allowed_types') . '/i';

        $mime_type = DirectoryTools::getMimeType($tempname);

        if (!preg_match($allowed_types, $mime_type)) {

            $this->handleGeneralError('file type {$mimetype} not allowed', array('mimetype' => $mime_type));
            return false;
        }

        if (filesize($tempname) > $max_upload_size) {

            $this->handleGeneralError('file size ({$f_size}) limit exceeds allowed size', array('f_size' => filesize($tempname)));
            return false;
        }

        return true;
    }

    /**
     * @see content/content.settings.php#process
     */
    public function process()
    {
        $this->setSettings(false);
    }

    /**
     *  try to move uploaded files to detination
     */
    public function moveUploadedFiles()
    {
        $data = General::getPostData();

        if (isset($data['iframe'])) {
            $this->_iframe_transport = true;
        }

        $unique = intval($this->get('unique_file_name'), 10) == 1;

        $dest = sprintf('%s/%s/', FILEMANAGER_WORKSPACE,  $this->sanitizePathFragment($data['destination']));

        $results = array();

        if (is_array($data['file'])) {

            foreach ($data['file'] as $i => $file) {

                if (!$valid = $this->validateUploadedFile($file['tmp_name'], $file['name'], intval($file['error']))) {
                    return $valid;
                }

                if (!is_writable($dest . $new_file)) {
                    // not writable error
                    $this->handleGeneralError('Cannot access {$file}', array('file' => $dest));
                    return false;
                }

                if (!is_dir($dest)) {
                    // invalid destination error
                    $this->handleGeneralError('invalid destination: {$dir}', array('dir' => $dest));
                    return false;
                }

                try {
                    $new_file = $unique ? DirectoryTools::getUniqueName($file['name']) : $file['name'];
                } catch (Exception $e) {
                    $this->handleGeneralError('fatal error: {$err}', array('err' => $e->getMessage()));
                    return false;
                }

                if (is_file($dest . $new_file)) {
                    // file exists error
                    $this->handleGeneralError('file {$file} already exists',array('file' => $new_file));
                    return false;
                }

                if (General::uploadFile($dest, $new_file, $file['tmp_name'])) {
                    $results[] = array(
                        'file' => 'ok',
                        'name' => $new_file,
                        'src' => $this->getHttpPath($dest . $new_file)
                    );
                } else {
                    $this->handleGeneralError('Cannot upload {$file}',array('file' => $new_file));
                    return false;
                }
            }

            $this->success($results);
        }
    }

    /**
     * success
     *
     * @param mixed $data
     * @access public
     * @return void
     */
    public function success($data)
    {
        $this->_Result = $data;
    }

    /**
     * getHttpPath
     * returns the http path of a file or directory
     *
     * @param mixed $path the relative file or directory
     * @access public
     * @return string
     */
    public function getHttpPath($path)
    {
        return URL . '/workspace' . $path;
    }
}
