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
        wp_enqueue_style('intranet', get_stylesheet_directory_uri(). '/assets/dist/css/app.min.css', '', filemtime(get_stylesheet_directory() . '/assets/dist/css/app.min.css'));
    }

    /**
     * Enqueue scripts
     * @return void
     */
    public function script()
    {
        wp_register_script('intranet', get_stylesheet_directory_uri(). '/assets/dist/js/app.min.js', '', filemtime(get_stylesheet_directory() . '/assets/dist/js/app.min.js'), true);
        wp_localize_script('intranet', 'municipioIntranet', array(
            'user_links_is_empty' => __('You have not added any links yet…', 'municipio-intranet'),
            'subscribe' => __('Subscribe', 'municipio-intranet'),
            'unsubscribe' => __('Unsubscribe', 'municipio-intranet'),
            'themeUrl' => get_stylesheet_directory_uri(),
            'searchAutocomplete' => array(
                'persons' => __('Persons', 'municipio-intranet'),
                'content' => __('Content', 'municipio-intranet'),
                'viewAll' => __('View all results', 'municipio-intranet')
            )
        ));

        wp_enqueue_script('intranet');
    }

    /**
     * Enqueue assets for admin
     * @return void
     */
    public function adminEnqueue()
    {
        wp_enqueue_style('intranet-admin', get_stylesheet_directory_uri(). '/assets/dist/css/admin.min.css', '', filemtime(get_stylesheet_directory() . '/assets/dist/css/admin.min.css'));
        wp_enqueue_script('intranet-admin', get_stylesheet_directory_uri(). '/assets/dist/js/admin.min.js', '', filemtime(get_stylesheet_directory() . '/assets/dist/js/admin.min.js'));
    }
}
