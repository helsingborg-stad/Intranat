<?php

namespace Intranet\Search;

class Algolia
{

    public function __construct()
    {
        //Algilia index js mod
        add_filter('AlgoliaIndexJSSearchPage/ActionMountPoint', function() {
            return 'loop_start';
        }); 

        //Algolia vendor fix (discontiniued plugin)
        add_filter('algolia_should_index_searchable_post', array($this, 'indexPrivatePosts'), 10, 2); 
    }

    public function indexPrivatePosts($should_index, $post)
    {
        if ($post->post_status === "private") {
            $should_index = true;
        }
        return $should_index;
    }
}
