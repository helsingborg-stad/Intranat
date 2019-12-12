<?php

/*
Plugin Name: Summera support
Description: Creates shortcodes [summera_support]
Version:     1.0
Author:      Sebastian Thulin
*/

namespace CreateSummeraSupportShortcode;

class CreateSummeraSupportShortcode
{
    public function __construct()
    {
      add_shortcode('summera_support',array($this, 'renderIframeCode'));
    }

    public function getUserEmail()
    {
      return $this->getCurrentUserData('user_email');
    }

    public function getUserFirstName()
    {
      return $this->getCurrentUserData('user_firstname');
    }

    public function getUserLastName()
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

    public function renderIframeCode() {

      $baseUrl = '//helsingborg.summera.support/forms/custom_form.aspx?'; 

      $urlParts = array(
        'key' => 'newticket_ext_it_zgroxxmgbkqlylpuipemkloq',
        'name' => $this->getUserFirstName() . ' ' . $this->getUserLastName(),
        'email' => $this->getUserEmail()
      ); 

      return '<iframe src="' . $url . http_build_query($urlParts) . '" frameborder="0" style="width: 100%; height: 800px;"></iframe>';
    }
}

new \CreateSummeraSupportShortcode\CreateSummeraSupportShortcode();
