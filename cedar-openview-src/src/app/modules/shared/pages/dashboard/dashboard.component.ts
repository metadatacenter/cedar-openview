import {CedarPageComponent} from '../../components/base/cedar-page-component.component';
import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {DataStoreService} from '../../../../services/data-store.service';
import {DataHandlerService} from '../../../../services/data-handler.service';
import {globalAppConfig} from "../../../../../environments/global-app-config";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class DashboardComponent extends CedarPageComponent implements OnInit {

  constructor(
    router: Router,
    route: ActivatedRoute,
    dataStore: DataStoreService,
    dataHandler: DataHandlerService
  ) {
    super(router, route, dataStore, dataHandler);
  }

  ngOnInit() {
    window.location.href = globalAppConfig.cedarUrl;
  }

}
