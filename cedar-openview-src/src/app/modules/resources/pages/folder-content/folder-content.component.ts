import { resourceSelector, resourcePathId } from "../../../../resource-address";
import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {DataStoreService} from '../../../../services/data-store.service';
import {DataHandlerService} from '../../../../services/data-handler.service';
import {ActivatedRoute, Router} from '@angular/router';
import {CedarPageComponent} from '../../../shared/components/base/cedar-page-component.component';
import {DataHandlerDataId} from '../../../shared/model/data-handler-data-id.model';
import {DataHandlerDataStatus} from '../../../shared/model/data-handler-data-status.model';
import {FolderContent, FolderResource} from '../../../../shared/model/folder-content.model';
import {globalAppConfig} from "../../../../../environments/global-app-config";

@Component({
  selector: 'app-folder-content',
  templateUrl: './folder-content.component.html',
  styleUrls: ['./folder-content.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class FolderContentComponent extends CedarPageComponent implements OnInit {

  folderId: string | null = null;
  folderContents?: FolderContent;
  /** The artifact being previewed, or null while no preview is open. */
  preview: FolderResource | null = null;
  /** The HTTP status of a failed load, 0 when no answer arrived; null while nothing has failed. */
  folderStatus: number | null = null;
  cedarLink?: string;

  constructor(
    router: Router,
    route: ActivatedRoute,
    dataStore: DataStoreService,
    dataHandler: DataHandlerService
  ) {
    super(router, route, dataStore, dataHandler);
  }

  ngOnInit() {
    // Moving from one folder to another reuses this page, Back and Forward included, so it follows the route.
    this.route.paramMap.subscribe((params) => this.show(params.get('folderId')));
  }

  private show(folderId: string | null) {
    this.initDataHandler();
    this.folderId = folderId;
    this.folderContents = undefined;
    this.folderStatus = null;
    this.preview = null;
    this.cedarLink = globalAppConfig.cedarUrl + 'dashboard?folderId=' + encodeURIComponent(resourceSelector(this.folderId?.includes('/') ? this.folderId : 'folders/' + (this.folderId ?? '')));
    this.dataHandler
      .requireId(DataHandlerDataId.FOLDER_CONTENTS, this.folderId ?? '')
      .load(() => this.dataLoadedCallback(), (error: any, dataStatus: DataHandlerDataStatus) => this.dataErrorCallback(error, dataStatus));
  }

  private dataLoadedCallback() {
    this.folderContents = this.dataStore.getFolderContent(this.folderId ?? '');
  }

  private dataErrorCallback(error: any, dataStatus: DataHandlerDataStatus) {
    this.folderStatus = error.status;
  }

  private static readonly ICONS: Readonly<Record<FolderResource['resourceType'], string>> = {
    folder: 'artifact-folder',
    template: 'artifact-template',
    element: 'artifact-element',
    field: 'artifact-field',
    instance: 'artifact-instance',
  };

  /** Folders first, then artifacts, each in the order the server returned them. */
  get resources(): FolderResource[] {
    const resources = this.folderContents?.['resources'] ?? [];
    return [
      ...resources.filter((r) => r['resourceType'] === 'folder'),
      ...resources.filter((r) => r['resourceType'] !== 'folder'),
    ];
  }

  icon(resource: FolderResource): string {
    return FolderContentComponent.ICONS[resource['resourceType']] ?? 'artifact-field';
  }

  /**
   * Fields, elements and templates are versioned; folders and instances are not. A server older than
   * this page states no version, so its cards show none but keep a versioned card's layout.
   */
  versioned(resource: FolderResource): boolean {
    return resource['resourceType'] === 'template' || resource['resourceType'] === 'element'
      || resource['resourceType'] === 'field';
  }

  /** The translation key of a publication status, or null when the server states none. */
  status(resource: FolderResource): string | null {
    const status = resource['bibo:status'];
    return status ? 'FolderContent.Statuses.' + status.replace('bibo:', '') : null;
  }

  open(resource: FolderResource): void {
    if (resource['resourceType'] === 'folder') this.openFolder(resource['@id']);
    else this.openArtifact(resource['resourceType'], resource['@id']);
  }

  public openFolder(folderId: string): void {
    this.navigateByUrlThen('/folders/' + encodeURIComponent(resourcePathId(folderId)));
  }

  public openArtifact(artifactType: string, artifactId: string): void {
    let url = '';
    switch (artifactType) {
      case 'field':
        url = '/template-fields/';
        break;
      case 'element':
        url = '/template-elements/';
        break;
      case 'template':
        url = '/templates/';
        break;
      case 'instance':
        url = '/template-instances/';
        break;
    }
    url += encodeURIComponent(resourcePathId(artifactId));
    this.navigateByUrlThen(url);
  }

}


