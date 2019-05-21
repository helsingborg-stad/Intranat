@if ($hasLeftSidebar)
<aside class="grid-md-4 grid-lg-3 sidebar-left-sidebar hidden-print">
    @if (is_active_sidebar('left-sidebar'))
        <div class="grid grid grid--columns sidebar-left-sidebar-top hidden-xs hidden-sm hidden-md">
            <?php dynamic_sidebar('left-sidebar'); ?>
        </div>
    @endif



    @if (get_field('nav_sub_enable', 'option'))
    {!! $navigation['sidebarMenu'] !!}
    @endif

    @if (get_field('nav_sub_enable', 'option') && is_main_site())
    {!! $userNavigation['sidebarMenu'] !!}
    @endif

    @if (is_main_site() && is_front_page() && $forced = \Intranet\User\Subscription::getForcedSubscriptions(false, false))
    <ul class="gutter gutter-bottom">
    @foreach ($forced as $site)
        <li class="link-box network-title"><a href="{{ $site->path }}">{!! municipio_intranet_format_site_name($site) !!}</a></li>
    @endforeach
    </ul>
    @endif

    <!-- Use right sidebar to the left in small-ish devices -->
    @if (is_active_sidebar('left-sidebar')||$hasRightSidebar)
        <div class="grid grid grid--columns sidebar-left-sidebar-top hidden-lg">
            <?php dynamic_sidebar('left-sidebar'); ?>
            <?php dynamic_sidebar('right-sidebar'); ?>
        </div>
    @endif

    @if (is_active_sidebar('left-sidebar-bottom'))
        <div class="grid grid grid--columns sidebar-left-sidebar-bottom">
            <?php dynamic_sidebar('left-sidebar-bottom'); ?>
        </div>
    @endif
</aside>
@endif
