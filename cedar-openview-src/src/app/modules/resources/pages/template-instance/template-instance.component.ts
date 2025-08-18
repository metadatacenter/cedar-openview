import {AfterViewInit, Component, OnInit} from '@angular/core';
import {DataStoreService} from '../../../../services/data-store.service';
import {DataHandlerService} from '../../../../services/data-handler.service';
import {ActivatedRoute, Router} from '@angular/router';
import {CedarPageComponent} from '../../../shared/components/base/cedar-page-component.component';
import {TranslateService} from '@ngx-translate/core';
import {SnotifyService} from 'ng-alt-snotify';
import {LocalSettingsService} from '../../../../services/local-settings.service';
import {DataHandlerDataId} from '../../../shared/model/data-handler-data-id.model';
import {TemplateInstance} from '../../../../shared/model/template-instance.model';
import {DataHandlerDataStatus} from '../../../shared/model/data-handler-data-status.model';
import {HttpClient} from '@angular/common/http';
import {AutocompleteService} from '../../../../services/autocomplete.service';
import {forkJoin} from 'rxjs';
import {UiService} from '../../../../services/ui.service';
import {TemplateService} from '../../../../services/template.service';
import * as jsonld from 'jsonld';
import {globalAppConfig} from "../../../../../environments/global-app-config";
import {CedarEmbeddableEditorLoaderService} from '../../../../services/cedar-embeddable-editor-loader.service';
import {CeeConfigService} from '../../../../services/cee-config.service';

@Component({
  selector: 'app-template-instance',
  templateUrl: './template-instance.component.html',
  styleUrls: ['./template-instance.component.scss']
})
export class TemplateInstanceComponent extends CedarPageComponent implements OnInit, AfterViewInit {

  templateInstanceId: string | null = null;
  instance?: TemplateInstance;
  artifactStatus: number = 0;
  templateStatus: number = 0;
  cedarLink?: string;

  template: any = null;
  templateId: string | null = null;
  mode: string = 'view';
  allPosts: any;
  rdf: any;
  cfg = this.ceeConfig.value;

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
    private loader: CedarEmbeddableEditorLoaderService,
    private ceeConfig: CeeConfigService
  ) {
    super(localSettings, translateService, notify, router, route, dataStore, dataHandler);
  }

  ngOnInit() {
    this.allPosts = [];
    this.initDataHandler();

    this.templateInstanceId = this.route.snapshot.paramMap.get('templateInstanceId');
    this.cedarLink = globalAppConfig.cedarUrl + 'instances/edit/' + this.templateInstanceId;
    this.dataHandler
      .requireId(DataHandlerDataId.TEMPLATE_INSTANCE, this.templateInstanceId ?? '')
      .load(() => this.instanceLoadedCallback(this.templateInstanceId ?? ''),
        (error: any, dataStatus: DataHandlerDataStatus) => this.instanceErrorCallback(error, dataStatus));
  }

  async ngAfterViewInit() {
    await this.loader.load();
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
    this.regenerateRDF();
  }

  private regenerateRDF() {
    setTimeout(async () => {
      if (this.instance) {
        const instanceJson = JSON.parse(JSON.stringify(this.instance));
        const nquads = await jsonld.toRDF(instanceJson, {format: 'application/n-quads'});
        this.rdf = nquads;
      }
    }, 0);
  }

  private instanceErrorCallback(error: any, dataStatus: DataHandlerDataStatus) {
    this.artifactStatus = error.status;
  }

  private templateErrorCallback(error: any, dataStatus: DataHandlerDataStatus) {
    this.templateStatus = error.status;
  }

  protected onAutocomplete(event: any) {
    if (event['search']) {
      forkJoin(this.autocompleteService.getPosts(event['search'], event.constraints)).subscribe(posts => {
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
  onFormChange(event: any) {
    if (event && event.detail) {
      this.uiService.setTitleAndDescription(event.detail.title, event.detail.description, 'TemplateInstance');
      this.uiService.setValidity(event.detail.validity);
      this.regenerateRDF();
    }
  }

}
