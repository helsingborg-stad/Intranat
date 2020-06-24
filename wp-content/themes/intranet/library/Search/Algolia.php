<?php

namespace Intranet\Search;

class Algolia
{

    public function __construct()
    {

        //Define constant for filter apperance
        define('ALGOLIA_INDEX_FACETTING_APPERANCE_MENU', true); 

        //Algolia vendor fix (discontiniued plugin)
        add_filter('algolia_should_index_searchable_post', array($this, 'indexPrivatePosts'), 10, 2); 

        //Add css for algolia index js
        add_action('wp_head', array($this, 'renderAlgoliaJSCss'));

        //Allow index of private posts algolia-index
        add_filter('AlgoliaIndex/IndexablePostStatuses', array($this, 'addPrivatePosts')); 
    }
    
    public function addPrivatePosts($postStatuses) {
        return ['publish', 'private'];
    }

    public function renderAlgoliaJSCss() {
        if(!is_plugin_active('algolia-index-js-searchpage-addon/algolia-index-js-searchpage.php')) {
            return; 
        }

        echo '<style>.search .main-content > .creamy, .search .search-level {display: none; } .search .main-content {background: #f5f5f5;} .search .search-main {opacity: .6; cursor: not-allowed;}</style>'; 
    }

    public function indexPrivatePosts($should_index, $post)
    {
        if ($post->post_status === "private") {
            $should_index = true;
        }
        return $should_index;
    }
}
