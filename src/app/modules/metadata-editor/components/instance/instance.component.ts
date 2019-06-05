import {Component, OnInit, SchemaMetadata} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

import {forkJoin, Subscription} from 'rxjs';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {LocalSettingsService} from '../../../../services/local-settings.service';
import {DataHandlerService} from '../../../../services/data-handler.service';
import {DataStoreService} from '../../../../services/data-store.service';
import {TemplateService} from '../../../cedar-metadata-form/services/template.service';
import {DataHandlerDataId} from '../../../shared/model/data-handler-data-id.model';
import {TemplateSchema} from '../../../cedar-metadata-form/models/template-schema.model';
import {DataHandlerDataStatus} from '../../../shared/model/data-handler-data-status.model';
import {InstanceService} from '../../../cedar-metadata-form/services/instance.service';
import {AutocompleteService} from '../../services/autocomplete.service';
import {environment} from '../../../../../environments/environment';
import {HttpClient} from '@angular/common/http';



@Component({
  selector: 'app-instance',
  templateUrl: './instance.component.html',
  styleUrls: ['./instance.component.less'],
  providers: []
})

export class InstanceComponent implements OnInit {
  form: FormGroup;
  instanceId: string;
  templateId: string;

  template: any;
  instance: any;
  rdf: any;

  route: ActivatedRoute;
  payload: any;
  jsonLD: any;


  formValid: boolean;
  viewOnly = false;
  _tr: TranslateService;
  _ls: LocalSettingsService;
  dh: DataHandlerService;
  ds: DataStoreService;
  artifactStatus: number = null;
  cedarLink: string = null;

  darkMode: boolean;
  private _darkModeSub: Subscription;

  showForm: boolean;

  allPosts;

   CUSTOM_ELEMENTS_SCHEMA: SchemaMetadata;



  constructor( route: ActivatedRoute, ls: LocalSettingsService, tr: TranslateService,  dataHandler: DataHandlerService,
              dataStore: DataStoreService, private http: HttpClient, private autocompleteService: AutocompleteService) {
    this.route = route;
    this._tr = tr;
    this._ls = ls;

    this.dh = dataHandler;
    this.ds = dataStore;
    this.showForm = true;

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

  ngOnInit() {
    this.form = new FormGroup({});
    this.route.params.subscribe((val) => {
      this.allPosts = [];
      this.initialize(val.instanceId, val.templateId);
    });

    // watch for changes
    this.form.valueChanges.subscribe(value => {
      console.log('watch for changes', value);

      // setTimeout(() => {
      //   const that = this;
      //   jsonld.toRDF(this.instance, {format: 'application/nquads'}, function (err, nquads) {
      //     that.rdf = err ? err : nquads;
      //   });
      // }, 0);
    });

  }

  protected initDataHandler(): DataHandlerService {
    this.dh.reset();
    this.dh.setPreCallback(() => this.preDataIsLoaded());
    return this.dh;
  }

  private preDataIsLoaded() {
  }

  initialize(instanceId: string, templateId: string): any {
    this.instanceId = instanceId;
    this.templateId = templateId;

    if (instanceId) {
      this.initDataHandler();
      this.cedarLink = environment.cedarUrl + 'instances/edit/' + instanceId;
      this.dh
        .requireId(DataHandlerDataId.TEMPLATE_INSTANCE, instanceId)
        .load(() => this.instanceLoadedCallback(instanceId), (error, dataStatus) => this.dataErrorCallback(error, dataStatus));
    } else if (templateId) {
      this.instance = InstanceService.initInstance();

      // load the template it is based on
      this.dh
        .requireId(DataHandlerDataId.TEMPLATE, this.templateId)
        .load(() => this.templateLoadedCallback(this.templateId, ), (error, dataStatus) => this.dataErrorCallback(error, dataStatus));

    }
  }

  private instanceLoadedCallback(instanceId) {
    this.instance = this.ds.getTemplateInstance(instanceId);
    this.templateId = TemplateService.isBasedOn(this.instance);

    // load the template it is based on
    this.dh
      .requireId(DataHandlerDataId.TEMPLATE, this.templateId)
      .load(() => this.templateLoadedCallback(this.templateId), (error, dataStatus) => this.dataErrorCallback(error, dataStatus));
  }

  private templateLoadedCallback(templateId) {
    this.template = this.ds.getTemplate(templateId);

    // if this is a default instance, save the template info
    if (!TemplateService.isBasedOn(this.instance)) {
      const schema = TemplateService.schemaOf(this.template) as TemplateSchema;
      InstanceService.setBasedOn(this.instance, TemplateService.getId(schema));
      InstanceService.setName(this.instance, TemplateService.getName(schema));
      InstanceService.setHelp(this.instance, TemplateService.getHelp(schema));
    }
  }

  private dataErrorCallback(error: any, dataStatus: DataHandlerDataStatus) {
    this.artifactStatus = error.status;
    console.log('dataErrorCallback', error);
  }

  // form changed, update tab contents and submit button status
  public onFormChanged(event) {
    console.log('onFormChanged', event.detail);
    this.payload = event.detail.payload;
    this.jsonLD = event.detail.jsonLD;
    this.rdf = event.detail.rdf;
    this.formValid = event.detail.formValid;
  }


  // form changed, update tab contents and submit button status
  protected onChanged(event) {
    const e = event;
    setTimeout(() => {
      this.payload = e.payload;
      this.jsonLD = e.jsonLD;
      this.rdf = e.rdf;
      this.formValid = e.formValid;
    }, 0);
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

}
