<?php

namespace Intranet\Search;

class Algolia
{

    public function __construct()
    {
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
