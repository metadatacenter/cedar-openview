import {Component, Input, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {DataStoreService} from '../../../../services/data-store.service';
import {DataHandlerService} from '../../../../services/data-handler.service';
import {UiService} from '../../../../services/ui.service';

import {CedarBase} from '../base/cedar-base.component';

@Component({
  selector: 'app-artifact-error',
  templateUrl: './artifact-error.component.html',
  styleUrls: ['./artifact-error.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class ArtifactErrorComponent extends CedarBase implements OnInit {

  @Input() status: number = 0;
  @Input() instanceTemplateError?: boolean;
  @Input() cedarLink?: string;
  @Input() noun = 'artifact';
  /** The artifact arrived, but CEDAR cannot read it, so it cannot be displayed. */
  @Input() unreadable = false;

  params: any;

  constructor(
    router: Router,
    route: ActivatedRoute,
    dataStore: DataStoreService,
    dataHandler: DataHandlerService,
    private uiService: UiService
  ) {
    super(router, route, dataStore, dataHandler);
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
