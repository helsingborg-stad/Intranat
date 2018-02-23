<?php

namespace Intranet\Theme;

class Breadcrumb
{
    public function __construct()
    {
        add_filter('Municipio/Breadcrumbs/Items', array($this, 'prependMainSite'), 10, 2);
        add_filter('Municipio/Breadcrumbs', '__return_true');
    }

    /**
     * Fixes the breadcrumb url to make main site appear as root.
     * @param array $items  Previous items in the breadcrumb.
     * @params depricated $object
     * @return array $items Array contining markup for all items.
     */
    public function prependMainSite($items, $object = null)
    {

        //Removes "home" page fron breadcrumb
        if (is_array($items) && isset($items[0])) {
            unset($items[0]);
        }

        //Add clickable subsite name
        if (!is_main_site()) {
            $site = \Intranet\Helper\Multisite::getSite(get_current_blog_id());

            array_unshift($items, '
                <li itemscope="" itemprop="itemListElement" itemtype="http://schema.org/ListItem">
                    <a itemprop="item" href="' . $site->path . '" title="' . $site->name . '">
                    ' . $site->name . '
                    </a>
                </li>');
        }

        //Prepend "portalen"
        $mainSiteBloginfo = get_blog_details(BLOG_ID_CURRENT_SITE);
        array_unshift($items, '
            <li itemscope itemprop="itemListElement" itemtype="http://schema.org/ListItem">
                <a itemprop="item" href="' . $mainSiteBloginfo->home. '" title="' . $mainSiteBloginfo->blogname . '">
                    <i class="pricon pricon-home"></i>
                    <span itemprop="name ">' . $mainSiteBloginfo->blogname . '</span><meta itemprop="position" content="0">
                </a>
            </li>');

        return $items;
    }
}
