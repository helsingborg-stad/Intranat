<?php

namespace Intranet\Controller;

class SingleIntranetGroup extends \Municipio\Controller\Single
{
    public function init()
    {
        global $post;
        parent::init();

        $user = wp_get_current_user();
        $members = get_post_meta($post->ID, 'group_members', true);
        $isMember = comments_open() && !empty($members) && isset($members[$user->ID]) && $members[$user->ID] == 1 ? true : false;

        $this->data['isMember'] = $isMember;
    }
}
