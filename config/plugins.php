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
 * Algolia search settings
 */
 define('ALGOLIA_FRONTEND_INDEXES', array(
    array('intranat_portalensearchable_posts', 100, 'Portalen'),
    array('intranat_slf_searchable_posts', 100, 'SLF'),
    array('intranat_sff_searchable_posts', 100, 'SFF'),
    array('intranat_kf_searchable_posts', 100, 'KF'),
    array('intranat_sbf_searchable_posts', 100, 'SBF'),
    array('intranat_vof_searchable_posts', 100, 'VOF'),
    array('intranat_sof_searchable_posts', 100, 'SOF'),
    array('intranat_amf_searchable_posts', 100, 'AMF'),
    array('intranat_fort_searchable_posts', 100, 'Förtroendevald'),
    array('intranat_ff_searchable_posts', 100, 'Fastighetsförvaltningen'),
    array('intranat_hr_searchable_posts', 100, 'HR'),
    array('intranat_service_searchable_posts', 100, 'Service'),
    array('intranat_inkop_searchable_posts', 100, 'Inköp'),
    array('intranat_bib_searchable_posts', 100, 'Bibliotek'),
 ));
 define('ALGOLIA_FRONTEND_RESULTS', 800);
