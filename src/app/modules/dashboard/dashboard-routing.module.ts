import {RouterModule, Routes} from "@angular/router";
import {NgModule} from "@angular/core";
import {EverytimeService} from "../../services/can-activate/everytime.service";
import {DashboardComponent} from "./pages/dashboard/dashboard.component";

export const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [EverytimeService]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule {
}
