import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {DataStoreService} from '../../../../services/data-store.service';
import {DataHandlerService} from '../../../../services/data-handler.service';
import {ActivatedRoute, Router} from '@angular/router';
import {CedarPageComponent} from '../../../shared/components/base/cedar-page-component.component';
import {DataHandlerDataId} from '../../../shared/model/data-handler-data-id.model';
import {TemplateField} from '../../../../shared/model/template-field.model';
import {DataHandlerDataStatus} from '../../../shared/model/data-handler-data-status.model';
import {globalAppConfig} from "../../../../../environments/global-app-config";

@Component({
  selector: 'app-template-field',
  templateUrl: './template-field.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class TemplateFieldComponent extends CedarPageComponent implements OnInit {

  templateFieldId: string | null = null;
  template?: TemplateField;
  artifactStatus: number = 0;
  cedarLink?: string;


  constructor(
    router: Router,
    route: ActivatedRoute,
    dataStore: DataStoreService,
    dataHandler: DataHandlerService
  ) {
    super(router, route, dataStore, dataHandler);
  }

  ngOnInit() {
    this.initDataHandler();

    this.templateFieldId = this.route.snapshot.paramMap.get('templateFieldId');
    this.cedarLink = globalAppConfig.cedarUrl + 'fields/edit/' + this.templateFieldId;
    this.dataHandler
      .requireId(DataHandlerDataId.TEMPLATE_FIELD, this.templateFieldId ?? '')
      .load(() => this.dataLoadedCallback(), (error: any, dataStatus: DataHandlerDataStatus) => this.dataErrorCallback(error, dataStatus));
  }

  private dataLoadedCallback() {
    this.template = this.dataStore.getTemplateField(this.templateFieldId ?? '');
  }

  private dataErrorCallback(error: any, dataStatus: DataHandlerDataStatus) {
    this.artifactStatus = error.status;
  }
}
