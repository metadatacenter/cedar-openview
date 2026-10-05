import {environment} from '../../../environments/environment';
import {useDeploymentDomain} from '../../resource-address';

export class AppConfig {
  apiUrl: string = '';
  cedarUrl: string = '';

  init(appConfig: AppConfig) {
    const domain = environment.cedarDomain;
    this.apiUrl = appConfig.apiUrl.replace('{{cedarDomain}}', domain);
    this.cedarUrl = appConfig.cedarUrl.replace('{{cedarDomain}}', domain);
    // Identities are minted on repo.<domain>, and only those are addressed in the compact form.
    useDeploymentDomain(domain);
  }
}
