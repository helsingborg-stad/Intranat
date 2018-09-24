<?php

/**
 * Define ip-series that should be considered as local ip addresses (within the municipial network
 * Format: IP/CIDR netmask eg. 127.0.0.0/24
 */
define('LOCAL_IP_SERIES', array(
    '10.0.0.0/8',
    '172.16.0.0/12',
    '192.168.0.0/16'
));

/**
 * Check if a given ip is in a network
 * @param  string $ip    IP to check in IPV4 format eg. 127.0.0.1
 * @return boolean true  If IP exist in LOCAL_IP_SERIES or not.
 */
if (!function_exists('is_local_ip')) {
    function is_local_ip($ip = null)
    {
        if (!$ip) {
            $ip = $_SERVER['REMOTE_ADDR'];
        }

        //Behind some sort of proxy, look for a remote host (not set internally in networks)
        if($ip == "127.0.0.1" && !isset($_SERVER['REMOTE_HOST'])) {
            return true;
        }

        //Check if ip-range is undefined. Return state: in network.
        if (!defined('LOCAL_IP_SERIES') || empty(LOCAL_IP_SERIES)) {
            return true;
        }

        //Check if in ip-range
        foreach (LOCAL_IP_SERIES as $range) {
            list($range, $netmask) = explode('/', $range, 2);

            $rangeDecimal = ip2long($range);
            $ipDecimal = ip2long($ip);
            $wildcardDecimal = pow(2, (32 - $netmask)) - 1;
            $netmaskDecimal = ~ $wildcardDecimal;

            $inRange = ($ipDecimal & $netmaskDecimal) == ($rangeDecimal & $netmaskDecimal);

            if ($inRange) {
                return true;
            }
        }

        return false;
    }
}
