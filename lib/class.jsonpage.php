<?php

/**
 *
 * @package Lib
 * @author thomas appel <mail@thomas-appel.com>

 * Displays <a href="http://opensource.org/licenses/gpl-3.0.html">GNU Public License</a>
 * @license http://opensource.org/licenses/gpl-3.0.html GNU Public License
 */


require_once(TOOLKIT . '/class.page.php');


/**
 * JSONPage
 * general purpus pagecreation class that puts out its contents as json
 * @uses toolkit.AjaxPage
 */
class JSONPage extends AjaxPage
{

    public function __construct()
    {

        //$this->_Parent = $parent;
        $this->_Result = array();

        $this->addHeaderToPage('Content-Type', 'application/json');
        $this->_status = self::HTTP_STATUS_OK;
        //Administration::instance()->Profiler->sample('Page template created', PROFILE_LAP);
    }

    public function addResult($key, $value)
    {
        $this->_Result[$key] = $value;
    }

    /**
     * This function is called when a user is not authenticated to the Symphony
     * backend. It sets the status of this page to `STATUS_UNAUTHORISED` and
     * appends a message for generation
     */
    public function handleFailedAuthorisation()
    {
        $this->_status = self::HTTP_STATUS_UNAUTHORIZED;

        $this->addResult('HTTP_STATUS_UNAUTHORIZED', array(
            'message' => __('You are not authorised to access this page.'),
            'context' => array()
        ));
        return false;
    }
    /**
     * handleGeneralError
     *
     * @param mixed $error
     * @access public
     * @return void
     */
    public function handleGeneralError($message, Array $context)
    {
        $this->_status = self::HTTP_STATUS_ERROR;
        $this->addResult('HTTP_STATUS_ERROR', array(
            'message' => $message,
            'context' => $context
        ));
        unset($this->_Result['success']);
        return false;
    }

    public function handleSuccess($message, Array $context)
    {
        $this->_status = self::HTTP_STATUS_OK;

        $this->addResult('success', array(
            'message' => $message,
            'context' => $context
        ));
        unset($this->_Result['HTTP_STATUS_ERROR']);
        unset($this->_Result['HTTP_STATUS_UNAUTHORIZED']);
        return true;
    }

    /**
     * Calls the view function of this page. If a context is passed, it is
     * also set.
     *
     * @see view()
     * @param array $context
     *  The context of the page as an array. Defaults to null
     */
    public function build($context = null)
    {
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
    public function generate()
    {
        if (isset(self::$HTTP_STATUSES)) {
            $status_message = self::$HTTP_STATUSES[$this->_status];
        } else {
            $status_message = 'undefiend';
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
    public function view($override=false)
    {
        if (!$override) {
            $this->_Result = preg_replace('/\r+/mi', '',json_encode($this->_Result));
        }
        return $this->_Result;
    }

}
