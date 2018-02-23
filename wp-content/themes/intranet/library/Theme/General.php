<?php

namespace Intranet\Theme;

class General
{

    public static $siteOptions;

    public function __construct()
    {

        //Adds the post tags to pages
        add_action('init', function () {
            register_taxonomy_for_object_type('post_tag', 'page');
        });

        //Show authors as page manager
        add_filter('Municipio/author_display/title', function ($title) {
            return __('Page manager', 'municipio-intranet');
        });

        //Link authors if logged in
        add_filter('Municipio/author_display/name', function ($name, $userId) {
            if (!is_user_logged_in()) {
                return $name;
            }
            return '<a href="' . municipio_intranet_get_user_profile_url($userId) . '">' . $name . '</a>';
        }, 10, 2);

        //Ignore settings for color scheme
        add_filter('Municipio/theme/key', array($this, 'colorScheme'));

        // Get additional site options
        add_filter('the_sites', array($this, 'getSiteOptions'));

        //Get favicons from main site
        add_filter('Municipio/favicons', array($this, 'favicons'));

        //Fake intranat templates to be core templates.
        add_filter('Modularity/CoreTemplatesSearchTemplates', function ($templates) {
            return array_merge($templates, array(
                'author-edit',
                'table-of-contents'
            ));
        });

        //Removes slider area, this is not avabile in theme views
        add_action('widgets_init', function () {
            unregister_sidebar('slider-area');
        }, 15);

        //Load readspeaker settings from main
        add_filter('ReadSpeakerHelper\multisite_load', '__return_true');

        //Load google UA from main site
        add_filter('GoogleAnalytics/TrackingId/ua', array($this, 'googleAnalyticsUA'));

        //Reser main grid
        add_filter('Municipio/Page/MainGrid/Classes', function ($classes) {
            return array();
        });

        //Elasticpress analyzer
        add_filter('ep_analyzer_language', function () {
            return 'Swedish';
        });

        // Force hide share buttons
        add_filter('acf/load_value/name=page_show_share', function ($value) {
            return false;
        });

        // Activate notification for given post types
        add_filter('notification_center/activated_posttypes', function ($postTypes) {
            return array('ticket');
        });
    }

    public function googleAnalyticsUA($ua)
    {
        if (!is_main_site() && (!$ua || empty($ua))) {
            return get_blog_option(SITE_ID_CURRENT_SITE, 'options_google_analytics_ua');
        }

        return $ua;
    }

    public function favicons($icons)
    {
        if (function_exists('switch_to_blog') && function_exists('restore_current_blog')) {
            switch_to_blog(BLOG_ID_CURRENT_SITE);
        }

        $icons = get_field('favicons', 'option');

        if (function_exists('switch_to_blog') && function_exists('restore_current_blog')) {
            restore_current_blog();
        }

        return $icons;
    }

    public static function emptySiteOptionsCache()
    {
        wp_cache_delete('intranet-site-options');
    }

    /**
     * Get additional options for sites on get_sites()
     * @param  array $sites Sites
     * @return array        Sites
     */
    public function getSiteOptions($sites)
    {
        if (isset(debug_backtrace()[5]) && strpos(debug_backtrace()[5]['file'], 'user.php') > -1) {
            return $sites;
        }

        if (!is_null(self::$siteOptions)) {
            return self::$siteOptions;
        } elseif ($cached_sites = wp_cache_get('intranet-site-options')) {
            $sites = $cached_sites;
        } else {
            foreach ($sites as $key => $site) {
                //Do not switch inside get_blog_option!
                switch_to_blog($site->blog_id);

                $site->name = get_blog_option($site->blog_id, 'blogname');
                $site->description = get_blog_option($site->blog_id, 'blogdescription');
                $site->short_name = get_blog_option($site->blog_id, 'intranet_short_name');
                $site->is_forced = get_blog_option($site->blog_id, 'intranet_force_subscription') === 'true';
                $site->is_hidden = (boolean) get_blog_option($site->blog_id, 'intranet_site_hidden');
                $site->is_administration_unit = get_blog_option($site->blog_id, 'intranet_administration_unit_network') === 'true';
                $site->subscribed = false;
                $site->autosubscribe_tags = get_blog_option($site->blog_id, 'intranet_ad_autosubscribe');

                restore_current_blog();
            }

            wp_cache_set('intranet-site-options', $sites, '', 600);
        }

        $subscriptions = (array) \Intranet\User\Subscription::getSubscriptions(null, true);

        foreach ($sites as $key => $site) {
            if ($site->is_forced || in_array($site->blog_id, $subscriptions)) {
                $site->subscribed = true;
            }

            if ($site->is_hidden) {
                switch_to_blog($site->blog_id);
                if (!current_user_can('administrator') && !current_user_can('editor')) {
                    unset($sites[$key]);
                }
                restore_current_blog();
            }
        }

        self::$siteOptions = $sites;

        return $sites;
    }

    /**
     * Get and set color scheme to use
     * @param  array $classes  Body classes
     * @return array           Modified body classes
     */
    public function colorScheme($key)
    {
        if ((defined('MUNICIPIO_INTRANET_USER_COLOR_THEME') && !MUNICIPIO_INTRANET_USER_COLOR_THEME)) {
            return $key;
        }
        return 'purple';
    }
}
