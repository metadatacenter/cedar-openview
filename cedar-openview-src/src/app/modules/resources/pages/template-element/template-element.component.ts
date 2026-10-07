import {Component, OnInit, ChangeDetectionStrategy, ElementRef, ViewChild} from '@angular/core';
import {DataStoreService} from '../../../../services/data-store.service';
import {DataHandlerService} from '../../../../services/data-handler.service';
import {ActivatedRoute, Router} from '@angular/router';
import {CedarPageComponent} from '../../../shared/components/base/cedar-page-component.component';
import {DataHandlerDataId} from '../../../shared/model/data-handler-data-id.model';
import {TemplateElement} from '../../../../shared/model/template-element.model';
import {DataHandlerDataStatus} from '../../../shared/model/data-handler-data-status.model';
import {globalAppConfig} from "../../../../../environments/global-app-config";
import {CeeConfigService} from '../../../../services/cee-config.service';
import {whenCeeRefuses} from '../../../shared/util/cee-refusal';
import {elementAsTemplate} from '../../../shared/util/element-as-template';

@Component({
  selector: 'app-template-element',
  templateUrl: './template-element.component.html',
  styleUrls: ['./template-element.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class TemplateElementComponent extends CedarPageComponent implements OnInit {

  templateElementId: string | null = null;
  template?: TemplateElement;
  /** The element as the transient template the editor renders. */
  form?: object;
  /** The HTTP status of a failed load, 0 when no answer arrived; null while nothing has failed. */
  artifactStatus: number | null = null;
  cedarLink?: string;
  /** Whether the editor refused the element, which it does when it cannot read it. */
  unreadable = false;

  @ViewChild('editor') set editor(editor: ElementRef<HTMLElement> | undefined) {
    if (editor) whenCeeRefuses(editor.nativeElement, () => (this.unreadable = true));
  }

  // The page states the element's title, since the editor's header would call it a template. A
  // download would describe the transient template rather than the stored element.
  cfg = {...this.ceeConfig.value, previewMode: true, showDownloadMenu: false};

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
    this.templateElementId = this.route.snapshot.paramMap.get('templateElementId');
    this.cedarLink = globalAppConfig.cedarUrl + 'elements/edit/' + this.templateElementId;
    this.dataHandler
      .requireId(DataHandlerDataId.TEMPLATE_ELEMENT, this.templateElementId ?? '')
      .load(() => this.dataLoadedCallback(), (error: any, dataStatus: DataHandlerDataStatus) => this.dataErrorCallback(error, dataStatus));
  }

  private dataLoadedCallback() {
    this.template = this.dataStore.getTemplateElement(this.templateElementId ?? '');
    this.form = this.template && elementAsTemplate(this.template);
  }

  private dataErrorCallback(error: any, dataStatus: DataHandlerDataStatus) {
    this.artifactStatus = error.status;
  }
}
