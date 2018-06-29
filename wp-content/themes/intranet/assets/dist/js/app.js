var Intranet;

Intranet = Intranet || {};
Intranet.Helper = Intranet.Helper || {};

Intranet.Helper.MissingData = (function ($) {

    /**
     * Constructor
     * Should be named as the class itself
     */
    function MissingData() {
        $('[data-guide-nav="next"], [data-guide-nav="prev"]').on('click', function (e) {
            $form = $(e.target).parents('form');
            $fields = $(e.target).parents('section').find(':input:not([name="active-section"])');

            var sectionIsValid = true;
            $fields.each(function (index, element) {
                // Valid
                if ($(this)[0].checkValidity()) {
                    return;
                }

                // Not valid
                sectionIsValid = false;
            });

            if (!sectionIsValid) {
                $form.find(':submit').trigger('click');
                return false;
            }

            return true;
        });
    }

    return new MissingData();

})(jQuery);

Intranet = Intranet || {};
Intranet.Helper = Intranet.Helper || {};

Intranet.Helper.Walkthrough = (function ($) {

    var currentIndex = 0;

    /**
     * Constructor
     * Should be named as the class itself
     */
    function Walkthrough() {
        $('.walkthrough [data-dropdown]').on('click', function (e) {
            e.preventDefault();
            this.highlightArea(e.target);
        }.bind(this));

        $('[data-action="walkthrough-cancel"]').on('click', function (e) {
            e.preventDefault();
            $(e.target).closest('[data-action="walkthrough-cancel"]').parents('.walkthrough').find('.blipper').trigger('click');
        }.bind(this));

        $('[data-action="walkthrough-next"]').on('click', function (e) {
            e.preventDefault();
            var currentStep = $(e.target).closest('[data-action="walkthrough-next"]').parents('.walkthrough');
            this.next(currentStep);
        }.bind(this));

        $('[data-action="walkthrough-previous"]').on('click', function (e) {
            e.preventDefault();
            var currentStep = $(e.target).closest('[data-action="walkthrough-previous"]').parents('.walkthrough');
            this.previous(currentStep);
        }.bind(this));

        $(window).on('resize load', function () {
            if ($('.walkthrough:visible').length < 2) {
                $('[data-action="walkthrough-previous"], [data-action="walkthrough-next"]').hide();
                return;
            }

            $('[data-action="walkthrough-previous"], [data-action="walkthrough-next"]').show();
            return;
        });

        $(window).on('resize load', function () {
            if ($('.walkthrough .is-highlighted:not(:visible)').length) {
                $('.walkthrough .is-highlighted:not(:visible)').parent('.walkthrough').find('.blipper').trigger('click');
            }
        });
    }

    Walkthrough.prototype.highlightArea = function (element) {
        var $element = $(element).closest('[data-dropdown]');
        var highlight = $element.parent('.walkthrough').attr('data-highlight');
        var $highlight = $(highlight);

        if ($element.hasClass('is-highlighted')) {
            if ($highlight.data('position')) {
                $highlight.css('position', $highlight.data('position'));
            }

            $highlight.prev('.backdrop').remove();
            $highlight.removeClass('walkthrough-highlight');
            $element.removeClass('is-highlighted');

            return false;
        }

        $highlight.before('<div class="backdrop"></div>');

        if ($highlight.css('position') !== 'absolute' || $highlight.css('position') !== 'relative') {
            $highlight.data('position', $highlight.css('position')).css('position', 'relative');
        }

        $highlight.addClass('walkthrough-highlight');
        $element.addClass('is-highlighted');

        return true;
    };

    Walkthrough.prototype.next = function(current) {
        currentIndex++;

        var $current = current;
        var $nextItem = $('.walkthrough:eq(' + currentIndex + '):visible');

        if ($nextItem.length === 0) {
            $nextItem = $('.walkthrough:visible:first');
            currentIndex = 0;
        }

        $current.find('.blipper').trigger('click');
        setTimeout(function () {
            $nextItem.find('.blipper').trigger('click');
            this.scrollTo($nextItem[0]);
        }.bind(this), 1);
    };

    Walkthrough.prototype.previous = function(current) {
        currentIndex--;

        var $current = current;
        var $nextItem = $('.walkthrough:eq(' + currentIndex + '):visible');

        if ($nextItem.length === 0) {
            $nextItem = $('.walkthrough:visible').last();
            currentIndex = $nextItem.index();
        }

        $current.find('.blipper').trigger('click');
        setTimeout(function () {
            $nextItem.find('.blipper').trigger('click');
            this.scrollTo($nextItem[0]);
        }.bind(this), 1);
    };

    Walkthrough.prototype.scrollTo = function(element) {
        if (!$(element).is(':offscreen')) {
            return;
        }

        var scrollTo = $(element).offset().top;
        $('html, body').animate({
            scrollTop: (scrollTo-100)
        }, 300);
    };

    return new Walkthrough();

})(jQuery);

Intranet = Intranet || {};
Intranet.Misc = Intranet.Misc || {};

Intranet.Misc.Forums = (function ($) {

    function Forums() {
        $(function () {
            this.handleEvents();
        }.bind(this));
    }

    /**
     * Handle events
     * @return {void}
     */
    Forums.prototype.handleEvents = function () {
        $('#edit-forum').submit(function (e) {
            e.preventDefault();
            this.updateForum(e);
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

    Forums.prototype.joinForum = function (event) {
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
                action: 'join_forum',
                postId: $target.data('postId')
            },
            success: function () {
                window.location.reload();
            }
        });
    };

    Forums.prototype.deleteForum = function (event) {
        var postId = ($(event.currentTarget).data('post-id'));
        var archiveUrl = ($(event.currentTarget).data('archive'));

        $.ajax({
            method: "DELETE",
            url: municipioIntranet.wpapi.url + 'wp/v2/forums/' + postId,
            beforeSend: function (xhr) {
                xhr.setRequestHeader('X-WP-Nonce', municipioIntranet.wpapi.nonce);
            },
            success: function (response) {
                window.location.replace(archiveUrl);
            }
        });
    };

    Forums.prototype.updateForum = function (event) {
        var $target = $(event.target),
            data = new FormData(event.target),
            postId = document.forms.editforum.post_id.value;
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
            success: function (response) {
                if (typeof response.link !== "undefined") {
                    window.location.replace(response.link);
                } else {
                    displayError();
                }
            },
            error: function (response) {
                console.log(response);
                displayError();
            }
        });

        return false;
    };

    return new Forums();

})(jQuery);

Intranet = Intranet || {};
Intranet.Misc = Intranet.Misc || {};

Intranet.Misc.News = (function ($) {
    function News() {

        //Init
        this.container  = $('.modularity-mod-intranet-news .intranet-news');
        this.button     = $('.modularity-mod-intranet-news [data-action="intranet-news-load-more"]');
        this.category   = $('.modularity-mod-intranet-news select[name="cat"]');

        //Enable disabled button
        this.button.prop('disabled', false);

        //Load more click
        this.button.on('click', function (e) {
            this.loadMore(this.container, this.button);
        }.bind(this));

        //Category switcher
        this.category.on('change', function (e) {
            this.container.empty();
            this.loadMore(this.container, this.button);
        }.bind(this));
    }

    News.prototype.showLoader = function(button) {
        button.hide();
        button.after('<div class="loading"><div></div><div></div><div></div><div></div></div>');
    };

    News.prototype.hideLoader = function(button) {
        button.parent().find('.loading').remove();
        button.show();
    };

    News.prototype.loadMore = function(container, button) {
        var callbackUrl     = container.attr('data-infinite-scroll-callback');
        var pagesize        = container.attr('data-infinite-scroll-pagesize');
        var sites           = container.attr('data-infinite-scroll-sites');
        var offset          = container.find('a.box-news').length ? container.find('a.box-news').length : 0;
        var module          = container.attr('data-module');
        var category        = this.category.val();
        var args            = container.attr('data-args');
        var url             = null;

        this.showLoader(button);

        if(!isNaN(parseFloat(category)) && isFinite(category)) {
            url = callbackUrl + pagesize + '/' + offset + '/' + sites + '/' + category;
        } else {
            url = callbackUrl + pagesize + '/' + offset + '/' + sites + '/0';
        }

        $.ajax({
            url: url,
            method: 'POST',
            data: {
                module: module,
                args: args
            },
            dataType: 'JSON',
            beforeSend: function (xhr) {
                xhr.setRequestHeader('X-WP-Nonce', municipioIntranet.wpapi.nonce);
            }
        }).done(function (res) {
            if (res.length === 0) {
                this.noMore(container, button);
                return;
            }

            this.output(container, res);
            this.hideLoader(button);

            if (res.length < pagesize) {
                this.noMore(container, button);
            }
        }.bind(this));
    };

    News.prototype.noMore = function(container, button) {
        this.hideLoader(button);
        button.text(municipioIntranet.no_more_news).prop('disabled', true);
    };

    News.prototype.output = function(container, news) {
        $.each(news, function (index, item) {
            container.append(item.markup);
        });
    };

    return new News();

})(jQuery);


Intranet = Intranet || {};
Intranet.Misc = Intranet.Misc || {};

Intranet.Misc.ReportPost = (function ($) {

    function ReportPost() {
        $('.report-post').on('submit', function (e) {
            e.preventDefault();

            var $target = $(this),
                data = new FormData(this);
                data.append('action', 'report_post');

            if (data.get('g-recaptcha-response') === '') {
                return false;
            }

            $target.find('input[type="submit"]').hide();
            $target.find('.modal-footer').append('<div class="loading"><div></div><div></div><div></div><div></div></div>');

            $.ajax({
                url: ajaxurl,
                type: 'POST',
                data: data,
                dataType: 'json',
                processData: false,
                contentType: false,
                success: function(response, textStatus, jqXHR) {
                    if (response.success) {
                        $('.modal-footer', $target).html('<span class="notice success"><i class="pricon pricon-check"></i> ' + response.data + '</span>');

                    } else {
                        $('.modal-footer', $target).html('<span class="notice warning"><i class="pricon pricon-notice-warning"></i> ' + response.data + '</span>');
                    }
                },
                complete: function () {
                    setTimeout(function() {
                        location.hash = '';
                    }, 3000);
                }
            });

            return false;
        });
    }

    return new ReportPost();

})(jQuery);

Intranet = Intranet || {};
Intranet.Search = Intranet.Search || {};

Intranet.Search.General = (function ($) {

    var typingTimer;

    /**
     * Constructor
     * Should be named as the class itself
     */
    function General() {
        $('.search form input[name="level"]').on('change', function (e) {
            $(e.target).parents('form').submit();
        });

        $('.navbar .search').each(function (index, element) {
            this.autocomplete(element);
        }.bind(this));

    }

    /**
     * Initializes the autocomplete functionality
     * @param  {object} element Element
     * @return {void}
     */
    General.prototype.autocomplete = function(element) {
        var $element = $(element);
        var $input = $element.find('input[type="search"]');

        $input.on('keydown', function (e) {

            switch (e.which) {
                case 40:
                    this.autocompleteKeyboardNavNext(element);
                    return false;

                case 38:
                    this.autocompleteKeyboardNavPrev(element);
                    return false;

                case 13:
                    return this.autocompleteSubmit(element);
            }

            clearTimeout(typingTimer);

            if ($input.val().length < 3) {
                $element.find('.search-autocomplete').remove();
                return;
            }

            typingTimer = setTimeout(function () {
                this.autocompleteQuery(element);
            }.bind(this), 300);

        }.bind(this));

        $(document).on('click', function (e) {
            if (!$(e.target).closest('.search-autocomplete').length) {
                $('.search-autocomplete').remove();
            }
        });

        $input.on('focus', function (e) {
            if ($input.val().length < 3) {
                return;
            }
            this.autocompleteQuery(element);
        }.bind(this));
    };

    /**
     * Submit autocomplete
     * @param  {object} element Autocomplete element
     * @return {bool}
     */
    General.prototype.autocompleteSubmit = function(element) {
        var $element = $(element);
        var $autocomplete = $element.find('.search-autocomplete');
        var $selected = $autocomplete.find('.selected');

        if (!$selected.length) {
            return true;
        }

        var url = $selected.find('a').attr('href');
        location.href = url;

        return false;
    };

    /**
     * Navigate to next autocomplete list item
     * @param  {object} element Autocomplete element
     * @return {void}
     */
    General.prototype.autocompleteKeyboardNavNext = function(element) {
        var $element = $(element);
        var $autocomplete = $element.find('.search-autocomplete');

        var $selected = $autocomplete.find('.selected');
        var $next = null;

        if (!$selected.length) {
            $next = $autocomplete.find('li:not(.title):first');
        } else {
            $next = $selected.next('li:not(.title):first');
        }

        if (!$next.length) {
            var $nextUl = $selected.parents('ul').next('ul');
            if ($nextUl.length) {
                $next = $nextUl.find('li:not(.title):first');
            }
        }

        $selected.removeClass('selected');
        $next.addClass('selected');
    };

    /**
     * Navigate to previous autocomplete list item
     * @param  {object} element Autocomplete element
     * @return {void}
     */
    General.prototype.autocompleteKeyboardNavPrev = function(element) {
        var $element = $(element);
        var $autocomplete = $element.find('.search-autocomplete');

        var $selected = $autocomplete.find('.selected');
        var $prev = null;

        if (!$selected.length) {
            $prev = $autocomplete.find('li:not(.title):last');
        } else {
            $prev = $selected.prev('li:not(.title)');
        }

        if (!$prev.length) {
            var $prevUl = $selected.parents('ul').prev('ul');
            if ($prevUl.length) {
                $prev = $prevUl.find('li:not(.title):last');
            }
        }

        $selected.removeClass('selected');
        $prev.addClass('selected');
    };

    /**
     * Query for autocomplete suggestions
     * @param  {object} element Autocomplete element
     * @return {void}
     */
    General.prototype.autocompleteQuery = function(element) {
        var $element = $(element);
        var $input = $element.find('input[type="search"]');
        var query = $input.val();

        var data = {
            action: 'search_autocomplete',
            s: $input.val(),
            level: 'ajax'
        };

        $element.find('button[type="submit"]').addClass("searching");

        $.ajax({
            url: municipioIntranet.wpapi.url + 'intranet/1.0/s/' + query,
            method: 'GET',
            dataType: 'JSON',
            beforeSend: function ( xhr ) {
                xhr.setRequestHeader('X-WP-Nonce', municipioIntranet.wpapi.nonce);
            }
        }).done(function (res) {
            $element.find('.search-autocomplete').remove();
            this.outputAutocomplete(element, res);
            $element.find('button[type="submit"]').removeClass("searching");
        }.bind(this));

    };

    /**
     * Outputs the autocomplete dropdown
     * @param  {object} element Autocomplete element
     * @param  {array}  res     Autocomplete query result
     * @return {void}
     */
    General.prototype.outputAutocomplete = function(element, res) {
        var $element = $(element);
        var $autocomplete = $('<div class="search-autocomplete"></div>');

        var $users = $('<ul class="search-autocomplete-users"><li class="title"><i class="pricon pricon-user-o"></i> ' + municipioIntranet.searchAutocomplete.persons + '</li></ul>');
        var $content = $('<ul class="search-autocomplete-content"><li class="title"><i class="pricon pricon-file-text"></i> ' + municipioIntranet.searchAutocomplete.content + '</li></ul>');

        // Users
        if (typeof res.users != 'undefined' && res.users !== null && res.users.length > 0) {
            $.each(res.users, function (index, user) {
                if (user.profile_image) {
                    $users.append('<li><a href="' + user.profile_url + '"><img src="' + user.profile_image + '" class="search-autocomplete-image"> ' + user.name + '</a></li>');
                    return;
                }

                $users.append('<li><a href="' + user.profile_url + '">' + user.name + '</a></li>');
            });
        } else {
            $users = $('');
        }

        // Content
        if (typeof res.content != 'undefined' && res.content !== null && res.content.length > 0) {
            $.each(res.content, function (index, post) {
                if (post.is_file) {
                    $content.append('<li><a class="link-item-before" href="' + post.permalink + '" target="_blank">' + post.post_title + '</a></li>');
                } else {
                    $content.append('<li><a href="' + post.permalink + '">' + post.post_title + '</a></li>');
                }
            });
        } else {
            $content = $('');
        }

        if ((res.content === null || res.content.length === 0) && (res.users === null || res.users.length === 0)) {
            // $autocomplete.append('<ul><li class="search-autocomplete-nothing-found">Inga träffar…</li></ul>');
            return;
        }

        $content.appendTo($autocomplete);
        $users.appendTo($autocomplete);

        $autocomplete.append('<button type="submit" class="read-more block-level">' + municipioIntranet.searchAutocomplete.viewAll + '</a>');

        $autocomplete.appendTo($element).show();
    };

    //return new General();

})(jQuery);

