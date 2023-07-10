import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/index';
import {HttpClient} from '@angular/common/http';
import {RestApiUrlService} from '../rest-api-url.service';
import {Router} from '@angular/router';
import {GenericMultiLoaderService} from './generic-multi-loader';
import {SnotifyService} from 'ng-alt-snotify';
import {TranslateService} from '@ngx-translate/core';
import {FolderContent} from '../../shared/model/folder-content.model';

@Injectable({
  providedIn: 'root'
})
export class FolderContentService extends GenericMultiLoaderService<FolderContent> {

  protected constructor(
    http: HttpClient,
    restApiUrl: RestApiUrlService,
    router: Router,
    notify: SnotifyService,
    translateService: TranslateService
  ) {
    super(http, restApiUrl, router, notify, translateService);
  }

  getFolderContent(folderId: string): Observable<FolderContent | null> | null {
    return this.getData(folderId, this.restApiUrl.folderContent(folderId));
  }
}
