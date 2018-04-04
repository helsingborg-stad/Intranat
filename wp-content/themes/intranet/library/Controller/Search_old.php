<?php

namespace Intranet\Controller;

class Search extends \Intranet\Controller\BaseController
{
    /**
     * Performs the search
     * @return void
     */
    public function init()
    {
        global $wp_query;

        $this->data['resultCount'] = $wp_query->found_posts;
        $this->data['keyword'] = get_search_query();
        $this->data['level'] = \Intranet\Search\ElasticSearch::$level;

        if (is_user_logged_in()) {
            $this->data['users'] = \Intranet\User\General::searchUsers(get_search_query());
            $this->data['systems'] = \Intranet\User\Systems::search(get_search_query());
        } else {
            $this->data['users'] = array();
            $this->data['systems'] = array();
        }

        if ($this->data['level'] === 'users') {
            $this->data['resultCount'] = count($this->data['users']);
        }

        $this->countResult($this->data['level']);

        // No subscription or all results, but users have results, redirect to user level
        if (is_user_logged_in() && !in_array($this->data['level'], array('users', 'files')) && $this->data['level'] === 'subscriptions' && $this->data['counts']['subscriptions'] === 0 && $this->data['counts']['all'] === 0 && $this->data['counts']['users'] > 0) {
            wp_redirect(municipio_intranet_current_url() . '&level=users');
            exit;
        }

        if ($this->data['level'] === 'subscriptions' && $this->data['counts']['subscriptions'] === 0 && $this->data['counts']['all'] > 0) {
            wp_redirect(municipio_intranet_current_url() . '&level=all');
            exit;
        }
    }

    /**
     * Counts results for each tab
     * @param  string $currentLevel The current search level
     * @return void
     */
    public function countResult($currentLevel)
    {
        global $wp_query;

        $counts = array(
            'all' => 0,
            'subscriptions' => 0,
            'current' => 0,
            'files' => 0
        );

        $counts[$currentLevel] = $wp_query->found_posts;

        foreach ($counts as $level => $resultCount) {
            if ($resultCount <> 0) {
                continue;
            }

            $queryVars = $wp_query->query_vars;
            $sites = \Intranet\Search\ElasticSearch::getSitesFromLevel($level);

            $postStatuses  = array('publish', 'inherit');
            $postTypes = \Intranet\Helper\PostType::getPublic(array('attachment'));

            if ($level === 'files') {
                $postTypes = array('attachment');
            }

            if (is_user_logged_in()) {
                $postStatuses[] = 'private';
            }

            $query = new \WP_Query(array(
                's'             => get_search_query(),
                'orderby'       => 'relevance',
                'sites'         => $sites,
                'post_status'   => $postStatuses,
                'post_type'     => $postTypes,
                'cache_results' => true,
                'posts_per_page' => 50
            ));

            $counts[$level] = $query->found_posts;
        }

        $counts['users'] = isset($this->data['users']) ? count($this->data['users']) : 0;

        $this->data['counts'] = $counts;
    }
}
