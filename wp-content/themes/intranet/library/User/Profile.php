<?php

namespace Intranet\User;

class Profile
{
    protected $urlBase = 'user';
    public $fieldMap = array(
        'user_phone' => 'ad_mobile',
        'user_department' => 'ad_department',
        'user_work_title' => 'ad_title'
    );

    public function __construct()
    {
        $this->urlBase = __('user', 'municipio-intranet');

        // View profile
        add_action('init', array($this, 'profileUrlRewrite'));
        add_action('template_redirect', array($this, 'accessControl'), 5);
        add_action('template_redirect', array($this, 'inactiveControl'), 5);
        add_filter('wp_title', array($this, 'setProfileTitle'), 11, 3);

        // Edit profile
        add_action('init', array($this, 'editProfileUrlRewrite'));
        add_filter('template_include', array($this, 'editProfileTemplate'), 10);

        add_filter('Municipio/viewData', array($this, 'currentUserData'));

        add_filter('Modularity/adminbar/editor_link', array($this, 'profileEditModularityEditorLink'), 10, 4);

        //Default values for updatable fields
        add_filter('get_user_metadata', array($this, 'defaultToADProfile'), 1, 4);
        add_filter('get_user_metadata', array($this, 'defaultUserVisitingAdressADProfile'), 1, 4);

        //Contact module
        add_filter('Modularity/mod-contacts/contact-info', array($this, 'getProfileUserData'), 10, 2);
    }

    /**
     * Show default data if the user hasen't defint ther own data
     * @return string, bool, array The meta value
     */
    public function defaultUserVisitingAdressADProfile($type, int $object_id, string $meta_key, bool $single)
    {
        $meta_value = null;

        //Remove this filter, to be able to use get_user_meta without infinite loop
        remove_filter('get_user_metadata', array($this, 'defaultUserVisitingAdressADProfile'), 1);

        if ($meta_key == "user_visiting_address") {
            $adressArray = get_user_meta($object_id, 'user_visiting_address', $single);

            if (!is_array($adressArray)||(is_array($adressArray) && empty(array_filter($adressArray)))) {
                $meta_value = array(array(
                    'workplace' => get_user_meta($object_id, 'ad_physicaldeliveryofficename', true),
                    'street' => get_user_meta($object_id, 'ad_streetaddress', true),
                    'city' => ""
                ));
            }
        }

        //Add filter back again
        add_filter('get_user_metadata', array($this, 'defaultUserVisitingAdressADProfile'), 1, 4);

        //Return new value or null to proceed with normal process
        return $meta_value;
    }

    /**
     * Show default data if the user hasen't defint ther own data
     * @return string, bool, array The meta value
     */
    public function defaultToADProfile($type, int $object_id, string $meta_key, bool $single)
    {
        $meta_value = null;

        //Remove this filter, to be able to use get_user_meta without infinite loop
        remove_filter('get_user_metadata', array($this, 'defaultToADProfile'), 1);

        if (array_key_exists($meta_key, $this->fieldMap)) {
            $default_meta_value = get_user_meta($object_id, $meta_key, $single);

            if (empty($default_meta_value)) {
                $meta_value =  get_user_meta($object_id, $this->fieldMap[$meta_key], $single);
            }
        }

        //Add filter back again
        add_filter('get_user_metadata', array($this, 'defaultToADProfile'), 1, 4);

        //Return new value or null to proceed with normal process
        return $meta_value;
    }

    /**
     * Get profile user data
     * @return array data
     */
    public function getProfileUserData($data, $type)
    {

        //Bail early if not a wp user
        $type = (array) $type;
        if ($type['acf_fc_layout'] != "user") {
            return $data;
        }

        //Get data from user id
        $user_meta = get_user_meta($data['id']);

        if (is_numeric($data['id'])) {
            $administration_unit = get_user_meta($data['id'], 'user_administration_unit', true);
            $administration_unit = is_array($administration_unit) ? array_pop($administration_unit) : '';

            if (is_numeric($administration_unit)) {
                $data['administration_unit']    = \Intranet\User\AdministrationUnits::getAdministrationUnit($administration_unit);
            } else {
                $data['administration_unit']    = "";
            }

            $data['image'] = get_user_meta($data['id'], 'user_profile_picture', true);
            $data['visiting_address'] = implode(" - ", array_filter(get_user_meta($data['id'], 'user_visiting_address', true)));
            $data['work_title'] = get_user_meta($data['id'], 'user_work_title', true);
            $data['phone'] = array(array('number' => get_user_meta($data['id'], 'user_phone', true)));
        }

        return $data;
    }

