<div id="modal-forum-members" class="modal modal-backdrop-2 modal-xsmall" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-content material-shadow-lg">
        <div class="modal-header">
            <a class="btn btn-close" href="#close"></a>
            <h2 class="modal-title"><?php _e('Members', 'municipio-intranet'); ?></h2>
        </div>
        <div class="modal-body gutter">
            <div class="grid">
                @foreach ($members as $member)
                <div class="grid-lg-6 grid-md-12">
                    <a href="{{ $member['url'] }}" alt="{{ $member['name'] }}">
                        <div class="member-wrapper gutter gutter-bottom">
                            <div class="member-image">
                                {!! $member['image'] !!}
                            </div>
                            <div class="member-info">
                                <p>{{ $member['name'] }}</p>
                                <small>{{ $member['administrationUnit']->name ?? '' }}</small>
                            </div>
                        </div>
                    </a>
                </div>
                @endforeach
            </div>
        </div>
        <div class="modal-footer">
            <a href="#close" class="btn btn-default"><?php _e('Close', 'municipio-intranet'); ?></a>
        </div>
    </div>
    <a href="#close" class="backdrop"></a>
</div>
