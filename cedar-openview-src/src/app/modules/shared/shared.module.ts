import {CedarIconDirective} from './directives/cedar-icon.directive';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {TranslateModule} from '@ngx-translate/core';
import {SpinnerComponent} from './components/spinner/spinner.component';
import {DashboardComponent} from './pages/dashboard/dashboard.component';
import {NavbarComponent} from './components/navbar/navbar.component';
import {ArtifactErrorComponent} from './components/artifact-error/artifact-error.component';
import {MaterialModule} from '../../modules/material-module';
import {LegendComponent} from './components/legend/legend.component';
import {FooterComponent} from './components/footer/footer.component';
import {ViewHeaderComponent} from './components/view-header/view-header.component';


@NgModule({
  imports: [
    CedarIconDirective,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    TranslateModule,
    MaterialModule,

  ],
  declarations: [
    SpinnerComponent,
    DashboardComponent,
    ArtifactErrorComponent,
    NavbarComponent,
    ViewHeaderComponent,
    FooterComponent,
    LegendComponent,
  ],
  exports: [
    CedarIconDirective,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    TranslateModule,
    SpinnerComponent,
    ArtifactErrorComponent,
    NavbarComponent,
    ViewHeaderComponent,
    FooterComponent,
    LegendComponent,
  ]
})
export class SharedModule {
}
