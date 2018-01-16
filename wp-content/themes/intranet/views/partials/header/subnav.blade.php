<nav class="subnav clearfix">
    <ul class="nav nav-horizontal">
        <li class="subnav-icon hidden-xs hidden-sm"><a href="?walkthrough" data-tooltip="<?php _e('Start help walkthrough', 'municipio-intranet'); ?>"><i class="pricon pricon-question-o pricon-lg"></i><span class="sr-only"><?php _e('Help', 'municipio-intranet'); ?></span></a></li>
        <li class="hidden-xs hidden-sm subnav-a-z">
            <a href="{{ municipio_table_of_contents_url() }}"><?php _e('A-Z', 'municipio-intranet'); ?></a>
            <?php
                echo municipio_intranet_walkthrough(
                    __('A-Z', 'municipio-intranet'),
                    __('Click here to show the contents of the intranet in alphabetic order. For example: If you are looking for information about salary, look below the letter S. You can select to view information from all intranets or just from specifically selected intranets.', 'municipio-intranet'),
                    '.subnav-a-z'
                );
            ?>
        </li>

        @if ($currentUser->ID > 0)
            <li>
                <a href="#" data-dropdown=".login-dropdown">
                    @if (get_the_author_meta('user_profile_picture', get_current_user_id()))
                    <?php
                        $croppedProfileImage = \Municipio\Helper\Image::resize(get_the_author_meta('user_profile_picture', get_current_user_id()), 50, 50);
                    ?>
                    <span class="profile-image profile-image-icon inline-block" style="background-image:url('{{ $croppedProfileImage }}');"></span>
                    @else
                    <i class="pricon pricon-user-o pricon-lg hidden-md hidden-lg"></i>
                    @endif
                    <span class="hidden-sm hidden-xs">{{ municipio_intranet_get_first_name($currentUser->ID) }}</span> <i class="pricon pricon-caret-down pricon-xs"></i></span>
                </a>




                <ul class="dropdown-menu login-dropdown dropdown-menu-arrow dropdown-menu-arrow-right">
                    <li><a href="{{ municipio_intranet_get_user_profile_url() }}" class="pricon pricon-space-right pricon-user-o"><?php _e('Your profile', 'municipio-intranet'); ?></a></li>
                    <li><a href="{{ municipio_intranet_get_user_profile_edit_url() }}" class="pricon pricon-space-right pricon-settings"><?php _e('Settings'); ?></a></li>
                    <li><a href="{{ municipio_intranet_get_user_manage_subscriptions_url() }}" class="pricon pricon-space-right pricon-heart"><?php _e('Subscriptions', 'municipio-intranet'); ?></a></li>

                    <?php $unit = \Intranet\User\AdministrationUnits::getUsersAdministrationUnitIntranet(); ?>

                    @if (is_object($unit) && !empty($unit) && isset($unit->path))
                        <li><a href="{{ home_url($unit->path) }}" class="pricon pricon-space-right pricon-home"><?php _e('Go to my intranet', 'municipio-intranet'); ?>
                            @if (isset($unit->short_name))
                                &#40;{{$unit->short_name}}&#41;
                            @endif
                        </a></li>
                    @endif

                    <li class="divider"></li>
                    <li><a href="{{ wp_logout_url() }}" class="pricon pricon-space-right pricon-standby"><?php _e('Log out'); ?></a></li>
                </ul>
            </li>
        @else
            <li>
                <a href="#" data-dropdown=".login-dropdown" {!! isset($_GET['login']) && $_GET['login'] == 'failed' ? 'class="dropdown-open"' : '' !!}>
                    <?php _e('Log in'); ?> <i class="fa fa-caret-down"></i>
                </a>
                <div class="dropdown-menu dropdown-menu-arrow dropdown-menu-arrow-right login-dropdown" {!! isset($_GET['login']) && $_GET['login'] == 'failed' ? 'style="display: block;"' : '' !!}>
                    <div class="gutter">
                        @if (isset($_GET['login']) && $_GET['login'] == 'failed')
                        <div class="gutter gutter-bottom"><div class="notice notice-sm danger"><?php _e('Login failed. Please try again.', 'municipio-intranet'); ?></div></div>
                        @endif
                        @include('partials.user.loginform')
                    </div>
                </div>
            </li>
        @endif

        <li class="{!! apply_filters('Municipio/mobile_menu_breakpoint','hidden-md hidden-lg'); !!}">
            @if (strlen($navigation['mobileMenu']) > 0)
                <a href="#mobile-menu" class=" menu-trigger" data-target="#mobile-menu"><span class="menu-icon"></span> <?php _e('Menu', 'municipio'); ?></a>
            @endif
        </li>
    </ul>
</nav>
