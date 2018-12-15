import {Component} from '@angular/core';
import {DataStoreService} from "../../../../services/data-store.service";
import {DataHandlerService} from "../../../../services/data-handler.service";
import {ActivatedRoute, Router} from "@angular/router";
import {CedarPageComponent} from "../../../shared/components/base/cedar-page-component.component";
import {TranslateService} from "@ngx-translate/core";
import {SnotifyService} from "ng-snotify";
import {LocalSettingsService} from "../../../../services/local-settings.service";
import {DataHandlerDataId} from "../../../shared/model/data-handler-data-id.model";
import {Template} from "../../../../shared/model/template.model";

@Component({
  selector: 'app-template',
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.css']
})
export class TemplateComponent extends CedarPageComponent {

  templateId: string = null;
  template: Template = null;

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

    this.templateId = this.route.snapshot.paramMap.get('templateId');
    this.dataHandler
      .requireId(DataHandlerDataId.TEMPLATE, this.templateId)
      .load(() => this.dataLoadedCallback());
  }

  private dataLoadedCallback() {
    this.template = this.dataStore.getTemplate(this.templateId);
  }

}
