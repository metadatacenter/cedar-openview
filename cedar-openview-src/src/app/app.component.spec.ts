import {TestBed} from '@angular/core/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {AppComponent} from './app.component';
import {SnotifyModule, SnotifyService, ToastDefaults} from 'ng-alt-snotify';
import {SpinnerComponent} from './modules/shared/components/spinner/spinner.component';
import {NavbarComponent} from './modules/shared/components/navbar/navbar.component';
import {FooterComponent} from './modules/shared/components/footer/footer.component';
import {MaterialModule} from './modules/material-module';
import {provideTranslateLoader, TranslateModule} from '@ngx-translate/core';
import {provideHttpClient, withInterceptorsFromDi, withXhr} from '@angular/common/http';
import {BundledTranslateLoader} from './i18n/bundled-translate-loader';
import {AppConfigService} from './services/app-config.service';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        SnotifyModule,
        MaterialModule,
        TranslateModule.forRoot({loader: provideTranslateLoader(BundledTranslateLoader)})
      ],
      declarations: [
        AppComponent,
        SpinnerComponent,
        NavbarComponent,
        FooterComponent
      ],
      providers: [
        provideHttpClient(withXhr(), withInterceptorsFromDi()),
        AppConfigService,
        SnotifyService,
        {
          provide: 'SnotifyToastConfig',
          useValue: ToastDefaults
        }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    // The shell has to render: ng-alt-snotify's own component subscribes in
    // ngOnInit and unsubscribes unguarded in ngOnDestroy, so a fixture that is
    // never rendered throws when the TestBed tears it down.
    fixture.detectChanges();
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

});
