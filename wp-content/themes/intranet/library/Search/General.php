<?php

namespace Intranet\Search;

class General
{
    public static function jsonSearch($data)
    {

        //Check if elasticpress is installed
        if(!defined('EP_URL')) {
            return array('content' => [], 'users' => []);
        }

        $q = sanitize_text_field(urldecode($data['s']));

        $postStatuses  = array('publish', 'inherit');

        if (is_user_logged_in()) {
            $postStatuses[] = 'private';
        }

        if ($cache = self::getCachedResponse(self::createCacheHash(array($postStatuses, $q)))) {
            return $cache;
        }

        $query = new \WP_Query(array(
            's'             => $q,
            'orderby'       => 'relevance',
            'sites'         => 'all',
            'post_status'   => $postStatuses,
            'post_type'     => \Intranet\Helper\PostType::getPublic(),
            'cache_results' => true,
            'posts_per_page' => 5
        ));

        $users = array();
        if (is_user_logged_in()) {
            $users = \Intranet\User\General::searchUsers($q, 5);
        }

        $response =  array(
            'content' => $query->posts,
            'users' => $users
        );

        self::setCachedResponse($response, self::createCacheHash(array($postStatuses, $q)));

        return $response;
    }

    private static function getCachedResponse($hash)
    {
        return wp_cache_get('json_search_query', $hash);
    }

    private static function setCachedResponse($response, $hash)
    {
        return wp_cache_set('json_search_query', $response, $hash, 60*60);
    }

    private static function createCacheHash($args)
    {
        return md5(maybe_serialize($args));
    }
}
