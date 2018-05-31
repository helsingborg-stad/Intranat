@extends('templates.master')

@section('content')

@if (municipio_intranet_user_has_birthday())
<div class="notice-birthday">

    <div class="container">
        <div class="grid">
            <div class="grid-md-12 gutter gutter-bottom">
                <figure class="illustration-birthday">
                    <i class="pricon pricon-balloon pricon-3x"></i>
                    <i class="pricon pricon-balloon pricon-4x"></i>
                    <i class="pricon pricon-balloon pricon-3x"></i>
                </figure>
                <span class="h2 no-padding"><?php echo sprintf('Säg grattis, idag fyller %s år!', get_the_author_meta('first_name')); ?></span>
            </div>
        </div>
    </div>
</div>
@endif

<header class="profile-header">
    <div class="profile-header-background">
        <div style="background-image:url('{{ $cover_img }}');"></div>
    </div>

    <div class="container">
        <div class="grid">
            <div class="grid-xs-12">
                <div class="profile-header-content">
                    @if (!empty($profile_img) && is_array($profile_img))
                        <img class="profile-image" src="{{$profile_img[2]}}"
                            srcset="
                                {{ $profile_img[2] }} 1x,
                                {{ $profile_img[3] }} 2x">
                    @elseif (!empty($profile_img))
                        <img class="profile-image" src="{{ $profile_img }}">
                    @endif

                    <h1 class="profile-fullname">{{ municipio_intranet_get_user_full_name(get_the_author_meta('ID')) }}</h1>
                    @if (!empty(get_the_author_meta('ad_title')))
                         <span class="profile-title">{{ get_the_author_meta('ad_title') }}</span>
                    @elseif (!empty(get_the_author_meta('user_work_title')))
                        <span class="profile-title">{{ get_the_author_meta('user_work_title') }}</span>
                    @endif

                    @if (!empty(get_the_author_meta('user_administration_unit')) || !empty(get_the_author_meta('user_department')))
                        <span class="profile-department">
                        @if (!empty(get_the_author_meta('user_administration_unit')))
                            @foreach ((array) get_the_author_meta('user_administration_unit') as $unit)
                                {{ municipio_intranet_get_administration_unit_name($unit) }},
                            @endforeach
                        @endif

                        {{ !empty(get_the_author_meta('user_department')) ? get_the_author_meta('user_department') : '' }}
                        </span>
                    @endif

                    @if (!empty(get_the_author_meta('user_facebook_url')) || !empty(get_the_author_meta('user_linkedin_url')) || !empty(get_the_author_meta('user_instagram_username')) || !empty(get_the_author_meta('user_twitter_username')))
                    <ul class="profile-social-networks nav-horizontal">
                        @if (!empty(get_the_author_meta('user_facebook_url')))
                        <li><a href="{{ get_the_author_meta('user_facebook_url') }}" data-tooltip="<?php _e('My profile on Facebook', 'municipio-intranet'); ?>"><i class="pricon pricon-facebook"></i><span class="sr-only"><?php _e('My profile on Facebook', 'municipio-intranet'); ?></span></a></li>
                        @endif
                        @if (!empty(get_the_author_meta('user_linkedin_url')))
                        <li><a href="{{ get_the_author_meta('user_linkedin_url') }}" data-tooltip="<?php _e('My profile on LinkedIn', 'municipio-intranet'); ?>"><i class="pricon pricon-linkedin"><span class="sr-only"><?php _e('My profile on Instagram', 'municipio-intranet'); ?></span></i></a></li>
                        @endif
                        @if (!empty(get_the_author_meta('user_instagram_username')))
                        <li><a href="https://instagram.com/{{ get_the_author_meta('user_instagram_username') }}" data-tooltip="<?php _e('My profile on Instagram', 'municipio-intranet'); ?>"><i class="pricon pricon-instagram"></i><span class="sr-only"><?php _e('My profile on Twitter', 'municipio-intranet'); ?></span></a></li>
                        @endif
                        @if (!empty(get_the_author_meta('user_twitter_username')))
                        <li><a href="https://twitter.com/{{ get_the_author_meta('user_twitter_username') }}" data-tooltip="<?php _e('My profile on Twitter', 'municipio-intranet'); ?>"><i class="pricon pricon-twitter"></i><span class="sr-only"><?php _e('My profile on Snapchat', 'municipio-intranet'); ?></span></a></li>
                        @endif
                    </ul>
                    @endif

                    @if (get_the_author_meta('user_hometown') && get_the_author_meta('user_hide_birthday') !== true)
                    <ul class="nav-horizontal gutter gutter-top">
                        @if (get_the_author_meta('user_hometown'))
                        <li><i class="pricon pricon-home" style="position: relative;top: -1px;"></i> {{ get_the_author_meta('user_hometown') }}</li>
                        @endif

                        @if (get_the_author_meta('user_hide_birthday') !== true && municipio_intranet_user_birthday(get_the_author_meta('ID')))
                        <li><i class="pricon pricon-cake" style="position: relative;top: -1px;"></i> {{ municipio_intranet_user_birthday(get_the_author_meta('ID')) }}</li>
                        @endif
                    </ul>
                    @endif

                    @if (get_current_user_id() == get_the_author_meta('ID') || is_super_admin())
                    <ul class="profile-actions">
                        <li><a href="{{ municipio_intranet_get_user_profile_edit_url(get_the_author_meta('user_login')) }}" class="btn btn-sm"><i class="pricon pricon-settings"></i> <?php _e('Edit settings', 'municipio-intranet'); ?></a></li>
                    </ul>
                    @endif
                </div>
            </div>
        </div>
    </div>

    <ul class="profile-contact nav-horizontal">
        @if (!empty(get_the_author_meta('user_phone')))
        <li>
            <a href="tel:{{ get_the_author_meta('user_phone') }}">
                <i class="pricon pricon-phone pricon-2x"></i>
                <span class="value">
                    {{ get_the_author_meta('user_phone') }}
                    <span class="value-label"><i class="pricon pricon-phone"></i> <?php _e('Phone number', 'municipio-intranet'); ?></span>
                </span>
            </a>
        </li>
        @endif

        @if (!empty(get_the_author_meta('user_phone')))
        <li>
            <a href="mailto:{{ get_the_author_meta('email') }}">
                <i class="pricon pricon-email pricon-2x"></i>
                <span class="value">
                    {{ get_the_author_meta('email') }}
                    <span class="value-label"><i class="pricon pricon-email"></i> <?php _e('Email', 'municipio-intranet'); ?></span>
                </span>
            </a>
        </li>
        @endif

        @if ((isset(get_the_author_meta('user_visiting_address')['street']) && !empty(get_the_author_meta('user_visiting_address')['street'])) || (isset(get_the_author_meta('user_visiting_address')['city']) && !empty(get_the_author_meta('user_visiting_address')['city'])))
        <li>
            @if (isset(get_the_author_meta('user_visiting_address')['street']) && isset(get_the_author_meta('user_visiting_address')['city']))
            <a href="//www.google.com/maps?q={{ urlencode(get_the_author_meta('user_visiting_address')['street']) }} {{ urlencode(get_the_author_meta('user_visiting_address')['city']) }}">
            @else
            <a href="#" data-dropdown=".visiting-address-dropdown">
            @endif
                <i class="pricon pricon-location-pin pricon-2x"></i>
                <span class="value">
                    @if (isset(get_the_author_meta('user_visiting_address')['workplace']) && !empty(get_the_author_meta('user_visiting_address')['workplace']))
                        {{ get_the_author_meta('user_visiting_address')['workplace'] }}
                    @elseif (isset(get_the_author_meta('user_visiting_address')['street']) && !empty(get_the_author_meta('user_visiting_address')['street']))
                        {{ get_the_author_meta('user_visiting_address')['street'] }}
                    @else
                        {{ get_the_author_meta('user_visiting_address')['city'] }}
                    @endif

                    <span class="value-label"><i class="pricon pricon-location-pin"></i> <?php _e('Visiting address', 'municipio-intranet'); ?></span>
                </span>
            </a>
            <div class="visiting-address-dropdown clearfix">
                {{ isset(get_the_author_meta('user_visiting_address')['workplace']) ? get_the_author_meta('user_visiting_address')['workplace'] : '' }}<br>
                {{ isset(get_the_author_meta('user_visiting_address')['street']) ? get_the_author_meta('user_visiting_address')['street'] : '' }}<br>
                {{ isset(get_the_author_meta('user_visiting_address')['city']) ? get_the_author_meta('user_visiting_address')['city'] : '' }}
            </div>
        </li>
        @endif
    </ul>
