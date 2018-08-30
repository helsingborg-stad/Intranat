@if ($level !== 'users' && is_user_logged_in())
<div id="user-lazy-load" class="grid-xs-12 u-mb-4">
    <div class="box box-filled">
        <h3 class="box-title"><?php _e('Persons', 'municipio-intranet'); ?></h3>
        <div class="box-content">

            <p class="js-user-loader-text gutter gutter-bottom hidden"><?php _e('Searching for persons...', 'municipio-intranet'); ?></p>

            <div class="js-user-loader loading hidden"><div></div><div></div><div></div><div></div></div>

            <p class="js-user-number-found hidden"></p>

            <p class="js-user-number-not-found hidden"><?php _e('Could not find any matching persons.', 'municipio-intranet'); ?></p>

            <ul class="js-user-search-results search-user-matches gutter gutter-vertical hidden"></ul>

            <a href="{{ home_url() }}?s={{ get_search_query() }}&amp;level=users" class="read-more js-user-show-all-results hidden">
                <?php _e('Show all matching persons', 'municipio-intranet'); ?>
            </a>
        </div>
    </div>
</div>
@endif

{{-- User item. --}}
@verbatim
<script type="text/html" id="tmpl-user-item">
    <# if (data) { #>
        <li>
            <a href="{{{ data.profile_url }}}" style="text-decoration:none;">
                <span class="profile-image" style="background-image:url('{{{ data.profile_image }}}');"></span>
                {{{ data.name }}}
            </a>
        </li>
    <# } #>
</script>
@endverbatim

{{-- User matches. --}}
@verbatim
<script type="text/html" id="tmpl-user-nbr-matches">
    <# if (data) { #>
        <?php _e("Found", 'municipio-intranet'); ?> {{{ data.count }}} <?php _e("persons matching your query", 'municipio-intranet'); ?>
    <# } #>
</script>
@endverbatim
