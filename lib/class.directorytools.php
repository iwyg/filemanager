<?php
Class DirectoryTools extends DirectoryIterator 
{
	private $level = 0;

	public function __construct($context, $ignore = NULL, $exclude = NULL, $nesting = NULL)
	{
		parent::__construct($context);

		$this->_baseDir = $context;
		$this->_ignore = $ignore;
		$this->_exclude = $exclude;
		$this->_level = $nesting == NULL || !$nesting ? 0 : $nesting;
	}

	private function directoryIteratorToArray(DirectoryIterator $it, $result = null) 
	{
		$result = array();
		$subit;
		foreach ($it as $key => $child) {
			if ($child->isDot() || (isset($this->_ignore) ? preg_match($this->_ignore, $child->getBasename()) : false)) {
				continue;
			}
			//$name = $child->getBasename();
			if ($child->isDir()) {
				if ($this->isExcludedPath($child->getPathname())) {
					continue;
				}
				$this->_level++;

				$subit = new DirectoryIterator($child->getPathname());
				$nextlvl = $this->directoryIteratorToArray($subit, $this->_ignore);
				$dir = array(
					'directory' => array(
						'name' => $child->getBasename(),
						'path' => $this->trimPath($child->getPathname()),
						'level' => $this->_level	
					)
					
				);
				$this->_level--;
				if (isset($nextlvl['subdirs'])) {
					$dir['directory']['subdirs'] = $nextlvl['subdirs']; 
				}
				if (isset($nextlvl['files'])) {
					$dir['directory']['files'] = $nextlvl['files']; 
				}
				$result['subdirs'][] = $dir;
			} else {
				$result['files'][] = $this->getFileInfo($child);
			}
		}
		return $result;
	}

	public function trimPath($path)
	{
		$replace_path = WORKSPACE;
		#$sub = 'workspace';
		$sub = '';
		return $sub . substr($path, strlen($replace_path));
	}

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
	 * @public
	 * @param $root {Boolean} include or ignore the root directory name
	 * @return array the directory tree as nested array
	 */ 
	public function getFileInfo($file) 
	{
		$fpath = $file->getPathname();
		$path = $this->trimPath($fpath);

		$grp = posix_getgrgid($file->getGroup());
		$own = posix_getpwuid($file->getOwner());

		//$finfo = finfo_open(FILEINFO_MIME_TYPE); 
		$perm = fileperms($file->getPathname());


		return array(
			'file'		=> $file->getBasename(),
			'src'		=> URL . '/workspace' . $path, 
			'cssclass'	=> preg_replace('/.*[\.*$]/i', 'file file-$1', $file->getBasename()),
			'path'		=> $path,
			'type'		=> DirectoryTools::getMimeType($fpath),
			'suffix'	=> $file->getExtension(),
			'size'		=> $file->getSize(),
			'owner'		=> $own['name'],
			'group'		=> $grp['name'],
			'lastmod'	=> date('Y/m/d h:m:s', $file->getMTime()),
			'inode'		=> $file->getInode(),
			'perms'		=> substr(sprintf('%o', fileperms(($fpath))), -4),
		);
	}

	/**
	 * @public
	 * @param $root {Boolean} include or ignore the root directory name
	 * @return array the directory tree as nested array
	 */ 
	public function getDirectoryTree($root = false) 
	{
		$res = $this->directoryIteratorToArray($this);
		//$this->_level = 0;
		if ($root) {
			$dir = array();
			$dir['directory'] = array(

				'name' => basename($this->_baseDir),
				'path' => $this->trimPath($this->_baseDir),
				'level' => $this->_level,
			);

			foreach($res as $k => $v) {
				$dir['directory'][$k] = $v;
			}
			//return array($this->current()->getPath() => $res);	
			return $dir;
		}
		return $res;	
	}

	public function jsonGetDirectoryTree(Array $args) 
	{
		return json_encode($this->getDirectoryTree($args));
	}
	public static function getMimeType(&$file)
	{
		return finfo_file(finfo_open(FILEINFO_MIME_TYPE), $file);
	}
	public static function getUniqueName($filename) 
	{
		$crop  = '30';
		return preg_replace("/([^\/]*)(\.[^\.]+)$/e", "substr('$1', 0, $crop).'-'.uniqid().'$2'", $filename);
	}
}

?>
