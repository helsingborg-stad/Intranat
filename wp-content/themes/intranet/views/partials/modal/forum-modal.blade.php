<div id="modal-edit-forum" class="modal modal-backdrop-2 modal-small" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-content material-shadow-lg">
        <form id="edit-forum" name="editforum">
            <div class="modal-header">
                <a class="btn btn-close" href="#close"></a>
                <h2 class="modal-title">{{ $formTitle }}</h2>
            </div>
            <div class="modal-body gutter">
                <div class="form-group">
                    <label for="title"><?php _e('Name your discussion forum', 'municipio-intranet'); ?><span class="text-danger">*</span></label>
                    <input type="text" name="title" class="large-text" value="{{ $postTitle }}" required="">
                </div>
                <div class="form-group">
                    <label for="content"><?php _e('Description', 'municipio-intranet'); ?></label>
                    {!! wp_editor($postContent, 'editgroup', $editorSettings) !!}
                </div>
                <div class="form-group">
                    <label for="category"><?php _e('Subject', 'municipio-intranet'); ?></label>
                    {!! $categories !!}
                </div>
            </div>
            <div class="modal-footer">
                <input type="hidden" id="post_id" name="post_id" value="{{ $postId }}">
                <a href="#close" class="btn btn-default"><?php _e('Close', 'municipio-intranet'); ?></a>
                <button type="submit" class="btn btn-primary">{{ $formTitle }} </button>
            </div>
        </form>
    </div>
    <a href="#close" class="backdrop"></a>
</div>
