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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsIkhlbHBlci9NaXNzaW5nRGF0YS5qcyIsIkhlbHBlci9XYWxrdGhyb3VnaC5qcyIsIk1pc2MvRm9ydW1zLmpzIiwiTWlzYy9OZXdzLmpzIiwiTWlzYy9SZXBvcnRQb3N0LmpzIiwiU2VhcmNoL0dlbmVyYWwuanMiLCJTZWFyY2gvU2l0ZXMuanMiLCJTZWFyY2gvVXNlci5qcyIsIlVzZXIvRmFjZWJvb2tQcm9maWxlU3luYy5qcyIsIlVzZXIvTGlua3MuanMiLCJVc2VyL0xvZ2luUmVtaW5kZXIuanMiLCJVc2VyL1Byb2ZpbGUuanMiLCJVc2VyL1N1YnNjcmliZS5qcyIsIlVzZXIvV2VsY29tZVBocmFzZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQy9GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaFBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBJbnRyYW5ldDtcbiIsIkludHJhbmV0ID0gSW50cmFuZXQgfHwge307XG5JbnRyYW5ldC5IZWxwZXIgPSBJbnRyYW5ldC5IZWxwZXIgfHwge307XG5cbkludHJhbmV0LkhlbHBlci5NaXNzaW5nRGF0YSA9IChmdW5jdGlvbiAoJCkge1xuXG4gICAgLyoqXG4gICAgICogQ29uc3RydWN0b3JcbiAgICAgKiBTaG91bGQgYmUgbmFtZWQgYXMgdGhlIGNsYXNzIGl0c2VsZlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIE1pc3NpbmdEYXRhKCkge1xuXG4gICAgICAgICQoJ1tkYXRhLWd1aWRlLW5hdj1cIm5leHRcIl0sIFtkYXRhLWd1aWRlLW5hdj1cInByZXZcIl0nKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgJGZvcm0gPSAkKGUudGFyZ2V0KS5wYXJlbnRzKCdmb3JtJyk7XG4gICAgICAgICAgICAkZmllbGRzID0gJChlLnRhcmdldCkucGFyZW50cygnc2VjdGlvbicpLmZpbmQoJzppbnB1dDpub3QoW25hbWU9XCJhY3RpdmUtc2VjdGlvblwiXSknKTtcblxuICAgICAgICAgICAgdmFyIHNlY3Rpb25Jc1ZhbGlkID0gdHJ1ZTtcbiAgICAgICAgICAgICRmaWVsZHMuZWFjaChmdW5jdGlvbiAoaW5kZXgsIGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAvLyBWYWxpZFxuICAgICAgICAgICAgICAgIGlmICgkKHRoaXMpWzBdLmNoZWNrVmFsaWRpdHkoKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gTm90IHZhbGlkXG4gICAgICAgICAgICAgICAgc2VjdGlvbklzVmFsaWQgPSBmYWxzZTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpZiAoIXNlY3Rpb25Jc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgJGZvcm0uZmluZCgnOnN1Ym1pdCcpLnRyaWdnZXIoJ2NsaWNrJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBNaXNzaW5nRGF0YSgpO1xuXG59KShqUXVlcnkpO1xuIiwiSW50cmFuZXQgPSBJbnRyYW5ldCB8fCB7fTtcbkludHJhbmV0LkhlbHBlciA9IEludHJhbmV0LkhlbHBlciB8fCB7fTtcblxuSW50cmFuZXQuSGVscGVyLldhbGt0aHJvdWdoID0gKGZ1bmN0aW9uICgkKSB7XG5cbiAgICB2YXIgY3VycmVudEluZGV4ID0gMDtcblxuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdG9yXG4gICAgICogU2hvdWxkIGJlIG5hbWVkIGFzIHRoZSBjbGFzcyBpdHNlbGZcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBXYWxrdGhyb3VnaCgpIHtcbiAgICAgICAgJCgnLndhbGt0aHJvdWdoIFtkYXRhLWRyb3Bkb3duXScpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB0aGlzLmhpZ2hsaWdodEFyZWEoZS50YXJnZXQpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgICQoJ1tkYXRhLWFjdGlvbj1cIndhbGt0aHJvdWdoLWNhbmNlbFwiXScpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAkKGUudGFyZ2V0KS5jbG9zZXN0KCdbZGF0YS1hY3Rpb249XCJ3YWxrdGhyb3VnaC1jYW5jZWxcIl0nKS5wYXJlbnRzKCcud2Fsa3Rocm91Z2gnKS5maW5kKCcuYmxpcHBlcicpLnRyaWdnZXIoJ2NsaWNrJyk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgJCgnW2RhdGEtYWN0aW9uPVwid2Fsa3Rocm91Z2gtbmV4dFwiXScpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB2YXIgY3VycmVudFN0ZXAgPSAkKGUudGFyZ2V0KS5jbG9zZXN0KCdbZGF0YS1hY3Rpb249XCJ3YWxrdGhyb3VnaC1uZXh0XCJdJykucGFyZW50cygnLndhbGt0aHJvdWdoJyk7XG4gICAgICAgICAgICB0aGlzLm5leHQoY3VycmVudFN0ZXApO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgICQoJ1tkYXRhLWFjdGlvbj1cIndhbGt0aHJvdWdoLXByZXZpb3VzXCJdJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIHZhciBjdXJyZW50U3RlcCA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJ1tkYXRhLWFjdGlvbj1cIndhbGt0aHJvdWdoLXByZXZpb3VzXCJdJykucGFyZW50cygnLndhbGt0aHJvdWdoJyk7XG4gICAgICAgICAgICB0aGlzLnByZXZpb3VzKGN1cnJlbnRTdGVwKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZSBsb2FkJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKCQoJy53YWxrdGhyb3VnaDp2aXNpYmxlJykubGVuZ3RoIDwgMikge1xuICAgICAgICAgICAgICAgICQoJ1tkYXRhLWFjdGlvbj1cIndhbGt0aHJvdWdoLXByZXZpb3VzXCJdLCBbZGF0YS1hY3Rpb249XCJ3YWxrdGhyb3VnaC1uZXh0XCJdJykuaGlkZSgpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgJCgnW2RhdGEtYWN0aW9uPVwid2Fsa3Rocm91Z2gtcHJldmlvdXNcIl0sIFtkYXRhLWFjdGlvbj1cIndhbGt0aHJvdWdoLW5leHRcIl0nKS5zaG93KCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0pO1xuXG4gICAgICAgICQod2luZG93KS5vbigncmVzaXplIGxvYWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoJCgnLndhbGt0aHJvdWdoIC5pcy1oaWdobGlnaHRlZDpub3QoOnZpc2libGUpJykubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgJCgnLndhbGt0aHJvdWdoIC5pcy1oaWdobGlnaHRlZDpub3QoOnZpc2libGUpJykucGFyZW50KCcud2Fsa3Rocm91Z2gnKS5maW5kKCcuYmxpcHBlcicpLnRyaWdnZXIoJ2NsaWNrJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIFdhbGt0aHJvdWdoLnByb3RvdHlwZS5oaWdobGlnaHRBcmVhID0gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgdmFyICRlbGVtZW50ID0gJChlbGVtZW50KS5jbG9zZXN0KCdbZGF0YS1kcm9wZG93bl0nKTtcbiAgICAgICAgdmFyIGhpZ2hsaWdodCA9ICRlbGVtZW50LnBhcmVudCgnLndhbGt0aHJvdWdoJykuYXR0cignZGF0YS1oaWdobGlnaHQnKTtcbiAgICAgICAgdmFyICRoaWdobGlnaHQgPSAkKGhpZ2hsaWdodCk7XG5cbiAgICAgICAgaWYgKCRlbGVtZW50Lmhhc0NsYXNzKCdpcy1oaWdobGlnaHRlZCcpKSB7XG4gICAgICAgICAgICBpZiAoJGhpZ2hsaWdodC5kYXRhKCdwb3NpdGlvbicpKSB7XG4gICAgICAgICAgICAgICAgJGhpZ2hsaWdodC5jc3MoJ3Bvc2l0aW9uJywgJGhpZ2hsaWdodC5kYXRhKCdwb3NpdGlvbicpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgJGhpZ2hsaWdodC5wcmV2KCcuYmFja2Ryb3AnKS5yZW1vdmUoKTtcbiAgICAgICAgICAgICRoaWdobGlnaHQucmVtb3ZlQ2xhc3MoJ3dhbGt0aHJvdWdoLWhpZ2hsaWdodCcpO1xuICAgICAgICAgICAgJGVsZW1lbnQucmVtb3ZlQ2xhc3MoJ2lzLWhpZ2hsaWdodGVkJyk7XG5cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgICRoaWdobGlnaHQuYmVmb3JlKCc8ZGl2IGNsYXNzPVwiYmFja2Ryb3BcIj48L2Rpdj4nKTtcblxuICAgICAgICBpZiAoJGhpZ2hsaWdodC5jc3MoJ3Bvc2l0aW9uJykgIT09ICdhYnNvbHV0ZScgfHzCoCRoaWdobGlnaHQuY3NzKCdwb3NpdGlvbicpICE9PSAncmVsYXRpdmUnKSB7XG4gICAgICAgICAgICAkaGlnaGxpZ2h0LmRhdGEoJ3Bvc2l0aW9uJywgJGhpZ2hsaWdodC5jc3MoJ3Bvc2l0aW9uJykpLmNzcygncG9zaXRpb24nLCAncmVsYXRpdmUnKTtcbiAgICAgICAgfVxuXG4gICAgICAgICRoaWdobGlnaHQuYWRkQ2xhc3MoJ3dhbGt0aHJvdWdoLWhpZ2hsaWdodCcpO1xuICAgICAgICAkZWxlbWVudC5hZGRDbGFzcygnaXMtaGlnaGxpZ2h0ZWQnKTtcblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuXG4gICAgV2Fsa3Rocm91Z2gucHJvdG90eXBlLm5leHQgPSBmdW5jdGlvbihjdXJyZW50KSB7XG4gICAgICAgIGN1cnJlbnRJbmRleCsrO1xuXG4gICAgICAgIHZhciAkY3VycmVudCA9IGN1cnJlbnQ7XG4gICAgICAgIHZhciAkbmV4dEl0ZW0gPSAkKCcud2Fsa3Rocm91Z2g6ZXEoJyArIGN1cnJlbnRJbmRleCArICcpOnZpc2libGUnKTtcblxuICAgICAgICBpZiAoJG5leHRJdGVtLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgJG5leHRJdGVtID0gJCgnLndhbGt0aHJvdWdoOnZpc2libGU6Zmlyc3QnKTtcbiAgICAgICAgICAgIGN1cnJlbnRJbmRleCA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICAkY3VycmVudC5maW5kKCcuYmxpcHBlcicpLnRyaWdnZXIoJ2NsaWNrJyk7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJG5leHRJdGVtLmZpbmQoJy5ibGlwcGVyJykudHJpZ2dlcignY2xpY2snKTtcbiAgICAgICAgICAgIHRoaXMuc2Nyb2xsVG8oJG5leHRJdGVtWzBdKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpLCAxKTtcbiAgICB9O1xuXG4gICAgV2Fsa3Rocm91Z2gucHJvdG90eXBlLnByZXZpb3VzID0gZnVuY3Rpb24oY3VycmVudCkge1xuICAgICAgICBjdXJyZW50SW5kZXgtLTtcblxuICAgICAgICB2YXIgJGN1cnJlbnQgPSBjdXJyZW50O1xuICAgICAgICB2YXIgJG5leHRJdGVtID0gJCgnLndhbGt0aHJvdWdoOmVxKCcgKyBjdXJyZW50SW5kZXggKyAnKTp2aXNpYmxlJyk7XG5cbiAgICAgICAgaWYgKCRuZXh0SXRlbS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICRuZXh0SXRlbSA9ICQoJy53YWxrdGhyb3VnaDp2aXNpYmxlJykubGFzdCgpO1xuICAgICAgICAgICAgY3VycmVudEluZGV4ID0gJG5leHRJdGVtLmluZGV4KCk7XG4gICAgICAgIH1cblxuICAgICAgICAkY3VycmVudC5maW5kKCcuYmxpcHBlcicpLnRyaWdnZXIoJ2NsaWNrJyk7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJG5leHRJdGVtLmZpbmQoJy5ibGlwcGVyJykudHJpZ2dlcignY2xpY2snKTtcbiAgICAgICAgICAgIHRoaXMuc2Nyb2xsVG8oJG5leHRJdGVtWzBdKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpLCAxKTtcbiAgICB9O1xuXG4gICAgV2Fsa3Rocm91Z2gucHJvdG90eXBlLnNjcm9sbFRvID0gZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgICBpZiAoISQoZWxlbWVudCkuaXMoJzpvZmZzY3JlZW4nKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHNjcm9sbFRvID0gJChlbGVtZW50KS5vZmZzZXQoKS50b3A7XG4gICAgICAgICQoJ2h0bWwsIGJvZHknKS5hbmltYXRlKHtcbiAgICAgICAgICAgIHNjcm9sbFRvcDogKHNjcm9sbFRvLTEwMClcbiAgICAgICAgfSwgMzAwKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIG5ldyBXYWxrdGhyb3VnaCgpO1xuXG59KShqUXVlcnkpO1xuIiwiSW50cmFuZXQgPSBJbnRyYW5ldCB8fCB7fTtcbkludHJhbmV0Lk1pc2MgPSBJbnRyYW5ldC5NaXNjIHx8IHt9O1xuXG5JbnRyYW5ldC5NaXNjLkZvcnVtcyA9IChmdW5jdGlvbiAoJCkge1xuXG4gICAgZnVuY3Rpb24gRm9ydW1zKCkge1xuICAgICAgICAkKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlRXZlbnRzKCk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSGFuZGxlIGV2ZW50c1xuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgRm9ydW1zLnByb3RvdHlwZS5oYW5kbGVFdmVudHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICQoJyNlZGl0LWZvcnVtJykuc3VibWl0KGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUZvcnVtKGUpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcjZGVsZXRlLWZvcnVtJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGlmICh3aW5kb3cuY29uZmlybShtdW5pY2lwaW9JbnRyYW5ldC5kZWxldGVfY29uZmlybSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRlbGV0ZUZvcnVtKGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcubWVtYmVyLWJ1dHRvbicsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB0aGlzLmpvaW5Gb3J1bShlKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9O1xuXG4gICAgRm9ydW1zLnByb3RvdHlwZS5qb2luRm9ydW0gPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgJHRhcmdldCA9ICQoZXZlbnQuY3VycmVudFRhcmdldCk7XG4gICAgICAgICR0YXJnZXQudG9nZ2xlQ2xhc3MoJ21lbWJlci1idXR0b24tLWlzLW1lbWJlcicpO1xuXG4gICAgICAgIGlmICgkdGFyZ2V0Lmhhc0NsYXNzKCdtZW1iZXItYnV0dG9uLS1pcy1tZW1iZXInKSkge1xuICAgICAgICAgICAgJCgnLnByaWNvbicsICR0YXJnZXQpLnJlbW92ZUNsYXNzKCdwcmljb24tcGx1cy1vJykuYWRkQ2xhc3MoJ3ByaWNvbi1taW51cy1vJyk7XG4gICAgICAgICAgICAkKCcubWVtYmVyLWJ1dHRvbl9fdGV4dCcsICR0YXJnZXQpLnRleHQobXVuaWNpcGlvSW50cmFuZXQubGVhdmVfZm9ydW0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJCgnLnByaWNvbicsICR0YXJnZXQpLnJlbW92ZUNsYXNzKCdwcmljb24tbWludXMtbycpLmFkZENsYXNzKCdwcmljb24tcGx1cy1vJyk7XG4gICAgICAgICAgICAkKCcubWVtYmVyLWJ1dHRvbl9fdGV4dCcsICR0YXJnZXQpLnRleHQobXVuaWNpcGlvSW50cmFuZXQuam9pbl9mb3J1bSk7XG4gICAgICAgIH1cbiAgICAgICAgJHRhcmdldC5ibHVyKCk7XG5cbiAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICAgIHVybDogYWpheHVybCxcbiAgICAgICAgICAgIHR5cGU6ICdwb3N0JyxcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICBhY3Rpb246ICdqb2luX2ZvcnVtJyxcbiAgICAgICAgICAgICAgICBwb3N0SWQ6ICR0YXJnZXQuZGF0YSgncG9zdElkJylcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgRm9ydW1zLnByb3RvdHlwZS5kZWxldGVGb3J1bSA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICB2YXIgcG9zdElkID0gKCQoZXZlbnQuY3VycmVudFRhcmdldCkuZGF0YSgncG9zdC1pZCcpKTtcbiAgICAgICAgdmFyIGFyY2hpdmVVcmwgPSAoJChldmVudC5jdXJyZW50VGFyZ2V0KS5kYXRhKCdhcmNoaXZlJykpO1xuXG4gICAgICAgICQuYWpheCh7XG4gICAgICAgICAgICBtZXRob2Q6IFwiREVMRVRFXCIsXG4gICAgICAgICAgICB1cmw6IG11bmljaXBpb0ludHJhbmV0LndwYXBpLnVybCArICd3cC92Mi9mb3J1bXMvJyArIHBvc3RJZCxcbiAgICAgICAgICAgIGJlZm9yZVNlbmQ6IGZ1bmN0aW9uICh4aHIpIHtcbiAgICAgICAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignWC1XUC1Ob25jZScsIG11bmljaXBpb0ludHJhbmV0LndwYXBpLm5vbmNlKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVwbGFjZShhcmNoaXZlVXJsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIEZvcnVtcy5wcm90b3R5cGUudXBkYXRlRm9ydW0gPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgdmFyICR0YXJnZXQgPSAkKGV2ZW50LnRhcmdldCksXG4gICAgICAgICAgICBkYXRhID0gbmV3IEZvcm1EYXRhKGV2ZW50LnRhcmdldCksXG4gICAgICAgICAgICBwb3N0SWQgPSBkb2N1bWVudC5mb3Jtcy5lZGl0Zm9ydW0ucG9zdF9pZC52YWx1ZTtcbiAgICAgICAgZGF0YS5hcHBlbmQoJ3N0YXR1cycsICdwcml2YXRlJyk7XG5cbiAgICAgICAgZnVuY3Rpb24gZGlzcGxheUVycm9yKCkge1xuICAgICAgICAgICAgJCgnLnNwaW5uZXIsLndhcm5pbmcnLCAkdGFyZ2V0KS5yZW1vdmUoKTtcbiAgICAgICAgICAgICQoJy5tb2RhbC1mb290ZXInLCAkdGFyZ2V0KS5wcmVwZW5kKCc8c3BhbiBjbGFzcz1cIm5vdGljZSB3YXJuaW5nIGd1dHRlciBndXR0ZXItbWFyZ2luIGd1dHRlci12ZXJ0aWNhbFwiPjxpIGNsYXNzPVwicHJpY29uIHByaWNvbi1ub3RpY2Utd2FybmluZ1wiPjwvaT4gJyArIG11bmljaXBpb0ludHJhbmV0LnNvbWV0aGluZ193ZW50X3dyb25nICsgJzwvc3Bhbj4nKTtcbiAgICAgICAgfVxuXG4gICAgICAgICQuYWpheCh7XG4gICAgICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgICAgICAgdXJsOiBtdW5pY2lwaW9JbnRyYW5ldC53cGFwaS51cmwgKyAnd3AvdjIvZm9ydW1zLycgKyBwb3N0SWQsXG4gICAgICAgICAgICBkYXRhOiBkYXRhLFxuICAgICAgICAgICAgcHJvY2Vzc0RhdGE6IGZhbHNlLFxuICAgICAgICAgICAgY29udGVudFR5cGU6IGZhbHNlLFxuICAgICAgICAgICAgYmVmb3JlU2VuZDogZnVuY3Rpb24gKHhocikge1xuICAgICAgICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdYLVdQLU5vbmNlJywgbXVuaWNpcGlvSW50cmFuZXQud3BhcGkubm9uY2UpO1xuICAgICAgICAgICAgICAgICQoJ2J1dHRvblt0eXBlPVwic3VibWl0XCJdJywgJHRhcmdldCkuYXBwZW5kKCcgPGkgY2xhc3M9XCJzcGlubmVyXCI+PC9pPicpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcmVzcG9uc2UubGluayAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVwbGFjZShyZXNwb25zZS5saW5rKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5RXJyb3IoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICBkaXNwbGF5RXJyb3IoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07XG5cbiAgICByZXR1cm4gbmV3IEZvcnVtcygpO1xuXG59KShqUXVlcnkpO1xuIiwiSW50cmFuZXQgPSBJbnRyYW5ldCB8fCB7fTtcbkludHJhbmV0Lk1pc2MgPSBJbnRyYW5ldC5NaXNjIHx8IHt9O1xuXG5JbnRyYW5ldC5NaXNjLk5ld3MgPSAoZnVuY3Rpb24gKCQpIHtcbiAgICBmdW5jdGlvbiBOZXdzKCkge1xuXG4gICAgICAgIC8vSW5pdFxuICAgICAgICB0aGlzLmNvbnRhaW5lciAgPSAkKCcubW9kdWxhcml0eS1tb2QtaW50cmFuZXQtbmV3cyAuaW50cmFuZXQtbmV3cycpO1xuICAgICAgICB0aGlzLmJ1dHRvbiAgICAgPSAkKCcubW9kdWxhcml0eS1tb2QtaW50cmFuZXQtbmV3cyBbZGF0YS1hY3Rpb249XCJpbnRyYW5ldC1uZXdzLWxvYWQtbW9yZVwiXScpO1xuICAgICAgICB0aGlzLmNhdGVnb3J5ICAgPSAkKCcubW9kdWxhcml0eS1tb2QtaW50cmFuZXQtbmV3cyBzZWxlY3RbbmFtZT1cImNhdFwiXScpO1xuXG4gICAgICAgIC8vRW5hYmxlIGRpc2FibGVkIGJ1dHRvblxuICAgICAgICB0aGlzLmJ1dHRvbi5wcm9wKCdkaXNhYmxlZCcsIGZhbHNlKTtcblxuICAgICAgICAvL0xvYWQgbW9yZSBjbGlja1xuICAgICAgICB0aGlzLmJ1dHRvbi5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgdGhpcy5sb2FkTW9yZSh0aGlzLmNvbnRhaW5lciwgdGhpcy5idXR0b24pO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgIC8vQ2F0ZWdvcnkgc3dpdGNoZXJcbiAgICAgICAgdGhpcy5jYXRlZ29yeS5vbignY2hhbmdlJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIHRoaXMuY29udGFpbmVyLmVtcHR5KCk7XG4gICAgICAgICAgICB0aGlzLmxvYWRNb3JlKHRoaXMuY29udGFpbmVyLCB0aGlzLmJ1dHRvbik7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgTmV3cy5wcm90b3R5cGUuc2hvd0xvYWRlciA9IGZ1bmN0aW9uKGJ1dHRvbikge1xuICAgICAgICBidXR0b24uaGlkZSgpO1xuICAgICAgICBidXR0b24uYWZ0ZXIoJzxkaXYgY2xhc3M9XCJsb2FkaW5nXCI+PGRpdj48L2Rpdj48ZGl2PjwvZGl2PjxkaXY+PC9kaXY+PGRpdj48L2Rpdj48L2Rpdj4nKTtcbiAgICB9O1xuXG4gICAgTmV3cy5wcm90b3R5cGUuaGlkZUxvYWRlciA9IGZ1bmN0aW9uKGJ1dHRvbikge1xuICAgICAgICBidXR0b24ucGFyZW50KCkuZmluZCgnLmxvYWRpbmcnKS5yZW1vdmUoKTtcbiAgICAgICAgYnV0dG9uLnNob3coKTtcbiAgICB9O1xuXG4gICAgTmV3cy5wcm90b3R5cGUubG9hZE1vcmUgPSBmdW5jdGlvbihjb250YWluZXIsIGJ1dHRvbikge1xuICAgICAgICB2YXIgY2FsbGJhY2tVcmwgICAgID0gY29udGFpbmVyLmF0dHIoJ2RhdGEtaW5maW5pdGUtc2Nyb2xsLWNhbGxiYWNrJyk7XG4gICAgICAgIHZhciBwYWdlc2l6ZSAgICAgICAgPSBjb250YWluZXIuYXR0cignZGF0YS1pbmZpbml0ZS1zY3JvbGwtcGFnZXNpemUnKTtcbiAgICAgICAgdmFyIHNpdGVzICAgICAgICAgICA9IGNvbnRhaW5lci5hdHRyKCdkYXRhLWluZmluaXRlLXNjcm9sbC1zaXRlcycpO1xuICAgICAgICB2YXIgb2Zmc2V0ICAgICAgICAgID0gY29udGFpbmVyLmZpbmQoJ2EuYm94LW5ld3MnKS5sZW5ndGggPyBjb250YWluZXIuZmluZCgnYS5ib3gtbmV3cycpLmxlbmd0aCA6IDA7XG4gICAgICAgIHZhciBtb2R1bGUgICAgICAgICAgPSBjb250YWluZXIuYXR0cignZGF0YS1tb2R1bGUnKTtcbiAgICAgICAgdmFyIGNhdGVnb3J5ICAgICAgICA9IHRoaXMuY2F0ZWdvcnkudmFsKCk7XG4gICAgICAgIHZhciBhcmdzICAgICAgICAgICAgPSBjb250YWluZXIuYXR0cignZGF0YS1hcmdzJyk7XG4gICAgICAgIHZhciB1cmwgICAgICAgICAgICAgPSBudWxsO1xuXG4gICAgICAgIHRoaXMuc2hvd0xvYWRlcihidXR0b24pO1xuXG4gICAgICAgIGlmKCFpc05hTihwYXJzZUZsb2F0KGNhdGVnb3J5KSkgJiYgaXNGaW5pdGUoY2F0ZWdvcnkpKSB7XG4gICAgICAgICAgICB1cmwgPSBjYWxsYmFja1VybCArIHBhZ2VzaXplICsgJy8nICsgb2Zmc2V0ICsgJy8nICsgc2l0ZXMgKyAnLycgKyBjYXRlZ29yeTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHVybCA9IGNhbGxiYWNrVXJsICsgcGFnZXNpemUgKyAnLycgKyBvZmZzZXQgKyAnLycgKyBzaXRlcyArICcvMCc7XG4gICAgICAgIH1cblxuICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgdXJsOiB1cmwsXG4gICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICBtb2R1bGU6IG1vZHVsZSxcbiAgICAgICAgICAgICAgICBhcmdzOiBhcmdzXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZGF0YVR5cGU6ICdKU09OJyxcbiAgICAgICAgICAgIGJlZm9yZVNlbmQ6IGZ1bmN0aW9uICh4aHIpIHtcbiAgICAgICAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignWC1XUC1Ob25jZScsIG11bmljaXBpb0ludHJhbmV0LndwYXBpLm5vbmNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkuZG9uZShmdW5jdGlvbiAocmVzKSB7XG4gICAgICAgICAgICBpZiAocmVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMubm9Nb3JlKGNvbnRhaW5lciwgYnV0dG9uKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMub3V0cHV0KGNvbnRhaW5lciwgcmVzKTtcbiAgICAgICAgICAgIHRoaXMuaGlkZUxvYWRlcihidXR0b24pO1xuXG4gICAgICAgICAgICBpZiAocmVzLmxlbmd0aCA8IHBhZ2VzaXplKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5ub01vcmUoY29udGFpbmVyLCBidXR0b24pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgIH07XG5cbiAgICBOZXdzLnByb3RvdHlwZS5ub01vcmUgPSBmdW5jdGlvbihjb250YWluZXIsIGJ1dHRvbikge1xuICAgICAgICB0aGlzLmhpZGVMb2FkZXIoYnV0dG9uKTtcbiAgICAgICAgYnV0dG9uLnRleHQobXVuaWNpcGlvSW50cmFuZXQubm9fbW9yZV9uZXdzKS5wcm9wKCdkaXNhYmxlZCcsIHRydWUpO1xuICAgIH07XG5cbiAgICBOZXdzLnByb3RvdHlwZS5vdXRwdXQgPSBmdW5jdGlvbihjb250YWluZXIsIG5ld3MpIHtcbiAgICAgICAgJC5lYWNoKG5ld3MsIGZ1bmN0aW9uIChpbmRleCwgaXRlbSkge1xuICAgICAgICAgICAgY29udGFpbmVyLmFwcGVuZChpdGVtLm1hcmt1cCk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICByZXR1cm4gbmV3IE5ld3MoKTtcblxufSkoalF1ZXJ5KTtcblxuIiwiSW50cmFuZXQgPSBJbnRyYW5ldCB8fCB7fTtcbkludHJhbmV0Lk1pc2MgPSBJbnRyYW5ldC5NaXNjIHx8IHt9O1xuXG5JbnRyYW5ldC5NaXNjLlJlcG9ydFBvc3QgPSAoZnVuY3Rpb24gKCQpIHtcblxuICAgIGZ1bmN0aW9uIFJlcG9ydFBvc3QoKSB7XG4gICAgICAgICQoJy5yZXBvcnQtcG9zdCcpLm9uKCdzdWJtaXQnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgICAgICB2YXIgJHRhcmdldCA9ICQodGhpcyksXG4gICAgICAgICAgICAgICAgZGF0YSA9IG5ldyBGb3JtRGF0YSh0aGlzKTtcbiAgICAgICAgICAgICAgICBkYXRhLmFwcGVuZCgnYWN0aW9uJywgJ3JlcG9ydF9wb3N0Jyk7XG5cbiAgICAgICAgICAgIGlmIChkYXRhLmdldCgnZy1yZWNhcHRjaGEtcmVzcG9uc2UnKSA9PT0gJycpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICR0YXJnZXQuZmluZCgnaW5wdXRbdHlwZT1cInN1Ym1pdFwiXScpLmhpZGUoKTtcbiAgICAgICAgICAgICR0YXJnZXQuZmluZCgnLm1vZGFsLWZvb3RlcicpLmFwcGVuZCgnPGRpdiBjbGFzcz1cImxvYWRpbmdcIj48ZGl2PjwvZGl2PjxkaXY+PC9kaXY+PGRpdj48L2Rpdj48ZGl2PjwvZGl2PjwvZGl2PicpO1xuXG4gICAgICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgICAgIHVybDogYWpheHVybCxcbiAgICAgICAgICAgICAgICB0eXBlOiAnUE9TVCcsXG4gICAgICAgICAgICAgICAgZGF0YTogZGF0YSxcbiAgICAgICAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgICAgICAgICAgICAgIHByb2Nlc3NEYXRhOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjb250ZW50VHlwZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24ocmVzcG9uc2UsIHRleHRTdGF0dXMsIGpxWEhSKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5zdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcubW9kYWwtZm9vdGVyJywgJHRhcmdldCkuaHRtbCgnPHNwYW4gY2xhc3M9XCJub3RpY2Ugc3VjY2Vzc1wiPjxpIGNsYXNzPVwicHJpY29uIHByaWNvbi1jaGVja1wiPjwvaT4gJyArIHJlc3BvbnNlLmRhdGEgKyAnPC9zcGFuPicpO1xuXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcubW9kYWwtZm9vdGVyJywgJHRhcmdldCkuaHRtbCgnPHNwYW4gY2xhc3M9XCJub3RpY2Ugd2FybmluZ1wiPjxpIGNsYXNzPVwicHJpY29uIHByaWNvbi1ub3RpY2Utd2FybmluZ1wiPjwvaT4gJyArIHJlc3BvbnNlLmRhdGEgKyAnPC9zcGFuPicpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBjb21wbGV0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9jYXRpb24uaGFzaCA9ICcnO1xuICAgICAgICAgICAgICAgICAgICB9LCAzMDAwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFJlcG9ydFBvc3QoKTtcblxufSkoalF1ZXJ5KTtcbiIsIkludHJhbmV0ID0gSW50cmFuZXQgfHwge307XG5JbnRyYW5ldC5TZWFyY2ggPSBJbnRyYW5ldC5TZWFyY2ggfHwge307XG5cbkludHJhbmV0LlNlYXJjaC5HZW5lcmFsID0gKGZ1bmN0aW9uICgkKSB7XG5cbiAgICB2YXIgdHlwaW5nVGltZXI7XG5cbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3RvclxuICAgICAqIFNob3VsZCBiZSBuYW1lZCBhcyB0aGUgY2xhc3MgaXRzZWxmXG4gICAgICovXG4gICAgZnVuY3Rpb24gR2VuZXJhbCgpIHtcbiAgICAgICAgJCgnLnNlYXJjaCBmb3JtIGlucHV0W25hbWU9XCJsZXZlbFwiXScpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgJChlLnRhcmdldCkucGFyZW50cygnZm9ybScpLnN1Ym1pdCgpO1xuICAgICAgICB9KTtcblxuICAgICAgICAkKCcubmF2YmFyIC5zZWFyY2gnKS5lYWNoKGZ1bmN0aW9uIChpbmRleCwgZWxlbWVudCkge1xuICAgICAgICAgICAgdGhpcy5hdXRvY29tcGxldGUoZWxlbWVudCk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplcyB0aGUgYXV0b2NvbXBsZXRlIGZ1bmN0aW9uYWxpdHlcbiAgICAgKiBAcGFyYW0gIHtvYmplY3R9IGVsZW1lbnQgRWxlbWVudFxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgR2VuZXJhbC5wcm90b3R5cGUuYXV0b2NvbXBsZXRlID0gZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgICB2YXIgJGVsZW1lbnQgPSAkKGVsZW1lbnQpO1xuICAgICAgICB2YXIgJGlucHV0ID0gJGVsZW1lbnQuZmluZCgnaW5wdXRbdHlwZT1cInNlYXJjaFwiXScpO1xuXG4gICAgICAgICRpbnB1dC5vbigna2V5ZG93bicsIGZ1bmN0aW9uIChlKSB7XG5cbiAgICAgICAgICAgIHN3aXRjaCAoZS53aGljaCkge1xuICAgICAgICAgICAgICAgIGNhc2UgNDA6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYXV0b2NvbXBsZXRlS2V5Ym9hcmROYXZOZXh0KGVsZW1lbnQpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICBjYXNlIDM4OlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmF1dG9jb21wbGV0ZUtleWJvYXJkTmF2UHJldihlbGVtZW50KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgICAgICAgICAgY2FzZSAxMzpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuYXV0b2NvbXBsZXRlU3VibWl0KGVsZW1lbnQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodHlwaW5nVGltZXIpO1xuXG4gICAgICAgICAgICBpZiAoJGlucHV0LnZhbCgpLmxlbmd0aCA8IDMpIHtcbiAgICAgICAgICAgICAgICAkZWxlbWVudC5maW5kKCcuc2VhcmNoLWF1dG9jb21wbGV0ZScpLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdHlwaW5nVGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmF1dG9jb21wbGV0ZVF1ZXJ5KGVsZW1lbnQpO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpLCAzMDApO1xuXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIGlmICghJChlLnRhcmdldCkuY2xvc2VzdCgnLnNlYXJjaC1hdXRvY29tcGxldGUnKS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAkKCcuc2VhcmNoLWF1dG9jb21wbGV0ZScpLnJlbW92ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAkaW5wdXQub24oJ2ZvY3VzJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIGlmICgkaW5wdXQudmFsKCkubGVuZ3RoIDwgMykge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuYXV0b2NvbXBsZXRlUXVlcnkoZWxlbWVudCk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFN1Ym1pdCBhdXRvY29tcGxldGVcbiAgICAgKiBAcGFyYW0gIHtvYmplY3R9IGVsZW1lbnQgQXV0b2NvbXBsZXRlIGVsZW1lbnRcbiAgICAgKiBAcmV0dXJuIHtib29sfVxuICAgICAqL1xuICAgIEdlbmVyYWwucHJvdG90eXBlLmF1dG9jb21wbGV0ZVN1Ym1pdCA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgICAgdmFyICRlbGVtZW50ID0gJChlbGVtZW50KTtcbiAgICAgICAgdmFyICRhdXRvY29tcGxldGUgPSAkZWxlbWVudC5maW5kKCcuc2VhcmNoLWF1dG9jb21wbGV0ZScpO1xuICAgICAgICB2YXIgJHNlbGVjdGVkID0gJGF1dG9jb21wbGV0ZS5maW5kKCcuc2VsZWN0ZWQnKTtcblxuICAgICAgICBpZiAoISRzZWxlY3RlZC5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHVybCA9ICRzZWxlY3RlZC5maW5kKCdhJykuYXR0cignaHJlZicpO1xuICAgICAgICBsb2NhdGlvbi5ocmVmID0gdXJsO1xuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogTmF2aWdhdGUgdG8gbmV4dCBhdXRvY29tcGxldGUgbGlzdCBpdGVtXG4gICAgICogQHBhcmFtICB7b2JqZWN0fSBlbGVtZW50IEF1dG9jb21wbGV0ZSBlbGVtZW50XG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBHZW5lcmFsLnByb3RvdHlwZS5hdXRvY29tcGxldGVLZXlib2FyZE5hdk5leHQgPSBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICAgIHZhciAkZWxlbWVudCA9ICQoZWxlbWVudCk7XG4gICAgICAgIHZhciAkYXV0b2NvbXBsZXRlID0gJGVsZW1lbnQuZmluZCgnLnNlYXJjaC1hdXRvY29tcGxldGUnKTtcblxuICAgICAgICB2YXIgJHNlbGVjdGVkID0gJGF1dG9jb21wbGV0ZS5maW5kKCcuc2VsZWN0ZWQnKTtcbiAgICAgICAgdmFyICRuZXh0ID0gbnVsbDtcblxuICAgICAgICBpZiAoISRzZWxlY3RlZC5sZW5ndGgpIHtcbiAgICAgICAgICAgICRuZXh0ID0gJGF1dG9jb21wbGV0ZS5maW5kKCdsaTpub3QoLnRpdGxlKTpmaXJzdCcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJG5leHQgPSAkc2VsZWN0ZWQubmV4dCgnbGk6bm90KC50aXRsZSk6Zmlyc3QnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghJG5leHQubGVuZ3RoKSB7XG4gICAgICAgICAgICB2YXIgJG5leHRVbCA9ICRzZWxlY3RlZC5wYXJlbnRzKCd1bCcpLm5leHQoJ3VsJyk7XG4gICAgICAgICAgICBpZiAoJG5leHRVbC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAkbmV4dCA9ICRuZXh0VWwuZmluZCgnbGk6bm90KC50aXRsZSk6Zmlyc3QnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgICRzZWxlY3RlZC5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKTtcbiAgICAgICAgJG5leHQuYWRkQ2xhc3MoJ3NlbGVjdGVkJyk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIE5hdmlnYXRlIHRvIHByZXZpb3VzIGF1dG9jb21wbGV0ZSBsaXN0IGl0ZW1cbiAgICAgKiBAcGFyYW0gIHtvYmplY3R9IGVsZW1lbnQgQXV0b2NvbXBsZXRlIGVsZW1lbnRcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIEdlbmVyYWwucHJvdG90eXBlLmF1dG9jb21wbGV0ZUtleWJvYXJkTmF2UHJldiA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgICAgdmFyICRlbGVtZW50ID0gJChlbGVtZW50KTtcbiAgICAgICAgdmFyICRhdXRvY29tcGxldGUgPSAkZWxlbWVudC5maW5kKCcuc2VhcmNoLWF1dG9jb21wbGV0ZScpO1xuXG4gICAgICAgIHZhciAkc2VsZWN0ZWQgPSAkYXV0b2NvbXBsZXRlLmZpbmQoJy5zZWxlY3RlZCcpO1xuICAgICAgICB2YXIgJHByZXYgPSBudWxsO1xuXG4gICAgICAgIGlmICghJHNlbGVjdGVkLmxlbmd0aCkge1xuICAgICAgICAgICAgJHByZXYgPSAkYXV0b2NvbXBsZXRlLmZpbmQoJ2xpOm5vdCgudGl0bGUpOmxhc3QnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICRwcmV2ID0gJHNlbGVjdGVkLnByZXYoJ2xpOm5vdCgudGl0bGUpJyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoISRwcmV2Lmxlbmd0aCkge1xuICAgICAgICAgICAgdmFyICRwcmV2VWwgPSAkc2VsZWN0ZWQucGFyZW50cygndWwnKS5wcmV2KCd1bCcpO1xuICAgICAgICAgICAgaWYgKCRwcmV2VWwubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgJHByZXYgPSAkcHJldlVsLmZpbmQoJ2xpOm5vdCgudGl0bGUpOmxhc3QnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgICRzZWxlY3RlZC5yZW1vdmVDbGFzcygnc2VsZWN0ZWQnKTtcbiAgICAgICAgJHByZXYuYWRkQ2xhc3MoJ3NlbGVjdGVkJyk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFF1ZXJ5IGZvciBhdXRvY29tcGxldGUgc3VnZ2VzdGlvbnNcbiAgICAgKiBAcGFyYW0gIHtvYmplY3R9IGVsZW1lbnQgQXV0b2NvbXBsZXRlIGVsZW1lbnRcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIEdlbmVyYWwucHJvdG90eXBlLmF1dG9jb21wbGV0ZVF1ZXJ5ID0gZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgICB2YXIgJGVsZW1lbnQgPSAkKGVsZW1lbnQpO1xuICAgICAgICB2YXIgJGlucHV0ID0gJGVsZW1lbnQuZmluZCgnaW5wdXRbdHlwZT1cInNlYXJjaFwiXScpO1xuICAgICAgICB2YXIgcXVlcnkgPSAkaW5wdXQudmFsKCk7XG5cbiAgICAgICAgdmFyIGRhdGEgPSB7XG4gICAgICAgICAgICBhY3Rpb246ICdzZWFyY2hfYXV0b2NvbXBsZXRlJyxcbiAgICAgICAgICAgIHM6ICRpbnB1dC52YWwoKSxcbiAgICAgICAgICAgIGxldmVsOiAnYWpheCdcbiAgICAgICAgfTtcblxuICAgICAgICAkZWxlbWVudC5maW5kKCdidXR0b25bdHlwZT1cInN1Ym1pdFwiXScpLmFkZENsYXNzKFwic2VhcmNoaW5nXCIpO1xuXG4gICAgICAgICQuYWpheCh7XG4gICAgICAgICAgICB1cmw6IG11bmljaXBpb0ludHJhbmV0LndwYXBpLnVybCArICdpbnRyYW5ldC8xLjAvcy8nICsgcXVlcnksXG4gICAgICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICAgICAgZGF0YVR5cGU6ICdKU09OJyxcbiAgICAgICAgICAgIGJlZm9yZVNlbmQ6IGZ1bmN0aW9uICggeGhyICkge1xuICAgICAgICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdYLVdQLU5vbmNlJywgbXVuaWNpcGlvSW50cmFuZXQud3BhcGkubm9uY2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KS5kb25lKGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgICAgICRlbGVtZW50LmZpbmQoJy5zZWFyY2gtYXV0b2NvbXBsZXRlJykucmVtb3ZlKCk7XG4gICAgICAgICAgICB0aGlzLm91dHB1dEF1dG9jb21wbGV0ZShlbGVtZW50LCByZXMpO1xuICAgICAgICAgICAgJGVsZW1lbnQuZmluZCgnYnV0dG9uW3R5cGU9XCJzdWJtaXRcIl0nKS5yZW1vdmVDbGFzcyhcInNlYXJjaGluZ1wiKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBPdXRwdXRzIHRoZSBhdXRvY29tcGxldGUgZHJvcGRvd25cbiAgICAgKiBAcGFyYW0gIHtvYmplY3R9IGVsZW1lbnQgQXV0b2NvbXBsZXRlIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0gIHthcnJheX0gIHJlcyAgICAgQXV0b2NvbXBsZXRlIHF1ZXJ5IHJlc3VsdFxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgR2VuZXJhbC5wcm90b3R5cGUub3V0cHV0QXV0b2NvbXBsZXRlID0gZnVuY3Rpb24oZWxlbWVudCwgcmVzKSB7XG4gICAgICAgIHZhciAkZWxlbWVudCA9ICQoZWxlbWVudCk7XG4gICAgICAgIHZhciAkYXV0b2NvbXBsZXRlID0gJCgnPGRpdiBjbGFzcz1cInNlYXJjaC1hdXRvY29tcGxldGVcIj48L2Rpdj4nKTtcblxuICAgICAgICB2YXIgJHVzZXJzID0gJCgnPHVsIGNsYXNzPVwic2VhcmNoLWF1dG9jb21wbGV0ZS11c2Vyc1wiPjxsaSBjbGFzcz1cInRpdGxlXCI+PGkgY2xhc3M9XCJwcmljb24gcHJpY29uLXVzZXItb1wiPjwvaT4gJyArIG11bmljaXBpb0ludHJhbmV0LnNlYXJjaEF1dG9jb21wbGV0ZS5wZXJzb25zICsgJzwvbGk+PC91bD4nKTtcbiAgICAgICAgdmFyICRjb250ZW50ID0gJCgnPHVsIGNsYXNzPVwic2VhcmNoLWF1dG9jb21wbGV0ZS1jb250ZW50XCI+PGxpIGNsYXNzPVwidGl0bGVcIj48aSBjbGFzcz1cInByaWNvbiBwcmljb24tZmlsZS10ZXh0XCI+PC9pPiAnICsgbXVuaWNpcGlvSW50cmFuZXQuc2VhcmNoQXV0b2NvbXBsZXRlLmNvbnRlbnQgKyAnPC9saT48L3VsPicpO1xuXG4gICAgICAgIC8vIFVzZXJzXG4gICAgICAgIGlmICh0eXBlb2YgcmVzLnVzZXJzICE9ICd1bmRlZmluZWQnICYmIHJlcy51c2VycyAhPT0gbnVsbCAmJiByZXMudXNlcnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgJC5lYWNoKHJlcy51c2VycywgZnVuY3Rpb24gKGluZGV4LCB1c2VyKSB7XG4gICAgICAgICAgICAgICAgaWYgKHVzZXIucHJvZmlsZV9pbWFnZSkge1xuICAgICAgICAgICAgICAgICAgICAkdXNlcnMuYXBwZW5kKCc8bGk+PGEgaHJlZj1cIicgKyB1c2VyLnByb2ZpbGVfdXJsICsgJ1wiPjxpbWcgc3JjPVwiJyArIHVzZXIucHJvZmlsZV9pbWFnZSArICdcIiBjbGFzcz1cInNlYXJjaC1hdXRvY29tcGxldGUtaW1hZ2VcIj4gJyArIHVzZXIubmFtZSArICc8L2E+PC9saT4nKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICR1c2Vycy5hcHBlbmQoJzxsaT48YSBocmVmPVwiJyArIHVzZXIucHJvZmlsZV91cmwgKyAnXCI+JyArIHVzZXIubmFtZSArICc8L2E+PC9saT4nKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJHVzZXJzID0gJCgnJyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDb250ZW50XG4gICAgICAgIGlmICh0eXBlb2YgcmVzLmNvbnRlbnQgIT0gJ3VuZGVmaW5lZCcgJiYgcmVzLmNvbnRlbnQgIT09IG51bGwgJiYgcmVzLmNvbnRlbnQubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgJC5lYWNoKHJlcy5jb250ZW50LCBmdW5jdGlvbiAoaW5kZXgsIHBvc3QpIHtcbiAgICAgICAgICAgICAgICBpZiAocG9zdC5pc19maWxlKSB7XG4gICAgICAgICAgICAgICAgICAgICRjb250ZW50LmFwcGVuZCgnPGxpPjxhIGNsYXNzPVwibGluay1pdGVtLWJlZm9yZVwiIGhyZWY9XCInICsgcG9zdC5wZXJtYWxpbmsgKyAnXCIgdGFyZ2V0PVwiX2JsYW5rXCI+JyArIHBvc3QucG9zdF90aXRsZSArICc8L2E+PC9saT4nKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAkY29udGVudC5hcHBlbmQoJzxsaT48YSBocmVmPVwiJyArIHBvc3QucGVybWFsaW5rICsgJ1wiPicgKyBwb3N0LnBvc3RfdGl0bGUgKyAnPC9hPjwvbGk+Jyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkY29udGVudCA9ICQoJycpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKChyZXMuY29udGVudCA9PT0gbnVsbCB8fCByZXMuY29udGVudC5sZW5ndGggPT09IDApICYmIChyZXMudXNlcnMgPT09IG51bGwgfHwgcmVzLnVzZXJzLmxlbmd0aCA9PT0gMCkpIHtcbiAgICAgICAgICAgIC8vICRhdXRvY29tcGxldGUuYXBwZW5kKCc8dWw+PGxpIGNsYXNzPVwic2VhcmNoLWF1dG9jb21wbGV0ZS1ub3RoaW5nLWZvdW5kXCI+SW5nYSB0csOkZmZhcuKApjwvbGk+PC91bD4nKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgICRjb250ZW50LmFwcGVuZFRvKCRhdXRvY29tcGxldGUpO1xuICAgICAgICAkdXNlcnMuYXBwZW5kVG8oJGF1dG9jb21wbGV0ZSk7XG5cbiAgICAgICAgJGF1dG9jb21wbGV0ZS5hcHBlbmQoJzxidXR0b24gdHlwZT1cInN1Ym1pdFwiIGNsYXNzPVwicmVhZC1tb3JlIGJsb2NrLWxldmVsXCI+JyArIG11bmljaXBpb0ludHJhbmV0LnNlYXJjaEF1dG9jb21wbGV0ZS52aWV3QWxsICsgJzwvYT4nKTtcblxuICAgICAgICAkYXV0b2NvbXBsZXRlLmFwcGVuZFRvKCRlbGVtZW50KS5zaG93KCk7XG4gICAgfTtcblxuICAgIC8vcmV0dXJuIG5ldyBHZW5lcmFsKCk7XG5cbn0pKGpRdWVyeSk7XG4iLCJJbnRyYW5ldCA9IEludHJhbmV0IHx8IHt9O1xuSW50cmFuZXQuU2VhcmNoID0gSW50cmFuZXQuU2VhcmNoIHx8IHt9O1xuXG5JbnRyYW5ldC5TZWFyY2guU2l0ZXMgPSAoZnVuY3Rpb24gKCQpIHtcblxuICAgIHZhciB0eXBlVGltZXIgPSBmYWxzZTtcbiAgICB2YXIgYnRuQmVmb3JlID0gZmFsc2U7XG5cbiAgICAvKipcbiAgICAgKiBIYW5kbGUgZXZlbnRzIGZvciB0cmlnZ2VyaW5nIGEgc2VhcmNoXG4gICAgICovXG4gICAgZnVuY3Rpb24gU2l0ZXMoKSB7XG4gICAgICAgIGJ0bkJlZm9yZSA9ICQoJ2Zvcm0ubmV0d29yay1zZWFyY2ggYnV0dG9uW3R5cGU9XCJzdWJtaXRcIl0nKS5odG1sKCk7XG5cbiAgICAgICAgLy8gV2hpbGUgdHlwaW5nIGluIGlucHV0XG4gICAgICAgICQoJ2Zvcm0ubmV0d29yay1zZWFyY2ggaW5wdXRbdHlwZT1cInNlYXJjaFwiXScpLm9uKCdpbnB1dCcsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodHlwZVRpbWVyKTtcblxuICAgICAgICAgICAgJHNlYXJjaElucHV0ID0gJChlLnRhcmdldCkuY2xvc2VzdCgnaW5wdXRbdHlwZT1cInNlYXJjaFwiXScpO1xuICAgICAgICAgICAgdmFyIGtleXdvcmQgPSAkc2VhcmNoSW5wdXQudmFsKCk7XG5cbiAgICAgICAgICAgIGlmIChrZXl3b3JkLmxlbmd0aCA8IDIpIHtcbiAgICAgICAgICAgICAgICAkKCdmb3JtLm5ldHdvcmstc2VhcmNoIGJ1dHRvblt0eXBlPVwic3VibWl0XCJdJykuaHRtbChidG5CZWZvcmUpO1xuICAgICAgICAgICAgICAgICQoJy5uZXR3b3JrLXNlYXJjaC1yZXN1bHRzLWl0ZW1zJykucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgJCgnLm5ldHdvcmstc2VhcmNoLXJlc3VsdHMgLm15LW5ldHdvcmtzJykuc2hvdygpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAkKCdmb3JtLm5ldHdvcmstc2VhcmNoIGJ1dHRvblt0eXBlPVwic3VibWl0XCJdJykuaHRtbCgnPGkgY2xhc3M9XCJsb2FkaW5nLWRvdHMgbG9hZGluZy1kb3RzLWhpZ2hpZ2h0XCI+PC9pPicpO1xuXG4gICAgICAgICAgICB0eXBlVGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNlYXJjaChrZXl3b3JkKTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSwgMTAwMCk7XG5cbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgICAvLyBTdWJtaXQgYnV0dG9uXG4gICAgICAgICQoJ2Zvcm0ubmV0d29yay1zZWFyY2gnKS5vbignc3VibWl0JywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0eXBlVGltZXIpO1xuXG4gICAgICAgICAgICAkKCdmb3JtLm5ldHdvcmstc2VhcmNoIGJ1dHRvblt0eXBlPVwic3VibWl0XCJdJykuaHRtbCgnPGkgY2xhc3M9XCJsb2FkaW5nLWRvdHMgbG9hZGluZy1kb3RzLWhpZ2hpZ2h0XCI+PC9pPicpO1xuICAgICAgICAgICAgJHNlYXJjaElucHV0ID0gJChlLnRhcmdldCkuZmluZCgnaW5wdXRbdHlwZT1cInNlYXJjaFwiXScpO1xuXG4gICAgICAgICAgICB2YXIga2V5d29yZCA9ICRzZWFyY2hJbnB1dC52YWwoKTtcbiAgICAgICAgICAgIHRoaXMuc2VhcmNoKGtleXdvcmQsIHRydWUpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFBlcmZvcm1zIGFuIGFqYXggcG9zdCB0byB0aGUgc2VhcmNoIHNjcmlwdFxuICAgICAqIEBwYXJhbSAge3N0cmluZ30ga2V5d29yZCBUaGUgc2VhcmNoIGtleXdvcmRcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIFNpdGVzLnByb3RvdHlwZS5zZWFyY2ggPSBmdW5jdGlvbiAoa2V5d29yZCwgcmVkaXJlY3RUb1BlcmZlY3RNYXRjaCkge1xuICAgICAgICBpZiAodHlwZW9mIHJlZGlyZWN0VG9QZXJmZWN0TWF0Y2ggPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHJlZGlyZWN0VG9QZXJmZWN0TWF0Y2ggPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBkYXRhID0ge1xuICAgICAgICAgICAgYWN0aW9uOiAnc2VhcmNoX3NpdGVzJyxcbiAgICAgICAgICAgIHM6IGtleXdvcmRcbiAgICAgICAgfTtcblxuICAgICAgICAkLnBvc3QoYWpheHVybCwgZGF0YSwgZnVuY3Rpb24gKHJlcykge1xuICAgICAgICAgICAgaWYgKHJlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICQuZWFjaChyZXMsIGZ1bmN0aW9uIChpbmRleCwgaXRlbSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZW1wdHlSZXN1bHRzKCk7XG5cbiAgICAgICAgICAgICAgICBpZiAocmVkaXJlY3RUb1BlcmZlY3RNYXRjaCAmJiBrZXl3b3JkLnRvTG93ZXJDYXNlKCkgPT0gaXRlbS5uYW1lLnRvTG93ZXJDYXNlKCkgfHzCoChpdGVtLnNob3J0X25hbWUubGVuZ3RoICYmIGtleXdvcmQudG9Mb3dlckNhc2UoKSA9PSBpdGVtLnNob3J0X25hbWUudG9Mb3dlckNhc2UoKSkpIHtcblxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24gPSBpdGVtLnBhdGg7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aGlzLmFkZFJlc3VsdChpdGVtLmRvbWFpbiwgaXRlbS5wYXRoLCBpdGVtLm5hbWUsIGl0ZW0uc2hvcnRfbmFtZSk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgICAgICBpZiAoYnRuQmVmb3JlKSB7XG4gICAgICAgICAgICAgICAgJCgnZm9ybS5uZXR3b3JrLXNlYXJjaCBidXR0b25bdHlwZT1cInN1Ym1pdFwiXScpLmh0bWwoYnRuQmVmb3JlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfS5iaW5kKHRoaXMpLCAnSlNPTicpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIGEgaXRlbSB0byB0aGUgcmVzdWx0IGxpc3RcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZG9tYWluICAgIFRoZSBkb21haW4gb2YgdGhlIHVybFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoICAgICAgVGhlIHBhdGggb2YgdGhlIHVybFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lICAgICAgVGhlIG5hbWUgb2YgdGhlIG5ldHdvcmsgc2l0ZVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzaG9ydG5hbWUgVGhlIHNob3J0IG5hbWUgb2YgdGhlIG5ldHdvcmsgc2l0ZVxuICAgICAqL1xuICAgIFNpdGVzLnByb3RvdHlwZS5hZGRSZXN1bHQgPSBmdW5jdGlvbiAoZG9tYWluLCBwYXRoLCBuYW1lLCBzaG9ydG5hbWUpIHtcbiAgICAgICAgJCgnLm5ldHdvcmstc2VhcmNoLXJlc3VsdHMgLm15LW5ldHdvcmtzJykuaGlkZSgpO1xuXG4gICAgICAgIGlmICgkKCcubmV0d29yay1zZWFyY2gtcmVzdWx0cy1pdGVtcycpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgJCgnLm5ldHdvcmstc2VhcmNoLXJlc3VsdHMnKS5hcHBlbmQoJzx1bCBjbGFzcz1cIm5ldHdvcmstc2VhcmNoLXJlc3VsdHMtaXRlbXNcIj48L3VsPicpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNob3J0bmFtZSkge1xuICAgICAgICAgICAgJCgnLm5ldHdvcmstc2VhcmNoLXJlc3VsdHMtaXRlbXMnKS5hcHBlbmQoJzxsaSBjbGFzcz1cIm5ldHdvcmstdGl0bGVcIj48YSBocmVmPVwiLy8nICsgZG9tYWluICsgcGF0aCArICdcIj4nICsgc2hvcnRuYW1lICsgJyA8ZW0+JyArIG5hbWUgKyAgJzwvZW0+PC9hPjwvbGk+Jyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAkKCcubmV0d29yay1zZWFyY2gtcmVzdWx0cy1pdGVtcycpLmFwcGVuZCgnPGxpIGNsYXNzPVwibmV0d29yay10aXRsZVwiPjxhIGhyZWY9XCIvLycgKyBkb21haW4gKyBwYXRoICsgJ1wiPicgKyBuYW1lICsgICc8L2E+PC9saT4nKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogRW1wdGllcyB0aGUgcmVzdWx0IGxpc3RcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIFNpdGVzLnByb3RvdHlwZS5lbXB0eVJlc3VsdHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICQoJy5uZXR3b3JrLXNlYXJjaC1yZXN1bHRzLWl0ZW1zJykuZW1wdHkoKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIG5ldyBTaXRlcygpO1xuXG59KShqUXVlcnkpO1xuIiwiXG5JbnRyYW5ldCA9IEludHJhbmV0IHx8IHt9O1xuSW50cmFuZXQuU2VhcmNoID0gSW50cmFuZXQuU2VhcmNoIHx8IHt9O1xuXG5JbnRyYW5ldC5TZWFyY2guVXNlciA9IChmdW5jdGlvbiAoJCkge1xuXG4gICAgLy9EZWZpbmUgdGFyZ2V0IGVsZW1lbnRzXG4gICAgdmFyIGxvYWRlckVsZW1lbnQgPSBcIi5qcy11c2VyLWxvYWRlclwiO1xuICAgIHZhciBsb2FkZXJUZXh0RWxlbWVudCA9IFwiLmpzLXVzZXItbG9hZGVyLXRleHRcIjtcbiAgICB2YXIgcmVzdWx0RWxlbWVudCA9IFwiLmpzLXVzZXItc2VhcmNoLXJlc3VsdHNcIjtcbiAgICB2YXIgZW1wdHlSZXN1bHRFbGVtZW50ID0gXCIuanMtdXNlci1udW1iZXItbm90LWZvdW5kXCI7XG4gICAgdmFyIG5ick9mTWF0Y2hlcyA9IFwiLmpzLXVzZXItbnVtYmVyLWZvdW5kXCI7XG4gICAgdmFyIGFsbEJ1dHRvbkVsZW1lbnQgPSBcIi5qcy11c2VyLXNob3ctYWxsLXJlc3VsdHNcIjtcblxuICAgIHZhciB0eXBlVGltZXIgPSAwO1xuXG4gICAgZnVuY3Rpb24gVXNlcigpIHtcblxuICAgICAgICAvL0Rpc2FibGUgb24gYWxsIHBhZ2VzIG5vdCBjb250YWluZ2luZyB1c2VyIHdpZGdldFxuICAgICAgICBpZihqUXVlcnkoXCIjdXNlci1sYXp5LWxvYWRcIikubGVuZ3RoID09IDApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vSW5pdGl0YWxcbiAgICAgICAgJCgnaW5wdXRbdHlwZT1cInNlYXJjaFwiXSwgI2FsZ29saWEtc2VhcmNoLWJveCBpbnB1dCcpLmVhY2goZnVuY3Rpb24oaW5kZXgsIGl0ZW0pIHtcbiAgICAgICAgICAgIGlmKCQoaXRlbSkudmFsKCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNlYXJjaEluaXQoJChpdGVtKS52YWwoKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgICQod2luZG93KS5vbignbG9hZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgLy8gV2hpbGUgdHlwaW5nIGluIGlucHV0XG4gICAgICAgICAgICAkKCdpbnB1dFt0eXBlPVwic2VhcmNoXCJdLCAjYWxnb2xpYS1zZWFyY2gtYm94IGlucHV0Jykub24oJ2lucHV0JywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodHlwZVRpbWVyKTtcbiAgICAgICAgICAgICAgICAkc2VhcmNoSW5wdXQgPSAkKGUudGFyZ2V0KTtcbiAgICAgICAgICAgICAgICB2YXIga2V5d29yZCA9ICRzZWFyY2hJbnB1dC52YWwoKTtcbiAgICAgICAgICAgICAgICB0eXBlVGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWFyY2hJbml0KGtleXdvcmQpO1xuICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSwgMTAwMCk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIFVzZXIucHJvdG90eXBlLnNlYXJjaEluaXQgPSBmdW5jdGlvbihxdWVyeSkge1xuXG4gICAgICAgIHRoaXMuc2hvd0VsZW1lbnQoalF1ZXJ5KGxvYWRlclRleHRFbGVtZW50KSk7XG4gICAgICAgIHRoaXMuc2hvd0VsZW1lbnQoalF1ZXJ5KGxvYWRlckVsZW1lbnQpKTtcbiAgICAgICAgdGhpcy5oaWRlRWxlbWVudChqUXVlcnkoZW1wdHlSZXN1bHRFbGVtZW50KSk7XG4gICAgICAgIHRoaXMuaGlkZUVsZW1lbnQoalF1ZXJ5KGFsbEJ1dHRvbkVsZW1lbnQpKTtcbiAgICAgICAgdGhpcy5oaWRlRWxlbWVudChqUXVlcnkocmVzdWx0RWxlbWVudCkpO1xuICAgICAgICB0aGlzLmhpZGVFbGVtZW50KGpRdWVyeShuYnJPZk1hdGNoZXMpKTtcblxuICAgICAgICB0aGlzLmZldGNoVXNlcnMocXVlcnkpO1xuICAgIH07XG5cbiAgICBVc2VyLnByb3RvdHlwZS5zaG93RWxlbWVudD0gZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgICAgIHRhcmdldC5yZW1vdmVDbGFzcyhcImhpZGRlblwiKTtcbiAgICB9O1xuXG4gICAgVXNlci5wcm90b3R5cGUuaGlkZUVsZW1lbnQgPSBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICAgICAgdGFyZ2V0LmFkZENsYXNzKFwiaGlkZGVuXCIpO1xuICAgIH07XG5cbiAgICBVc2VyLnByb3RvdHlwZS5kaXNhYmxlQnV0dG9uID0gZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgICAgIHRhcmdldC5hdHRyKCdkaXNhYmxlZCcsICdkaXNhYmxlZCcpO1xuICAgIH07XG5cbiAgICBVc2VyLnByb3RvdHlwZS5mZXRjaFVzZXJzID0gZnVuY3Rpb24ocXVlcnkpIHtcblxuICAgICAgICB2YXIgZGF0YSA9IHtcbiAgICAgICAgICAgICdhY3Rpb24nOiAnc2VhcmNoX3VzZXJzJyxcbiAgICAgICAgICAgICdxdWVyeSc6IHF1ZXJ5XG4gICAgICAgIH07XG5cbiAgICAgICAgJC5wb3N0KGFqYXh1cmwsIGRhdGEsIGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cbiAgICAgICAgICAgIHRoaXMuaGlkZUVsZW1lbnQoalF1ZXJ5KGxvYWRlckVsZW1lbnQpKTtcbiAgICAgICAgICAgIHRoaXMuaGlkZUVsZW1lbnQoalF1ZXJ5KGxvYWRlclRleHRFbGVtZW50KSk7XG5cbiAgICAgICAgICAgIGlmKHR5cGVvZiByZXNwb25zZS5pdGVtcyAhPT0gJ3VuZGVmaW5lZCcpIHtcblxuICAgICAgICAgICAgICAgIC8vRW1wdHkgcmVzdWx0XG4gICAgICAgICAgICAgICAgJChyZXN1bHRFbGVtZW50KS5odG1sKFwiXCIpO1xuXG4gICAgICAgICAgICAgICAgLy9DcmVhdGUgXyB2aWV3IHVzZXIgaXRlbVxuICAgICAgICAgICAgICAgIHZhciB1c2VyVGVtcGxhdGUgPSB3cC50ZW1wbGF0ZShcInVzZXItaXRlbVwiKTtcblxuICAgICAgICAgICAgICAgIC8vUG9wdWxhdGVcbiAgICAgICAgICAgICAgICByZXNwb25zZS5pdGVtcy5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgJChyZXN1bHRFbGVtZW50KS5hcHBlbmQodXNlclRlbXBsYXRlKGVsZW1lbnQuZGF0YSkpO1xuICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgICAgICAgICAvL1Nob3dcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dFbGVtZW50KGpRdWVyeShyZXN1bHRFbGVtZW50KSk7XG5cbiAgICAgICAgICAgICAgICAvL0NyZWF0ZSBfIHZpZXcgdXNlciBtYXRjaGVzXG4gICAgICAgICAgICAgICAgdmFyIHVzZXJNYXRjaGVzVGVtcGxhdGUgPSB3cC50ZW1wbGF0ZShcInVzZXItbmJyLW1hdGNoZXNcIik7XG5cbiAgICAgICAgICAgICAgICAvL1BvcHVsYXRlXG4gICAgICAgICAgICAgICAgJChuYnJPZk1hdGNoZXMpLmh0bWwodXNlck1hdGNoZXNUZW1wbGF0ZSh7Y291bnQ6IHJlc3BvbnNlLm5icm9maXRlbXN9KSk7XG5cbiAgICAgICAgICAgICAgICAvL1Nob3cgbW9yZSBidXR0b24gJiBudW1iZXIgb2YgbWF0Y2hlc1xuICAgICAgICAgICAgICAgIGlmKHJlc3BvbnNlLml0ZW1zLmxlbmd0aCAhPSByZXNwb25zZS5uYnJvZml0ZW1zKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2hvd0VsZW1lbnQoalF1ZXJ5KGFsbEJ1dHRvbkVsZW1lbnQpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5zaG93RWxlbWVudChqUXVlcnkobmJyT2ZNYXRjaGVzKSk7XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5oaWRlRWxlbWVudChqUXVlcnkoYWxsQnV0dG9uRWxlbWVudCkpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2hvd0VsZW1lbnQoalF1ZXJ5KGVtcHR5UmVzdWx0RWxlbWVudCkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICB9O1xuXG4gICAgcmV0dXJuIG5ldyBVc2VyKCk7XG5cbn0pKGpRdWVyeSk7XG4iLCJJbnRyYW5ldCA9IEludHJhbmV0IHx8IHt9O1xuSW50cmFuZXQuVXNlciA9IEludHJhbmV0LlVzZXIgfHwge307XG5cbkludHJhbmV0LlVzZXIuRmFjZWJvb2tQcm9maWxlU3luYyA9IChmdW5jdGlvbiAoJCkge1xuICAgIGZ1bmN0aW9uIEZhY2Vib29rUHJvZmlsZVN5bmMoKSB7XG5cbiAgICB9XG5cbiAgICBGYWNlYm9va1Byb2ZpbGVTeW5jLnByb3RvdHlwZS5nZXREZXRhaWxzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICQoJy5mYi1sb2dpbi1jb250YWluZXIgLmZiLWxvZ2luLWJ1dHRvbicpLmhpZGUoKTtcbiAgICAgICAgJCgnLmZiLWxvZ2luLWNvbnRhaW5lcicpLmFwcGVuZCgnPGRpdiBjbGFzcz1cImxvYWRpbmcgbG9hZGluZy1yZWRcIj48ZGl2PjwvZGl2PjxkaXY+PC9kaXY+PGRpdj48L2Rpdj48ZGl2PjwvZGl2PjwvZGl2PicpO1xuXG4gICAgICAgIEZCLmFwaSgnL21lJywge2ZpZWxkczogJ2JpcnRoZGF5LCBsb2NhdGlvbid9LCBmdW5jdGlvbiAoZGV0YWlscykge1xuICAgICAgICAgICAgdGhpcy5zYXZlRGV0YWlscyhkZXRhaWxzKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9O1xuXG4gICAgRmFjZWJvb2tQcm9maWxlU3luYy5wcm90b3R5cGUuc2F2ZURldGFpbHMgPSBmdW5jdGlvbihkZXRhaWxzKSB7XG4gICAgICAgIHZhciBkYXRhID0ge1xuICAgICAgICAgICAgYWN0aW9uOiAnc3luY19mYWNlYm9va19wcm9maWxlJyxcbiAgICAgICAgICAgIGRldGFpbHM6IGRldGFpbHNcbiAgICAgICAgfTtcblxuICAgICAgICAkLnBvc3QoYWpheHVybCwgZGF0YSwgZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICBpZiAocmVzcG9uc2UgIT09ICcxJykge1xuICAgICAgICAgICAgICAgICQoJy5mYi1sb2dpbi1jb250YWluZXIgLmxvYWRpbmcnKS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAkKCcuZmItbG9naW4tY29udGFpbmVyJykuYXBwZW5kKCc8ZGl2IGNsYXNzPVwibm90aWNlIHdhcm5pbmdcIj5GYWNlYm9vayBkZXRhaWxzIGRpZCBub3Qgc3luYyBkdWUgdG8gYW4gZXJyb3I8L2Rpdj4nKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgJCgnLmZiLWxvZ2luLWNvbnRhaW5lciAubG9hZGluZycpLnJlbW92ZSgpO1xuICAgICAgICAgICAgJCgnLmZiLWxvZ2luLWNvbnRhaW5lcicpLmFwcGVuZCgnPGRpdiBjbGFzcz1cIm5vdGljZSBzdWNjZXNzXCI+RmFjZWJvb2sgZGV0YWlscyBzeW5jZWQgdG8geW91ciBwcm9maWxlPC9kaXY+Jyk7XG5cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIG5ldyBGYWNlYm9va1Byb2ZpbGVTeW5jKCk7XG5cbn0pKGpRdWVyeSk7XG5cblxuZnVuY3Rpb24gZmFjZWJvb2tQcm9maWxlU3luYygpIHtcbiAgICBJbnRyYW5ldC5Vc2VyLkZhY2Vib29rUHJvZmlsZVN5bmMuZ2V0RGV0YWlscygpO1xufVxuIiwiSW50cmFuZXQgPSBJbnRyYW5ldCB8fCB7fTtcbkludHJhbmV0LlVzZXIgPSBJbnRyYW5ldC5Vc2VyIHx8IHt9O1xuXG5JbnRyYW5ldC5Vc2VyLkxpbmtzID0gKGZ1bmN0aW9uICgkKSB7XG5cbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3RvclxuICAgICAqIFNob3VsZCBiZSBuYW1lZCBhcyB0aGUgY2xhc3MgaXRzZWxmXG4gICAgICovXG4gICAgZnVuY3Rpb24gTGlua3MoKSB7XG4gICAgICAgICQoJ1tkYXRhLXVzZXItbGluay1lZGl0XScpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICB0aGlzLnRvZ2dsZUVkaXQoZS50YXJnZXQpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgICQoJ1tkYXRhLXVzZXItbGluay1hZGRdJykub24oJ3N1Ym1pdCcsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgICAgICRlbGVtZW50ID0gJChlLnRhcmdldCkuY2xvc2VzdCgnZm9ybScpLnBhcmVudHMoJy5ib3gnKTtcblxuICAgICAgICAgICAgdmFyIHRpdGxlID0gJChlLnRhcmdldCkuY2xvc2VzdCgnZm9ybScpLmZpbmQoJ1tuYW1lPVwidXNlci1saW5rLXRpdGxlXCJdJykudmFsKCk7XG4gICAgICAgICAgICB2YXIgbGluayA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJ2Zvcm0nKS5maW5kKCdbbmFtZT1cInVzZXItbGluay11cmxcIl0nKS52YWwoKTtcblxuICAgICAgICAgICAgdGhpcy5hZGRMaW5rKHRpdGxlLCBsaW5rLCAkZWxlbWVudCk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJ1tkYXRhLXVzZXItbGluay1yZW1vdmVdJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICAgICAgdmFyIGJ1dHRvbiA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJ2J1dHRvbicpO1xuICAgICAgICAgICAgdmFyIGVsZW1lbnQgPSBidXR0b24ucGFyZW50cygnLmJveCcpO1xuICAgICAgICAgICAgdmFyIGxpbmsgPSAkKGUudGFyZ2V0KS5jbG9zZXN0KCdidXR0b24nKS5hdHRyKCdkYXRhLXVzZXItbGluay1yZW1vdmUnKTtcblxuICAgICAgICAgICAgdGhpcy5yZW1vdmVMaW5rKGVsZW1lbnQsIGxpbmssIGJ1dHRvbik7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgTGlua3MucHJvdG90eXBlLnRvZ2dsZUVkaXQgPSBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gICAgICAgICR0YXJnZXQgPSAkKHRhcmdldCkuY2xvc2VzdCgnW2RhdGEtdXNlci1saW5rLWVkaXRdJyk7XG4gICAgICAgICRib3ggPSAkdGFyZ2V0LnBhcmVudHMoJy5ib3gnKTtcblxuICAgICAgICBpZiAoJGJveC5oYXNDbGFzcygnaXMtZWRpdGluZycpKSB7XG4gICAgICAgICAgICAkYm94LnJlbW92ZUNsYXNzKCdpcy1lZGl0aW5nJyk7XG4gICAgICAgICAgICAkdGFyZ2V0Lmh0bWwobXVuaWNpcGlvSW50cmFuZXQuZWRpdCkucmVtb3ZlQ2xhc3MoJ3ByaWNvbi1jaGVjaycpLmFkZENsYXNzKCdwcmljb24tZWRpdCcpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgJGJveC5hZGRDbGFzcygnaXMtZWRpdGluZycpO1xuICAgICAgICAkdGFyZ2V0Lmh0bWwobXVuaWNpcGlvSW50cmFuZXQuZG9uZSkuYWRkQ2xhc3MoJ3ByaWNvbi1jaGVjaycpLnJlbW92ZUNsYXNzKCdwcmljb24tZWRpdCcpO1xuICAgIH07XG5cbiAgICBMaW5rcy5wcm90b3R5cGUuYWRkTGluayA9IGZ1bmN0aW9uICh0aXRsZSwgbGluaywgZWxlbWVudCkge1xuICAgICAgICBpZiAoIXRpdGxlLmxlbmd0aCB8fCAhbGluay5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBkYXRhID0ge1xuICAgICAgICAgICAgYWN0aW9uOiAnYWRkX3VzZXJfbGluaycsXG4gICAgICAgICAgICB0aXRsZTogdGl0bGUsXG4gICAgICAgICAgICB1cmw6IGxpbmtcbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgYnV0dG9uVGV4dCA9ICQoZWxlbWVudCkuZmluZCgnYnV0dG9uW3R5cGU9XCJzdWJtaXRcIl0nKS5odG1sKCk7XG4gICAgICAgICQoZWxlbWVudCkuZmluZCgnYnV0dG9uW3R5cGU9XCJzdWJtaXRcIl0nKS5odG1sKCc8aSBjbGFzcz1cInNwaW5uZXIgc3Bpbm5lci1kYXJrXCI+PC9pPicpO1xuXG4gICAgICAgICQucG9zdChhamF4dXJsLCBkYXRhLCBmdW5jdGlvbiAocmVzKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHJlcyAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGVsZW1lbnQuZmluZCgndWwubGlua3MnKS5lbXB0eSgpO1xuXG4gICAgICAgICAgICAkLmVhY2gocmVzLCBmdW5jdGlvbiAoaW5kZXgsIGxpbmspIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFkZExpbmtUb0RvbShlbGVtZW50LCBsaW5rKTtcbiAgICAgICAgICAgICAgICAkKGVsZW1lbnQpLmZpbmQoJ2lucHV0W3R5cGU9XCJ0ZXh0XCJdJykudmFsKCcnKTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgICAgICQoZWxlbWVudCkuZmluZCgnYnV0dG9uW3R5cGU9XCJzdWJtaXRcIl0nKS5odG1sKGJ1dHRvblRleHQpO1xuICAgICAgICB9LmJpbmQodGhpcyksICdKU09OJyk7XG4gICAgfTtcblxuICAgIExpbmtzLnByb3RvdHlwZS5hZGRMaW5rVG9Eb20gPSBmdW5jdGlvbiAoZWxlbWVudCwgbGluaykge1xuICAgICAgICB2YXIgJGxpc3QgPSBlbGVtZW50LmZpbmQoJ3VsLmxpbmtzJyk7XG5cbiAgICAgICAgaWYgKCRsaXN0Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgZWxlbWVudC5maW5kKCcuYm94LWNvbnRlbnQnKS5odG1sKCc8dWwgY2xhc3M9XCJsaW5rc1wiPjwvdWw+Jyk7XG4gICAgICAgICAgICAkbGlzdCA9IGVsZW1lbnQuZmluZCgndWwubGlua3MnKTtcbiAgICAgICAgfVxuXG4gICAgICAgICRsaXN0LmFwcGVuZCgnXFxcbiAgICAgICAgICAgIDxsaT5cXFxuICAgICAgICAgICAgICAgIDxhIGNsYXNzPVwibGluay1pdGVtIGxpbmstaXRlbS1saWdodFwiIGhyZWY9XCInICsgbGluay51cmwgKyAnXCI+JyArIGxpbmsudGl0bGUgKyAnPC9hPlxcXG4gICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0biBidG4taWNvbiBidG4tc20gdGV4dC1sZyBwdWxsLXJpZ2h0IG9ubHktaWYtZWRpdGluZ1wiIGRhdGEtdXNlci1saW5rLXJlbW92ZT1cIicgKyBsaW5rLnVybCArICdcIj4mdGltZXM7PC9idXR0b24+XFxcbiAgICAgICAgICAgIDwvbGk+XFxcbiAgICAgICAgJyk7XG4gICAgfTtcblxuICAgIExpbmtzLnByb3RvdHlwZS5yZW1vdmVMaW5rID0gZnVuY3Rpb24gKGVsZW1lbnQsIGxpbmssIGJ1dHRvbikge1xuICAgICAgICB2YXIgZGF0YSA9IHtcbiAgICAgICAgICAgIGFjdGlvbjogJ3JlbW92ZV91c2VyX2xpbmsnLFxuICAgICAgICAgICAgdXJsOiBsaW5rXG4gICAgICAgIH07XG5cbiAgICAgICAgYnV0dG9uLmh0bWwoJzxpIGNsYXNzPVwic3Bpbm5lciBzcGlubmVyLWRhcmtcIj48L2k+Jyk7XG5cbiAgICAgICAgJC5wb3N0KGFqYXh1cmwsIGRhdGEsIGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcmVzICE9PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHJlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50LmZpbmQoJ3VsLmxpbmtzJykucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5maW5kKCcuYm94LWNvbnRlbnQnKS50ZXh0KG11bmljaXBpb0ludHJhbmV0LnVzZXJfbGlua3NfaXNfZW1wdHkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBlbGVtZW50LmZpbmQoJ3VsLmxpbmtzJykuZW1wdHkoKTtcblxuICAgICAgICAgICAgJC5lYWNoKHJlcywgZnVuY3Rpb24gKGluZGV4LCBsaW5rKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hZGRMaW5rVG9Eb20oZWxlbWVudCwgbGluayk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICB9LmJpbmQodGhpcyksICdKU09OJyk7XG4gICAgfTtcblxuICAgIHJldHVybiBuZXcgTGlua3MoKTtcblxufSkoalF1ZXJ5KTtcbiIsIkludHJhbmV0ID0gSW50cmFuZXQgfHwge307XG5JbnRyYW5ldC5Vc2VyID0gSW50cmFuZXQuVXNlciB8fCB7fTtcblxudmEgPSAoZnVuY3Rpb24gKCQpIHtcblxuICAgIHZhciBjb29raWVLZXkgPSAnbG9naW5fcmVtaW5kZXInO1xuXG4gICAgLyoqXG4gICAgICogQ29uc3RydWN0b3JcbiAgICAgKiBTaG91bGQgYmUgbmFtZWQgYXMgdGhlIGNsYXNzIGl0c2VsZlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIExvZ2luUmVtaW5kZXIoKSB7XG4gICAgICAgIHZhciBkYXRlTm93ID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cbiAgICAgICAgLy8gTG9nZ2VkIGluXG4gICAgICAgIGlmIChtdW5pY2lwaW9JbnRyYW5ldC5pc191c2VyX2xvZ2dlZF9pbikge1xuICAgICAgICAgICAgSGVsc2luZ2JvcmdQcmltZS5IZWxwZXIuQ29va2llLnNldChjb29raWVLZXksIGRhdGVOb3csIDMwKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE5vdCBsb2dnZWQgaW4gYW5kIG5vIHByZXZpb3VzIGxvZ2luIGNvb2tpZVxuICAgICAgICBpZiAoSGVsc2luZ2JvcmdQcmltZS5IZWxwZXIuQ29va2llLmdldChjb29raWVLZXkpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgSGVsc2luZ2JvcmdQcmltZS5IZWxwZXIuQ29va2llLnNldChjb29raWVLZXksIGRhdGVOb3csIDMwKTtcbiAgICAgICAgICAgIHRoaXMuc2hvd1JlbWluZGVyKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBOb3QgbG9nZ2VkIGluIGFuZCBoYXMgcHJldmlvdXMgbG9naW4gY29va2llXG4gICAgICAgIHZhciBsYXN0UmVtaW5kZXIgPSBIZWxzaW5nYm9yZ1ByaW1lLkhlbHBlci5Db29raWUuZ2V0KGNvb2tpZUtleSk7XG4gICAgICAgIGxhc3RSZW1pbmRlciA9IG5ldyBEYXRlKCkuc2V0VGltZShsYXN0UmVtaW5kZXIpO1xuXG4gICAgICAgIHZhciBkYXlzU2luY2VMYXN0UmVtaW5kZXIgPSBNYXRoLnJvdW5kKChkYXRlTm93IC0gbGFzdFJlbWluZGVyKSAvICgxMDAwICogNjAgKiA2MCAqIDI0KSk7XG4gICAgICAgIGlmIChkYXlzU2luY2VMYXN0UmVtaW5kZXIgPiA2KSB7XG4gICAgICAgICAgICB0aGlzLnNob3dSZW1pbmRlcigpO1xuICAgICAgICAgICAgSGVsc2luZ2JvcmdQcmltZS5IZWxwZXIuQ29va2llLnNldChjb29raWVLZXksIGRhdGVOb3csIDMwKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgICQoJyNtb2RhbC1sb2dpbi1yZW1pbmRlcicpLnJlbW92ZSgpO1xuXG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBMb2dpblJlbWluZGVyLnByb3RvdHlwZS5zaG93UmVtaW5kZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgJCgnI21vZGFsLWxvZ2luLXJlbWluZGVyJykuYWRkQ2xhc3MoJ21vZGFsLW9wZW4nKTtcbiAgICAgICAgJCgnYm9keScpLmFkZENsYXNzKCdvdmVyZmxvdy1oaWRkZW4nKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIG5ldyBMb2dpblJlbWluZGVyKCk7XG5cbn0pKGpRdWVyeSk7XG4iLCJJbnRyYW5ldCA9IEludHJhbmV0IHx8IHt9O1xuSW50cmFuZXQuVXNlciA9IEludHJhbmV0LlVzZXIgfHwge307XG5cbkludHJhbmV0LlVzZXIuUHJvZmlsZSA9IChmdW5jdGlvbiAoJCkge1xuXG4gICAgZnVuY3Rpb24gUHJvZmlsZSgpIHtcblxuICAgICAgICAkKCcjYXV0aG9yLWZvcm0gaW5wdXRbdHlwZT1cInN1Ym1pdFwiXScpLmNsaWNrKGZ1bmN0aW9uKGUpIHtcblxuICAgICAgICAgICAgdmFyIGVycm9yQWNjb3JkaW9uID0gdGhpcy5sb2NhdGVBY2NvcmRpb24oKTtcblxuICAgICAgICAgICAgLy9BZGQgJiByZW1vdmUgY2xhc3Nlc1xuICAgICAgICAgICAgaWYoZXJyb3JBY2NvcmRpb24gIT0gbnVsbCkge1xuXG4gICAgICAgICAgICAgICAgLy9CcmVhayBjdXJyZW50IHByb2Nlc3NcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgICAgICAgICAvL1Nob3cgZXJyb3JzXG4gICAgICAgICAgICAgICAgJChcIiNhdXRob3ItZm9ybSAuZm9ybS1lcnJvcnNcIikucmVtb3ZlQ2xhc3MoXCJoaWRkZW5cIik7XG4gICAgICAgICAgICAgICAgJChcIi5hY2NvcmRpb24tZXJyb3JcIixlcnJvckFjY29yZGlvbikucmVtb3ZlQ2xhc3MoXCJoaWRkZW5cIik7XG5cbiAgICAgICAgICAgICAgICAvL0p1bXAgdG8gZXJyb3JzXG4gICAgICAgICAgICAgICAgbG9jYXRpb24uaHJlZiA9IFwiI2Zvcm0tZXJyb3JzXCI7XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgJChcIiNhdXRob3ItZm9ybSAuZm9ybS1lcnJvcnNcIikuYWRkQ2xhc3MoXCJoaWRkZW5cIik7XG4gICAgICAgICAgICAgICAgJChcIi5hY2NvcmRpb24tZXJyb3JcIixlcnJvckFjY29yZGlvbikuYWRkQ2xhc3MoXCJoaWRkZW5cIik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICBQcm9maWxlLnByb3RvdHlwZS5sb2NhdGVBY2NvcmRpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciByZXR1cm5WYWx1ZSA9IG51bGw7XG4gICAgICAgICQoXCIjYXV0aG9yLWZvcm0gc2VjdGlvbi5hY2NvcmRpb24tc2VjdGlvblwiKS5lYWNoKGZ1bmN0aW9uKGluZGV4LGl0ZW0pe1xuICAgICAgICAgICAgaWYoJChcIi5mb3JtLW5vdGljZVwiLCBpdGVtKS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm5WYWx1ZSA9IGl0ZW07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcmV0dXJuVmFsdWU7XG4gICAgfTtcblxuICAgIHJldHVybiBuZXcgUHJvZmlsZSgpO1xuXG59KShqUXVlcnkpO1xuIiwiSW50cmFuZXQgPSBJbnRyYW5ldCB8fCB7fTtcbkludHJhbmV0LlVzZXIgPSBJbnRyYW5ldC5Vc2VyIHx8IHt9O1xuXG5JbnRyYW5ldC5Vc2VyLlN1YnNjcmliZSA9IChmdW5jdGlvbiAoJCkge1xuXG4gICAgLyoqXG4gICAgICogQ29uc3RydWN0b3JcbiAgICAgKiBTaG91bGQgYmUgbmFtZWQgYXMgdGhlIGNsYXNzIGl0c2VsZlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIFN1YnNjcmliZSgpIHtcbiAgICAgICAgJCgnW2RhdGEtc3Vic2NyaWJlXScpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgICAgIHZhciBidXR0b25FbGVtZW50ID0gJChlLnRhcmdldCkuY2xvc2VzdCgnW2RhdGEtc3Vic2NyaWJlXScpO1xuICAgICAgICAgICAgdmFyIGJsb2dpZCA9IGJ1dHRvbkVsZW1lbnQuYXR0cignZGF0YS1zdWJzY3JpYmUnKTtcblxuICAgICAgICAgICAgdGhpcy50b2dnbGVTdWJzY3JpcHRpb24oYmxvZ2lkLCBidXR0b25FbGVtZW50KTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICBTdWJzY3JpYmUucHJvdG90eXBlLnRvZ2dsZVN1YnNjcmlwdGlvbiA9IGZ1bmN0aW9uIChibG9naWQsIGJ1dHRvbkVsZW1lbnQpIHtcbiAgICAgICAgdmFyICRhbGxCdXR0b25zID0gJCgnW2RhdGEtc3Vic2NyaWJlPVwiJyArIGJsb2dpZCArICdcIl0nKTtcblxuICAgICAgICB2YXIgcG9zdGRhdGEgPSB7XG4gICAgICAgICAgICBhY3Rpb246ICd0b2dnbGVfc3Vic2NyaXB0aW9uJyxcbiAgICAgICAgICAgIGJsb2dfaWQ6IGJsb2dpZFxuICAgICAgICB9O1xuXG4gICAgICAgICRhbGxCdXR0b25zLmh0bWwoJzxpIGNsYXNzPVwic3Bpbm5lclwiPjwvaT4nKTtcblxuICAgICAgICAkLnBvc3QoYWpheHVybCwgcG9zdGRhdGEsIGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgICAgIGlmIChyZXMgPT0gJ3N1YnNjcmliZWQnKSB7XG4gICAgICAgICAgICAgICAgJGFsbEJ1dHRvbnMuaHRtbCgnPGkgY2xhc3M9XCJwcmljb24gcHJpY29uLW1pbnVzLW9cIj48L2k+ICcgKyBtdW5pY2lwaW9JbnRyYW5ldC51bnN1YnNjcmliZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICRhbGxCdXR0b25zLmh0bWwoJzxpIGNsYXNzPVwicHJpY29uIHByaWNvbi1wbHVzLW9cIj48L2k+ICcgICsgbXVuaWNpcGlvSW50cmFuZXQuc3Vic2NyaWJlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHJldHVybiBuZXcgU3Vic2NyaWJlKCk7XG5cbn0pKGpRdWVyeSk7XG4iLCJJbnRyYW5ldCA9IEludHJhbmV0IHx8IHt9O1xuSW50cmFuZXQuVXNlciA9IEludHJhbmV0LlVzZXIgfHwge307XG5cbkludHJhbmV0LlVzZXIuV2VsY29tZVBocmFzZSA9IChmdW5jdGlvbiAoJCkge1xuXG4gICAgLyoqXG4gICAgICogQ29uc3RydWN0b3JcbiAgICAgKiBTaG91bGQgYmUgbmFtZWQgYXMgdGhlIGNsYXNzIGl0c2VsZlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIFdlbGNvbWVQaHJhc2UoKSB7XG4gICAgICAgICQoJ1tkYXRhLWFjdGlvbj1cInRvZ2dsZS13ZWxjb21lLXBocmFzZVwiXScpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB0aGlzLnRvZ2dsZVBocmFzZShlLnRhcmdldCk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgV2VsY29tZVBocmFzZS5wcm90b3R5cGUudG9nZ2xlUGhyYXNlID0gZnVuY3Rpb24gKGJ1dHRvbikge1xuICAgICAgICB2YXIgJGJ0biA9ICQoYnV0dG9uKS5jbG9zZXN0KCdbZGF0YS1hY3Rpb249XCJ0b2dnbGUtd2VsY29tZS1waHJhc2VcIl0nKTtcbiAgICAgICAgdmFyICRncmVldGluZyA9ICQoJy5ncmVldGluZycpO1xuXG4gICAgICAgICQoJ1tkYXRhLWRyb3Bkb3duPVwiLmdyZWV0aW5nLWRyb3Bkb3duXCJdJykudHJpZ2dlcignY2xpY2snKTtcblxuICAgICAgICAkZ3JlZXRpbmcuaHRtbCgnPGRpdiBjbGFzcz1cImxvYWRpbmdcIj48ZGl2PjwvZGl2PjxkaXY+PC9kaXY+PGRpdj48L2Rpdj48ZGl2PjwvZGl2PjwvZGl2PicpO1xuXG4gICAgICAgICQuZ2V0KGFqYXh1cmwsIHthY3Rpb246ICd0b2dnbGVfd2VsY29tZV9waHJhc2UnfSwgZnVuY3Rpb24gKHJlcykge1xuICAgICAgICAgICAgaWYgKHJlcy5kaXNhYmxlZCkge1xuICAgICAgICAgICAgICAgICRidG4udGV4dChtdW5pY2lwaW9JbnRyYW5ldC5lbmFibGVfd2VsY29tZV9waHJhc2UpO1xuICAgICAgICAgICAgICAgICQoJy5ncmVldGluZycpLmh0bWwoJzxzdHJvbmc+JyArIG11bmljaXBpb0ludHJhbmV0LnVzZXIuZnVsbF9uYW1lICsgJzwvc3Ryb25nPicpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAkYnRuLnRleHQobXVuaWNpcGlvSW50cmFuZXQuZGlzYWJsZV93ZWxjb21lX3BocmFzZSk7XG4gICAgICAgICAgICAgICAgJCgnLmdyZWV0aW5nJykuaHRtbChtdW5pY2lwaW9JbnRyYW5ldC51c2VyLmdyZWV0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgJ0pTT04nKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIG5ldyBXZWxjb21lUGhyYXNlKCk7XG5cbn0pKGpRdWVyeSk7XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
