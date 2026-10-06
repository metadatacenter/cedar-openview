import {Injectable} from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class UiService {

  openInCedar() {
    let destination = window.location.href;
    console.log(destination);
    destination = window.location.href.replace('openview', 'cedar');
    console.log(destination);
    destination = destination.replace('/templates/', '/templates/edit/');
    destination = destination.replace('/template-elements/', '/elements/edit/');
    destination = destination.replace('/template-fields/', '/fields/edit/');
    destination = destination.replace('/template-instances/', '/instances/edit/');
    console.log(destination);
    this.openUrlInBlank(destination);
  }

  openUrlInBlank(destination: string) {
    window.open(destination, '_blank');
  }
}
