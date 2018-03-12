@extends('templates.master')

@section('content')

<div class="container main-container">

    <div class="grid">
        <div class="grid-md-12">

            <div class="grid">
                <div class="grid-xs-12">
                    <h1>{{ get_the_archive_title() }}</h1>
                    @include('partials.accessibility-menu')
                </div>
            </div>

            <div class="grid">
                @if (have_posts())
                    <?php $postNum = 0; ?>
                    @while(have_posts())
                        {!! the_post() !!}

                        @if (in_array($template, array('full', 'compressed', 'collapsed', 'horizontal-cards')))
                            <div class="grid-xs-12 post">
                                @include('partials.blog.type.post-' . $template)
                            </div>
                        @else
                            @include('partials.blog.type.post-' . $template)
                        @endif

                        <?php $postNum++; ?>
                    @endwhile
                @else
                    <div class="grid-xs-12">
                        <div class="notice info pricon pricon-info-o pricon-space-right"><?php _e('No posts to show', 'municipio'); ?>…</div>
                    </div>
                @endif
            </div>

            <div class="grid">
                <div class="grid-sm-12 text-center">
                    {!!
                        paginate_links(array(
                            'type' => 'list'
                        ))
                    !!}
                </div>
            </div>
        </div>

        @include('partials.sidebar-right')
    </div>
</div>

@stop

