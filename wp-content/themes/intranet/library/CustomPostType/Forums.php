<?php

namespace Intranet\CustomPostType;

use Philo\Blade\Blade as Blade;

class Forums
{
    public static $postTypeSlug = 'forum';
    public static $taxonomySlug = 'forum_subjects';

    public function __construct()
    {
        add_action('init', array($this, 'registerCustomPostType'));
        add_action('init', array($this, 'registerCategories'));
        add_action('init', array($this, 'addCapabilities'));
        add_action('Municipio/blog/post_info', array($this, 'joinButton'), 8, 1);
        add_action('wp_ajax_join_forum', array($this, 'joinForum'));
        add_action('save_post', array($this, 'createMembersMeta'), 10, 3);
        add_action('comment_post', array($this, 'uploadCommentFiles'));

        add_filter('comment_text', array($this, 'displayAttachments'), 10, 2);
        add_filter('comment_form_field_comment', array( $this, 'displayFileInput'));
        add_filter('dynamic_sidebar_after', array($this, 'contentAfterSidebar'));
        add_filter('is_active_sidebar', array($this, 'isActiveSidebar'), 11, 2);
        add_filter('Municipio/blog/post_settings', array($this, 'editForumButton'), 11, 2);
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

        $nameSingular = __('Discussion forum', 'municipio-intranet');
        $namePlural = __('Discussion forums', 'municipio-intranet');
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
            'description'          => __('Discussion forums.', 'municipio-intranet'),
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
            'rest_base'            => 'forums',
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
        $nameSingular = __('Subject', 'municipio-intranet');
        $namePlural = __('Subjects', 'municipio-intranet');

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

        if ((is_post_type_archive(self::$postTypeSlug) ||(is_single() && isset($post->post_type) && $post->post_type == self::$postTypeSlug)) && is_user_logged_in() && ($sidebar === 'bottom-sidebar' ||$sidebar === 'right-sidebar')) {
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
            || (is_single() && $post->post_type == self::$postTypeSlug))
            && is_user_logged_in()
            && $sidebar === 'bottom-sidebar') {
            $this->bottomSidebarContent($post);
        }

