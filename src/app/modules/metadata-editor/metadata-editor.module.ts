import {ReactiveFormsModule} from '@angular/forms';
import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {SharedModule} from '../shared';
import {DemoMaterialModule} from '../material-module';
import {InstanceComponent} from './components/instance/instance.component';
import {MetadataEditorRoutingModule} from './metadata-editor-routing.module';
import {CedarMetadataFormModule} from '../cedar-metadata-form/cedar-metadata-form.module';
// import {NgxYoutubePlayerModule} from 'ngx-youtube-player';
// import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';

@NgModule({
  declarations: [
    InstanceComponent],

  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
  imports: [
    ReactiveFormsModule,
    CommonModule,
    NgbModule,
    MetadataEditorRoutingModule,
    DemoMaterialModule,
    SharedModule,
    CedarMetadataFormModule,
    // FontAwesomeModule
  ],
  exports: [
    InstanceComponent
  ],
  providers: [],
})
export class MetadataEditorModule {
}
