<?php

/**
 * Turn of admin panel for ACF.
 */
 define('ACF_LITE', false);

/**
 * Share search notices across the network
 */
 define('SEARCH_NOTICES_NETWORK', true);

/**
 * Set a priority to load algolia search at
 * @var bool
 */
define('ALGOLIA_INIT_PRIORITY', 5);

//Algilia index js mod
define('ALGOLIA_INDEX_MOUNT_POINT', 'loop_start');