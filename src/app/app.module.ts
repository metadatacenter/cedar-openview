import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HttpClient, HttpClientModule} from "@angular/common/http";
import {TranslateLoader, TranslateModule} from "@ngx-translate/core";
import {SnotifyModule, SnotifyService, ToastDefaults} from "ng-snotify";
import {SharedModule} from "./modules/shared";
import {ResourcesModule} from "./modules/resources/resources.module";
import {TranslateHttpLoader} from "@ngx-translate/http-loader";

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    SnotifyModule,
    SharedModule,
    ResourcesModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
  ],
  providers: [
    SnotifyService,
    {provide: 'SnotifyToastConfig', useValue: ToastDefaults},
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
