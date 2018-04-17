<?php

global $allowedUsers;
$allowedUsers  = array("seno1000", "hewi1000", "nira1000", "logr1002","joha1032", "visa1002", "mape1002", "bjwe1002", "kast1012");

add_filter('site_option_active_sitewide_plugins', 'modify_sitewide_plugins');

function modify_sitewide_plugins($value) {


    if(is_admin()) {
        return $value;
    }

global $allowedUsers;
    global $current_user;

    if(isset($_COOKIE) && is_array($_COOKIE)) {
        foreach($_COOKIE as $key => $item) {
            if(preg_match("/wordpress_logged_in/i", $key)) {
                $uname = explode("|", $item);
                if(isset($uname[0])) {
                    $uname = $uname[0];
                    break;
                }
            }
        }
    }

    if (in_array($uname, $allowedUsers)) {
        $value['algolia-frontend/algolia-frontend.php'] = time();
        unset($value['elasticpress/elasticpress.php']);
    }

    return $value;
}

add_filter('option_options_use_algolia_search', function($a) {

    if(is_admin()) {
        return $a;
    }

global $allowedUsers;
     if(isset($_COOKIE) && is_array($_COOKIE)) {
        foreach($_COOKIE as $key => $item) {
            if(preg_match("/wordpress_logged_in/i", $key)) {
                $uname = explode("|", $item);
                if(isset($uname[0])) {
                    $uname = $uname[0];
                    break;
                }
            }
        }
    }

    if (in_array($uname, $allowedUsers)) {
        return 1;
    }

    return $a;
} );
