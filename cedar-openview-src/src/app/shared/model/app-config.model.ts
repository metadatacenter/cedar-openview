import {environment} from '../../../environments/environment';

export class AppConfig {
  apiUrl: string = '';
  cedarUrl: string = '';

  init(appConfig: AppConfig) {
    const domain = environment.cedarDomain;
    this.apiUrl = appConfig.apiUrl.replace('{{cedarDomain}}', domain);
    this.cedarUrl = appConfig.cedarUrl.replace('{{cedarDomain}}', domain);
  }
}
