import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatGridListModule } from '@angular/material/grid-list';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { AppComponent } from '@app/pages/app/app.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { BackButtonComponent } from './components/back-button/back-button.component';
import { GameCardComponent } from './components/game-card/game-card.component';
import { GameSheetComponent } from './components/game-sheet/game-sheet.component';
import { HintComponent } from './components/hint/hint.component';
import { InfoIconComponent } from './components/info-icon/info-icon.component';
import { NextPageButtonComponent } from './components/next-page-button/next-page-button.component';
import { OverlayComponent } from './components/overlay/overlay.component';
import { PreviousPageButtonComponent } from './components/previous-page-button/previous-page-button.component';
import { ClassicPageComponent } from './pages/classic-page/classic-page.component';
import { ConfigurationPageComponent } from './pages/configuration-page/configuration-page.component';
import { SelectionsPageComponent } from './pages/selections-page/selections-page.component';
import { ServerDebugPageComponent } from '@app/pages/server-debug-page/server-debug-page.component';

/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */
@NgModule({
    declarations: [
        AppComponent,
        MainPageComponent,
        GameSheetComponent,
        ConfigurationPageComponent,
        OverlayComponent,
        PreviousPageButtonComponent,
        NextPageButtonComponent,
        GameCardComponent,
        BackButtonComponent,
        ClassicPageComponent,
        SelectionsPageComponent,
        HintComponent,
        InfoIconComponent,
        ServerDebugPageComponent
    ],
    imports: [
        AppMaterialModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        HttpClientModule,
        MatGridListModule,
        ReactiveFormsModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
