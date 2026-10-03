import {CedarBase} from './cedar-base.component';
import {ActivatedRoute, Router} from '@angular/router';
import {DataStoreService} from '../../../../services/data-store.service';
import {DataHandlerService} from '../../../../services/data-handler.service';

export abstract class CedarPageComponent extends CedarBase {

  protected constructor(
    router: Router,
    route: ActivatedRoute,
    dataStore: DataStoreService,
    dataHandler: DataHandlerService
  ) {
    super(router, route, dataStore, dataHandler);
  }

  protected initDataHandler(): DataHandlerService {
    this.dataHandler.reset();
    return this.dataHandler;
  }
}
