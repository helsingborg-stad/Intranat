<?php

/*
Plugin Name: User Shortcodes
Description: Creates shortcodes [intranet_user_email], [intranet_user_firstname] and [intranet_user_lastname]
Version:     1.0
Author:      Sebastian Thulin
*/

namespace CreateUserShortcodes;

class CreateUserShortcodes
{
    public function __construct()
    {
      add_shortcode('intranet_user_email',array($this, 'registerUserEmail'));
      add_shortcode('intranet_user_firstname',array($this, 'registerUserFirstName'));
      add_shortcode('intranet_user_lastname',array($this, 'registerUserLastName'));
    }

    public function registerUserEmail()
    {
      return $this->getCurrentUserData('user_email');
    }

    public function registerUserFirstName()
    {
      return $this->getCurrentUserData('user_firstname');
    }

    public function registerUserLastName()
    {
      return $this->getCurrentUserData('user_lastname');
    }

    private function getCurrentUserData($target) {

      if(!is_user_logged_in()) {
        return ""; 
      }

      $currentUser = wp_get_current_user(); 

      //Get current user 
      if(isset($currentUser->{$target})) {
        return $currentUser->{$target}; 
      }

      return ""; 
    }
}

new \CreateUserShortcodes\CreateUserShortcodes();
