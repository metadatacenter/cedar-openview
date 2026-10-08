/** One entry of an open folder, as the OpenView server summarizes it. */
export interface FolderResource {
  '@id': string;
  resourceType: 'folder' | 'field' | 'element' | 'template' | 'instance';
  'schema:name': string | null;
  /** The version of a field, element or template; folders and instances carry none. */
  'pav:version'?: string;
  /** The publication status of a field, element or template; folders and instances carry none. */
  'bibo:status'?: 'bibo:draft' | 'bibo:published';
}

export class FolderContent {
  pathInfo: any;
  resources: FolderResource[] = [];
  totalCount: number = -1;
}
