<?php

namespace Intranet\CustomPostType;

use Philo\Blade\Blade as Blade;

class Groups
{
    public static $postTypeSlug = 'intranet-group';
    public static $taxonomySlug = 'group_categories';

    public function __construct()
    {
        add_action('init', array($this, 'registerCustomPostType'));
        add_action('init', array($this, 'registerCategories'));
        add_action('init', array($this, 'addCapabilities'));
        add_action('Municipio/blog/post_info', array($this, 'joinButton'), 9, 1);
        add_action('wp_ajax_join_group', array($this, 'joinGroup'));
        add_action('save_post', array($this, 'createMembersMeta'), 10, 3);

        add_filter('dynamic_sidebar_after', array($this, 'contentAfterSidebar'));
        add_filter('is_active_sidebar', array($this, 'isActiveSidebar'), 11, 2);
        add_filter('Municipio/blog/post_settings', array($this, 'editGroupButton'), 11, 2);
    }

    /**
     * Registers the custom post type
     * @return void
     */
    public function registerCustomPostType()
    {
        if (get_current_blog_id() !== 1) {
            return;
        }

        $nameSingular = __('Group', 'municipio-intranet');
        $namePlural = __('Groups', 'municipio-intranet');
        $icon = 'dashicons-groups';

        $labels = array(
            'name'               => $nameSingular,
            'singular_name'      => $nameSingular,
            'menu_name'          => $namePlural,
            'name_admin_bar'     => $nameSingular,
            'add_new'            => _x('Add New', 'add new button', 'municipio-intranet'),
            'add_new_item'       => sprintf(__('Add new %s', 'municipio-intranet'), $nameSingular),
            'new_item'           => sprintf(__('New %s', 'municipio-intranet'), $nameSingular),
            'edit_item'          => sprintf(__('Edit %s', 'municipio-intranet'), $nameSingular),
            'view_item'          => sprintf(__('View %s', 'municipio-intranet'), $nameSingular),
            'all_items'          => sprintf(__('All %s', 'municipio-intranet'), $namePlural),
            'search_items'       => sprintf(__('Search %s', 'municipio-intranet'), $namePlural),
            'parent_item_colon'  => sprintf(__('Parent %s', 'municipio-intranet'), $namePlural),
            'not_found'          => sprintf(__('No %s', 'municipio-intranet'), $namePlural),
            'not_found_in_trash' => sprintf(__('No %s in trash', 'municipio-intranet'), $namePlural)
        );

        $args = array(
            'labels'               => $labels,
            'description'          => __('Social networking groups.', 'municipio-intranet'),
            'menu_icon'            => $icon,
            'public'               => true,
            'publicly_queryable'   => true,
            'show_ui'              => true,
            'show_in_nav_menus'    => true,
            'menu_position'        => 50,
            'has_archive'          => true,
            'rewrite'              => array(
                'slug'       => sanitize_title(self::$postTypeSlug),
                'with_front' => false
            ),
            'hierarchical'         => false,
            'exclude_from_search'  => false,
            'taxonomies'           => array(self::$taxonomySlug),
            'supports'             => array('title', 'revisions', 'editor', 'thumbnail', 'author', 'comments'),
            'show_in_rest'         => true,
            'rest_base'            => 'groups',
            'map_meta_cap'         => true,
            'capability_type'      => self::$postTypeSlug
        );

        register_post_type(self::$postTypeSlug, $args);
    }

    /**
     * Register Categories taxonomy
     * @return void
     */
    public function registerCategories()
    {
        $nameSingular = 'Category';
        $namePlural = 'Categories';

        $labels = array(
            'name'              => $namePlural,
            'singular_name'     => $nameSingular,
            'search_items'      => sprintf(__('Search %s', 'municipio-intranet'), $namePlural),
            'all_items'         => sprintf(__('All %s', 'municipio-intranet'), $namePlural),
            'parent_item'       => sprintf(__('Parent %s:', 'municipio-intranet'), $nameSingular),
            'parent_item_colon' => sprintf(__('Parent %s:', 'municipio-intranet'), $nameSingular) . ':',
            'edit_item'         => sprintf(__('Edit %s', 'municipio-intranet'), $nameSingular),
            'update_item'       => sprintf(__('Update %s', 'municipio-intranet'), $nameSingular),
            'add_new_item'      => sprintf(__('Add New %s', 'municipio-intranet'), $nameSingular),
            'new_item_name'     => sprintf(__('New %s Name', 'municipio-intranet'), $nameSingular),
            'menu_name'         => $namePlural,
        );

        $args = array(
            'labels'                => $labels,
            'public'                => true,
            'show_in_nav_menus'     => true,
            'show_admin_column'     => true,
            'hierarchical'          => true,
            'show_tagcloud'         => false,
            'show_ui'               => true,
            'query_var'             => true,
            'rewrite'               => array('with_front' => false, 'slug' => self::$taxonomySlug),
            'show_in_rest'          => true,
            'capabilities' => array(
              'manage_terms'=> 'manage_categories',
              'edit_terms'=> 'manage_categories',
              'delete_terms'=> 'manage_categories',
              'assign_terms' => 'read'
            ),
        );

        register_taxonomy(self::$taxonomySlug, self::$postTypeSlug, $args);
    }

