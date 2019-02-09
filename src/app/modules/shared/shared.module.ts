import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {SpinnerComponent} from './components/spinner/spinner.component';
import {DashboardComponent} from './pages/dashboard/dashboard.component';
import {ArtifactHeaderComponent} from './components/artifact-header/artifact-header.component';
import {NavbarComponent} from './components/navbar/navbar.component';
import {JsonViewComponent} from './components/json-view/json-view.component';
import {ArtifactErrorComponent} from './components/artifact-error/artifact-error.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    TranslateModule
  ],
  declarations: [
    SpinnerComponent,
    DashboardComponent,
    ArtifactHeaderComponent,
    ArtifactErrorComponent,
    NavbarComponent,
    JsonViewComponent
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    TranslateModule,
    SpinnerComponent,
    ArtifactHeaderComponent,
    ArtifactErrorComponent,
    NavbarComponent,
    JsonViewComponent
  ]
})
export class SharedModule {
}
