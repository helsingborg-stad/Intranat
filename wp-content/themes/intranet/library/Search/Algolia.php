<?php

namespace Intranet\Search;

class Algolia
{

    public function __construct()
    {

        //Define constant for filter apperance
        define('ALGOLIA_INDEX_FACETTING_APPERANCE_MENU', true); 

        //Algilia index js mod
        define('ALGOLIA_INDEX_MOUNT_POINT', 'loop_start');

        //Algolia vendor fix (discontiniued plugin)
        add_filter('algolia_should_index_searchable_post', array($this, 'indexPrivatePosts'), 10, 2); 

        //Add css for algolia index js
        add_action('wp_head', array($this, 'renderAlgoliaJSCss')); 
    }

    public function renderAlgoliaJSCss() {
        if(!is_plugin_active('algolia-index-js-searchpage-addon/algolia-index-js-searchpage.php')) {
            return; 
        }

        //echo '<style>.search .main-content > .creamy, .search .search-level {display: none; }</style>'; 
    }

    public function indexPrivatePosts($should_index, $post)
    {
        if ($post->post_status === "private") {
            $should_index = true;
        }
        return $should_index;
    }
}
