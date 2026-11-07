import {DestroyRef, inject, signal} from '@angular/core';
import {CedarBase} from './cedar-base.component';
import {ActivatedRoute, Router} from '@angular/router';
import {DataStoreService} from '../../../../services/data-store.service';
import {DataHandlerService} from '../../../../services/data-handler.service';

export abstract class CedarPageComponent extends CedarBase {

  readonly contentReady = signal(false);
  private readonly presentationLifetime = inject(DestroyRef);
  readonly editorHandler = {ready: () => this.contentRendered()};

  /** Reveal the footer once the content (or its existing error state) has rendered. */
  protected contentRendered(): void {
    queueMicrotask(() => {
      if (!this.presentationLifetime.destroyed) this.contentReady.set(true);
    });
  }


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
