Intranet = Intranet || {};
Intranet.Misc = Intranet.Misc || {};

Intranet.Misc.Forums = (function ($) {

    function Forums() {
        $(function(){
            this.handleEvents();
        }.bind(this));
    }

    /**
     * Handle events
     * @return {void}
     */
    Forums.prototype.handleEvents = function () {
        $(document).on('submit', '#edit-forum', function (e) {
            e.preventDefault();
            this.editForum(e);
        }.bind(this));

        $(document).on('click', '#delete-forum', function (e) {
            e.preventDefault();
            if (window.confirm(municipioIntranet.delete_confirm)) {
                this.deleteForum(e);
            }
        }.bind(this));

        $(document).on('click', '.member-button', function (e) {
            e.preventDefault();
            this.joinForum(e);
        }.bind(this));
    };

    Forums.prototype.joinForum = function(event) {
        $target = $(event.currentTarget);
        $target.toggleClass('member-button--is-member');

        if ($target.hasClass('member-button--is-member')) {
            $('.pricon', $target).removeClass('pricon-plus-o').addClass('pricon-minus-o');
            $('.member-button__text', $target).text(municipioIntranet.leave_forum);
        } else {
            $('.pricon', $target).removeClass('pricon-minus-o').addClass('pricon-plus-o');
            $('.member-button__text', $target).text(municipioIntranet.join_forum);
        }
        $target.blur();

        $.ajax({
            url: ajaxurl,
            type: 'post',
            data: {
                action : 'join_forum',
                postId : $target.data('postId')
            },
            success: function() {
                window.location.reload();
            }
        });
    };

    Forums.prototype.deleteForum = function(event) {
        var postId = ($(event.currentTarget).data('post-id'));
        var archiveUrl = ($(event.currentTarget).data('archive'));

        $.ajax({
            method: "DELETE",
            url: municipioIntranet.wpapi.url + 'wp/v2/forums/' + postId,
            beforeSend: function (xhr) {
                xhr.setRequestHeader('X-WP-Nonce', municipioIntranet.wpapi.nonce);
            },
            success : function(response ) {
                window.location.replace(archiveUrl);
            }
        });
    };

    Forums.prototype.editForum = function (event) {
        var $target = $(event.target),
            data = new FormData(event.target),
            postId = data.get('post_id');
            data.append('status', 'private');

        function displayError() {
            $('.spinner,.warning', $target).remove();
            $('.modal-footer', $target).prepend('<span class="notice warning gutter gutter-margin gutter-vertical"><i class="pricon pricon-notice-warning"></i> ' + municipioIntranet.something_went_wrong + '</span>');
        }

        $.ajax({
            method: "POST",
            url: municipioIntranet.wpapi.url + 'wp/v2/forums/' + postId,
            data: data,
            processData: false,
            contentType: false,
            beforeSend: function (xhr) {
                xhr.setRequestHeader('X-WP-Nonce', municipioIntranet.wpapi.nonce);
                $('button[type="submit"]', $target).append(' <i class="spinner"></i>');
            },
            success : function(response ) {
                if (typeof response.link !== "undefined") {
                    window.location.replace(response.link);
                } else {
                    displayError();
                }
            },
            error : function(response) {
                console.log(response);
                displayError();
            }
        });

        return false;
    };

    return new Forums();

})(jQuery);
