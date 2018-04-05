<div id="modal-invite-members" class="modal modal-backdrop-2 modal-xs text-left" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-content material-shadow-lg">
        <form class="social-share-email">
            <div class="modal-header">
                <a class="btn btn-close" href="#close"></a>
                <h2 class="modal-title"><?php _e('Invite members', 'municipio-intranet'); ?></h2>
            </div>
            <div class="modal-body">
                <article>
                    <div class="form-group">
                        <label><?php _e('Discussion forum', 'municipio-intranet'); ?></label>
                        {{ get_the_title() }}
                    </div>
                    <div class="form-group">
                        <label for="recipient-email"><?php _e('E-mail addresses', 'municipio-intranet'); ?> <span class="text-danger">*</span></label>
                        <small><?php _e('Enter one or many e-mail addresses, separate with comma. Get suggestions by typing \'@\' before the person\'s name, e.g. \'@firstname lastname\'.', 'municipio-intranet'); ?></small>
                        {!! wp_editor('', 'emailfield', $editorSettings) !!}
                    </div>
                </article>
            </div>
            <div class="modal-footer">
                <input type="hidden" name="post_id" value="{{ the_ID() }}">
                <input type="hidden" name="share_type" value="invite">
                <input type="submit" class="btn btn-primary" value="<?php _e('Send', 'municipio-intranet'); ?>">
            </div>
        </form>
    </div>
    <a href="#close" class="backdrop"></a>
</div>
