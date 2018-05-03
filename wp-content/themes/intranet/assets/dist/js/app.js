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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsIkhlbHBlci9NaXNzaW5nRGF0YS5qcyIsIkhlbHBlci9XYWxrdGhyb3VnaC5qcyIsIk1pc2MvRm9ydW1zLmpzIiwiTWlzYy9OZXdzLmpzIiwiTWlzYy9SZXBvcnRQb3N0LmpzIiwiU2VhcmNoL0dlbmVyYWwuanMiLCJTZWFyY2gvU2l0ZXMuanMiLCJTZWFyY2gvVXNlci5qcyIsIlVzZXIvRmFjZWJvb2tQcm9maWxlU3luYy5qcyIsIlVzZXIvTGlua3MuanMiLCJVc2VyL0xvZ2luUmVtaW5kZXIuanMiLCJVc2VyL1Byb2ZpbGUuanMiLCJVc2VyL1N1YnNjcmliZS5qcyIsIlVzZXIvV2VsY29tZVBocmFzZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMvRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgSW50cmFuZXQ7XG4iLCJJbnRyYW5ldCA9IEludHJhbmV0IHx8IHt9O1xuSW50cmFuZXQuSGVscGVyID0gSW50cmFuZXQuSGVscGVyIHx8IHt9O1xuXG5JbnRyYW5ldC5IZWxwZXIuTWlzc2luZ0RhdGEgPSAoZnVuY3Rpb24gKCQpIHtcblxuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdG9yXG4gICAgICogU2hvdWxkIGJlIG5hbWVkIGFzIHRoZSBjbGFzcyBpdHNlbGZcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBNaXNzaW5nRGF0YSgpIHtcbiAgICAgICAgJCgnW2RhdGEtZ3VpZGUtbmF2PVwibmV4dFwiXSwgW2RhdGEtZ3VpZGUtbmF2PVwicHJldlwiXScpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAkZm9ybSA9ICQoZS50YXJnZXQpLnBhcmVudHMoJ2Zvcm0nKTtcbiAgICAgICAgICAgICRmaWVsZHMgPSAkKGUudGFyZ2V0KS5wYXJlbnRzKCdzZWN0aW9uJykuZmluZCgnOmlucHV0Om5vdChbbmFtZT1cImFjdGl2ZS1zZWN0aW9uXCJdKScpO1xuXG4gICAgICAgICAgICB2YXIgc2VjdGlvbklzVmFsaWQgPSB0cnVlO1xuICAgICAgICAgICAgJGZpZWxkcy5lYWNoKGZ1bmN0aW9uIChpbmRleCwgZWxlbWVudCkge1xuICAgICAgICAgICAgICAgIC8vIFZhbGlkXG4gICAgICAgICAgICAgICAgaWYgKCQodGhpcylbMF0uY2hlY2tWYWxpZGl0eSgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBOb3QgdmFsaWRcbiAgICAgICAgICAgICAgICBzZWN0aW9uSXNWYWxpZCA9IGZhbHNlO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGlmICghc2VjdGlvbklzVmFsaWQpIHtcbiAgICAgICAgICAgICAgICAkZm9ybS5maW5kKCc6c3VibWl0JykudHJpZ2dlcignY2xpY2snKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IE1pc3NpbmdEYXRhKCk7XG5cbn0pKGpRdWVyeSk7XG4iLCJJbnRyYW5ldCA9IEludHJhbmV0IHx8IHt9O1xuSW50cmFuZXQuSGVscGVyID0gSW50cmFuZXQuSGVscGVyIHx8IHt9O1xuXG5JbnRyYW5ldC5IZWxwZXIuV2Fsa3Rocm91Z2ggPSAoZnVuY3Rpb24gKCQpIHtcblxuICAgIHZhciBjdXJyZW50SW5kZXggPSAwO1xuXG4gICAgLyoqXG4gICAgICogQ29uc3RydWN0b3JcbiAgICAgKiBTaG91bGQgYmUgbmFtZWQgYXMgdGhlIGNsYXNzIGl0c2VsZlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIFdhbGt0aHJvdWdoKCkge1xuICAgICAgICAkKCcud2Fsa3Rocm91Z2ggW2RhdGEtZHJvcGRvd25dJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIHRoaXMuaGlnaGxpZ2h0QXJlYShlLnRhcmdldCk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgJCgnW2RhdGEtYWN0aW9uPVwid2Fsa3Rocm91Z2gtY2FuY2VsXCJdJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICQoZS50YXJnZXQpLmNsb3Nlc3QoJ1tkYXRhLWFjdGlvbj1cIndhbGt0aHJvdWdoLWNhbmNlbFwiXScpLnBhcmVudHMoJy53YWxrdGhyb3VnaCcpLmZpbmQoJy5ibGlwcGVyJykudHJpZ2dlcignY2xpY2snKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgICAkKCdbZGF0YS1hY3Rpb249XCJ3YWxrdGhyb3VnaC1uZXh0XCJdJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIHZhciBjdXJyZW50U3RlcCA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJ1tkYXRhLWFjdGlvbj1cIndhbGt0aHJvdWdoLW5leHRcIl0nKS5wYXJlbnRzKCcud2Fsa3Rocm91Z2gnKTtcbiAgICAgICAgICAgIHRoaXMubmV4dChjdXJyZW50U3RlcCk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgJCgnW2RhdGEtYWN0aW9uPVwid2Fsa3Rocm91Z2gtcHJldmlvdXNcIl0nKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgdmFyIGN1cnJlbnRTdGVwID0gJChlLnRhcmdldCkuY2xvc2VzdCgnW2RhdGEtYWN0aW9uPVwid2Fsa3Rocm91Z2gtcHJldmlvdXNcIl0nKS5wYXJlbnRzKCcud2Fsa3Rocm91Z2gnKTtcbiAgICAgICAgICAgIHRoaXMucHJldmlvdXMoY3VycmVudFN0ZXApO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgICQod2luZG93KS5vbigncmVzaXplIGxvYWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoJCgnLndhbGt0aHJvdWdoOnZpc2libGUnKS5sZW5ndGggPCAyKSB7XG4gICAgICAgICAgICAgICAgJCgnW2RhdGEtYWN0aW9uPVwid2Fsa3Rocm91Z2gtcHJldmlvdXNcIl0sIFtkYXRhLWFjdGlvbj1cIndhbGt0aHJvdWdoLW5leHRcIl0nKS5oaWRlKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAkKCdbZGF0YS1hY3Rpb249XCJ3YWxrdGhyb3VnaC1wcmV2aW91c1wiXSwgW2RhdGEtYWN0aW9uPVwid2Fsa3Rocm91Z2gtbmV4dFwiXScpLnNob3coKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJCh3aW5kb3cpLm9uKCdyZXNpemUgbG9hZCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICgkKCcud2Fsa3Rocm91Z2ggLmlzLWhpZ2hsaWdodGVkOm5vdCg6dmlzaWJsZSknKS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAkKCcud2Fsa3Rocm91Z2ggLmlzLWhpZ2hsaWdodGVkOm5vdCg6dmlzaWJsZSknKS5wYXJlbnQoJy53YWxrdGhyb3VnaCcpLmZpbmQoJy5ibGlwcGVyJykudHJpZ2dlcignY2xpY2snKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgV2Fsa3Rocm91Z2gucHJvdG90eXBlLmhpZ2hsaWdodEFyZWEgPSBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICB2YXIgJGVsZW1lbnQgPSAkKGVsZW1lbnQpLmNsb3Nlc3QoJ1tkYXRhLWRyb3Bkb3duXScpO1xuICAgICAgICB2YXIgaGlnaGxpZ2h0ID0gJGVsZW1lbnQucGFyZW50KCcud2Fsa3Rocm91Z2gnKS5hdHRyKCdkYXRhLWhpZ2hsaWdodCcpO1xuICAgICAgICB2YXIgJGhpZ2hsaWdodCA9ICQoaGlnaGxpZ2h0KTtcblxuICAgICAgICBpZiAoJGVsZW1lbnQuaGFzQ2xhc3MoJ2lzLWhpZ2hsaWdodGVkJykpIHtcbiAgICAgICAgICAgIGlmICgkaGlnaGxpZ2h0LmRhdGEoJ3Bvc2l0aW9uJykpIHtcbiAgICAgICAgICAgICAgICAkaGlnaGxpZ2h0LmNzcygncG9zaXRpb24nLCAkaGlnaGxpZ2h0LmRhdGEoJ3Bvc2l0aW9uJykpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAkaGlnaGxpZ2h0LnByZXYoJy5iYWNrZHJvcCcpLnJlbW92ZSgpO1xuICAgICAgICAgICAgJGhpZ2hsaWdodC5yZW1vdmVDbGFzcygnd2Fsa3Rocm91Z2gtaGlnaGxpZ2h0Jyk7XG4gICAgICAgICAgICAkZWxlbWVudC5yZW1vdmVDbGFzcygnaXMtaGlnaGxpZ2h0ZWQnKTtcblxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgJGhpZ2hsaWdodC5iZWZvcmUoJzxkaXYgY2xhc3M9XCJiYWNrZHJvcFwiPjwvZGl2PicpO1xuXG4gICAgICAgIGlmICgkaGlnaGxpZ2h0LmNzcygncG9zaXRpb24nKSAhPT0gJ2Fic29sdXRlJyB8fMKgJGhpZ2hsaWdodC5jc3MoJ3Bvc2l0aW9uJykgIT09ICdyZWxhdGl2ZScpIHtcbiAgICAgICAgICAgICRoaWdobGlnaHQuZGF0YSgncG9zaXRpb24nLCAkaGlnaGxpZ2h0LmNzcygncG9zaXRpb24nKSkuY3NzKCdwb3NpdGlvbicsICdyZWxhdGl2ZScpO1xuICAgICAgICB9XG5cbiAgICAgICAgJGhpZ2hsaWdodC5hZGRDbGFzcygnd2Fsa3Rocm91Z2gtaGlnaGxpZ2h0Jyk7XG4gICAgICAgICRlbGVtZW50LmFkZENsYXNzKCdpcy1oaWdobGlnaHRlZCcpO1xuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG5cbiAgICBXYWxrdGhyb3VnaC5wcm90b3R5cGUubmV4dCA9IGZ1bmN0aW9uKGN1cnJlbnQpIHtcbiAgICAgICAgY3VycmVudEluZGV4Kys7XG5cbiAgICAgICAgdmFyICRjdXJyZW50ID0gY3VycmVudDtcbiAgICAgICAgdmFyICRuZXh0SXRlbSA9ICQoJy53YWxrdGhyb3VnaDplcSgnICsgY3VycmVudEluZGV4ICsgJyk6dmlzaWJsZScpO1xuXG4gICAgICAgIGlmICgkbmV4dEl0ZW0ubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAkbmV4dEl0ZW0gPSAkKCcud2Fsa3Rocm91Z2g6dmlzaWJsZTpmaXJzdCcpO1xuICAgICAgICAgICAgY3VycmVudEluZGV4ID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgICRjdXJyZW50LmZpbmQoJy5ibGlwcGVyJykudHJpZ2dlcignY2xpY2snKTtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkbmV4dEl0ZW0uZmluZCgnLmJsaXBwZXInKS50cmlnZ2VyKCdjbGljaycpO1xuICAgICAgICAgICAgdGhpcy5zY3JvbGxUbygkbmV4dEl0ZW1bMF0pO1xuICAgICAgICB9LmJpbmQodGhpcyksIDEpO1xuICAgIH07XG5cbiAgICBXYWxrdGhyb3VnaC5wcm90b3R5cGUucHJldmlvdXMgPSBmdW5jdGlvbihjdXJyZW50KSB7XG4gICAgICAgIGN1cnJlbnRJbmRleC0tO1xuXG4gICAgICAgIHZhciAkY3VycmVudCA9IGN1cnJlbnQ7XG4gICAgICAgIHZhciAkbmV4dEl0ZW0gPSAkKCcud2Fsa3Rocm91Z2g6ZXEoJyArIGN1cnJlbnRJbmRleCArICcpOnZpc2libGUnKTtcblxuICAgICAgICBpZiAoJG5leHRJdGVtLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgJG5leHRJdGVtID0gJCgnLndhbGt0aHJvdWdoOnZpc2libGUnKS5sYXN0KCk7XG4gICAgICAgICAgICBjdXJyZW50SW5kZXggPSAkbmV4dEl0ZW0uaW5kZXgoKTtcbiAgICAgICAgfVxuXG4gICAgICAgICRjdXJyZW50LmZpbmQoJy5ibGlwcGVyJykudHJpZ2dlcignY2xpY2snKTtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkbmV4dEl0ZW0uZmluZCgnLmJsaXBwZXInKS50cmlnZ2VyKCdjbGljaycpO1xuICAgICAgICAgICAgdGhpcy5zY3JvbGxUbygkbmV4dEl0ZW1bMF0pO1xuICAgICAgICB9LmJpbmQodGhpcyksIDEpO1xuICAgIH07XG5cbiAgICBXYWxrdGhyb3VnaC5wcm90b3R5cGUuc2Nyb2xsVG8gPSBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICAgIGlmICghJChlbGVtZW50KS5pcygnOm9mZnNjcmVlbicpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgc2Nyb2xsVG8gPSAkKGVsZW1lbnQpLm9mZnNldCgpLnRvcDtcbiAgICAgICAgJCgnaHRtbCwgYm9keScpLmFuaW1hdGUoe1xuICAgICAgICAgICAgc2Nyb2xsVG9wOiAoc2Nyb2xsVG8tMTAwKVxuICAgICAgICB9LCAzMDApO1xuICAgIH07XG5cbiAgICByZXR1cm4gbmV3IFdhbGt0aHJvdWdoKCk7XG5cbn0pKGpRdWVyeSk7XG4iLCJJbnRyYW5ldCA9IEludHJhbmV0IHx8IHt9O1xuSW50cmFuZXQuTWlzYyA9IEludHJhbmV0Lk1pc2MgfHwge307XG5cbkludHJhbmV0Lk1pc2MuRm9ydW1zID0gKGZ1bmN0aW9uICgkKSB7XG5cbiAgICBmdW5jdGlvbiBGb3J1bXMoKSB7XG4gICAgICAgICQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlRXZlbnRzKCk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSGFuZGxlIGV2ZW50c1xuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgRm9ydW1zLnByb3RvdHlwZS5oYW5kbGVFdmVudHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICQoZG9jdW1lbnQpLm9uKCdzdWJtaXQnLCAnI2VkaXQtZm9ydW0nLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgdGhpcy5lZGl0Rm9ydW0oZSk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJyNkZWxldGUtZm9ydW0nLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgaWYgKHdpbmRvdy5jb25maXJtKG11bmljaXBpb0ludHJhbmV0LmRlbGV0ZV9jb25maXJtKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZGVsZXRlRm9ydW0oZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5tZW1iZXItYnV0dG9uJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIHRoaXMuam9pbkZvcnVtKGUpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgIH07XG5cbiAgICBGb3J1bXMucHJvdG90eXBlLmpvaW5Gb3J1bSA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICR0YXJnZXQgPSAkKGV2ZW50LmN1cnJlbnRUYXJnZXQpO1xuICAgICAgICAkdGFyZ2V0LnRvZ2dsZUNsYXNzKCdtZW1iZXItYnV0dG9uLS1pcy1tZW1iZXInKTtcblxuICAgICAgICBpZiAoJHRhcmdldC5oYXNDbGFzcygnbWVtYmVyLWJ1dHRvbi0taXMtbWVtYmVyJykpIHtcbiAgICAgICAgICAgICQoJy5wcmljb24nLCAkdGFyZ2V0KS5yZW1vdmVDbGFzcygncHJpY29uLXBsdXMtbycpLmFkZENsYXNzKCdwcmljb24tbWludXMtbycpO1xuICAgICAgICAgICAgJCgnLm1lbWJlci1idXR0b25fX3RleHQnLCAkdGFyZ2V0KS50ZXh0KG11bmljaXBpb0ludHJhbmV0LmxlYXZlX2ZvcnVtKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICQoJy5wcmljb24nLCAkdGFyZ2V0KS5yZW1vdmVDbGFzcygncHJpY29uLW1pbnVzLW8nKS5hZGRDbGFzcygncHJpY29uLXBsdXMtbycpO1xuICAgICAgICAgICAgJCgnLm1lbWJlci1idXR0b25fX3RleHQnLCAkdGFyZ2V0KS50ZXh0KG11bmljaXBpb0ludHJhbmV0LmpvaW5fZm9ydW0pO1xuICAgICAgICB9XG4gICAgICAgICR0YXJnZXQuYmx1cigpO1xuXG4gICAgICAgICQuYWpheCh7XG4gICAgICAgICAgICB1cmw6IGFqYXh1cmwsXG4gICAgICAgICAgICB0eXBlOiAncG9zdCcsXG4gICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgYWN0aW9uIDogJ2pvaW5fZm9ydW0nLFxuICAgICAgICAgICAgICAgIHBvc3RJZCA6ICR0YXJnZXQuZGF0YSgncG9zdElkJylcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBGb3J1bXMucHJvdG90eXBlLmRlbGV0ZUZvcnVtID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgdmFyIHBvc3RJZCA9ICgkKGV2ZW50LmN1cnJlbnRUYXJnZXQpLmRhdGEoJ3Bvc3QtaWQnKSk7XG4gICAgICAgIHZhciBhcmNoaXZlVXJsID0gKCQoZXZlbnQuY3VycmVudFRhcmdldCkuZGF0YSgnYXJjaGl2ZScpKTtcblxuICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgbWV0aG9kOiBcIkRFTEVURVwiLFxuICAgICAgICAgICAgdXJsOiBtdW5pY2lwaW9JbnRyYW5ldC53cGFwaS51cmwgKyAnd3AvdjIvZm9ydW1zLycgKyBwb3N0SWQsXG4gICAgICAgICAgICBiZWZvcmVTZW5kOiBmdW5jdGlvbiAoeGhyKSB7XG4gICAgICAgICAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ1gtV1AtTm9uY2UnLCBtdW5pY2lwaW9JbnRyYW5ldC53cGFwaS5ub25jZSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc3VjY2VzcyA6IGZ1bmN0aW9uKHJlc3BvbnNlICkge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZXBsYWNlKGFyY2hpdmVVcmwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgRm9ydW1zLnByb3RvdHlwZS5lZGl0Rm9ydW0gPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgdmFyICR0YXJnZXQgPSAkKGV2ZW50LnRhcmdldCksXG4gICAgICAgICAgICBkYXRhID0gbmV3IEZvcm1EYXRhKGV2ZW50LnRhcmdldCksXG4gICAgICAgICAgICBwb3N0SWQgPSBkYXRhLmdldCgncG9zdF9pZCcpO1xuICAgICAgICAgICAgZGF0YS5hcHBlbmQoJ3N0YXR1cycsICdwcml2YXRlJyk7XG5cbiAgICAgICAgZnVuY3Rpb24gZGlzcGxheUVycm9yKCkge1xuICAgICAgICAgICAgJCgnLnNwaW5uZXIsLndhcm5pbmcnLCAkdGFyZ2V0KS5yZW1vdmUoKTtcbiAgICAgICAgICAgICQoJy5tb2RhbC1mb290ZXInLCAkdGFyZ2V0KS5wcmVwZW5kKCc8c3BhbiBjbGFzcz1cIm5vdGljZSB3YXJuaW5nIGd1dHRlciBndXR0ZXItbWFyZ2luIGd1dHRlci12ZXJ0aWNhbFwiPjxpIGNsYXNzPVwicHJpY29uIHByaWNvbi1ub3RpY2Utd2FybmluZ1wiPjwvaT4gJyArIG11bmljaXBpb0ludHJhbmV0LnNvbWV0aGluZ193ZW50X3dyb25nICsgJzwvc3Bhbj4nKTtcbiAgICAgICAgfVxuXG4gICAgICAgICQuYWpheCh7XG4gICAgICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgICAgICAgdXJsOiBtdW5pY2lwaW9JbnRyYW5ldC53cGFwaS51cmwgKyAnd3AvdjIvZm9ydW1zLycgKyBwb3N0SWQsXG4gICAgICAgICAgICBkYXRhOiBkYXRhLFxuICAgICAgICAgICAgcHJvY2Vzc0RhdGE6IGZhbHNlLFxuICAgICAgICAgICAgY29udGVudFR5cGU6IGZhbHNlLFxuICAgICAgICAgICAgYmVmb3JlU2VuZDogZnVuY3Rpb24gKHhocikge1xuICAgICAgICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdYLVdQLU5vbmNlJywgbXVuaWNpcGlvSW50cmFuZXQud3BhcGkubm9uY2UpO1xuICAgICAgICAgICAgICAgICQoJ2J1dHRvblt0eXBlPVwic3VibWl0XCJdJywgJHRhcmdldCkuYXBwZW5kKCcgPGkgY2xhc3M9XCJzcGlubmVyXCI+PC9pPicpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHN1Y2Nlc3MgOiBmdW5jdGlvbihyZXNwb25zZSApIHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHJlc3BvbnNlLmxpbmsgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLnJlcGxhY2UocmVzcG9uc2UubGluayk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheUVycm9yKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVycm9yIDogZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgZGlzcGxheUVycm9yKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIG5ldyBGb3J1bXMoKTtcblxufSkoalF1ZXJ5KTtcbiIsIkludHJhbmV0ID0gSW50cmFuZXQgfHwge307XG5JbnRyYW5ldC5NaXNjID0gSW50cmFuZXQuTWlzYyB8fCB7fTtcblxuSW50cmFuZXQuTWlzYy5OZXdzID0gKGZ1bmN0aW9uICgkKSB7XG4gICAgZnVuY3Rpb24gTmV3cygpIHtcblxuICAgICAgICAvL0luaXRcbiAgICAgICAgdGhpcy5jb250YWluZXIgID0gJCgnLm1vZHVsYXJpdHktbW9kLWludHJhbmV0LW5ld3MgLmludHJhbmV0LW5ld3MnKTtcbiAgICAgICAgdGhpcy5idXR0b24gICAgID0gJCgnLm1vZHVsYXJpdHktbW9kLWludHJhbmV0LW5ld3MgW2RhdGEtYWN0aW9uPVwiaW50cmFuZXQtbmV3cy1sb2FkLW1vcmVcIl0nKTtcbiAgICAgICAgdGhpcy5jYXRlZ29yeSAgID0gJCgnLm1vZHVsYXJpdHktbW9kLWludHJhbmV0LW5ld3Mgc2VsZWN0W25hbWU9XCJjYXRcIl0nKTtcblxuICAgICAgICAvL0VuYWJsZSBkaXNhYmxlZCBidXR0b25cbiAgICAgICAgdGhpcy5idXR0b24ucHJvcCgnZGlzYWJsZWQnLCBmYWxzZSk7XG5cbiAgICAgICAgLy9Mb2FkIG1vcmUgY2xpY2tcbiAgICAgICAgdGhpcy5idXR0b24ub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIHRoaXMubG9hZE1vcmUodGhpcy5jb250YWluZXIsIHRoaXMuYnV0dG9uKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgICAvL0NhdGVnb3J5IHN3aXRjaGVyXG4gICAgICAgIHRoaXMuY2F0ZWdvcnkub24oJ2NoYW5nZScsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICB0aGlzLmNvbnRhaW5lci5lbXB0eSgpO1xuICAgICAgICAgICAgdGhpcy5sb2FkTW9yZSh0aGlzLmNvbnRhaW5lciwgdGhpcy5idXR0b24pO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIE5ld3MucHJvdG90eXBlLnNob3dMb2FkZXIgPSBmdW5jdGlvbihidXR0b24pIHtcbiAgICAgICAgYnV0dG9uLmhpZGUoKTtcbiAgICAgICAgYnV0dG9uLmFmdGVyKCc8ZGl2IGNsYXNzPVwibG9hZGluZ1wiPjxkaXY+PC9kaXY+PGRpdj48L2Rpdj48ZGl2PjwvZGl2PjxkaXY+PC9kaXY+PC9kaXY+Jyk7XG4gICAgfTtcblxuICAgIE5ld3MucHJvdG90eXBlLmhpZGVMb2FkZXIgPSBmdW5jdGlvbihidXR0b24pIHtcbiAgICAgICAgYnV0dG9uLnBhcmVudCgpLmZpbmQoJy5sb2FkaW5nJykucmVtb3ZlKCk7XG4gICAgICAgIGJ1dHRvbi5zaG93KCk7XG4gICAgfTtcblxuICAgIE5ld3MucHJvdG90eXBlLmxvYWRNb3JlID0gZnVuY3Rpb24oY29udGFpbmVyLCBidXR0b24pIHtcbiAgICAgICAgdmFyIGNhbGxiYWNrVXJsICAgICA9IGNvbnRhaW5lci5hdHRyKCdkYXRhLWluZmluaXRlLXNjcm9sbC1jYWxsYmFjaycpO1xuICAgICAgICB2YXIgcGFnZXNpemUgICAgICAgID0gY29udGFpbmVyLmF0dHIoJ2RhdGEtaW5maW5pdGUtc2Nyb2xsLXBhZ2VzaXplJyk7XG4gICAgICAgIHZhciBzaXRlcyAgICAgICAgICAgPSBjb250YWluZXIuYXR0cignZGF0YS1pbmZpbml0ZS1zY3JvbGwtc2l0ZXMnKTtcbiAgICAgICAgdmFyIG9mZnNldCAgICAgICAgICA9IGNvbnRhaW5lci5maW5kKCdhLmJveC1uZXdzJykubGVuZ3RoID8gY29udGFpbmVyLmZpbmQoJ2EuYm94LW5ld3MnKS5sZW5ndGggOiAwO1xuICAgICAgICB2YXIgbW9kdWxlICAgICAgICAgID0gY29udGFpbmVyLmF0dHIoJ2RhdGEtbW9kdWxlJyk7XG4gICAgICAgIHZhciBjYXRlZ29yeSAgICAgICAgPSB0aGlzLmNhdGVnb3J5LnZhbCgpO1xuICAgICAgICB2YXIgYXJncyAgICAgICAgICAgID0gY29udGFpbmVyLmF0dHIoJ2RhdGEtYXJncycpO1xuICAgICAgICB2YXIgdXJsICAgICAgICAgICAgID0gbnVsbDtcblxuICAgICAgICB0aGlzLnNob3dMb2FkZXIoYnV0dG9uKTtcblxuICAgICAgICBpZighaXNOYU4ocGFyc2VGbG9hdChjYXRlZ29yeSkpICYmIGlzRmluaXRlKGNhdGVnb3J5KSkge1xuICAgICAgICAgICAgdXJsID0gY2FsbGJhY2tVcmwgKyBwYWdlc2l6ZSArICcvJyArIG9mZnNldCArICcvJyArIHNpdGVzICsgJy8nICsgY2F0ZWdvcnk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB1cmwgPSBjYWxsYmFja1VybCArIHBhZ2VzaXplICsgJy8nICsgb2Zmc2V0ICsgJy8nICsgc2l0ZXMgKyAnLzAnO1xuICAgICAgICB9XG5cbiAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICAgIHVybDogdXJsLFxuICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgbW9kdWxlOiBtb2R1bGUsXG4gICAgICAgICAgICAgICAgYXJnczogYXJnc1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGRhdGFUeXBlOiAnSlNPTicsXG4gICAgICAgICAgICBiZWZvcmVTZW5kOiBmdW5jdGlvbiAoeGhyKSB7XG4gICAgICAgICAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ1gtV1AtTm9uY2UnLCBtdW5pY2lwaW9JbnRyYW5ldC53cGFwaS5ub25jZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pLmRvbmUoZnVuY3Rpb24gKHJlcykge1xuICAgICAgICAgICAgaWYgKHJlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLm5vTW9yZShjb250YWluZXIsIGJ1dHRvbik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLm91dHB1dChjb250YWluZXIsIHJlcyk7XG4gICAgICAgICAgICB0aGlzLmhpZGVMb2FkZXIoYnV0dG9uKTtcblxuICAgICAgICAgICAgaWYgKHJlcy5sZW5ndGggPCBwYWdlc2l6ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMubm9Nb3JlKGNvbnRhaW5lciwgYnV0dG9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9O1xuXG4gICAgTmV3cy5wcm90b3R5cGUubm9Nb3JlID0gZnVuY3Rpb24oY29udGFpbmVyLCBidXR0b24pIHtcbiAgICAgICAgdGhpcy5oaWRlTG9hZGVyKGJ1dHRvbik7XG4gICAgICAgIGJ1dHRvbi50ZXh0KG11bmljaXBpb0ludHJhbmV0Lm5vX21vcmVfbmV3cykucHJvcCgnZGlzYWJsZWQnLCB0cnVlKTtcbiAgICB9O1xuXG4gICAgTmV3cy5wcm90b3R5cGUub3V0cHV0ID0gZnVuY3Rpb24oY29udGFpbmVyLCBuZXdzKSB7XG4gICAgICAgICQuZWFjaChuZXdzLCBmdW5jdGlvbiAoaW5kZXgsIGl0ZW0pIHtcbiAgICAgICAgICAgIGNvbnRhaW5lci5hcHBlbmQoaXRlbS5tYXJrdXApO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIG5ldyBOZXdzKCk7XG5cbn0pKGpRdWVyeSk7XG5cbiIsIkludHJhbmV0ID0gSW50cmFuZXQgfHwge307XG5JbnRyYW5ldC5NaXNjID0gSW50cmFuZXQuTWlzYyB8fCB7fTtcblxuSW50cmFuZXQuTWlzYy5SZXBvcnRQb3N0ID0gKGZ1bmN0aW9uICgkKSB7XG5cbiAgICBmdW5jdGlvbiBSZXBvcnRQb3N0KCkge1xuICAgICAgICAkKCcucmVwb3J0LXBvc3QnKS5vbignc3VibWl0JywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICAgICAgdmFyICR0YXJnZXQgPSAkKHRoaXMpLFxuICAgICAgICAgICAgICAgIGRhdGEgPSBuZXcgRm9ybURhdGEodGhpcyk7XG4gICAgICAgICAgICAgICAgZGF0YS5hcHBlbmQoJ2FjdGlvbicsICdyZXBvcnRfcG9zdCcpO1xuXG4gICAgICAgICAgICBpZiAoZGF0YS5nZXQoJ2ctcmVjYXB0Y2hhLXJlc3BvbnNlJykgPT09ICcnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAkdGFyZ2V0LmZpbmQoJ2lucHV0W3R5cGU9XCJzdWJtaXRcIl0nKS5oaWRlKCk7XG4gICAgICAgICAgICAkdGFyZ2V0LmZpbmQoJy5tb2RhbC1mb290ZXInKS5hcHBlbmQoJzxkaXYgY2xhc3M9XCJsb2FkaW5nXCI+PGRpdj48L2Rpdj48ZGl2PjwvZGl2PjxkaXY+PC9kaXY+PGRpdj48L2Rpdj48L2Rpdj4nKTtcblxuICAgICAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICAgICAgICB1cmw6IGFqYXh1cmwsXG4gICAgICAgICAgICAgICAgdHlwZTogJ1BPU1QnLFxuICAgICAgICAgICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgICAgICAgICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICAgICAgICAgICAgICBwcm9jZXNzRGF0YTogZmFsc2UsXG4gICAgICAgICAgICAgICAgY29udGVudFR5cGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKHJlc3BvbnNlLCB0ZXh0U3RhdHVzLCBqcVhIUikge1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2Uuc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgJCgnLm1vZGFsLWZvb3RlcicsICR0YXJnZXQpLmh0bWwoJzxzcGFuIGNsYXNzPVwibm90aWNlIHN1Y2Nlc3NcIj48aSBjbGFzcz1cInByaWNvbiBwcmljb24tY2hlY2tcIj48L2k+ICcgKyByZXNwb25zZS5kYXRhICsgJzwvc3Bhbj4nKTtcblxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgJCgnLm1vZGFsLWZvb3RlcicsICR0YXJnZXQpLmh0bWwoJzxzcGFuIGNsYXNzPVwibm90aWNlIHdhcm5pbmdcIj48aSBjbGFzcz1cInByaWNvbiBwcmljb24tbm90aWNlLXdhcm5pbmdcIj48L2k+ICcgKyByZXNwb25zZS5kYXRhICsgJzwvc3Bhbj4nKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY29tcGxldGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uLmhhc2ggPSAnJztcbiAgICAgICAgICAgICAgICAgICAgfSwgMzAwMCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBSZXBvcnRQb3N0KCk7XG5cbn0pKGpRdWVyeSk7XG4iLCJJbnRyYW5ldCA9IEludHJhbmV0IHx8IHt9O1xuSW50cmFuZXQuU2VhcmNoID0gSW50cmFuZXQuU2VhcmNoIHx8IHt9O1xuXG5JbnRyYW5ldC5TZWFyY2guR2VuZXJhbCA9IChmdW5jdGlvbiAoJCkge1xuXG4gICAgdmFyIHR5cGluZ1RpbWVyO1xuXG4gICAgLyoqXG4gICAgICogQ29uc3RydWN0b3JcbiAgICAgKiBTaG91bGQgYmUgbmFtZWQgYXMgdGhlIGNsYXNzIGl0c2VsZlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIEdlbmVyYWwoKSB7XG4gICAgICAgICQoJy5zZWFyY2ggZm9ybSBpbnB1dFtuYW1lPVwibGV2ZWxcIl0nKS5vbignY2hhbmdlJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICQoZS50YXJnZXQpLnBhcmVudHMoJ2Zvcm0nKS5zdWJtaXQoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJCgnLm5hdmJhciAuc2VhcmNoJykuZWFjaChmdW5jdGlvbiAoaW5kZXgsIGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHRoaXMuYXV0b2NvbXBsZXRlKGVsZW1lbnQpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZXMgdGhlIGF1dG9jb21wbGV0ZSBmdW5jdGlvbmFsaXR5XG4gICAgICogQHBhcmFtICB7b2JqZWN0fSBlbGVtZW50IEVsZW1lbnRcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIEdlbmVyYWwucHJvdG90eXBlLmF1dG9jb21wbGV0ZSA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgICAgdmFyICRlbGVtZW50ID0gJChlbGVtZW50KTtcbiAgICAgICAgdmFyICRpbnB1dCA9ICRlbGVtZW50LmZpbmQoJ2lucHV0W3R5cGU9XCJzZWFyY2hcIl0nKTtcblxuICAgICAgICAkaW5wdXQub24oJ2tleWRvd24nLCBmdW5jdGlvbiAoZSkge1xuXG4gICAgICAgICAgICBzd2l0Y2ggKGUud2hpY2gpIHtcbiAgICAgICAgICAgICAgICBjYXNlIDQwOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmF1dG9jb21wbGV0ZUtleWJvYXJkTmF2TmV4dChlbGVtZW50KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgICAgICAgICAgY2FzZSAzODpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hdXRvY29tcGxldGVLZXlib2FyZE5hdlByZXYoZWxlbWVudCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcblxuICAgICAgICAgICAgICAgIGNhc2UgMTM6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmF1dG9jb21wbGV0ZVN1Ym1pdChlbGVtZW50KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHR5cGluZ1RpbWVyKTtcblxuICAgICAgICAgICAgaWYgKCRpbnB1dC52YWwoKS5sZW5ndGggPCAzKSB7XG4gICAgICAgICAgICAgICAgJGVsZW1lbnQuZmluZCgnLnNlYXJjaC1hdXRvY29tcGxldGUnKS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHR5cGluZ1RpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hdXRvY29tcGxldGVRdWVyeShlbGVtZW50KTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSwgMzAwKTtcblxuICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgICQoZG9jdW1lbnQpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBpZiAoISQoZS50YXJnZXQpLmNsb3Nlc3QoJy5zZWFyY2gtYXV0b2NvbXBsZXRlJykubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgJCgnLnNlYXJjaC1hdXRvY29tcGxldGUnKS5yZW1vdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgJGlucHV0Lm9uKCdmb2N1cycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBpZiAoJGlucHV0LnZhbCgpLmxlbmd0aCA8IDMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmF1dG9jb21wbGV0ZVF1ZXJ5KGVsZW1lbnQpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBTdWJtaXQgYXV0b2NvbXBsZXRlXG4gICAgICogQHBhcmFtICB7b2JqZWN0fSBlbGVtZW50IEF1dG9jb21wbGV0ZSBlbGVtZW50XG4gICAgICogQHJldHVybiB7Ym9vbH1cbiAgICAgKi9cbiAgICBHZW5lcmFsLnByb3RvdHlwZS5hdXRvY29tcGxldGVTdWJtaXQgPSBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICAgIHZhciAkZWxlbWVudCA9ICQoZWxlbWVudCk7XG4gICAgICAgIHZhciAkYXV0b2NvbXBsZXRlID0gJGVsZW1lbnQuZmluZCgnLnNlYXJjaC1hdXRvY29tcGxldGUnKTtcbiAgICAgICAgdmFyICRzZWxlY3RlZCA9ICRhdXRvY29tcGxldGUuZmluZCgnLnNlbGVjdGVkJyk7XG5cbiAgICAgICAgaWYgKCEkc2VsZWN0ZWQubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB1cmwgPSAkc2VsZWN0ZWQuZmluZCgnYScpLmF0dHIoJ2hyZWYnKTtcbiAgICAgICAgbG9jYXRpb24uaHJlZiA9IHVybDtcblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIE5hdmlnYXRlIHRvIG5leHQgYXV0b2NvbXBsZXRlIGxpc3QgaXRlbVxuICAgICAqIEBwYXJhbSAge29iamVjdH0gZWxlbWVudCBBdXRvY29tcGxldGUgZWxlbWVudFxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgR2VuZXJhbC5wcm90b3R5cGUuYXV0b2NvbXBsZXRlS2V5Ym9hcmROYXZOZXh0ID0gZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgICB2YXIgJGVsZW1lbnQgPSAkKGVsZW1lbnQpO1xuICAgICAgICB2YXIgJGF1dG9jb21wbGV0ZSA9ICRlbGVtZW50LmZpbmQoJy5zZWFyY2gtYXV0b2NvbXBsZXRlJyk7XG5cbiAgICAgICAgdmFyICRzZWxlY3RlZCA9ICRhdXRvY29tcGxldGUuZmluZCgnLnNlbGVjdGVkJyk7XG4gICAgICAgIHZhciAkbmV4dCA9IG51bGw7XG5cbiAgICAgICAgaWYgKCEkc2VsZWN0ZWQubGVuZ3RoKSB7XG4gICAgICAgICAgICAkbmV4dCA9ICRhdXRvY29tcGxldGUuZmluZCgnbGk6bm90KC50aXRsZSk6Zmlyc3QnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICRuZXh0ID0gJHNlbGVjdGVkLm5leHQoJ2xpOm5vdCgudGl0bGUpOmZpcnN0Jyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoISRuZXh0Lmxlbmd0aCkge1xuICAgICAgICAgICAgdmFyICRuZXh0VWwgPSAkc2VsZWN0ZWQucGFyZW50cygndWwnKS5uZXh0KCd1bCcpO1xuICAgICAgICAgICAgaWYgKCRuZXh0VWwubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgJG5leHQgPSAkbmV4dFVsLmZpbmQoJ2xpOm5vdCgudGl0bGUpOmZpcnN0Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAkc2VsZWN0ZWQucmVtb3ZlQ2xhc3MoJ3NlbGVjdGVkJyk7XG4gICAgICAgICRuZXh0LmFkZENsYXNzKCdzZWxlY3RlZCcpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBOYXZpZ2F0ZSB0byBwcmV2aW91cyBhdXRvY29tcGxldGUgbGlzdCBpdGVtXG4gICAgICogQHBhcmFtICB7b2JqZWN0fSBlbGVtZW50IEF1dG9jb21wbGV0ZSBlbGVtZW50XG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBHZW5lcmFsLnByb3RvdHlwZS5hdXRvY29tcGxldGVLZXlib2FyZE5hdlByZXYgPSBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICAgIHZhciAkZWxlbWVudCA9ICQoZWxlbWVudCk7XG4gICAgICAgIHZhciAkYXV0b2NvbXBsZXRlID0gJGVsZW1lbnQuZmluZCgnLnNlYXJjaC1hdXRvY29tcGxldGUnKTtcblxuICAgICAgICB2YXIgJHNlbGVjdGVkID0gJGF1dG9jb21wbGV0ZS5maW5kKCcuc2VsZWN0ZWQnKTtcbiAgICAgICAgdmFyICRwcmV2ID0gbnVsbDtcblxuICAgICAgICBpZiAoISRzZWxlY3RlZC5sZW5ndGgpIHtcbiAgICAgICAgICAgICRwcmV2ID0gJGF1dG9jb21wbGV0ZS5maW5kKCdsaTpub3QoLnRpdGxlKTpsYXN0Jyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkcHJldiA9ICRzZWxlY3RlZC5wcmV2KCdsaTpub3QoLnRpdGxlKScpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCEkcHJldi5sZW5ndGgpIHtcbiAgICAgICAgICAgIHZhciAkcHJldlVsID0gJHNlbGVjdGVkLnBhcmVudHMoJ3VsJykucHJldigndWwnKTtcbiAgICAgICAgICAgIGlmICgkcHJldlVsLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICRwcmV2ID0gJHByZXZVbC5maW5kKCdsaTpub3QoLnRpdGxlKTpsYXN0Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAkc2VsZWN0ZWQucmVtb3ZlQ2xhc3MoJ3NlbGVjdGVkJyk7XG4gICAgICAgICRwcmV2LmFkZENsYXNzKCdzZWxlY3RlZCcpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBRdWVyeSBmb3IgYXV0b2NvbXBsZXRlIHN1Z2dlc3Rpb25zXG4gICAgICogQHBhcmFtICB7b2JqZWN0fSBlbGVtZW50IEF1dG9jb21wbGV0ZSBlbGVtZW50XG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBHZW5lcmFsLnByb3RvdHlwZS5hdXRvY29tcGxldGVRdWVyeSA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgICAgdmFyICRlbGVtZW50ID0gJChlbGVtZW50KTtcbiAgICAgICAgdmFyICRpbnB1dCA9ICRlbGVtZW50LmZpbmQoJ2lucHV0W3R5cGU9XCJzZWFyY2hcIl0nKTtcbiAgICAgICAgdmFyIHF1ZXJ5ID0gJGlucHV0LnZhbCgpO1xuXG4gICAgICAgIHZhciBkYXRhID0ge1xuICAgICAgICAgICAgYWN0aW9uOiAnc2VhcmNoX2F1dG9jb21wbGV0ZScsXG4gICAgICAgICAgICBzOiAkaW5wdXQudmFsKCksXG4gICAgICAgICAgICBsZXZlbDogJ2FqYXgnXG4gICAgICAgIH07XG5cbiAgICAgICAgJGVsZW1lbnQuZmluZCgnYnV0dG9uW3R5cGU9XCJzdWJtaXRcIl0nKS5hZGRDbGFzcyhcInNlYXJjaGluZ1wiKTtcblxuICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgdXJsOiBtdW5pY2lwaW9JbnRyYW5ldC53cGFwaS51cmwgKyAnaW50cmFuZXQvMS4wL3MvJyArIHF1ZXJ5LFxuICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgICAgIGRhdGFUeXBlOiAnSlNPTicsXG4gICAgICAgICAgICBiZWZvcmVTZW5kOiBmdW5jdGlvbiAoIHhociApIHtcbiAgICAgICAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignWC1XUC1Ob25jZScsIG11bmljaXBpb0ludHJhbmV0LndwYXBpLm5vbmNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkuZG9uZShmdW5jdGlvbiAocmVzKSB7XG4gICAgICAgICAgICAkZWxlbWVudC5maW5kKCcuc2VhcmNoLWF1dG9jb21wbGV0ZScpLnJlbW92ZSgpO1xuICAgICAgICAgICAgdGhpcy5vdXRwdXRBdXRvY29tcGxldGUoZWxlbWVudCwgcmVzKTtcbiAgICAgICAgICAgICRlbGVtZW50LmZpbmQoJ2J1dHRvblt0eXBlPVwic3VibWl0XCJdJykucmVtb3ZlQ2xhc3MoXCJzZWFyY2hpbmdcIik7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogT3V0cHV0cyB0aGUgYXV0b2NvbXBsZXRlIGRyb3Bkb3duXG4gICAgICogQHBhcmFtICB7b2JqZWN0fSBlbGVtZW50IEF1dG9jb21wbGV0ZSBlbGVtZW50XG4gICAgICogQHBhcmFtICB7YXJyYXl9ICByZXMgICAgIEF1dG9jb21wbGV0ZSBxdWVyeSByZXN1bHRcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIEdlbmVyYWwucHJvdG90eXBlLm91dHB1dEF1dG9jb21wbGV0ZSA9IGZ1bmN0aW9uKGVsZW1lbnQsIHJlcykge1xuICAgICAgICB2YXIgJGVsZW1lbnQgPSAkKGVsZW1lbnQpO1xuICAgICAgICB2YXIgJGF1dG9jb21wbGV0ZSA9ICQoJzxkaXYgY2xhc3M9XCJzZWFyY2gtYXV0b2NvbXBsZXRlXCI+PC9kaXY+Jyk7XG5cbiAgICAgICAgdmFyICR1c2VycyA9ICQoJzx1bCBjbGFzcz1cInNlYXJjaC1hdXRvY29tcGxldGUtdXNlcnNcIj48bGkgY2xhc3M9XCJ0aXRsZVwiPjxpIGNsYXNzPVwicHJpY29uIHByaWNvbi11c2VyLW9cIj48L2k+ICcgKyBtdW5pY2lwaW9JbnRyYW5ldC5zZWFyY2hBdXRvY29tcGxldGUucGVyc29ucyArICc8L2xpPjwvdWw+Jyk7XG4gICAgICAgIHZhciAkY29udGVudCA9ICQoJzx1bCBjbGFzcz1cInNlYXJjaC1hdXRvY29tcGxldGUtY29udGVudFwiPjxsaSBjbGFzcz1cInRpdGxlXCI+PGkgY2xhc3M9XCJwcmljb24gcHJpY29uLWZpbGUtdGV4dFwiPjwvaT4gJyArIG11bmljaXBpb0ludHJhbmV0LnNlYXJjaEF1dG9jb21wbGV0ZS5jb250ZW50ICsgJzwvbGk+PC91bD4nKTtcblxuICAgICAgICAvLyBVc2Vyc1xuICAgICAgICBpZiAodHlwZW9mIHJlcy51c2VycyAhPSAndW5kZWZpbmVkJyAmJiByZXMudXNlcnMgIT09IG51bGwgJiYgcmVzLnVzZXJzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICQuZWFjaChyZXMudXNlcnMsIGZ1bmN0aW9uIChpbmRleCwgdXNlcikge1xuICAgICAgICAgICAgICAgIGlmICh1c2VyLnByb2ZpbGVfaW1hZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgJHVzZXJzLmFwcGVuZCgnPGxpPjxhIGhyZWY9XCInICsgdXNlci5wcm9maWxlX3VybCArICdcIj48aW1nIHNyYz1cIicgKyB1c2VyLnByb2ZpbGVfaW1hZ2UgKyAnXCIgY2xhc3M9XCJzZWFyY2gtYXV0b2NvbXBsZXRlLWltYWdlXCI+ICcgKyB1c2VyLm5hbWUgKyAnPC9hPjwvbGk+Jyk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAkdXNlcnMuYXBwZW5kKCc8bGk+PGEgaHJlZj1cIicgKyB1c2VyLnByb2ZpbGVfdXJsICsgJ1wiPicgKyB1c2VyLm5hbWUgKyAnPC9hPjwvbGk+Jyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICR1c2VycyA9ICQoJycpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ29udGVudFxuICAgICAgICBpZiAodHlwZW9mIHJlcy5jb250ZW50ICE9ICd1bmRlZmluZWQnICYmIHJlcy5jb250ZW50ICE9PSBudWxsICYmIHJlcy5jb250ZW50Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICQuZWFjaChyZXMuY29udGVudCwgZnVuY3Rpb24gKGluZGV4LCBwb3N0KSB7XG4gICAgICAgICAgICAgICAgaWYgKHBvc3QuaXNfZmlsZSkge1xuICAgICAgICAgICAgICAgICAgICAkY29udGVudC5hcHBlbmQoJzxsaT48YSBjbGFzcz1cImxpbmstaXRlbS1iZWZvcmVcIiBocmVmPVwiJyArIHBvc3QucGVybWFsaW5rICsgJ1wiIHRhcmdldD1cIl9ibGFua1wiPicgKyBwb3N0LnBvc3RfdGl0bGUgKyAnPC9hPjwvbGk+Jyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgJGNvbnRlbnQuYXBwZW5kKCc8bGk+PGEgaHJlZj1cIicgKyBwb3N0LnBlcm1hbGluayArICdcIj4nICsgcG9zdC5wb3N0X3RpdGxlICsgJzwvYT48L2xpPicpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJGNvbnRlbnQgPSAkKCcnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICgocmVzLmNvbnRlbnQgPT09IG51bGwgfHwgcmVzLmNvbnRlbnQubGVuZ3RoID09PSAwKSAmJiAocmVzLnVzZXJzID09PSBudWxsIHx8IHJlcy51c2Vycy5sZW5ndGggPT09IDApKSB7XG4gICAgICAgICAgICAvLyAkYXV0b2NvbXBsZXRlLmFwcGVuZCgnPHVsPjxsaSBjbGFzcz1cInNlYXJjaC1hdXRvY29tcGxldGUtbm90aGluZy1mb3VuZFwiPkluZ2EgdHLDpGZmYXLigKY8L2xpPjwvdWw+Jyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAkY29udGVudC5hcHBlbmRUbygkYXV0b2NvbXBsZXRlKTtcbiAgICAgICAgJHVzZXJzLmFwcGVuZFRvKCRhdXRvY29tcGxldGUpO1xuXG4gICAgICAgICRhdXRvY29tcGxldGUuYXBwZW5kKCc8YnV0dG9uIHR5cGU9XCJzdWJtaXRcIiBjbGFzcz1cInJlYWQtbW9yZSBibG9jay1sZXZlbFwiPicgKyBtdW5pY2lwaW9JbnRyYW5ldC5zZWFyY2hBdXRvY29tcGxldGUudmlld0FsbCArICc8L2E+Jyk7XG5cbiAgICAgICAgJGF1dG9jb21wbGV0ZS5hcHBlbmRUbygkZWxlbWVudCkuc2hvdygpO1xuICAgIH07XG5cbiAgICAvL3JldHVybiBuZXcgR2VuZXJhbCgpO1xuXG59KShqUXVlcnkpO1xuIiwiSW50cmFuZXQgPSBJbnRyYW5ldCB8fCB7fTtcbkludHJhbmV0LlNlYXJjaCA9IEludHJhbmV0LlNlYXJjaCB8fCB7fTtcblxuSW50cmFuZXQuU2VhcmNoLlNpdGVzID0gKGZ1bmN0aW9uICgkKSB7XG5cbiAgICB2YXIgdHlwZVRpbWVyID0gZmFsc2U7XG4gICAgdmFyIGJ0bkJlZm9yZSA9IGZhbHNlO1xuXG4gICAgLyoqXG4gICAgICogSGFuZGxlIGV2ZW50cyBmb3IgdHJpZ2dlcmluZyBhIHNlYXJjaFxuICAgICAqL1xuICAgIGZ1bmN0aW9uIFNpdGVzKCkge1xuICAgICAgICBidG5CZWZvcmUgPSAkKCdmb3JtLm5ldHdvcmstc2VhcmNoIGJ1dHRvblt0eXBlPVwic3VibWl0XCJdJykuaHRtbCgpO1xuXG4gICAgICAgIC8vIFdoaWxlIHR5cGluZyBpbiBpbnB1dFxuICAgICAgICAkKCdmb3JtLm5ldHdvcmstc2VhcmNoIGlucHV0W3R5cGU9XCJzZWFyY2hcIl0nKS5vbignaW5wdXQnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHR5cGVUaW1lcik7XG5cbiAgICAgICAgICAgICRzZWFyY2hJbnB1dCA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJ2lucHV0W3R5cGU9XCJzZWFyY2hcIl0nKTtcbiAgICAgICAgICAgIHZhciBrZXl3b3JkID0gJHNlYXJjaElucHV0LnZhbCgpO1xuXG4gICAgICAgICAgICBpZiAoa2V5d29yZC5sZW5ndGggPCAyKSB7XG4gICAgICAgICAgICAgICAgJCgnZm9ybS5uZXR3b3JrLXNlYXJjaCBidXR0b25bdHlwZT1cInN1Ym1pdFwiXScpLmh0bWwoYnRuQmVmb3JlKTtcbiAgICAgICAgICAgICAgICAkKCcubmV0d29yay1zZWFyY2gtcmVzdWx0cy1pdGVtcycpLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICQoJy5uZXR3b3JrLXNlYXJjaC1yZXN1bHRzIC5teS1uZXR3b3JrcycpLnNob3coKTtcblxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgJCgnZm9ybS5uZXR3b3JrLXNlYXJjaCBidXR0b25bdHlwZT1cInN1Ym1pdFwiXScpLmh0bWwoJzxpIGNsYXNzPVwibG9hZGluZy1kb3RzIGxvYWRpbmctZG90cy1oaWdoaWdodFwiPjwvaT4nKTtcblxuICAgICAgICAgICAgdHlwZVRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWFyY2goa2V5d29yZCk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcyksIDEwMDApO1xuXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgLy8gU3VibWl0IGJ1dHRvblxuICAgICAgICAkKCdmb3JtLm5ldHdvcmstc2VhcmNoJykub24oJ3N1Ym1pdCcsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodHlwZVRpbWVyKTtcblxuICAgICAgICAgICAgJCgnZm9ybS5uZXR3b3JrLXNlYXJjaCBidXR0b25bdHlwZT1cInN1Ym1pdFwiXScpLmh0bWwoJzxpIGNsYXNzPVwibG9hZGluZy1kb3RzIGxvYWRpbmctZG90cy1oaWdoaWdodFwiPjwvaT4nKTtcbiAgICAgICAgICAgICRzZWFyY2hJbnB1dCA9ICQoZS50YXJnZXQpLmZpbmQoJ2lucHV0W3R5cGU9XCJzZWFyY2hcIl0nKTtcblxuICAgICAgICAgICAgdmFyIGtleXdvcmQgPSAkc2VhcmNoSW5wdXQudmFsKCk7XG4gICAgICAgICAgICB0aGlzLnNlYXJjaChrZXl3b3JkLCB0cnVlKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQZXJmb3JtcyBhbiBhamF4IHBvc3QgdG8gdGhlIHNlYXJjaCBzY3JpcHRcbiAgICAgKiBAcGFyYW0gIHtzdHJpbmd9IGtleXdvcmQgVGhlIHNlYXJjaCBrZXl3b3JkXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBTaXRlcy5wcm90b3R5cGUuc2VhcmNoID0gZnVuY3Rpb24gKGtleXdvcmQsIHJlZGlyZWN0VG9QZXJmZWN0TWF0Y2gpIHtcbiAgICAgICAgaWYgKHR5cGVvZiByZWRpcmVjdFRvUGVyZmVjdE1hdGNoID09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICByZWRpcmVjdFRvUGVyZmVjdE1hdGNoID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgZGF0YSA9IHtcbiAgICAgICAgICAgIGFjdGlvbjogJ3NlYXJjaF9zaXRlcycsXG4gICAgICAgICAgICBzOiBrZXl3b3JkXG4gICAgICAgIH07XG5cbiAgICAgICAgJC5wb3N0KGFqYXh1cmwsIGRhdGEsIGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgICAgIGlmIChyZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAkLmVhY2gocmVzLCBmdW5jdGlvbiAoaW5kZXgsIGl0ZW0pIHtcbiAgICAgICAgICAgICAgICB0aGlzLmVtcHR5UmVzdWx0cygpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHJlZGlyZWN0VG9QZXJmZWN0TWF0Y2ggJiYga2V5d29yZC50b0xvd2VyQ2FzZSgpID09IGl0ZW0ubmFtZS50b0xvd2VyQ2FzZSgpIHx8wqAoaXRlbS5zaG9ydF9uYW1lLmxlbmd0aCAmJiBrZXl3b3JkLnRvTG93ZXJDYXNlKCkgPT0gaXRlbS5zaG9ydF9uYW1lLnRvTG93ZXJDYXNlKCkpKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uID0gaXRlbS5wYXRoO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdGhpcy5hZGRSZXN1bHQoaXRlbS5kb21haW4sIGl0ZW0ucGF0aCwgaXRlbS5uYW1lLCBpdGVtLnNob3J0X25hbWUpO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgICAgICAgaWYgKGJ0bkJlZm9yZSkge1xuICAgICAgICAgICAgICAgICQoJ2Zvcm0ubmV0d29yay1zZWFyY2ggYnV0dG9uW3R5cGU9XCJzdWJtaXRcIl0nKS5odG1sKGJ0bkJlZm9yZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0uYmluZCh0aGlzKSwgJ0pTT04nKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQWRkcyBhIGl0ZW0gdG8gdGhlIHJlc3VsdCBsaXN0XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGRvbWFpbiAgICBUaGUgZG9tYWluIG9mIHRoZSB1cmxcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcGF0aCAgICAgIFRoZSBwYXRoIG9mIHRoZSB1cmxcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAgICAgIFRoZSBuYW1lIG9mIHRoZSBuZXR3b3JrIHNpdGVcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc2hvcnRuYW1lIFRoZSBzaG9ydCBuYW1lIG9mIHRoZSBuZXR3b3JrIHNpdGVcbiAgICAgKi9cbiAgICBTaXRlcy5wcm90b3R5cGUuYWRkUmVzdWx0ID0gZnVuY3Rpb24gKGRvbWFpbiwgcGF0aCwgbmFtZSwgc2hvcnRuYW1lKSB7XG4gICAgICAgICQoJy5uZXR3b3JrLXNlYXJjaC1yZXN1bHRzIC5teS1uZXR3b3JrcycpLmhpZGUoKTtcblxuICAgICAgICBpZiAoJCgnLm5ldHdvcmstc2VhcmNoLXJlc3VsdHMtaXRlbXMnKS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICQoJy5uZXR3b3JrLXNlYXJjaC1yZXN1bHRzJykuYXBwZW5kKCc8dWwgY2xhc3M9XCJuZXR3b3JrLXNlYXJjaC1yZXN1bHRzLWl0ZW1zXCI+PC91bD4nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzaG9ydG5hbWUpIHtcbiAgICAgICAgICAgICQoJy5uZXR3b3JrLXNlYXJjaC1yZXN1bHRzLWl0ZW1zJykuYXBwZW5kKCc8bGkgY2xhc3M9XCJuZXR3b3JrLXRpdGxlXCI+PGEgaHJlZj1cIi8vJyArIGRvbWFpbiArIHBhdGggKyAnXCI+JyArIHNob3J0bmFtZSArICcgPGVtPicgKyBuYW1lICsgICc8L2VtPjwvYT48L2xpPicpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgJCgnLm5ldHdvcmstc2VhcmNoLXJlc3VsdHMtaXRlbXMnKS5hcHBlbmQoJzxsaSBjbGFzcz1cIm5ldHdvcmstdGl0bGVcIj48YSBocmVmPVwiLy8nICsgZG9tYWluICsgcGF0aCArICdcIj4nICsgbmFtZSArICAnPC9hPjwvbGk+Jyk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEVtcHRpZXMgdGhlIHJlc3VsdCBsaXN0XG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBTaXRlcy5wcm90b3R5cGUuZW1wdHlSZXN1bHRzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAkKCcubmV0d29yay1zZWFyY2gtcmVzdWx0cy1pdGVtcycpLmVtcHR5KCk7XG4gICAgfTtcblxuICAgIHJldHVybiBuZXcgU2l0ZXMoKTtcblxufSkoalF1ZXJ5KTtcbiIsIlxuSW50cmFuZXQgPSBJbnRyYW5ldCB8fCB7fTtcbkludHJhbmV0LlNlYXJjaCA9IEludHJhbmV0LlNlYXJjaCB8fCB7fTtcblxuSW50cmFuZXQuU2VhcmNoLlVzZXIgPSAoZnVuY3Rpb24gKCQpIHtcblxuICAgIC8vRGVmaW5lIHRhcmdldCBlbGVtZW50c1xuICAgIHZhciBsb2FkZXJFbGVtZW50ID0gXCIuanMtdXNlci1sb2FkZXJcIjtcbiAgICB2YXIgbG9hZGVyVGV4dEVsZW1lbnQgPSBcIi5qcy11c2VyLWxvYWRlci10ZXh0XCI7XG4gICAgdmFyIHJlc3VsdEVsZW1lbnQgPSBcIi5qcy11c2VyLXNlYXJjaC1yZXN1bHRzXCI7XG4gICAgdmFyIGVtcHR5UmVzdWx0RWxlbWVudCA9IFwiLmpzLXVzZXItbnVtYmVyLW5vdC1mb3VuZFwiO1xuICAgIHZhciBuYnJPZk1hdGNoZXMgPSBcIi5qcy11c2VyLW51bWJlci1mb3VuZFwiO1xuICAgIHZhciBhbGxCdXR0b25FbGVtZW50ID0gXCIuanMtdXNlci1zaG93LWFsbC1yZXN1bHRzXCI7XG5cbiAgICB2YXIgdHlwZVRpbWVyID0gMDtcblxuICAgIGZ1bmN0aW9uIFVzZXIoKSB7XG5cbiAgICAgICAgLy9EaXNhYmxlIG9uIGFsbCBwYWdlcyBub3QgY29udGFpbmdpbmcgdXNlciB3aWRnZXRcbiAgICAgICAgaWYoalF1ZXJ5KFwiI3VzZXItbGF6eS1sb2FkXCIpLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvL0luaXRpdGFsXG4gICAgICAgICQoJ2lucHV0W3R5cGU9XCJzZWFyY2hcIl0sICNhbGdvbGlhLXNlYXJjaC1ib3ggaW5wdXQnKS5lYWNoKGZ1bmN0aW9uKGluZGV4LCBpdGVtKSB7XG4gICAgICAgICAgICBpZigkKGl0ZW0pLnZhbCgpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWFyY2hJbml0KCQoaXRlbSkudmFsKCkpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgICAkKHdpbmRvdykub24oJ2xvYWQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIC8vIFdoaWxlIHR5cGluZyBpbiBpbnB1dFxuICAgICAgICAgICAgJCgnaW5wdXRbdHlwZT1cInNlYXJjaFwiXSwgI2FsZ29saWEtc2VhcmNoLWJveCBpbnB1dCcpLm9uKCdpbnB1dCcsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHR5cGVUaW1lcik7XG4gICAgICAgICAgICAgICAgJHNlYXJjaElucHV0ID0gJChlLnRhcmdldCk7XG4gICAgICAgICAgICAgICAgdmFyIGtleXdvcmQgPSAkc2VhcmNoSW5wdXQudmFsKCk7XG4gICAgICAgICAgICAgICAgdHlwZVRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VhcmNoSW5pdChrZXl3b3JkKTtcbiAgICAgICAgICAgICAgICB9LmJpbmQodGhpcyksIDEwMDApO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICBVc2VyLnByb3RvdHlwZS5zZWFyY2hJbml0ID0gZnVuY3Rpb24ocXVlcnkpIHtcblxuICAgICAgICB0aGlzLnNob3dFbGVtZW50KGpRdWVyeShsb2FkZXJUZXh0RWxlbWVudCkpO1xuICAgICAgICB0aGlzLnNob3dFbGVtZW50KGpRdWVyeShsb2FkZXJFbGVtZW50KSk7XG4gICAgICAgIHRoaXMuaGlkZUVsZW1lbnQoalF1ZXJ5KGVtcHR5UmVzdWx0RWxlbWVudCkpO1xuICAgICAgICB0aGlzLmhpZGVFbGVtZW50KGpRdWVyeShhbGxCdXR0b25FbGVtZW50KSk7XG4gICAgICAgIHRoaXMuaGlkZUVsZW1lbnQoalF1ZXJ5KHJlc3VsdEVsZW1lbnQpKTtcbiAgICAgICAgdGhpcy5oaWRlRWxlbWVudChqUXVlcnkobmJyT2ZNYXRjaGVzKSk7XG5cbiAgICAgICAgdGhpcy5mZXRjaFVzZXJzKHF1ZXJ5KTtcbiAgICB9O1xuXG4gICAgVXNlci5wcm90b3R5cGUuc2hvd0VsZW1lbnQ9IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgICAgICB0YXJnZXQucmVtb3ZlQ2xhc3MoXCJoaWRkZW5cIik7XG4gICAgfTtcblxuICAgIFVzZXIucHJvdG90eXBlLmhpZGVFbGVtZW50ID0gZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgICAgIHRhcmdldC5hZGRDbGFzcyhcImhpZGRlblwiKTtcbiAgICB9O1xuXG4gICAgVXNlci5wcm90b3R5cGUuZGlzYWJsZUJ1dHRvbiA9IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgICAgICB0YXJnZXQuYXR0cignZGlzYWJsZWQnLCAnZGlzYWJsZWQnKTtcbiAgICB9O1xuXG4gICAgVXNlci5wcm90b3R5cGUuZmV0Y2hVc2VycyA9IGZ1bmN0aW9uKHF1ZXJ5KSB7XG5cbiAgICAgICAgdmFyIGRhdGEgPSB7XG4gICAgICAgICAgICAnYWN0aW9uJzogJ3NlYXJjaF91c2VycycsXG4gICAgICAgICAgICAncXVlcnknOiBxdWVyeVxuICAgICAgICB9O1xuXG4gICAgICAgICQucG9zdChhamF4dXJsLCBkYXRhLCBmdW5jdGlvbihyZXNwb25zZSkge1xuXG4gICAgICAgICAgICB0aGlzLmhpZGVFbGVtZW50KGpRdWVyeShsb2FkZXJFbGVtZW50KSk7XG4gICAgICAgICAgICB0aGlzLmhpZGVFbGVtZW50KGpRdWVyeShsb2FkZXJUZXh0RWxlbWVudCkpO1xuXG4gICAgICAgICAgICBpZih0eXBlb2YgcmVzcG9uc2UuaXRlbXMgIT09ICd1bmRlZmluZWQnKSB7XG5cbiAgICAgICAgICAgICAgICAvL0VtcHR5IHJlc3VsdFxuICAgICAgICAgICAgICAgICQocmVzdWx0RWxlbWVudCkuaHRtbChcIlwiKTtcblxuICAgICAgICAgICAgICAgIC8vQ3JlYXRlIF8gdmlldyB1c2VyIGl0ZW1cbiAgICAgICAgICAgICAgICB2YXIgdXNlclRlbXBsYXRlID0gd3AudGVtcGxhdGUoXCJ1c2VyLWl0ZW1cIik7XG5cbiAgICAgICAgICAgICAgICAvL1BvcHVsYXRlXG4gICAgICAgICAgICAgICAgcmVzcG9uc2UuaXRlbXMuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICQocmVzdWx0RWxlbWVudCkuYXBwZW5kKHVzZXJUZW1wbGF0ZShlbGVtZW50LmRhdGEpKTtcbiAgICAgICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgICAgICAgICAgLy9TaG93XG4gICAgICAgICAgICAgICAgdGhpcy5zaG93RWxlbWVudChqUXVlcnkocmVzdWx0RWxlbWVudCkpO1xuXG4gICAgICAgICAgICAgICAgLy9DcmVhdGUgXyB2aWV3IHVzZXIgbWF0Y2hlc1xuICAgICAgICAgICAgICAgIHZhciB1c2VyTWF0Y2hlc1RlbXBsYXRlID0gd3AudGVtcGxhdGUoXCJ1c2VyLW5ici1tYXRjaGVzXCIpO1xuXG4gICAgICAgICAgICAgICAgLy9Qb3B1bGF0ZVxuICAgICAgICAgICAgICAgICQobmJyT2ZNYXRjaGVzKS5odG1sKHVzZXJNYXRjaGVzVGVtcGxhdGUoe2NvdW50OiByZXNwb25zZS5uYnJvZml0ZW1zfSkpO1xuXG4gICAgICAgICAgICAgICAgLy9TaG93IG1vcmUgYnV0dG9uICYgbnVtYmVyIG9mIG1hdGNoZXNcbiAgICAgICAgICAgICAgICBpZihyZXNwb25zZS5pdGVtcy5sZW5ndGggIT0gcmVzcG9uc2UubmJyb2ZpdGVtcykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNob3dFbGVtZW50KGpRdWVyeShhbGxCdXR0b25FbGVtZW50KSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuc2hvd0VsZW1lbnQoalF1ZXJ5KG5ick9mTWF0Y2hlcykpO1xuXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuaGlkZUVsZW1lbnQoalF1ZXJ5KGFsbEJ1dHRvbkVsZW1lbnQpKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dFbGVtZW50KGpRdWVyeShlbXB0eVJlc3VsdEVsZW1lbnQpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgfTtcblxuICAgIHJldHVybiBuZXcgVXNlcigpO1xuXG59KShqUXVlcnkpO1xuIiwiSW50cmFuZXQgPSBJbnRyYW5ldCB8fCB7fTtcbkludHJhbmV0LlVzZXIgPSBJbnRyYW5ldC5Vc2VyIHx8IHt9O1xuXG5JbnRyYW5ldC5Vc2VyLkZhY2Vib29rUHJvZmlsZVN5bmMgPSAoZnVuY3Rpb24gKCQpIHtcbiAgICBmdW5jdGlvbiBGYWNlYm9va1Byb2ZpbGVTeW5jKCkge1xuXG4gICAgfVxuXG4gICAgRmFjZWJvb2tQcm9maWxlU3luYy5wcm90b3R5cGUuZ2V0RGV0YWlscyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAkKCcuZmItbG9naW4tY29udGFpbmVyIC5mYi1sb2dpbi1idXR0b24nKS5oaWRlKCk7XG4gICAgICAgICQoJy5mYi1sb2dpbi1jb250YWluZXInKS5hcHBlbmQoJzxkaXYgY2xhc3M9XCJsb2FkaW5nIGxvYWRpbmctcmVkXCI+PGRpdj48L2Rpdj48ZGl2PjwvZGl2PjxkaXY+PC9kaXY+PGRpdj48L2Rpdj48L2Rpdj4nKTtcblxuICAgICAgICBGQi5hcGkoJy9tZScsIHtmaWVsZHM6ICdiaXJ0aGRheSwgbG9jYXRpb24nfSwgZnVuY3Rpb24gKGRldGFpbHMpIHtcbiAgICAgICAgICAgIHRoaXMuc2F2ZURldGFpbHMoZGV0YWlscyk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfTtcblxuICAgIEZhY2Vib29rUHJvZmlsZVN5bmMucHJvdG90eXBlLnNhdmVEZXRhaWxzID0gZnVuY3Rpb24oZGV0YWlscykge1xuICAgICAgICB2YXIgZGF0YSA9IHtcbiAgICAgICAgICAgIGFjdGlvbjogJ3N5bmNfZmFjZWJvb2tfcHJvZmlsZScsXG4gICAgICAgICAgICBkZXRhaWxzOiBkZXRhaWxzXG4gICAgICAgIH07XG5cbiAgICAgICAgJC5wb3N0KGFqYXh1cmwsIGRhdGEsIGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgaWYgKHJlc3BvbnNlICE9PSAnMScpIHtcbiAgICAgICAgICAgICAgICAkKCcuZmItbG9naW4tY29udGFpbmVyIC5sb2FkaW5nJykucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgJCgnLmZiLWxvZ2luLWNvbnRhaW5lcicpLmFwcGVuZCgnPGRpdiBjbGFzcz1cIm5vdGljZSB3YXJuaW5nXCI+RmFjZWJvb2sgZGV0YWlscyBkaWQgbm90IHN5bmMgZHVlIHRvIGFuIGVycm9yPC9kaXY+Jyk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICQoJy5mYi1sb2dpbi1jb250YWluZXIgLmxvYWRpbmcnKS5yZW1vdmUoKTtcbiAgICAgICAgICAgICQoJy5mYi1sb2dpbi1jb250YWluZXInKS5hcHBlbmQoJzxkaXYgY2xhc3M9XCJub3RpY2Ugc3VjY2Vzc1wiPkZhY2Vib29rIGRldGFpbHMgc3luY2VkIHRvIHlvdXIgcHJvZmlsZTwvZGl2PicpO1xuXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHJldHVybiBuZXcgRmFjZWJvb2tQcm9maWxlU3luYygpO1xuXG59KShqUXVlcnkpO1xuXG5cbmZ1bmN0aW9uIGZhY2Vib29rUHJvZmlsZVN5bmMoKSB7XG4gICAgSW50cmFuZXQuVXNlci5GYWNlYm9va1Byb2ZpbGVTeW5jLmdldERldGFpbHMoKTtcbn1cbiIsIkludHJhbmV0ID0gSW50cmFuZXQgfHwge307XG5JbnRyYW5ldC5Vc2VyID0gSW50cmFuZXQuVXNlciB8fCB7fTtcblxuSW50cmFuZXQuVXNlci5MaW5rcyA9IChmdW5jdGlvbiAoJCkge1xuXG4gICAgLyoqXG4gICAgICogQ29uc3RydWN0b3JcbiAgICAgKiBTaG91bGQgYmUgbmFtZWQgYXMgdGhlIGNsYXNzIGl0c2VsZlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIExpbmtzKCkge1xuICAgICAgICAkKCdbZGF0YS11c2VyLWxpbmstZWRpdF0nKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgdGhpcy50b2dnbGVFZGl0KGUudGFyZ2V0KTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgICAkKCdbZGF0YS11c2VyLWxpbmstYWRkXScpLm9uKCdzdWJtaXQnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgICAgICAkZWxlbWVudCA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJ2Zvcm0nKS5wYXJlbnRzKCcuYm94Jyk7XG5cbiAgICAgICAgICAgIHZhciB0aXRsZSA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJ2Zvcm0nKS5maW5kKCdbbmFtZT1cInVzZXItbGluay10aXRsZVwiXScpLnZhbCgpO1xuICAgICAgICAgICAgdmFyIGxpbmsgPSAkKGUudGFyZ2V0KS5jbG9zZXN0KCdmb3JtJykuZmluZCgnW25hbWU9XCJ1c2VyLWxpbmstdXJsXCJdJykudmFsKCk7XG5cbiAgICAgICAgICAgIHRoaXMuYWRkTGluayh0aXRsZSwgbGluaywgJGVsZW1lbnQpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICdbZGF0YS11c2VyLWxpbmstcmVtb3ZlXScsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgICAgIHZhciBidXR0b24gPSAkKGUudGFyZ2V0KS5jbG9zZXN0KCdidXR0b24nKTtcbiAgICAgICAgICAgIHZhciBlbGVtZW50ID0gYnV0dG9uLnBhcmVudHMoJy5ib3gnKTtcbiAgICAgICAgICAgIHZhciBsaW5rID0gJChlLnRhcmdldCkuY2xvc2VzdCgnYnV0dG9uJykuYXR0cignZGF0YS11c2VyLWxpbmstcmVtb3ZlJyk7XG5cbiAgICAgICAgICAgIHRoaXMucmVtb3ZlTGluayhlbGVtZW50LCBsaW5rLCBidXR0b24pO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIExpbmtzLnByb3RvdHlwZS50b2dnbGVFZGl0ID0gZnVuY3Rpb24gKHRhcmdldCkge1xuICAgICAgICAkdGFyZ2V0ID0gJCh0YXJnZXQpLmNsb3Nlc3QoJ1tkYXRhLXVzZXItbGluay1lZGl0XScpO1xuICAgICAgICAkYm94ID0gJHRhcmdldC5wYXJlbnRzKCcuYm94Jyk7XG5cbiAgICAgICAgaWYgKCRib3guaGFzQ2xhc3MoJ2lzLWVkaXRpbmcnKSkge1xuICAgICAgICAgICAgJGJveC5yZW1vdmVDbGFzcygnaXMtZWRpdGluZycpO1xuICAgICAgICAgICAgJHRhcmdldC5odG1sKG11bmljaXBpb0ludHJhbmV0LmVkaXQpLnJlbW92ZUNsYXNzKCdwcmljb24tY2hlY2snKS5hZGRDbGFzcygncHJpY29uLWVkaXQnKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgICRib3guYWRkQ2xhc3MoJ2lzLWVkaXRpbmcnKTtcbiAgICAgICAgJHRhcmdldC5odG1sKG11bmljaXBpb0ludHJhbmV0LmRvbmUpLmFkZENsYXNzKCdwcmljb24tY2hlY2snKS5yZW1vdmVDbGFzcygncHJpY29uLWVkaXQnKTtcbiAgICB9O1xuXG4gICAgTGlua3MucHJvdG90eXBlLmFkZExpbmsgPSBmdW5jdGlvbiAodGl0bGUsIGxpbmssIGVsZW1lbnQpIHtcbiAgICAgICAgaWYgKCF0aXRsZS5sZW5ndGggfHwgIWxpbmsubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgZGF0YSA9IHtcbiAgICAgICAgICAgIGFjdGlvbjogJ2FkZF91c2VyX2xpbmsnLFxuICAgICAgICAgICAgdGl0bGU6IHRpdGxlLFxuICAgICAgICAgICAgdXJsOiBsaW5rXG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIGJ1dHRvblRleHQgPSAkKGVsZW1lbnQpLmZpbmQoJ2J1dHRvblt0eXBlPVwic3VibWl0XCJdJykuaHRtbCgpO1xuICAgICAgICAkKGVsZW1lbnQpLmZpbmQoJ2J1dHRvblt0eXBlPVwic3VibWl0XCJdJykuaHRtbCgnPGkgY2xhc3M9XCJzcGlubmVyIHNwaW5uZXItZGFya1wiPjwvaT4nKTtcblxuICAgICAgICAkLnBvc3QoYWpheHVybCwgZGF0YSwgZnVuY3Rpb24gKHJlcykge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiByZXMgIT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBlbGVtZW50LmZpbmQoJ3VsLmxpbmtzJykuZW1wdHkoKTtcblxuICAgICAgICAgICAgJC5lYWNoKHJlcywgZnVuY3Rpb24gKGluZGV4LCBsaW5rKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hZGRMaW5rVG9Eb20oZWxlbWVudCwgbGluayk7XG4gICAgICAgICAgICAgICAgJChlbGVtZW50KS5maW5kKCdpbnB1dFt0eXBlPVwidGV4dFwiXScpLnZhbCgnJyk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgICAgICAkKGVsZW1lbnQpLmZpbmQoJ2J1dHRvblt0eXBlPVwic3VibWl0XCJdJykuaHRtbChidXR0b25UZXh0KTtcbiAgICAgICAgfS5iaW5kKHRoaXMpLCAnSlNPTicpO1xuICAgIH07XG5cbiAgICBMaW5rcy5wcm90b3R5cGUuYWRkTGlua1RvRG9tID0gZnVuY3Rpb24gKGVsZW1lbnQsIGxpbmspIHtcbiAgICAgICAgdmFyICRsaXN0ID0gZWxlbWVudC5maW5kKCd1bC5saW5rcycpO1xuXG4gICAgICAgIGlmICgkbGlzdC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIGVsZW1lbnQuZmluZCgnLmJveC1jb250ZW50JykuaHRtbCgnPHVsIGNsYXNzPVwibGlua3NcIj48L3VsPicpO1xuICAgICAgICAgICAgJGxpc3QgPSBlbGVtZW50LmZpbmQoJ3VsLmxpbmtzJyk7XG4gICAgICAgIH1cblxuICAgICAgICAkbGlzdC5hcHBlbmQoJ1xcXG4gICAgICAgICAgICA8bGk+XFxcbiAgICAgICAgICAgICAgICA8YSBjbGFzcz1cImxpbmstaXRlbSBsaW5rLWl0ZW0tbGlnaHRcIiBocmVmPVwiJyArIGxpbmsudXJsICsgJ1wiPicgKyBsaW5rLnRpdGxlICsgJzwvYT5cXFxuICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJidG4gYnRuLWljb24gYnRuLXNtIHRleHQtbGcgcHVsbC1yaWdodCBvbmx5LWlmLWVkaXRpbmdcIiBkYXRhLXVzZXItbGluay1yZW1vdmU9XCInICsgbGluay51cmwgKyAnXCI+JnRpbWVzOzwvYnV0dG9uPlxcXG4gICAgICAgICAgICA8L2xpPlxcXG4gICAgICAgICcpO1xuICAgIH07XG5cbiAgICBMaW5rcy5wcm90b3R5cGUucmVtb3ZlTGluayA9IGZ1bmN0aW9uIChlbGVtZW50LCBsaW5rLCBidXR0b24pIHtcbiAgICAgICAgdmFyIGRhdGEgPSB7XG4gICAgICAgICAgICBhY3Rpb246ICdyZW1vdmVfdXNlcl9saW5rJyxcbiAgICAgICAgICAgIHVybDogbGlua1xuICAgICAgICB9O1xuXG4gICAgICAgIGJ1dHRvbi5odG1sKCc8aSBjbGFzcz1cInNwaW5uZXIgc3Bpbm5lci1kYXJrXCI+PC9pPicpO1xuXG4gICAgICAgICQucG9zdChhamF4dXJsLCBkYXRhLCBmdW5jdGlvbiAocmVzKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHJlcyAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChyZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5maW5kKCd1bC5saW5rcycpLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuZmluZCgnLmJveC1jb250ZW50JykudGV4dChtdW5pY2lwaW9JbnRyYW5ldC51c2VyX2xpbmtzX2lzX2VtcHR5KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZWxlbWVudC5maW5kKCd1bC5saW5rcycpLmVtcHR5KCk7XG5cbiAgICAgICAgICAgICQuZWFjaChyZXMsIGZ1bmN0aW9uIChpbmRleCwgbGluaykge1xuICAgICAgICAgICAgICAgIHRoaXMuYWRkTGlua1RvRG9tKGVsZW1lbnQsIGxpbmspO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpLCAnSlNPTicpO1xuICAgIH07XG5cbiAgICByZXR1cm4gbmV3IExpbmtzKCk7XG5cbn0pKGpRdWVyeSk7XG4iLCJJbnRyYW5ldCA9IEludHJhbmV0IHx8IHt9O1xuSW50cmFuZXQuVXNlciA9IEludHJhbmV0LlVzZXIgfHwge307XG5cbnZhID0gKGZ1bmN0aW9uICgkKSB7XG5cbiAgICB2YXIgY29va2llS2V5ID0gJ2xvZ2luX3JlbWluZGVyJztcblxuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdG9yXG4gICAgICogU2hvdWxkIGJlIG5hbWVkIGFzIHRoZSBjbGFzcyBpdHNlbGZcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBMb2dpblJlbWluZGVyKCkge1xuICAgICAgICB2YXIgZGF0ZU5vdyA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuXG4gICAgICAgIC8vIExvZ2dlZCBpblxuICAgICAgICBpZiAobXVuaWNpcGlvSW50cmFuZXQuaXNfdXNlcl9sb2dnZWRfaW4pIHtcbiAgICAgICAgICAgIEhlbHNpbmdib3JnUHJpbWUuSGVscGVyLkNvb2tpZS5zZXQoY29va2llS2V5LCBkYXRlTm93LCAzMCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBOb3QgbG9nZ2VkIGluIGFuZCBubyBwcmV2aW91cyBsb2dpbiBjb29raWVcbiAgICAgICAgaWYgKEhlbHNpbmdib3JnUHJpbWUuSGVscGVyLkNvb2tpZS5nZXQoY29va2llS2V5KS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIEhlbHNpbmdib3JnUHJpbWUuSGVscGVyLkNvb2tpZS5zZXQoY29va2llS2V5LCBkYXRlTm93LCAzMCk7XG4gICAgICAgICAgICB0aGlzLnNob3dSZW1pbmRlcigpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTm90IGxvZ2dlZCBpbiBhbmQgaGFzIHByZXZpb3VzIGxvZ2luIGNvb2tpZVxuICAgICAgICB2YXIgbGFzdFJlbWluZGVyID0gSGVsc2luZ2JvcmdQcmltZS5IZWxwZXIuQ29va2llLmdldChjb29raWVLZXkpO1xuICAgICAgICBsYXN0UmVtaW5kZXIgPSBuZXcgRGF0ZSgpLnNldFRpbWUobGFzdFJlbWluZGVyKTtcblxuICAgICAgICB2YXIgZGF5c1NpbmNlTGFzdFJlbWluZGVyID0gTWF0aC5yb3VuZCgoZGF0ZU5vdyAtIGxhc3RSZW1pbmRlcikgLyAoMTAwMCAqIDYwICogNjAgKiAyNCkpO1xuICAgICAgICBpZiAoZGF5c1NpbmNlTGFzdFJlbWluZGVyID4gNikge1xuICAgICAgICAgICAgdGhpcy5zaG93UmVtaW5kZXIoKTtcbiAgICAgICAgICAgIEhlbHNpbmdib3JnUHJpbWUuSGVscGVyLkNvb2tpZS5zZXQoY29va2llS2V5LCBkYXRlTm93LCAzMCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAkKCcjbW9kYWwtbG9naW4tcmVtaW5kZXInKS5yZW1vdmUoKTtcblxuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgTG9naW5SZW1pbmRlci5wcm90b3R5cGUuc2hvd1JlbWluZGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICQoJyNtb2RhbC1sb2dpbi1yZW1pbmRlcicpLmFkZENsYXNzKCdtb2RhbC1vcGVuJyk7XG4gICAgICAgICQoJ2JvZHknKS5hZGRDbGFzcygnb3ZlcmZsb3ctaGlkZGVuJyk7XG4gICAgfTtcblxuICAgIHJldHVybiBuZXcgTG9naW5SZW1pbmRlcigpO1xuXG59KShqUXVlcnkpO1xuIiwiSW50cmFuZXQgPSBJbnRyYW5ldCB8fCB7fTtcbkludHJhbmV0LlVzZXIgPSBJbnRyYW5ldC5Vc2VyIHx8IHt9O1xuXG5JbnRyYW5ldC5Vc2VyLlByb2ZpbGUgPSAoZnVuY3Rpb24gKCQpIHtcblxuICAgIGZ1bmN0aW9uIFByb2ZpbGUoKSB7XG5cbiAgICAgICAgJCgnI2F1dGhvci1mb3JtIGlucHV0W3R5cGU9XCJzdWJtaXRcIl0nKS5jbGljayhmdW5jdGlvbihlKSB7XG5cbiAgICAgICAgICAgIHZhciBlcnJvckFjY29yZGlvbiA9IHRoaXMubG9jYXRlQWNjb3JkaW9uKCk7XG5cbiAgICAgICAgICAgIC8vQWRkICYgcmVtb3ZlIGNsYXNzZXNcbiAgICAgICAgICAgIGlmKGVycm9yQWNjb3JkaW9uICE9IG51bGwpIHtcblxuICAgICAgICAgICAgICAgIC8vQnJlYWsgY3VycmVudCBwcm9jZXNzXG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgICAgICAgICAgLy9TaG93IGVycm9yc1xuICAgICAgICAgICAgICAgICQoXCIjYXV0aG9yLWZvcm0gLmZvcm0tZXJyb3JzXCIpLnJlbW92ZUNsYXNzKFwiaGlkZGVuXCIpO1xuICAgICAgICAgICAgICAgICQoXCIuYWNjb3JkaW9uLWVycm9yXCIsZXJyb3JBY2NvcmRpb24pLnJlbW92ZUNsYXNzKFwiaGlkZGVuXCIpO1xuXG4gICAgICAgICAgICAgICAgLy9KdW1wIHRvIGVycm9yc1xuICAgICAgICAgICAgICAgIGxvY2F0aW9uLmhyZWYgPSBcIiNmb3JtLWVycm9yc1wiO1xuXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICQoXCIjYXV0aG9yLWZvcm0gLmZvcm0tZXJyb3JzXCIpLmFkZENsYXNzKFwiaGlkZGVuXCIpO1xuICAgICAgICAgICAgICAgICQoXCIuYWNjb3JkaW9uLWVycm9yXCIsZXJyb3JBY2NvcmRpb24pLmFkZENsYXNzKFwiaGlkZGVuXCIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgUHJvZmlsZS5wcm90b3R5cGUubG9jYXRlQWNjb3JkaW9uID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgcmV0dXJuVmFsdWUgPSBudWxsO1xuICAgICAgICAkKFwiI2F1dGhvci1mb3JtIHNlY3Rpb24uYWNjb3JkaW9uLXNlY3Rpb25cIikuZWFjaChmdW5jdGlvbihpbmRleCxpdGVtKXtcbiAgICAgICAgICAgIGlmKCQoXCIuZm9ybS1ub3RpY2VcIiwgaXRlbSkubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuVmFsdWUgPSBpdGVtO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHJldHVyblZhbHVlO1xuICAgIH07XG5cbiAgICByZXR1cm4gbmV3IFByb2ZpbGUoKTtcblxufSkoalF1ZXJ5KTtcbiIsIkludHJhbmV0ID0gSW50cmFuZXQgfHwge307XG5JbnRyYW5ldC5Vc2VyID0gSW50cmFuZXQuVXNlciB8fCB7fTtcblxuSW50cmFuZXQuVXNlci5TdWJzY3JpYmUgPSAoZnVuY3Rpb24gKCQpIHtcblxuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdG9yXG4gICAgICogU2hvdWxkIGJlIG5hbWVkIGFzIHRoZSBjbGFzcyBpdHNlbGZcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBTdWJzY3JpYmUoKSB7XG4gICAgICAgICQoJ1tkYXRhLXN1YnNjcmliZV0nKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgICAgICB2YXIgYnV0dG9uRWxlbWVudCA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJ1tkYXRhLXN1YnNjcmliZV0nKTtcbiAgICAgICAgICAgIHZhciBibG9naWQgPSBidXR0b25FbGVtZW50LmF0dHIoJ2RhdGEtc3Vic2NyaWJlJyk7XG5cbiAgICAgICAgICAgIHRoaXMudG9nZ2xlU3Vic2NyaXB0aW9uKGJsb2dpZCwgYnV0dG9uRWxlbWVudCk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgU3Vic2NyaWJlLnByb3RvdHlwZS50b2dnbGVTdWJzY3JpcHRpb24gPSBmdW5jdGlvbiAoYmxvZ2lkLCBidXR0b25FbGVtZW50KSB7XG4gICAgICAgIHZhciAkYWxsQnV0dG9ucyA9ICQoJ1tkYXRhLXN1YnNjcmliZT1cIicgKyBibG9naWQgKyAnXCJdJyk7XG5cbiAgICAgICAgdmFyIHBvc3RkYXRhID0ge1xuICAgICAgICAgICAgYWN0aW9uOiAndG9nZ2xlX3N1YnNjcmlwdGlvbicsXG4gICAgICAgICAgICBibG9nX2lkOiBibG9naWRcbiAgICAgICAgfTtcblxuICAgICAgICAkYWxsQnV0dG9ucy5odG1sKCc8aSBjbGFzcz1cInNwaW5uZXJcIj48L2k+Jyk7XG5cbiAgICAgICAgJC5wb3N0KGFqYXh1cmwsIHBvc3RkYXRhLCBmdW5jdGlvbiAocmVzKSB7XG4gICAgICAgICAgICBpZiAocmVzID09ICdzdWJzY3JpYmVkJykge1xuICAgICAgICAgICAgICAgICRhbGxCdXR0b25zLmh0bWwoJzxpIGNsYXNzPVwicHJpY29uIHByaWNvbi1taW51cy1vXCI+PC9pPiAnICsgbXVuaWNpcGlvSW50cmFuZXQudW5zdWJzY3JpYmUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAkYWxsQnV0dG9ucy5odG1sKCc8aSBjbGFzcz1cInByaWNvbiBwcmljb24tcGx1cy1vXCI+PC9pPiAnICArIG11bmljaXBpb0ludHJhbmV0LnN1YnNjcmliZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICByZXR1cm4gbmV3IFN1YnNjcmliZSgpO1xuXG59KShqUXVlcnkpO1xuIiwiSW50cmFuZXQgPSBJbnRyYW5ldCB8fCB7fTtcbkludHJhbmV0LlVzZXIgPSBJbnRyYW5ldC5Vc2VyIHx8IHt9O1xuXG5JbnRyYW5ldC5Vc2VyLldlbGNvbWVQaHJhc2UgPSAoZnVuY3Rpb24gKCQpIHtcblxuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdG9yXG4gICAgICogU2hvdWxkIGJlIG5hbWVkIGFzIHRoZSBjbGFzcyBpdHNlbGZcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBXZWxjb21lUGhyYXNlKCkge1xuICAgICAgICAkKCdbZGF0YS1hY3Rpb249XCJ0b2dnbGUtd2VsY29tZS1waHJhc2VcIl0nKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgdGhpcy50b2dnbGVQaHJhc2UoZS50YXJnZXQpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIFdlbGNvbWVQaHJhc2UucHJvdG90eXBlLnRvZ2dsZVBocmFzZSA9IGZ1bmN0aW9uIChidXR0b24pIHtcbiAgICAgICAgdmFyICRidG4gPSAkKGJ1dHRvbikuY2xvc2VzdCgnW2RhdGEtYWN0aW9uPVwidG9nZ2xlLXdlbGNvbWUtcGhyYXNlXCJdJyk7XG4gICAgICAgIHZhciAkZ3JlZXRpbmcgPSAkKCcuZ3JlZXRpbmcnKTtcblxuICAgICAgICAkKCdbZGF0YS1kcm9wZG93bj1cIi5ncmVldGluZy1kcm9wZG93blwiXScpLnRyaWdnZXIoJ2NsaWNrJyk7XG5cbiAgICAgICAgJGdyZWV0aW5nLmh0bWwoJzxkaXYgY2xhc3M9XCJsb2FkaW5nXCI+PGRpdj48L2Rpdj48ZGl2PjwvZGl2PjxkaXY+PC9kaXY+PGRpdj48L2Rpdj48L2Rpdj4nKTtcblxuICAgICAgICAkLmdldChhamF4dXJsLCB7YWN0aW9uOiAndG9nZ2xlX3dlbGNvbWVfcGhyYXNlJ30sIGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgICAgIGlmIChyZXMuZGlzYWJsZWQpIHtcbiAgICAgICAgICAgICAgICAkYnRuLnRleHQobXVuaWNpcGlvSW50cmFuZXQuZW5hYmxlX3dlbGNvbWVfcGhyYXNlKTtcbiAgICAgICAgICAgICAgICAkKCcuZ3JlZXRpbmcnKS5odG1sKCc8c3Ryb25nPicgKyBtdW5pY2lwaW9JbnRyYW5ldC51c2VyLmZ1bGxfbmFtZSArICc8L3N0cm9uZz4nKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgJGJ0bi50ZXh0KG11bmljaXBpb0ludHJhbmV0LmRpc2FibGVfd2VsY29tZV9waHJhc2UpO1xuICAgICAgICAgICAgICAgICQoJy5ncmVldGluZycpLmh0bWwobXVuaWNpcGlvSW50cmFuZXQudXNlci5ncmVldCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sICdKU09OJyk7XG4gICAgfTtcblxuICAgIHJldHVybiBuZXcgV2VsY29tZVBocmFzZSgpO1xuXG59KShqUXVlcnkpO1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
