import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {SharedModule} from '../shared';
import {ResourcesRoutingModule} from './resources-routing.module';
import {TemplateComponent} from './pages/template/template.component';
import {TemplateElementComponent} from './pages/template-element/template-element.component';
import {TemplateFieldComponent} from './pages/template-field/template-field.component';
import {TemplateInstanceComponent} from './pages/template-instance/template-instance.component';
import {MaterialModule} from '../material-module';
import {FolderContentComponent} from './pages/folder-content/folder-content.component';


@NgModule({
  declarations: [
    TemplateFieldComponent,
    TemplateElementComponent,
    TemplateComponent,
    TemplateInstanceComponent,
    FolderContentComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    SharedModule,
    ResourcesRoutingModule,
    MaterialModule
  ],
  exports: [],
  providers: [],
})
export class ResourcesModule {
}
