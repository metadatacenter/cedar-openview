import {Component, OnInit} from '@angular/core';
import {DataStoreService} from '../../../../services/data-store.service';
import {DataHandlerService} from '../../../../services/data-handler.service';
import {ActivatedRoute, Router} from '@angular/router';
import {CedarPageComponent} from '../../../shared/components/base/cedar-page-component.component';
import {TranslateService} from '@ngx-translate/core';
import {SnotifyService} from 'ng-alt-snotify';
import {LocalSettingsService} from '../../../../services/local-settings.service';
import {DataHandlerDataId} from '../../../shared/model/data-handler-data-id.model';
import {Template} from '../../../../shared/model/template.model';
import {DataHandlerDataStatus} from '../../../shared/model/data-handler-data-status.model';
import {forkJoin} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {AutocompleteService} from '../../../../services/autocomplete.service';
import {UiService} from '../../../../services/ui.service';
import {TemplateService} from '../../../../services/template.service';
import * as jsonld from 'jsonld';
import {globalAppConfig} from "../../../../../environments/global-app-config";

@Component({
  selector: 'app-template',
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.scss']
})
export class TemplateComponent extends CedarPageComponent implements OnInit {

  templateId: string | null = null;
  template?: Template;
  artifactStatus: number = 0;
  cedarLink?: string;

  instance: any = null;
  mode: string = 'view';
  allPosts: any;
  rdf: any;

  cavConfig = {
    showTemplateData: false,
    showInstanceData: false,
    defaultLanguage: 'en',
    fallbackLanguage: 'en',
  };

  constructor(
    localSettings: LocalSettingsService,
    translateService: TranslateService,
    notify: SnotifyService,
    router: Router,
    route: ActivatedRoute,
    dataStore: DataStoreService,
    dataHandler: DataHandlerService,
    private http: HttpClient,
    private autocompleteService: AutocompleteService,
    private uiService: UiService,
  ) {
    super(localSettings, translateService, notify, router, route, dataStore, dataHandler);
  }

  ngOnInit() {
    this.allPosts = [];
    this.initDataHandler();
    this.templateId = this.route.snapshot.paramMap.get('templateId');
    this.cedarLink = globalAppConfig.cedarUrl + 'templates/edit/' + this.templateId;
    this.dataHandler
      .requireId(DataHandlerDataId.TEMPLATE, this.templateId ?? '')
      .load(() => this.dataLoadedCallback(), (error: any, dataStatus: DataHandlerDataStatus) => this.dataErrorCallback(error, dataStatus));
  }

  private dataLoadedCallback() {
    this.template = this.dataStore.getTemplate(this.templateId ?? '');
    this.instance = TemplateService.initInstance(this.template);
    // const schema = TemplateService.schemaOf(this.template);
    // TemplateService.setBasedOn(this.instance, TemplateService.getId(schema));
    // TemplateService.setName(this.instance, TemplateService.getName(schema));
    // TemplateService.setHelp(this.instance, TemplateService.getHelp(schema));
  }

  private dataErrorCallback(error: any, dataStatus: DataHandlerDataStatus) {
    this.artifactStatus = error.status;
  }

  onAutocomplete(event: any) {
    if (event.detail && event.detail.search) {
      forkJoin(this.autocompleteService.getPosts(event.detail.search, event.detail.constraints)).subscribe(posts => {
        this.allPosts = [];
        for (let i = 0; i < posts.length; i++) {
          this.allPosts = this.allPosts.concat(posts[i]['collection']);
        }
      });
    }
  }

  // copy content to browser's clipboard
  copyToClipboard(elementId: string, buttonId: string) {
    this.uiService.copyToClipboard(elementId, buttonId);
  }

  // form changed, update tab contents and submit button status
  onFormChange(event: any, template: any) {
    if (event && event.detail) {
      //console.log(event.detail);
      this.uiService.setTitleAndDescription(event.detail.title, event.detail.description, template['@type']);
      this.uiService.setValidity(event.detail.validity);
      setTimeout(() => {
        const that = this;
        jsonld.toRDF(this.instance, {format: 'application/n-quads'}, function (err: any, nquads: any) {
          that.rdf = err ? err : nquads;
        });
      }, 0);
    }
  }
}


