<?php

/*
Plugin Name: StyleguideLocker
Description: StyleguideLocker
Version:     1.0
Author:      Nikolas Ramstedt, Helsingborg Stad
*/

namespace StyleguideLocker;

class StyleguideLocker
{
    public function __construct()
    {
        $this->lockStyleguide('1.7.0');
    }

    public function lockStyleguide($version)
    {
        if (defined('STYLEGUIDE_VERSION') || !apply_filters('StyleguideLocker', true)) {
            return;
        }

        define('STYLEGUIDE_VERSION', $version);
    }
}
new StyleguideLocker();
