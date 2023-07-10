export class AppConfig {
  apiUrl: string = '';
  cedarUrl: string = '';
  terminologyUrl: string = '';
  loaded: boolean = false;

  init(appConfig: AppConfig) {
    const domain = (window as any).cedarDomain;
    this.apiUrl = appConfig.apiUrl.replace('{{cedarDomain}}', domain);
    this.cedarUrl = appConfig.cedarUrl.replace('{{cedarDomain}}', domain);
    this.terminologyUrl = appConfig.terminologyUrl.replace('{{cedarDomain}}', domain);
    this.loaded = true;
  }
}
