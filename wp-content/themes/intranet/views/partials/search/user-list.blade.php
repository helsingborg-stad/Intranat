<div class="search-level">
    <div class="container">
        <div class="grid">
            <div class="grid-xs-12">
                <nav>
                    <?php
                        echo municipio_intranet_walkthrough(
                            __('Search', 'municipio-intranet'),
                            __('Select if you want to see results from all intranets, the intranets that you are following, the intranet you\'re currently browsing or collegues. The numbers shows how many results earch category have.', 'municipio-intranet'),
                            '.search-level'
                        );
                    ?>

                    <ul class="nav nav-horizontal">
                        <li class="title"><?php _e('Filter search by', 'municipio-intranet'); ?>:</li>

                        <li class="{{ $level == 'all' ||empty($level) ? 'active' : '' }}">
                            <a href="{{ home_url() }}?s={{ urlencode(get_search_query()) }}&amp;level=all">
                                <?php _e('Innehåll', 'municipio-intranet'); ?>
                            </a>
                        </li>

                        @if (is_user_logged_in())
                        <li class="{{ $level == 'users' ? 'active' : '' }}">
                            <a href="{{ home_url() }}?s={{ urlencode(get_search_query()) }}&amp;level=users">
                                <?php _e('Persons', 'municipio-intranet'); ?>
                            </a>
                        </li>
                        @endif

                    </ul>
                </nav>
            </div>
        </div>
    </div>
</div>

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
