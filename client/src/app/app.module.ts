import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
<<<<<<< HEAD
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
=======
import { FormsModule } from '@angular/forms';
import { MatGridListModule } from '@angular/material/grid-list';
>>>>>>> feature/selection-view
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { AppComponent } from '@app/pages/app/app.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
<<<<<<< HEAD
import { MaterialPageComponent } from '@app/pages/material-page/material-page.component';
import { RegistrationPageComponent } from './pages/registration-page/registration-page.component';
=======
import { BackButtonComponent } from './components/back-button/back-button.component';
import { GameCardComponent } from './components/game-card/game-card.component';
import { NextPageButtonComponent } from './components/next-page-button/next-page-button.component';
import { OverlayComponent } from './components/overlay/overlay.component';
import { PreviousPageButtonComponent } from './components/previous-page-button/previous-page-button.component';
>>>>>>> feature/selection-view
import { SelectionsPageComponent } from './pages/selections-page/selections-page.component';

/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */
@NgModule({
    declarations: [
        AppComponent,
<<<<<<< HEAD
        GamePageComponent,
        MainPageComponent,
        MaterialPageComponent,
        PlayAreaComponent,
        SidebarComponent,
        SelectionsPageComponent,
        RegistrationPageComponent,
    ],
    imports: [AppMaterialModule, AppRoutingModule, BrowserAnimationsModule, BrowserModule, FormsModule, HttpClientModule, ReactiveFormsModule],
=======
        MainPageComponent,
        SelectionsPageComponent,
        BackButtonComponent,
        PreviousPageButtonComponent,
        NextPageButtonComponent,
        GameCardComponent,
        OverlayComponent,
    ],
    imports: [AppMaterialModule, AppRoutingModule, BrowserAnimationsModule, BrowserModule, FormsModule, HttpClientModule, MatGridListModule],
>>>>>>> feature/selection-view
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
