import {AppConfigService} from './app-config.service';
import {globalAppConfig} from "../../environments/global-app-config";


export class AutocompleteUrlService {

  private configService: AppConfigService | null = null;
  private terminologyService: string = '';
  private controlledService: string = '';

  init(configService: AppConfigService) {
    this.configService = configService;
    this.terminologyService = globalAppConfig.terminologyUrl;
    this.controlledService = globalAppConfig.terminologyUrl + 'bioportal';
  }

  paging(page: number, size: number, defaultPage: number, defaultSize: number, pageString?: string, sizeString?: string): string {
    const p = page > 0 ? page : defaultPage;
    const s = size > 0 ? size : defaultSize;
    return pageString + '=' + p + '&' + sizeString + '=' + s;
  }

  terminology() {
    return this.terminologyService;
  }

  controlledTerm() {
    return this.controlledService;
  }

  getValuesInValueSet(vsCollection: string, vsId: string, page: number, size: number): string {
    return this.controlledTerm() + '/vs-collections/' + vsCollection + '/value-sets/' + encodeURIComponent(vsId)
      + '/values?' + this.paging(page, size, 1, 50, 'page', 'pageSize');
  }

  autocompleteOntology(query: string, acronym: string, page: number, size: number): string {
    let url: string = this.controlledTerm();
    if (query === '*') {
      url += '/ontologies/' + acronym + '/classes?' + this.paging(page, size, 1, 500, 'page', 'page_size');
    } else {
      url += '/search?q=' + encodeURIComponent(query) +
        '&scope=classes&sources=' + acronym + '&suggest=true&' + this.paging(page, size, 1, 500, 'page', 'page_size');
    }
    return url;
  }

  autocompleteOntologySubtree(query: string, acronym: string, subtree_root_id: string, max_depth: number, page: number, size: number) {
    let url = this.controlledTerm();

    if (query === '*') {
      url += '/ontologies/' + acronym + '/classes/' + encodeURIComponent(subtree_root_id)
        + '/descendants?' + this.paging(page, size, 1, 500, 'page', 'page_size');
    } else {
      url += '/search?q=' + encodeURIComponent(query) + '&scope=classes' + '&source=' + acronym +
        '&subtree_root_id=' + encodeURIComponent(subtree_root_id) + '&max_depth=' + max_depth +
        '&suggest=true&' + this.paging(page, size, 1, 500, 'page', 'page_size');
    }

    return url;
  }

}
