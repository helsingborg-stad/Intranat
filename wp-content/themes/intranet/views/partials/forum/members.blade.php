<div class="grid-xs-12">
	<div class="gutter gutter-margin gutter-bottom">
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
</div>
@if($isMember)
	<div class="grid-xs-12">
		<div class="gutter gutter-margin gutter-bottom gutter-lg">
			<a href="#modal-invite-members" class="btn btn-block btn-sm" data-action="share-email"><i class="pricon pricon-group pricon-space-right"></i> <?php _e('Invite members', 'municipio-intranet'); ?></a>
		</div>
	</div>
@endif
