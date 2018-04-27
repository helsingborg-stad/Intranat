@if (count($systems) > 0)
<div class="grid-xs-12">
    <div class="box box-filled">
        <h3 class="box-title"><?php _e('Systems', 'municipio-intranet'); ?></h3>
        <div class="box-content">
            <p><?php echo sprintf(__('Found %d matching user systems', 'municipio-intranet'), count($systems)); ?></p>
            @if (method_exists('\SsoAvailability\SsoAvailability', 'isSsoAvailable') && !\SsoAvailability\SsoAvailability::isSsoAvailable())
            <p class="text-sm"><?php _e('Note', 'municipio-intranet'); ?>: <?php _e('Your logged in from a computer outside the city network. This causes some systems to be unavailable.', 'municipio-intranet'); ?></p>
            @endif

            <ul class="gutter gutter-top">
                @foreach ($systems as $system)
                    @if ($system->unavailable === true)
                        <li><a target="_blank" class="link-item link-unavailable" href="{{ $system->url }}"><span data-tooltip="<?php _e('You need to be on the city network to use this system', 'municipio-intranet'); ?>">{{ $system->name }}</span></a></li>
                    @else
                        <li><a target="_blank" href="{{ $system->url }}" class="link-item">{{ $system->name }}</a></li>
                    @endif
                @endforeach
            </ul>
        </div>
    </div>
</div>
@endif
