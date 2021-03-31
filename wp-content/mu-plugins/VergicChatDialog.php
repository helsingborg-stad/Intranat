<?php

/*
Plugin Name: Vergic Chat Dialog
Description: Enqueues script required to run Chat Module from Vergic
Version:     1.0
Author:      Nikolas Ramstedt
*/

namespace VergicChatDialog;

class App
{
    public function __construct()
    {
        add_action('wp_footer', array($this, 'enqueueSam'), 50);
    }

    public function enqueueSam()
    {
        if (strtotime('06-04-2021 06:30 +1') > time()) {
            return;
        }

        $enableOnTheseMultiSites = array(1, 2, 3, 5, 8, 9, 11, 12, 13, 15);
        if (!is_user_logged_in() || !in_array(get_current_blog_id(), $enableOnTheseMultiSites)) {
            return;
        }
        echo "<script>
            (function(server,psID){
                var s=document.createElement('script');
                s.type='text/javascript';
                s.src=server+'/'+psID+'/ps.js';
                document.getElementsByTagName('head')[0].appendChild(s);
            }('https://account.psplugin.com', '853C35D6-B468-44A4-8F10-B7B3A18DEFFD'));
        </script>";
    }
}

new \VergicChatDialog\App();
