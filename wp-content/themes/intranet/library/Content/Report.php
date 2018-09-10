<?php

namespace Intranet\Content;

use Philo\Blade\Blade as Blade;

class Report
{
    public function __construct()
    {
        add_filter('wp', array($this, 'initReportViolation'), 10);
        add_action('wp_ajax_report_post', array($this, 'sendReport'));
        add_action('wp_ajax_nopriv_report_post', array($this, 'sendReport'));
    }

    /**
     * Adds a form to report content violations
     * @return void
     */
    public function initReportViolation()
    {
        global $post;

        if (is_single()
            && is_object($post)
            && !empty($post->post_type)
            && $this->isReportActive($post->post_type)) {
            add_filter('Municipio/blog/post_settings', array($this, 'addReportButton'), 11, 2);
            add_filter('dynamic_sidebar_before', array($this, 'contentBeforeSidebar'));
            add_filter('is_active_sidebar', array($this, 'isActiveSidebar'), 11, 2);
        }
    }

    /**
     * Check if report is activated for post type
     * @param  string  $postType Post type
     * @return boolean
     */
    public function isReportActive($postType) : bool
    {
        $activated = false;
        if (!$postTypes = wp_cache_get('report_post_types')) {
            $postTypes = get_field('report_post_types', 'option');
            wp_cache_add('report_post_types', $postTypes);
        }

        if (is_array($postTypes) && in_array($postType, array_column($postTypes, 'report_post_type'))) {
            $activated = true;
        }

        return $activated;
    }

    /**
     * Activate bottom sidebar to add hidden content
     * @param  boolean  $isActiveSidebar Original response
     * @param  string   $sidebar         Sidebar id
     * @return boolean
     */
    public function isActiveSidebar($isActiveSidebar, $sidebar)
    {
        if ($sidebar === 'bottom-sidebar') {
            return true;
        }

        return $isActiveSidebar;
    }

    /**
     * Render custom content in sidebar
     * @param string $sidebar
     */
    public function contentBeforeSidebar($sidebar)
    {
        if ($sidebar === 'bottom-sidebar') {
            $blade = new Blade(INTRANET_PATH . 'views/partials/modal/', WP_CONTENT_DIR . '/uploads/cache/blade-cache');
            echo $blade->view()->make('report-post')->render();
        }
    }

    /**
     * Add report button in the post settings dropdown
     * @param array  $settingItems Setting items
     * @param object $post         Post object
     */
    public function addReportButton($settingItems, $post)
    {
        $settingItems[] = '<a href="#report-post-' . $post->ID . '" class="settings-item"><i class="pricon pricon-notice-danger pricon-space-right"></i> ' . __('Report page', 'municipio-intranet') . '</a>';

        return $settingItems;
    }

    /**
     * Share a post by email
     * @return void
     */
    public function sendReport()
    {
        // Validate ReCaptcha
        if (!is_user_logged_in() && defined('G_RECAPTCHA_KEY')) {
            $response   = isset($_POST['g-recaptcha-response']) ? esc_attr($_POST['g-recaptcha-response']) : '';
            $reCaptcha = \Municipio\Helper\ReCaptcha::controlReCaptcha($response);

            if (!$reCaptcha) {
                wp_send_json_error(__('Something went wrong, please try again', 'municipio'));
            }
        }

        // Collect email data
        $user        = wp_get_current_user();
        $postId      = isset($_POST['post_id']) ? $_POST['post_id'] : null;
        $senderName  = is_user_logged_in() ? $user->display_name : (isset($_POST['sender_name']) ? $_POST['sender_name'] : "");
        $senderEmail = is_user_logged_in() ? $user->user_email : (isset($_POST['sender_email']) ? $_POST['sender_email'] : "");

        // Build message
        $message = sprintf('<strong>%s</strong> %s.<br>Url: <a href="%s" target="_blank">%s</a><br><br><strong>%s</strong><br>%s<br><br>---<br>%s %s via <a href="%s" target="_blank">%s</a>',
            get_the_title($postId),
            __('has been reported for inappropriate content', 'municipio-intranet'),
            get_permalink($postId),
            get_permalink($postId),
            __('Comment', 'municipio-intranet'),
            $_POST['report-comment'],
            __('This message was sent by', 'municipio-intranet'),
            $senderEmail,
            get_site_url(),
            get_site_url()
        );

        // Get recipients for the post type
        $recipients = array();
        $postTypes = get_field('report_post_types', 'option');
        if (is_array($postTypes) && !empty($postTypes)) {
            foreach ($postTypes as $postType) {
                if ($postType['report_post_type'] == get_post_type($postId)) {
                    $recipients = $postType['report_notifiers'];
                }
            }
        }

        // Send the email
        foreach ($recipients as $recipient) {
            if (!empty($recipient['report_notifier_email'])) {
                $mail = wp_mail(
                    $recipient['report_notifier_email'],
                    __('Report about inappropriate content', 'municipio-intranet'),
                    $message,
                    array(
                        'From: ' . $senderName . ' <' . $senderEmail . '>',
                        'Content-Type: text/html; charset=UTF-8'
                    )
                );
            }
        }

        wp_send_json_success(__('The message was sent successfully', 'municipio'));
    }
}
