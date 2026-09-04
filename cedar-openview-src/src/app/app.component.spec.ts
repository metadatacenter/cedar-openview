import {TestBed, waitForAsync} from '@angular/core/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {AppComponent} from './app.component';
import {SnotifyModule, SnotifyService, ToastDefaults} from 'ng-alt-snotify';
import {SpinnerComponent} from './modules/shared/components/spinner/spinner.component';
import {NavbarComponent} from './modules/shared/components/navbar/navbar.component';
import {FooterComponent} from './modules/shared/components/footer/footer.component';
import {MaterialModule} from './modules/material-module';
import {TranslateModule} from '@ngx-translate/core';
import {provideHttpClient, withInterceptorsFromDi, withXhr} from '@angular/common/http';
import {provideTranslateHttpLoader} from '@ngx-translate/http-loader';
import {AppConfigService} from './services/app-config.service';

describe('AppComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        SnotifyModule,
        MaterialModule,
        TranslateModule.forRoot()
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
        provideTranslateHttpLoader(),
        SnotifyService,
        {
          provide: 'SnotifyToastConfig',
          useValue: ToastDefaults
        }
      ]
    }).compileComponents();
  }));

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
