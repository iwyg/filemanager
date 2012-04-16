<?php

	/**
	 * @package lib
	 * @author thomas appel <mail@thomas-appel.com>

	 * Displays <a href="http://opensource.org/licenses/gpl-3.0.html">GNU Public License</a>
	 * @license http://opensource.org/licenses/gpl-3.0.html GNU Public License
	 */ 


	require_once(TOOLKIT . '/class.page.php');

	define('FILEMANAGER_WORKSPACE', preg_replace('/\//i', DIRECTORY_SEPARATOR , WORKSPACE)); 

	Class JSONPage extends AjaxPage{

		public function __construct(&$parent){

			$this->_Parent = $parent;
			$this->_Result = array();

			$this->addHeaderToPage('Content-Type', 'application/json');
			$this->_status = self::STATUS_OK;
			Administration::instance()->Profiler->sample('Page template created', PROFILE_LAP);
		}

		/**
		 * This function is called when a user is not authenticated to the Symphony
		 * backend. It sets the status of this page to `STATUS_UNAUTHORISED` and
		 * appends a message for generation
		 */
		public function handleFailedAuthorisation()
		{
			$this->_status = self::STATUS_UNAUTHORISED;
			$this->_Result['STATUS_UNAUTHORISED'] = __('You are not authorised to access this page.');
			//$this->_Result->setValue(__('You are not authorised to access this page.'));
		}

		public function handleGeneralError($error)
		{
			$this->_status = self::STATUS_ERROR;
			$this->_Result['STATUS_ERROR'] = $error;
			//$this->_Result['STATUS_UNAUTHORISED'] = __('You are not authorised to access this page.');
			//$this->_Result->setValue(__('You are not authorised to access this page.'));
		}

		/**
		 * Calls the view function of this page. If a context is passed, it is
		 * also set.
		 *
		 * @see view()
		 * @param array $context
		 *  The context of the page as an array. Defaults to null
		 */
		public function build($context = null){
			if($context) $this->_context = $context;
			return  $this->view();
		}

		/**
		 * The generate functions outputs the correct headers for
		 * this AJAXPage, adds `$this->_status` code to the root attribute
		 * before calling the parent generate function and generating
		 * the `$this->_Result` XMLElement
		 *
		 * @return string
		 */
		public function generate(){

			switch($this->_status){

				case self::STATUS_OK:
					$status_message = '200 OK';
					break;

				case self::STATUS_BAD:
				case self::STATUS_ERROR:
					$status_message = '400 Bad Request';
					break;

				case self::STATUS_UNAUTHORISED:
					$status_message = '401 Unauthorized';
					break;

			}

			if ($this->_iframe_transport) {
				$this->addHeaderToPage('Content-Type', 'text/html');
				$this->_Result = '<textarea type="application/json">' . $this-> _Result . '</textarea>';
			}
			$this->addHeaderToPage('HTTP/1.0 ' . $status_message);
			$this->__renderHeaders();
			return $this->_Result;

		}

		/**
		 * All classes that extend the AJAXPage class must define a view method
		 * which contains the logic for the content of this page. The resulting HTML
		 * is append to `$this->_Result` where it is generated on build
		 *
		 * @see build()
		 */
		function view($override=false) 
		{
			//$this->_Result = preg_replace("/(^[\r\n]*|[\r\n]+)[\s\t]*[\r\n\']+/", "",json_encode($this->_Result));
			if (!$override) {
				$this->_Result = preg_replace('/\r+/mi', '',json_encode($this->_Result));
			}
			return $this->_Result;
		}

	}
