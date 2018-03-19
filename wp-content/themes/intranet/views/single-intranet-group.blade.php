@extends('templates.master')

@section('content')

<div class="container main-container">
    @include('partials.breadcrumbs')

    <div class="grid">

        @include('partials.sidebar-left')

        <div class="{{ $contentGridSize }}">
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
                        @include('partials.blog.group-comments-form')
                    </div>
                </div>
                @if(isset($comments) && ! empty($comments))
                    <div class="grid">
                        <div class="grid-sm-12 group-comments">
                            @include('partials.blog.comments')
                        </div>
                    </div>
                @endif
            @endif
        </div>

        @include('partials.sidebar-right')

    </div>
</div>

@stop
