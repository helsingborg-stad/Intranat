<?php

namespace Intranet\Api;

class News
{
    public function __construct()
    {
        add_action('rest_api_init', array($this, 'routes'));
    }

    /**
     * Registers new route for fething news archive.
     * @return void
     */
    public function routes()
    {
        register_rest_route('intranet/1.0', '/news/(?P<count>(\d)+)/(?P<offset>(\d)+)/(?P<sites>(.*)+)/(?P<category>(\d)+)', array(
            'methods' => 'POST',
            'callback' => array($this, 'getNews'),
            'args' => array(
                'count' => array(
                    'required' => true,
                    'validate_callback' => function ($param, $request, $key) {
                        return is_numeric($param);
                    }
                ),
                'offset' => array(
                    'required' => true,
                    'validate_callback' => function ($param, $request, $key) {
                        return is_numeric($param);
                    }
                ),
                'sites' => array(
                    'required' => true
                ),
                'category' => array(
                    'required' => false,
                    'validate_callback' => function ($param, $request, $key) {
                        return is_numeric($param);
                    }
                ),
            )
        ));
    }

    /**
     * Return news array
     * @param array $data Contains the query data
     * @return array
     */
    public function getNews($data) : array
    {
        $sites = $data['sites'];
        $category = !empty($data['category']) ? $data['category'] : null;

        if ($sites == 'all') {
            $sites = \Intranet\Helper\Multisite::getSitesList(true, true);
            $sites = implode(',', $sites);
        }

        if (!is_null($sites)) {
            $sites = explode(',', $sites);
        }

        return \Intranet\CustomPostType\News::getNews($data['count'], $sites, $data['offset'], true, $category);
    }
}