Intranet = Intranet || {};
Intranet.Search = Intranet.Search || {};

Intranet.Search.Sites = (function ($) {

    var typeTimer = false;
    var btnBefore = false;

    /**
     * Handle events for triggering a search
     */
    function Sites() {
        btnBefore = $('form.network-search button[type="submit"]').html();

        // While typing in input
        $('form.network-search input[type="search"]').on('input', function (e) {
            clearTimeout(typeTimer);

            $searchInput = $(e.target).closest('input[type="search"]');
            var keyword = $searchInput.val();

            if (keyword.length < 2) {
                $('form.network-search button[type="submit"]').html(btnBefore);
                $('.network-search-results-items').remove();
                $('.network-search-results .my-networks').show();

                return;
            }

            $('form.network-search button[type="submit"]').html('<i class="loading-dots loading-dots-highight"></i>');

            typeTimer = setTimeout(function () {
                this.search(keyword);
            }.bind(this), 1000);

        }.bind(this));

        // Submit button
        $('form.network-search').on('submit', function (e) {
            e.preventDefault();
            clearTimeout(typeTimer);

            $('form.network-search button[type="submit"]').html('<i class="loading-dots loading-dots-highight"></i>');
            $searchInput = $(e.target).find('input[type="search"]');

            var keyword = $searchInput.val();
            this.search(keyword, true);
        }.bind(this));
    }

    /**
     * Performs an ajax post to the search script
     * @param  {string} keyword The search keyword
     * @return {void}
     */
    Sites.prototype.search = function (keyword, redirectToPerfectMatch) {
        if (typeof redirectToPerfectMatch == 'undefined') {
            redirectToPerfectMatch = false;
        }

        var data = {
            action: 'search_sites',
            s: keyword
        };

        $.post(ajaxurl, data, function (res) {
            if (res.length === 0) {
                return;
            }

            $.each(res, function (index, item) {
                this.emptyResults();

                if (redirectToPerfectMatch && keyword.toLowerCase() == item.name.toLowerCase() || (item.short_name.length && keyword.toLowerCase() == item.short_name.toLowerCase())) {

                    window.location = item.path;
                    return;
                }

                this.addResult(item.domain, item.path, item.name, item.short_name);
            }.bind(this));

            if (btnBefore) {
                $('form.network-search button[type="submit"]').html(btnBefore);
            }
        }.bind(this), 'JSON');
    };

    /**
     * Adds a item to the result list
     * @param {string} domain    The domain of the url
     * @param {string} path      The path of the url
     * @param {string} name      The name of the network site
     * @param {string} shortname The short name of the network site
     */
    Sites.prototype.addResult = function (domain, path, name, shortname) {
        $('.network-search-results .my-networks').hide();

        if ($('.network-search-results-items').length === 0) {
            $('.network-search-results').append('<ul class="network-search-results-items"></ul>');
        }

        if (shortname) {
            $('.network-search-results-items').append('<li class="network-title"><a href="//' + domain + path + '">' + shortname + ' <em>' + name +  '</em></a></li>');
            return;
        }

        $('.network-search-results-items').append('<li class="network-title"><a href="//' + domain + path + '">' + name +  '</a></li>');
    };

    /**
     * Empties the result list
     * @return {void}
     */
    Sites.prototype.emptyResults = function () {
        $('.network-search-results-items').empty();
    };

    return new Sites();

})(jQuery);


Intranet = Intranet || {};
Intranet.Search = Intranet.Search || {};

Intranet.Search.User = (function ($) {

    //Define target elements
    var loaderElement = ".js-user-loader";
    var loaderTextElement = ".js-user-loader-text";
    var resultElement = ".js-user-search-results";
    var emptyResultElement = ".js-user-number-not-found";
    var nbrOfMatches = ".js-user-number-found";
    var allButtonElement = ".js-user-show-all-results";

    var typeTimer = 0;

    function User() {

        //Disable on all pages not containging user widget
        if(jQuery("#user-lazy-load").length == 0) {
            return;
        }

        //Initital
        $('input[type="search"], #algolia-search-box input').each(function(index, item) {
            if($(item).val()) {
                this.searchInit($(item).val());
                return false;
            }
        }.bind(this));

        $(window).on('load', function() {
            // While typing in input
            $('input[type="search"], #algolia-search-box input').on('input', function (e) {
                clearTimeout(typeTimer);
                $searchInput = $(e.target);
                var keyword = $searchInput.val();
                typeTimer = setTimeout(function () {
                    this.searchInit(keyword);
                }.bind(this), 1000);
            }.bind(this));
        }.bind(this));
    }

    User.prototype.searchInit = function(query) {

        this.showElement(jQuery(loaderTextElement));
        this.showElement(jQuery(loaderElement));
        this.hideElement(jQuery(emptyResultElement));
        this.hideElement(jQuery(allButtonElement));
        this.hideElement(jQuery(resultElement));
        this.hideElement(jQuery(nbrOfMatches));

        this.fetchUsers(query);
    };

    User.prototype.showElement= function(target) {
        target.removeClass("hidden");
    };

    User.prototype.hideElement = function(target) {
        target.addClass("hidden");
    };

    User.prototype.disableButton = function(target) {
        target.attr('disabled', 'disabled');
    };

    User.prototype.fetchUsers = function(query) {

        var data = {
            'action': 'search_users',
            'query': query
        };

        $.post(ajaxurl, data, function(response) {

            this.hideElement(jQuery(loaderElement));
            this.hideElement(jQuery(loaderTextElement));

            if(typeof response.items !== 'undefined') {

                //Empty result
                $(resultElement).html("");

                //Create _ view user item
                var userTemplate = wp.template("user-item");

                //Populate
                response.items.forEach(function(element) {
                    $(resultElement).append(userTemplate(element.data));
                }.bind(this));

                //Show
                this.showElement(jQuery(resultElement));

                //Create _ view user matches
                var userMatchesTemplate = wp.template("user-nbr-matches");

                //Populate
                $(nbrOfMatches).html(userMatchesTemplate({count: response.nbrofitems}));

                //Show more button & number of matches
                if(response.items.length != response.nbrofitems) {
                    this.showElement(jQuery(allButtonElement));
                }
                this.showElement(jQuery(nbrOfMatches));

            } else {
                this.hideElement(jQuery(allButtonElement));
                this.showElement(jQuery(emptyResultElement));
            }

        }.bind(this));

    };

    return new User();

})(jQuery);

Intranet = Intranet || {};
Intranet.User = Intranet.User || {};

Intranet.User.FacebookProfileSync = (function ($) {
    function FacebookProfileSync() {

    }

    FacebookProfileSync.prototype.getDetails = function() {
        $('.fb-login-container .fb-login-button').hide();
        $('.fb-login-container').append('<div class="loading loading-red"><div></div><div></div><div></div><div></div></div>');

        FB.api('/me', {fields: 'birthday, location'}, function (details) {
            this.saveDetails(details);
        }.bind(this));
    };

    FacebookProfileSync.prototype.saveDetails = function(details) {
        var data = {
            action: 'sync_facebook_profile',
            details: details
        };

        $.post(ajaxurl, data, function (response) {
            if (response !== '1') {
                $('.fb-login-container .loading').remove();
                $('.fb-login-container').append('<div class="notice warning">Facebook details did not sync due to an error</div>');

                return false;
            }

            $('.fb-login-container .loading').remove();
            $('.fb-login-container').append('<div class="notice success">Facebook details synced to your profile</div>');

            return true;
        });
    };

    return new FacebookProfileSync();

})(jQuery);


function facebookProfileSync() {
    Intranet.User.FacebookProfileSync.getDetails();
}

Intranet = Intranet || {};
Intranet.User = Intranet.User || {};

Intranet.User.Links = (function ($) {

    /**
     * Constructor
     * Should be named as the class itself
     */
    function Links() {
        $('[data-user-link-edit]').on('click', function (e) {
            this.toggleEdit(e.target);
        }.bind(this));

        $('[data-user-link-add]').on('submit', function (e) {
            e.preventDefault();

            $element = $(e.target).closest('form').parents('.box');

            var title = $(e.target).closest('form').find('[name="user-link-title"]').val();
            var link = $(e.target).closest('form').find('[name="user-link-url"]').val();

            this.addLink(title, link, $element);
        }.bind(this));

        $(document).on('click', '[data-user-link-remove]', function (e) {
            e.preventDefault();

            var button = $(e.target).closest('button');
            var element = button.parents('.box');
            var link = $(e.target).closest('button').attr('data-user-link-remove');

            this.removeLink(element, link, button);
        }.bind(this));
    }

    Links.prototype.toggleEdit = function (target) {
        $target = $(target).closest('[data-user-link-edit]');
        $box = $target.parents('.box');

        if ($box.hasClass('is-editing')) {
            $box.removeClass('is-editing');
            $target.html(municipioIntranet.edit).removeClass('pricon-check').addClass('pricon-edit');
            return;
        }

        $box.addClass('is-editing');
        $target.html(municipioIntranet.done).addClass('pricon-check').removeClass('pricon-edit');
    };

    Links.prototype.addLink = function (title, link, element) {
        if (!title.length || !link.length) {
            return false;
        }

        var data = {
            action: 'add_user_link',
            title: title,
            url: link
        };

        var buttonText = $(element).find('button[type="submit"]').html();
        $(element).find('button[type="submit"]').html('<i class="spinner spinner-dark"></i>');

        $.post(ajaxurl, data, function (res) {
            if (typeof res !== 'object') {
                return;
            }

            element.find('ul.links').empty();

            $.each(res, function (index, link) {
                this.addLinkToDom(element, link);
                $(element).find('input[type="text"]').val('');
            }.bind(this));

            $(element).find('button[type="submit"]').html(buttonText);
        }.bind(this), 'JSON');
    };

    Links.prototype.addLinkToDom = function (element, link) {
        var $list = element.find('ul.links');

        if ($list.length === 0) {
            element.find('.box-content').html('<ul class="links"></ul>');
            $list = element.find('ul.links');
        }

        $list.append('\
            <li>\
                <a class="link-item link-item-light" href="' + link.url + '">' + link.title + '</a>\
                <button class="btn btn-icon btn-sm text-lg pull-right only-if-editing" data-user-link-remove="' + link.url + '">&times;</button>\
            </li>\
        ');
    };

    Links.prototype.removeLink = function (element, link, button) {
        var data = {
            action: 'remove_user_link',
            url: link
        };

        button.html('<i class="spinner spinner-dark"></i>');

        $.post(ajaxurl, data, function (res) {
            if (typeof res !== 'object') {
                return;
            }

            if (res.length === 0) {
                element.find('ul.links').remove();
                element.find('.box-content').text(municipioIntranet.user_links_is_empty);
            }

            element.find('ul.links').empty();

            $.each(res, function (index, link) {
                this.addLinkToDom(element, link);
            }.bind(this));
        }.bind(this), 'JSON');
    };

    return new Links();

})(jQuery);

Intranet = Intranet || {};
Intranet.User = Intranet.User || {};

va = (function ($) {

    var cookieKey = 'login_reminder';

    /**
     * Constructor
     * Should be named as the class itself
     */
    function LoginReminder() {
        var dateNow = new Date().getTime();

        // Logged in
        if (municipioIntranet.is_user_logged_in) {
            HelsingborgPrime.Helper.Cookie.set(cookieKey, dateNow, 30);
            return;
        }

        // Not logged in and no previous login cookie
        if (HelsingborgPrime.Helper.Cookie.get(cookieKey).length === 0) {
            HelsingborgPrime.Helper.Cookie.set(cookieKey, dateNow, 30);
            this.showReminder();
            return;
        }

        // Not logged in and has previous login cookie
        var lastReminder = HelsingborgPrime.Helper.Cookie.get(cookieKey);
        lastReminder = new Date().setTime(lastReminder);

        var daysSinceLastReminder = Math.round((dateNow - lastReminder) / (1000 * 60 * 60 * 24));
        if (daysSinceLastReminder > 6) {
            this.showReminder();
            HelsingborgPrime.Helper.Cookie.set(cookieKey, dateNow, 30);
            return;
        }

        $('#modal-login-reminder').remove();

        return;
    }

    LoginReminder.prototype.showReminder = function() {
        $('#modal-login-reminder').addClass('modal-open');
        $('body').addClass('overflow-hidden');
    };

    return new LoginReminder();

})(jQuery);

Intranet = Intranet || {};
Intranet.User = Intranet.User || {};

Intranet.User.Profile = (function ($) {

    function Profile() {

        $('#author-form input[type="submit"]').click(function(e) {

            var errorAccordion = this.locateAccordion();

            //Add & remove classes
            if(errorAccordion != null) {

                //Break current process
                e.preventDefault();

                //Show errors
                $("#author-form .form-errors").removeClass("hidden");
                $(".accordion-error",errorAccordion).removeClass("hidden");

                //Jump to errors
                location.href = "#form-errors";

            } else {
                $("#author-form .form-errors").addClass("hidden");
                $(".accordion-error",errorAccordion).addClass("hidden");
            }

        }.bind(this));
    }

    Profile.prototype.locateAccordion = function () {
        var returnValue = null;
        $("#author-form section.accordion-section").each(function(index,item){
            if($(".form-notice", item).length) {
                returnValue = item;
            }
        });
        return returnValue;
    };

    return new Profile();

})(jQuery);

Intranet = Intranet || {};
Intranet.User = Intranet.User || {};

Intranet.User.Subscribe = (function ($) {

    /**
     * Constructor
     * Should be named as the class itself
     */
    function Subscribe() {
        $('[data-subscribe]').on('click', function (e) {
            e.preventDefault();

            var buttonElement = $(e.target).closest('[data-subscribe]');
            var blogid = buttonElement.attr('data-subscribe');

            this.toggleSubscription(blogid, buttonElement);
        }.bind(this));
    }

    Subscribe.prototype.toggleSubscription = function (blogid, buttonElement) {
        var $allButtons = $('[data-subscribe="' + blogid + '"]');

        var postdata = {
            action: 'toggle_subscription',
            blog_id: blogid
        };

        $allButtons.html('<i class="spinner"></i>');

        $.post(ajaxurl, postdata, function (res) {
            if (res == 'subscribed') {
                $allButtons.html('<i class="pricon pricon-minus-o"></i> ' + municipioIntranet.unsubscribe);
            } else {
                $allButtons.html('<i class="pricon pricon-plus-o"></i> '  + municipioIntranet.subscribe);
            }
        });
    };

    return new Subscribe();

})(jQuery);

Intranet = Intranet || {};
Intranet.User = Intranet.User || {};

