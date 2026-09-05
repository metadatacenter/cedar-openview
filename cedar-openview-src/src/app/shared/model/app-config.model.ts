import {environment} from '../../../environments/environment';

export class AppConfig {
  apiUrl: string = '';
  cedarUrl: string = '';
  terminologyUrl: string = '';
  loaded: boolean = false;

  init(appConfig: AppConfig) {
    const domain = environment.cedarDomain;
    this.apiUrl = appConfig.apiUrl.replace('{{cedarDomain}}', domain);
    this.cedarUrl = appConfig.cedarUrl.replace('{{cedarDomain}}', domain);
    this.terminologyUrl = appConfig.terminologyUrl.replace('{{cedarDomain}}', domain);
    this.loaded = true;
  }
}
