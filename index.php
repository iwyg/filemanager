<?php

class DirectoryIteratorUtils extends DirectoryIterator 
{
	private function directoryIteratorToArray(DirectoryIterator $it) 
	{
		$result = array();
		foreach ($it as $key => $child) {
			if ($child->isDot()) {
				continue;
			}
			$name = $child->getBasename();
			if ($child->isDir()) {
				$subit = new DirectoryIterator($child->getPathname());
				$result[] = array(
					0 => $name,
					1 => $this->directoryIteratorToArray($subit),
				);
				//$result[][] = array($name => $this->directoryIteratorToArray($subit));
				//$result[$name] = $this->directoryIteratorToArray($subit);
			} else {
				$result[] = $this->getFileInfo($child);
			}
		}
		return $result;
	}
	public function getFileInfo($file, $name = null) 
	{
		$fpath = $file->getPathname();

		$grp = posix_getgrgid($file->getGroup());
		$own = posix_getpwuid($file->getOwner());

		$finfo = finfo_open(FILEINFO_MIME_TYPE); 
		$perm = fileperms($file->getPathname());

		return array(
			'file'		=> $file->getBasename(),
			'path'		=> $fpath,
			'type'		=> finfo_file($finfo, $fpath),
			'suffix'	=> $file->getExtension(),
			'size'		=> $file->getSize(),
			'owner'		=> $own['name'],
			'group'		=> $grp['name'],
			'lastmod'	=> $file->getMTime(),
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
		if ($root) {
			return array($this->current()->getPath() => $res);	
		}
		return $res;	
	}
}
preg_match('/[^\/]*\..*$/i','/Users/malcolm/Sites/symdev/workspace/uploads/images/Subdir_1_c/Subdir_2b_a/sub_file_2a_a.jpg', $_res);
print_r($_res);
$my = new DirectoryIteratorUtils('dir');
//print_r(json_encode($my->getDirectoryTree(false)));
echo '<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body>';
echo "<script>this.FS = JSON.parse('" . json_encode($my->getDirectoryTree(false)) . "')</script>";
?>

<div id="listcon"></div>
<script>
function isArray(arr) {
return Object.prototype.toString.call(arr) === '[object Array]';
};
function makeList(myFS, list) {
	list = '<ul class="dir">';
	for (var i=0, l = myFS.length;i<l;i++) {
		if (isArray(myFS[i])) {
			list += '<li class="dir-name">' + myFS[i][0];
			if (isArray(myFS[i][1])) {
				makeList(myFS[i][1], list);

				for (var key=0,ll=myFS[i][1].length;key<l;key++) {
					list += '<ul>';
					if (isArray(myFS[i][1][key])) {
						makeList([myFS[i][1][key]], list);
					} else if (myFS[i][1][key] && myFS[i][1][key].file) {
					
						list += '<li>' + myFS[i][1][key].file + '</li>';
					}
					list += '</ul>';
				}
			}
		}
		list += '</li></ul>'
	}
	return list;
}

var lst = makeList(FS);
console.log(lst);
var con = document.getElementById('listcon');
con.innerHTML = lst;

</script>
</body>
</html>
