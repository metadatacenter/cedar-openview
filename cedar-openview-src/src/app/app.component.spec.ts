import {TestBed} from '@angular/core/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {AppComponent} from './app.component';
import {SpinnerComponent} from './modules/shared/components/spinner/spinner.component';
import {NavbarComponent} from './modules/shared/components/navbar/navbar.component';
import {FooterComponent} from './modules/shared/components/footer/footer.component';
import {MaterialModule} from './modules/material-module';
import {provideTranslateLoader, provideTranslateService, TranslatePipe} from '@ngx-translate/core';
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

});
