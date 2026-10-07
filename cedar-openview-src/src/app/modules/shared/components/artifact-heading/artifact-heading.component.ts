import {Component, ChangeDetectionStrategy, Input} from '@angular/core';
import {CedarArtifact} from '../../../../shared/model/cedar-artifact.model';

/**
 * The title of an element or field page.
 *
 * A template page takes its title from the CEDAR Embeddable Editor's own header. That header calls
 * whatever it draws a template, and an element reaches the editor as a transient template, while the
 * field element's header gives only the field's label. These pages therefore hide the components'
 * headers and state the artifact's label, kind, version and status here, laid out as the editor lays
 * out a template's.
 */
@Component({
  selector: 'app-artifact-heading',
  templateUrl: './artifact-heading.component.html',
  styleUrls: ['./artifact-heading.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class ArtifactHeadingComponent {
  @Input({required: true}) artifact!: CedarArtifact & {'skos:prefLabel'?: string};
  @Input({required: true}) kind!: 'Element' | 'Field';

  /** The label the components show for the artifact: its preferred label, or else its name. */
  get label(): string {
    return this.artifact['skos:prefLabel'] || this.artifact['schema:name'];
  }

  /** The kind, and the version when the artifact states one, worded as the editor words a template's. */
  get kindAndVersion(): string {
    const version = this.artifact['pav:version'];
    return version ? `${this.kind} version ${version}` : this.kind;
  }

  get status(): string | null {
    const status = this.artifact['bibo:status'];
    if (status === 'bibo:published') return 'Published';
    if (status === 'bibo:draft') return 'Draft';
    return null;
  }
}
