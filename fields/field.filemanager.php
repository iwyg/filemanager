<?php 
	require_once(TOOLKIT . '/fields/field.upload.php');
	require_once(EXTENSIONS . '/filemanager/lib/class.directorytools.php');

	define('FILEMANAGER_EXCLUDE_DIRS', ',/workspace/events,/workspace/data-sources,/workspace/text-formatters,/workspace/pages,/workspace/utilities,/workspace/translations');

	Class fieldFilemanager extends Field {

		/**
		 * @see http://symphony-cms.com/learn/api/2.2.5/toolkit/field/#__construct
		 */

		static $i = 0;

		function __construct(&$parent) {
			parent::__construct($parent);
			$this->_name = __('Filemanager');
			$this->_required = true;
			$this->_i = 0;

		}

		/**
		 * @see http://symphony-cms.com/learn/api/2.2.5/toolkit/field/#canFilter
		 */
		function canFilter() {
			return true;	
		}
		/**
		 * @see http://symphony-cms.com/learn/api/2.2.5/toolkit/field/#isSortable
		 */
		public function isSortable() {
			return false;
		}

		/**
		 * @see http://symphony-cms.com/learn/api/2.2.5/toolkit/field/#mustBeUnique
		 */
		public function mustBeUnique() {
			return true;
		}
		/**
		 * @see http://symphony-cms.com/learn/api/2.2.5/toolkit/field/#commit
		 */
		public function commit(){
			if(!parent::commit()) return false;

			$id = $this->get('id');

			if($id === false) return false;

			$fields = array();

			$fields['field_id'] = $id;
			$fields['destination'] = $this->get('destination');
			$fields['exclude_dirs'] = is_array($this->get('exclude_dirs')) ? implode(',', $this->get('exclude_dirs')) : '';
			$fields['ignore_files'] = $this->get('ignore_files');
			$fields['limit_files'] = intval(trim($this->get('limit_files')));
			$fields['allowed_types'] = $this->get('allowed_types');
			$fields['allow_dir_upload_files'] = ($this->get('allow_dir_upload_files') ? 1 : 0);
			$fields['allow_file_move'] = ($this->get('allow_file_move') ? 1 : 0);
			$fields['allow_file_delete'] = ($this->get('allow_file_delete') ? 1 : 0);
			$fields['allow_dir_move'] = ($this->get('allow_dir_move') ? 1 : 0);
			$fields['allow_dir_delete'] = ($this->get('allow_dir_delete') ? 1 : 0);
			$fields['allow_dir_create'] = ($this->get('allow_dir_create') ? 1 : 0);
			$fields['unique_file_name'] = ($this->get('unique_file_name') ? 1 : 0);
			$fields['select_uploaded_files'] = ($this->get('select_uploaded_files') ? 1 : 0);

			Symphony::Database()->query("DELETE FROM `tbl_fields_".$this->handle()."` WHERE `field_id` = '$id' LIMIT 1");
			return Symphony::Database()->insert($fields, 'tbl_fields_' . $this->handle());
		}

		/**
		 * @see http://symphony-cms.com/learn/api/2.2.5/toolkit/field/#allowDatasourceOutputGrouping
		 */
		function allowDatasourceOutputGrouping() {
			return ($this->get('allow_multiple') == 0 ? true : false);
		}

		/**
		 * @see http://symphony-cms.com/learn/api/2.2.5/toolkit/field/#displaySettingsPanel
		 */
		function displaySettingsPanel(&$wrapper, $errors=NULL) {
			// Basics
			parent::displaySettingsPanel($wrapper, $errors);

			$sortorder = $this->get('sortorder');

			/* ============================================================================================================================== 
			 * Directory specific settings
			 * ============================================================================================================================== */

			$fieldset = new XMLElement('fieldset');
			$label = Widget::Label(__('Directory options'));
			$div = new XMLElement('div', NULL, array('class' => 'compact'));
			
			$fieldset->appendChild($label);

			$div = new XMLElement('div', NULL, array('class' => 'compact'));
			/* ============================================================================================================================== */
			## Destination Folder
			$ignore = explode(',/workspace/', FILEMANAGER_EXCLUDE_DIRS);

			$del = array_shift($ignore);

			unset($del);
			
			$directories = General::listDirStructure(WORKSPACE, null, true, DOCROOT, $ignore, true);

			$label = Widget::Label(__('Root Directory'));
			$label2 = Widget::Label(__('Allowed MIME types'));
			$label_ignore = Widget::Label(__('Ignore files'));
			$label_limit = Widget::Label(__('Limit file selection'));


			$options = array();
			$options[] = array('/workspace', false, '/workspace');

			if(!empty($directories) && is_array($directories)){
				foreach($directories as $d) {
					$d = '/' . trim($d, '/');
					if(!in_array($d, $ignore)) $options[] = array($d, ($this->get('destination') == $d), $d);
				}
			}

			$label->appendChild(Widget::Select('fields['.$this->get('sortorder').'][destination]', $options));

			$at_val = strlen(trim($this->get('allowed_types'))) == 0 ? Symphony::Configuration()->get('mimetypes', 'filemanager') : $this->get('allowed_types');
			
			$label2->appendChild(Widget::Input('fields[' . $sortorder .'][allowed_types]', $at_val, 'text'));

			$label_ignore->appendChild(Widget::Input('fields[' . $sortorder .'][ignore_files]', $this->get('ignore_files'), 'text'));
			$label_limit->appendChild(Widget::Input('fields[' . $sortorder .'][limit_files]', $this->get('limit_files'), 'text'));
			
			/* ============================================================================================================================== 
			 * Root Folder 
			 * ============================================================================================================================== */

			if(isset($errors['destination'])) {
				$fieldset->appendChild(Widget::wrapFormElementWithError($label, $errors['destination']));
			}
			else {
				$fieldset->appendChild($label);
			}

			$label = Widget::Label(__('Exclude Directories'));

			$dest = $this->get('destination');
			$excl = explode(',', $this->get('exclude_dirs'));

			$directories = General::listDirStructure(WORKSPACE . substr($dest, strlen('/workspace')), null, true, DOCROOT, $ignore);

			$options = array();

			if(!empty($directories) && is_array($directories)){
				foreach($directories as $d) {
					$d = '/' . trim($d, '/');
					if(!in_array($d, $ignore)) {
						$options[] = array($d, (in_array($d, $excl)), $d);
					}
				}
			}
			$label->appendChild(Widget::Select('fields['.$this->get('sortorder').'][exclude_dirs][]', $options, array('multiple' => '')));
			$fieldset->appendChild($label);

			$this->appendCheckbox($div, 'allow_dir_move', __('Allow moving directories'));
			$this->appendCheckbox($div, 'allow_dir_delete', __('Allow deleting directories'));
			$this->appendCheckbox($div, 'allow_dir_create', __('Allow creating directories'));
			$fieldset->appendChild($div);

			$wrapper->appendChild($fieldset);
			/* ============================================================================================================================== 
			 * File specific settings
			 * ============================================================================================================================== */

			$allow_upload = intval($this->get('allow_dir_upload_files'), 10) > 0;

			$fieldset = new XMLElement('fieldset');
			$label = Widget::Label(__('File upload') . (!$allow_upload ? ' <br /><small class="help">('. __('save section for further upload options') . ')</small>' : '' ));
			$div = new XMLElement('div', NULL, array('class' => 'compact'));

			$fieldset->appendChild($label);

		//	$help->setValue(__('save section for further upload options'));
			$this->appendCheckbox($div, 'allow_dir_upload_files', __('Allow fileupload'));

			/* if file upload ist allowed:
			 * ============================================================================================================================== */

			$fieldset->appendChild($div);
			if ($allow_upload) {
				$this->appendCheckbox($div, 'unique_file_name', __('Unique filenames'));
				//$this->appendCheckbox($div, 'select_uploaded_files', __('Add uploaded files to selection'));
				$help = new XMLElement('p', NULL, array('class' => 'help'));
				$help->setValue(__('e.g. <code>text/plain text/html image/jpeg</code>, separated by a whitespace character.<br/> Wildcards: <code>text/*</code> or, to allow all possible types, pass a single <code>*</code> (highly unrecommended).'));
				if(isset($errors['allowed_types'])) $fieldset->appendChild(Widget::wrapFormElementWithError($label2, $errors['allowed_types']));
				else $fieldset->appendChild($label2);
				$fieldset->appendChild($help);
				// unique file names
			} 
			$wrapper->appendChild($fieldset);
			/* ============================================================================================================================== */
			$fieldset = new XMLElement('fieldset');
			$label = Widget::Label(__('File options'));
			$div = new XMLElement('div', NULL, array('class' => 'compact'));

			$fieldset->appendChild($label);

			/* ignore files input: 
			 * ============================================================================================================================== */

			$help = new XMLElement('p', NULL, array('class' => 'help'));
			$help->setValue(__('RegExp: Define which files should be ignored by the directory listing (default: ignores all dot-files <code>^\..*</code>. Separate expressions with a whitespace)'));

			if(isset($errors['ignore'])) $fieldset->appendChild(Widget::wrapFormElementWithError($label_ignore, $errors['ignore']));
			else $fieldset->appendChild($label_ignore);
			$fieldset->appendChild($help);

			$this->appendCheckbox($div, 'allow_file_move', __('Allow moving files'));
			$this->appendCheckbox($div, 'allow_file_delete', __('Allow deleting files'));
			$fieldset->appendChild($div);
			$wrapper->appendChild($fieldset);

			/* ============================================================================================================================== */
			$fieldset = new XMLElement('fieldset');
			$label = Widget::Label(__('Select options'));
			$div = new XMLElement('div', NULL, array('class' => 'compact'));

			$fieldset->appendChild($label);

			/* ignore files input: 
			 * ============================================================================================================================== */

			$help = new XMLElement('p', NULL, array('class' => 'help'));
			$help->setValue(__('type any valid number'));

			if(isset($errors['limit'])) $fieldset->appendChild(Widget::wrapFormElementWithError($label_limit, $errors['limit']));
			else $fieldset->appendChild($label_limit);
			$fieldset->appendChild($help);

			$wrapper->appendChild($fieldset);

			/* ============================================================================================================================== */



			/* ============================================================================================================================== */

			$div = new XMLElement('div', NULL, array('class' => 'compact'));
			$this->appendRequiredCheckbox($div);
			$this->appendShowColumnCheckbox($div);
			$wrapper->appendChild($div);
		}
		// see: http://symphony-cms.com/learn/api/2.2.5/toolkit/field/#displayPublishPanel
		function displayPublishPanel (&$wrapper, $data=NULL, $flagWithError=NULL, $fieldnamePrefix=NULL, $fieldnamePostfix=NULL, $entry_id=NULL, $fieldnameSuffix=NULL ) 
		{

			parent::displayPublishPanel($wrapper, $data, $flagWithError, $fieldnamePrefix, $fieldnamePostfix, $entry_id, $fieldnameSuffix);
			$base_name = strtolower($this->_name);
			$tr = __('test124');

			/* ============================================================================================================================== 
			 * container 
			 * ============================================================================================================================== */

			$fieldcontainer = new XMLElement('div', NULL, array(
				'id' => $base_name, 
				'class' => $base_name . '-container loading ' . $base_name 
			));
			$fieldset = new XMLElement('div', NULL, array(
				'id' => $base_name . '-container', 
				'class' =>  'field-container ' 
			));

			$fieldcontainer->appendChild(Widget::Label($this->get('label')));

			$fieldcontainer->appendChild($fieldset);



			$div = new XMLElement('div', NULL, array(
				'id' => $base_name . '-files-select-container',
				'class' => $base_name . '-files-select-container field-container'		
			));

			$label = Widget::Label(__('Selected files'));
			$field = Widget::Input('fieldname', $this->get('element_name'), 'hidden');
			$ul = new XMLElement('ul', NULL);

			$this->prePopulateSelectField($ul, $data);
			$div->appendChildArray(array($label, $field, $ul));


			$fieldset->appendChild($div);
			
			if ($this->get('allow_dir_upload_files') > 0) {
				$div = new XMLElement('div', NULL, array(
					'id' => $base_name . '-fileupload',
					'class' => $base_name . '-upload-field field-container'		
				));
				/*
				$fieldset->appendChild($div);
				$div = new XMLElement('div', NULL, array(
					'id' => $base_name . '-droparea',
					'class' => $base_name . '-dropaera-field'		
				));
				$fieldset->appendChild($div);
				$div = new XMLElement('div', NULL, array(
					'id' => $base_name . '-upload-list',
					'class' => $base_name . '-upload-files-list field-container'		
				));
				 */
				$fieldset->appendChild($div);
			}

			$label = Widget::Label(__('Filebrowser'));
			$div = new XMLElement('div', NULL, array(
				'id' => $base_name . '-dir-listing-container',
				'class' => $base_name . '-dir-listing-container field-container'		
			));

			$head = new XMLElement('div', NULL, array(
				'id' => $base_name . '-dir-listing-head',
				'class' => $base_name . '-dir-listing-head'		
			));
			$body = new XMLElement('div', NULL, array(
				'id' => $base_name . '-dir-listing-body',
				'class' => $base_name . '-dir-listing-body'		
			));

			$field = Widget::Input('fields[field_id]', $this->get('field_id'), 'hidden');
			$div->appendChildArray(array($label, $head, $body, $field));

			
			$fieldset->appendChild($div);

			$wrapper->appendChild($fieldcontainer);
		}
		

		/**
		 * @param $parent {XMLElement} the wrapper object
		 * @param $path {String} file path
		 * create xml output node for the file select field	
		 */ 
		private function makeSelectNode(&$parent, $path) {

			$li = new XMLElement('li', null, array('class' => 'file-selected'));
			$span = new XMLElement('span', null, array('class' => 'field-holder')); 
			$label = new XMLElement('label', basename($path));
			$span->appendChild($label);
			$span->appendChild(Widget::Input('fields[' . $this->get('element_name') . '][file][]', $path,'hidden', array('readonly' => 'readonly')));
			$span->appendChild(new XMLElement('span', null, array('class' => 'remove-selected')));
			$outer_span = new XMLElement('span', null, array('class' => 'fields'));

			$outer_span->appendChild($span);
			$li->appendChild($outer_span);
			$parent->appendChild($li);
		}

		/**
		 * @param $parent {XMLElement} the wrapper object
		 * @param $data {Mixed} string for a single selected file of array for 
		 * multiple selections
		 * create xml output for selected files	
		 */ 
		public function prePopulateSelectField (&$parent, &$data) {
			if (is_array($data['file'])) {	

				foreach($data['file'] as $path) {
					if (!is_file(WORKSPACE . $path)) {
						$this->deletFileFormDB($path);
						continue;
					}
					$this->makeSelectNode($parent, $path);
				}
			} else if (isset($data['file'])) {
				if (!is_file(WORKSPACE . $data['file'])) {
					$this->deletFileFormDB($data['file']);
					return false;
				}
				$this->makeSelectNode($parent, $data['file']);
			}
			return true;
		}

		public function deletFileFormDB($file) {
			return Symphony::Database()->query("DELETE FROM `tbl_entries_data_" . $this->get('id') . "` WHERE `file` = '" . $file . "'");
		}		
		/**
		 * 
		 * @param $parent {XMLElement} the wrapper object
		 * @param $fname {XMLElement} the wrapper object
		 * @returns {void}
		 * appends a checkbox element to a given XMLElement wrapper object
		 */
		public function appendCheckbox(XMLElement &$wrapper, $fname = NULL, $value= NULL) {

			$order = $this->get('sortorder');
			$name = "fields[{$order}][{$fname}]";

			$wrapper->appendChild(Widget::Input($name, '0', 'hidden'));

			$label = Widget::Label();
			$input = Widget::Input($name, '1', 'checkbox');

			if (intval($this->get($fname)) > 0) {
				$input->setAttribute('checked', 'checked');
			}

			$label->setValue(__('%s ' . $value, array($input->generate())));
			$wrapper->appendChild($label);
		}
		// see: http://symphony-cms.com/learn/api/2.2.5/toolkit/field/#createTable
		function createTable() {
			return Symphony::Database()->query(
				"CREATE TABLE IF NOT EXISTS `tbl_entries_data_" . $this->get('id') . "` (
				`id` int(11) unsigned NOT NULL auto_increment,
				`entry_id` int(11) unsigned NOT NULL,
				`file` varchar(255) default NULL,
				`size` int(11) unsigned NULL,
				`mimetype` varchar(50) default NULL,
				`meta` varchar(255) default NULL,
				PRIMARY KEY (`id`),
				KEY `entry_id` (`entry_id`),
				KEY `file` (`file`)
				);"
			);
		}

		/**
		 *  @see: http://symphony-cms.com/learn/api/2.2.5/toolkit/field/#processRawFieldData
		 */ 
		function processRawFieldData($data, &$status, $simulate=false, $entry_id=NULL) {
			$status = self::__OK__;

			if (!isset($data['file']) || !is_array($data['file'])) {
				return NULL;
			}

			$data['size'] = array();
			$data['mimetype'] = array();
			$data['meta'] = array();

			foreach($data['file'] as $i => $file) {
				$file = WORKSPACE . preg_replace('/^workspace/', '', $file);

				$data['mimetype'][] = DirectoryTools::getMimeType($file);
				$data['size'][] = filesize($file);
				$data['meta'][] = serialize(fieldUpload::getMetaInfo($file, $data['mimetype'][$i]));
			}

			return $data;
		}
		
		/**
		 *  see: http://symphony-cms.com/learn/api/2.2.5/toolkit/field/#buildDSRetrievalSQL
		 */ 
		public function buildDSRetrievalSQL($data, &$joins, &$where, $andOperation = false) {
			$field_id = $this->get('id');

			if (self::isFilterRegex($data[0])) {
				$this->_key++;

				if (preg_match('/^regexp:/i', $data[0])) {
					$pattern = preg_replace('/^regexp:\s*/i', null, $this->cleanValue($data[0]));
					$regex = 'REGEXP';
				} else {
					$pattern = preg_replace('/^not-?regexp:\s*/i', null, $this->cleanValue($data[0]));
					$regex = 'NOT REGEXP';
				}
				
				if(strlen($pattern) == 0) return;

				$joins .= "
					LEFT JOIN
						`tbl_entries_data_{$field_id}` AS t{$field_id}_{$this->_key}
						ON (e.id = t{$field_id}_{$this->_key}.entry_id)
				";
				$where .= "
					AND (
						t{$field_id}_{$this->_key}.file {$regex} '{$pattern}'
						OR t{$field_id}_{$this->_key}.handle {$regex} '{$pattern}'
					)
				";

			} elseif ($andOperation) {
				foreach ($data as $value) {
					$this->_key++;
					$value = $this->cleanValue($value);
					$joins .= "
						LEFT JOIN
							`tbl_entries_data_{$field_id}` AS t{$field_id}_{$this->_key}
							ON (e.id = t{$field_id}_{$this->_key}.entry_id)
					";
					$where .= "
						AND (
							t{$field_id}_{$this->_key}.file = '{$value}'
							OR t{$field_id}_{$this->_key}.handle = '{$value}'
						)
					";
				}

			} else {
				if (!is_array($data)) $data = array($data);

				foreach ($data as &$value) {
					$value = $this->cleanValue($value);
				}

				$this->_key++;
				$data = implode("', '", $data);
				$joins .= "
					LEFT JOIN
						`tbl_entries_data_{$field_id}` AS t{$field_id}_{$this->_key}
						ON (e.id = t{$field_id}_{$this->_key}.entry_id)
				";
				$where .= "
					AND (
						t{$field_id}_{$this->_key}.file IN ('{$data}')
						OR t{$field_id}_{$this->_key}.handle IN ('{$data}')
					)
				";
			}

			return true;
		}
		/**
		 * @see: http://symphony-cms.com/learn/api/2.2.5/toolkit/field/#appendFormattedElement
		 */
		public function appendFormattedElement(&$wrapper, $data){
			// It is possible an array of NULL data will be passed in. Check for this.
			if(!is_array($data) || !isset($data['file']) || is_null($data['file'])) {
				return;
			}

			if (!is_array($data['file'])) {
				$data['file'] = array($data['file']);
				$data['meta'] = array($data['meta']);
				$data['mimetype'] = array($data['mimetype']);
			}
			
			$fld = new XMLElement($this->get('element_name'));
			foreach($data['file'] as $i => $value) { 

				if (!is_file(WORKSPACE . $value)) {
					continue;
				}

				$size = General::formatFilesize($data['size'][$i]);
				$meta = $data['meta'][$i];
				$mime = $data['mimetype'][$i];

				$item = new XMLElement('item');
				$file = new XMLElement('file');
				$file->setAttributeArray(array(
					'size' => $size,
					'path' => str_replace(WORKSPACE, NULL, dirname(WORKSPACE . $value)),
					'type' => $mime,
				));

				$src = new XMLElement('filename', General::sanitize(basename($value)));
				
				$file->appendChild($src);
				$item->appendChild($file);
				$m = unserialize($meta);

				if(is_array($m) && !empty($m)){
					$file->appendChild(new XMLElement('meta', NULL, $m));
				}


				$fld->appendChild($item);

			}
			$wrapper->appendChild($fld);

		}
		/**
		 * @see: http://symphony-cms.com/learn/api/2.2.5/toolkit/field/#prepareTableValue
		 * TODO: format more verbose output (e.g. list file names)
		 */ 
		public function prepareTableValue($data, XMLElement $link = null) {

			$string = '';	

			if (is_array($data)) {
				if (is_array($data['file'])) {
					$files = array();
					foreach($data['file'] as $file) {
						if (is_file(WORKSPACE . $file)) {
							$files[] = $file;
						} else {
							$this->deletFileFormDB($file);	
						}
					}
					$string = sizeof($files) . __(' files');	
				} elseif (isset($data['file'])) {
					if (is_file(WORKSPACE . $data['file'])) {
						$string =  1 . __(' files');	
					} else {
						$this->deletFileFormDB($data['file']);
						$string =  0 . __(' files');	
					}
				}
			} else {
				$string = 0 . __(' files');
			}

			if ($link) {
				$link->setValue($string);
				return $link;
			}
			return $string;
		}
	}
