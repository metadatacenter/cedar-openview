import {BrowserModule} from '@angular/platform-browser';
import {APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {provideHttpClient, withInterceptorsFromDi, withXhr} from '@angular/common/http';
import {TranslateModule} from '@ngx-translate/core';
import {SnotifyModule, SnotifyService, ToastDefaults} from 'ng-alt-snotify';
import {SharedModule} from './modules/shared';
import {ResourcesModule} from './modules/resources/resources.module';
import {provideTranslateHttpLoader} from '@ngx-translate/http-loader';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MaterialModule} from './modules/material-module';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {ReactiveFormsModule} from '@angular/forms';
import {AppConfigService} from './services/app-config.service';
import {AutocompleteUrlService} from './services/autocomplete-url.service';
import {CeeConfigService} from './services/cee-config.service';


const appInitializerFn = (appConfig: AppConfigService) => {
  return () => {
    return appConfig.loadAppConfig();
  };
};

export function loadCeeConfig(cfg: CeeConfigService) {
  return () => cfg.load();
}

@NgModule({
  declarations: [
    AppComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    AppRoutingModule,
    NgbModule,
    SnotifyModule,
    SharedModule,
    ResourcesModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    MaterialModule,
    FontAwesomeModule,
    TranslateModule.forRoot(),
  ],
  providers: [
    provideHttpClient(withXhr(), withInterceptorsFromDi()),
    provideTranslateHttpLoader(),
    SnotifyService,
    {
      provide: 'SnotifyToastConfig',
      useValue: ToastDefaults
    },
    AppConfigService,
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializerFn,
      multi: true,
      deps: [AppConfigService]
    },
    AutocompleteUrlService,
    { provide: APP_INITIALIZER, useFactory: loadCeeConfig, deps: [CeeConfigService], multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
