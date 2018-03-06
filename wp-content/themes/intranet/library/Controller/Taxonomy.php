<?php

namespace Municipio\Controller;

class Taxonomy extends \Municipio\Controller\BaseController
{
    public function init()
    {
        $this->data['postType'] = 'post';
        $this->data['template'] = 'collapsed';
        $this->data['g_recaptcha_key'] = defined('G_RECAPTCHA_KEY') ? G_RECAPTCHA_KEY : '';
    }
}
