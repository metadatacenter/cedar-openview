import { CeeLoader } from '../../../../services/cee-loader.service';
import {inject, Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, DestroyRef, NgZone} from '@angular/core';
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
  private readonly ceeLoader = inject(CeeLoader);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

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
  cfg = (({terminologyBaseUrl, bridgeBaseUrl, defaultLanguage, fallbackLanguage}) => ({
    terminologyBaseUrl, bridgeBaseUrl, defaultLanguage, fallbackLanguage,
    readOnlyMode: true,
    previewMode: true,
    showFieldType: true,
    suppressEmptyFieldErrors: true
  }))(this.ceeConfig.value);

  // The field element reports a field it cannot read through `error` and then never becomes ready.
  // That channel can also carry a problem that leaves the field standing, so a later `ready` undoes
  // the refusal. The callbacks arrive from the element's own zone.
  handler = {
    error: () => this.afterFieldRender(() => {
      this.unreadable = !this.rendered;
      this.contentRendered();
    }),
    ready: () => this.afterFieldRender(() => {
      this.rendered = true;
      this.contentRendered();
      this.unreadable = false;
    })
  };

  private afterFieldRender(update: () => void) {
    // A defined custom element can refuse its input during this view's own render.
    // Notify Angular afterwards so that render cannot clear the new dirty state.
    queueMicrotask(() => {
      if (this.destroyRef.destroyed) return;
      this.zone.run(() => {
        update();
        this.changeDetector.markForCheck();
      });
    });
  }

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

  private async dataLoadedCallback() {
    try { await this.ceeLoader.load(); } catch { this.unreadable = true; this.contentRendered(); return; }
    this.template = this.dataStore.getTemplateField(this.templateFieldId ?? '');
  }

  private dataErrorCallback(error: any, dataStatus: DataHandlerDataStatus) {
    this.artifactStatus = error.status;
    this.contentRendered();
  }
}
