import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class CedarEmbeddableEditorLoaderService {
  private loaded?: Promise<void>;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  load(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return Promise.resolve();
    if (!this.loaded) {
      this.loaded = new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = '/assets/third-party-components/cedar-embeddable-editor/v1.5.0/cedar-embeddable-editor.js';
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load cedar-embeddable-editor.js'));
        document.head.appendChild(script);
      });
    }
    return this.loaded;
  }
}