    /**
     * Activate sidebar to custom hidden content
     * @param  boolean  $isActiveSidebar Original response
     * @param  string   $sidebar         Sidebar id
     * @return boolean
     */
    public function isActiveSidebar($isActiveSidebar, $sidebar)
    {
        global $post;

        if ((is_post_type_archive(self::$postTypeSlug) ||(is_single() && isset($post->post_type) && $post->post_type == self::$postTypeSlug)) && is_user_logged_in() && $sidebar === 'bottom-sidebar') {
            $isActiveSidebar = true;
        }

        return $isActiveSidebar;
    }

    /**
     * Render custom content after sidebar
     * @param string $sidebar
     */
    public function contentAfterSidebar($sidebar)
    {
        global $post;

        if ((is_post_type_archive(self::$postTypeSlug)
            || $this->canEditGroup($post))
            && is_user_logged_in()
            && $sidebar === 'bottom-sidebar') {
            $data = array();
            $data['postId'] = is_single() && !empty($post->ID) ? $post->ID : '';
            $data['postTitle'] = is_single() ? $post->post_title : '';
            $data['postContent'] = is_single() ? $post->post_content : '';
            $data['formTitle'] = sprintf('%s %s',
                is_single() ? __('Update', 'municipio-intranet') : __('Create', 'municipio-intranet'),
                strtolower(__('Group', 'municipio-intranet'))
            );
            $terms = is_single() && !empty($post->ID) ? wp_get_post_terms($post->ID, self::$taxonomySlug, array('fields' => 'ids')) : '';
            $term = is_array($terms) && !empty($terms[0]) ? $terms[0] : 0;
            $taxArgs = array(
                        'echo'       => 0,
                        'name'       => self::$taxonomySlug,
                        'taxonomy'   => self::$taxonomySlug,
                        'hide_empty' => 0,
                        'orderby'    => 'slug',
                        'selected'   => $term
                    );
            $data['categories'] = wp_dropdown_categories($taxArgs);
            $data['editorSettings'] = array(
                'wpautop' => true,
                'media_buttons' => false,
                'quicktags' => false,
                'textarea_name' => 'content',
                'textarea_rows' => 10,
                    'tinymce' => array(
                        'plugins' => 'wordpress',
                        'statusbar' => false,
                    ),
                );
            $blade = new Blade(INTRANET_PATH . 'views/partials/modal/', WP_CONTENT_DIR . '/uploads/cache/blade-cache');
            echo $blade->view()->make('group-modal', $data)->render();

            $data['editorSettings']['textarea_name'] = 'recipient_email';
            $data['editorSettings']['textarea_rows'] = 1;
            $blade = new Blade(INTRANET_PATH . 'views/partials/modal/', WP_CONTENT_DIR . '/uploads/cache/blade-cache');
            echo $blade->view()->make('invite-modal', $data)->render();
        }
    }

    /**
     * Add edit button to the post settings dropdown
     * @param array  $settingItems Setting items
     * @param object $post         Post object
     */
    public function editGroupButton($settingItems, $post)
    {
        if (!$this->canEditGroup($post)) {
            return $settingItems;
        }

        $settingItems[] = '<a href="#modal-target-' . $post->ID . '" class="settings-item" data-action="share-email"><i class="pricon pricon-user pricon-space-right"></i> ' . __('Invite members', 'municipio-intranet') . '</a>';
        $settingItems[] = '<a href="#modal-edit-group" class="settings-item"><i class="pricon pricon-edit pricon-space-right"></i> ' . __('Edit', 'municipio-intranet') . '</a>';
        $settingItems[] = '<a href="#" id="delete-group" data-archive="' . get_post_type_archive_link(self::$postTypeSlug) . '" data-post-id="' . $post->ID . '" class="settings-item"><i class="pricon pricon-minus-o pricon-space-right"></i> ' . __('Remove', 'municipio-intranet') . '</a>';

        return $settingItems;
    }

