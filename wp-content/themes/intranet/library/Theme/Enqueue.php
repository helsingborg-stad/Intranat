<?php

namespace Intranet\Theme;

class Enqueue
{
    public function __construct()
    {
        // Enqueue scripts and styles
        add_action('wp_enqueue_scripts', array($this, 'style'), 11);
        add_action('wp_enqueue_scripts', array($this, 'script'), 11);

        // Enqueue admin
        add_action('admin_enqueue_scripts', array($this, 'adminEnqueue'));
    }

    /**
     * Enqueue styles
     * @return void
     */
    public function style()
    {
        wp_enqueue_style('intranet', get_stylesheet_directory_uri(). '/assets/dist/' . \Municipio\Helper\CacheBust::name('css/app.css', true, true));

        if (is_search()) {
            wp_enqueue_script('algolia-instantsearch');
        }
    }

    /**
     * Enqueue scripts
     * @return void
     */
    public function script()
    {

        if(self::isSearchPage()) {
            wp_enqueue_script('wp-util');
        }

        wp_register_script('intranet', get_stylesheet_directory_uri(). '/assets/dist/' . \Municipio\Helper\CacheBust::name('js/app.js', true, true));

        wp_localize_script('intranet', 'municipioIntranet', array(
            'wpapi' => array(
                'url' => esc_url_raw(rest_url()),
                'nonce' => wp_create_nonce('wp_rest')
            ),
            'is_user_logged_in'   => is_user_logged_in(),
            'user' => array(
                'full_name' => municipio_intranet_get_user_full_name(),
                'greet' => \Intranet\User\General::greet()
            ),
            'user_links_is_empty' => __('You have not added any links yet…', 'municipio-intranet'),
            'subscribe' => __('Follow', 'municipio-intranet'),
            'unsubscribe' => __('Unfollow', 'municipio-intranet'),
            'themeUrl' => get_stylesheet_directory_uri(),
            'searchAutocomplete' => array(
                'persons' => __('Persons', 'municipio-intranet'),
                'content' => __('Content', 'municipio-intranet'),
                'viewAll' => __('View all results', 'municipio-intranet')
            ),
            'edit' => __('Edit', 'municipio-intranet'),
            'done' => __('Done', 'municipio-intranet'),
            'no_more_news' => __('No more news to load', 'municipio-intranet'),
            'disable_welcome_phrase' => __('Disable welcome phrase', 'municipio-intranet'),
            'enable_welcome_phrase' => __('Enable welcome phrase', 'municipio-intranet'),
            'something_went_wrong' => __('Something went wrong, please try again later', 'municipio-intranet'),
            'delete_confirm' => __('Are you sure you want to delete this post?', 'municipio-intranet'),
            'join_forum' => __('Join forum', 'municipio-intranet'),
            'leave_forum' => __('Leave forum', 'municipio-intranet')
        ));

        wp_enqueue_script('intranet');
    }

    /**
     * Enqueue assets for admin
     * @return void
     */
    public function adminEnqueue()
    {
        wp_enqueue_style('intranet-admin', get_stylesheet_directory_uri(). '/assets/dist/' . \Municipio\Helper\CacheBust::name('css/admin.css', true, true));
        wp_enqueue_script('intranet-admin', get_stylesheet_directory_uri(). '/assets/dist/' . \Municipio\Helper\CacheBust::name('js/admin.js', true, true));
    }

    /**
     * Check if search page is active page
     *
     * @return boolean
     */
    private static function isSearchPage() {

        if (is_multisite() && (defined('SUBDOMAIN_INSTALL') && SUBDOMAIN_INSTALL === false)) {
            if (trim(strtok($_SERVER["REQUEST_URI"], '?'), "/") == trim(get_blog_details()->path, "/") && is_search()) {
                return true;
            }
        }

        if (trim(strtok($_SERVER["REQUEST_URI"], '?'), "/") == "" && is_search()) {
            return true;
        }
        
        return false;
    }
}
