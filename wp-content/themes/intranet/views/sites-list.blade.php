@extends('templates.master')

@section('content')

<div class="container main-container u-pb-5">

    <div class="grid">
        <div class="grid-xs-12 u-mb-4">
            <article>
                <h1><?php _e('All intranets', 'municipio-intranet'); ?></h1>
                <p>
                    <?php _e('This is a list of available intranets. You can follow or unfollow them by clicking the follow/unfollow buttons. Intranets missing the follow/unfollow buttons are marked as mandatory and can therefor not be unfollowed.', 'municipio-intranet'); ?>
                </p>
            </article>
        </div>
    </div>

    <div class="grid grid--columns" data-equal-container>

        @foreach (\Intranet\Helper\Multisite::getSitesList(true) as $site)
            @if ($site->is_forced === true)
                <div class="grid-md-4">
                    <div class="box box-index creamy" data-equal-item>
                        <div class="box-content">
                            <h5 class="box-index-title link-item"><a href="{{ $site->path }}">{!! municipio_intranet_format_site_name($site) !!}</a></h5>
                            @if (!empty($site->description))
                            <p>{{ $site->description }}</p>
                            @endif
                        </div>
                    </div>
                </div>
            @endif
        @endforeach

        @foreach (\Intranet\Helper\Multisite::getSitesList(true) as $site)
            @if ($site->is_forced != true)
                <div class="grid-md-4">
                    <div class="box box-index" data-equal-item>
                        <div class="box-content">
                            <h5 class="box-index-title link-item"><a href="{{ $site->path }}">{!! municipio_intranet_format_site_name($site) !!}</a></h5>
                            @if (!empty($site->description))
                            <p>{{ $site->description }}</p>
                            @endif

                            @if (is_user_logged_in() && !is_author())
                            <p>
                                {{ municipio_intranet_follow_button($site->blog_id) }}
                            </p>
                            @endif
                        </div>
                    </div>
                </div>
            @endif
        @endforeach
    </div>
</div>

@stop
