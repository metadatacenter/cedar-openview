import {Component, Input} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {SnotifyService} from 'ng-snotify';
import {ActivatedRoute, Router} from '@angular/router';
import {DataStoreService} from '../../../../services/data-store.service';
import {DataHandlerService} from '../../../../services/data-handler.service';
import {LocalSettingsService} from '../../../../services/local-settings.service';
import {CedarBase} from '../base/cedar-base.component';

@Component({
  selector: 'app-artifact-error',
  templateUrl: './artifact-error.component.html',
  styleUrls: ['./artifact-error.component.css']
})
export class ArtifactErrorComponent extends CedarBase {

  @Input() status: number;
  @Input() cedarLink: string;

  params: Object;

  constructor(
    protected localSettings: LocalSettingsService,
    protected translateService: TranslateService,
    protected notify: SnotifyService,
    protected router: Router,
    protected route: ActivatedRoute,
    protected dataStore: DataStoreService,
    protected dataHandler: DataHandlerService
  ) {
    super(localSettings, translateService, notify, router, route, dataStore, dataHandler);
  }

  ngOnInit() {
    this.params = {};
    this.params['link'] = this.cedarLink;
  }

}
