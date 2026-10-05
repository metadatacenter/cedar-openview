import {Component, OnInit, ChangeDetectionStrategy, ElementRef, ViewChild} from '@angular/core';
import {DataStoreService} from '../../../../services/data-store.service';
import {DataHandlerService} from '../../../../services/data-handler.service';
import {ActivatedRoute, Router} from '@angular/router';
import {CedarPageComponent} from '../../../shared/components/base/cedar-page-component.component';
import {DataHandlerDataId} from '../../../shared/model/data-handler-data-id.model';
import {TemplateInstance} from '../../../../shared/model/template-instance.model';
import {DataHandlerDataStatus} from '../../../shared/model/data-handler-data-status.model';
import {TemplateService} from '../../../../services/template.service';
import {globalAppConfig} from "../../../../../environments/global-app-config";
import {CeeConfigService} from '../../../../services/cee-config.service';
import {whenCeeRefuses} from '../../../shared/util/cee-refusal';

@Component({
  selector: 'app-template-instance',
  templateUrl: './template-instance.component.html',
  styleUrls: ['./template-instance.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class TemplateInstanceComponent extends CedarPageComponent implements OnInit {

  templateInstanceId: string | null = null;
  instance?: TemplateInstance;
  /** The HTTP status of a failed load, 0 when no answer arrived; null while nothing has failed. */
  artifactStatus: number | null = null;
  templateStatus: number | null = null;
  cedarLink?: string;
  /** Whether the editor refused the artifact, which it does when it cannot read it. */
  unreadable = false;

  @ViewChild('editor') set editor(editor: ElementRef<HTMLElement> | undefined) {
    if (editor) whenCeeRefuses(editor.nativeElement, () => (this.unreadable = true));
  }

  template: any = null;
  templateId: string | null = null;
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
    this.unreadable = false;

    this.templateInstanceId = this.route.snapshot.paramMap.get('templateInstanceId');
    this.cedarLink = globalAppConfig.cedarUrl + 'instances/edit/' + this.templateInstanceId;
    this.dataHandler
      .requireId(DataHandlerDataId.TEMPLATE_INSTANCE, this.templateInstanceId ?? '')
      .load(() => this.instanceLoadedCallback(this.templateInstanceId ?? ''),
        (error: any, dataStatus: DataHandlerDataStatus) => this.instanceErrorCallback(error, dataStatus));
  }

  private instanceLoadedCallback(instanceId: string) {
    this.instance = this.dataStore.getTemplateInstance(this.templateInstanceId ?? '');
    this.templateId = TemplateService.isBasedOn(this.instance);

    // load the template it is based on
    this.dataHandler
      .requireId(DataHandlerDataId.TEMPLATE, this.templateId ?? '')
      .load(() => this.templateLoadedCallback(this.templateId ?? ''), (error: any, dataStatus: DataHandlerDataStatus) => this.templateErrorCallback(error, dataStatus));
  }

  private templateLoadedCallback(templateId: string) {
    this.template = this.dataStore.getTemplate(templateId);

    // if this is a default instance, save the template info
    if (!TemplateService.isBasedOn(this.instance)) {
      const schema = TemplateService.schemaOf(this.template);
      TemplateService.setBasedOn(this.instance, TemplateService.getId(schema));
      TemplateService.setName(this.instance, TemplateService.getName(schema));
      TemplateService.setHelp(this.instance, TemplateService.getHelp(schema));
    }
  }

  private instanceErrorCallback(error: any, dataStatus: DataHandlerDataStatus) {
    this.artifactStatus = error.status;
  }

  private templateErrorCallback(error: any, dataStatus: DataHandlerDataStatus) {
    this.templateStatus = error.status;
  }
}
