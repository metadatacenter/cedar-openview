import {Component} from '@angular/core';
import {DataStoreService} from "../../../../services/data-store.service";
import {DataHandlerService} from "../../../../services/data-handler.service";
import {ActivatedRoute, Router} from "@angular/router";
import {CedarPageComponent} from "../../../shared/components/base/cedar-page-component.component";
import {TranslateService} from "@ngx-translate/core";
import {SnotifyService} from "ng-snotify";
import {LocalSettingsService} from "../../../../services/local-settings.service";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent extends CedarPageComponent {

  constructor(
    protected localSettings: LocalSettingsService,
    public translateService: TranslateService,
    public notify: SnotifyService,
    protected router: Router,
    protected route: ActivatedRoute,
    protected dataStore: DataStoreService,
    protected dataHandler: DataHandlerService
  ) {
    super(localSettings, translateService, notify, router, route, dataStore, dataHandler);
  }

  ngOnInit() {
    this.initDataHandler();
  }

}
