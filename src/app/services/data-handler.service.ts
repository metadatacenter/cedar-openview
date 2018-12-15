import {Injectable} from '@angular/core';
import {DataHandlerDataStatus} from "../modules/shared/model/data-handler-data-status.model";
import {DataStoreService} from "./data-store.service";
import {TranslateService} from "@ngx-translate/core";
import {DataHandlerDataId} from "../modules/shared/model/data-handler-data-id.model";
import {SpinnerService} from "./spinner.service";
import {TemplateService} from "./load-data/template.service";
import {Template} from "../shared/model/template.model";
import {TemplateElement} from "../shared/model/template-element.model";
import {TemplateFieldService} from "./load-data/template-field.service";
import {TemplateElementService} from "./load-data/template-element.service";
import {TemplateInstance} from "../shared/model/template-instance.model";
import {TemplateInstanceService} from "./load-data/template-instance.service";
import {TemplateField} from "../shared/model/template-field.model";

@Injectable({
  providedIn: 'root'
})
export class DataHandlerService {

  private dataIdMap: Map<string, DataHandlerDataStatus>;
  private dataAvailable: boolean;
  private callback: Function;
  private preCallback: Function;

  constructor(
    public dataStore: DataStoreService,
    public spinner: SpinnerService,
    private translateService: TranslateService,
    private templateFieldService: TemplateFieldService,
    private templateElementService: TemplateElementService,
    private templateService: TemplateService,
    private templateInstanceService: TemplateInstanceService
  ) {
    this.dataIdMap = new Map<string, DataHandlerDataStatus>();
    this.dataAvailable = false;
    this.callback = null;
    this.preCallback = null;
  }

  reset(): DataHandlerService {
    this.spinner.hide();
    this.dataIdMap.clear();
    this.dataAvailable = false;
    this.callback = null;
    return this;
  }

  require(dataId: DataHandlerDataId): DataHandlerService {
    let status: DataHandlerDataStatus = DataHandlerDataStatus.forDataId(dataId);
    console.log("DataHandler.require:" + status.getKey());
    this.dataIdMap.set(status.getKey(), status);
    return this;
  }

  requireId(dataId: DataHandlerDataId, id: string): DataHandlerService {
    let status: DataHandlerDataStatus = DataHandlerDataStatus.forDataIdAndId(dataId, id);
    console.log("DataHandler.requireId:" + status.getKey());
    this.dataIdMap.set(status.getKey(), status);
    return this;
  }

  load(callback?: Function) {
    this.spinner.show();
    this.dataAvailable = false;
    this.callback = callback;
    this.dataIdMap.forEach((dataStatus: DataHandlerDataStatus) => {
      this.loadData(dataStatus);
      if (dataStatus.canceled) {
        this.checkCompletion();
      }
    });
  }

  setPreCallback(preCallback: Function) {
    this.preCallback = preCallback;
  }

  private loadData(dataStatus: DataHandlerDataStatus) {
    switch (dataStatus.dataId) {
      case DataHandlerDataId.TEMPLATE_FIELD:
        this.loadTemplateField(dataStatus);
        break;
      case DataHandlerDataId.TEMPLATE_ELEMENT:
        this.loadTemplateElement(dataStatus);
        break;
      case DataHandlerDataId.TEMPLATE:
        this.loadTemplate(dataStatus);
        break;
      case DataHandlerDataId.TEMPLATE_INSTANCE:
        this.loadTemplateInstance(dataStatus);
        break;
    }
  }

  private loadTemplateField(dataStatus: DataHandlerDataStatus) {
    this.templateFieldService.getTemplateField(dataStatus.id)
      .subscribe(templateField => {
        this.dataStore.setTemplateField(dataStatus.id, Object.assign(new TemplateField(), templateField));
        this.dataWasLoaded(dataStatus);
      });
  }

  private loadTemplateElement(dataStatus: DataHandlerDataStatus) {
    this.templateElementService.getTemplateElement(dataStatus.id)
      .subscribe(templateElement => {
        this.dataStore.setTemplateElement(dataStatus.id, Object.assign(new TemplateElement(), templateElement));
        this.dataWasLoaded(dataStatus);
      });
  }

  private loadTemplate(dataStatus: DataHandlerDataStatus) {
    this.templateService.getTemplate(dataStatus.id)
      .subscribe(template => {
        this.dataStore.setTemplate(dataStatus.id, Object.assign(new Template(), template));
        this.dataWasLoaded(dataStatus);
      });
  }

  private loadTemplateInstance(dataStatus: DataHandlerDataStatus) {
    this.templateInstanceService.getTemplateInstance(dataStatus.id)
      .subscribe(templateInstance => {
        this.dataStore.setTemplateInstance(dataStatus.id, Object.assign(new TemplateInstance(), templateInstance));
        this.dataWasLoaded(dataStatus);
      });
  }

  private dataWasLoaded(dataStatus: DataHandlerDataStatus) {
    dataStatus.loaded = true;
    this.checkCompletion();
  }

  private checkCompletion() {
    let allLoaded: boolean = true;
    this.dataIdMap.forEach((dataStatus: DataHandlerDataStatus) => {
      if (dataStatus.loaded == false && dataStatus.canceled == false) {
        allLoaded = false;
      }
    });
    if (allLoaded) {
      this.spinner.hide();
      if (this.preCallback != null) {
        this.preCallback();
      }
      if (this.callback != null) {
        this.callback();
      }
      this.dataAvailable = true;
      console.log("All data was loaded.");
    }
  }

  public dataIsAvailable() {
    return this.dataAvailable;
  }

}
