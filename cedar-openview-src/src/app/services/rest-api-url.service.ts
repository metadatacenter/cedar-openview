import { resourcePathId } from "../resource-address";
import {Injectable} from '@angular/core';
import {globalAppConfig} from "../../environments/global-app-config";

@Injectable({
  providedIn: 'root'
})
export class RestApiUrlService {

  API_URL: string = globalAppConfig.apiUrl;

  private base() {
    return `${this.API_URL}`;
  }

  private templateFields() {
    return `${this.base()}template-fields`;
  }

  private templateElements() {
    return `${this.base()}template-elements`;
  }

  private templates() {
    return `${this.base()}templates`;
  }

  private templateInstances() {
    return `${this.base()}template-instances`;
  }

  private folderContents() {
    return `${this.base()}folders`;
  }

  templateField(id: string) {
    return `${this.templateFields()}/${encodeURIComponent(resourcePathId(id))}`;
  }

  templateElement(id: string) {
    return `${this.templateElements()}/${encodeURIComponent(resourcePathId(id))}`;
  }

  template(id: string) {
    return `${this.templates()}/${encodeURIComponent(resourcePathId(id))}`;
  }

  templateInstance(id: string) {
    return `${this.templateInstances()}/${encodeURIComponent(resourcePathId(id))}`;
  }

  folderContent(id: string) {
    return `${this.folderContents()}/${encodeURIComponent(resourcePathId(id))}`;
  }

}
