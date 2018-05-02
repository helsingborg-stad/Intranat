<?php

global $allowedUsers;
$allowedUsers  = array("seno1000", "hewi1004", "nira1000", "logr1002","joha1032", "visa1002", "mape1002", "bjwe1002", "kast1012", "toni1001", "veko1001", "josi1004");

add_filter('site_option_active_sitewide_plugins', 'modify_sitewide_plugins');

function modify_sitewide_plugins($value) {

    if(is_admin()) {
        return $value;
    }

    global $allowedUsers;
    global $current_user;

    $uname = "";

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
        unset($value['elasticpress/elasticpress.php']);
    }

    return $value;
}

add_filter('option_options_use_algolia_search', function($a) {

    if(is_admin()) {
        return $a;
    }

    $uname = "";

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
});


//Deactivate algolia plugin search
add_filter('option_algolia_override_native_search', function ($a) {

    if(is_admin()) {
        return $a;
    }

    $uname = "";

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
        return "instantsearch";
    }

    return $a;

});

add_filter('option_algolia_autocomplete_enabled', function($a) {

    if(is_admin()) {
        return $a;
    }

    $uname = "";

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
        return "yes";
    }

    return $a;
});
