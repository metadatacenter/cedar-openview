import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs/index';
import {FormArray, FormControl, FormGroup} from '@angular/forms';


@Injectable({
  providedIn: 'root'
})
export class UiService {

  public valid: boolean;
  public title: string;
  public description: string;
  public hasTitle: BehaviorSubject<string> = new BehaviorSubject('');
  public hasDescription: BehaviorSubject<string> = new BehaviorSubject('');

  constructor() {
  }

  public setTitleAndDescription(title: string, description: string) {
    if (title !== this.title) {
      this.title = title;
      this.hasTitle.next(this.title);
    }
    if (description !== this.description) {
      this.description = description;
      this.hasDescription.next(this.description);
    }
  }

  public setValidity(valid: boolean) {
    this.valid = valid;
  }

  openInCedar() {
    let destination = window.location.href;
    destination = window.location.href.replace('open-metadata', 'cedar');
    destination =  destination.replace('/instances/', '/instances/edit/');
    destination =  destination.replace('/template-elements/', '/elements/edit/');
    destination =  destination.replace('/template-fields/', '/fields/edit/');
    destination =  destination.replace('/templates/', '/instances/create/');
    window.open(destination, '_blank');
  }

  // copy stuff in tabs to browser's clipboard
  copyToClipboard(elementId: string, buttonId: string) {

    function copyToClip(str) {
      function listener(e) {
        e.clipboardData.setData('text/html', str);
        e.clipboardData.setData('text/plain', str);
        e.preventDefault();
      }

      document.addEventListener('copy', listener);
      document.execCommand('copy');
      document.removeEventListener('copy', listener);
    }

    const elm = document.getElementById(elementId);
    const data = elm ? elm.innerHTML : null;
    if (data) {

      const selBox = document.createElement('textarea');
      selBox.style.position = 'fixed';
      selBox.style.left = '0';
      selBox.style.top = '0';
      selBox.style.opacity = '0';
      selBox.value = data;
      document.body.appendChild(selBox);
      selBox.focus();
      selBox.select();
      copyToClip(data);
      document.body.removeChild(selBox);

      const btn = document.getElementById(buttonId);
      if (btn) {
        btn.innerHTML = 'Copied';
        setTimeout(() => {
          btn.innerHTML = 'Copy';
        }, 10000);
      }
    }
  }


}


