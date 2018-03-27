<?php

namespace Intranet\Controller;

class SingleForum extends \Municipio\Controller\Single
{
    public function init()
    {
        global $post;
        parent::init();

        $user = wp_get_current_user();
        $members = get_post_meta($post->ID, 'forum_members', true);
        $isMember = comments_open() && !empty($members) && isset($members[$user->ID]) && $members[$user->ID] == 1 ? true : false;

        $this->data['isMember'] = $isMember;
        $this->data['commentForm'] = $this->commentForm();
    }

    /**
     * Comment form settings
     * @return string
     */
    public function commentForm()
    {
        ob_start();
        comment_form(array(
            'class_submit' => 'btn btn-primary',
            'title_reply' => __('Write post', 'municipio-intranet'),
            'label_submit' => __('Send', 'municipio-intranet'),
        ));
        $form = str_replace('class="comment-respond"', 'class="comment-respond comment-respond-new"', ob_get_clean());
        $form = str_replace('id="commentform"', 'id="commentform" enctype="multipart/form-data"', $form);

        return $form;
    }
}
