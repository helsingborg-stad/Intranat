<?php

namespace Intranet\Controller;

class Author extends \Intranet\Controller\BaseController
{
    public function init()
    {
        global $wp_query;
        global $authordata;

        $this->redirectProfile();

        $user = get_user_by('slug', $wp_query->query['author_name']);

        if ($user) {
            $authordata = $user;
        }

        $this->data['userResponsibilities'] = is_array(get_the_author_meta('user_responsibilities', $user->ID)) ? get_the_author_meta('user_responsibilities', $user->ID) : array();
        $this->data['userSkills'] = is_array(get_the_author_meta('user_skills', $user->ID)) ? get_the_author_meta('user_skills', $user->ID) : array();
        $this->data['submittedIdeas'] = get_posts(array('post_type' => 'idea', 'author' => $user->ID));
        $this->data['groups'] = $this->memberInGroups($user->ID);
        $this->data['cover_img'] =  $this->getCoverUrl($user->ID);
        $this->data['profile_img'] = $this->getProfileImg($user->ID);
    }

    /**
     * Get users group memberships
     * @param  int $userId User ID
     * @return array List of post ids
     */
    public function memberInGroups($userId) {
        global $wpdb;

        // Collect all group members from db
        $groupMembers = $wpdb->get_results("SELECT post_id, meta_value as members FROM {$wpdb->prefix}postmeta WHERE meta_key = 'forum_members'", ARRAY_A);

        // Return all groups where user is a member
        $groups = array_map(function($array) use($userId) {
            if (empty($array['members'])) {
                return 0;
            }
            $member = array_filter(unserialize($array['members']), function($val, $key) use($userId) {
                return ($val == 1 && $key == $userId);
            }, ARRAY_FILTER_USE_BOTH);
            return (!empty($member)) ? (int) $array['post_id'] : 0;
        }, $groupMembers);

        return array_filter($groups);
    }

    /**
     * Redirect to main blog author page
     * @return void
     */
    public function redirectProfile()
    {
        //Check if main site
        if (is_main_site()) {
            return;
        }

        //Redirect to main site
        wp_redirect(municipio_intranet_get_user_profile_url(get_queried_object()->ID));
        exit;
    }

    /**
     * Get cover URL
     * @param int $userId User ID
     * @return mixed string/array
     */
    public function getCoverUrl($userId)
    {
        if (!isset($userId)) {
            return;
        }

        $profile_cover = get_the_author_meta('user_profile_cover', $userId);

        if (isset($profile_cover) && !empty($profile_cover)) {
            return $profile_cover[0];
        } else {
            $images = get_field('default_author_cover', 'options');

            if (isset($images) && $images) {
                $image = $images[array_rand($images, 1)]['cover'];
                $image = wp_get_attachment_image_src($image['ID'], array('1366', '768'));

                return $image[0];
            }
        }

        return false;
    }

    /**
     * Get profile image URL
     * @param int $userId User ID
     * @return mixed string/array
     */
    public function getProfileImg($userId)
    {
        if (!isset($userId)) {
            return;
        }

        $images = get_the_author_meta('user_profile_img', $userId);

        if (!empty($images) && is_array($images)) {
            return $images;
        } else {
            $image = get_the_author_meta('user_profile_picture', $userId);
        }

        if (isset($image)) {
            return $image;
        }
    }
}
