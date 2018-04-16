<?php

add_filter('site_option_active_sitewide_plugins', 'modify_sitewide_plugins');

function modify_sitewide_plugins($value) {

    if(is_admin()) {
        return false;
    }

    global $current_user;
    if(!$current_user) {
        return;
    }

    if (in_array($current_user->data->user_login, array("seno1000"))) {
        unset($value['elasticpress/elasticpress.php']);
        $value['algolia-frontend/algolia-frontend'] = time();
    }

    return $value;
}
