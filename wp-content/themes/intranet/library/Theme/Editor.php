<?php

namespace Intranet\Theme;

class Editor
{
    public function __construct()
    {
        if (!is_user_logged_in()) {
            return;
        }

        // Add TinyMCE to comments
        add_filter('comment_form_field_comment', array( $this, 'tinyMceComments'));
        add_filter('comment_reply_link', array( $this, 'commentReplyLink'));
        add_action('wp_enqueue_scripts', array( $this, 'enqueueScripts'));
        add_filter('tiny_mce_before_init', array($this, 'disableTmceToolbar'), 10, 2);

        // @mention functionality
        add_filter('mce_external_plugins', array($this, 'tinyMcePlugins'));
        add_action('wp_ajax_get_users', array($this, 'getUsersList'));
    }

    /**
     * Disable TinyMce toolbar for comments
     * @param  array $in Defualt list with buttons
     * @param  int $id   Editor ID
     * @return array     Modified list with buttons
     */
    public function disableTmceToolbar($in, $id)
    {
        if ($id === 'comment' ||$id === 'emailfield') {
            $in['toolbar1'] = '';
            $in['toolbar2'] = '';
            $in['toolbar'] = false;
        }

        return $in;
    }

    /**
     * Enqueue comment reply script
     * @return void
     */
    public static function enqueueScripts()
    {
        if (!comments_open()) {
            return;
        }

        // Replace comment-reply script to support tinyMCE editor
        wp_deregister_script('comment-reply');
        wp_enqueue_script('comment-reply', get_stylesheet_directory_uri() . '/assets/dist/js/mce-comment-reply.js', array( 'jquery'));
    }

    /**
     * Alter comment reply link
     * @param  string $link Default link
     * @return string       Modified link
     */
    public static function commentReplyLink($link)
    {
        return str_replace('onclick=', 'data-onclick=', $link);
    }

    /**
     * Replace default comment field with TinyMCE
     * @param  string $commentField The content of the comment textarea field
     * @return string               Modified content string
     */
    public function tinyMceComments($commentField)
    {
        ob_start();
        wp_editor(
                '',
                'comment',
                array(
                    'media_buttons'           => false,
                    'textarea_rows'           => '10',
                    'dfw'                     => false,
                    'tinymce'                 => array(
                        'statusbar'           => false,
                        'resize'              => true,
                        'wp_autoresize_on'    => true,
                        'plugins'             => 'wordpress',
                    ),
                    'quicktags' => false,
                )
            );
        $commentField = ob_get_clean();
        return $commentField;
    }

    /**
     * Register TinyMCE plugins
     * @param  array $plugins List of plugins
     * @return array          Modified list of plugins
     */
    public function tinyMcePlugins($plugins)
    {
        global $post;

        if (!empty($post->ID)) {
            $plugins['mention'] = get_stylesheet_directory_uri() . '/assets/dist/js/mce-mention.js';
        }

        return $plugins;
    }

    /**
     * Get list of all users
     */
    public function getUsersList()
    {
        if (!$users = wp_cache_get('tinymce_users')) {
            $userFields = array('ID', 'user_login', 'display_name', 'user_email');
            $usersFound = new \WP_User_Query(array(
                'fields' => $userFields,

            ));
            $users = $usersFound->get_results();

            wp_cache_add('tinymce_users', $users);
        }

        wp_send_json($users);
    }
}
