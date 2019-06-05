import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {InstanceComponent} from './components/instance/instance.component';

const routes: Routes = [
  {
    path: '',
    component: InstanceComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MetadataEditorRoutingModule {
}
