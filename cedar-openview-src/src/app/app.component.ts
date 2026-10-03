import {Component, ChangeDetectionStrategy} from '@angular/core';
import {environment} from '../environments/environment';
import {LangChangeEvent, TranslateService} from '@ngx-translate/core';
import {Title} from '@angular/platform-browser';
import {LocalSettingsService} from './services/local-settings.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class AppComponent {

  constructor(
    localSettings: LocalSettingsService,
    translateService: TranslateService,
    titleService: Title
  ) {
    // this language will be used as a fallback when a translation isn't found in the current language
    translateService.setDefaultLang(environment.fallbackLanguage);

    // the lang to use, if the lang isn't available, it will use the current loader to get them
    translateService.use(localSettings.getLanguage());

    translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      translateService.get('App.WindowTitle').subscribe((res: string) => {
        titleService.setTitle(res);
      });
    });
  }
}
