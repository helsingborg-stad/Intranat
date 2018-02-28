addComment = {
    moveForm : function(commId, parentId, respondId, postId) {
        var t = this;

        // Remove editor if necessary
        t.red();

        var div,
        comm = t.I(commId),
        respond = t.I(respondId),
        cancel = t.I('cancel-comment-reply-link'),
        parent = t.I('comment_parent'), post = t.I('comment_post_ID');

        if ( ! comm || ! respond || ! cancel || ! parent)
                return;

        t.respondId = respondId;
        postId = postId || false;

        if ( ! t.I('wp-temp-form-div') ) {
                div = document.createElement('div');
                div.id = 'wp-temp-form-div';
                div.style.display = 'none';
                respond.parentNode.insertBefore(div, respond);
        }

        comm.parentNode.insertBefore(respond, comm.nextSibling);

        if ( post && postId )
            post.value = postId;
        parent.value = parentId;
        cancel.style.display = '';

        // Add editor if necessary
        t.aed();

        cancel.onclick = function() {
            var t = addComment;

            // Remove editor if necessary
            t.red();

            var temp = t.I('wp-temp-form-div'), respond = t.I(t.respondId);

            if ( ! temp || ! respond )
                return;

            t.I('comment_parent').value = '0';
            temp.parentNode.insertBefore(respond, temp);
            temp.parentNode.removeChild(temp);
            this.style.display = 'none';
            this.onclick = null;

            // Add editor if necessary
            t.aed();

            return false;
        }

        return false;
    },
    I : function(e) {
        return document.getElementById(e);
    },
    red : function() {
        /* TinyMCE defined means wp_editor has Visual or both Visual and HTML/Text editors enabled
         * If editor is in HTML editor only mode our work here is unnecessary
         */
        if(typeof(tinyMCE) == 'undefined')
            return;

        var tmce = tinyMCE.get('comment');
        if (tmce && !tmce.isHidden()){
            /* Remove TinyMCE from textarea if necessary
             * and mark the current editor tab as Visual
             */
            this.mode = 'tmce';
            tmce.remove();
        }else{
            /* Html editor can be moved in DOM without removal
             * so we just mark current editor tab as Html
             */
            this.mode = 'html';
        }
    },
    aed : function() {
        if(typeof(tinyMCE) == 'undefined')
            return;

        if (this.mode == 'tmce'){
            /* Add Visual editor to textarea using code from wp-includes/js/editor.js
             * enqueued by _WP_Editors PHP class whenever Visual editor is enabled.
             * This code switches to Visual editor with id 'comment'
             */
            switchEditors.go('comment', 'tmce');
        }else if (this.mode == 'html'){
            /* Add HTML/Text editor to textarea using code from wp-includes/js/editor.js
             * enqueued by _WP_Editors PHP class whenever Visual editor is enabled.
             * If Visual editor is not enabled 'return' above makes this code off limits.
             * This code switches to HTML editor with id 'comment'
             */
            switchEditors.go('comment', 'html');
        }
    }
}

jQuery(function($){
	$('.comment-reply-link').click(function(e){
		e.preventDefault();
		var args = $(this).data('onclick');
		args = args.replace(/.*\(|\)/gi, '').replace(/\"|\s+/g, '');
		args = args.split(',');
		tinymce.EditorManager.execCommand('mceRemoveControl', true, 'comment');
		addComment.moveForm.apply( addComment, args );
		tinymce.EditorManager.execCommand('mceAddControl', true, 'comment');
	});
});
