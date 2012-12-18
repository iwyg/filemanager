<?php
/**
 * @package content
 * @author thomas appel <mail@thomas-appel.com>

 * Displays <a href="http://opensource.org/licenses/gpl-3.0.html">GNU Public License</a>
 * @license http://opensource.org/licenses/gpl-3.0.html GNU Public License
 */

require_once(EXTENSIONS . '/filemanager/content/content.settings.php');

/**
 * contentExtensionFilemanagerEdit
 *
 * @uses contentExtensionFilemanagerSettings
 */
class contentExtensionFilemanagerEdit extends contentExtensionFilemanagerSettings
{

    public function __construct()
    {
        parent::__construct();

        if (isset($_POST['type'])) {
            $this->task($_POST['type']);
        } else {
            return $this->handleGeneralError(array('error' => 'can\'t proceed'));
        }
    }

    /**
     * task
     *
     * @param mixed $type
     * @access public
     * @return void
     */
    protected function task($type)
    {
        switch ($type) {
        case 'move':
            $this->moveItem();
            break;
        case 'delete':
            $this->deleteItem();
            break;
        case 'create':
            $this->createDir();
            break;
        default:
            break;
        }
    }

    /**
     * deleteItem
     *
     * delete a file or a directory from the server
     *
     * @access		protected
     * @return void
     */
    protected function deleteItem()
    {
        $file = General::sanitize(FILEMANAGER_WORKSPACE . $_POST['file']);
        if (!file_exists($file)) {
            $this->handleGeneralError('can\'t delete unknown ' . ($_POST['dataType'] == 'file' ? 'file' : 'directory') . ' ' . $_POST['file'], array());

            return false;
        }
        if ($this->deleteFile($file)) {
            return $this->handleSuccess('successfully deleted {$file}',  array('file' => basename(General::sanitize($_POST['file']))));
        }

    }

    /**
     * moveItem
     * moves a file to a new location
     *
     * @access protected
     * @return void
     */
    protected function moveItem()
    {
        $fn = $_POST['from'];
        $dstfn = General::sanitize(basename(FILEMANAGER_WORKSPACE . $fn));

        $destDir =  WORKSPACE . $_POST['to'] . '/';

        $newDest = $destDir . $dstfn;

        $new_file = FILEMANAGER_WORKSPACE . $fn;
        if ($this->moveFile($destDir, $dstfn, $new_file)) {
            return $this->handleSuccess($_POST['dataType'] == 'file' ? 'file {$item} successfully moved to {$to}' : 'directory {$item} successfully moved {$to}', array(
                'to' => basename($destDir),
                'item' => basename($new_file)
            ));
        }
    }

    //public function process()
    //{
    //	parent::process();
    //}

    /**
     * deleteFile
     * tries to remove a file or directory from the server
     *
     * @param string $file file or directory to be removed
     * @access		protected
     * @return boolean
     */
    protected function deleteFile($file)
    {
        $bn = basename($file);
        if (!is_writable($file)) {
            $this->_handleAccessError(basename($file));

            return false;
        }
        if (is_dir($file)) {

            $parent = dirname($file);

            if ($this->isRoot($file)) {
                return $this->_handleRootDirError($file);
            }

            // check if we can operate on the parent directory
            if (!is_writable($parent)) {
                $this->_handleAccessError(basename($parent));

                return false;
            }

            if ($this->_rrmdir($file) !== false) {
                return true;
            } else {
                $this->handleGeneralError('can\'t delete directory {$file}', array('file' => basename($file)));
            }
        }

        if (is_file($file)) {
            if (unlink($file)) {
                return true;
            } else {
                return $this->handleGeneralError('can\'t delete file {$file}', array('file' => basename($file)));

            }
        }

        return false;
    }

    /**
     * moveFile
     *
     * @param mixed $dest_path
     * @param mixed $dest_file
     * @param mixed $source_file
     * @access		protected
     * @return void
     */
    protected function moveFile($dest_path, $dest_file, $source_file)
    {
        $new_file = $dest_path . $dest_file;

        $bn = basename($dest_path);

        if (is_dir($source_file)) {
            $has_root_dir = $this->scanForRootDirs($source_file);
            if (is_array($has_root_dir) && sizeof($has_root_dir) > 0) {
                return $this->_handleRootDirError($has_root_dir[0]);
            }
        }

        if (!is_readable($dest_path) || !is_writeable($dest_path)) {
            $this->_handleAccessError($dest_path);

            return false;
        }

        if (!is_dir($dest_path)) {
            return $this->handleGeneralError('Directory {$dir} doesn\'t exist', array('dir' => $bn));
        }

        if (file_exists($new_file)) {
            return $this->handleGeneralError($_POST['dataType'] == 'file' ? 'file {$file} already exists' : 'directory {$file} already exists', array(
                'file' => basename($new_file),
                'path' => $dest_path,

            ));
        }

        try {
            rename($source_file, $new_file);

            return true;

        } catch (Exception $e) {
            return $this->handleGeneralError('can\'t move {$file} to {$location}', array(
                'file' => $source_file,
                'location' => $dest_file,
            ));
        }
    }

