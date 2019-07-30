import {Component, Input} from '@angular/core';
import {UiService} from '../../../../services/ui.service';


@Component({
  selector: 'app-form-results',
  templateUrl: './form-results.component.html',
  styleUrls: ['./form-results.component.scss'],
  providers: []
})

export class FormResultsComponent  {

  @Input() instance: any;
  @Input() template: any;
  @Input() rdf: any;

  constructor(private uiService: UiService) {
  }

  // copy content to browser's clipboard
  copyToClipboard(elementId: string, buttonId: string) {
    this.uiService.copyToClipboard(elementId, buttonId);
  }

}