</header>

<div class="container main-container u-pb-8">
    <div class="grid">
        <div class="grid-md-12">
            @if (get_the_author_meta('user_about'))
            <div class="grid">
                <div class="grid-md-12">
                    <article>
                        {!! wpautop(get_the_author_meta('user_about')) !!}
                    </article>
                </div>
            </div>
            @endif

            @if (count($userSkills) > 0 || count($userResponsibilities) > 0)
            <div class="grid">
                @if (count($userSkills) > 0)
                <div class="grid-md-6">
                    <div class="box box-panel box-panel-secondary">
                        <h4 class="box-title"><?php _e('Skills', 'municipio-intranet'); ?></h4>
                        <div class="box-content">
                            <ul class="tags">
                                @foreach ($userSkills as $item)
                                <li><div class="tag">{{ $item }}</div></li>
                                @endforeach
                            </ul>
                        </div>
                    </div>
                </div>
                @endif

                @if (count($userResponsibilities) > 0)
                <div class="grid-md-6">
                    <div class="box box-panel box-panel-secondary">
                        <h4 class="box-title"><?php _e('Work assignments', 'municipio-intranet'); ?></h4>
                        <div class="box-content">
                            <ul class="tags">
                                @foreach ($userResponsibilities as $item)
                                <li><div class="tag">{{ $item }}</div></li>
                                @endforeach
                            </ul>
                        </div>
                    </div>
                </div>
                @endif

                @if (is_array($groups) && !empty($groups))
                <div class="grid-md-6">
                    <div class="box box-panel box-panel-secondary">
                        <h4 class="box-title"><?php _ex('Participating in discussions', 'User profile', 'municipio-intranet'); ?></h4>
                        <ul>
                            @foreach ($groups as $group)
                            <li>
                                <a href="{{ get_permalink($group) }}" class="link-item">{{ get_the_title($group) }}</a></li>
                            </li>
                            @endforeach
                        </ul>
                    </div>
                </div>
                @endif

                @if (is_array($submittedIdeas) && !empty($submittedIdeas))
                <div class="grid-md-6">
                    <div class="box box-panel box-panel-secondary">
                        <h4 class="box-title"><?php _ex('Submitted ideas', 'User profile', 'municipio-intranet'); ?></h4>
                        <ul>
                            @foreach ($submittedIdeas as $idea)
                            <li>
                                <a href="{{ get_permalink($idea->ID) }}" class="link-item">{{ $idea->post_title }}</a></li>
                            </li>
                            @endforeach
                        </ul>
                    </div>
                </div>
                @endif
            </div>
            @endif
        </div>
    </div>
</div>

@stop
