jQuery(document).ready(function ($) {

    /**
     * TAG MANAGER
     */
    $('[data-action="tag-manager-add-tag"]').on('click', function (e) {
        e.preventDefault();

        var tag = $('[data-tag-input]').val();
        var unit = $('[data-tag-unit-input]').val();
        var unit_name = $('[data-tag-unit-input] option[value="' + unit + '"]').text();
        if (tag.length === 0) {
            return;
        }

        $('.tag-manager-tags').append('\
            <div class="tag-manager-tag">\
                ' + tag + ' (' + unit_name + ')\
                <input type="hidden" name="tag-manager-tags[]" value="' + tag + '|' + unit + '">\
                <div class="tag-manager-actions">\
                    <button class="btn-plain tag-manager-delete-tag"><span class="dashicons dashicons-trash"></span></button>\
                </div>\
            </div>\
        ');

        $('[data-tag-input]').val('');
    });

    $(document).on('click', '.tag-manager-delete-tag', function (e) {
        e.preventDefault();
        $(this).parents('.tag-manager-tag').remove();
    });

    $(window).keydown(function (event) {
        if ($('[data-tag-input]').length === 0) {
            return;
        }

        if (event.keyCode == 13) {
            event.preventDefault();
            return false;
        }
    });

    $('[data-tag-input]').keyup(function (e) {
        if (e.keyCode == 13)
        {
            e.preventDefault();
            $('[data-action="tag-manager-add-tag"]').trigger('click');
            return false;
        }
    });

    /**
     * USER SYNC
     */
    $('[data-action="users-sync-with-network"]').on('click', function () {
        var $parent = $(this).parent();
        var blogid = $(this).attr('data-blogid');
        $parent.find('.spinner').css('visibility', 'visible');

        $.post(ajaxurl, {action: 'sync_network_users', blog_id: blogid}, function (res) {
            $parent.find('.spinner').css('visibility', 'hidden');

            if (res.success === 'cron') {
                alert('A cronjob has been scheduled to run immediately');
                return;
            }

            if (res.success === true) {
                alert('Users synced with network');
                return;
            }

            alert('Woops, there was an error with the syncing process. Contact the developer(s).');
        });
    });

});



//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFkbWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImFkbWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsialF1ZXJ5KGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbiAoJCkge1xuXG4gICAgLyoqXG4gICAgICogVEFHIE1BTkFHRVJcbiAgICAgKi9cbiAgICAkKCdbZGF0YS1hY3Rpb249XCJ0YWctbWFuYWdlci1hZGQtdGFnXCJdJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIHZhciB0YWcgPSAkKCdbZGF0YS10YWctaW5wdXRdJykudmFsKCk7XG4gICAgICAgIHZhciB1bml0ID0gJCgnW2RhdGEtdGFnLXVuaXQtaW5wdXRdJykudmFsKCk7XG4gICAgICAgIHZhciB1bml0X25hbWUgPSAkKCdbZGF0YS10YWctdW5pdC1pbnB1dF0gb3B0aW9uW3ZhbHVlPVwiJyArIHVuaXQgKyAnXCJdJykudGV4dCgpO1xuICAgICAgICBpZiAodGFnLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgJCgnLnRhZy1tYW5hZ2VyLXRhZ3MnKS5hcHBlbmQoJ1xcXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwidGFnLW1hbmFnZXItdGFnXCI+XFxcbiAgICAgICAgICAgICAgICAnICsgdGFnICsgJyAoJyArIHVuaXRfbmFtZSArICcpXFxcbiAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cImhpZGRlblwiIG5hbWU9XCJ0YWctbWFuYWdlci10YWdzW11cIiB2YWx1ZT1cIicgKyB0YWcgKyAnfCcgKyB1bml0ICsgJ1wiPlxcXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInRhZy1tYW5hZ2VyLWFjdGlvbnNcIj5cXFxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiYnRuLXBsYWluIHRhZy1tYW5hZ2VyLWRlbGV0ZS10YWdcIj48c3BhbiBjbGFzcz1cImRhc2hpY29ucyBkYXNoaWNvbnMtdHJhc2hcIj48L3NwYW4+PC9idXR0b24+XFxcbiAgICAgICAgICAgICAgICA8L2Rpdj5cXFxuICAgICAgICAgICAgPC9kaXY+XFxcbiAgICAgICAgJyk7XG5cbiAgICAgICAgJCgnW2RhdGEtdGFnLWlucHV0XScpLnZhbCgnJyk7XG4gICAgfSk7XG5cbiAgICAkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLnRhZy1tYW5hZ2VyLWRlbGV0ZS10YWcnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICQodGhpcykucGFyZW50cygnLnRhZy1tYW5hZ2VyLXRhZycpLnJlbW92ZSgpO1xuICAgIH0pO1xuXG4gICAgJCh3aW5kb3cpLmtleWRvd24oZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIGlmICgkKCdbZGF0YS10YWctaW5wdXRdJykubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZXZlbnQua2V5Q29kZSA9PSAxMykge1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgJCgnW2RhdGEtdGFnLWlucHV0XScpLmtleXVwKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGlmIChlLmtleUNvZGUgPT0gMTMpXG4gICAgICAgIHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICQoJ1tkYXRhLWFjdGlvbj1cInRhZy1tYW5hZ2VyLWFkZC10YWdcIl0nKS50cmlnZ2VyKCdjbGljaycpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBVU0VSIFNZTkNcbiAgICAgKi9cbiAgICAkKCdbZGF0YS1hY3Rpb249XCJ1c2Vycy1zeW5jLXdpdGgtbmV0d29ya1wiXScpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyICRwYXJlbnQgPSAkKHRoaXMpLnBhcmVudCgpO1xuICAgICAgICB2YXIgYmxvZ2lkID0gJCh0aGlzKS5hdHRyKCdkYXRhLWJsb2dpZCcpO1xuICAgICAgICAkcGFyZW50LmZpbmQoJy5zcGlubmVyJykuY3NzKCd2aXNpYmlsaXR5JywgJ3Zpc2libGUnKTtcblxuICAgICAgICAkLnBvc3QoYWpheHVybCwge2FjdGlvbjogJ3N5bmNfbmV0d29ya191c2VycycsIGJsb2dfaWQ6IGJsb2dpZH0sIGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgICAgICRwYXJlbnQuZmluZCgnLnNwaW5uZXInKS5jc3MoJ3Zpc2liaWxpdHknLCAnaGlkZGVuJyk7XG5cbiAgICAgICAgICAgIGlmIChyZXMuc3VjY2VzcyA9PT0gJ2Nyb24nKSB7XG4gICAgICAgICAgICAgICAgYWxlcnQoJ0EgY3JvbmpvYiBoYXMgYmVlbiBzY2hlZHVsZWQgdG8gcnVuIGltbWVkaWF0ZWx5Jyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAocmVzLnN1Y2Nlc3MgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBhbGVydCgnVXNlcnMgc3luY2VkIHdpdGggbmV0d29yaycpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYWxlcnQoJ1dvb3BzLCB0aGVyZSB3YXMgYW4gZXJyb3Igd2l0aCB0aGUgc3luY2luZyBwcm9jZXNzLiBDb250YWN0IHRoZSBkZXZlbG9wZXIocykuJyk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG59KTtcblxuXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
