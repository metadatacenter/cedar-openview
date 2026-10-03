import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {DataStoreService} from '../../../../services/data-store.service';
import {DataHandlerService} from '../../../../services/data-handler.service';
import {ActivatedRoute, Router} from '@angular/router';
import {CedarPageComponent} from '../../../shared/components/base/cedar-page-component.component';
import {DataHandlerDataId} from '../../../shared/model/data-handler-data-id.model';
import {Template} from '../../../../shared/model/template.model';
import {DataHandlerDataStatus} from '../../../shared/model/data-handler-data-status.model';
import {globalAppConfig} from "../../../../../environments/global-app-config";
import {CeeConfigService} from '../../../../services/cee-config.service';

@Component({
  selector: 'app-template',
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class TemplateComponent extends CedarPageComponent implements OnInit {

  templateId: string | null = null;
  template?: Template;
  artifactStatus: number = 0;
  cedarLink?: string;

  cfg = this.ceeConfig.value;

  constructor(
    router: Router,
    route: ActivatedRoute,
    dataStore: DataStoreService,
    dataHandler: DataHandlerService,
    private ceeConfig: CeeConfigService
  ) {
    super(router, route, dataStore, dataHandler);
  }

  ngOnInit() {
    this.initDataHandler();
    this.templateId = this.route.snapshot.paramMap.get('templateId');
    this.cedarLink = globalAppConfig.cedarUrl + 'templates/edit/' + this.templateId;
    this.dataHandler
      .requireId(DataHandlerDataId.TEMPLATE, this.templateId ?? '')
      .load(() => this.dataLoadedCallback(), (error: any, dataStatus: DataHandlerDataStatus) => this.dataErrorCallback(error, dataStatus));
  }

  private dataLoadedCallback() {
    this.template = this.dataStore.getTemplate(this.templateId ?? '');
  }

  private dataErrorCallback(error: any, dataStatus: DataHandlerDataStatus) {
    this.artifactStatus = error.status;
  }
}


