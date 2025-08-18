import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface CeeConfig {
  showTemplateRenderingRepresentation: boolean;
  showAllMultiInstanceValues: boolean;
  showDataQualityReport: boolean;
  showHeader: boolean;
  showFooter: boolean;
  showTemplateDescription: boolean;
  terminologyIntegratedSearchUrl: string;
  expandedInstanceDataFull: boolean;
  showInstanceDataCore: boolean;
  expandedInstanceDataCore: boolean;
  showMultiInstanceInfo: boolean;
  expandedMultiInstanceInfo: boolean;
  expandedDataQualityReport: boolean;
  languageMapPathPrefix: string;
  defaultLanguage: string;
  fallbackLanguage: string;
  iriPrefix: string;
  bioPortalPrefix: string;
  orcidPrefix: string;
  rorPrefix: string;
  extAuthBaseUrl: string;
  orcidIntegratedExtAuthUrl: string;
  orcidIntegratedDetailsUrl: string;
  rorIntegratedExtAuthUrl: string;
  rorIntegratedDetailsUrl: string;
  pfasIntegratedExtAuthUrl: string;
  pfasIntegratedDetailsUrl: string;
  collapseStaticComponents: boolean;
  showStaticText: boolean;
  readOnlyMode: boolean;
  hideEmptyFields: boolean;
  showTemplateSourceData: boolean;
  showInstanceDataFull: boolean;
  showPreferencesMenu: boolean
}

@Injectable({ providedIn: 'root' })
export class CeeConfigService {
  private _config!: CeeConfig;
  get value(): CeeConfig { return this._config; }

  constructor(private http: HttpClient) {}

  load(): Promise<void> {
    return this.http.get<CeeConfig>('assets/config/cee-config.json')
      .toPromise()
      .then(cfg => { this._config = cfg!; })
      .catch(err => {
        console.error('Failed to load cee-config.json', err);
        this._config = {} as any; // fallback to empty if you want
      });
  }
}
