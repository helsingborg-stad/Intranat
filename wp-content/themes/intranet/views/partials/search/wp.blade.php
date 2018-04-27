<?php global $wp_query; ?>

<section class="creamy creamy-border-bottom gutter-vertical gutter-lg clearfix">
    <div class="container">
        <div class="gid">
            <div class="grid-lg-12">
                {!! get_search_form() !!}

                <div class="gutter gutter-sm gutter-top">
                     <?php echo sprintf(__('<strong>%1$d</strong> results on "%2$s"', 'municipio-intranet'), $resultCount, get_search_query()); ?></strong>
                </div>
            </div>
        </div>
    </div>
</section>

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

                        @if (is_user_logged_in())
                        <li class="{{ $level == 'subscriptions' ? 'active' : '' }}">
                            <a href="{{ home_url() }}?s={{ urlencode(get_search_query()) }}&amp;level=subscriptions">
                                <?php _e('Subscriptions', 'municipio-intranet'); ?>
                                <span class="label label-rounded label-sm">{{ $counts['subscriptions'] }}</span>
                            </a>
                        </li>
                        @endif

                        <li class="{{ $level == 'all' ? 'active' : '' }}">
                            <a href="{{ home_url() }}?s={{ urlencode(get_search_query()) }}&amp;level=all">
                                <?php _e('All sites', 'municipio-intranet'); ?>
                                <span class="label label-rounded label-sm">{{ $counts['all'] }}</span>
                            </a>
                        </li>

                        <li class="{{ $level == 'current' ? 'active' : '' }}">
                            <a href="{{ home_url() }}?s={{ urlencode(get_search_query()) }}&amp;level=current">
                                {{ municipio_intranet_format_site_name(\Intranet\Helper\Multisite::getSite(get_current_blog_id()), 'long') }}
                                <span class="label label-rounded label-sm">{{ $counts['current'] }}</span>
                            </a>
                        </li>

                        <li class="{{ $level == 'files' ? 'active' : '' }}">
                            <a href="{{ home_url() }}?s={{ urlencode(get_search_query()) }}&amp;level=files">
                                <?php _e('Files', 'municipio-intranet'); ?>
                                <span class="label label-rounded label-sm">{{ $counts['files'] }}</span>
                            </a>
                        </li>

                        @if (is_user_logged_in())
                        <li class="{{ $level == 'users' ? 'active' : '' }}">
                            <a href="{{ home_url() }}?s={{ urlencode(get_search_query()) }}&amp;level=users">
                                <?php _e('Persons', 'municipio-intranet'); ?>
                                <span class="label label-rounded label-sm">{{ $counts['users'] }}</span>
                            </a>
                        </li>
                        @endif
                    </ul>
                </nav>
            </div>
        </div>
    </div>
</div>

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
                    @if ($level !== 'users' && $wp_query->max_num_pages > 1)
                    <div class="grid">
                        <div class="grid-lg-12">
                            {!!
                                paginate_links(array(
                                    'type' => 'list'
                                ))
                            !!}
                        </div>
                    </div>
                    @endif

                    <div class="grid">
                        <div class="grid-lg-12">

                            @if ($level === 'users')
                                @include('partials.search.user')
                            @else
                                @include('partials.search.page')
                            @endif

                        </div>
                    </div>

                    @if ($level !== 'users' && $wp_query->max_num_pages > 1)
                    <div class="grid">
                        <div class="grid-lg-12">
                            {!!
                                paginate_links(array(
                                    'type' => 'list'
                                ))
                            !!}
                        </div>
                    </div>
                    @endif
                @endif
            </div>

            <aside class="grid-lg-3 grid-md-12 sidebar-right-sidebar">
                <div class="grid">
                    @include('partials.search.user-widget')
                    @include('partials.search.system-widget')
                </div>
            </aside>
        </div>
    </div>
</section>
