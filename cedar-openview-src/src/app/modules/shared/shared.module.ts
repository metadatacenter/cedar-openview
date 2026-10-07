import {CedarIconDirective} from './directives/cedar-icon.directive';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {SpinnerComponent} from './components/spinner/spinner.component';
import {DashboardComponent} from './pages/dashboard/dashboard.component';
import {NavbarComponent} from './components/navbar/navbar.component';
import {ArtifactErrorComponent} from './components/artifact-error/artifact-error.component';
import {MaterialModule} from '../../modules/material-module';
import {LegendComponent} from './components/legend/legend.component';
import {FooterComponent} from './components/footer/footer.component';
import {ArtifactHeadingComponent} from './components/artifact-heading/artifact-heading.component';


@NgModule({
  imports: [
    CedarIconDirective,
    CommonModule,
    TranslateModule,
    MaterialModule,

  ],
  declarations: [
    SpinnerComponent,
    DashboardComponent,
    ArtifactErrorComponent,
    NavbarComponent,
    FooterComponent,
    LegendComponent,
    ArtifactHeadingComponent,
  ],
  exports: [
    CedarIconDirective,
    CommonModule,
    TranslateModule,
    SpinnerComponent,
    ArtifactErrorComponent,
    NavbarComponent,
    FooterComponent,
    LegendComponent,
    ArtifactHeadingComponent,
  ]
})
export class SharedModule {
}
