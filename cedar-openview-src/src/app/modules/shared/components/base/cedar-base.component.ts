import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {SnotifyService} from 'ng-alt-snotify';
import {ActivatedRoute, NavigationExtras, Router, UrlTree} from '@angular/router';
import {LocalSettingsService} from '../../../../services/local-settings.service';
import {DataStoreService} from '../../../../services/data-store.service';
import {DataHandlerService} from '../../../../services/data-handler.service';

@Component({
  template: '',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export abstract class CedarBase implements OnInit {

  protected localSettings: LocalSettingsService;
  protected translateService: TranslateService;
  protected notify: SnotifyService;
  protected router: Router;
  protected route: ActivatedRoute;
  protected dataStore: DataStoreService;
  protected dataHandler: DataHandlerService;

  protected constructor(
    localSettings: LocalSettingsService,
    translateService: TranslateService,
    notify: SnotifyService,
    router: Router,
    route: ActivatedRoute,
    dataStore: DataStoreService,
    dataHandler: DataHandlerService
  ) {
    this.localSettings = localSettings;
    this.translateService = translateService;
    this.notify = notify;
    this.router = router;
    this.route = route;
    this.dataStore = dataStore;
    this.dataHandler = dataHandler;
  }

  abstract ngOnInit(): void;

  protected navigateByUrlThen(url: string | UrlTree, extras?: NavigationExtras): Promise<boolean> {
    //console.log('NavigateByUrlThen:' + url);
    return this.router.navigateByUrl(url, extras);
  }

}
