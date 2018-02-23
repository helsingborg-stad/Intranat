<?php

namespace Intranet\Theme;

class TableOfContents
{
    public static $commonCacheKey = 'intranet-table-of-contents';

    public function __construct()
    {
        //Template & url
        add_action('admin_init', array($this, 'urlRewrite'));
        add_filter('template_include', array($this, 'template'), 10);

        //Cache
        add_action('update_post_meta', array($this, 'purgeTableOfContent'), 50, 4);
    }

    /**
     * Create new rewrite rule, only for super admins
     * @return void
     */
    public function urlRewrite()
    {
        if (is_super_admin()) {
            add_rewrite_rule('^table-of-contents', 'index.php?table-of-contents&modularity_template=table-of-contents', 'top');
            add_rewrite_tag('%table-of-contents%', '([^&]+)');
            flush_rewrite_rules();
        }
    }

    /**
     * Tell to use view of table of contents when above url is visited.
     * @param  string $template The default templade used by wp.
     * @return string           The new template (or default)
     */
    public function template($template)
    {
        global $wp_query;

        if (!isset($wp_query->query['table-of-contents'])) {
            return $template;
        }

        $template = \Municipio\Helper\Template::locateTemplate('table-of-contents');
        $wp_query->is_home = false;

        return $template;
    }

    /**
     * Get content of table of contents
     * @param  array $sites   Site ids to include
     * @param  string $search Title search
     * @return array          Matching content
     */
    public static function get($sites = null, $search = null)
    {
        $localCacheKey = md5(serialize(array('toc', $sites, $search)));
        $cache = wp_cache_get(self::$commonCacheKey, $localCacheKey);

        if ($cache) {
            return $cache;
        }

        global $wpdb;

        // Get the sites to get table of contents from
        if (is_null($sites)) {
            $sites = \Intranet\Helper\Multisite::getSitesList(true, true);
        } else {
            $sites = (array) $sites;
        }

        // Which post statuses to allow
        $postStatuses = array('publish');
        if (is_user_logged_in()) {
            $postStatuses[] = 'private';
        }

        // Fields to get
        $fields = implode(', ', array(
            'p.ID',
            'p.post_title',
            'pm.meta_value'
        ));

        $results = self::query($wpdb, $sites, $fields, $postStatuses);
        $pages = self::groupResults($results);
        $toc = self::prepareOutput($pages, $search);

        wp_cache_add(self::$commonCacheKey, $toc, $localCacheKey, 3600*10);

        return $toc;
    }

    /**
     * Purge cache
     * @param  array $sites   Site ids to include
     * @param  string $search Title search
     * @return array          Matching content
     */

    public function purgeTableOfContent($meta_id, $object_id, $meta_key, $_meta_value)
    {

        //Check if saved key
        if ($meta_key != "table_of_contents_titles") {
            return;
        }

        //Delete cache
        if (is_multisite()) {
            $current_blog_id = get_current_blog_id();
            foreach (get_sites() as $site) {
                switch_to_blog($site->blog_id);
                wp_cache_delete(self::$commonCacheKey);
                restore_current_blog();
            }
            switch_to_blog($current_blog_id);
        } else {
            wp_cache_delete(self::$commonCacheKey);
        }
    }

    /**
     * Prepares the table of content for ouput (corractly format the results)
     * @param  array $pages   Pages to include
     * @param  string $search Search phrase
     * @return array
     */
    public static function prepareOutput($pages, $search)
    {

        //Bail early if pages is empty
        if (is_array($pages) && !empty($pages)) {
            return array();
        }

        $toc = array();

        foreach ($pages as $page) {
            foreach ($page['titles'] as $title) {
                if (!is_null($search) && stripos($title, $search) <= -1) {
                    continue;
                }

                $key = mb_strtoupper(mb_substr($title, 0, 1));
                if (!isset($toc[$key])) {
                    $toc[$key] = array();
                }

                $toc[$key][] = array(
                    'blog_id' => $page['blog_id'],
                    'ID' => $page['ID'],
                    'post_title' => $title
                );
            }
        }

        foreach ($toc as &$pages) {
            uasort($pages, function ($a, $b) {
                return strcmp($a['post_title'], $b['post_title']);
            });

            // Reset keys
            $pages = array_values($pages);
        }

        // Use collator to be able to sort multibyte keys
        $collator = new \Collator(get_locale());

        uksort($toc, function ($a, $b) use ($collator) {
            return $collator->compare($a, $b);
        });

        return $toc;
    }

    /**
     * Format query result
     * @param  array $results Query result
     * @return array
     */
    public static function groupResults($results)
    {
        $pages = array();

        foreach ($results as $page) {
            if (isset($pages[$page->blog_id . '-' . $page->ID])) {
                $pages[$page->blog_id . '-' . $page->ID]['titles'] = array_unique(array_merge(
                    $pages[$page->blog_id . '-' . $page->ID]['titles'],
                    array($page->meta_value)
                ));

                continue;
            }

            $pages[$page->blog_id . '-' . $page->ID] = array(
                'blog_id' => $page->blog_id,
                'ID' => $page->ID,
                'titles' => array($page->meta_value)
            );
        }

        return $pages;
    }

    /**
     * Create and run query
     * @param  object $wpdb         WPDB object to use
     * @param  array  $sites        Sites to include
     * @param  array  $fields       Fields to get
     * @param  array  $postStatuses Allowed post statuses
     * @return array                Query results
     */
    public static function query($wpdb, $sites, $fields, $postStatuses)
    {
        $query = '';

        $i = 0;
        foreach ($sites as $site) {
            if ($i > 0) {
                $query .= ' UNION ';
            }

            $query .= '
                SELECT ' . $site . ' AS blog_id, ' . $fields  . '
                FROM ' . $wpdb->get_blog_prefix($site) . 'posts p
                LEFT JOIN ' . $wpdb->get_blog_prefix($site) . 'postmeta pm
                    ON p.ID = pm.post_id
                WHERE
                    p.post_type = \'page\'
                    AND p.post_title != \'\'
                    AND p.post_status IN (\'' . implode('\',\'', $postStatuses) . '\')
                    AND NOT p.ID = ' . get_blog_option($site, 'page_on_front') . '
                    AND (
                        pm.meta_key LIKE \'table_of_contents_titles_%\'
                        AND pm.meta_value != \'\'
                    )
            ';

            $i++;
        }

        return $wpdb->get_results($query);
    }
}
