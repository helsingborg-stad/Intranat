<?php

namespace Intranet\User;

class Login
{
    public function __construct()
    {
        add_action('wp_login', array($this, 'adMapping'), 10, 2);
        add_action('wp_login_failed', array($this, 'frontendLoginFailed'));
        add_action('wp_logout', array($this, 'frontendLogout'), 9);

        // Redirect to homepage
        add_action('wp_login', function ($url) {
            global $wp;

            var_dump($wp);

            die;

            if (isset($wp->request) && !empty($wp->request)) {
                wp_redirect(home_url($wp->request));
            } else {
                wp_redirect(home_url());
            }

            exit;

        }, 50);
    }

    public function adMapping($username, $user)
    {
        if (isset($_COOKIE['sso_manual_logout'])) {
            setcookie('sso_manual_logout', null, -1, '/', COOKIE_DOMAIN);
        }

        $userId = $user->data->ID;

        // Map the administration unit
        if (!empty(get_the_author_meta('ad_company', $userId))) {
            $departmentId = \Intranet\User\AdministrationUnits::getAdministrationUnitIdFromString(get_the_author_meta('ad_company', $userId));

            if (!$departmentId) {
                $departmentId = \Intranet\User\AdministrationUnits::insertAdministrationUnit(get_the_author_meta('ad_company', $userId));
            }

            update_user_meta($userId, 'user_administration_unit', $departmentId);
        }

        // Map department
        if (!empty(get_the_author_meta('ad_department', $userId)) && empty(get_the_author_meta('user_department', $userId))) {
            update_user_meta($userId, 'user_department', get_the_author_meta('ad_department', $userId));
        }

        // Map phone number
        if (!empty(get_the_author_meta('ad_telephone', $userId)) && empty(get_the_author_meta('user_phone', $userId))) {
            update_user_meta($userId, 'user_phone', \Intranet\Helper\DataCleaner::phoneNumber(get_the_author_meta('ad_telephone', $userId)));
        }

        // Visiting address
        if (empty(get_the_author_meta('user_visiting_address', $userId))) {
            $userVisitingAddress = array(
                'city' => apply_filters('MunicipipIntranet/User/VisitingAddress/DefaultCity', 'Helsingborg')
            );

            if (!empty(get_the_author_meta('ad_physicaldeliveryofficename', $userId)) && empty(get_the_author_meta('ad_physicaldeliveryofficename', $userId))) {
                $userVisitingAddress['workplace'] = get_the_author_meta('ad_physicaldeliveryofficename', $userId);
            }

            if (!empty(get_the_author_meta('ad_streetaddress', $userId)) && empty(get_the_author_meta('ad_streetaddress', $userId))) {
                $userVisitingAddress['street'] = get_the_author_meta('ad_streetaddress', $userId);
            }

            if (isset($userVisitingAddress['workplace']) && isset($userVisitingAddress['street']) && isset($userVisitingAddress['city'])) {
                update_user_meta($user->ID, 'user_visiting_address', $userVisitingAddress);
            }
        }

        return;
    }

    /**
     * Handles logout from frontend
     * @return void
     */
    public function frontendLogout()
    {
        setcookie('sso_manual_logout', true, time()+3600, '/', COOKIE_DOMAIN);
        wp_redirect(home_url('/'));
        exit;
    }

    /**
     * Handles incorrect logins on frontend
     * @param  string $username
     * @return void
     */
    public function frontendLoginFailed($username)
    {
        global $wp;

        if (isset($wp->request) && !empty($wp->request)) {
            if (!empty($wp->request) && !strstr($wp->request, 'wp-login') && !strstr($wp->request, 'wp-admin')) {
                wp_redirect(strstr(home_url($wp->request), '?login=failed') ? home_url($wp->request) : home_url($wp->request) . '?login=failed');
            }
        } else {
            wp_redirect(home_url());
        }

        exit;
    }
}
