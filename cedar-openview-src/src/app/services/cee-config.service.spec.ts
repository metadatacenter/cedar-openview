import {CeeConfig, CeeConfigService, resolveCedarDomain} from './cee-config.service';
import {environment} from '../../environments/environment';

describe('resolveCedarDomain', () => {
  it('resolves CEE service URLs against the deployment domain without mutating the loaded config', () => {
    const config: CeeConfig = {
      showTemplateDescription: false,
      showDownloadMenu: true,
      terminologyBaseUrl: 'https://terminology.{{cedarDomain}}/',
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

describe('CeeConfigService', () => {
  it("gives the editor service URLs on the build's own domain", () => {
    const {value} = new CeeConfigService();

    expect(value.terminologyBaseUrl).toBe(`https://terminology.${environment.cedarDomain}/`);
    expect(value.bridgeBaseUrl).toBe(`https://bridge.${environment.cedarDomain}/`);
  });
});
