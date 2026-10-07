import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import ceeConfig from '../config/cee-config.json';

export interface CeeConfig {
  showTemplateDescription: boolean;
  showDownloadMenu: boolean;
  terminologyBaseUrl: string;
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

// The configuration is compiled into the application bundle, whose name changes with its content, so
// no browser can pair a cached copy of it with a different build.
@Injectable({ providedIn: 'root' })
export class CeeConfigService {
  readonly value: CeeConfig = resolveCedarDomain(ceeConfig, environment.cedarDomain);
}
