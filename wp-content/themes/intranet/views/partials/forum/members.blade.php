<div class="grid-xs-12">
	<a href="#modal-forum-members" class="forum-members-link">{{ count($members) }} <?php _e('members', 'municipio-intranet'); ?></a>
	<div class="forum-members">
        @foreach ($randomMembers as $member)
			<div class="member-image">
				<a href="{{ $member['url'] }}" alt="{{ $member['name'] }}">
					{!! $member['image'] !!}
				</a>
			</div>
        @endforeach
    </div>
</div>
@if($isMember)
	<div class="grid-xs-12">
		<a href="#modal-invite-members" class="btn btn-block btn-sm gutter gutter-margin gutter-top" data-action="share-email"><i class="pricon pricon-group pricon-space-right"></i> <?php _e('Invite members', 'municipio-intranet'); ?></a>
	</div>
@endif
