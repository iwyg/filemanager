<?php 

	Class Dir
	{
		public function __construct(&$context)
		{
			return new DirectoryIterator($context);
		}
	}
?>
