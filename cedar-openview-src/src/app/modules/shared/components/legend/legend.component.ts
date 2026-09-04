import {Component, ChangeDetectionStrategy} from '@angular/core';
import {
  faAsterisk,
  faCalendar,
  faCheckSquare,
  faDotCircle,
  faEnvelope,
  faFont,
  faHashtag,
  faLink,
  faList,
  faParagraph,
  faPhoneSquare,
  faPlusSquare
} from '@fortawesome/free-solid-svg-icons';

import {library} from '@fortawesome/fontawesome-svg-core';
import {faJsonLD} from '../../costom-icons';

library.add(faJsonLD as any);

@Component({
  selector: 'app-legend',
  templateUrl: './legend.component.html',
  styleUrls: ['./legend.component.scss'],
  providers: [],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})

export class LegendComponent {

  faAsterisk = faAsterisk;
  faEnvelope = faEnvelope;
  faHashtag = faHashtag;
  faLink = faLink;
  faFont = faFont;
  faCalendar = faCalendar;
  faPhoneSquare = faPhoneSquare;
  faParagraph = faParagraph;
  faCheckSquare = faCheckSquare;
  faList = faList;
  faDotCircle = faDotCircle;
  faPlusSquare = faPlusSquare;
  faJsonLD = faJsonLD as any;

  constructor() {
  }
}
