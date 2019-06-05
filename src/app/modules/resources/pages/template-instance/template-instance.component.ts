import {Component, OnInit} from '@angular/core';
import {DataStoreService} from '../../../../services/data-store.service';
import {DataHandlerService} from '../../../../services/data-handler.service';
import {ActivatedRoute, Router} from '@angular/router';
import {CedarPageComponent} from '../../../shared/components/base/cedar-page-component.component';
import {TranslateService} from '@ngx-translate/core';
import {SnotifyService} from 'ng-snotify';
import {LocalSettingsService} from '../../../../services/local-settings.service';
import {DataHandlerDataId} from '../../../shared/model/data-handler-data-id.model';
import {TemplateInstance} from '../../../../shared/model/template-instance.model';
import {DataHandlerDataStatus} from '../../../shared/model/data-handler-data-status.model';
import {environment} from '../../../../../environments/environment';
import {FormGroup} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {AutocompleteService} from '../../../../services/autocomplete.service';
import {forkJoin} from 'rxjs';

@Component({
  selector: 'app-template-instance',
  templateUrl: './template-instance.component.html',
  styleUrls: ['./template-instance.component.css']
})
export class TemplateInstanceComponent extends CedarPageComponent implements OnInit{

  templateInstanceId: string = null;
  templateInstance: TemplateInstance = null;
  artifactStatus: number = null;
  cedarLink: string = null;

  template: any = null;
  form: FormGroup;
  viewOnly = false;
  allPosts;

  constructor(
    protected localSettings: LocalSettingsService,
    public translateService: TranslateService,
    public notify: SnotifyService,
    protected router: Router,
    protected route: ActivatedRoute,
    protected dataStore: DataStoreService,
    protected dataHandler: DataHandlerService,
    private http: HttpClient,
    private autocompleteService: AutocompleteService
  ) {
    super(localSettings, translateService, notify, router, route, dataStore, dataHandler);
  }

  ngOnInit() {
    this.form = new FormGroup({});
    this.allPosts = [];
    this.initDataHandler();

    this.templateInstanceId = this.route.snapshot.paramMap.get('templateInstanceId');
    this.cedarLink = environment.cedarUrl + 'instances/edit/' + this.templateInstanceId;
    this.dataHandler
      .requireId(DataHandlerDataId.TEMPLATE_INSTANCE, this.templateInstanceId)
      .load(() => this.dataLoadedCallback(), (error, dataStatus) => this.dataErrorCallback(error, dataStatus));
  }

  private dataLoadedCallback() {
    this.templateInstance = this.dataStore.getTemplateInstance(this.templateInstanceId);
  }

  private dataErrorCallback(error: any, dataStatus: DataHandlerDataStatus) {
    this.artifactStatus = error.status;
  }

  protected onAutocomplete(event) {
    if (event['search']) {
      forkJoin(this.autocompleteService.getPosts(event['search'], event.constraints)).subscribe(posts => {
        this.allPosts = [];
        for (let i = 0; i < posts.length; i++) {
          this.allPosts = this.allPosts.concat(posts[i]['collection']);
        }
      });
    }
  }

}
