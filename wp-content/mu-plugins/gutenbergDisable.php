<?php

/*
Plugin Name: Disable Gutenberg
Description: Disables gutenberg plugin for all blogs, not in array.
Version:     1.0
Author:      Sebastian Thulin, Helsingborg Stad
*/

namespace Gutenberg;

class DisableGutenberg
{

    public $useGutenbergOn = array();

    public function __construct()
    {
        add_action('init', array($this, 'disableGutenbergEditor'), 1);
    }

    public function disableGutenbergEditor()
    {
        //Do not remove for gutenberg from this sites
        if (in_array(get_current_blog_id(), $this->useGutenbergOn)) {
            return;
        }

        //Disable for standard posts
        add_filter('use_block_editor_for_post', '__return_false', 10);

        //Disable for CPT's
        add_filter('use_block_editor_for_post_type', '__return_false', 10);
    }
}

new \Gutenberg\DisableGutenberg();
