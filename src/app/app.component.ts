import {Component} from '@angular/core';
import {environment} from '../environments/environment';
import {LangChangeEvent, TranslateService} from '@ngx-translate/core';
import {Title} from '@angular/platform-browser';
import {LocalSettingsService} from './services/local-settings.service';
import {
  faSquare,
  faTag,
  faBars,
  faUnlock
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {

  showMenu = false;
  faTag = faTag;
  faSquare = faSquare;
  faBars = faBars;
  faUnlock = faUnlock;


  languages = {
    selected: 'en',
    options: [{ value: 'en', viewValue: 'en' }, { value: 'hu', viewValue: 'hu' }]
  };

  constructor(
    private localSettings: LocalSettingsService,
    private translateService: TranslateService,
    titleService: Title
  ) {
    // this language will be used as a fallback when a translation isn't found in the current language
    translateService.setDefaultLang(environment.fallbackLanguage);

    // the lang to use, if the lang isn't available, it will use the current loader to get them
    let currentLanguage = localSettings.getLanguage();
    if (currentLanguage == null) {
      currentLanguage = environment.defaultLanguage;
    }
    translateService.use(currentLanguage);

    translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      translateService.get('App.WindowTitle').subscribe((res: string) => {
        titleService.setTitle(res);
      });
    });
  }

  toggleMenu() {
    this.showMenu = !this.showMenu;
  }

  getCurrentLanguageCode() {
    return this.translateService.currentLang;
  }

  switchLanguage($event, language: string) {
    $event.preventDefault();
    this.translateService.use(language);
    this.localSettings.setLanguage(language);
  }

  setLanguage(language: string) {
    this.translateService.use(language);
    this.localSettings.setLanguage(language);
  }
}
