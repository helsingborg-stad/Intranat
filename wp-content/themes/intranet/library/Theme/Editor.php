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
        add_filter('comment_form_field_comment', array($this, 'tinyMceComments'));
        add_filter('comment_reply_link', array( $this, 'commentReplyLink'));
        add_action('wp_enqueue_scripts', array( $this, 'enqueueScripts'));
        add_filter('tiny_mce_before_init', array($this, 'customizeEditor'), 10, 2);

        // @mention functionality
        add_filter('mce_external_plugins', array($this, 'tinyMcePlugins'));
        add_action('wp_ajax_get_users', array($this, 'getUsersList'));
    }

    /**
     * Customize TinyMce editor settings
     * @param  array $in Defualt editor settings
     * @param  int $id   Editor ID
     * @return array     Modified settings
     */
    public function customizeEditor($mceInit, $id)
    {
        $editors = array('comment', 'emailfield', 'editgroup');
        if (in_array($id, $editors)) {
            // Disable toolbars
            $mceInit['toolbar1'] = '';
            $mceInit['toolbar2'] = '';
            $mceInit['toolbar'] = false;

            if (!defined('WEB_FONT')) {
                return $mceInit;
            }

            // Add styles
            $bgColor = ($id == 'comment') ? '#f4f4f4' : '#fff';
            $style = "body#tinymce.wp-editor { font-family: " . WEB_FONT . ",system,Segoe UI,Tahoma,-apple-system; background-color: " . $bgColor . ";} body#tinymce.wp-editor a { color:#7b075e;}";
            if (isset($mceInit['content_style'])) {
                $mceInit['content_style'] .= ' ' . $style . ' ';
            } else {
                $mceInit['content_style'] = $style . ' ';
            }
        }

        return $mceInit;
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
        wp_enqueue_script('comment-reply', get_stylesheet_directory_uri() . '/assets/dist/' . \Municipio\Helper\CacheBust::name('js/mce-comment-reply.js', true, true), array( 'jquery'));
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
        $editorId = 'comment';
        $content = '';

        // Apply comment content to edit form
        if (defined('DOING_AJAX') && DOING_AJAX && (isset($_POST['action']) && $_POST['action'] == 'get_comment_form')) {
            $commentId = isset($_POST['commentId']) ? (int) $_POST['commentId'] : 0;
            if ($comment = get_comment($commentId)) {
                $editorId = 'comment-edit';
                $content = $comment->comment_content;
            }
        }

        ob_start();
        wp_editor(
                $content,
                $editorId,
                array(
                    'media_buttons'           => false,
                    'textarea_rows'           => '10',
                    'dfw'                     => false,
                    'textarea_name'           => 'comment',
                    'editor_class'            => 'tinymce-editor',
                    'tinymce'                 => array(
                        'statusbar'           => false,
                        'resize'              => true,
                        'wp_autoresize_on'    => true,
                        'plugins'             => 'wordpress',
                    ),
                    'quicktags' => false,
                )
            );

        return ob_get_clean();
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
            $plugins['mention'] = get_stylesheet_directory_uri() . '/assets/dist/' . \Municipio\Helper\CacheBust::name('js/mce-mention.js', true, true);
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
