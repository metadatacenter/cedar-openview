import {Component, OnInit, ChangeDetectionStrategy, NgZone} from '@angular/core';
import {DataStoreService} from '../../../../services/data-store.service';
import {DataHandlerService} from '../../../../services/data-handler.service';
import {ActivatedRoute, Router} from '@angular/router';
import {CedarPageComponent} from '../../../shared/components/base/cedar-page-component.component';
import {DataHandlerDataId} from '../../../shared/model/data-handler-data-id.model';
import {TemplateField} from '../../../../shared/model/template-field.model';
import {DataHandlerDataStatus} from '../../../shared/model/data-handler-data-status.model';
import {globalAppConfig} from "../../../../../environments/global-app-config";
import {CeeConfigService} from '../../../../services/cee-config.service';

@Component({
  selector: 'app-template-field',
  templateUrl: './template-field.component.html',
  styleUrls: ['./template-field.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class TemplateFieldComponent extends CedarPageComponent implements OnInit {

  templateFieldId: string | null = null;
  template?: TemplateField;
  /** The HTTP status of a failed load, 0 when no answer arrived; null while nothing has failed. */
  artifactStatus: number | null = null;
  cedarLink?: string;
  /** Whether the field element refused the field, which it does when it cannot read it. */
  unreadable = false;
  private rendered = false;

  // The field element takes the part of the editor's configuration that describes a field. The page
  // states the field's title, so the element's own header is hidden and the element states the field's
  // type instead. An empty field is what a visitor sees here, so a required one is not reported as
  // missing a value.
  cfg = (({terminologyBaseUrl, bridgeBaseUrl, languageMapPathPrefix, defaultLanguage, fallbackLanguage}) => ({
    terminologyBaseUrl, bridgeBaseUrl, languageMapPathPrefix, defaultLanguage, fallbackLanguage,
    readOnlyMode: true,
    previewMode: true,
    showFieldType: true,
    suppressEmptyFieldErrors: true
  }))(this.ceeConfig.value);

  // The field element reports a field it cannot read through `error` and then never becomes ready.
  // That channel can also carry a problem that leaves the field standing, so a later `ready` undoes
  // the refusal. The callbacks arrive from the element's own zone.
  handler = {
    error: () => this.zone.run(() => (this.unreadable = !this.rendered)),
    ready: () => this.zone.run(() => {
      this.rendered = true;
      this.unreadable = false;
    })
  };

  constructor(
    router: Router,
    route: ActivatedRoute,
    dataStore: DataStoreService,
    dataHandler: DataHandlerService,
    private ceeConfig: CeeConfigService,
    private zone: NgZone
  ) {
    super(router, route, dataStore, dataHandler);
  }

  ngOnInit() {
    this.initDataHandler();
    this.unreadable = false;
    this.rendered = false;
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
