<?php
/*
vim: set expandtab tabstop=4 shiftwidth=4 softtabstop=4:
*/

/**
 * This field provides fileaccess to you workspace directories with options
 * to upload new files, create or delete directories, move files and
 * directories.
 * One may select one or more files per entry.
 *
 * PHP version 5.3
 *
 * @package Fields
 * @author thomas appel <mail@thomas-appel.com>
 * Displays <a href="http://opensource.org/licenses/gpl-3.0.html">GNU Public License</a>
 * @license http://opensource.org/licenses/gpl-3.0.html GNU Public License
 *
 */

define('FILEMANAGER_EXCLUDE_DIRS', ',/workspace/events,/workspace/data-sources,/workspace/text-formatters,/workspace/pages,/workspace/utilities,/workspace/translations,/workspace/jit-image-manipulation');
define('FILEMANAGER_WORKSPACE', str_replace(DIRECTORY_SEPARATOR, '/', WORKSPACE));

require_once(TOOLKIT . '/fields/field.upload.php');
require_once(EXTENSIONS . '/filemanager/lib/class.directorytools.php');

class FieldFilemanager extends Field
{


    const MNAME = 'filemanager';
    /**
     * Class Instance counter which gets inrementeted by +1 every time this class is
     * constructed
     */
    protected static $instance = 0;

    /**
     * Filed Instance counter which gets inrementeted by +1 every time a filemanger
     * field is constructed
     */
    protected static $field_instance = 0;

    /**
     * @see toolkit.Field/#__construct()
     */
    public function __construct()
    {
        self::$instance++;
        parent::__construct();

        $this->_name = __('Filemanager');
        $this->_required = true;
        $this->_i = 0;
    }

    /**
     * _setJSRequireFunc
     *
     * create the requirejs bootstrap-func call for a fieldinstance.
     *
     * @param {Integer} $id         field id
     * @param {Integer} $instance   field instance
     * @static
     * @access private
     * @return {String} the js-function string
     */
    private static function _setJSRequireFunc($id, $instance)
    {
        return '(function(define, id, instance) {require(["bootstrap"], function (fn) {fn(id, instance);})}(this.define, ' . $id . ', ' . $instance . '));';
    }

    /**
     * getInstance
     *
     * return the fields instance
     *
     * @access public
     * @return void
     */
    public function getInstance()
    {
        return self::$instance;
    }

    /**
     * @see toolkit.Field/#canFilter()
     */
    public function canFilter()
    {
        return true;
    }

    /**
     * @see toolkit.Field#isSortable()
     */
    public function isSortable()
    {
        return false;
    }

    /**
     * @see toolkit.Field#mustBeUnique()
     */
    public function mustBeUnique()
    {
        return false;
    }

    /**
     * @see toolkit.Field#allowDatasourceOutputGrouping()
     */
    public function allowDatasourceOutputGrouping()
    {
        return true;
    }

    /**
     * @see toolkit.Field##allowDatasourceParamOutput
     */
    public function allowDatasourceParamOutput()
    {
        return true;
    }

    /**
     * @see toolkit.Field##commit
     */
    public function commit()
    {
        if (!parent::commit()) return false;

        $id = $this->get('id');

        if ($id === false) return false;

        $fields = array();

        $fields['field_id']                =  $id;
        $fields['destination']             =  $this->get('destination');
        $fields['display_mode']            =  implode(',', $this->get('display_mode'));
        $fields['exclude_dirs']            =  is_array($this->get('exclude_dirs')) ? implode(',', $this->get('exclude_dirs')) : '';
        $fields['ignore_files']            =  $this->get('ignore_files');
        $fields['limit_files']             =  intval(trim($this->get('limit_files')));
        $fields['allowed_types']           =  $this->get('allowed_types');
        $fields['allow_dir_upload_files']  =  ($this->get('allow_dir_upload_files') ? 1 : 0);
        $fields['allow_sort_selected']     =  ($this->get('allow_sort_selected') ? 1 : 0);
        $fields['allow_file_move']         =  ($this->get('allow_file_move') ? 1 : 0);
        $fields['allow_file_delete']       =  ($this->get('allow_file_delete') ? 1 : 0);
        $fields['allow_dir_move']          =  ($this->get('allow_dir_move') ? 1 : 0);
        $fields['allow_dir_delete']        =  ($this->get('allow_dir_delete') ? 1 : 0);
        $fields['allow_dir_create']        =  ($this->get('allow_dir_create') ? 1 : 0);
        $fields['unique_file_name']        =  ($this->get('unique_file_name') ? 1 : 0);
        $fields['select_uploaded_files']   =  ($this->get('select_uploaded_files') ? 1 : 0);
        $fields['allow_file_search']        =  ($this->get('allow_file_search') ? 1 : 0);

        Symphony::Database()->query("DELETE FROM `tbl_fields_".$this->handle()."` WHERE `field_id` = '$id' LIMIT 1");
        return Symphony::Database()->insert($fields, 'tbl_fields_' . $this->handle());
    }

