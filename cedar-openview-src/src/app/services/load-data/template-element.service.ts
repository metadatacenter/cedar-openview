import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {RestApiUrlService} from '../rest-api-url.service';
import {Router} from '@angular/router';
import {GenericMultiLoaderService} from './generic-multi-loader';
import {TemplateElement} from '../../shared/model/template-element.model';
import {TranslateService} from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class TemplateElementService extends GenericMultiLoaderService<TemplateElement> {

  protected constructor(
    http: HttpClient,
    restApiUrl: RestApiUrlService,
    router: Router,
    translateService: TranslateService
  ) {
    super(http, restApiUrl, router, translateService);
  }

  getTemplateElement(templateElementId: string): Observable<TemplateElement | null> | null {
    return this.getData(templateElementId, this.restApiUrl.templateElement(templateElementId));
  }
}