        if (is_single()
            && $post->post_type == self::$postTypeSlug
            && is_user_logged_in()
            && $sidebar === 'right-sidebar') {
            $this->rightSidebarContent($post);
        }
    }

    public function bottomSidebarContent($post)
    {
        $data = array();
        $data['postId'] = is_single() && !empty($post->ID) ? $post->ID : '';
        $data['postTitle'] = is_single() ? $post->post_title : '';
        $data['postContent'] = is_single() ? $post->post_content : '';
        $data['formTitle'] = sprintf('%s %s',
                is_single() ? __('Update', 'municipio-intranet') : __('Create', 'municipio-intranet'),
                strtolower(__('Forum', 'municipio-intranet'))
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
        $data['members'] = $this->getMembers($post->ID);
        $blade = new Blade(INTRANET_PATH . 'views/partials/modal/', WP_CONTENT_DIR . '/uploads/cache/blade-cache');
        // Add create/edit forum modal
        if (is_post_type_archive(self::$postTypeSlug) ||(is_single() && $this->canEditForum($post))) {
             echo $blade->view()->make('forum-modal', $data)->render();
        }

        $data['editorSettings']['textarea_name'] = 'recipient_email';
        $data['editorSettings']['textarea_rows'] = 1;
        // Add invite modal for members
        if (is_single() && $this->isForumMember($post->ID)) {
            echo $blade->view()->make('invite-modal', $data)->render();
        }
        // Add members modal for all logged in users
        if (is_single()) {
            echo $blade->view()->make('forum-members-modal', $data)->render();
        }
    }

    public function rightSidebarContent($post)
    {
        $members = $this->getMembers($post->ID);

        $data = array();
        $data['post'] = $post;
        $data['isMember'] = $this->isForumMember($post->ID);
        $data['members'] = $members;
        shuffle($members);
        $data['randomMembers'] = array_slice($members, 0, 5);

        $blade = new Blade(INTRANET_PATH . 'views/partials/forum/', WP_CONTENT_DIR . '/uploads/cache/blade-cache');
        echo $blade->view()->make('forum-sidebar', $data)->render();
    }

    public function getMembers($postId)
    {
        $members = get_post_meta($postId, 'forum_members', true);
        if (is_array($members) && !empty($members)) {
            $members = array_map(function($a) {
                if (get_the_author_meta('user_profile_picture', $a)) {
                    $image = '<img src="' . get_the_author_meta('user_profile_picture', $a) . '">';
                } else {
                    $image = '<i class="pricon pricon-3x pricon-user-o"></i>';
                }

                $a = array(
                    'id' => $a,
                    'name' => municipio_intranet_get_user_full_name($a),
                    'url' => municipio_intranet_get_user_profile_url($a),
                    'administrationUnit' => \Intranet\User\AdministrationUnits::getUsersAdministrationUnitIntranet($a),
                    'image' => $image,
                );

                return $a;
            }, array_keys(array_filter($members, function($a) {
                return $a == 1;
            })));
        }

        return $members;
    }

    /**
     * Add edit button to the post settings dropdown
     * @param array  $settingItems Setting items
     * @param object $post         Post object
     */
    public function editForumButton($settingItems, $post)
    {
        if (!$this->canEditForum($post)) {
            return $settingItems;
        }

        $settingItems[] = '<a href="#modal-edit-forum" class="settings-item"><i class="pricon pricon-edit pricon-space-right"></i> ' . __('Edit', 'municipio-intranet') . '</a>';
        $settingItems[] = '<a href="#" id="delete-forum" data-archive="' . get_post_type_archive_link(self::$postTypeSlug) . '" data-post-id="' . $post->ID . '" class="settings-item"><i class="pricon pricon-minus-o pricon-space-right"></i> ' . __('Remove', 'municipio-intranet') . '</a>';

        return $settingItems;
    }

    /**
     * Check if post is a forum and if user has edit capabilities
     * @param  obj $post Post obj
     * @return bool
     */
    public function canEditForum($post)
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
        $role->add_cap('edit_' . self::$postTypeSlug);
        $role->add_cap('read_' . self::$postTypeSlug);
        $role->add_cap('delete_' . self::$postTypeSlug);
        $role->add_cap('edit_' . self::$postTypeSlug . 's');
        $role->add_cap('publish_' . self::$postTypeSlug . 's');
        $role->add_cap('read_private_' . self::$postTypeSlug . 's');
        $role->add_cap('delete_' . self::$postTypeSlug . 's');
        $role->add_cap('delete_private_' . self::$postTypeSlug . 's');
        $role->add_cap('delete_published_' . self::$postTypeSlug . 's');
        $role->add_cap('edit_private_' . self::$postTypeSlug . 's');
        $role->add_cap('edit_published_' . self::$postTypeSlug . 's');

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
     * Adds/removes member from a forum
     * @return void
     */
    public function joinForum()
    {
        ignore_user_abort(true);
        $user = wp_get_current_user();

        if (empty($_POST['postId']) || !$user) {
            wp_die();
        }

        $postId = (int) $_POST['postId'];
        $members = get_post_meta($postId, 'forum_members', true);

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

        update_post_meta($postId, 'forum_members', $members);
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

        $isMember = $this->isForumMember($post->ID);
        echo '<li><a href="#" class="member-button ' . ($isMember ? 'member-button--is-member' : '') . ' " data-post-id="' . $post->ID . '"><i class="pricon ' . ($isMember ? 'pricon-minus-o' : 'pricon-plus-o') . '"></i> <span class="member-button__text">' . ($isMember ? __('Leave forum', 'municipio-intranet') : __('Join forum', 'municipio-intranet')) . '</span></a></li>';
    }

    public function isForumMember($postId)
    {
        if (!is_user_logged_in()) {
            return false;
        }

        $user = wp_get_current_user();
        $members = get_post_meta($postId, 'forum_members', true);
        return isset($members[$user->ID]) && $members[$user->ID] == 1 ? true : false;
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

        add_post_meta($postId, 'forum_members', array($post->post_author => 1), true);
    }

    /**
     * Display attachments with comment
     * @param  string $commentText Comment content
     * @param  obj $commentObj     Comment object
     * @return string              Modified comment
     */
    public function displayAttachments($commentText, $commentObj)
    {
        if (get_post_type($commentObj->comment_post_ID) != self::$postTypeSlug) {
            return $commentText;
        }

        $attachments = get_comment_meta($commentObj->comment_ID, 'attachments', true);
        if (is_array($attachments) && !empty($attachments)) {
            $uploadFolder = wp_upload_dir();
            $uploadFolder = $uploadFolder['baseurl'] . '/forums/';

            foreach ($attachments as $attachment) {
                $filePath = $uploadFolder . basename($attachment);
                $fileName = basename($attachment) ;
                $commentText .= '<p><a href="' . $filePath . '" class="link-item link" target="_blank">' . $fileName . '</a></p>';
            }
        }

        return $commentText;
    }

    /**
     * Saves attachments as comment meta
     * @param  int $commentId COmment ID
     * @return void
     */
    public function uploadCommentFiles($commentId)
    {
        if (!empty($_FILES)) {
            $files = $this->uploadFiles($_FILES, $commentId);

            if (!empty($files)) {
                add_comment_meta($commentId, 'attachments', $files);
            }
        }
    }

    /**
     * Uploads comment attachments
     * @param  array $fileslist
     * @param  int   $formId
     * @return array
     */
    public function uploadFiles($filesList, $commentId)
    {
        $uploadsFolder = wp_upload_dir();
        $uploadsFolder = $uploadsFolder['basedir'] . '/forums';
        $this->createFolder($uploadsFolder);
        $allowedTypes = array('.jpeg', '.jpg', '.png', '.gif', '.mov', '.webm', '.mp4', '.avi', '.mpeg4', '.mp3', '.ogg', '.aac', '.doc', '.docx', '.xls', '.xlsx', '.pdf');
        $uploaded = array();

        foreach ($filesList as $files) {
            for ($i = 0; $i < count($files['name']); $i++) {
                if (empty($files['name'][$i])) {
                    continue;
                }

                $targetFile = $uploadsFolder . '/' . uniqid() . '-' . basename($files['name'][$i]);
                $fileext = strtolower(pathinfo($targetFile, PATHINFO_EXTENSION));
                if (!in_array('.' . $fileext, $allowedTypes)) {
                    continue;
                }

                // Upload file to server
                if (move_uploaded_file($files['tmp_name'][$i], $targetFile)) {
                    $uploaded[] = $targetFile;
                }
            }
        }

        return $uploaded;
    }

   /**
     * Create upload folder if needed
     * @param  string $path
     * @return string
     */
    public function createFolder(string $path) : string
    {
        if (file_exists($path)) {
            return $path;
        }

        mkdir($path, 0777, true);
        return $path;
    }

    /**
     * Adds file input to comment form
     * @param  string $commentField Comment input field
     * @return string Modified markup
     */
    public function displayFileInput($commentField)
    {
        global $post;

        if (isset($post->post_type) && $post->post_type == self::$postTypeSlug) {
            $commentField .= '<div class="form-group gutter gutter-top">
                <label for="files">' . __('Attach files', 'municipio-intranet') . '</label>
                <ul class="input-files" data-max="1">
                    <li><label class="input-file">
                        <input type="file" name="files[]" accept=".jpg,.png,.gif,.mov,.webm,.mp4,.mp3,.ogg,.aac,.doc,.docx,.xls,.xlsx,.pdf" multiple>
                        <span class="btn">' . __('Select file', 'municipio-intranet') . '</span>
                        <span class="input-file-selected">' . __('No file chosen', 'municipio-intranet') . '</span>
                    </label></li>
                </ul>
                </div>';
        }

        return $commentField;
    }
}
