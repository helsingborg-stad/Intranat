<?php
/**
 * Plugin Name: SQL Query Logger
 * Description: Logging Back end Queries
 * Author:      Johan Silvergrund
 * Version:     1.0
 */

namespace LogQueries;

class LogQueries
{
    /**
     * Init
     * @param string 'admin_init'
     * @param string 'hbgstad__logSql'
     */
    public function __construct()
    {
        define('SAVEQUERIES', true);


        //add_action('shutdown', array($this, 'logToFile'), 999);
        //add_action( 'pre_get_posts', array($this,'showPost') );
        //add_action('shutdown', array($this, 'var_error_log'));
        //add_action('save_post', array($this, 'addingGETPAramToRedirect'));
    }

    /**
     * Log Sql queries in back end
     * @return void
     */
    public function logToFile()
    {


        if (!is_admin()) {
            return;
        }

        global $wpdb;

        $countLogItems = 0;

        foreach ($wpdb->queries as $query) {
            //if (substr_count($query[0], "intranat_posts") > 0 || substr_count($query[0], "intranat_3_post") > 0) {

            error_log($countLogItems . " --------=------- " . date("Y-m-d H:i:s",
                    strtotime('+2 hours')) . ", lock:  " . query[1] . ",  --------=------- \n\nQuery: " . $query[0] . "" . "\n\nFiles/Functions: " . $query[2] . "\n\n\n",
                3, $_SERVER['DOCUMENT_ROOT'] . "/post-queries.log"
            );

            $countLogItems++;
            //}
        }
    }


    function var_error_log()
    {
        // end capture
        error_log(print_r($_POST, true), 3,
            $_SERVER['DOCUMENT_ROOT'] . "/post-queries.log");        // log contents of the result of var_dump( $object )
    }

    public function showPost()
    {
        var_dump($_POST);
        exit;
    }


    function addingGETPAramToRedirect($message)
    {

        error_log($message, 3, $_SERVER['DOCUMENT_ROOT'] . "/post-queries.log");

    }



}

new \LogQueries\LogQueries();




