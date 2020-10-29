<?php

/**
 * Constants example setup for the saml-sso plugin https://github.com/helsingborg-stad/saml-sso
 */

// NOTE Never place certificates below the root web folder!
$idpCertificateFile = '/etc/certs/idp-cert.cer';
$spCertificateFile = '/etc/certs/sp-cert.cer';
$spCertificateKeyFile = '/etc/certs/sp-cert.key';

define('SAML_SP_ENITITY_ID', 'https://www.example.com/saml/metadata');
define('SAML_SP_ACS_URL', 'https://www.example.com/saml/acs');
define('SAML_IDP_ENTITY_ID', 'https://www.example.com/adfs/services/trust');
define('SAML_IDP_SSO_URL', 'https://www.example.com/adfs/ls/');
define('SAML_IDP_SLS_URL', 'https://www.example.com/adfs/ls/');

if (file_exists($idpCertificateFile)) {
    define('SAML_IDP_CERTIFICATE', file_get_contents($idpCertificateFile));
}

if (file_exists($spCertificateFile)) {
    define('SAML_SP_CERTIFICATE', file_get_contents($spCertificateFile));
}

if (file_exists($spCertificateKeyFile)) {
    define('SAML_SP_CERTIFICATE_KEY', file_get_contents($spCertificateKeyFile));
}
