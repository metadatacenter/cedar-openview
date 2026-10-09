import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Injector,
  Input,
  NgZone,
  OnDestroy,
  Output,
  ViewChild,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';
import type {CeeEventHandler, CeeJsonObject} from 'cedar-embeddable-editor';
import {FolderResource} from '../../../../shared/model/folder-content.model';
import {RestApiUrlService} from '../../../../services/rest-api-url.service';
import {CeeConfigService} from '../../../../services/cee-config.service';
import {TemplateService} from '../../../../services/template.service';
import {elementAsTemplate} from '../../util/element-as-template';

/** The artifact as it was read, and the template the editor draws it with. */
interface Source {
  artifact: CeeJsonObject;
  template: CeeJsonObject;
}

/** How long the preview waits for the editor before it reports that the preview could not be loaded. */
const PATIENCE_MS = 30000;

/**
 * A modal preview of one artifact in an open folder, as Workspace previews one: the artifact drawn
 * read-only by the CEDAR Embeddable Editor, with a mode in which a visitor can try filling it in.
 * Nothing a visitor enters is kept, and each mode starts again from the artifact as it was read.
 */
@Component({
  selector: 'app-artifact-preview',
  templateUrl: './artifact-preview.component.html',
  styleUrls: ['./artifact-preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class ArtifactPreviewComponent implements AfterViewInit, OnDestroy {
  @Input({required: true}) resource!: FolderResource;
  @Output() readonly closed = new EventEmitter<void>();
  @ViewChild('dialog', {static: true}) dialog!: ElementRef<HTMLDialogElement>;
  @ViewChild('mount', {static: true}) mount!: ElementRef<HTMLDivElement>;

  private readonly http = inject(HttpClient);
  private readonly urls = inject(RestApiUrlService);
  private readonly ceeConfig = inject(CeeConfigService);
  private readonly zone = inject(NgZone);
  private readonly injector = inject(Injector);

  readonly loading = signal(true);
  /** The translation key of what went wrong, or null while nothing has. */
  readonly error = signal<string | null>(null);
  readonly trying = signal(false);

  private source?: Source;
  private alive = true;
  /** Counts the editors mounted, so a late callback from one already replaced is ignored. */
  private generation = 0;
  private timer?: ReturnType<typeof setTimeout>;
  private readonly originalFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;

  get name(): string {
    return this.resource['schema:name'] ?? '';
  }

  async ngAfterViewInit() {
    this.dialog.nativeElement.showModal();
    this.timer = setTimeout(() => this.fail(), PATIENCE_MS);
    try {
      const artifact = await this.read(this.address());
      let template = artifact;
      if (this.resource.resourceType === 'instance') {
        const id = TemplateService.isBasedOn(artifact);
        if (typeof id !== 'string' || !id) throw new Error('The instance names no template');
        try {
          template = await this.read(this.urls.template(id));
        } catch (e) {
          // An open instance can be based on a template that is not open, and asking again will not help.
          if (e instanceof HttpErrorResponse && e.status === 401) return this.fail('Preview.TemplateClosed');
          throw e;
        }
      } else if (this.resource.resourceType === 'element') {
        template = elementAsTemplate(artifact);
      }
      if (!this.alive || this.error()) return;
      this.source = {artifact, template};
      this.mountViewer(this.source);
    } catch {
      this.fail();
    }
  }

  toggleTryOut() {
    if (!this.alive || !this.source || this.loading() || this.error()) return;
    this.trying.update((value) => !value);
    this.loading.set(true);
    this.timer = setTimeout(() => this.fail(), PATIENCE_MS);
    try {
      this.mountViewer(this.source);
    } catch {
      this.fail();
    }
  }

  close() {
    this.dispose();
    this.dialog.nativeElement.close();
    this.closed.emit();
    const trigger = document.querySelector<HTMLButtonElement>(
      `button[data-preview-id="${CSS.escape(this.resource['@id'])}"]`,
    );
    if (trigger) trigger.focus();
    else if (this.originalFocus?.isConnected) this.originalFocus.focus();
  }

  ngOnDestroy() {
    this.dispose();
  }

  private address(): string {
    const id = this.resource['@id'];
    switch (this.resource.resourceType) {
      case 'template':
        return this.urls.template(id);
      case 'element':
        return this.urls.templateElement(id);
      case 'field':
        return this.urls.templateField(id);
      case 'instance':
        return this.urls.templateInstance(id);
      case 'folder':
        throw new Error('A folder has no preview');
    }
  }

  private read(url: string): Promise<CeeJsonObject> {
    return firstValueFrom(this.http.get<CeeJsonObject>(url));
  }

  private mountViewer(source: Source) {
    const generation = ++this.generation;
    const current = () => this.alive && generation === this.generation;
    let rendered = false;
    // The editor reports an artifact it cannot read through `error` and then never becomes ready. That
    // channel also carries problems that leave the form standing, so a later `ready` undoes the refusal.
    // The callbacks arrive from the element's own zone.
    const eventHandler: CeeEventHandler = {
      ready: () => this.zone.run(() => {
        if (!current()) return;
        rendered = true;
        clearTimeout(this.timer);
        this.error.set(null);
        this.reveal();
      }),
      error: () => this.zone.run(() => {
        if (current() && !rendered) this.fail();
      }),
    };
    // Each mode starts from a copy of its own, so trial entries never alter the artifact that was read.
    const {artifact, template} = structuredClone(source);
    const {terminologyBaseUrl, bridgeBaseUrl, defaultLanguage, fallbackLanguage} = this.ceeConfig.value;
    const shared = {
      terminologyBaseUrl, bridgeBaseUrl, defaultLanguage, fallbackLanguage,
      readOnlyMode: !this.trying(),
      previewMode: true,
      // The dialog's title gives a field's name, so the field states its type beneath it.
      showFieldType: true,
      suppressEmptyFieldErrors: true,
      trustTemplateRichText: false,
    };
    // A fresh element takes its handler and configuration before its inputs. No persistence is attached.
    if (this.resource.resourceType === 'field') {
      if (!customElements.get('cedar-embeddable-field')) throw new Error('The field element is not defined');
      const viewer = document.createElement('cedar-embeddable-field');
      viewer.eventHandler = eventHandler;
      viewer.config = shared;
      this.mount.nativeElement.replaceChildren(viewer);
      viewer.fieldObject = artifact;
    } else {
      if (!customElements.get('cedar-embeddable-editor')) throw new Error('The editor element is not defined');
      const viewer = document.createElement('cedar-embeddable-editor');
      viewer.eventHandler = eventHandler;
      viewer.config = {
        ...shared,
        showDownloadMenu: false,
        showExpandCollapseAll: false,
        showTemplateDescription: true,
      };
      this.mount.nativeElement.replaceChildren(viewer);
      if (this.resource.resourceType === 'instance') {
        viewer.templateAndInstanceObject = {templateObject: template, instanceObject: artifact};
      } else {
        viewer.templateObject = template;
      }
    }
  }

  private fail(message = 'Preview.Unavailable') {
    if (!this.alive) return;
    clearTimeout(this.timer);
    this.error.set(message);
    this.reveal();
  }

  /** Shows the finished dialog once, then puts focus on its close button. */
  private reveal() {
    if (!this.loading()) return;
    this.loading.set(false);
    afterNextRender(() => {
      if (this.alive) this.dialog.nativeElement.querySelector<HTMLButtonElement>('header .dialog-close')?.focus();
    }, {injector: this.injector});
  }

  private dispose() {
    this.alive = false;
    clearTimeout(this.timer);
    this.mount.nativeElement.replaceChildren();
  }
}
