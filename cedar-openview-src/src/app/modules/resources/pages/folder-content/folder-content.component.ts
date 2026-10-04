import { resourceSelector, resourcePathId } from "../../../../resource-address";
import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {DataStoreService} from '../../../../services/data-store.service';
import {DataHandlerService} from '../../../../services/data-handler.service';
import {ActivatedRoute, Router} from '@angular/router';
import {CedarPageComponent} from '../../../shared/components/base/cedar-page-component.component';
import {DataHandlerDataId} from '../../../shared/model/data-handler-data-id.model';
import {DataHandlerDataStatus} from '../../../shared/model/data-handler-data-status.model';
import {FolderContent} from '../../../../shared/model/folder-content.model';
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
  folderStatus: number = 0;
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
    this.initDataHandler();
    this.folderId = this.route.snapshot.paramMap.get('folderId');
    this.cedarLink = globalAppConfig.cedarUrl + 'dashboard?folderId=' + encodeURIComponent(resourceSelector(this.folderId?.includes('/') ? this.folderId : 'folders/' + (this.folderId ?? '')));
    console.log(this.folderId);
    console.log(this.cedarLink);
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

  private static readonly ICONS: Readonly<Record<string, string>> = {
    folder: 'artifact-folder',
    template: 'artifact-template',
    element: 'artifact-element',
    field: 'artifact-field',
    instance: 'artifact-instance',
  };

  /** Folders first, then artifacts, each in the order the server returned them. */
  get resources() {
    const resources = this.folderContents?.['resources'] ?? [];
    return [
      ...resources.filter((r: any) => r['resourceType'] === 'folder'),
      ...resources.filter((r: any) => r['resourceType'] !== 'folder'),
    ];
  }

  icon(resource: any): string {
    return FolderContentComponent.ICONS[resource['resourceType']] ?? 'artifact-field';
  }

  open(resource: any): void {
    if (resource['resourceType'] === 'folder') this.openFolder(resource['@id']);
    else this.openArtifact(resource['resourceType'], resource['@id']);
  }

  public openFolder(folderId: string): void {
    const url = '/folders/' + encodeURIComponent(resourcePathId(folderId));
    this.navigateByUrlThen(url).then(_ => {
      this.ngOnInit();
    });
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
    this.navigateByUrlThen(url).then(_ => {
      this.ngOnInit();
    });
  }

}


