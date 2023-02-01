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
import { ServerDebugPageComponent } from '@app/pages/server-debug-page/server-debug-page.component';
import { BackButtonComponent } from './components/back-button/back-button.component';
import { FoundHintsCounterComponent } from './components/found-hints-counter/found-hints-counter.component';
import { GameCardComponent } from './components/game-card/game-card.component';
import { HintComponent } from './components/hint/hint.component';
import { ImagesAreaComponent } from './components/images-area/images-area.component';
import { InfoCardComponent } from './components/info-card/info-card.component';
import { NextPageButtonComponent } from './components/next-page-button/next-page-button.component';
import { OverlayComponent } from './components/overlay/overlay.component';
import { PreviousPageButtonComponent } from './components/previous-page-button/previous-page-button.component';
import { TimerComponent } from './components/timer/timer.component';
import { ClassicPageComponent } from './pages/classic-page/classic-page.component';
import { ConfigurationPageComponent } from './pages/configuration-page/configuration-page.component';
import { RegistrationPageComponent } from './pages/registration-page/registration-page.component';
import { SelectionsPageComponent } from './pages/selections-page/selections-page.component';
import { AuthService } from './services/auth.service';
import { QuitButtonComponent } from './components/quit-button/quit-button.component';
import { ChatComponent } from './components/chat/chat.component';
import { MouseComponent } from './components/mouse/mouse.component';
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
        ConfigurationPageComponent,
        OverlayComponent,
        PreviousPageButtonComponent,
        NextPageButtonComponent,
        GameCardComponent,
        BackButtonComponent,
        ClassicPageComponent,
        SelectionsPageComponent,
        HintComponent,
        InfoCardComponent,
        ServerDebugPageComponent,
        RegistrationPageComponent,
        FoundHintsCounterComponent,
        ImagesAreaComponent,
        TimerComponent,
        QuitButtonComponent,
        ChatComponent,
        MouseComponent,
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
    providers: [AuthService],
    bootstrap: [AppComponent],
})
export class AppModule {}
