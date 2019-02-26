<?php 
    add_action('init', function() {
        add_filter('brokenLinks/External/ExceptedDomains',function($array) {
            return array(
                parse_url("http://agresso/agresso/", PHP_URL_HOST),
                parse_url("http://qlikviewserver/qlikview/index.htm", PHP_URL_HOST),
                parse_url("http://serviceportalen/", PHP_URL_HOST),
                parse_url("http://a002163:81/login/login.asp", PHP_URL_HOST),
                parse_url("http://serviceportalen/Default.aspx", PHP_URL_HOST),
                parse_url("http://cmg/BluStarWeb/Start", PHP_URL_HOST),
                parse_url("http://surveyreport/admin", PHP_URL_HOST),
                parse_url("http://klarspraket/", PHP_URL_HOST),
                parse_url("http://guideochtips/", PHP_URL_HOST),
                parse_url("http://hbgquiz/index.php/category/?id=3", PHP_URL_HOST),
                parse_url("http://agresso/agresso/", PHP_URL_HOST),
                parse_url("http://a002490/efact/", PHP_URL_HOST),
                parse_url("http://a002064/Kurser/", PHP_URL_HOST),
                parse_url("http://a002064/kursbokning/", PHP_URL_HOST)
            ); 
        }, 10);
    });