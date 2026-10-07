import {TemplateElement} from '../../../shared/model/template-element.model';

/**
 * The element's contents as a transient template, which is what the CEDAR Embeddable Editor renders.
 *
 * The editor draws a template and its children but not an element on its own, so the element's
 * schema is given a template's type. It also gets an identifier of its own, because the transient
 * template is not the stored element and must not claim the element's. The stored element is left
 * untouched.
 */
export function elementAsTemplate(element: TemplateElement): object {
  return {
    ...element,
    '@id': 'urn:cedar:openview:element',
    '@type': 'https://schema.metadatacenter.org/core/Template',
  };
}
