<section class="creamy creamy-border-bottom gutter-vertical gutter-lg clearfix">
    <div class="container">
        <div class="gid">
            <div class="grid-lg-12">
                {!! get_search_form() !!}
            </div>
        </div>
    </div>
</section>
<section>
    <div class="container gutter gutter-xl gutter-top">
        <div class="grid">
            <div class="grid-md-9">
                <?php
                if ($resultCount === 0 || $level === 'users') {
                    do_action('loop_start');
                }
                ?>
                @if ($resultCount === 0)
                    <div class="notice info">
                        <i class="pricon pricon-info-o"></i> <?php _e('Found no matching results on your search…', 'municipio'); ?>
                    </div>
                @else
                    <div class="grid">
                        <div class="grid-lg-12">
                            @include('partials.search.user')
                        </div>
                    </div>
                @endif
            </div>
            <div class="grid-md-3">
                <a href="{{ get_search_link() }}" class="btn btn-primary btn-lg btn-block"><i class="pricon pricon-left-skinny-arrow"></i> <?php _e("Back to search results", 'municipio'); ?></a>
            </div>
        </div>
    </div>
</section>
