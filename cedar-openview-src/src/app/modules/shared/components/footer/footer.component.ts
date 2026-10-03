import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {DataStoreService} from '../../../../services/data-store.service';
import {ActivatedRoute, Router} from '@angular/router';
import {DataHandlerService} from '../../../../services/data-handler.service';
import {CedarBase} from '../base/cedar-base.component';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class FooterComponent extends CedarBase implements OnInit {

  constructor(
    router: Router,
    route: ActivatedRoute,
    dataStore: DataStoreService,
    dataHandler: DataHandlerService
  ) {
    super(router, route, dataStore, dataHandler);
  }

  ngOnInit() {
  }

}
