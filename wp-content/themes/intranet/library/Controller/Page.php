<?php

namespace Intranet\Controller;

class Page extends \Municipio\Controller\BaseController
{
    public function init()
    {
        $this->data['contentGridSize'] = 'grid-md-8 grid-lg-6';
    }
}
