<?php

namespace Intranet\Api;

class Search
{
    public function __construct()
    {
        add_action('rest_api_init', array($this, 'searchAutocomplete'));
    }

    /**
     * Registers rest route for search function autocomplete
     * @return void
     */
    public function searchAutocomplete()
    {
        register_rest_route('intranet/1.0', '/s/(?P<s>(.*)+)', array(
            'methods' => 'GET',
            'callback' => '\Intranet\Search\General::jsonSearch',
        ));
    }
}
