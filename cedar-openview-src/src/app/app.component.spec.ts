import {TestBed} from '@angular/core/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {AppComponent} from './app.component';
import {SpinnerComponent} from './modules/shared/components/spinner/spinner.component';
import {NavbarComponent} from './modules/shared/components/navbar/navbar.component';
import {FooterComponent} from './modules/shared/components/footer/footer.component';
import {MaterialModule} from './modules/material-module';
import {provideTranslateLoader, provideTranslateService, TranslatePipe, TranslateService} from '@ngx-translate/core';
import {provideHttpClient, withInterceptorsFromDi, withXhr} from '@angular/common/http';
import {BundledTranslateLoader} from './i18n/bundled-translate-loader';
import {AppConfigService} from './services/app-config.service';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        MaterialModule,
        TranslatePipe
      ],
      declarations: [
        AppComponent,
        SpinnerComponent,
        NavbarComponent,
        FooterComponent
      ],
      providers: [
        provideHttpClient(withXhr(), withInterceptorsFromDi()),
        provideTranslateService({loader: provideTranslateLoader(BundledTranslateLoader)}),
        AppConfigService
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  // A screen reader reads the page in the language the document states.
  it('states the interface language on the document, and follows it when it changes', () => {
    document.documentElement.lang = '';
    TestBed.createComponent(AppComponent);
    const translate = TestBed.inject(TranslateService);
    expect(document.documentElement.lang).toBe('en');
    translate.use('hu');
    expect(document.documentElement.lang).toBe('hu');
    translate.use('en');
    expect(document.documentElement.lang).toBe('en');
  });

});
