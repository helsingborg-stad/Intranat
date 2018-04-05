@if(!empty($members))
	@include('members')
@endif

@if($isMember)
	<div class="grid-xs-12">
		<a href="#modal-invite-members" class="btn btn-block btn-sm gutter gutter-margin gutter-top" data-action="share-email"><i class="pricon pricon-group pricon-space-right"></i> <?php _e('Invite members', 'municipio-intranet'); ?></a>
	</div>
@endif
