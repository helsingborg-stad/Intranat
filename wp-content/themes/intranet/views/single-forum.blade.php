@extends('templates.master')

@section('content')

<div class="container main-container u-pb-5">
    @include('partials.breadcrumbs')
    <div class="grid">
        @include('partials.sidebar-left')
        <div class="{{ $contentGridSize }}">
            <div class="box forum-box">
                @if (is_single() && is_active_sidebar('content-area-top'))
                    <div class="grid sidebar-content-area sidebar-content-area-top">
                        <?php dynamic_sidebar('content-area-top'); ?>
                    </div>
                @endif
                <div class="grid">
                    <div class="grid-sm-12">
                        @include('partials.blog.type.post-single')
                    </div>
                </div>
                @if ($isMember)
                    <div class="grid">
                        <div class="grid-sm-12">
                            {!! $commentForm !!}
                        </div>
                    </div>
                    @if (isset($comments) && ! empty($comments))
                        <div class="grid">
                            <div class="grid-sm-12 forum-comments">
                                @include('partials.blog.comments')
                            </div>
                        </div>
                    @endif
                @elseif(is_user_logged_in())
                    <a href="#" class="btn btn-primary member-button" data-post-id="{{ $post->ID }}"><i class="pricon pricon-plus-o"></i> <span class="member-button__text"> <?php _e('Join forum', 'municipio-intranet'); ?></span></a>
                @endif
            </div>
        </div>
        @include('partials.sidebar-right')
    </div>
</div>

@stop
