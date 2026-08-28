import {CeeConfig, resolveCedarDomain} from './cee-config.service';

describe('resolveCedarDomain', () => {
  it('resolves CEE service URLs against the deployment domain without mutating the loaded config', () => {
    const config: CeeConfig = {
      showTemplateDescription: false,
      showDownloadMenu: true,
      terminologyBaseUrl: 'https://terminology.{{cedarDomain}}/',
      languageMapPathPrefix: '/assets/i18n-cee/',
      defaultLanguage: 'en',
      fallbackLanguage: 'en',
      bridgeBaseUrl: 'https://bridge.{{cedarDomain}}/',
      readOnlyMode: true
    };

    const resolved = resolveCedarDomain(config, 'example.org');

    expect(resolved.terminologyBaseUrl).toBe('https://terminology.example.org/');
    expect(resolved.bridgeBaseUrl).toBe('https://bridge.example.org/');
    expect(config.terminologyBaseUrl).toBe('https://terminology.{{cedarDomain}}/');
    expect(config.bridgeBaseUrl).toBe('https://bridge.{{cedarDomain}}/');
  });
});
