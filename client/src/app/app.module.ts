import { CommonModule } from '@angular/common';
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
import { ChatComponent } from './components/chat/chat.component';
import { CreationResultModalComponent } from './components/creation-result-modal/creation-result-modal.component';
import { FoundHintsCounterComponent } from './components/found-hints-counter/found-hints-counter.component';
import { GameCardComponent } from './components/game-card/game-card.component';
import { GamesDisplayComponent } from './components/games-display/games-display.component';
import { HintComponent } from './components/hint/hint.component';
import { InfoCardComponent } from './components/info-card/info-card.component';
import { NextPageButtonComponent } from './components/next-page-button/next-page-button.component';
import { OverlayComponent } from './components/overlay/overlay.component';
import { PopUpComponent } from './components/pop-up/pop-up.component';
import { PreviousPageButtonComponent } from './components/previous-page-button/previous-page-button.component';
import { QuitButtonComponent } from './components/quit-button/quit-button.component';
import { TimerComponent } from './components/timer/timer.component';
import { ClassicPageComponent } from './pages/classic-page/classic-page.component';
import { ConfigurationPageComponent } from './pages/configuration-page/configuration-page.component';
import { GameCreationPageComponent } from './pages/game-creation-page/game-creation-page.component';
import { ParameterPageComponent } from './pages/parameter-page/parameter-page.component';
import { RegistrationPageComponent } from './pages/registration-page/registration-page.component';
import { SelectionsPageComponent } from './pages/selections-page/selections-page.component';
import { AuthService } from './services/auth.service';
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
        RegistrationPageComponent,
        ParameterPageComponent,
        FoundHintsCounterComponent,
        TimerComponent,
        QuitButtonComponent,
        ChatComponent,
        GameCreationPageComponent,
        GamesDisplayComponent,
        CreationResultModalComponent,
        PopUpComponent,
    ],
    providers: [AuthService],
    bootstrap: [AppComponent],
    imports: [
        AppMaterialModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        HttpClientModule,
        MatGridListModule,
        ReactiveFormsModule,
        CommonModule,
    ],
})
export class AppModule {}
