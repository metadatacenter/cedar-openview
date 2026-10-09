import {Injectable} from '@angular/core';
import {TranslateLoader, TranslationObject} from '@ngx-translate/core';
import {Observable, of, throwError} from 'rxjs';
import en from './en.json';
import hu from './hu.json';

// The translations are compiled into the application bundle. A translation file served at a fixed
// address can outlive the build that uses it: browsers that had cached the copy from before the
// folder page existed went on showing that page's keys instead of their text. The bundle's name
// changes with its content, so the strings always arrive with the templates that use them.
const TRANSLATIONS: ReadonlyMap<string, TranslationObject> = new Map([
  ['en', en],
  ['hu', hu],
]);

@Injectable()
export class BundledTranslateLoader extends TranslateLoader {

  getTranslation(lang: string): Observable<TranslationObject> {
    const translations = TRANSLATIONS.get(lang);
    return translations ? of(translations) : throwError(() => new Error(`OpenView has no ${lang} translations`));
  }
}
