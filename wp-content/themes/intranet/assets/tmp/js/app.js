function facebookProfileSync(){Intranet.User.FacebookProfileSync.getDetails()}var Intranet;Intranet=Intranet||{},Intranet.Helper=Intranet.Helper||{},Intranet.Helper.MissingData=function(t){function e(){t('[data-guide-nav="next"], [data-guide-nav="prev"]').on("click",function(e){$form=t(e.target).parents("form"),$fields=t(e.target).parents("section").find(':input:not([name="active-section"])');var n=!0;return $fields.each(function(e,i){t(this)[0].checkValidity()||(n=!1)}),!!n||($form.find(":submit").trigger("click"),!1)})}return new e}(jQuery),Intranet=Intranet||{},Intranet.Helper=Intranet.Helper||{},Intranet.Helper.Walkthrough=function(t){function e(){t(".walkthrough [data-dropdown]").on("click",function(t){t.preventDefault(),this.highlightArea(t.target)}.bind(this)),t('[data-action="walkthrough-cancel"]').on("click",function(e){e.preventDefault(),t(e.target).closest('[data-action="walkthrough-cancel"]').parents(".walkthrough").find(".blipper").trigger("click")}.bind(this)),t('[data-action="walkthrough-next"]').on("click",function(e){e.preventDefault();var n=t(e.target).closest('[data-action="walkthrough-next"]').parents(".walkthrough");this.next(n)}.bind(this)),t('[data-action="walkthrough-previous"]').on("click",function(e){e.preventDefault();var n=t(e.target).closest('[data-action="walkthrough-previous"]').parents(".walkthrough");this.previous(n)}.bind(this)),t(window).on("resize load",function(){return t(".walkthrough:visible").length<2?void t('[data-action="walkthrough-previous"], [data-action="walkthrough-next"]').hide():void t('[data-action="walkthrough-previous"], [data-action="walkthrough-next"]').show()}),t(window).on("resize load",function(){t(".walkthrough .is-highlighted:not(:visible)").length&&t(".walkthrough .is-highlighted:not(:visible)").parent(".walkthrough").find(".blipper").trigger("click")})}var n=0;return e.prototype.highlightArea=function(e){var n=t(e).closest("[data-dropdown]"),i=n.parent(".walkthrough").attr("data-highlight"),o=t(i);return n.hasClass("is-highlighted")?(o.data("position")&&o.css("position",o.data("position")),o.prev(".backdrop").remove(),o.removeClass("walkthrough-highlight"),n.removeClass("is-highlighted"),!1):(o.before('<div class="backdrop"></div>'),"absolute"===o.css("position")&&"relative"===o.css("position")||o.data("position",o.css("position")).css("position","relative"),o.addClass("walkthrough-highlight"),n.addClass("is-highlighted"),!0)},e.prototype.next=function(e){n++;var i=e,o=t(".walkthrough:eq("+n+"):visible");0===o.length&&(o=t(".walkthrough:visible:first"),n=0),i.find(".blipper").trigger("click"),setTimeout(function(){o.find(".blipper").trigger("click"),this.scrollTo(o[0])}.bind(this),1)},e.prototype.previous=function(e){n--;var i=e,o=t(".walkthrough:eq("+n+"):visible");0===o.length&&(o=t(".walkthrough:visible").last(),n=o.index()),i.find(".blipper").trigger("click"),setTimeout(function(){o.find(".blipper").trigger("click"),this.scrollTo(o[0])}.bind(this),1)},e.prototype.scrollTo=function(e){if(t(e).is(":offscreen")){var n=t(e).offset().top;t("html, body").animate({scrollTop:n-100},300)}},new e}(jQuery),Intranet=Intranet||{},Intranet.Misc=Intranet.Misc||{},Intranet.Misc.Forums=function(t){function e(){t(function(){this.handleEvents()}.bind(this))}return e.prototype.handleEvents=function(){t("#edit-forum").submit(function(t){t.preventDefault(),this.updateForum(t)}.bind(this)),t(document).on("click","#delete-forum",function(t){t.preventDefault(),window.confirm(municipioIntranet.delete_confirm)&&this.deleteForum(t)}.bind(this)),t(document).on("click",".member-button",function(t){t.preventDefault(),this.joinForum(t)}.bind(this))},e.prototype.joinForum=function(e){$target=t(e.currentTarget),$target.toggleClass("member-button--is-member"),$target.hasClass("member-button--is-member")?(t(".pricon",$target).removeClass("pricon-plus-o").addClass("pricon-minus-o"),t(".member-button__text",$target).text(municipioIntranet.leave_forum)):(t(".pricon",$target).removeClass("pricon-minus-o").addClass("pricon-plus-o"),t(".member-button__text",$target).text(municipioIntranet.join_forum)),$target.blur(),t.ajax({url:ajaxurl,type:"post",data:{action:"join_forum",postId:$target.data("postId")},success:function(){window.location.reload()}})},e.prototype.deleteForum=function(e){var n=t(e.currentTarget).data("post-id"),i=t(e.currentTarget).data("archive");t.ajax({method:"DELETE",url:municipioIntranet.wpapi.url+"wp/v2/forums/"+n,beforeSend:function(t){t.setRequestHeader("X-WP-Nonce",municipioIntranet.wpapi.nonce)},success:function(t){window.location.replace(i)}})},e.prototype.updateForum=function(e){function n(){t(".spinner,.warning",i).remove(),t(".modal-footer",i).prepend('<span class="notice warning gutter gutter-margin gutter-vertical"><i class="pricon pricon-notice-warning"></i> '+municipioIntranet.something_went_wrong+"</span>")}var i=t(e.target),o=new FormData(e.target),r=document.forms.editforum.post_id.value;return o.append("status","private"),t.ajax({method:"POST",url:municipioIntranet.wpapi.url+"wp/v2/forums/"+r,data:o,processData:!1,contentType:!1,beforeSend:function(e){e.setRequestHeader("X-WP-Nonce",municipioIntranet.wpapi.nonce),t('button[type="submit"]',i).append(' <i class="spinner"></i>')},success:function(t){"undefined"!=typeof t.link?window.location.replace(t.link):n()},error:function(t){console.log(t),n()}}),!1},new e}(jQuery),Intranet=Intranet||{},Intranet.Misc=Intranet.Misc||{},Intranet.Misc.News=function(t){function e(){this.container=t(".modularity-mod-intranet-news .intranet-news"),this.button=t('.modularity-mod-intranet-news [data-action="intranet-news-load-more"]'),this.category=t('.modularity-mod-intranet-news select[name="cat"]'),this.button.prop("disabled",!1),this.button.on("click",function(t){this.loadMore(this.container,this.button)}.bind(this)),this.category.on("change",function(t){this.container.empty(),this.loadMore(this.container,this.button)}.bind(this))}return e.prototype.showLoader=function(t){t.hide(),t.after('<div class="loading"><div></div><div></div><div></div><div></div></div>')},e.prototype.hideLoader=function(t){t.parent().find(".loading").remove(),t.show()},e.prototype.loadMore=function(e,n){var i=e.attr("data-infinite-scroll-callback"),o=e.attr("data-infinite-scroll-pagesize"),r=e.attr("data-infinite-scroll-sites"),a=e.find("a.box-news").length?e.find("a.box-news").length:0,s=e.attr("data-module"),l=this.category.val(),c=e.attr("data-args"),u=null;this.showLoader(n),u=!isNaN(parseFloat(l))&&isFinite(l)?i+o+"/"+a+"/"+r+"/"+l:i+o+"/"+a+"/"+r+"/0",t.ajax({url:u,method:"POST",data:{module:s,args:c},dataType:"JSON",beforeSend:function(t){t.setRequestHeader("X-WP-Nonce",municipioIntranet.wpapi.nonce)}}).done(function(t){return 0===t.length?void this.noMore(e,n):(this.output(e,t),this.hideLoader(n),void(t.length<o&&this.noMore(e,n)))}.bind(this))},e.prototype.noMore=function(t,e){this.hideLoader(e),e.text(municipioIntranet.no_more_news).prop("disabled",!0)},e.prototype.output=function(e,n){t.each(n,function(t,n){e.append(n.markup)})},new e}(jQuery),Intranet=Intranet||{},Intranet.Misc=Intranet.Misc||{},Intranet.Misc.ReportPost=function(t){function e(){t(".report-post").on("submit",function(e){e.preventDefault();var n=t(this),i=new FormData(this);return i.append("action","report_post"),""!==i.get("g-recaptcha-response")&&(n.find('input[type="submit"]').hide(),n.find(".modal-footer").append('<div class="loading"><div></div><div></div><div></div><div></div></div>'),t.ajax({url:ajaxurl,type:"POST",data:i,dataType:"json",processData:!1,contentType:!1,success:function(e,i,o){e.success?t(".modal-footer",n).html('<span class="notice success"><i class="pricon pricon-check"></i> '+e.data+"</span>"):t(".modal-footer",n).html('<span class="notice warning"><i class="pricon pricon-notice-warning"></i> '+e.data+"</span>")},complete:function(){setTimeout(function(){location.hash=""},3e3)}}),!1)})}return new e}(jQuery),Intranet=Intranet||{},Intranet.Search=Intranet.Search||{},Intranet.Search.General=function(t){function e(){t('.search form input[name="level"]').on("change",function(e){t(e.target).parents("form").submit()}),t(".navbar .search").each(function(t,e){this.autocomplete(e)}.bind(this))}var n;e.prototype.autocomplete=function(e){var i=t(e),o=i.find('input[type="search"]');o.on("keydown",function(t){switch(t.which){case 40:return this.autocompleteKeyboardNavNext(e),!1;case 38:return this.autocompleteKeyboardNavPrev(e),!1;case 13:return this.autocompleteSubmit(e)}return clearTimeout(n),o.val().length<3?void i.find(".search-autocomplete").remove():void(n=setTimeout(function(){this.autocompleteQuery(e)}.bind(this),300))}.bind(this)),t(document).on("click",function(e){t(e.target).closest(".search-autocomplete").length||t(".search-autocomplete").remove()}),o.on("focus",function(t){o.val().length<3||this.autocompleteQuery(e)}.bind(this))},e.prototype.autocompleteSubmit=function(e){var n=t(e),i=n.find(".search-autocomplete"),o=i.find(".selected");if(!o.length)return!0;var r=o.find("a").attr("href");return location.href=r,!1},e.prototype.autocompleteKeyboardNavNext=function(e){var n=t(e),i=n.find(".search-autocomplete"),o=i.find(".selected"),r=null;if(r=o.length?o.next("li:not(.title):first"):i.find("li:not(.title):first"),!r.length){var a=o.parents("ul").next("ul");a.length&&(r=a.find("li:not(.title):first"))}o.removeClass("selected"),r.addClass("selected")},e.prototype.autocompleteKeyboardNavPrev=function(e){var n=t(e),i=n.find(".search-autocomplete"),o=i.find(".selected"),r=null;if(r=o.length?o.prev("li:not(.title)"):i.find("li:not(.title):last"),!r.length){var a=o.parents("ul").prev("ul");a.length&&(r=a.find("li:not(.title):last"))}o.removeClass("selected"),r.addClass("selected")},e.prototype.autocompleteQuery=function(e){var n=t(e),i=n.find('input[type="search"]'),o=i.val();({action:"search_autocomplete",s:i.val(),level:"ajax"});n.find('button[type="submit"]').addClass("searching"),t.ajax({url:municipioIntranet.wpapi.url+"intranet/1.0/s/"+o,method:"GET",dataType:"JSON",beforeSend:function(t){t.setRequestHeader("X-WP-Nonce",municipioIntranet.wpapi.nonce)}}).done(function(t){n.find(".search-autocomplete").remove(),this.outputAutocomplete(e,t),n.find('button[type="submit"]').removeClass("searching")}.bind(this))},e.prototype.outputAutocomplete=function(e,n){var i=t(e),o=t('<div class="search-autocomplete"></div>'),r=t('<ul class="search-autocomplete-users"><li class="title"><i class="pricon pricon-user-o"></i> '+municipioIntranet.searchAutocomplete.persons+"</li></ul>"),a=t('<ul class="search-autocomplete-content"><li class="title"><i class="pricon pricon-file-text"></i> '+municipioIntranet.searchAutocomplete.content+"</li></ul>");"undefined"!=typeof n.users&&null!==n.users&&n.users.length>0?t.each(n.users,function(t,e){return e.profile_image?void r.append('<li><a href="'+e.profile_url+'"><img src="'+e.profile_image+'" class="search-autocomplete-image"> '+e.name+"</a></li>"):void r.append('<li><a href="'+e.profile_url+'">'+e.name+"</a></li>")}):r=t(""),"undefined"!=typeof n.content&&null!==n.content&&n.content.length>0?t.each(n.content,function(t,e){e.is_file?a.append('<li><a class="link-item-before" href="'+e.permalink+'" target="_blank">'+e.post_title+"</a></li>"):a.append('<li><a href="'+e.permalink+'">'+e.post_title+"</a></li>")}):a=t(""),(null!==n.content&&0!==n.content.length||null!==n.users&&0!==n.users.length)&&(a.appendTo(o),r.appendTo(o),o.append('<button type="submit" class="read-more block-level">'+municipioIntranet.searchAutocomplete.viewAll+"</a>"),o.appendTo(i).show())}}(jQuery),Intranet=Intranet||{},Intranet.Search=Intranet.Search||{},Intranet.Search.Sites=function(t){function e(){i=t('form.network-search button[type="submit"]').html(),t('form.network-search input[type="search"]').on("input",function(e){clearTimeout(n),$searchInput=t(e.target).closest('input[type="search"]');var o=$searchInput.val();return o.length<2?(t('form.network-search button[type="submit"]').html(i),t(".network-search-results-items").remove(),void t(".network-search-results .my-networks").show()):(t('form.network-search button[type="submit"]').html('<i class="loading-dots loading-dots-highight"></i>'),void(n=setTimeout(function(){this.search(o)}.bind(this),1e3)))}.bind(this)),t("form.network-search").on("submit",function(e){e.preventDefault(),clearTimeout(n),t('form.network-search button[type="submit"]').html('<i class="loading-dots loading-dots-highight"></i>'),$searchInput=t(e.target).find('input[type="search"]');var i=$searchInput.val();this.search(i,!0)}.bind(this))}var n=!1,i=!1;return e.prototype.search=function(e,n){"undefined"==typeof n&&(n=!1);var o={action:"search_sites",s:e};t.post(ajaxurl,o,function(o){0!==o.length&&(t.each(o,function(t,i){return this.emptyResults(),n&&e.toLowerCase()==i.name.toLowerCase()||i.short_name.length&&e.toLowerCase()==i.short_name.toLowerCase()?void(window.location=i.path):void this.addResult(i.domain,i.path,i.name,i.short_name)}.bind(this)),i&&t('form.network-search button[type="submit"]').html(i))}.bind(this),"JSON")},e.prototype.addResult=function(e,n,i,o){return t(".network-search-results .my-networks").hide(),0===t(".network-search-results-items").length&&t(".network-search-results").append('<ul class="network-search-results-items"></ul>'),o?void t(".network-search-results-items").append('<li class="network-title"><a href="//'+e+n+'">'+o+" <em>"+i+"</em></a></li>"):void t(".network-search-results-items").append('<li class="network-title"><a href="//'+e+n+'">'+i+"</a></li>")},e.prototype.emptyResults=function(){t(".network-search-results-items").empty()},new e}(jQuery),Intranet=Intranet||{},Intranet.Search=Intranet.Search||{},Intranet.Search.User=function(t){function e(){0!=jQuery("#user-lazy-load").length&&(t('input[type="search"], #algolia-search-box input').each(function(e,n){if(t(n).val())return this.searchInit(t(n).val()),!1}.bind(this)),t(window).on("load",function(){t('input[type="search"], #algolia-search-box input').on("input",function(e){clearTimeout(l),$searchInput=t(e.target);var n=$searchInput.val();l=setTimeout(function(){this.searchInit(n)}.bind(this),1e3)}.bind(this))}.bind(this)))}var n=".js-user-loader",i=".js-user-loader-text",o=".js-user-search-results",r=".js-user-number-not-found",a=".js-user-number-found",s=".js-user-show-all-results",l=0;return e.prototype.searchInit=function(t){this.showElement(jQuery(i)),this.showElement(jQuery(n)),this.hideElement(jQuery(r)),this.hideElement(jQuery(s)),this.hideElement(jQuery(o)),this.hideElement(jQuery(a)),this.fetchUsers(t)},e.prototype.showElement=function(t){t.removeClass("hidden")},e.prototype.hideElement=function(t){t.addClass("hidden")},e.prototype.disableButton=function(t){t.attr("disabled","disabled")},e.prototype.fetchUsers=function(e){var l={action:"search_users",query:e};t.post(ajaxurl,l,function(e){if(this.hideElement(jQuery(n)),this.hideElement(jQuery(i)),"undefined"!=typeof e.items){t(o).html("");var l=wp.template("user-item");e.items.forEach(function(e){t(o).append(l(e.data))}.bind(this)),this.showElement(jQuery(o));var c=wp.template("user-nbr-matches");t(a).html(c({count:e.nbrofitems})),e.items.length!=e.nbrofitems&&this.showElement(jQuery(s)),this.showElement(jQuery(a))}else this.hideElement(jQuery(s)),this.showElement(jQuery(r))}.bind(this))},new e}(jQuery),Intranet=Intranet||{},Intranet.User=Intranet.User||{},Intranet.User.FacebookProfileSync=function(t){function e(){}return e.prototype.getDetails=function(){t(".fb-login-container .fb-login-button").hide(),t(".fb-login-container").append('<div class="loading loading-red"><div></div><div></div><div></div><div></div></div>'),FB.api("/me",{fields:"birthday, location"},function(t){this.saveDetails(t)}.bind(this))},e.prototype.saveDetails=function(e){var n={action:"sync_facebook_profile",details:e};t.post(ajaxurl,n,function(e){return"1"!==e?(t(".fb-login-container .loading").remove(),t(".fb-login-container").append('<div class="notice warning">Facebook details did not sync due to an error</div>'),!1):(t(".fb-login-container .loading").remove(),t(".fb-login-container").append('<div class="notice success">Facebook details synced to your profile</div>'),!0)})},new e}(jQuery),Intranet=Intranet||{},Intranet.User=Intranet.User||{},Intranet.User.Links=function(t){function e(){t("[data-user-link-edit]").on("click",function(t){this.toggleEdit(t.target)}.bind(this)),t("[data-user-link-add]").on("submit",function(e){e.preventDefault(),$element=t(e.target).closest("form").parents(".box");var n=t(e.target).closest("form").find('[name="user-link-title"]').val(),i=t(e.target).closest("form").find('[name="user-link-url"]').val();this.addLink(n,i,$element)}.bind(this)),t(document).on("click","[data-user-link-remove]",function(e){e.preventDefault();var n=t(e.target).closest("button"),i=n.parents(".box"),o=t(e.target).closest("button").attr("data-user-link-remove");this.removeLink(i,o,n)}.bind(this))}return e.prototype.toggleEdit=function(e){return $target=t(e).closest("[data-user-link-edit]"),$box=$target.parents(".box"),$box.hasClass("is-editing")?($box.removeClass("is-editing"),void $target.html(municipioIntranet.edit).removeClass("pricon-check").addClass("pricon-edit")):($box.addClass("is-editing"),void $target.html(municipioIntranet.done).addClass("pricon-check").removeClass("pricon-edit"))},e.prototype.addLink=function(e,n,i){if(!e.length||!n.length)return!1;var o={action:"add_user_link",title:e,url:n},r=t(i).find('button[type="submit"]').html();t(i).find('button[type="submit"]').html('<i class="spinner spinner-dark"></i>'),t.post(ajaxurl,o,function(e){"object"==typeof e&&(i.find("ul.links").empty(),t.each(e,function(e,n){this.addLinkToDom(i,n),t(i).find('input[type="text"]').val("")}.bind(this)),t(i).find('button[type="submit"]').html(r))}.bind(this),"JSON")},e.prototype.addLinkToDom=function(t,e){var n=t.find("ul.links");0===n.length&&(t.find(".box-content").html('<ul class="links"></ul>'),n=t.find("ul.links")),n.append('            <li>                <a class="link-item link-item-light" href="'+e.url+'">'+e.title+'</a>                <button class="btn btn-icon btn-sm text-lg pull-right only-if-editing" data-user-link-remove="'+e.url+'">&times;</button>            </li>        ')},e.prototype.removeLink=function(e,n,i){var o={action:"remove_user_link",url:n};i.html('<i class="spinner spinner-dark"></i>'),t.post(ajaxurl,o,function(n){"object"==typeof n&&(0===n.length&&(e.find("ul.links").remove(),e.find(".box-content").text(municipioIntranet.user_links_is_empty)),e.find("ul.links").empty(),t.each(n,function(t,n){this.addLinkToDom(e,n)}.bind(this)))}.bind(this),"JSON")},new e}(jQuery),Intranet=Intranet||{},Intranet.User=Intranet.User||{},va=function(t){function e(){var e=(new Date).getTime();if(municipioIntranet.is_user_logged_in)return void HelsingborgPrime.Helper.Cookie.set(n,e,30);if(0===HelsingborgPrime.Helper.Cookie.get(n).length)return HelsingborgPrime.Helper.Cookie.set(n,e,30),void this.showReminder();var i=HelsingborgPrime.Helper.Cookie.get(n);i=(new Date).setTime(i);var o=Math.round((e-i)/864e5);return o>6?(this.showReminder(),void HelsingborgPrime.Helper.Cookie.set(n,e,30)):void t("#modal-login-reminder").remove()}var n="login_reminder";return e.prototype.showReminder=function(){t("#modal-login-reminder").addClass("modal-open"),t("body").addClass("overflow-hidden")},new e}(jQuery),Intranet=Intranet||{},Intranet.User=Intranet.User||{},Intranet.User.Profile=function(t){function e(){t('#author-form input[type="submit"]').click(function(e){var n=this.locateAccordion();null!=n?(e.preventDefault(),t("#author-form .form-errors").removeClass("hidden"),t(".accordion-error",n).removeClass("hidden"),location.href="#form-errors"):(t("#author-form .form-errors").addClass("hidden"),t(".accordion-error",n).addClass("hidden"))}.bind(this))}return e.prototype.locateAccordion=function(){var e=null;return t("#author-form section.accordion-section").each(function(n,i){t(".form-notice",i).length&&(e=i)}),e},new e}(jQuery),Intranet=Intranet||{},Intranet.User=Intranet.User||{},Intranet.User.Subscribe=function(t){function e(){t("[data-subscribe]").on("click",function(e){e.preventDefault();var n=t(e.target).closest("[data-subscribe]"),i=n.attr("data-subscribe");this.toggleSubscription(i,n)}.bind(this))}return e.prototype.toggleSubscription=function(e,n){var i=t('[data-subscribe="'+e+'"]'),o={action:"toggle_subscription",blog_id:e};i.html('<i class="spinner"></i>'),t.post(ajaxurl,o,function(t){"subscribed"==t?i.html('<i class="pricon pricon-minus-o"></i> '+municipioIntranet.unsubscribe):i.html('<i class="pricon pricon-plus-o"></i> '+municipioIntranet.subscribe)})},new e}(jQuery),Intranet=Intranet||{},Intranet.User=Intranet.User||{},Intranet.User.WelcomePhrase=function(t){function e(){t('[data-action="toggle-welcome-phrase"]').on("click",function(t){t.preventDefault(),this.togglePhrase(t.target)}.bind(this))}return e.prototype.togglePhrase=function(e){var n=t(e).closest('[data-action="toggle-welcome-phrase"]'),i=t(".greeting");t('[data-dropdown=".greeting-dropdown"]').trigger("click"),i.html('<div class="loading"><div></div><div></div><div></div><div></div></div>'),t.get(ajaxurl,{action:"toggle_welcome_phrase"},function(e){e.disabled?(n.text(municipioIntranet.enable_welcome_phrase),t(".greeting").html("<strong>"+municipioIntranet.user.full_name+"</strong>")):(n.text(municipioIntranet.disable_welcome_phrase),t(".greeting").html(municipioIntranet.user.greet))},"JSON")},new e}(jQuery);