    /**
     * @see toolkit.Field##displaySettingsPanel()
     */
    public function displaySettingsPanel(&$wrapper, $errors=NULL)
    {
        // Basics:
        parent::displaySettingsPanel($wrapper, $errors);

        $sortorder = $this->get('sortorder');

        // Directory specific settings:

        $fieldset = new XMLElement('fieldset');
        $label = Widget::Label(__('Directory options'));
        $div = new XMLElement('div', NULL, array('class' => 'compact'));

        $fieldset->appendChild($label);

        $div = new XMLElement('div', NULL, array('class' => 'compact'));

        // Destination Folder:

        $ignore = explode(',/workspace/', FILEMANAGER_EXCLUDE_DIRS);

        $del = array_shift($ignore);

        unset($del);

        $directories = General::listDirStructure(WORKSPACE, null, true, DOCROOT, $ignore, true);

        $label =        Widget::Label(__('Root Directory'));
        $label2 =       Widget::Label(__('Allowed MIME types'));
        $label_ignore = Widget::Label(__('Ignore files'));
        $label_limit =  Widget::Label(__('Limit file selection'), null, 'column');


        $options = array();
        $options[] = array('/workspace', false, '/workspace');

        if (!empty($directories) && is_array($directories)) {
            foreach ($directories as $d) {
                $d = '/' . trim($d, '/');
                if (!in_array($d, $ignore)) $options[] = array($d, ($this->get('destination') == $d), $d);
            }
        }

        $label->appendChild(
            Widget::Select('fields['.$this->get('sortorder').'][destination]',
            $options));

        $at_val = strlen(trim($this->get('allowed_types'))) == 0 ?
            Symphony::Configuration()->get('mimetypes', 'filemanager') :
            $this->get('allowed_types');

        $label2->appendChild(
            Widget::Input('fields[' . $sortorder .'][allowed_types]',
            $at_val, 'text'));

        $label_ignore->appendChild(
            Widget::Input('fields[' . $sortorder .'][ignore_files]',
            $this->get('ignore_files'), 'text'));

        $label_limit->appendChild(
            Widget::Input('fields[' . $sortorder .'][limit_files]',
            $this->get('limit_files'), 'text'));

         // Root Folder:

        if (isset($errors['destination'])) {
            $fieldset->appendChild(Widget::wrapFormElementWithError($label, $errors['destination']));
        } else {
            $fieldset->appendChild($label);
        }

        $label = Widget::Label(__('Exclude Directories'));

        $dest = $this->get('destination');
        $excl = explode(',', $this->get('exclude_dirs'));


        $ignoreDirs = explode(',', WORKSPACE . '/' . implode(',' . FILEMANAGER_WORKSPACE . '/' ,$ignore));
        $directories = General::listDirStructure(WORKSPACE . substr($dest, strlen('/workspace')), null, true, DOCROOT, $ignoreDirs);

        $options = array();

        if (is_array($directories) && !empty($directories)) {
            foreach ($directories as $d) {
                $d = '/' . trim($d, '/');
                if (!in_array($d, $ignore)) {
                    $options[] = array($d, (in_array($d, $excl)), $d);
                }
            }
        }

        $label->appendChild(Widget::Select('fields['.$this->get('sortorder').'][exclude_dirs][]', $options, array('multiple' => '')));
        $fieldset->appendChild($label);

        $this->appendCheckbox($div, 'allow_dir_move',   __('Allow moving directories'));
        $this->appendCheckbox($div, 'allow_dir_delete', __('Allow deleting directories'));
        $this->appendCheckbox($div, 'allow_dir_create', __('Allow creating directories'));
        $this->appendCheckbox($div, 'allow_file_search', __('Show filesearch'));

        $fieldset->appendChild($div);
        $wrapper->appendChild($fieldset);

        // File specific settings:

        $allow_upload = intval($this->get('allow_dir_upload_files'), 10) > 0;

        $fieldset = new XMLElement('fieldset');
        $label = Widget::Label(__('File upload') . (!$allow_upload ? ' <br /><small class="help">('. __('save section for further upload options') . ')</small>' : '' ));
        $div = new XMLElement('div', NULL, array('class' => 'compact'));

        $fieldset->appendChild($label);

        $this->appendCheckbox($div, 'allow_dir_upload_files', __('Allow fileupload'));

        // if file upload ist allowed:

        $fieldset->appendChild($div);
        if ($allow_upload) {
            $this->appendCheckbox($div, 'unique_file_name', __('Unique filenames'));
            //$this->appendCheckbox($div, 'select_uploaded_files', __('Add uploaded files to selection'));
            $help = new XMLElement('p', NULL, array('class' => 'help'));
            $help->setValue(__('e.g. <code>text/plain text/html image/jpeg</code>, separated by a whitespace character.<br/> Wildcards: <code>text/*</code> or, to allow all possible types, pass a single <code>*</code> (highly unrecommended).'));
            if (isset($errors['allowed_types'])) $fieldset->appendChild(Widget::wrapFormElementWithError($label2, $errors['allowed_types']));
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
            $help->setValue(__('<code>RegExp:</code> Define which files should be ignored by the directory listing (default: ignores all dot-files <code>^\..*</code>. Separate expressions with a whitespace)'));

            if (isset($errors['ignore'])) $fieldset->appendChild(Widget::wrapFormElementWithError($label_ignore, $errors['ignore']));
            else $fieldset->appendChild($label_ignore);
            $fieldset->appendChild($help);

            $this->appendCheckbox($div, 'allow_file_move', __('Allow moving files'));
            $this->appendCheckbox($div, 'allow_file_delete', __('Allow deleting files'));
            $fieldset->appendChild($div);
            $wrapper->appendChild($fieldset);

            /* ============================================================================================================================== */
            $fieldset = new XMLElement('fieldset');
            $label = Widget::Label(__('Select options'));
            $mode_label = Widget::Label(__('display mode'), null, 'column');
            $div = new XMLElement('div', NULL, array('class' => 'two columns'));
            $div2 = new XMLElement('div', NULL, array('class' => 'compact'));

            $this->appendCheckbox($div2, 'allow_sort_selected', __('Allow re-ordering selected'));


            $selected_display_mode = $this->get('display_mode');
            $display_mode = !is_null($selected_display_mode) ? $selected_display_mode : 'compact';

            $options = array();

            $options[] = array(__('compact'), $display_mode == 'compact', 'compact');
            $options[] = array(__('preview'), $display_mode == 'preview', 'preview');

            $mode_label->appendChild(Widget::Select('fields['.$this->get('sortorder').'][display_mode][]', $options));

            $help = new XMLElement('p', NULL, array('class' => 'help'));
            $help->setValue(__('Display selected files compact or as thumbnail list'));

            $mode_label->appendChild($help);

            $fieldset->appendChild($label);
            $div->appendChild($mode_label);

            /* ignore files input:
             * ============================================================================================================================== */

            $help = new XMLElement('p', NULL, array('class' => 'help'));
            $help->setValue(__('type any valid number (<code>0:</code> no limit, <code>-1:</code> selecting files is deaktivated)'));
            $label_limit->appendChild($help);

            if (isset($errors['limit'])) $div->appendChild(Widget::wrapFormElementWithError($label_limit, $errors['limit']));
            else $div->appendChild($label_limit);

            $fieldset->appendChild($div2);
            $fieldset->appendChild($div);
            $wrapper->appendChild($fieldset);

            /* ============================================================================================================================== */



            /* ============================================================================================================================== */

            $div = new XMLElement('div', NULL, array('class' => 'compact'));
            $this->appendRequiredCheckbox($div);
            $this->appendShowColumnCheckbox($div);
            $wrapper->appendChild($div);
    }

    /**
     * see: toolkit.Field##displayPublishPanel()
     */
    public function displayPublishPanel(&$wrapper, $data=NULL, $flagWithError=NULL, $fieldnamePrefix=NULL, $fieldnamePostfix=NULL, $entry_id=NULL, $fieldnameSuffix=NULL )
    {
        parent::displayPublishPanel($wrapper, $data, $flagWithError, $fieldnamePrefix, $fieldnamePostfix, $entry_id, $fieldnameSuffix);
        $base_name = strtolower(self::MNAME);

        self::$field_instance++;

        $instance = self::$field_instance;

            // container:
        $fieldcontainer = new XMLElement('div', NULL, array(
            'id'    => $base_name . '-' . $instance,
            'class' => 'loading ' . $base_name
        ));

        $fieldset = new XMLElement('div', NULL, array(
            'id'    => $base_name . '-container-' . $instance,
            'class' =>  $base_name . '-container'
        ));

        $label = Widget::Label($this->get('label'));

        if ($this->get('required') != 'yes') $label->appendChild(new XMLElement('i', __('Optional')));

        $fieldcontainer->appendChild($label);
        $fieldcontainer->appendChild($fieldset);

        $div = new XMLElement('div', NULL, array(
            'id'    => $base_name . '-files-select-container-' . $instance,
            'class' => $base_name . '-files-select-container field-container'
        ));
        $l = Widget::Label(__('no files selected'));
        $label = new XMLElement('div', null, array('class' => 'section-head'));
        $label->appendChild($l);
        $field = Widget::Input('fieldname', $this->get('element_name'), 'hidden');
        $ul = new XMLElement('ul', NULL, array('class' => 'select-list'));

        $this->prePopulateSelectField($ul, $data);
        $div->appendChildArray(array($label, $field, $ul));


        $fieldset->appendChild($div);

        if ($this->get('allow_dir_upload_files') > 0) {
            $div = new XMLElement('div', NULL, array(
                'id'    => $base_name . '-fileupload-' . $instance,
                'class' => $base_name . '-upload-field field-container'
            ));
            $fieldset->appendChild($div);
        }

        $l = Widget::Label(__('Filebrowser'));
        $label = new XMLElement('div', null, array('class' => 'section-head'));
        $label->appendChild($l);
        $div = new XMLElement('div', NULL, array(
            'class' => $base_name . '-dir-listing-container'
        ));

        $body = new XMLElement('div', NULL, array(
            'id' => $base_name . '-dir-listing-body-' . $instance,
            'class' => $base_name . '-dir-listing-body'
        ));

        $field = Widget::Input('fields[field_id]', $this->get('field_id'), 'hidden');
        $div->appendChildArray(array($label, $body, $field));


        $fieldset->appendChild($div);

        // will initialize fieldinstance for client script:
        $script = new XMLElement('script', self::_setJSRequireFunc($this->get('id'), $instance));

        $fieldset->appendChild($script);

        if (is_string($flagWithError) && strlen($flagWithError) > 0) {
            $wrapper->appendChild(Widget::wrapFormElementWithError($fieldcontainer, $flagWithError));
        } else {
            $wrapper->appendChild($fieldcontainer);
        }

    }


    /**
     * makeSelectNode
     *
     * create xml output node for the file select field
     *
     * @param {XMLElement}  $parent the wrapper object
     * @param {String}      $path   file path
     * @access private
     * @return void
     */
    private function makeSelectNode(&$parent, $path)
    {

        $li = new XMLElement('li', null, array('class' => 'file-selected'));
        $span = new XMLElement('span', null, array('class' => 'field-holder'));
        $label = new XMLElement('label', basename($path));
        $span->appendChild($label);
        $span->appendChild(Widget::Input('fields[' . $this->get('element_name') . '][file][]', $path,'hidden', array('class' => 'file-selected','readonly' => 'readonly')));
        $span->appendChild(new XMLElement('span', null, array('class' => 'remove-selected')));
        $outer_span = new XMLElement('span', null, array('class' => 'fields'));

        $outer_span->appendChild($span);
        $li->appendChild($outer_span);
        $parent->appendChild($li);
    }

    /**
     * prePopulateSelectField
     *
     * create xml output for selected files
     *
     * @param {XMLElement} $parent the wrapper object
     * @param {Mixed} $data string for a single selected file of array for
     * multiple selections
     *
     * @access public
     * @return void
     */
    public function prePopulateSelectField (&$parent, &$data)
    {
        if (is_array($data['file'])) {

            foreach ($data['file'] as $path) {
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

    /**
     * deletFileFormDB
     *
     * delete a deprecated fileentry form the database.
     *
     * @param {String} $file the relative filepath
     * @access public
     * @return void
     */
    public function deletFileFormDB($file)
    {
        return Symphony::Database()->query("DELETE FROM `tbl_entries_data_" . $this->get('id') . "` WHERE `file` = '" . $file . "'");
    }

    /**
     * appendCheckbox
     *
     * appends a checkbox element to a given XMLElement wrapper object.
     *
     * @param {XMLElement} $wrapper the xmlelement the checkbox is appended to
     * @param {String} $fname the fieldname
     * @param {String} $value the labeltext
     * @access public
     * @return void
     */
    public function appendCheckbox(XMLElement &$wrapper, $fname = NULL, $value= NULL)
    {

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

    // see: toolkit.Field##createTable
    public function createTable()
    {
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
     *  @see: toolkit.Field##processRawFieldData
     */
    public function processRawFieldData($data, &$status, $simulate=false, $entry_id=NULL)
    {
        $status = self::__OK__;

        if (!isset($data['file']) || !is_array($data['file'])) {
            return NULL;
        }

        $data['size'] = array();
        $data['mimetype'] = array();
        $data['meta'] = array();

        foreach ($data['file'] as $i => $file) {
            $file = WORKSPACE . preg_replace('/^workspace/', '', $file);

            $data['mimetype'][] = DirectoryTools::getMimeType($file);
            $data['size'][] = filesize($file);
            $data['meta'][] = serialize(fieldUpload::getMetaInfo($file, $data['mimetype'][$i]));
        }

        return $data;
    }

    public function getParameterPoolValue(array $data, $entry_id=NULL)
    {       
        return $data['file'];
    }
    /**
     *  see: toolkit.Field##buildDSRetrievalSQL
     */
    public function buildDSRetrievalSQL($data, &$joins, &$where, $andOperation = false, $limit = NULL)
    {
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

            if (strlen($pattern) == 0) return false;

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


        }

        return true;
    }

    /**
     * @see: toolkit.Field##appendFormattedElement
     */
    public function appendFormattedElement(&$wrapper, $data)
    {
        // It is possible an array of NULL data will be passed in. Check for this.
        if (!is_array($data) || !isset($data['file']) || is_null($data['file'])) {
            return;
        }

        if (!is_array($data['file'])) {
            $data['file'] = array($data['file']);
            $data['meta'] = array($data['meta']);
            $data['mimetype'] = array($data['mimetype']);
            $data['size'] = array($data['size']);
        }

        $fld = new XMLElement($this->get('element_name'));
        foreach ($data['file'] as $i => $value) {

            if (!is_file(WORKSPACE . $value)) {
                continue;
            }

            $size = General::formatFilesize($data['size'][$i]);
	    $bytes = $data['size'][$i];
            $meta = $data['meta'][$i];
            $mime = $data['mimetype'][$i];

            $item = new XMLElement('item');
            $file = new XMLElement('file');
            $file->setAttributeArray(array(
                'size' => $size,
                'bytes' => $bytes,
                'path' => str_replace(WORKSPACE, NULL, dirname(WORKSPACE . $value)),
                'type' => $mime,
            ));
            $src = new XMLElement('filename', General::sanitize(basename($value)));

            $file->appendChild($src);
            $item->appendChild($file);
            $m = unserialize($meta);

            if (is_array($m) && !empty($m)) {
                $file->appendChild(new XMLElement('meta', NULL, $m));
            }


            $fld->appendChild($item);

        }
        $wrapper->appendChild($fld);

    }
    /**
     * TODO format more verbose output (e.g. list file names)
     * @see: toolkit.Field##prepareTableValue()
     */
    public function prepareTableValue($data, XMLElement $link = null)
    {
        $string = '';

        if (is_array($data)) {
            if (is_array($data['file'])) {
                $files = array();
                foreach ($data['file'] as $file) {
                    if (is_file(WORKSPACE . $file)) {
                        $files[] = $file;
                    } else {
                        $this->deletFileFormDB($file);
                    }
                }
                $string = sizeof($files) . __(' files');
            } elseif (isset($data['file'])) {
                if (is_file(WORKSPACE . $data['file'])) {
                    $string = General::sanitize(basename($data['file']));
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

    /**
     * @see toolkit.Field#groupRecords()
     */
    public function groupRecords($records)
    {
        if (!is_array($records) || empty($records)) return;

        $groups = array($this->get('element_name') => array());

        $field_id = $this->get('id');
        foreach ($records as $r) {
            $data = $r->getData($field_id);
            $entry_id = $data['relation_id'];

            if (!isset($groups[$this->get('element_name')][$entry_id])) {
                $groups[$this->get('element_name')][$entry_id] = array(
                    'attr' => array('id' => $entry_id),
                    'records' => array(), 'groups' => array());
            }

            $groups[$this->get('element_name')][$entry_id]['records'][] = $r;
        }

        return $groups;
    }

    /**
     * @see toolkit.Field#getExampleFormMarkup()
     */
    public function getExampleFormMarkup()
    {
        return Widget::Input('fields['.$this->get('element_name').']', '...', 'hidden');
    }
}
