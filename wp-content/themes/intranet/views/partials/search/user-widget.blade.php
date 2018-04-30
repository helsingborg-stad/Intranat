@if ($level !== 'users' && isset($users) && count($users) > 0)
<div class="grid-xs-12">
    <div class="box box-filled">
        <h3 class="box-title"><?php _e('Persons', 'municipio-intranet'); ?></h3>
        <div class="box-content">
            <p><?php echo sprintf(__('%d persons or more matching the search query', 'municipio-intranet'), count($users)); ?></p>
            <ul class="search-user-matches gutter gutter-vertical">
                @foreach (array_slice($users, 0, 10) as $user)
                <li>
                    <a href="{{ $user->profile_url }}" style="text-decoration:none;">
                        <span class="profile-image" style="background-image:url('{{ $user->profile_image }}');"></span>

                        {{ $user->name }}
                    </a>
                </li>
                @endforeach
            </ul>

            <a href="{{ home_url() }}?s={{ get_search_query() }}&amp;level=users" class="read-more"><?php _e('Show all matching persons', 'municipio-intranet'); ?></a>
        </div>
    </div>
</div>
@endif
