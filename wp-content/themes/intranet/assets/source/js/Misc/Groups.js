Intranet = Intranet || {};
Intranet.Misc = Intranet.Misc || {};

Intranet.Misc.Groups = (function ($) {

    function Groups() {
        $(function(){
            this.handleEvents();
        }.bind(this));
    }

    /**
     * Handle events
     * @return {void}
     */
    Groups.prototype.handleEvents = function () {
        $(document).on('submit', '#edit-group', function (e) {
            e.preventDefault();
            this.editGroup(e);
        }.bind(this));

        $(document).on('click', '#delete-group', function (e) {
            e.preventDefault();
            if (window.confirm(municipioIntranet.delete_confirm)) {
                this.deleteGroup(e);
            }
        }.bind(this));

        $(document).on('click', '.member-button', function (e) {
            e.preventDefault();
            this.joinGroup(e);
        }.bind(this));
    };

    Groups.prototype.joinGroup = function(event) {
        $target = $(event.currentTarget);
        $target.toggleClass('member-button--is-member');

        if ($target.hasClass('member-button--is-member')) {
            $('.pricon', $target).removeClass('pricon-plus-o').addClass('pricon-minus-o');
            $('.member-button__text', $target).text('Leave group');
        } else {
            $('.pricon', $target).removeClass('pricon-minus-o').addClass('pricon-plus-o');
            $('.member-button__text', $target).text('Join group');
        }
        $target.blur();

        $.ajax({
            url: ajaxurl,
            type: 'post',
            data: {
                action : 'join_group',
                postId : $target.data('postId')
            },
            success: function() {
                window.location.reload();
            }
        });
    };

    Groups.prototype.deleteGroup = function(event) {
        var postId = ($(event.currentTarget).data('post-id'));
        var archiveUrl = ($(event.currentTarget).data('archive'));

        $.ajax({
            method: "DELETE",
            url: municipioIntranet.wpapi.url + 'wp/v2/groups/' + postId,
            beforeSend: function (xhr) {
                xhr.setRequestHeader('X-WP-Nonce', municipioIntranet.wpapi.nonce);
            },
            success : function(response ) {
                window.location.replace(archiveUrl);
            }
        });
    };

    Groups.prototype.editGroup = function (event) {
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
            url: municipioIntranet.wpapi.url + 'wp/v2/groups/' + postId,
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

    return new Groups();

})(jQuery);
