<?php
namespace Drupal\biopama_page_assessments\Controller;

use Drupal\Core\Controller\ControllerBase;

/**
 * Provides route responses for the biopama_page_assessments module.
 */
class PageAssessmentsController extends ControllerBase {
  public function content() {
    $element = array(
	  '#theme' => 'page_assessments_page',
	  '#test_var' => $this->t('Test Value'),
    );
    return $element;
  }
}