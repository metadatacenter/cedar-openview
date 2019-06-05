import { Component , OnInit} from '@angular/core';

@Component ({
  selector : 'app-footer',
  templateUrl: './footer.component.html'
})

export class FooterComponent implements OnInit {
  title: string;

  constructor() {}

  ngOnInit() {
    this.title = 'Metadata Editor';
  }
}
