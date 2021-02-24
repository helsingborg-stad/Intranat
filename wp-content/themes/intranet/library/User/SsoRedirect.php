<?php

namespace Intranet\User;

class SsoRedirect
{
    private $prohibitedUrls;
    public $settings;

    /**
     * Constructor. Different scenarios require the SSO plugin to be disabled.
     */
    public function __construct()
    {
        //Check status
        if(isset($_GET['ssoTest'])) {
            echo '<pre>'; 
                print_r([
                    'isAuthenticated' => $this->isAuthenticated(),
                    'isInNetwork' => $this->isInNetwork(), 
                    'isExplorer' => $this->isExplorer(), 
                    'isManuallyLoggedOut' => $this->isManuallyLoggedOut()
                ]); 
            echo '</pre>'; 
            die; 
        }

        //Set vars
        $this->prohibitedUrls = array('plugins');
        $pageParam = isset($_GET['page']) ? $_GET['page'] : null;

        //Disable SSO on subsites completly
        if (!is_main_site()) {
            add_filter('option_active_plugins', array($this, 'disableSsoPlugin'));
            add_filter('site_option_active_plugins', array($this, 'disableSsoPlugin'));
        } elseif (defined('DOING_CRON') && DOING_CRON === true) {
            add_filter('option_active_plugins', array($this, 'disableSsoPlugin'));
            add_filter('site_option_active_plugins', array($this, 'disableSsoPlugin'));
        } elseif (is_user_logged_in() && $pageParam !== 'plugins') {
            add_filter('option_active_plugins', array($this, 'disableSsoPlugin'));
            add_filter('site_option_active_plugins', array($this, 'disableSsoPlugin'));
        } elseif (!$this->disabledUrl()) {
            add_action('init', array($this, 'init'), 9999);
        }
    }

    public function init()
    {
        if (
            method_exists(
                '\SsoAvailability\SsoAvailability',
                'isSsoAvailable'
            ) && !\SsoAvailability\SsoAvailability::isSsoAvailable()
        ) {
            return;
        }

        if (
            method_exists(
                '\SAMLSSO\Endpoints',
                'isSAMLSSOEndpoint'
            ) && \SAMLSSO\Endpoints::isSAMLSSOEndpoint()
        ) {
            return;
        }

        if (!$this->isAuthenticated() && $this->isInNetwork() && $this->isExplorer() && !$this->isManuallyLoggedOut()) {
            $this->doAuthentication();
        } elseif (!$this->isInNetwork() || !$this->isExplorer()) {
            add_filter('option_active_plugins', array($this, 'disableSsoPlugin'));
            add_filter('site_option_active_plugins', array($this, 'disableSsoPlugin'));
        } elseif ($this->isAuthenticated()) {
            add_filter('body_class', array($this, 'addBodyClass'));
        }
    }

    public function isAuthenticated()
    {
        return is_user_logged_in();
    }

    public function isInNetwork()
    {
        return is_local_ip();
    }

    public function isManuallyLoggedOut()
    {
        if (!isset($_COOKIE['sso_manual_logout']) || !(isset($_COOKIE['sso_manual_logout']) && $_COOKIE['sso_manual_logout'] == 1)) {
            return false;
        }

        return true;
    }

    public function isExplorer()
    {
        if (strpos($_SERVER['HTTP_USER_AGENT'], 'MSIE') || strpos($_SERVER['HTTP_USER_AGENT'], 'Trident/7') || strpos($_SERVER['HTTP_USER_AGENT'], 'edg/')) {
            return true;
        }
        return false;
    }

    public function doAuthentication()
    {
        if (class_exists('\SAMLSSO\Client')) {
            try {
                $currentUrl = municipio_intranet_current_url();
                $client = new \SAMLSSO\Client();
                $client->authenticate($currentUrl);
            } catch (Exception $e) {
                write_log('Error: SSO could not be performed due to an error in SSO plugin (' . $e . ')');
            }
        } elseif ((defined('WP_DEBUG') && WP_DEBUG === true) && function_exists('write_log')) {
            write_log('Error: SAML client plugin is not active.');
        }
    }

    public function disabledUrl()
    {
        foreach ($this->prohibitedUrls as $url) {
            if (false !== strpos($_SERVER['REQUEST_URI'], $url)) {
                return true;
            }
        }
        return false;
    }

    public function disableSsoPlugin($plugins)
    {
        $key = array_search('saml-sso/saml-sso.php', maybe_unserialize($plugins));
        if (false !== $key) {
            unset($plugins[$key]);
        }
        return $plugins;
    }

    public function addBodyClass($classes)
    {
        return array_merge($classes, array('sso-enabled'));
    }
}
