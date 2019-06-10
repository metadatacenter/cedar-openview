import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs/index';


@Injectable({
  providedIn: 'root'
})
export class UiService {

  public title: string;
  public description: string;
  public hasTitle: BehaviorSubject<string> = new BehaviorSubject('');
  public hasDescription: BehaviorSubject<string> = new BehaviorSubject('');

  constructor() {
  }

  public setTitleAndDescription(title: string, description: string) {
    this.title = title;
    this.hasTitle.next(this.title);
    this.description = description;
    this.hasDescription.next(this.description);
  }

  openInCedar() {
    let destination = window.location.href;
    destination = window.location.href.replace('open-metadata', 'cedar');
    destination =  destination.replace('/instances/', '/instances/edit/');
    destination =  destination.replace('/template-elements/', '/elements/edit/');
    destination =  destination.replace('/fields/', '/fields/edit/');
    destination =  destination.replace('/templates/', '/instances/create/');
    window.open(destination, '_blank');
  }
}