    /**
     * Fixes modularity edit links on profile pages
     * @return string The new editor link
     */
    public function profileEditModularityEditorLink($editorLink, $post, $archiveSlug, $currentUrl)
    {
        if ($archiveSlug == 'author' && empty($editorLink) && strpos($currentUrl, '/edit')) {
            $editorLink = admin_url('options.php?page=modularity-editor&id=author-edit');
        }
        return $editorLink;
    }

    /**
     * Get current user
     * @param  array $data d0ata array to fill
     * @return array The complete user data object
     */
    public function currentUserData($data)
    {
        $data['currentUser'] = wp_get_current_user();
        return $data;
    }

    /**
     * Use correct template for the profile edit page
     * @param  string $template Default template
     * @return string           Template to use
     */
    public function editProfileTemplate($template)
    {
        global $wp_query;

        if ($wp_query->is_404()) {
            return get_404_template();
        }

        // Bail if not on edit page
        if (!isset($wp_query->query['author_name']) || empty($wp_query->query['author_name']) || !isset($wp_query->query['editprofile']) || !$wp_query->query['editprofile'] || $wp_query->query['editprofile'] == 'false') {
            return $template;
        }

        if (!get_user_by('slug', $wp_query->query['author_name'])) {
            $wp_query->set404();
            return get_404_template();
        }

        $template = \Municipio\Helper\Template::locateTemplate('author-edit');
        return $template;
    }

    /**
     * Only show author/profile page to logged in users
     * @return void
     */
    public function accessControl()
    {
        global $wp_query;
        $currentUser = wp_get_current_user();

        if (is_author() && !is_user_logged_in()) {
            $wp_query->set_404();
        }

        if (isset($wp_query->query['editprofile']) && $wp_query->query['editprofile'] && (!is_super_admin() && $currentUser->user_login != $wp_query->query['author_name'])) {
            $wp_query->set_404();
        }
    }

    /**
     * Only show author/profile if is enabled user
     * @return void
     */
    public function inactiveControl()
    {
        if (!is_author()) {
            return;
        }

        global $wp_query;

        $user = get_user_by('login', $wp_query->query['author_name']);

        if (isset($user->data->user_email)) {

            //Remove disabled users
            if (0 === strpos($user->data->user_email, $wp_query->query['author_name'])) {
                $wp_query->set_404();
            }
        }
    }

    /**
     * Change the url base for the author pages to /user
     * @return void
     */
    public function profileUrlRewrite()
    {
        global $wp_rewrite;

        if ($wp_rewrite->author_base != $this->urlBase) {
            $wp_rewrite->author_base = $this->urlBase;
            $wp_rewrite->author_structure = '/' . $wp_rewrite->author_base . '/%author%';

            flush_rewrite_rules();
        }
    }

    /**
     * Set the page title for author page
     * @param string $title       The original title
     * @param string $sep         The separator character
     * @param string $seplocation The separator location
     * @return  string [<description>]
     */
    public function setProfileTitle($title, $sep, $seplocation)
    {
        if (is_author()) {
            $title = municipio_intranet_get_user_full_name(get_the_author_meta('ID'));

            switch ($seplocation) {
                case 'right':
                    $title .= ' ' . $sep . ' ';
                    break;

                case 'left':
                    $title = ' ' . $sep . ' ' . $title;
            }
        }

        return $title;
    }

    /**
     * Adds edit page
     * @return void
     */
    public function editProfileUrlRewrite()
    {
        add_rewrite_rule('^' . $this->urlBase .'\/([a-zA-Z0-9_-]+)\/edit', 'index.php?author_name=$matches[1]&editprofile=true&modularity_template=author-edit', 'top');
        add_rewrite_tag('%editprofile%', 'true');
        add_rewrite_tag('%modularity_template%', '(*.)');

        flush_rewrite_rules();
    }
}
