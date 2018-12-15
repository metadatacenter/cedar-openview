import {Component} from '@angular/core';
import {DataStoreService} from "../../../../services/data-store.service";
import {DataHandlerService} from "../../../../services/data-handler.service";
import {ActivatedRoute, Router} from "@angular/router";
import {CedarPageComponent} from "../../../shared/components/base/cedar-page-component.component";
import {TranslateService} from "@ngx-translate/core";
import {SnotifyService} from "ng-snotify";
import {LocalSettingsService} from "../../../../services/local-settings.service";
import {DataHandlerDataId} from "../../../shared/model/data-handler-data-id.model";
import {TemplateField} from "../../../../shared/model/template-field.model";

@Component({
  selector: 'app-template-field',
  templateUrl: './template-field.component.html',
  styleUrls: ['./template-field.component.css']
})
export class TemplateFieldComponent extends CedarPageComponent {

  templateFieldId: string = null;
  templateField: TemplateField = null;

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

    this.templateFieldId = this.route.snapshot.paramMap.get('templateFieldId');
    this.dataHandler
      .requireId(DataHandlerDataId.TEMPLATE_FIELD, this.templateFieldId)
      .load(() => this.dataLoadedCallback());
  }

  private dataLoadedCallback() {
    this.templateField = this.dataStore.getTemplateField(this.templateFieldId);
  }

}
