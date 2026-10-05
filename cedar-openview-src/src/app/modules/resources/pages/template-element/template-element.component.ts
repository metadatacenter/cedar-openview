import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {DataStoreService} from '../../../../services/data-store.service';
import {DataHandlerService} from '../../../../services/data-handler.service';
import {ActivatedRoute, Router} from '@angular/router';
import {CedarPageComponent} from '../../../shared/components/base/cedar-page-component.component';
import {DataHandlerDataId} from '../../../shared/model/data-handler-data-id.model';
import {TemplateElement} from '../../../../shared/model/template-element.model';
import {DataHandlerDataStatus} from '../../../shared/model/data-handler-data-status.model';
import {globalAppConfig} from "../../../../../environments/global-app-config";

@Component({
  selector: 'app-template-element',
  templateUrl: './template-element.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class TemplateElementComponent extends CedarPageComponent implements OnInit {

  templateElementId: string | null = null;
  template?: TemplateElement;
  /** The HTTP status of a failed load, 0 when no answer arrived; null while nothing has failed. */
  artifactStatus: number | null = null;
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

    this.templateElementId = this.route.snapshot.paramMap.get('templateElementId');
    this.cedarLink = globalAppConfig.cedarUrl + 'elements/edit/' + this.templateElementId;
    this.dataHandler
      .requireId(DataHandlerDataId.TEMPLATE_ELEMENT, this.templateElementId ?? '')
      .load(() => this.dataLoadedCallback(), (error: any, dataStatus: DataHandlerDataStatus) => this.dataErrorCallback(error, dataStatus));
  }

  private dataLoadedCallback() {
    this.template = this.dataStore.getTemplateElement(this.templateElementId ?? '');
  }

  private dataErrorCallback(error: any, dataStatus: DataHandlerDataStatus) {
    this.artifactStatus = error.status;
  }
}