Intranet.User.WelcomePhrase = (function ($) {

    /**
     * Constructor
     * Should be named as the class itself
     */
    function WelcomePhrase() {
        $('[data-action="toggle-welcome-phrase"]').on('click', function (e) {
            e.preventDefault();
            this.togglePhrase(e.target);
        }.bind(this));
    }

    WelcomePhrase.prototype.togglePhrase = function (button) {
        var $btn = $(button).closest('[data-action="toggle-welcome-phrase"]');
        var $greeting = $('.greeting');

        $('[data-dropdown=".greeting-dropdown"]').trigger('click');

        $greeting.html('<div class="loading"><div></div><div></div><div></div><div></div></div>');

        $.get(ajaxurl, {action: 'toggle_welcome_phrase'}, function (res) {
            if (res.disabled) {
                $btn.text(municipioIntranet.enable_welcome_phrase);
                $('.greeting').html('<strong>' + municipioIntranet.user.full_name + '</strong>');
            } else {
                $btn.text(municipioIntranet.disable_welcome_phrase);
                $('.greeting').html(municipioIntranet.user.greet);
            }
        }, 'JSON');
    };

    return new WelcomePhrase();

})(jQuery);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsIkhlbHBlci9NaXNzaW5nRGF0YS5qcyIsIkhlbHBlci9XYWxrdGhyb3VnaC5qcyIsIk1pc2MvRm9ydW1zLmpzIiwiTWlzYy9OZXdzLmpzIiwiTWlzYy9SZXBvcnRQb3N0LmpzIiwiU2VhcmNoL0dlbmVyYWwuanMiLCJTZWFyY2gvU2l0ZXMuanMiLCJTZWFyY2gvVXNlci5qcyIsIlVzZXIvRmFjZWJvb2tQcm9maWxlU3luYy5qcyIsIlVzZXIvTGlua3MuanMiLCJVc2VyL0xvZ2luUmVtaW5kZXIuanMiLCJVc2VyL1Byb2ZpbGUuanMiLCJVc2VyL1N1YnNjcmliZS5qcyIsIlVzZXIvV2VsY29tZVBocmFzZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMvRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgSW50cmFuZXQ7XG4iLCJJbnRyYW5ldCA9IEludHJhbmV0IHx8IHt9O1xuSW50cmFuZXQuSGVscGVyID0gSW50cmFuZXQuSGVscGVyIHx8IHt9O1xuXG5JbnRyYW5ldC5IZWxwZXIuTWlzc2luZ0RhdGEgPSAoZnVuY3Rpb24gKCQpIHtcblxuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdG9yXG4gICAgICogU2hvdWxkIGJlIG5hbWVkIGFzIHRoZSBjbGFzcyBpdHNlbGZcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBNaXNzaW5nRGF0YSgpIHtcbiAgICAgICAgJCgnW2RhdGEtZ3VpZGUtbmF2PVwibmV4dFwiXSwgW2RhdGEtZ3VpZGUtbmF2PVwicHJldlwiXScpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAkZm9ybSA9ICQoZS50YXJnZXQpLnBhcmVudHMoJ2Zvcm0nKTtcbiAgICAgICAgICAgICRmaWVsZHMgPSAkKGUudGFyZ2V0KS5wYXJlbnRzKCdzZWN0aW9uJykuZmluZCgnOmlucHV0Om5vdChbbmFtZT1cImFjdGl2ZS1zZWN0aW9uXCJdKScpO1xuXG4gICAgICAgICAgICB2YXIgc2VjdGlvbklzVmFsaWQgPSB0cnVlO1xuICAgICAgICAgICAgJGZpZWxkcy5lYWNoKGZ1bmN0aW9uIChpbmRleCwgZWxlbWVudCkge1xuICAgICAgICAgICAgICAgIC8vIFZhbGlkXG4gICAgICAgICAgICAgICAgaWYgKCQodGhpcylbMF0uY2hlY2tWYWxpZGl0eSgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBOb3QgdmFsaWRcbiAgICAgICAgICAgICAgICBzZWN0aW9uSXNWYWxpZCA9IGZhbHNlO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGlmICghc2VjdGlvbklzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICAkZm9ybS5maW5kKCc6c3VibWl0JykudHJpZ2dlcignY2xpY2snKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IE1pc3NpbmdEYXRhKCk7XG5cbn0pKGpRdWVyeSk7XG4iLCJJbnRyYW5ldCA9IEludHJhbmV0IHx8IHt9O1xuSW50cmFuZXQuSGVscGVyID0gSW50cmFuZXQuSGVscGVyIHx8IHt9O1xuXG5JbnRyYW5ldC5IZWxwZXIuV2Fsa3Rocm91Z2ggPSAoZnVuY3Rpb24gKCQpIHtcblxuICAgIHZhciBjdXJyZW50SW5kZXggPSAwO1xuXG4gICAgLyoqXG4gICAgICogQ29uc3RydWN0b3JcbiAgICAgKiBTaG91bGQgYmUgbmFtZWQgYXMgdGhlIGNsYXNzIGl0c2VsZlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIFdhbGt0aHJvdWdoKCkge1xuICAgICAgICAkKCcud2Fsa3Rocm91Z2ggW2RhdGEtZHJvcGRvd25dJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIHRoaXMuaGlnaGxpZ2h0QXJlYShlLnRhcmdldCk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgJCgnW2RhdGEtYWN0aW9uPVwid2Fsa3Rocm91Z2gtY2FuY2VsXCJdJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICQoZS50YXJnZXQpLmNsb3Nlc3QoJ1tkYXRhLWFjdGlvbj1cIndhbGt0aHJvdWdoLWNhbmNlbFwiXScpLnBhcmVudHMoJy53YWxrdGhyb3VnaCcpLmZpbmQoJy5ibGlwcGVyJykudHJpZ2dlcignY2xpY2snKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgICAkKCdbZGF0YS1hY3Rpb249XCJ3YWxrdGhyb3VnaC1uZXh0XCJdJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIHZhciBjdXJyZW50U3RlcCA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJ1tkYXRhLWFjdGlvbj1cIndhbGt0aHJvdWdoLW5leHRcIl0nKS5wYXJlbnRzKCcud2Fsa3Rocm91Z2gnKTtcbiAgICAgICAgICAgIHRoaXMubmV4dChjdXJyZW50U3RlcCk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgJCgnW2RhdGEtYWN0aW9uPVwid2Fsa3Rocm91Z2gtcHJldmlvdXNcIl0nKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgdmFyIGN1cnJlbnRTdGVwID0gJChlLnRhcmdldCkuY2xvc2VzdCgnW2RhdGEtYWN0aW9uPVwid2Fsa3Rocm91Z2gtcHJldmlvdXNcIl0nKS5wYXJlbnRzKCcud2Fsa3Rocm91Z2gnKTtcbiAgICAgICAgICAgIHRoaXMucHJldmlvdXMoY3VycmVudFN0ZXApO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgICQod2luZG93KS5vbigncmVzaXplIGxvYWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoJCgnLndhbGt0aHJvdWdoOnZpc2libGUnKS5sZW5ndGggPCAyKSB7XG4gICAgICAgICAgICAgICAgJCgnW2RhdGEtYWN0aW9uPVwid2Fsa3Rocm91Z2gtcHJldmlvdXNcIl0sIFtkYXRhLWFjdGlvbj1cIndhbGt0aHJvdWdoLW5leHRcIl0nKS5oaWRlKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAkKCdbZGF0YS1hY3Rpb249XCJ3YWxrdGhyb3VnaC1wcmV2aW91c1wiXSwgW2RhdGEtYWN0aW9uPVwid2Fsa3Rocm91Z2gtbmV4dFwiXScpLnNob3coKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJCh3aW5kb3cpLm9uKCdyZXNpemUgbG9hZCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICgkKCcud2Fsa3Rocm91Z2ggLmlzLWhpZ2hsaWdodGVkOm5vdCg6dmlzaWJsZSknKS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAkKCcud2Fsa3Rocm91Z2ggLmlzLWhpZ2hsaWdodGVkOm5vdCg6dmlzaWJsZSknKS5wYXJlbnQoJy53YWxrdGhyb3VnaCcpLmZpbmQoJy5ibGlwcGVyJykudHJpZ2dlcignY2xpY2snKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgV2Fsa3Rocm91Z2gucHJvdG90eXBlLmhpZ2hsaWdodEFyZWEgPSBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICB2YXIgJGVsZW1lbnQgPSAkKGVsZW1lbnQpLmNsb3Nlc3QoJ1tkYXRhLWRyb3Bkb3duXScpO1xuICAgICAgICB2YXIgaGlnaGxpZ2h0ID0gJGVsZW1lbnQucGFyZW50KCcud2Fsa3Rocm91Z2gnKS5hdHRyKCdkYXRhLWhpZ2hsaWdodCcpO1xuICAgICAgICB2YXIgJGhpZ2hsaWdodCA9ICQoaGlnaGxpZ2h0KTtcblxuICAgICAgICBpZiAoJGVsZW1lbnQuaGFzQ2xhc3MoJ2lzLWhpZ2hsaWdodGVkJykpIHtcbiAgICAgICAgICAgIGlmICgkaGlnaGxpZ2h0LmRhdGEoJ3Bvc2l0aW9uJykpIHtcbiAgICAgICAgICAgICAgICAkaGlnaGxpZ2h0LmNzcygncG9zaXRpb24nLCAkaGlnaGxpZ2h0LmRhdGEoJ3Bvc2l0aW9uJykpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAkaGlnaGxpZ2h0LnByZXYoJy5iYWNrZHJvcCcpLnJlbW92ZSgpO1xuICAgICAgICAgICAgJGhpZ2hsaWdodC5yZW1vdmVDbGFzcygnd2Fsa3Rocm91Z2gtaGlnaGxpZ2h0Jyk7XG4gICAgICAgICAgICAkZWxlbWVudC5yZW1vdmVDbGFzcygnaXMtaGlnaGxpZ2h0ZWQnKTtcblxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgJGhpZ2hsaWdodC5iZWZvcmUoJzxkaXYgY2xhc3M9XCJiYWNrZHJvcFwiPjwvZGl2PicpO1xuXG4gICAgICAgIGlmICgkaGlnaGxpZ2h0LmNzcygncG9zaXRpb24nKSAhPT0gJ2Fic29sdXRlJyB8fMKgJGhpZ2hsaWdodC5jc3MoJ3Bvc2l0aW9uJykgIT09ICdyZWxhdGl2ZScpIHtcbiAgICAgICAgICAgICRoaWdobGlnaHQuZGF0YSgncG9zaXRpb24nLCAkaGlnaGxpZ2h0LmNzcygncG9zaXRpb24nKSkuY3NzKCdwb3NpdGlvbicsICdyZWxhdGl2ZScpO1xuICAgICAgICB9XG5cbiAgICAgICAgJGhpZ2hsaWdodC5hZGRDbGFzcygnd2Fsa3Rocm91Z2gtaGlnaGxpZ2h0Jyk7XG4gICAgICAgICRlbGVtZW50LmFkZENsYXNzKCdpcy1oaWdobGlnaHRlZCcpO1xuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG5cbiAgICBXYWxrdGhyb3VnaC5wcm90b3R5cGUubmV4dCA9IGZ1bmN0aW9uKGN1cnJlbnQpIHtcbiAgICAgICAgY3VycmVudEluZGV4Kys7XG5cbiAgICAgICAgdmFyICRjdXJyZW50ID0gY3VycmVudDtcbiAgICAgICAgdmFyICRuZXh0SXRlbSA9ICQoJy53YWxrdGhyb3VnaDplcSgnICsgY3VycmVudEluZGV4ICsgJyk6dmlzaWJsZScpO1xuXG4gICAgICAgIGlmICgkbmV4dEl0ZW0ubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAkbmV4dEl0ZW0gPSAkKCcud2Fsa3Rocm91Z2g6dmlzaWJsZTpmaXJzdCcpO1xuICAgICAgICAgICAgY3VycmVudEluZGV4ID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgICRjdXJyZW50LmZpbmQoJy5ibGlwcGVyJykudHJpZ2dlcignY2xpY2snKTtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkbmV4dEl0ZW0uZmluZCgnLmJsaXBwZXInKS50cmlnZ2VyKCdjbGljaycpO1xuICAgICAgICAgICAgdGhpcy5zY3JvbGxUbygkbmV4dEl0ZW1bMF0pO1xuICAgICAgICB9LmJpbmQodGhpcyksIDEpO1xuICAgIH07XG5cbiAgICBXYWxrdGhyb3VnaC5wcm90b3R5cGUucHJldmlvdXMgPSBmdW5jdGlvbihjdXJyZW50KSB7XG4gICAgICAgIGN1cnJlbnRJbmRleC0tO1xuXG4gICAgICAgIHZhciAkY3VycmVudCA9IGN1cnJlbnQ7XG4gICAgICAgIHZhciAkbmV4dEl0ZW0gPSAkKCcud2Fsa3Rocm91Z2g6ZXEoJyArIGN1cnJlbnRJbmRleCArICcpOnZpc2libGUnKTtcblxuICAgICAgICBpZiAoJG5leHRJdGVtLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgJG5leHRJdGVtID0gJCgnLndhbGt0aHJvdWdoOnZpc2libGUnKS5sYXN0KCk7XG4gICAgICAgICAgICBjdXJyZW50SW5kZXggPSAkbmV4dEl0ZW0uaW5kZXgoKTtcbiAgICAgICAgfVxuXG4gICAgICAgICRjdXJyZW50LmZpbmQoJy5ibGlwcGVyJykudHJpZ2dlcignY2xpY2snKTtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkbmV4dEl0ZW0uZmluZCgnLmJsaXBwZXInKS50cmlnZ2VyKCdjbGljaycpO1xuICAgICAgICAgICAgdGhpcy5zY3JvbGxUbygkbmV4dEl0ZW1bMF0pO1xuICAgICAgICB9LmJpbmQodGhpcyksIDEpO1xuICAgIH07XG5cbiAgICBXYWxrdGhyb3VnaC5wcm90b3R5cGUuc2Nyb2xsVG8gPSBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICAgIGlmICghJChlbGVtZW50KS5pcygnOm9mZnNjcmVlbicpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgc2Nyb2xsVG8gPSAkKGVsZW1lbnQpLm9mZnNldCgpLnRvcDtcbiAgICAgICAgJCgnaHRtbCwgYm9keScpLmFuaW1hdGUoe1xuICAgICAgICAgICAgc2Nyb2xsVG9wOiAoc2Nyb2xsVG8tMTAwKVxuICAgICAgICB9LCAzMDApO1xuICAgIH07XG5cbiAgICByZXR1cm4gbmV3IFdhbGt0aHJvdWdoKCk7XG5cbn0pKGpRdWVyeSk7XG4iLCJJbnRyYW5ldCA9IEludHJhbmV0IHx8IHt9O1xuSW50cmFuZXQuTWlzYyA9IEludHJhbmV0Lk1pc2MgfHwge307XG5cbkludHJhbmV0Lk1pc2MuRm9ydW1zID0gKGZ1bmN0aW9uICgkKSB7XG5cbiAgICBmdW5jdGlvbiBGb3J1bXMoKSB7XG4gICAgICAgICQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5oYW5kbGVFdmVudHMoKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBIYW5kbGUgZXZlbnRzXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBGb3J1bXMucHJvdG90eXBlLmhhbmRsZUV2ZW50cyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJCgnI2VkaXQtZm9ydW0nKS5zdWJtaXQoZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlRm9ydW0oZSk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJyNkZWxldGUtZm9ydW0nLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgaWYgKHdpbmRvdy5jb25maXJtKG11bmljaXBpb0ludHJhbmV0LmRlbGV0ZV9jb25maXJtKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZGVsZXRlRm9ydW0oZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5tZW1iZXItYnV0dG9uJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIHRoaXMuam9pbkZvcnVtKGUpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgIH07XG5cbiAgICBGb3J1bXMucHJvdG90eXBlLmpvaW5Gb3J1bSA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAkdGFyZ2V0ID0gJChldmVudC5jdXJyZW50VGFyZ2V0KTtcbiAgICAgICAgJHRhcmdldC50b2dnbGVDbGFzcygnbWVtYmVyLWJ1dHRvbi0taXMtbWVtYmVyJyk7XG5cbiAgICAgICAgaWYgKCR0YXJnZXQuaGFzQ2xhc3MoJ21lbWJlci1idXR0b24tLWlzLW1lbWJlcicpKSB7XG4gICAgICAgICAgICAkKCcucHJpY29uJywgJHRhcmdldCkucmVtb3ZlQ2xhc3MoJ3ByaWNvbi1wbHVzLW8nKS5hZGRDbGFzcygncHJpY29uLW1pbnVzLW8nKTtcbiAgICAgICAgICAgICQoJy5tZW1iZXItYnV0dG9uX190ZXh0JywgJHRhcmdldCkudGV4dChtdW5pY2lwaW9JbnRyYW5ldC5sZWF2ZV9mb3J1bSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkKCcucHJpY29uJywgJHRhcmdldCkucmVtb3ZlQ2xhc3MoJ3ByaWNvbi1taW51cy1vJykuYWRkQ2xhc3MoJ3ByaWNvbi1wbHVzLW8nKTtcbiAgICAgICAgICAgICQoJy5tZW1iZXItYnV0dG9uX190ZXh0JywgJHRhcmdldCkudGV4dChtdW5pY2lwaW9JbnRyYW5ldC5qb2luX2ZvcnVtKTtcbiAgICAgICAgfVxuICAgICAgICAkdGFyZ2V0LmJsdXIoKTtcblxuICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgdXJsOiBhamF4dXJsLFxuICAgICAgICAgICAgdHlwZTogJ3Bvc3QnLFxuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIGFjdGlvbjogJ2pvaW5fZm9ydW0nLFxuICAgICAgICAgICAgICAgIHBvc3RJZDogJHRhcmdldC5kYXRhKCdwb3N0SWQnKVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBGb3J1bXMucHJvdG90eXBlLmRlbGV0ZUZvcnVtID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIHZhciBwb3N0SWQgPSAoJChldmVudC5jdXJyZW50VGFyZ2V0KS5kYXRhKCdwb3N0LWlkJykpO1xuICAgICAgICB2YXIgYXJjaGl2ZVVybCA9ICgkKGV2ZW50LmN1cnJlbnRUYXJnZXQpLmRhdGEoJ2FyY2hpdmUnKSk7XG5cbiAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICAgIG1ldGhvZDogXCJERUxFVEVcIixcbiAgICAgICAgICAgIHVybDogbXVuaWNpcGlvSW50cmFuZXQud3BhcGkudXJsICsgJ3dwL3YyL2ZvcnVtcy8nICsgcG9zdElkLFxuICAgICAgICAgICAgYmVmb3JlU2VuZDogZnVuY3Rpb24gKHhocikge1xuICAgICAgICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdYLVdQLU5vbmNlJywgbXVuaWNpcGlvSW50cmFuZXQud3BhcGkubm9uY2UpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZXBsYWNlKGFyY2hpdmVVcmwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgRm9ydW1zLnByb3RvdHlwZS51cGRhdGVGb3J1bSA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICB2YXIgJHRhcmdldCA9ICQoZXZlbnQudGFyZ2V0KSxcbiAgICAgICAgICAgIGRhdGEgPSBuZXcgRm9ybURhdGEoZXZlbnQudGFyZ2V0KSxcbiAgICAgICAgICAgIHBvc3RJZCA9IGRvY3VtZW50LmZvcm1zLmVkaXRmb3J1bS5wb3N0X2lkLnZhbHVlO1xuICAgICAgICBkYXRhLmFwcGVuZCgnc3RhdHVzJywgJ3ByaXZhdGUnKTtcblxuICAgICAgICBmdW5jdGlvbiBkaXNwbGF5RXJyb3IoKSB7XG4gICAgICAgICAgICAkKCcuc3Bpbm5lciwud2FybmluZycsICR0YXJnZXQpLnJlbW92ZSgpO1xuICAgICAgICAgICAgJCgnLm1vZGFsLWZvb3RlcicsICR0YXJnZXQpLnByZXBlbmQoJzxzcGFuIGNsYXNzPVwibm90aWNlIHdhcm5pbmcgZ3V0dGVyIGd1dHRlci1tYXJnaW4gZ3V0dGVyLXZlcnRpY2FsXCI+PGkgY2xhc3M9XCJwcmljb24gcHJpY29uLW5vdGljZS13YXJuaW5nXCI+PC9pPiAnICsgbXVuaWNpcGlvSW50cmFuZXQuc29tZXRoaW5nX3dlbnRfd3JvbmcgKyAnPC9zcGFuPicpO1xuICAgICAgICB9XG5cbiAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgICAgICB1cmw6IG11bmljaXBpb0ludHJhbmV0LndwYXBpLnVybCArICd3cC92Mi9mb3J1bXMvJyArIHBvc3RJZCxcbiAgICAgICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgICAgICBwcm9jZXNzRGF0YTogZmFsc2UsXG4gICAgICAgICAgICBjb250ZW50VHlwZTogZmFsc2UsXG4gICAgICAgICAgICBiZWZvcmVTZW5kOiBmdW5jdGlvbiAoeGhyKSB7XG4gICAgICAgICAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ1gtV1AtTm9uY2UnLCBtdW5pY2lwaW9JbnRyYW5ldC53cGFwaS5ub25jZSk7XG4gICAgICAgICAgICAgICAgJCgnYnV0dG9uW3R5cGU9XCJzdWJtaXRcIl0nLCAkdGFyZ2V0KS5hcHBlbmQoJyA8aSBjbGFzcz1cInNwaW5uZXJcIj48L2k+Jyk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiByZXNwb25zZS5saW5rICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZXBsYWNlKHJlc3BvbnNlLmxpbmspO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXlFcnJvcigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlcnJvcjogZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgIGRpc3BsYXlFcnJvcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfTtcblxuICAgIHJldHVybiBuZXcgRm9ydW1zKCk7XG5cbn0pKGpRdWVyeSk7XG4iLCJJbnRyYW5ldCA9IEludHJhbmV0IHx8IHt9O1xuSW50cmFuZXQuTWlzYyA9IEludHJhbmV0Lk1pc2MgfHwge307XG5cbkludHJhbmV0Lk1pc2MuTmV3cyA9IChmdW5jdGlvbiAoJCkge1xuICAgIGZ1bmN0aW9uIE5ld3MoKSB7XG5cbiAgICAgICAgLy9Jbml0XG4gICAgICAgIHRoaXMuY29udGFpbmVyICA9ICQoJy5tb2R1bGFyaXR5LW1vZC1pbnRyYW5ldC1uZXdzIC5pbnRyYW5ldC1uZXdzJyk7XG4gICAgICAgIHRoaXMuYnV0dG9uICAgICA9ICQoJy5tb2R1bGFyaXR5LW1vZC1pbnRyYW5ldC1uZXdzIFtkYXRhLWFjdGlvbj1cImludHJhbmV0LW5ld3MtbG9hZC1tb3JlXCJdJyk7XG4gICAgICAgIHRoaXMuY2F0ZWdvcnkgICA9ICQoJy5tb2R1bGFyaXR5LW1vZC1pbnRyYW5ldC1uZXdzIHNlbGVjdFtuYW1lPVwiY2F0XCJdJyk7XG5cbiAgICAgICAgLy9FbmFibGUgZGlzYWJsZWQgYnV0dG9uXG4gICAgICAgIHRoaXMuYnV0dG9uLnByb3AoJ2Rpc2FibGVkJywgZmFsc2UpO1xuXG4gICAgICAgIC8vTG9hZCBtb3JlIGNsaWNrXG4gICAgICAgIHRoaXMuYnV0dG9uLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICB0aGlzLmxvYWRNb3JlKHRoaXMuY29udGFpbmVyLCB0aGlzLmJ1dHRvbik7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgLy9DYXRlZ29yeSBzd2l0Y2hlclxuICAgICAgICB0aGlzLmNhdGVnb3J5Lm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgdGhpcy5jb250YWluZXIuZW1wdHkoKTtcbiAgICAgICAgICAgIHRoaXMubG9hZE1vcmUodGhpcy5jb250YWluZXIsIHRoaXMuYnV0dG9uKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICBOZXdzLnByb3RvdHlwZS5zaG93TG9hZGVyID0gZnVuY3Rpb24oYnV0dG9uKSB7XG4gICAgICAgIGJ1dHRvbi5oaWRlKCk7XG4gICAgICAgIGJ1dHRvbi5hZnRlcignPGRpdiBjbGFzcz1cImxvYWRpbmdcIj48ZGl2PjwvZGl2PjxkaXY+PC9kaXY+PGRpdj48L2Rpdj48ZGl2PjwvZGl2PjwvZGl2PicpO1xuICAgIH07XG5cbiAgICBOZXdzLnByb3RvdHlwZS5oaWRlTG9hZGVyID0gZnVuY3Rpb24oYnV0dG9uKSB7XG4gICAgICAgIGJ1dHRvbi5wYXJlbnQoKS5maW5kKCcubG9hZGluZycpLnJlbW92ZSgpO1xuICAgICAgICBidXR0b24uc2hvdygpO1xuICAgIH07XG5cbiAgICBOZXdzLnByb3RvdHlwZS5sb2FkTW9yZSA9IGZ1bmN0aW9uKGNvbnRhaW5lciwgYnV0dG9uKSB7XG4gICAgICAgIHZhciBjYWxsYmFja1VybCAgICAgPSBjb250YWluZXIuYXR0cignZGF0YS1pbmZpbml0ZS1zY3JvbGwtY2FsbGJhY2snKTtcbiAgICAgICAgdmFyIHBhZ2VzaXplICAgICAgICA9IGNvbnRhaW5lci5hdHRyKCdkYXRhLWluZmluaXRlLXNjcm9sbC1wYWdlc2l6ZScpO1xuICAgICAgICB2YXIgc2l0ZXMgICAgICAgICAgID0gY29udGFpbmVyLmF0dHIoJ2RhdGEtaW5maW5pdGUtc2Nyb2xsLXNpdGVzJyk7XG4gICAgICAgIHZhciBvZmZzZXQgICAgICAgICAgPSBjb250YWluZXIuZmluZCgnYS5ib3gtbmV3cycpLmxlbmd0aCA/IGNvbnRhaW5lci5maW5kKCdhLmJveC1uZXdzJykubGVuZ3RoIDogMDtcbiAgICAgICAgdmFyIG1vZHVsZSAgICAgICAgICA9IGNvbnRhaW5lci5hdHRyKCdkYXRhLW1vZHVsZScpO1xuICAgICAgICB2YXIgY2F0ZWdvcnkgICAgICAgID0gdGhpcy5jYXRlZ29yeS52YWwoKTtcbiAgICAgICAgdmFyIGFyZ3MgICAgICAgICAgICA9IGNvbnRhaW5lci5hdHRyKCdkYXRhLWFyZ3MnKTtcbiAgICAgICAgdmFyIHVybCAgICAgICAgICAgICA9IG51bGw7XG5cbiAgICAgICAgdGhpcy5zaG93TG9hZGVyKGJ1dHRvbik7XG5cbiAgICAgICAgaWYoIWlzTmFOKHBhcnNlRmxvYXQoY2F0ZWdvcnkpKSAmJiBpc0Zpbml0ZShjYXRlZ29yeSkpIHtcbiAgICAgICAgICAgIHVybCA9IGNhbGxiYWNrVXJsICsgcGFnZXNpemUgKyAnLycgKyBvZmZzZXQgKyAnLycgKyBzaXRlcyArICcvJyArIGNhdGVnb3J5O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdXJsID0gY2FsbGJhY2tVcmwgKyBwYWdlc2l6ZSArICcvJyArIG9mZnNldCArICcvJyArIHNpdGVzICsgJy8wJztcbiAgICAgICAgfVxuXG4gICAgICAgICQuYWpheCh7XG4gICAgICAgICAgICB1cmw6IHVybCxcbiAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIG1vZHVsZTogbW9kdWxlLFxuICAgICAgICAgICAgICAgIGFyZ3M6IGFyZ3NcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBkYXRhVHlwZTogJ0pTT04nLFxuICAgICAgICAgICAgYmVmb3JlU2VuZDogZnVuY3Rpb24gKHhocikge1xuICAgICAgICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdYLVdQLU5vbmNlJywgbXVuaWNpcGlvSW50cmFuZXQud3BhcGkubm9uY2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KS5kb25lKGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgICAgIGlmIChyZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5ub01vcmUoY29udGFpbmVyLCBidXR0b24pO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5vdXRwdXQoY29udGFpbmVyLCByZXMpO1xuICAgICAgICAgICAgdGhpcy5oaWRlTG9hZGVyKGJ1dHRvbik7XG5cbiAgICAgICAgICAgIGlmIChyZXMubGVuZ3RoIDwgcGFnZXNpemUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm5vTW9yZShjb250YWluZXIsIGJ1dHRvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfTtcblxuICAgIE5ld3MucHJvdG90eXBlLm5vTW9yZSA9IGZ1bmN0aW9uKGNvbnRhaW5lciwgYnV0dG9uKSB7XG4gICAgICAgIHRoaXMuaGlkZUxvYWRlcihidXR0b24pO1xuICAgICAgICBidXR0b24udGV4dChtdW5pY2lwaW9JbnRyYW5ldC5ub19tb3JlX25ld3MpLnByb3AoJ2Rpc2FibGVkJywgdHJ1ZSk7XG4gICAgfTtcblxuICAgIE5ld3MucHJvdG90eXBlLm91dHB1dCA9IGZ1bmN0aW9uKGNvbnRhaW5lciwgbmV3cykge1xuICAgICAgICAkLmVhY2gobmV3cywgZnVuY3Rpb24gKGluZGV4LCBpdGVtKSB7XG4gICAgICAgICAgICBjb250YWluZXIuYXBwZW5kKGl0ZW0ubWFya3VwKTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHJldHVybiBuZXcgTmV3cygpO1xuXG59KShqUXVlcnkpO1xuXG4iLCJJbnRyYW5ldCA9IEludHJhbmV0IHx8IHt9O1xuSW50cmFuZXQuTWlzYyA9IEludHJhbmV0Lk1pc2MgfHwge307XG5cbkludHJhbmV0Lk1pc2MuUmVwb3J0UG9zdCA9IChmdW5jdGlvbiAoJCkge1xuXG4gICAgZnVuY3Rpb24gUmVwb3J0UG9zdCgpIHtcbiAgICAgICAgJCgnLnJlcG9ydC1wb3N0Jykub24oJ3N1Ym1pdCcsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgICAgIHZhciAkdGFyZ2V0ID0gJCh0aGlzKSxcbiAgICAgICAgICAgICAgICBkYXRhID0gbmV3IEZvcm1EYXRhKHRoaXMpO1xuICAgICAgICAgICAgICAgIGRhdGEuYXBwZW5kKCdhY3Rpb24nLCAncmVwb3J0X3Bvc3QnKTtcblxuICAgICAgICAgICAgaWYgKGRhdGEuZ2V0KCdnLXJlY2FwdGNoYS1yZXNwb25zZScpID09PSAnJykge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgJHRhcmdldC5maW5kKCdpbnB1dFt0eXBlPVwic3VibWl0XCJdJykuaGlkZSgpO1xuICAgICAgICAgICAgJHRhcmdldC5maW5kKCcubW9kYWwtZm9vdGVyJykuYXBwZW5kKCc8ZGl2IGNsYXNzPVwibG9hZGluZ1wiPjxkaXY+PC9kaXY+PGRpdj48L2Rpdj48ZGl2PjwvZGl2PjxkaXY+PC9kaXY+PC9kaXY+Jyk7XG5cbiAgICAgICAgICAgICQuYWpheCh7XG4gICAgICAgICAgICAgICAgdXJsOiBhamF4dXJsLFxuICAgICAgICAgICAgICAgIHR5cGU6ICdQT1NUJyxcbiAgICAgICAgICAgICAgICBkYXRhOiBkYXRhLFxuICAgICAgICAgICAgICAgIGRhdGFUeXBlOiAnanNvbicsXG4gICAgICAgICAgICAgICAgcHJvY2Vzc0RhdGE6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGNvbnRlbnRUeXBlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihyZXNwb25zZSwgdGV4dFN0YXR1cywganFYSFIpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJy5tb2RhbC1mb290ZXInLCAkdGFyZ2V0KS5odG1sKCc8c3BhbiBjbGFzcz1cIm5vdGljZSBzdWNjZXNzXCI+PGkgY2xhc3M9XCJwcmljb24gcHJpY29uLWNoZWNrXCI+PC9pPiAnICsgcmVzcG9uc2UuZGF0YSArICc8L3NwYW4+Jyk7XG5cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICQoJy5tb2RhbC1mb290ZXInLCAkdGFyZ2V0KS5odG1sKCc8c3BhbiBjbGFzcz1cIm5vdGljZSB3YXJuaW5nXCI+PGkgY2xhc3M9XCJwcmljb24gcHJpY29uLW5vdGljZS13YXJuaW5nXCI+PC9pPiAnICsgcmVzcG9uc2UuZGF0YSArICc8L3NwYW4+Jyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGNvbXBsZXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbi5oYXNoID0gJyc7XG4gICAgICAgICAgICAgICAgICAgIH0sIDMwMDApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgUmVwb3J0UG9zdCgpO1xuXG59KShqUXVlcnkpO1xuIiwiSW50cmFuZXQgPSBJbnRyYW5ldCB8fCB7fTtcbkludHJhbmV0LlNlYXJjaCA9IEludHJhbmV0LlNlYXJjaCB8fCB7fTtcblxuSW50cmFuZXQuU2VhcmNoLkdlbmVyYWwgPSAoZnVuY3Rpb24gKCQpIHtcblxuICAgIHZhciB0eXBpbmdUaW1lcjtcblxuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdG9yXG4gICAgICogU2hvdWxkIGJlIG5hbWVkIGFzIHRoZSBjbGFzcyBpdHNlbGZcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBHZW5lcmFsKCkge1xuICAgICAgICAkKCcuc2VhcmNoIGZvcm0gaW5wdXRbbmFtZT1cImxldmVsXCJdJykub24oJ2NoYW5nZScsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAkKGUudGFyZ2V0KS5wYXJlbnRzKCdmb3JtJykuc3VibWl0KCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgICQoJy5uYXZiYXIgLnNlYXJjaCcpLmVhY2goZnVuY3Rpb24gKGluZGV4LCBlbGVtZW50KSB7XG4gICAgICAgICAgICB0aGlzLmF1dG9jb21wbGV0ZShlbGVtZW50KTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemVzIHRoZSBhdXRvY29tcGxldGUgZnVuY3Rpb25hbGl0eVxuICAgICAqIEBwYXJhbSAge29iamVjdH0gZWxlbWVudCBFbGVtZW50XG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBHZW5lcmFsLnByb3RvdHlwZS5hdXRvY29tcGxldGUgPSBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICAgIHZhciAkZWxlbWVudCA9ICQoZWxlbWVudCk7XG4gICAgICAgIHZhciAkaW5wdXQgPSAkZWxlbWVudC5maW5kKCdpbnB1dFt0eXBlPVwic2VhcmNoXCJdJyk7XG5cbiAgICAgICAgJGlucHV0Lm9uKCdrZXlkb3duJywgZnVuY3Rpb24gKGUpIHtcblxuICAgICAgICAgICAgc3dpdGNoIChlLndoaWNoKSB7XG4gICAgICAgICAgICAgICAgY2FzZSA0MDpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hdXRvY29tcGxldGVLZXlib2FyZE5hdk5leHQoZWxlbWVudCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcblxuICAgICAgICAgICAgICAgIGNhc2UgMzg6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYXV0b2NvbXBsZXRlS2V5Ym9hcmROYXZQcmV2KGVsZW1lbnQpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICBjYXNlIDEzOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5hdXRvY29tcGxldGVTdWJtaXQoZWxlbWVudCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0eXBpbmdUaW1lcik7XG5cbiAgICAgICAgICAgIGlmICgkaW5wdXQudmFsKCkubGVuZ3RoIDwgMykge1xuICAgICAgICAgICAgICAgICRlbGVtZW50LmZpbmQoJy5zZWFyY2gtYXV0b2NvbXBsZXRlJykucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0eXBpbmdUaW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuYXV0b2NvbXBsZXRlUXVlcnkoZWxlbWVudCk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcyksIDMwMCk7XG5cbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgICAkKGRvY3VtZW50KS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgaWYgKCEkKGUudGFyZ2V0KS5jbG9zZXN0KCcuc2VhcmNoLWF1dG9jb21wbGV0ZScpLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICQoJy5zZWFyY2gtYXV0b2NvbXBsZXRlJykucmVtb3ZlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgICRpbnB1dC5vbignZm9jdXMnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgaWYgKCRpbnB1dC52YWwoKS5sZW5ndGggPCAzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5hdXRvY29tcGxldGVRdWVyeShlbGVtZW50KTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogU3VibWl0IGF1dG9jb21wbGV0ZVxuICAgICAqIEBwYXJhbSAge29iamVjdH0gZWxlbWVudCBBdXRvY29tcGxldGUgZWxlbWVudFxuICAgICAqIEByZXR1cm4ge2Jvb2x9XG4gICAgICovXG4gICAgR2VuZXJhbC5wcm90b3R5cGUuYXV0b2NvbXBsZXRlU3VibWl0ID0gZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgICB2YXIgJGVsZW1lbnQgPSAkKGVsZW1lbnQpO1xuICAgICAgICB2YXIgJGF1dG9jb21wbGV0ZSA9ICRlbGVtZW50LmZpbmQoJy5zZWFyY2gtYXV0b2NvbXBsZXRlJyk7XG4gICAgICAgIHZhciAkc2VsZWN0ZWQgPSAkYXV0b2NvbXBsZXRlLmZpbmQoJy5zZWxlY3RlZCcpO1xuXG4gICAgICAgIGlmICghJHNlbGVjdGVkLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgdXJsID0gJHNlbGVjdGVkLmZpbmQoJ2EnKS5hdHRyKCdocmVmJyk7XG4gICAgICAgIGxvY2F0aW9uLmhyZWYgPSB1cmw7XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBOYXZpZ2F0ZSB0byBuZXh0IGF1dG9jb21wbGV0ZSBsaXN0IGl0ZW1cbiAgICAgKiBAcGFyYW0gIHtvYmplY3R9IGVsZW1lbnQgQXV0b2NvbXBsZXRlIGVsZW1lbnRcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIEdlbmVyYWwucHJvdG90eXBlLmF1dG9jb21wbGV0ZUtleWJvYXJkTmF2TmV4dCA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgICAgdmFyICRlbGVtZW50ID0gJChlbGVtZW50KTtcbiAgICAgICAgdmFyICRhdXRvY29tcGxldGUgPSAkZWxlbWVudC5maW5kKCcuc2VhcmNoLWF1dG9jb21wbGV0ZScpO1xuXG4gICAgICAgIHZhciAkc2VsZWN0ZWQgPSAkYXV0b2NvbXBsZXRlLmZpbmQoJy5zZWxlY3RlZCcpO1xuICAgICAgICB2YXIgJG5leHQgPSBudWxsO1xuXG4gICAgICAgIGlmICghJHNlbGVjdGVkLmxlbmd0aCkge1xuICAgICAgICAgICAgJG5leHQgPSAkYXV0b2NvbXBsZXRlLmZpbmQoJ2xpOm5vdCgudGl0bGUpOmZpcnN0Jyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkbmV4dCA9ICRzZWxlY3RlZC5uZXh0KCdsaTpub3QoLnRpdGxlKTpmaXJzdCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCEkbmV4dC5sZW5ndGgpIHtcbiAgICAgICAgICAgIHZhciAkbmV4dFVsID0gJHNlbGVjdGVkLnBhcmVudHMoJ3VsJykubmV4dCgndWwnKTtcbiAgICAgICAgICAgIGlmICgkbmV4dFVsLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICRuZXh0ID0gJG5leHRVbC5maW5kKCdsaTpub3QoLnRpdGxlKTpmaXJzdCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgJHNlbGVjdGVkLnJlbW92ZUNsYXNzKCdzZWxlY3RlZCcpO1xuICAgICAgICAkbmV4dC5hZGRDbGFzcygnc2VsZWN0ZWQnKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogTmF2aWdhdGUgdG8gcHJldmlvdXMgYXV0b2NvbXBsZXRlIGxpc3QgaXRlbVxuICAgICAqIEBwYXJhbSAge29iamVjdH0gZWxlbWVudCBBdXRvY29tcGxldGUgZWxlbWVudFxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgR2VuZXJhbC5wcm90b3R5cGUuYXV0b2NvbXBsZXRlS2V5Ym9hcmROYXZQcmV2ID0gZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgICB2YXIgJGVsZW1lbnQgPSAkKGVsZW1lbnQpO1xuICAgICAgICB2YXIgJGF1dG9jb21wbGV0ZSA9ICRlbGVtZW50LmZpbmQoJy5zZWFyY2gtYXV0b2NvbXBsZXRlJyk7XG5cbiAgICAgICAgdmFyICRzZWxlY3RlZCA9ICRhdXRvY29tcGxldGUuZmluZCgnLnNlbGVjdGVkJyk7XG4gICAgICAgIHZhciAkcHJldiA9IG51bGw7XG5cbiAgICAgICAgaWYgKCEkc2VsZWN0ZWQubGVuZ3RoKSB7XG4gICAgICAgICAgICAkcHJldiA9ICRhdXRvY29tcGxldGUuZmluZCgnbGk6bm90KC50aXRsZSk6bGFzdCcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJHByZXYgPSAkc2VsZWN0ZWQucHJldignbGk6bm90KC50aXRsZSknKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghJHByZXYubGVuZ3RoKSB7XG4gICAgICAgICAgICB2YXIgJHByZXZVbCA9ICRzZWxlY3RlZC5wYXJlbnRzKCd1bCcpLnByZXYoJ3VsJyk7XG4gICAgICAgICAgICBpZiAoJHByZXZVbC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAkcHJldiA9ICRwcmV2VWwuZmluZCgnbGk6bm90KC50aXRsZSk6bGFzdCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgJHNlbGVjdGVkLnJlbW92ZUNsYXNzKCdzZWxlY3RlZCcpO1xuICAgICAgICAkcHJldi5hZGRDbGFzcygnc2VsZWN0ZWQnKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUXVlcnkgZm9yIGF1dG9jb21wbGV0ZSBzdWdnZXN0aW9uc1xuICAgICAqIEBwYXJhbSAge29iamVjdH0gZWxlbWVudCBBdXRvY29tcGxldGUgZWxlbWVudFxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgR2VuZXJhbC5wcm90b3R5cGUuYXV0b2NvbXBsZXRlUXVlcnkgPSBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICAgIHZhciAkZWxlbWVudCA9ICQoZWxlbWVudCk7XG4gICAgICAgIHZhciAkaW5wdXQgPSAkZWxlbWVudC5maW5kKCdpbnB1dFt0eXBlPVwic2VhcmNoXCJdJyk7XG4gICAgICAgIHZhciBxdWVyeSA9ICRpbnB1dC52YWwoKTtcblxuICAgICAgICB2YXIgZGF0YSA9IHtcbiAgICAgICAgICAgIGFjdGlvbjogJ3NlYXJjaF9hdXRvY29tcGxldGUnLFxuICAgICAgICAgICAgczogJGlucHV0LnZhbCgpLFxuICAgICAgICAgICAgbGV2ZWw6ICdhamF4J1xuICAgICAgICB9O1xuXG4gICAgICAgICRlbGVtZW50LmZpbmQoJ2J1dHRvblt0eXBlPVwic3VibWl0XCJdJykuYWRkQ2xhc3MoXCJzZWFyY2hpbmdcIik7XG5cbiAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICAgIHVybDogbXVuaWNpcGlvSW50cmFuZXQud3BhcGkudXJsICsgJ2ludHJhbmV0LzEuMC9zLycgKyBxdWVyeSxcbiAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgICAgICBkYXRhVHlwZTogJ0pTT04nLFxuICAgICAgICAgICAgYmVmb3JlU2VuZDogZnVuY3Rpb24gKCB4aHIgKSB7XG4gICAgICAgICAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ1gtV1AtTm9uY2UnLCBtdW5pY2lwaW9JbnRyYW5ldC53cGFwaS5ub25jZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pLmRvbmUoZnVuY3Rpb24gKHJlcykge1xuICAgICAgICAgICAgJGVsZW1lbnQuZmluZCgnLnNlYXJjaC1hdXRvY29tcGxldGUnKS5yZW1vdmUoKTtcbiAgICAgICAgICAgIHRoaXMub3V0cHV0QXV0b2NvbXBsZXRlKGVsZW1lbnQsIHJlcyk7XG4gICAgICAgICAgICAkZWxlbWVudC5maW5kKCdidXR0b25bdHlwZT1cInN1Ym1pdFwiXScpLnJlbW92ZUNsYXNzKFwic2VhcmNoaW5nXCIpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIE91dHB1dHMgdGhlIGF1dG9jb21wbGV0ZSBkcm9wZG93blxuICAgICAqIEBwYXJhbSAge29iamVjdH0gZWxlbWVudCBBdXRvY29tcGxldGUgZWxlbWVudFxuICAgICAqIEBwYXJhbSAge2FycmF5fSAgcmVzICAgICBBdXRvY29tcGxldGUgcXVlcnkgcmVzdWx0XG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBHZW5lcmFsLnByb3RvdHlwZS5vdXRwdXRBdXRvY29tcGxldGUgPSBmdW5jdGlvbihlbGVtZW50LCByZXMpIHtcbiAgICAgICAgdmFyICRlbGVtZW50ID0gJChlbGVtZW50KTtcbiAgICAgICAgdmFyICRhdXRvY29tcGxldGUgPSAkKCc8ZGl2IGNsYXNzPVwic2VhcmNoLWF1dG9jb21wbGV0ZVwiPjwvZGl2PicpO1xuXG4gICAgICAgIHZhciAkdXNlcnMgPSAkKCc8dWwgY2xhc3M9XCJzZWFyY2gtYXV0b2NvbXBsZXRlLXVzZXJzXCI+PGxpIGNsYXNzPVwidGl0bGVcIj48aSBjbGFzcz1cInByaWNvbiBwcmljb24tdXNlci1vXCI+PC9pPiAnICsgbXVuaWNpcGlvSW50cmFuZXQuc2VhcmNoQXV0b2NvbXBsZXRlLnBlcnNvbnMgKyAnPC9saT48L3VsPicpO1xuICAgICAgICB2YXIgJGNvbnRlbnQgPSAkKCc8dWwgY2xhc3M9XCJzZWFyY2gtYXV0b2NvbXBsZXRlLWNvbnRlbnRcIj48bGkgY2xhc3M9XCJ0aXRsZVwiPjxpIGNsYXNzPVwicHJpY29uIHByaWNvbi1maWxlLXRleHRcIj48L2k+ICcgKyBtdW5pY2lwaW9JbnRyYW5ldC5zZWFyY2hBdXRvY29tcGxldGUuY29udGVudCArICc8L2xpPjwvdWw+Jyk7XG5cbiAgICAgICAgLy8gVXNlcnNcbiAgICAgICAgaWYgKHR5cGVvZiByZXMudXNlcnMgIT0gJ3VuZGVmaW5lZCcgJiYgcmVzLnVzZXJzICE9PSBudWxsICYmIHJlcy51c2Vycy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAkLmVhY2gocmVzLnVzZXJzLCBmdW5jdGlvbiAoaW5kZXgsIHVzZXIpIHtcbiAgICAgICAgICAgICAgICBpZiAodXNlci5wcm9maWxlX2ltYWdlKSB7XG4gICAgICAgICAgICAgICAgICAgICR1c2Vycy5hcHBlbmQoJzxsaT48YSBocmVmPVwiJyArIHVzZXIucHJvZmlsZV91cmwgKyAnXCI+PGltZyBzcmM9XCInICsgdXNlci5wcm9maWxlX2ltYWdlICsgJ1wiIGNsYXNzPVwic2VhcmNoLWF1dG9jb21wbGV0ZS1pbWFnZVwiPiAnICsgdXNlci5uYW1lICsgJzwvYT48L2xpPicpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgJHVzZXJzLmFwcGVuZCgnPGxpPjxhIGhyZWY9XCInICsgdXNlci5wcm9maWxlX3VybCArICdcIj4nICsgdXNlci5uYW1lICsgJzwvYT48L2xpPicpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkdXNlcnMgPSAkKCcnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENvbnRlbnRcbiAgICAgICAgaWYgKHR5cGVvZiByZXMuY29udGVudCAhPSAndW5kZWZpbmVkJyAmJiByZXMuY29udGVudCAhPT0gbnVsbCAmJiByZXMuY29udGVudC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAkLmVhY2gocmVzLmNvbnRlbnQsIGZ1bmN0aW9uIChpbmRleCwgcG9zdCkge1xuICAgICAgICAgICAgICAgIGlmIChwb3N0LmlzX2ZpbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgJGNvbnRlbnQuYXBwZW5kKCc8bGk+PGEgY2xhc3M9XCJsaW5rLWl0ZW0tYmVmb3JlXCIgaHJlZj1cIicgKyBwb3N0LnBlcm1hbGluayArICdcIiB0YXJnZXQ9XCJfYmxhbmtcIj4nICsgcG9zdC5wb3N0X3RpdGxlICsgJzwvYT48L2xpPicpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICRjb250ZW50LmFwcGVuZCgnPGxpPjxhIGhyZWY9XCInICsgcG9zdC5wZXJtYWxpbmsgKyAnXCI+JyArIHBvc3QucG9zdF90aXRsZSArICc8L2E+PC9saT4nKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICRjb250ZW50ID0gJCgnJyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoKHJlcy5jb250ZW50ID09PSBudWxsIHx8IHJlcy5jb250ZW50Lmxlbmd0aCA9PT0gMCkgJiYgKHJlcy51c2VycyA9PT0gbnVsbCB8fCByZXMudXNlcnMubGVuZ3RoID09PSAwKSkge1xuICAgICAgICAgICAgLy8gJGF1dG9jb21wbGV0ZS5hcHBlbmQoJzx1bD48bGkgY2xhc3M9XCJzZWFyY2gtYXV0b2NvbXBsZXRlLW5vdGhpbmctZm91bmRcIj5JbmdhIHRyw6RmZmFy4oCmPC9saT48L3VsPicpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgJGNvbnRlbnQuYXBwZW5kVG8oJGF1dG9jb21wbGV0ZSk7XG4gICAgICAgICR1c2Vycy5hcHBlbmRUbygkYXV0b2NvbXBsZXRlKTtcblxuICAgICAgICAkYXV0b2NvbXBsZXRlLmFwcGVuZCgnPGJ1dHRvbiB0eXBlPVwic3VibWl0XCIgY2xhc3M9XCJyZWFkLW1vcmUgYmxvY2stbGV2ZWxcIj4nICsgbXVuaWNpcGlvSW50cmFuZXQuc2VhcmNoQXV0b2NvbXBsZXRlLnZpZXdBbGwgKyAnPC9hPicpO1xuXG4gICAgICAgICRhdXRvY29tcGxldGUuYXBwZW5kVG8oJGVsZW1lbnQpLnNob3coKTtcbiAgICB9O1xuXG4gICAgLy9yZXR1cm4gbmV3IEdlbmVyYWwoKTtcblxufSkoalF1ZXJ5KTtcbiIsIkludHJhbmV0ID0gSW50cmFuZXQgfHwge307XG5JbnRyYW5ldC5TZWFyY2ggPSBJbnRyYW5ldC5TZWFyY2ggfHwge307XG5cbkludHJhbmV0LlNlYXJjaC5TaXRlcyA9IChmdW5jdGlvbiAoJCkge1xuXG4gICAgdmFyIHR5cGVUaW1lciA9IGZhbHNlO1xuICAgIHZhciBidG5CZWZvcmUgPSBmYWxzZTtcblxuICAgIC8qKlxuICAgICAqIEhhbmRsZSBldmVudHMgZm9yIHRyaWdnZXJpbmcgYSBzZWFyY2hcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBTaXRlcygpIHtcbiAgICAgICAgYnRuQmVmb3JlID0gJCgnZm9ybS5uZXR3b3JrLXNlYXJjaCBidXR0b25bdHlwZT1cInN1Ym1pdFwiXScpLmh0bWwoKTtcblxuICAgICAgICAvLyBXaGlsZSB0eXBpbmcgaW4gaW5wdXRcbiAgICAgICAgJCgnZm9ybS5uZXR3b3JrLXNlYXJjaCBpbnB1dFt0eXBlPVwic2VhcmNoXCJdJykub24oJ2lucHV0JywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0eXBlVGltZXIpO1xuXG4gICAgICAgICAgICAkc2VhcmNoSW5wdXQgPSAkKGUudGFyZ2V0KS5jbG9zZXN0KCdpbnB1dFt0eXBlPVwic2VhcmNoXCJdJyk7XG4gICAgICAgICAgICB2YXIga2V5d29yZCA9ICRzZWFyY2hJbnB1dC52YWwoKTtcblxuICAgICAgICAgICAgaWYgKGtleXdvcmQubGVuZ3RoIDwgMikge1xuICAgICAgICAgICAgICAgICQoJ2Zvcm0ubmV0d29yay1zZWFyY2ggYnV0dG9uW3R5cGU9XCJzdWJtaXRcIl0nKS5odG1sKGJ0bkJlZm9yZSk7XG4gICAgICAgICAgICAgICAgJCgnLm5ldHdvcmstc2VhcmNoLXJlc3VsdHMtaXRlbXMnKS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAkKCcubmV0d29yay1zZWFyY2gtcmVzdWx0cyAubXktbmV0d29ya3MnKS5zaG93KCk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICQoJ2Zvcm0ubmV0d29yay1zZWFyY2ggYnV0dG9uW3R5cGU9XCJzdWJtaXRcIl0nKS5odG1sKCc8aSBjbGFzcz1cImxvYWRpbmctZG90cyBsb2FkaW5nLWRvdHMtaGlnaGlnaHRcIj48L2k+Jyk7XG5cbiAgICAgICAgICAgIHR5cGVUaW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2VhcmNoKGtleXdvcmQpO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLCAxMDAwKTtcblxuICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgIC8vIFN1Ym1pdCBidXR0b25cbiAgICAgICAgJCgnZm9ybS5uZXR3b3JrLXNlYXJjaCcpLm9uKCdzdWJtaXQnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHR5cGVUaW1lcik7XG5cbiAgICAgICAgICAgICQoJ2Zvcm0ubmV0d29yay1zZWFyY2ggYnV0dG9uW3R5cGU9XCJzdWJtaXRcIl0nKS5odG1sKCc8aSBjbGFzcz1cImxvYWRpbmctZG90cyBsb2FkaW5nLWRvdHMtaGlnaGlnaHRcIj48L2k+Jyk7XG4gICAgICAgICAgICAkc2VhcmNoSW5wdXQgPSAkKGUudGFyZ2V0KS5maW5kKCdpbnB1dFt0eXBlPVwic2VhcmNoXCJdJyk7XG5cbiAgICAgICAgICAgIHZhciBrZXl3b3JkID0gJHNlYXJjaElucHV0LnZhbCgpO1xuICAgICAgICAgICAgdGhpcy5zZWFyY2goa2V5d29yZCwgdHJ1ZSk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUGVyZm9ybXMgYW4gYWpheCBwb3N0IHRvIHRoZSBzZWFyY2ggc2NyaXB0XG4gICAgICogQHBhcmFtICB7c3RyaW5nfSBrZXl3b3JkIFRoZSBzZWFyY2gga2V5d29yZFxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgU2l0ZXMucHJvdG90eXBlLnNlYXJjaCA9IGZ1bmN0aW9uIChrZXl3b3JkLCByZWRpcmVjdFRvUGVyZmVjdE1hdGNoKSB7XG4gICAgICAgIGlmICh0eXBlb2YgcmVkaXJlY3RUb1BlcmZlY3RNYXRjaCA9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgcmVkaXJlY3RUb1BlcmZlY3RNYXRjaCA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGRhdGEgPSB7XG4gICAgICAgICAgICBhY3Rpb246ICdzZWFyY2hfc2l0ZXMnLFxuICAgICAgICAgICAgczoga2V5d29yZFxuICAgICAgICB9O1xuXG4gICAgICAgICQucG9zdChhamF4dXJsLCBkYXRhLCBmdW5jdGlvbiAocmVzKSB7XG4gICAgICAgICAgICBpZiAocmVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgJC5lYWNoKHJlcywgZnVuY3Rpb24gKGluZGV4LCBpdGVtKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lbXB0eVJlc3VsdHMoKTtcblxuICAgICAgICAgICAgICAgIGlmIChyZWRpcmVjdFRvUGVyZmVjdE1hdGNoICYmIGtleXdvcmQudG9Mb3dlckNhc2UoKSA9PSBpdGVtLm5hbWUudG9Mb3dlckNhc2UoKSB8fMKgKGl0ZW0uc2hvcnRfbmFtZS5sZW5ndGggJiYga2V5d29yZC50b0xvd2VyQ2FzZSgpID09IGl0ZW0uc2hvcnRfbmFtZS50b0xvd2VyQ2FzZSgpKSkge1xuXG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbiA9IGl0ZW0ucGF0aDtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRoaXMuYWRkUmVzdWx0KGl0ZW0uZG9tYWluLCBpdGVtLnBhdGgsIGl0ZW0ubmFtZSwgaXRlbS5zaG9ydF9uYW1lKTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgICAgIGlmIChidG5CZWZvcmUpIHtcbiAgICAgICAgICAgICAgICAkKCdmb3JtLm5ldHdvcmstc2VhcmNoIGJ1dHRvblt0eXBlPVwic3VibWl0XCJdJykuaHRtbChidG5CZWZvcmUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LmJpbmQodGhpcyksICdKU09OJyk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEFkZHMgYSBpdGVtIHRvIHRoZSByZXN1bHQgbGlzdFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBkb21haW4gICAgVGhlIGRvbWFpbiBvZiB0aGUgdXJsXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHBhdGggICAgICBUaGUgcGF0aCBvZiB0aGUgdXJsXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgICAgICBUaGUgbmFtZSBvZiB0aGUgbmV0d29yayBzaXRlXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHNob3J0bmFtZSBUaGUgc2hvcnQgbmFtZSBvZiB0aGUgbmV0d29yayBzaXRlXG4gICAgICovXG4gICAgU2l0ZXMucHJvdG90eXBlLmFkZFJlc3VsdCA9IGZ1bmN0aW9uIChkb21haW4sIHBhdGgsIG5hbWUsIHNob3J0bmFtZSkge1xuICAgICAgICAkKCcubmV0d29yay1zZWFyY2gtcmVzdWx0cyAubXktbmV0d29ya3MnKS5oaWRlKCk7XG5cbiAgICAgICAgaWYgKCQoJy5uZXR3b3JrLXNlYXJjaC1yZXN1bHRzLWl0ZW1zJykubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAkKCcubmV0d29yay1zZWFyY2gtcmVzdWx0cycpLmFwcGVuZCgnPHVsIGNsYXNzPVwibmV0d29yay1zZWFyY2gtcmVzdWx0cy1pdGVtc1wiPjwvdWw+Jyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc2hvcnRuYW1lKSB7XG4gICAgICAgICAgICAkKCcubmV0d29yay1zZWFyY2gtcmVzdWx0cy1pdGVtcycpLmFwcGVuZCgnPGxpIGNsYXNzPVwibmV0d29yay10aXRsZVwiPjxhIGhyZWY9XCIvLycgKyBkb21haW4gKyBwYXRoICsgJ1wiPicgKyBzaG9ydG5hbWUgKyAnIDxlbT4nICsgbmFtZSArICAnPC9lbT48L2E+PC9saT4nKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgICQoJy5uZXR3b3JrLXNlYXJjaC1yZXN1bHRzLWl0ZW1zJykuYXBwZW5kKCc8bGkgY2xhc3M9XCJuZXR3b3JrLXRpdGxlXCI+PGEgaHJlZj1cIi8vJyArIGRvbWFpbiArIHBhdGggKyAnXCI+JyArIG5hbWUgKyAgJzwvYT48L2xpPicpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBFbXB0aWVzIHRoZSByZXN1bHQgbGlzdFxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgU2l0ZXMucHJvdG90eXBlLmVtcHR5UmVzdWx0cyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJCgnLm5ldHdvcmstc2VhcmNoLXJlc3VsdHMtaXRlbXMnKS5lbXB0eSgpO1xuICAgIH07XG5cbiAgICByZXR1cm4gbmV3IFNpdGVzKCk7XG5cbn0pKGpRdWVyeSk7XG4iLCJcbkludHJhbmV0ID0gSW50cmFuZXQgfHwge307XG5JbnRyYW5ldC5TZWFyY2ggPSBJbnRyYW5ldC5TZWFyY2ggfHwge307XG5cbkludHJhbmV0LlNlYXJjaC5Vc2VyID0gKGZ1bmN0aW9uICgkKSB7XG5cbiAgICAvL0RlZmluZSB0YXJnZXQgZWxlbWVudHNcbiAgICB2YXIgbG9hZGVyRWxlbWVudCA9IFwiLmpzLXVzZXItbG9hZGVyXCI7XG4gICAgdmFyIGxvYWRlclRleHRFbGVtZW50ID0gXCIuanMtdXNlci1sb2FkZXItdGV4dFwiO1xuICAgIHZhciByZXN1bHRFbGVtZW50ID0gXCIuanMtdXNlci1zZWFyY2gtcmVzdWx0c1wiO1xuICAgIHZhciBlbXB0eVJlc3VsdEVsZW1lbnQgPSBcIi5qcy11c2VyLW51bWJlci1ub3QtZm91bmRcIjtcbiAgICB2YXIgbmJyT2ZNYXRjaGVzID0gXCIuanMtdXNlci1udW1iZXItZm91bmRcIjtcbiAgICB2YXIgYWxsQnV0dG9uRWxlbWVudCA9IFwiLmpzLXVzZXItc2hvdy1hbGwtcmVzdWx0c1wiO1xuXG4gICAgdmFyIHR5cGVUaW1lciA9IDA7XG5cbiAgICBmdW5jdGlvbiBVc2VyKCkge1xuXG4gICAgICAgIC8vRGlzYWJsZSBvbiBhbGwgcGFnZXMgbm90IGNvbnRhaW5naW5nIHVzZXIgd2lkZ2V0XG4gICAgICAgIGlmKGpRdWVyeShcIiN1c2VyLWxhenktbG9hZFwiKS5sZW5ndGggPT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9Jbml0aXRhbFxuICAgICAgICAkKCdpbnB1dFt0eXBlPVwic2VhcmNoXCJdLCAjYWxnb2xpYS1zZWFyY2gtYm94IGlucHV0JykuZWFjaChmdW5jdGlvbihpbmRleCwgaXRlbSkge1xuICAgICAgICAgICAgaWYoJChpdGVtKS52YWwoKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2VhcmNoSW5pdCgkKGl0ZW0pLnZhbCgpKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgJCh3aW5kb3cpLm9uKCdsb2FkJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAvLyBXaGlsZSB0eXBpbmcgaW4gaW5wdXRcbiAgICAgICAgICAgICQoJ2lucHV0W3R5cGU9XCJzZWFyY2hcIl0sICNhbGdvbGlhLXNlYXJjaC1ib3ggaW5wdXQnKS5vbignaW5wdXQnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0eXBlVGltZXIpO1xuICAgICAgICAgICAgICAgICRzZWFyY2hJbnB1dCA9ICQoZS50YXJnZXQpO1xuICAgICAgICAgICAgICAgIHZhciBrZXl3b3JkID0gJHNlYXJjaElucHV0LnZhbCgpO1xuICAgICAgICAgICAgICAgIHR5cGVUaW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNlYXJjaEluaXQoa2V5d29yZCk7XG4gICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpLCAxMDAwKTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgVXNlci5wcm90b3R5cGUuc2VhcmNoSW5pdCA9IGZ1bmN0aW9uKHF1ZXJ5KSB7XG5cbiAgICAgICAgdGhpcy5zaG93RWxlbWVudChqUXVlcnkobG9hZGVyVGV4dEVsZW1lbnQpKTtcbiAgICAgICAgdGhpcy5zaG93RWxlbWVudChqUXVlcnkobG9hZGVyRWxlbWVudCkpO1xuICAgICAgICB0aGlzLmhpZGVFbGVtZW50KGpRdWVyeShlbXB0eVJlc3VsdEVsZW1lbnQpKTtcbiAgICAgICAgdGhpcy5oaWRlRWxlbWVudChqUXVlcnkoYWxsQnV0dG9uRWxlbWVudCkpO1xuICAgICAgICB0aGlzLmhpZGVFbGVtZW50KGpRdWVyeShyZXN1bHRFbGVtZW50KSk7XG4gICAgICAgIHRoaXMuaGlkZUVsZW1lbnQoalF1ZXJ5KG5ick9mTWF0Y2hlcykpO1xuXG4gICAgICAgIHRoaXMuZmV0Y2hVc2VycyhxdWVyeSk7XG4gICAgfTtcblxuICAgIFVzZXIucHJvdG90eXBlLnNob3dFbGVtZW50PSBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICAgICAgdGFyZ2V0LnJlbW92ZUNsYXNzKFwiaGlkZGVuXCIpO1xuICAgIH07XG5cbiAgICBVc2VyLnByb3RvdHlwZS5oaWRlRWxlbWVudCA9IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgICAgICB0YXJnZXQuYWRkQ2xhc3MoXCJoaWRkZW5cIik7XG4gICAgfTtcblxuICAgIFVzZXIucHJvdG90eXBlLmRpc2FibGVCdXR0b24gPSBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICAgICAgdGFyZ2V0LmF0dHIoJ2Rpc2FibGVkJywgJ2Rpc2FibGVkJyk7XG4gICAgfTtcblxuICAgIFVzZXIucHJvdG90eXBlLmZldGNoVXNlcnMgPSBmdW5jdGlvbihxdWVyeSkge1xuXG4gICAgICAgIHZhciBkYXRhID0ge1xuICAgICAgICAgICAgJ2FjdGlvbic6ICdzZWFyY2hfdXNlcnMnLFxuICAgICAgICAgICAgJ3F1ZXJ5JzogcXVlcnlcbiAgICAgICAgfTtcblxuICAgICAgICAkLnBvc3QoYWpheHVybCwgZGF0YSwgZnVuY3Rpb24ocmVzcG9uc2UpIHtcblxuICAgICAgICAgICAgdGhpcy5oaWRlRWxlbWVudChqUXVlcnkobG9hZGVyRWxlbWVudCkpO1xuICAgICAgICAgICAgdGhpcy5oaWRlRWxlbWVudChqUXVlcnkobG9hZGVyVGV4dEVsZW1lbnQpKTtcblxuICAgICAgICAgICAgaWYodHlwZW9mIHJlc3BvbnNlLml0ZW1zICE9PSAndW5kZWZpbmVkJykge1xuXG4gICAgICAgICAgICAgICAgLy9FbXB0eSByZXN1bHRcbiAgICAgICAgICAgICAgICAkKHJlc3VsdEVsZW1lbnQpLmh0bWwoXCJcIik7XG5cbiAgICAgICAgICAgICAgICAvL0NyZWF0ZSBfIHZpZXcgdXNlciBpdGVtXG4gICAgICAgICAgICAgICAgdmFyIHVzZXJUZW1wbGF0ZSA9IHdwLnRlbXBsYXRlKFwidXNlci1pdGVtXCIpO1xuXG4gICAgICAgICAgICAgICAgLy9Qb3B1bGF0ZVxuICAgICAgICAgICAgICAgIHJlc3BvbnNlLml0ZW1zLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAkKHJlc3VsdEVsZW1lbnQpLmFwcGVuZCh1c2VyVGVtcGxhdGUoZWxlbWVudC5kYXRhKSk7XG4gICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgICAgICAgICAgIC8vU2hvd1xuICAgICAgICAgICAgICAgIHRoaXMuc2hvd0VsZW1lbnQoalF1ZXJ5KHJlc3VsdEVsZW1lbnQpKTtcblxuICAgICAgICAgICAgICAgIC8vQ3JlYXRlIF8gdmlldyB1c2VyIG1hdGNoZXNcbiAgICAgICAgICAgICAgICB2YXIgdXNlck1hdGNoZXNUZW1wbGF0ZSA9IHdwLnRlbXBsYXRlKFwidXNlci1uYnItbWF0Y2hlc1wiKTtcblxuICAgICAgICAgICAgICAgIC8vUG9wdWxhdGVcbiAgICAgICAgICAgICAgICAkKG5ick9mTWF0Y2hlcykuaHRtbCh1c2VyTWF0Y2hlc1RlbXBsYXRlKHtjb3VudDogcmVzcG9uc2UubmJyb2ZpdGVtc30pKTtcblxuICAgICAgICAgICAgICAgIC8vU2hvdyBtb3JlIGJ1dHRvbiAmIG51bWJlciBvZiBtYXRjaGVzXG4gICAgICAgICAgICAgICAgaWYocmVzcG9uc2UuaXRlbXMubGVuZ3RoICE9IHJlc3BvbnNlLm5icm9maXRlbXMpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zaG93RWxlbWVudChqUXVlcnkoYWxsQnV0dG9uRWxlbWVudCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLnNob3dFbGVtZW50KGpRdWVyeShuYnJPZk1hdGNoZXMpKTtcblxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmhpZGVFbGVtZW50KGpRdWVyeShhbGxCdXR0b25FbGVtZW50KSk7XG4gICAgICAgICAgICAgICAgdGhpcy5zaG93RWxlbWVudChqUXVlcnkoZW1wdHlSZXN1bHRFbGVtZW50KSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgIH07XG5cbiAgICByZXR1cm4gbmV3IFVzZXIoKTtcblxufSkoalF1ZXJ5KTtcbiIsIkludHJhbmV0ID0gSW50cmFuZXQgfHwge307XG5JbnRyYW5ldC5Vc2VyID0gSW50cmFuZXQuVXNlciB8fCB7fTtcblxuSW50cmFuZXQuVXNlci5GYWNlYm9va1Byb2ZpbGVTeW5jID0gKGZ1bmN0aW9uICgkKSB7XG4gICAgZnVuY3Rpb24gRmFjZWJvb2tQcm9maWxlU3luYygpIHtcblxuICAgIH1cblxuICAgIEZhY2Vib29rUHJvZmlsZVN5bmMucHJvdG90eXBlLmdldERldGFpbHMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgJCgnLmZiLWxvZ2luLWNvbnRhaW5lciAuZmItbG9naW4tYnV0dG9uJykuaGlkZSgpO1xuICAgICAgICAkKCcuZmItbG9naW4tY29udGFpbmVyJykuYXBwZW5kKCc8ZGl2IGNsYXNzPVwibG9hZGluZyBsb2FkaW5nLXJlZFwiPjxkaXY+PC9kaXY+PGRpdj48L2Rpdj48ZGl2PjwvZGl2PjxkaXY+PC9kaXY+PC9kaXY+Jyk7XG5cbiAgICAgICAgRkIuYXBpKCcvbWUnLCB7ZmllbGRzOiAnYmlydGhkYXksIGxvY2F0aW9uJ30sIGZ1bmN0aW9uIChkZXRhaWxzKSB7XG4gICAgICAgICAgICB0aGlzLnNhdmVEZXRhaWxzKGRldGFpbHMpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgIH07XG5cbiAgICBGYWNlYm9va1Byb2ZpbGVTeW5jLnByb3RvdHlwZS5zYXZlRGV0YWlscyA9IGZ1bmN0aW9uKGRldGFpbHMpIHtcbiAgICAgICAgdmFyIGRhdGEgPSB7XG4gICAgICAgICAgICBhY3Rpb246ICdzeW5jX2ZhY2Vib29rX3Byb2ZpbGUnLFxuICAgICAgICAgICAgZGV0YWlsczogZGV0YWlsc1xuICAgICAgICB9O1xuXG4gICAgICAgICQucG9zdChhamF4dXJsLCBkYXRhLCBmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgIGlmIChyZXNwb25zZSAhPT0gJzEnKSB7XG4gICAgICAgICAgICAgICAgJCgnLmZiLWxvZ2luLWNvbnRhaW5lciAubG9hZGluZycpLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICQoJy5mYi1sb2dpbi1jb250YWluZXInKS5hcHBlbmQoJzxkaXYgY2xhc3M9XCJub3RpY2Ugd2FybmluZ1wiPkZhY2Vib29rIGRldGFpbHMgZGlkIG5vdCBzeW5jIGR1ZSB0byBhbiBlcnJvcjwvZGl2PicpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAkKCcuZmItbG9naW4tY29udGFpbmVyIC5sb2FkaW5nJykucmVtb3ZlKCk7XG4gICAgICAgICAgICAkKCcuZmItbG9naW4tY29udGFpbmVyJykuYXBwZW5kKCc8ZGl2IGNsYXNzPVwibm90aWNlIHN1Y2Nlc3NcIj5GYWNlYm9vayBkZXRhaWxzIHN5bmNlZCB0byB5b3VyIHByb2ZpbGU8L2Rpdj4nKTtcblxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICByZXR1cm4gbmV3IEZhY2Vib29rUHJvZmlsZVN5bmMoKTtcblxufSkoalF1ZXJ5KTtcblxuXG5mdW5jdGlvbiBmYWNlYm9va1Byb2ZpbGVTeW5jKCkge1xuICAgIEludHJhbmV0LlVzZXIuRmFjZWJvb2tQcm9maWxlU3luYy5nZXREZXRhaWxzKCk7XG59XG4iLCJJbnRyYW5ldCA9IEludHJhbmV0IHx8IHt9O1xuSW50cmFuZXQuVXNlciA9IEludHJhbmV0LlVzZXIgfHwge307XG5cbkludHJhbmV0LlVzZXIuTGlua3MgPSAoZnVuY3Rpb24gKCQpIHtcblxuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdG9yXG4gICAgICogU2hvdWxkIGJlIG5hbWVkIGFzIHRoZSBjbGFzcyBpdHNlbGZcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBMaW5rcygpIHtcbiAgICAgICAgJCgnW2RhdGEtdXNlci1saW5rLWVkaXRdJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIHRoaXMudG9nZ2xlRWRpdChlLnRhcmdldCk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgJCgnW2RhdGEtdXNlci1saW5rLWFkZF0nKS5vbignc3VibWl0JywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICAgICAgJGVsZW1lbnQgPSAkKGUudGFyZ2V0KS5jbG9zZXN0KCdmb3JtJykucGFyZW50cygnLmJveCcpO1xuXG4gICAgICAgICAgICB2YXIgdGl0bGUgPSAkKGUudGFyZ2V0KS5jbG9zZXN0KCdmb3JtJykuZmluZCgnW25hbWU9XCJ1c2VyLWxpbmstdGl0bGVcIl0nKS52YWwoKTtcbiAgICAgICAgICAgIHZhciBsaW5rID0gJChlLnRhcmdldCkuY2xvc2VzdCgnZm9ybScpLmZpbmQoJ1tuYW1lPVwidXNlci1saW5rLXVybFwiXScpLnZhbCgpO1xuXG4gICAgICAgICAgICB0aGlzLmFkZExpbmsodGl0bGUsIGxpbmssICRlbGVtZW50KTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgICAkKGRvY3VtZW50KS5vbignY2xpY2snLCAnW2RhdGEtdXNlci1saW5rLXJlbW92ZV0nLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgICAgICB2YXIgYnV0dG9uID0gJChlLnRhcmdldCkuY2xvc2VzdCgnYnV0dG9uJyk7XG4gICAgICAgICAgICB2YXIgZWxlbWVudCA9IGJ1dHRvbi5wYXJlbnRzKCcuYm94Jyk7XG4gICAgICAgICAgICB2YXIgbGluayA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJ2J1dHRvbicpLmF0dHIoJ2RhdGEtdXNlci1saW5rLXJlbW92ZScpO1xuXG4gICAgICAgICAgICB0aGlzLnJlbW92ZUxpbmsoZWxlbWVudCwgbGluaywgYnV0dG9uKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICBMaW5rcy5wcm90b3R5cGUudG9nZ2xlRWRpdCA9IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICAgICAgJHRhcmdldCA9ICQodGFyZ2V0KS5jbG9zZXN0KCdbZGF0YS11c2VyLWxpbmstZWRpdF0nKTtcbiAgICAgICAgJGJveCA9ICR0YXJnZXQucGFyZW50cygnLmJveCcpO1xuXG4gICAgICAgIGlmICgkYm94Lmhhc0NsYXNzKCdpcy1lZGl0aW5nJykpIHtcbiAgICAgICAgICAgICRib3gucmVtb3ZlQ2xhc3MoJ2lzLWVkaXRpbmcnKTtcbiAgICAgICAgICAgICR0YXJnZXQuaHRtbChtdW5pY2lwaW9JbnRyYW5ldC5lZGl0KS5yZW1vdmVDbGFzcygncHJpY29uLWNoZWNrJykuYWRkQ2xhc3MoJ3ByaWNvbi1lZGl0Jyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAkYm94LmFkZENsYXNzKCdpcy1lZGl0aW5nJyk7XG4gICAgICAgICR0YXJnZXQuaHRtbChtdW5pY2lwaW9JbnRyYW5ldC5kb25lKS5hZGRDbGFzcygncHJpY29uLWNoZWNrJykucmVtb3ZlQ2xhc3MoJ3ByaWNvbi1lZGl0Jyk7XG4gICAgfTtcblxuICAgIExpbmtzLnByb3RvdHlwZS5hZGRMaW5rID0gZnVuY3Rpb24gKHRpdGxlLCBsaW5rLCBlbGVtZW50KSB7XG4gICAgICAgIGlmICghdGl0bGUubGVuZ3RoIHx8ICFsaW5rLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGRhdGEgPSB7XG4gICAgICAgICAgICBhY3Rpb246ICdhZGRfdXNlcl9saW5rJyxcbiAgICAgICAgICAgIHRpdGxlOiB0aXRsZSxcbiAgICAgICAgICAgIHVybDogbGlua1xuICAgICAgICB9O1xuXG4gICAgICAgIHZhciBidXR0b25UZXh0ID0gJChlbGVtZW50KS5maW5kKCdidXR0b25bdHlwZT1cInN1Ym1pdFwiXScpLmh0bWwoKTtcbiAgICAgICAgJChlbGVtZW50KS5maW5kKCdidXR0b25bdHlwZT1cInN1Ym1pdFwiXScpLmh0bWwoJzxpIGNsYXNzPVwic3Bpbm5lciBzcGlubmVyLWRhcmtcIj48L2k+Jyk7XG5cbiAgICAgICAgJC5wb3N0KGFqYXh1cmwsIGRhdGEsIGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcmVzICE9PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZWxlbWVudC5maW5kKCd1bC5saW5rcycpLmVtcHR5KCk7XG5cbiAgICAgICAgICAgICQuZWFjaChyZXMsIGZ1bmN0aW9uIChpbmRleCwgbGluaykge1xuICAgICAgICAgICAgICAgIHRoaXMuYWRkTGlua1RvRG9tKGVsZW1lbnQsIGxpbmspO1xuICAgICAgICAgICAgICAgICQoZWxlbWVudCkuZmluZCgnaW5wdXRbdHlwZT1cInRleHRcIl0nKS52YWwoJycpO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgICAgICAgJChlbGVtZW50KS5maW5kKCdidXR0b25bdHlwZT1cInN1Ym1pdFwiXScpLmh0bWwoYnV0dG9uVGV4dCk7XG4gICAgICAgIH0uYmluZCh0aGlzKSwgJ0pTT04nKTtcbiAgICB9O1xuXG4gICAgTGlua3MucHJvdG90eXBlLmFkZExpbmtUb0RvbSA9IGZ1bmN0aW9uIChlbGVtZW50LCBsaW5rKSB7XG4gICAgICAgIHZhciAkbGlzdCA9IGVsZW1lbnQuZmluZCgndWwubGlua3MnKTtcblxuICAgICAgICBpZiAoJGxpc3QubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICBlbGVtZW50LmZpbmQoJy5ib3gtY29udGVudCcpLmh0bWwoJzx1bCBjbGFzcz1cImxpbmtzXCI+PC91bD4nKTtcbiAgICAgICAgICAgICRsaXN0ID0gZWxlbWVudC5maW5kKCd1bC5saW5rcycpO1xuICAgICAgICB9XG5cbiAgICAgICAgJGxpc3QuYXBwZW5kKCdcXFxuICAgICAgICAgICAgPGxpPlxcXG4gICAgICAgICAgICAgICAgPGEgY2xhc3M9XCJsaW5rLWl0ZW0gbGluay1pdGVtLWxpZ2h0XCIgaHJlZj1cIicgKyBsaW5rLnVybCArICdcIj4nICsgbGluay50aXRsZSArICc8L2E+XFxcbiAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiYnRuIGJ0bi1pY29uIGJ0bi1zbSB0ZXh0LWxnIHB1bGwtcmlnaHQgb25seS1pZi1lZGl0aW5nXCIgZGF0YS11c2VyLWxpbmstcmVtb3ZlPVwiJyArIGxpbmsudXJsICsgJ1wiPiZ0aW1lczs8L2J1dHRvbj5cXFxuICAgICAgICAgICAgPC9saT5cXFxuICAgICAgICAnKTtcbiAgICB9O1xuXG4gICAgTGlua3MucHJvdG90eXBlLnJlbW92ZUxpbmsgPSBmdW5jdGlvbiAoZWxlbWVudCwgbGluaywgYnV0dG9uKSB7XG4gICAgICAgIHZhciBkYXRhID0ge1xuICAgICAgICAgICAgYWN0aW9uOiAncmVtb3ZlX3VzZXJfbGluaycsXG4gICAgICAgICAgICB1cmw6IGxpbmtcbiAgICAgICAgfTtcblxuICAgICAgICBidXR0b24uaHRtbCgnPGkgY2xhc3M9XCJzcGlubmVyIHNwaW5uZXItZGFya1wiPjwvaT4nKTtcblxuICAgICAgICAkLnBvc3QoYWpheHVybCwgZGF0YSwgZnVuY3Rpb24gKHJlcykge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiByZXMgIT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAocmVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuZmluZCgndWwubGlua3MnKS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICBlbGVtZW50LmZpbmQoJy5ib3gtY29udGVudCcpLnRleHQobXVuaWNpcGlvSW50cmFuZXQudXNlcl9saW5rc19pc19lbXB0eSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGVsZW1lbnQuZmluZCgndWwubGlua3MnKS5lbXB0eSgpO1xuXG4gICAgICAgICAgICAkLmVhY2gocmVzLCBmdW5jdGlvbiAoaW5kZXgsIGxpbmspIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFkZExpbmtUb0RvbShlbGVtZW50LCBsaW5rKTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgIH0uYmluZCh0aGlzKSwgJ0pTT04nKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIG5ldyBMaW5rcygpO1xuXG59KShqUXVlcnkpO1xuIiwiSW50cmFuZXQgPSBJbnRyYW5ldCB8fCB7fTtcbkludHJhbmV0LlVzZXIgPSBJbnRyYW5ldC5Vc2VyIHx8IHt9O1xuXG52YSA9IChmdW5jdGlvbiAoJCkge1xuXG4gICAgdmFyIGNvb2tpZUtleSA9ICdsb2dpbl9yZW1pbmRlcic7XG5cbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3RvclxuICAgICAqIFNob3VsZCBiZSBuYW1lZCBhcyB0aGUgY2xhc3MgaXRzZWxmXG4gICAgICovXG4gICAgZnVuY3Rpb24gTG9naW5SZW1pbmRlcigpIHtcbiAgICAgICAgdmFyIGRhdGVOb3cgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblxuICAgICAgICAvLyBMb2dnZWQgaW5cbiAgICAgICAgaWYgKG11bmljaXBpb0ludHJhbmV0LmlzX3VzZXJfbG9nZ2VkX2luKSB7XG4gICAgICAgICAgICBIZWxzaW5nYm9yZ1ByaW1lLkhlbHBlci5Db29raWUuc2V0KGNvb2tpZUtleSwgZGF0ZU5vdywgMzApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTm90IGxvZ2dlZCBpbiBhbmQgbm8gcHJldmlvdXMgbG9naW4gY29va2llXG4gICAgICAgIGlmIChIZWxzaW5nYm9yZ1ByaW1lLkhlbHBlci5Db29raWUuZ2V0KGNvb2tpZUtleSkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICBIZWxzaW5nYm9yZ1ByaW1lLkhlbHBlci5Db29raWUuc2V0KGNvb2tpZUtleSwgZGF0ZU5vdywgMzApO1xuICAgICAgICAgICAgdGhpcy5zaG93UmVtaW5kZXIoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE5vdCBsb2dnZWQgaW4gYW5kIGhhcyBwcmV2aW91cyBsb2dpbiBjb29raWVcbiAgICAgICAgdmFyIGxhc3RSZW1pbmRlciA9IEhlbHNpbmdib3JnUHJpbWUuSGVscGVyLkNvb2tpZS5nZXQoY29va2llS2V5KTtcbiAgICAgICAgbGFzdFJlbWluZGVyID0gbmV3IERhdGUoKS5zZXRUaW1lKGxhc3RSZW1pbmRlcik7XG5cbiAgICAgICAgdmFyIGRheXNTaW5jZUxhc3RSZW1pbmRlciA9IE1hdGgucm91bmQoKGRhdGVOb3cgLSBsYXN0UmVtaW5kZXIpIC8gKDEwMDAgKiA2MCAqIDYwICogMjQpKTtcbiAgICAgICAgaWYgKGRheXNTaW5jZUxhc3RSZW1pbmRlciA+IDYpIHtcbiAgICAgICAgICAgIHRoaXMuc2hvd1JlbWluZGVyKCk7XG4gICAgICAgICAgICBIZWxzaW5nYm9yZ1ByaW1lLkhlbHBlci5Db29raWUuc2V0KGNvb2tpZUtleSwgZGF0ZU5vdywgMzApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgJCgnI21vZGFsLWxvZ2luLXJlbWluZGVyJykucmVtb3ZlKCk7XG5cbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIExvZ2luUmVtaW5kZXIucHJvdG90eXBlLnNob3dSZW1pbmRlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAkKCcjbW9kYWwtbG9naW4tcmVtaW5kZXInKS5hZGRDbGFzcygnbW9kYWwtb3BlbicpO1xuICAgICAgICAkKCdib2R5JykuYWRkQ2xhc3MoJ292ZXJmbG93LWhpZGRlbicpO1xuICAgIH07XG5cbiAgICByZXR1cm4gbmV3IExvZ2luUmVtaW5kZXIoKTtcblxufSkoalF1ZXJ5KTtcbiIsIkludHJhbmV0ID0gSW50cmFuZXQgfHwge307XG5JbnRyYW5ldC5Vc2VyID0gSW50cmFuZXQuVXNlciB8fCB7fTtcblxuSW50cmFuZXQuVXNlci5Qcm9maWxlID0gKGZ1bmN0aW9uICgkKSB7XG5cbiAgICBmdW5jdGlvbiBQcm9maWxlKCkge1xuXG4gICAgICAgICQoJyNhdXRob3ItZm9ybSBpbnB1dFt0eXBlPVwic3VibWl0XCJdJykuY2xpY2soZnVuY3Rpb24oZSkge1xuXG4gICAgICAgICAgICB2YXIgZXJyb3JBY2NvcmRpb24gPSB0aGlzLmxvY2F0ZUFjY29yZGlvbigpO1xuXG4gICAgICAgICAgICAvL0FkZCAmIHJlbW92ZSBjbGFzc2VzXG4gICAgICAgICAgICBpZihlcnJvckFjY29yZGlvbiAhPSBudWxsKSB7XG5cbiAgICAgICAgICAgICAgICAvL0JyZWFrIGN1cnJlbnQgcHJvY2Vzc1xuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICAgICAgICAgIC8vU2hvdyBlcnJvcnNcbiAgICAgICAgICAgICAgICAkKFwiI2F1dGhvci1mb3JtIC5mb3JtLWVycm9yc1wiKS5yZW1vdmVDbGFzcyhcImhpZGRlblwiKTtcbiAgICAgICAgICAgICAgICAkKFwiLmFjY29yZGlvbi1lcnJvclwiLGVycm9yQWNjb3JkaW9uKS5yZW1vdmVDbGFzcyhcImhpZGRlblwiKTtcblxuICAgICAgICAgICAgICAgIC8vSnVtcCB0byBlcnJvcnNcbiAgICAgICAgICAgICAgICBsb2NhdGlvbi5ocmVmID0gXCIjZm9ybS1lcnJvcnNcIjtcblxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAkKFwiI2F1dGhvci1mb3JtIC5mb3JtLWVycm9yc1wiKS5hZGRDbGFzcyhcImhpZGRlblwiKTtcbiAgICAgICAgICAgICAgICAkKFwiLmFjY29yZGlvbi1lcnJvclwiLGVycm9yQWNjb3JkaW9uKS5hZGRDbGFzcyhcImhpZGRlblwiKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIFByb2ZpbGUucHJvdG90eXBlLmxvY2F0ZUFjY29yZGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHJldHVyblZhbHVlID0gbnVsbDtcbiAgICAgICAgJChcIiNhdXRob3ItZm9ybSBzZWN0aW9uLmFjY29yZGlvbi1zZWN0aW9uXCIpLmVhY2goZnVuY3Rpb24oaW5kZXgsaXRlbSl7XG4gICAgICAgICAgICBpZigkKFwiLmZvcm0tbm90aWNlXCIsIGl0ZW0pLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHJldHVyblZhbHVlID0gaXRlbTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXR1cm5WYWx1ZTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIG5ldyBQcm9maWxlKCk7XG5cbn0pKGpRdWVyeSk7XG4iLCJJbnRyYW5ldCA9IEludHJhbmV0IHx8IHt9O1xuSW50cmFuZXQuVXNlciA9IEludHJhbmV0LlVzZXIgfHwge307XG5cbkludHJhbmV0LlVzZXIuU3Vic2NyaWJlID0gKGZ1bmN0aW9uICgkKSB7XG5cbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3RvclxuICAgICAqIFNob3VsZCBiZSBuYW1lZCBhcyB0aGUgY2xhc3MgaXRzZWxmXG4gICAgICovXG4gICAgZnVuY3Rpb24gU3Vic2NyaWJlKCkge1xuICAgICAgICAkKCdbZGF0YS1zdWJzY3JpYmVdJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICAgICAgdmFyIGJ1dHRvbkVsZW1lbnQgPSAkKGUudGFyZ2V0KS5jbG9zZXN0KCdbZGF0YS1zdWJzY3JpYmVdJyk7XG4gICAgICAgICAgICB2YXIgYmxvZ2lkID0gYnV0dG9uRWxlbWVudC5hdHRyKCdkYXRhLXN1YnNjcmliZScpO1xuXG4gICAgICAgICAgICB0aGlzLnRvZ2dsZVN1YnNjcmlwdGlvbihibG9naWQsIGJ1dHRvbkVsZW1lbnQpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIFN1YnNjcmliZS5wcm90b3R5cGUudG9nZ2xlU3Vic2NyaXB0aW9uID0gZnVuY3Rpb24gKGJsb2dpZCwgYnV0dG9uRWxlbWVudCkge1xuICAgICAgICB2YXIgJGFsbEJ1dHRvbnMgPSAkKCdbZGF0YS1zdWJzY3JpYmU9XCInICsgYmxvZ2lkICsgJ1wiXScpO1xuXG4gICAgICAgIHZhciBwb3N0ZGF0YSA9IHtcbiAgICAgICAgICAgIGFjdGlvbjogJ3RvZ2dsZV9zdWJzY3JpcHRpb24nLFxuICAgICAgICAgICAgYmxvZ19pZDogYmxvZ2lkXG4gICAgICAgIH07XG5cbiAgICAgICAgJGFsbEJ1dHRvbnMuaHRtbCgnPGkgY2xhc3M9XCJzcGlubmVyXCI+PC9pPicpO1xuXG4gICAgICAgICQucG9zdChhamF4dXJsLCBwb3N0ZGF0YSwgZnVuY3Rpb24gKHJlcykge1xuICAgICAgICAgICAgaWYgKHJlcyA9PSAnc3Vic2NyaWJlZCcpIHtcbiAgICAgICAgICAgICAgICAkYWxsQnV0dG9ucy5odG1sKCc8aSBjbGFzcz1cInByaWNvbiBwcmljb24tbWludXMtb1wiPjwvaT4gJyArIG11bmljaXBpb0ludHJhbmV0LnVuc3Vic2NyaWJlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgJGFsbEJ1dHRvbnMuaHRtbCgnPGkgY2xhc3M9XCJwcmljb24gcHJpY29uLXBsdXMtb1wiPjwvaT4gJyAgKyBtdW5pY2lwaW9JbnRyYW5ldC5zdWJzY3JpYmUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIG5ldyBTdWJzY3JpYmUoKTtcblxufSkoalF1ZXJ5KTtcbiIsIkludHJhbmV0ID0gSW50cmFuZXQgfHwge307XG5JbnRyYW5ldC5Vc2VyID0gSW50cmFuZXQuVXNlciB8fCB7fTtcblxuSW50cmFuZXQuVXNlci5XZWxjb21lUGhyYXNlID0gKGZ1bmN0aW9uICgkKSB7XG5cbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3RvclxuICAgICAqIFNob3VsZCBiZSBuYW1lZCBhcyB0aGUgY2xhc3MgaXRzZWxmXG4gICAgICovXG4gICAgZnVuY3Rpb24gV2VsY29tZVBocmFzZSgpIHtcbiAgICAgICAgJCgnW2RhdGEtYWN0aW9uPVwidG9nZ2xlLXdlbGNvbWUtcGhyYXNlXCJdJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIHRoaXMudG9nZ2xlUGhyYXNlKGUudGFyZ2V0KTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICBXZWxjb21lUGhyYXNlLnByb3RvdHlwZS50b2dnbGVQaHJhc2UgPSBmdW5jdGlvbiAoYnV0dG9uKSB7XG4gICAgICAgIHZhciAkYnRuID0gJChidXR0b24pLmNsb3Nlc3QoJ1tkYXRhLWFjdGlvbj1cInRvZ2dsZS13ZWxjb21lLXBocmFzZVwiXScpO1xuICAgICAgICB2YXIgJGdyZWV0aW5nID0gJCgnLmdyZWV0aW5nJyk7XG5cbiAgICAgICAgJCgnW2RhdGEtZHJvcGRvd249XCIuZ3JlZXRpbmctZHJvcGRvd25cIl0nKS50cmlnZ2VyKCdjbGljaycpO1xuXG4gICAgICAgICRncmVldGluZy5odG1sKCc8ZGl2IGNsYXNzPVwibG9hZGluZ1wiPjxkaXY+PC9kaXY+PGRpdj48L2Rpdj48ZGl2PjwvZGl2PjxkaXY+PC9kaXY+PC9kaXY+Jyk7XG5cbiAgICAgICAgJC5nZXQoYWpheHVybCwge2FjdGlvbjogJ3RvZ2dsZV93ZWxjb21lX3BocmFzZSd9LCBmdW5jdGlvbiAocmVzKSB7XG4gICAgICAgICAgICBpZiAocmVzLmRpc2FibGVkKSB7XG4gICAgICAgICAgICAgICAgJGJ0bi50ZXh0KG11bmljaXBpb0ludHJhbmV0LmVuYWJsZV93ZWxjb21lX3BocmFzZSk7XG4gICAgICAgICAgICAgICAgJCgnLmdyZWV0aW5nJykuaHRtbCgnPHN0cm9uZz4nICsgbXVuaWNpcGlvSW50cmFuZXQudXNlci5mdWxsX25hbWUgKyAnPC9zdHJvbmc+Jyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICRidG4udGV4dChtdW5pY2lwaW9JbnRyYW5ldC5kaXNhYmxlX3dlbGNvbWVfcGhyYXNlKTtcbiAgICAgICAgICAgICAgICAkKCcuZ3JlZXRpbmcnKS5odG1sKG11bmljaXBpb0ludHJhbmV0LnVzZXIuZ3JlZXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCAnSlNPTicpO1xuICAgIH07XG5cbiAgICByZXR1cm4gbmV3IFdlbGNvbWVQaHJhc2UoKTtcblxufSkoalF1ZXJ5KTtcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
