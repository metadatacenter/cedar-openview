import {Component, OnInit} from '@angular/core';
import {DataStoreService} from '../../../../services/data-store.service';
import {DataHandlerService} from '../../../../services/data-handler.service';
import {ActivatedRoute, Router} from '@angular/router';
import {CedarPageComponent} from '../../../shared/components/base/cedar-page-component.component';
import {TranslateService} from '@ngx-translate/core';
import {SnotifyService} from 'ng-alt-snotify';
import {LocalSettingsService} from '../../../../services/local-settings.service';
import {DataHandlerDataId} from '../../../shared/model/data-handler-data-id.model';
import {TemplateField} from '../../../../shared/model/template-field.model';
import {DataHandlerDataStatus} from '../../../shared/model/data-handler-data-status.model';
import {HttpClient} from '@angular/common/http';
import {AutocompleteService} from '../../../../services/autocomplete.service';
import {forkJoin} from 'rxjs';
import {UiService} from '../../../../services/ui.service';
import {TemplateService} from '../../../../services/template.service';
import * as jsonld from 'jsonld';
import {globalAppConfig} from "../../../../../environments/global-app-config";

@Component({
  selector: 'app-template-field',
  templateUrl: './template-field.component.html',
  styleUrls: ['./template-field.component.scss']
})
export class TemplateFieldComponent extends CedarPageComponent implements OnInit {

  templateFieldId: string | null = null;
  template?: TemplateField;
  artifactStatus: number = 0;
  cedarLink?: string;

  instance: any = null;
  mode: string = 'view';
  allPosts: any;
  rdf: any;

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

    this.templateFieldId = this.route.snapshot.paramMap.get('templateFieldId');
    this.cedarLink = globalAppConfig.cedarUrl + 'fields/edit/' + this.templateFieldId;
    this.dataHandler
      .requireId(DataHandlerDataId.TEMPLATE_FIELD, this.templateFieldId ?? '')
      .load(() => this.dataLoadedCallback(), (error: any, dataStatus: DataHandlerDataStatus) => this.dataErrorCallback(error, dataStatus));
  }

  private dataLoadedCallback() {
    this.template = this.dataStore.getTemplateField(this.templateFieldId ?? '');
    this.instance = TemplateService.initInstance(this.template);
  }

  private dataErrorCallback(error: any, dataStatus: DataHandlerDataStatus) {
    this.artifactStatus = error.status;
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
  onFormChange(event: any, field: any) {
    if (event && event.detail) {
      this.uiService.setTitleAndDescription(event.detail.title, event.detail.description, field['@type']);
      this.uiService.setValidity(event.detail.validity);
      setTimeout(() => {
        const that = this;
        if (this.instance) {
          jsonld.toRDF(this.instance, {format: 'application/n-quads'}, function (err, nquads) {
            that.rdf = err ? err : nquads;
          });
        }
      }, 0);
    }
  }
}

