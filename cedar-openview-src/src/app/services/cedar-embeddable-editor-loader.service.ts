import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CedarEmbeddableEditorLoaderService {
  load(): Promise<void> {
    return Promise.resolve();
  }
}
