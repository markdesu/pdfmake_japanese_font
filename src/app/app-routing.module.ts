import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthguardService as Authguard } from './services/authguard.service';
import { SystemguardService } from './services/systemguard.service';

const routes: Routes = [
    { path: '', redirectTo: 'home',pathMatch: 'full'},
    { path: 'home',                                  loadChildren: './pages/home/home.module#HomePageModule'},
    { path: 'login',                                 loadChildren: './pages/login/login.module#LoginPageModule'},
    { path: 'reissue-password',                      loadChildren: './pages/reissue-password/reissue-password.module#ReissuePasswordPageModule' },

    { path: 'dashboard',                             loadChildren: './pages/dashboard/dashboard.module#DashboardPageModule',  canActivate:[Authguard]},
    { path: 'qrscanner',                             loadChildren: './pages/features/qrscanner/qrscanner.module#QrscannerPageModule'},
    { path: 'manual',                                loadChildren: './pages/manual/manual.module#ManualPageModule'},
    { path: 'vehicles',                              loadChildren: './pages/features/vehicles/vehicles.module#VehiclesPageModule', canActivate:[Authguard]},
    { path: 'inspection-logs',                       loadChildren: './pages/padmin/inspection-logs/inspection-logs.module#InspectionLogsPageModule' , canActivate:[Authguard]}, 
    { path: 'weighing-detail/:id/:provider/:access', loadChildren: './pages/features/weighing-detail/weighing-detail.module#WeighingDetailPageModule', canActivate:[Authguard]},
    
    // Report 
    { path: 'generate-report',                       loadChildren: './pages/features/generate-report/generate-report.module#GenerateReportPageModule' , canActivate:[Authguard]},
    { path: 'totalresult',                           loadChildren: './pages/reports/totalresult/totalresult.module#TotalresultPageModule', canActivate:[Authguard]},
    { path: 'report-ship',                           loadChildren: './pages/reports/adminreport-ship/adminreport-ship.module#AdminreportShipPageModule' , canActivate:[Authguard]},
    { path: 'report-ledger',                         loadChildren: './pages/reports/adminreport-ledger/adminreport-ledger.module#AdminreportLedgerPageModule', canActivate:[Authguard]},
    { path: 'shipyard',                              loadChildren: './pages/reports/shipyard/shipyard.module#ShipyardPageModule' },
    { path: 'report-shipaggregate',                  loadChildren: './pages/reports/ship-aggregate/ship-aggregate.module#ShipAggregatePageModule', canActivate:[Authguard] },  
    { path: 'report-shipaggregatelist',              loadChildren: './pages/reports/ship-aggregatelist/ship-aggregatelist.module#ShipAggregatelistPageModule', canActivate:[Authguard] },
    
    // Management 
    { path: 'mng-users',                             loadChildren: './pages/padmin/mng-comusers/mng-comusers.module#MngComusersPageModule', canActivate:[Authguard]},
    { path: 'user-setting',                          loadChildren: './pages/user-setting/user-setting.module#UserSettingPageModule', canActivate:[Authguard]},

    // Service admin
    { path: 'serviceadmin/index',                    loadChildren: './pages/sysadmin/sys-login/sys-login.module#SysLoginPageModule'},
    { path: 'serviceadmin/mng-users',                loadChildren: './pages/sysadmin/mng-users/mng-users.module#MngUsersPageModule',  canActivate:[SystemguardService]},
    { path: 'serviceadmin/mng-company',              loadChildren: './pages/sysadmin/mng-company/mng-company.module#MngCompanyPageModule',  canActivate:[SystemguardService]},
    { path: 'serviceadmin/mng-contracts',            loadChildren: './pages/sysadmin/mng-contracts/mng-contracts.module#MngContractsPageModule',  canActivate:[SystemguardService]},

    { path: '404',                                   loadChildren: './pages/error-page/error-page.module#ErrorPagePageModule' },
    { path: '**', redirectTo: '/404'},
 
  ];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}


  // { path: 'weighing',                              loadChildren: './pages/features/weighing/weighing.module#WeighingPageModule' , canActivate:[Authguard]  },
  // { path: 'report-aggregateship',                  loadChildren: './pages/reports/aggregateship/aggregateship.module#AggregateshipPageModule' , canActivate:[Authguard]},
  // { path: 'report-discreteship',                   loadChildren: './pages/reports/discreteship/discreteship.module#DiscreteshipPageModule' , canActivate:[Authguard]},
  // { path: 'weighing-detail/:id/:provider',         loadChildren: './pages/features/weighing-detail/weighing-detail.module#WeighingDetailPageModule' },
  // { path: 'error-page',                            loadChildren: './pages/error-page/error-page.module#ErrorPagePageModule' },
  // { path: 'mng-inspectors',                        loadChildren: './pages/padmin/mng-inspectors/mng-inspectors.module#MngInspectorsPageModule' , canActivate:[Authguard]},
  // { path: 'inspection/login',                      loadChildren: './pages/ins-login/ins-login.module#InsLoginPageModule'},