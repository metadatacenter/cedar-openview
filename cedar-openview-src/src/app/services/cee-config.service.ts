import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface CeeConfig {
  showTemplateDescription: boolean;
  showDownloadMenu: boolean;
  terminologyBaseUrl: string;
  languageMapPathPrefix: string;
  defaultLanguage: string;
  fallbackLanguage: string;
  bridgeBaseUrl: string;
  readOnlyMode: boolean;
}

const CEDAR_DOMAIN_PLACEHOLDER = '{{cedarDomain}}';

export function resolveCedarDomain(config: CeeConfig, domain: string): CeeConfig {
  return {
    ...config,
    terminologyBaseUrl: config.terminologyBaseUrl.replace(CEDAR_DOMAIN_PLACEHOLDER, domain),
    bridgeBaseUrl: config.bridgeBaseUrl.replace(CEDAR_DOMAIN_PLACEHOLDER, domain)
  };
}

@Injectable({ providedIn: 'root' })
export class CeeConfigService {
  private _config!: CeeConfig;
  get value(): CeeConfig { return this._config; }

  constructor(private http: HttpClient) {}

  load(): Promise<void> {
    return this.http.get<CeeConfig>('assets/config/cee-config.json')
      .toPromise()
      .then(cfg => {
        this._config = resolveCedarDomain(cfg!, (window as any).cedarDomain);
      })
      .catch(err => {
        console.error('Failed to load cee-config.json', err);
        this._config = {} as any;
      });
  }
}
