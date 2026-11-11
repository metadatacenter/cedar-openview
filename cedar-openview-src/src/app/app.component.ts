import {Component, ChangeDetectionStrategy, DOCUMENT, Signal, inject} from '@angular/core';
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

  activePage: {contentReady?: Signal<boolean>} | null = null;
  private readonly document = inject(DOCUMENT);

  constructor(
    localSettings: LocalSettingsService,
    translateService: TranslateService,
    titleService: Title
  ) {
    // Subscribe before choosing a language. The translations are in the bundle, so use() switches
    // language before it returns, and a later subscription would miss the change.
    translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      // The page states the interface's language, so a screen reader reads it in that language.
      this.document.documentElement.lang = event.lang;
      translateService.get('App.WindowTitle').subscribe((res: string) => {
        titleService.setTitle(res);
      });
    });

    // this language will be used as a fallback when a translation isn't found in the current language
    translateService.setFallbackLang(environment.fallbackLanguage);

    // the lang to use, if the lang isn't available, it will use the current loader to get them
    translateService.use(localSettings.getLanguage());
  }
}
