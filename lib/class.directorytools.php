<?php

/**
 * @package Lib
 * @author thomas appel <mail@thomas-appel.com>

 * Displays <a href="http://opensource.org/licenses/gpl-3.0.html">GNU Public License</a>
 * @license http://opensource.org/licenses/gpl-3.0.html GNU Public License
 */

/**
 * DirectoryTools
 * A Class providing some methods and utilities needed for filemanager
 *
 * @uses DirectoryIterator
 */
class DirectoryTools extends DirectoryIterator
{

    protected $level = 0;

    protected $test;

    /**
     * The Root Directory
     */
    private $_baseDir;

    /**
     * Directory nesting level iterator
     */
    private $_level = 0;

    /**
     * RegExp: files that should be ignored
     */
    private $_ignore;

    /**
     * RegeExp: directories to be excluded
     */
    private $_exclude;

    /**
     * an array of that are used by other fields (speaking: the root-directories of all fields)
     */
    private $_roots;

	public function __construct($context, $ignore = NULL, $exclude = NULL, $roots=NULL, $nesting=NULL)
	{
        parent::__construct($context);

        $this->_baseDir = $context;
        $this->_ignore = $ignore;
        $this->_exclude = $exclude;
        $this->_roots = is_null($roots) ? array() : $roots;
        $this->_level = is_null($nesting) || !$nesting ? 0 : $nesting;
    }

    /**
     * _isRoot
	 *
	 * check if a path is used as root on another field
     * @param {String} $path
     * @access private
     * @return void
     */
    private function _isRoot($path)  {
        return in_array($path, $this->_roots);
    }

    /**
     * Takes a DirectoryIterator and parses its filestructure
     * returns a nested associative array containing directory and file
     * structures
     *
     * @param DirectoryIterator $it
     * @param array $result defaults to null
     * @access public
     * @return array
     */
    private function directoryIteratorToArray(DirectoryIterator $it, $result = null) {
        $result = array();
        $subit;
        foreach ($it as $key => $child) {
            // check if directory is accassible.
            if ($child->isDot() || !$child->isReadable()) {
                continue;
            }
            if ($child->isDir()) {
                if ($this->isExcludedPath($child->getPathname())) {
                    continue;
                }
                $this->_level++;

                $subit = new DirectoryIterator($child->getPathname());
                $nextlvl = $this->directoryIteratorToArray($subit, $this->_ignore);
                $dir = $this->_getDirectoryInfo($child);
                $this->_level--;
                if (isset($nextlvl['subdirs'])) {
                    $dir['directory']['subdirs'] = $nextlvl['subdirs'];
                }
                if (isset($nextlvl['files'])) {
                    $dir['directory']['files'] = $nextlvl['files'];
                }
                $result['subdirs'][] = $dir;
            } elseif ($child->isFile()) {
                if (!is_null($this->_ignore) && preg_match($this->_ignore, $child->getBasename())) {
                    continue;
                } else {
                    $result['files'][] = $this->_getFileInfo($child);
                }
            }
        }
        return $result;
    }

    /**
     * Trims a full filepath an takes the WORKSPACE constant as its base
     *
     * @param	{String}	$path		path to be trimmed
     * @return	{string}
     * @access	public
     */
    public function trimPath($path) {
        $replace_path = WORKSPACE;
        $sub = '';
        return $sub . substr($path, strlen($replace_path));
    }

    /**
     * Check weather a path should be ignored or not
     *
     * @param  {String} $path_name name of the path to be checked
     * @return {Boolean}
     * @access public
     */
    public function isExcludedPath($path_name) {


        $exclude = false;
        if (is_array($this->_exclude)) {
            foreach($this->_exclude as $path) {
                if ($path == $path_name) {
                    $exclude = true;
                    break;
                }
            }
        }
        return $exclude;
    }

