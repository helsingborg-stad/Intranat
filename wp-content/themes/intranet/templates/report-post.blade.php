<div id="report-post-{{ get_the_ID() }}" class="modal modal-backdrop-2 modal-xs text-left" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-content material-shadow-lg">
        <form class="report-post">
            <div class="modal-header">
                <a class="btn btn-close" href="#close"></a>
                <h2 class="modal-title"><?php _e('Report inappropriate content', 'municipio-intranet'); ?></h2>
            </div>
            <div class="modal-body">
                <article>
                    <div class="form-group">
                        <p><?php _e('Fill out this form to report inappropriate content.', 'municipio-intranet'); ?></p>
                    </div>
                    <div class="form-group">
                        <label>Post</label>
                        {{ get_the_title() }}
                    </div>
                    @if (!is_user_logged_in())
                        <div class="form-group">
                            <label for="sender-name"><?php _e('Your name', 'municipio-intranet'); ?> <span class="text-danger">*</span></label>
                            <input type="text" name="sender_name" id="sender-name" placeholder="<?php _e('Your name', 'municipio-intranet'); ?>" required>
                        </div>
                        <div class="form-group">
                            <label for="sender-email"><?php _e('Your email', 'municipio'); ?> <span class="text-danger">*</span></label>
                            <input type="email" name="sender_email" id="sender-email" placeholder="<?php _e('Your email', 'municipio-intranet'); ?>" required>
                        </div>
                    @endif
                    <div class="form-group">
                        <label for="report-comment"><?php _e('Comment', 'municipio-intranet'); ?></label>
                        <textarea name="report-comment" id="report-comment" rows="4" required></textarea>
                    </div>
                    @if (!is_user_logged_in())
                        <div class="form-group">
                            <div class="g-recaptcha" data-sitekey="{{ $g_recaptcha_key }}"></div>
                        </div>
                    @endif
                </article>
            </div>
            <div class="modal-footer">
                <input type="hidden" name="post_id" value="{{ the_ID() }}">
                <input type="submit" class="btn btn-primary" value="<?php _e('Send', 'municipio-intranet'); ?>">
            </div>
        </form>
    </div>
    <a href="#close" class="backdrop"></a>
</div>
