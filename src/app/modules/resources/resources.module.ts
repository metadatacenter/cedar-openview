import {NgModule} from "@angular/core";
import {SharedModule} from "../shared";
import {ResourcesRoutingModule} from "./resources-routing.module";
import {TemplateComponent} from "./pages/template/template.component";
import {TemplateElementComponent} from "./pages/template-element/template-element.component";
import {TemplateFieldComponent} from "./pages/template-field/template-field.component";
import {TemplateInstanceComponent} from "./pages/template-instance/template-instance.component";

@NgModule({
  declarations: [
    TemplateFieldComponent,
    TemplateElementComponent,
    TemplateComponent,
    TemplateInstanceComponent
  ],
  imports: [
    SharedModule,
    ResourcesRoutingModule
  ],
  exports: [],
  providers: [],
  entryComponents: []
})
export class ResourcesModule {
}
