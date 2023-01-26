import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClassicPageComponent } from '@app/pages/classic-page/classic-page.component';
import { ConfigurationPageComponent } from '@app/pages/configuration-page/configuration-page.component';
import { LimitedTimePageComponent } from '@app/pages/limited-time-page/limited-time-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { RegistrationPageComponent } from '@app/pages/registration-page/registration-page.component';
import { SelectionsPageComponent } from '@app/pages/selections-page/selections-page.component';
import { ServerDebugPageComponent } from '@app/pages/server-debug-page/server-debug-page.component';

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: MainPageComponent },
    { path: 'selections', component: SelectionsPageComponent },
    { path: 'registration', component: RegistrationPageComponent },
    { path: 'classic', component: ClassicPageComponent },
    { path: 'limited-time', component: LimitedTimePageComponent },
    { path: 'config', component: ConfigurationPageComponent },
    { path: 'server-debug', component: ServerDebugPageComponent },
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