    /**
     * Takes a DirectoryIterator item and returns a associative array
     * containing file information such as file name, file size, metatype, filepermission
     * etc.
     *
     * @param {DirectoryIterator} $file
     * @access public
     * @return array
     */
    public function _getFileInfo(DirectoryIterator $file) {
        $fpath = $file->getPathname();
        $path = $this->trimPath($fpath);

        $grp = function_exists('posix_getgrgid') ? posix_getgrgid($file->getGroup()) : array('name' => 'undefined');
        $own = function_exists('posix_getpwuid') ? posix_getpwuid($file->getOwner()) : array('name' => 'undefined');

        //$finfo = finfo_open(FILEINFO_MIME_TYPE);
        $perm = @fileperms($file->getPathname());
        $fbase = $this->getSanitizedBasename($file);

        $fparts = pathinfo($fbase);


        return array(
                'file'		=> $fbase,
                'src'		=> URL . '/workspace' . $path,
                'path'		=> $path,
                'dirname'	=> $this->trimPath(dirname($file->getPathname())),
                'type'		=> DirectoryTools::getMimeType($fpath),
                //'suffix'	=> $file->getExtension(),
                'extension' => strtolower($fparts['extension']),
                'size'		=> $file->getSize(),
                'owner'		=> $own['name'],
                'group'		=> $grp['name'],
                'lastmod'	=> date('Y/m/d h:m:s', $file->getMTime()),
                'inode'		=> $file->getInode(),
                'perms'		=> @substr(@sprintf('%o', fileperms(($fpath))), -4),
                'writable'  => $file->isWritable(),
                'readable'  => $file->isReadable(),
                'moveable'  => is_writable($file->getPath()),
        );
    }

    /**
     * Sets the Directory model attributes
     *
     * @param {DirectoryIterator} $child
     * @param {Boolean} $root
     * @access private
     * @return array
     */
    private function _getDirectoryInfo(DirectoryIterator $child, $root=false) {
        $r_path = !$root ? $this->getSanitizedPathname($child) : $this->_baseDir;
        return array(
            'directory' => array(
                'name'		=>  basename($r_path),
                'path'		=>  !$root ? $this->trimPath($r_path) : $this->trimPath($r_path),
                'level'		=> $this->_level,
                'writable'	=> $child->isWritable(),
                'readable'	=> $child->isReadable(),
                'deletable' => !$this->_isRoot($r_path)
            )
        );
    }

    /**
     * Fetches the whole Directorystructure from a directory define by the
     * Class Constructor
     *
     * @param {Boolean} $root include or ignore the root directory name
     * @return array the directory tree as nested array
     */
    public function getDirectoryTree($root = false) {
        $res = $this->directoryIteratorToArray($this);
        //$this->_level = 0;
        if ($root) {
            $dir = $this->_getDirectoryInfo($this, true);
            /*
            $dir = array();
            $dir['directory'] = array(

                'name' => basename($this->_baseDir),
                'path' => $this->trimPath($this->_baseDir),
                'level' => $this->_level,
            );
             */

            foreach($res as $k => $v) {
                $dir['directory'][$k] = $v;
            }
            //return array($this->current()->getPath() => $res);
            return $dir;
        }
        return $res;
    }

    /**
     * Same as `getDirectoryTree` but returns a json string
     * @see `getDirectoryTree`
     * @deprecated
     * @return string
     */
    public function jsonGetDirectoryTree(Array $args) {
        return json_encode($this->getDirectoryTree($args));
    }

    /**
     * determine the mime-type of a given file
     * Trys to use PECL Extension `finfo_file` first,
     * then trys utilizing deprecated `function_exists`.
     *
     * as last resort it returns 'application/octet-stream'
     *
     * @param {String} $file filepath
     * @return string
     */

    public function getSanitizedPathname(&$file) {
        // fix path normalization on none *nix systems
        return preg_replace('/\\\/i', '/', $file->getPathname());
    }

    public function getSanitizedBasename(&$file) {
        // fix path normalization on none *nix systems
        return preg_replace('/\\\/i', '/', $file->getBasename());
    }

    public static function getMimeType(&$file) {
        if (function_exists('finfo_open')) {
            return finfo_file(finfo_open(FILEINFO_MIME_TYPE), $file);
        }

        if (function_exists('mime_content_type')) {
            return mime_content_type($file);
        }

        return 'application/octet-stream';
        /*
         * this needs some testing first

         if (!$is_win) {
             try {
                 ob_start();
                 $f = escapeshellarg($file);
                 $type = shell_exec("file -b --mime-type " . $f);
                 ob_end_clean();
                 return $type;
    } catch (Exception $e) {

    }
    }
         */
    }

    /**
     * Takes a filename and converts it into a unique one
     *
     * @param		$filename		Stringthe		original file name
     * @return		string
     */
    public static function getUniqueName($filename) {
        $crop  = '30';
        return preg_replace("/([^\/]*)(\.[^\.]+)$/e", "substr('$1', 0, $crop).'-'.uniqid().'$2'", $filename);
    }
}
