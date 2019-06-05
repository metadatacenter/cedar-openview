import {Component, OnInit} from '@angular/core';
import {DataStoreService} from '../../../../services/data-store.service';
import {DataHandlerService} from '../../../../services/data-handler.service';
import {ActivatedRoute, Router} from '@angular/router';
import {CedarPageComponent} from '../../../shared/components/base/cedar-page-component.component';
import {TranslateService} from '@ngx-translate/core';
import {SnotifyService} from 'ng-snotify';
import {LocalSettingsService} from '../../../../services/local-settings.service';
import {DataHandlerDataId} from '../../../shared/model/data-handler-data-id.model';
import {Template} from '../../../../shared/model/template.model';
import {DataHandlerDataStatus} from '../../../shared/model/data-handler-data-status.model';
import {TemplateSchema} from '../../../cedar-metadata-form/models/template-schema.model';
import {InstanceService} from '../../../cedar-metadata-form/services/instance.service';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {TemplateService} from '../../../cedar-metadata-form/services/template.service';
import {forkJoin} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {AutocompleteService} from '../../../../services/autocomplete.service';
import {environment} from '../../../../../environments/environment';



@Component({
  selector: 'app-template',
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.less']
})
export class TemplateComponent  extends CedarPageComponent implements OnInit {

  templateId: string = null;
  template: Template = null;
  artifactStatus: number = null;
  cedarLink: string = null;

  instance: any = null;
  form: FormGroup;
  viewOnly = false;
  allPosts;
  showForm = false;

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
    this.templateId = this.route.snapshot.paramMap.get('templateId');
    this.cedarLink = environment.cedarUrl + 'templates/edit/' + this.templateId;
    this.dataHandler
      .requireId(DataHandlerDataId.TEMPLATE, this.templateId)
      .load(() => this.dataLoadedCallback(), (error, dataStatus) => this.dataErrorCallback(error, dataStatus));
  }

  private dataLoadedCallback() {
    this.template = this.dataStore.getTemplate(this.templateId);
    this.instance = InstanceService.initInstance();
    const schema = TemplateService.schemaOf(this.template) as TemplateSchema;
    InstanceService.setBasedOn(this.instance, TemplateService.getId(schema));
    InstanceService.setName(this.instance, TemplateService.getName(schema));
    InstanceService.setHelp(this.instance, TemplateService.getHelp(schema));
  }

  private dataErrorCallback(error: any, dataStatus: DataHandlerDataStatus) {
    this.artifactStatus = error.status;
  }

  protected onAutocomplete(event) {
    if (event['search']) {
      forkJoin(this.autocompleteService.getPosts(event['search'], event.constraints)).subscribe(posts => {
        console.log('posts', posts);
        this.allPosts = [];
        for (let i = 0; i < posts.length; i++) {
          this.allPosts = this.allPosts.concat(posts[i]['collection']);
        }
        console.log('allPosts', this.allPosts);
      });
    }
  }

  // toggle edit/view button
  toggleDisabled() {
    this.viewOnly = !this.viewOnly;
  }

  // copy stuff in tabs to browser's clipboard
  copyToClipboard(elementId: string, buttonId: string) {

    function copyToClip(str) {
      function listener(e) {
        e.clipboardData.setData('text/html', str);
        e.clipboardData.setData('text/plain', str);
        e.preventDefault();
      }

      document.addEventListener('copy', listener);
      document.execCommand('copy');
      document.removeEventListener('copy', listener);
    }

    const elm = document.getElementById(elementId);
    const data = elm ? elm.innerHTML : null;
    if (data) {

      const selBox = document.createElement('textarea');
      selBox.style.position = 'fixed';
      selBox.style.left = '0';
      selBox.style.top = '0';
      selBox.style.opacity = '0';
      selBox.value = data;
      document.body.appendChild(selBox);
      selBox.focus();
      selBox.select();
      copyToClip(data);
      document.body.removeChild(selBox);

      const btn = document.getElementById(buttonId);
      if (btn) {
        btn.innerHTML = 'Copied';
        setTimeout(() => {
          const btn = document.getElementById(buttonId);
          if (btn) {
            btn.innerHTML = 'Copy';
          }
        }, 10000);
      }
    }
  }

  onSubmit() {
    if (this.form.valid) {
      console.log('form submitted');
    } else {
      this.validateAllFormFields(this.form);
    }
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({onlySelf: true});
      } else if (control instanceof FormArray) {
        control.controls.forEach(cntl => {
          cntl.markAsTouched({onlySelf: true});
        });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  selectedTabChange(event) {

    if (event.index === 0) {
      setTimeout(() => {
        console.log('redraw form');
        this.showForm = true;
      }, 0);

    } else {
      this.showForm = false;
    }
  }

  // form changed, update tab contents and submit button status
  protected onChanged(event) {
    const e = event;
    // setTimeout(() => {
    //   this.payload = e.payload;
    //   this.jsonLD = e.jsonLD;
    //   this.rdf = e.rdf;
    //   this.formValid = e.formValid;
    // }, 0);
  }
}
