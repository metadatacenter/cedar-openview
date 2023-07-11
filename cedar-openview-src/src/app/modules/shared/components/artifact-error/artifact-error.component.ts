import {Component, Input, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {SnotifyService} from 'ng-alt-snotify';
import {ActivatedRoute, Router} from '@angular/router';
import {DataStoreService} from '../../../../services/data-store.service';
import {DataHandlerService} from '../../../../services/data-handler.service';
import {LocalSettingsService} from '../../../../services/local-settings.service';
import {UiService} from '../../../../services/ui.service';

import {CedarBase} from '../base/cedar-base.component';

@Component({
  selector: 'app-artifact-error',
  templateUrl: './artifact-error.component.html',
  styleUrls: ['./artifact-error.component.less']
})
export class ArtifactErrorComponent extends CedarBase implements OnInit {

  @Input() status: number = 0;
  @Input() instanceTemplateError?: boolean;
  @Input() cedarLink?: string;
  @Input() noun = 'artifact';

  params: any;

  constructor(
    localSettings: LocalSettingsService,
    translateService: TranslateService,
    notify: SnotifyService,
    router: Router,
    route: ActivatedRoute,
    dataStore: DataStoreService,
    dataHandler: DataHandlerService,
    private uiService: UiService
  ) {
    super(localSettings, translateService, notify, router, route, dataStore, dataHandler);
  }

  ngOnInit() {
    this.params = {};
    this.params['link'] = this.cedarLink;
  }

  openInCedar() {
    if (this.noun === 'artifact') {
      this.uiService.openInCedar();
    } else {
      this.uiService.openUrlInBlank(this.cedarLink ?? '');
    }
  }
}
