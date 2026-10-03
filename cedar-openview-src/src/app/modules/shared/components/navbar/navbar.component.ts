import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {DataStoreService} from '../../../../services/data-store.service';
import {ActivatedRoute, Router} from '@angular/router';
import {DataHandlerService} from '../../../../services/data-handler.service';
import {CedarBase} from '../base/cedar-base.component';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class NavbarComponent extends CedarBase implements OnInit {

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

  openInNewWindow(url: string) {
    window.open(url, '_blank');
  }
}
