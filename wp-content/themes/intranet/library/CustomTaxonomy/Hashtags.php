<?php

namespace Intranet\CustomTaxonomy;

class Hashtags
{
    public static $taxonomySlug = 'hashtag';

    public function __construct()
    {
        add_action('init', array($this, 'registerHashtags'));
        add_action('save_post', array($this, 'saveHashtags'), 10, 3);
        add_filter('the_content', array($this, 'hashtagReplace'), 200, 1);
        add_filter('Municipio/archive/filter_taxonomies', array($this, 'filterTaxonomies'), 10, 2);
        add_filter('Municipio/archive/tax_query', array($this, 'taxQuery'), 10, 2);
        add_action('pre_get_posts', array($this, 'doPostTaxonomyFiltering'));
        add_action('wp_ajax_get_hashtags', array($this, 'getHashtags'));
    }

    /**
     * Register Hashtag taxonomy
     * @return void
     */
    public function registerHashtags()
    {
        $labels = array(
            'name'              => _x('Hashtags', 'taxonomy general name', 'municipio-intranet'),
            'singular_name'     => _x('Hashtag', 'taxonomy singular name', 'municipio-intranet'),
            'search_items'      => __('Search Hashtags', 'municipio-intranet'),
            'all_items'         => __('All Hashtags', 'municipio-intranet'),
            'parent_item'       => __('Parent Hashtag', 'municipio-intranet'),
            'parent_item_colon' => __('Parent Hashtag:', 'municipio-intranet'),
            'edit_item'         => __('Edit Hashtag', 'municipio-intranet'),
            'update_item'       => __('Update Hashtag', 'municipio-intranet'),
            'add_new_item'      => __('Add New Hashtag', 'municipio-intranet'),
            'new_item_name'     => __('New Hashtag Name', 'municipio-intranet'),
            'menu_name'         => __('Hashtags', 'municipio-intranet'),
        );

        $args = array(
            'labels'                => $labels,
            'public'                => true,
            'show_in_nav_menus'     => false,
            'show_admin_column'     => false,
            'hierarchical'          => false,
            'show_tagcloud'         => false,
            'show_ui'               => false,
            'query_var'             => true,
            'rewrite'               => array('slug' => self::$taxonomySlug),
        );

        $postTypes = get_post_types(array('public' => true));

        register_taxonomy(self::$taxonomySlug, $postTypes, $args);
    }

    /**
     * Get list of all Hashtags
     */
    public function getHashtags()
    {
        if (!$hashtags = wp_cache_get('tinymce_hashtags')) {
            $terms = get_terms([
                'taxonomy' => self::$taxonomySlug,
                'hide_empty' => false,
            ]);

            $hashtags = array();
            if (!empty($terms)) {
                foreach ($terms as $key => $term) {
                    $hashtags[] = array('display_name' => $term->name);
                }
            }

            wp_cache_add('tinymce_hashtags', $hashtags);
        }

        wp_send_json($hashtags);
    }

    public function taxQuery($taxQuery, $query)
    {
        $hashtags = isset($query->query['s']) ? $this->extractHashtags($query->query['s']) : false;

        if (!$hashtags) {
            return $taxQuery;
        }

        $taxQuery[] =
                array(
                    'relation' => 'OR',
                    array(
                        'taxonomy' => 'hashtag',
                        'terms' => $hashtags,
                        'field' => 'name',
                        'operator' => 'IN',
                        'include_children' => false,
                    )
                );

        return $taxQuery;
    }

    /**
     * Do taxonomy fitering
     * @param  object $query Query object
     * @return object        Modified query
     */
    public function doPostTaxonomyFiltering($query)
    {
        // Do not execute this in admin view
        if (is_admin() || !(is_archive() || is_home() || is_category() || is_tax() || is_tag()) || !$query->is_main_query()) {
            return $query;
        }

        $hashtags = isset($query->query['s']) ? $this->extractHashtags($query->query['s']) : false;
        if ($hashtags) {
            $query->set('s', '');
        }

        return $query;
    }

    /**
     * Make hashtags searchable on all post type archives
     * @param  array  $taxonomies Filterable taxonomies for current post type
     * @param  string $postType   Current post type
     * @return array              Modified list of taxonomies
     */
    public function filterTaxonomies($taxonomies, $postType)
    {
        if (!array_key_exists(self::$taxonomySlug, $taxonomies)) {
            $taxonomies[self::$taxonomySlug] = self::$taxonomySlug;
        }

        return $taxonomies;
    }

    /**
     * Replaces hashtags in text with clickable links
     * @param  string $content Post content
     * @return string          Modified post content
     */
    public function hashtagReplace($content)
    {
        global $post;
        $url = get_post_type_archive_link($post->post_type);
        $content = preg_replace('/<textarea[^>]*>.*?<\/textarea>(*SKIP)(*FAIL)|(?<!=|[\w\/\"\'\\\]|&)#([\w]+)/ius', '<a href="'. $url . '?s=%23$1">$0</a>', $content);

        return $content;
    }

    /**
     * Save hashtags as taxonomies from the content
     * @param  int  $postId The post ID
     * @param  obj  $post   The post object
     * @param bool  $update Whether this is an existing post being updated or not
     * @return void
     */
    public function saveHashtags($postId, $post, $update)
    {
        // Remove current hashtags
        $currentTags = wp_get_post_terms($postId, self::$taxonomySlug);
        if (!empty($currentTags)) {
            wp_set_object_terms($postId, null, self::$taxonomySlug);
        }

        // Save hashtags from the content
        $hashtags = $this->extractHashtags($post->post_content);
        if ($hashtags) {
            wp_set_object_terms($postId, $hashtags, self::$taxonomySlug, false);
        }
    }

    /**
     * Returns hashtags from string
     * @param  string $string String to check for hashtags
     * @return mixed          Array if string contains hashtags
     */
    public function extractHashtags($string)
    {
        $hashtags = false;
        preg_match_all('/(?<!=|[\w\/\"\'\\\]|&)#([\w]+)/iu', $string, $matches);
        if ($matches) {
            $hashtagsArray = array_count_values($matches[1]);
            $hashtags = array_keys($hashtagsArray);
        }

        return $hashtags;
    }
}
