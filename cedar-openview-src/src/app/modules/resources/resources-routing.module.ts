import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {TemplateComponent} from './pages/template/template.component';
import {TemplateElementComponent} from './pages/template-element/template-element.component';
import {TemplateFieldComponent} from './pages/template-field/template-field.component';
import {TemplateInstanceComponent} from './pages/template-instance/template-instance.component';
import {FolderContentComponent} from './pages/folder-content/folder-content.component';

export const routes: Routes = [
  {
    path: 'templates/:templateId',
    component: TemplateComponent
  },
  {
    path: 'template-elements/:templateElementId',
    component: TemplateElementComponent
  },
  {
    path: 'template-fields/:templateFieldId',
    component: TemplateFieldComponent
  },
  {
    path: 'template-instances/:templateInstanceId',
    component: TemplateInstanceComponent
  },
  {
    path: 'folders/:folderId',
    component: FolderContentComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ResourcesRoutingModule {
}