    /**
     * Check if post is a group and if user has edit capabilities
     * @param  obj $post Post obj
     * @return bool
     */
    public function canEditGroup($post)
    {
        $edit = false;

        $user = wp_get_current_user();
        if (is_single()
            && $post->post_type === self::$postTypeSlug
            && $user
            && ($user->ID == $post->post_author || current_user_can('edit_others_' . self::$postTypeSlug . 's'))) {
            $edit = true;
        }

        return $edit;
    }

    /**
     * Add user capabilities to custom post types
     */
    public function addCapabilities()
    {
        // Subscriber caps
        $role = get_role('subscriber');
        $role->add_cap('read_' . self::$postTypeSlug);
        $role->add_cap('publish_' . self::$postTypeSlug . 's');
        $role->add_cap('edit_' . self::$postTypeSlug);

        $role->remove_cap('edit_others_' . self::$postTypeSlug . 's');
        $role->remove_cap('delete_others_' . self::$postTypeSlug . 's');

        // Add full caps to admins and editors
        $userRoles = array('administrator', 'editor');
        foreach ($userRoles as $userRole) {
            $role = get_role($userRole);
            $role->add_cap('edit_' . self::$postTypeSlug);
            $role->add_cap('read_' . self::$postTypeSlug);
            $role->add_cap('delete_' . self::$postTypeSlug);
            $role->add_cap('edit_' . self::$postTypeSlug . 's');
            $role->add_cap('edit_others_' . self::$postTypeSlug . 's');
            $role->add_cap('publish_' . self::$postTypeSlug . 's');
            $role->add_cap('read_private_' . self::$postTypeSlug . 's');
            $role->add_cap('delete_' . self::$postTypeSlug . 's');
            $role->add_cap('delete_private_' . self::$postTypeSlug . 's');
            $role->add_cap('delete_published_' . self::$postTypeSlug . 's');
            $role->add_cap('delete_others_' . self::$postTypeSlug . 's');
            $role->add_cap('edit_private_' . self::$postTypeSlug . 's');
            $role->add_cap('edit_published_' . self::$postTypeSlug . 's');
        }
    }

    /**
     * Adds/removes member from a group
     * @return void
     */
    public function joinGroup()
    {
        ignore_user_abort(true);
        $user = wp_get_current_user();

        if (empty($_POST['postId']) || !$user) {
            wp_die();
        }

        $postId = (int)$_POST['postId'];
        $members = get_post_meta($postId, 'group_members', true);

        if (is_array($members)) {
            if (array_key_exists($user->ID, $members)) {
                // Proceed if users status is not 2 (= banned)
                if ($members[$user->ID] != 2) {
                    $members[$user->ID] = $members[$user->ID] == 1 ? 0 : 1;
                }
            } else {
                $members[$user->ID] = 1;
            }
        } else {
            $members = array($user->ID => 1);
        }

        update_post_meta($postId, 'group_members', $members);
        echo('Done');
        wp_die();
    }

    /**
     * Filter for adding post info items
     * @param  array $items Default item array
     * @return array        Modified item array
     */
    public function joinButton($post)
    {
        // Bail if user is not logged in or wrong post type
        if (!is_user_logged_in() || $post->post_type !== self::$postTypeSlug) {
            return;
        }

        $user = wp_get_current_user();
        $members = get_post_meta($post->ID, 'group_members', true);
        $isMember = isset($members[$user->ID]) && $members[$user->ID] == 1 ? 1 : 0;

        echo '<li><a href="#" class="member-button ' . ($isMember ? 'member-button--is-member' : '') . ' " data-post-id="' . $post->ID . '"><i class="pricon ' . ($isMember ? 'pricon-minus-o' : 'pricon-plus-o') . '"></i> <span class="member-button__text">' . ($isMember ? __('Leave group', 'notification-center') : __('Join group', 'notification-center')) . '</span></a></li>';
    }

    /**
     * Add member metadata when a post is created
     * @param int $postId The post ID.
     * @param post $post The post object.
     * @param bool $update Whether this is an existing post being updated or not.
     */
    public function createMembersMeta($postId, $post, $update)
    {
        // Bail if notifications is not activated or is update
        if ($update || $post->post_type !== self::$postTypeSlug) {
            return;
        }

        add_post_meta($postId, 'group_members', array($post->post_author => 1), true);
    }
}
