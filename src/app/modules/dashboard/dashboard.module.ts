import {NgModule} from "@angular/core";
import {SharedModule} from "../shared";
import {DashboardRoutingModule} from "./dashboard-routing.module";
import {DashboardComponent} from "./pages/dashboard/dashboard.component";

@NgModule({
  declarations: [
    DashboardComponent
  ],
  imports: [
    SharedModule,
    DashboardRoutingModule
  ],
  exports: [],
  providers: [],
  entryComponents: []
})
export class DashboardModule {
}
