import {Injectable} from '@angular/core';
import {LocalSettingsService} from './local-settings.service';
import {Template} from '../shared/model/template.model';
import {TemplateField} from '../shared/model/template-field.model';
import {TemplateElement} from '../shared/model/template-element.model';
import {TemplateInstance} from '../shared/model/template-instance.model';
import {FolderContent} from '../shared/model/folder-content.model';

@Injectable({
  providedIn: 'root'
})
export class DataStoreService {

  private static cedarClientSessionId = 'abcd-efgh-1234';//uuid();

  private readonly templateFieldMap: Map<string, TemplateField>;
  private readonly templateElementMap: Map<string, TemplateElement>;
  private readonly templateMap: Map<string, Template>;
  private readonly templateInstanceMap: Map<string, TemplateInstance>;
  private readonly folderContentMap: Map<string, FolderContent>;

  constructor(
    private localSettings: LocalSettingsService
  ) {
    this.templateFieldMap = new Map<string, TemplateField>();
    this.templateElementMap = new Map<string, TemplateElement>();
    this.templateMap = new Map<string, Template>();
    this.templateInstanceMap = new Map<string, TemplateInstance>();
    this.folderContentMap = new Map<string, FolderContent>();
  }

  public static getCedarClientSessionId() {
    return DataStoreService.cedarClientSessionId;
  }

  setTemplateField(templateFieldId: string, templateField: TemplateField) {
    this.templateFieldMap.set(templateFieldId, templateField);
  }

  getTemplateField(templateFieldId: string): TemplateField | undefined {
    return this.templateFieldMap.get(templateFieldId);
  }

  setTemplateElement(templateElementId: string, templateElement: TemplateElement) {
    this.templateElementMap.set(templateElementId, templateElement);
  }

  getTemplateElement(templateElementId: string): TemplateElement | undefined {
    return this.templateElementMap.get(templateElementId);
  }

  setTemplate(templateId: string, template: Template) {
    this.templateMap.set(templateId, template);
  }

  getTemplate(templateId: string): Template | undefined {
    return this.templateMap.get(templateId);
  }

  setTemplateInstance(templateInstanceId: string, templateInstance: TemplateInstance) {
    this.templateInstanceMap.set(templateInstanceId, templateInstance);
  }

  getTemplateInstance(templateInstanceId: string): TemplateInstance | undefined {
    return this.templateInstanceMap.get(templateInstanceId);
  }

  setFolderContent(folderId: string, folderContent: FolderContent) {
    this.folderContentMap.set(folderId, folderContent);
  }

  getFolderContent(folderId: string) {
    return this.folderContentMap.get(folderId);
  }
}
