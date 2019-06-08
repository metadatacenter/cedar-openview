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
}