    /**
     * createDir
     *
     * attempts to create a new directory within a given path
     *
     * @access		public
     * @return boolean
     */
    protected function createDir()
    {

        $name = $_POST['mkdir'];
        $dest_path = FILEMANAGER_WORKSPACE . $this->sanitizePathFragment($_POST['within']) . DIRECTORY_SEPARATOR;

        if (!is_readable($dest_path) || !is_writeable($dest_path)) {
            return $this->_handleAccessError($dest_path);
        }

        if (is_dir($dest_path . $name) || file_exists($dest_path . $name)) {
            return $this->handleGeneralError('directory {$file} already exists', array('file' => $name, 'path' => $dest_path));
        }

        try {
            mkdir($dest_path . $name);

            return $this->handleSuccess('Directory {$dir} successfully created in {$path}', array(
                    'dir' => $name,
                    'path' => substr($dest_path, strlen(FILEMANAGER_WORKSPACE . DIRECTORY_SEPARATOR)),
                    'destination' => $dest_path . $name,
                    'destination_path' => $dest_path,
                    'oo_within' => $_POST['within'],
                    'within' => $this->sanitizePathFragment($_POST['within'])
                )
            );
        } catch (Exception $e) {
            return $this->handleGeneralError('Failed creating Directory {$dir} in {$path}', array(
                    'dir' => $name,
                    'path' => substr($dest_path, strlen(FILEMANAGER_WORKSPACE . DIRECTORY_SEPARATOR)),
                    'destination' => $dest_path . $name,
                    'destination_path' => $dest_path
                )
            );
        }

        return false;
    }

    /**
     * _handleRootDirError
     *
     * @param string $dir diretory path
     * @access		private
     * @return boolean false
     */
    private function _handleRootDirError($dir)
    {
        $bn = basename($dir);

        return $this->handleGeneralError('can\'t delete or move {$dir}. {$dir2} is used by another field', array('dir' => $bn, 'dir2' => $bn));
    }

    /**
     * _handleAccessError
     *
     * creates an error object
     *
     * @param string $dir diretory path
     * @access		private
     * @return void
     */
    private function _handleAccessError($dir)
    {
        return $this->handleGeneralError('Cannot access {$file}', array('file' => basename($dir)));
    }

    /**
     * converts a Exception into a message object
     * @deprecated
     */
    private function _catchedExceptionHanlder(&$exception)
    {
        return $this->handleGeneralError($exception->getMessage, array('trace' => $exception->getTrace()));
    }

    /**
     * listDirs
     *
     * scans for all directories and subdirecories within the given path
     *
     * @param string $dir  the diretory path
     * @param array  $dirs array containing found directories; gets populated on recursive use
     * @static
     * @access		public
     * @return array_ the found directories
     */
    public static function listDirs($dir, &$dirs = array())
    {
        if (is_dir($dir)) {
            $dirs[] = $dir;
            $objects = scandir($dir);
            foreach ($objects as $object) {
                if ($object != '.' && $object != '..') {
                    if (is_dir($dir . DIRECTORY_SEPARATOR . $object)) {
                        self::listDirs($dir . DIRECTORY_SEPARATOR . $object, $dirs);
                    }
                }
            }
            reset($objects);
        }

        return $dirs;
    }

    /**
     * scanForRootDirs
     *
     * Determine if directory that should be deleted or moved is used as a root
     * directory on some other filemanager field
     *
     * @param string $dir
     * @access		public
     * @return void or array if any root directories were  found
     */
    public function scanForRootDirs($dir)
    {
        if (is_dir($dir)) {
            $dirs = self::listDirs($dir);
            $failed = array();
            foreach ($dirs as $d) {
                if ($this->isRoot($d)) {
                    $failed[] = $d;
                    break;
                }
            }

            return $failed;
        }
    }

    /**
     * _rrmdir
     * recursiv directory deletion
     *
     * @param mixed $dir
     * @access private
     * @see : http://www.php.net/manual/de/function.rmdir.php#107233
     * @return void
     */
    private function _rrmdir($dir)
    {
        if (is_dir($dir)) {
            if ($this->isRoot($dir)) {
                return false;
            }
            $objects = scandir($dir);
            foreach ($objects as $object) {
                if ($object != "." && $object != "..") {
                    if (filetype($dir."/".$object) == "dir") {
                        if (!$this->_rrmdir($dir."/".$object)) {
                            return false;
                        }
                    } else {
                        unlink($dir."/".$object);
                    }
                }
            }
            reset($objects);

            return rmdir($dir);
        }
    }

}
