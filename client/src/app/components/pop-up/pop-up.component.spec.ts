import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatchType } from '@common/enums/match-type';
import { PopUpComponent } from './pop-up.component';

describe('PopUpComponent', () => {
    let component: PopUpComponent;
    let fixture: ComponentFixture<PopUpComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PopUpComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PopUpComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should show confirmation pop-up correctly', () => {
        component.showConfirmationPopUp();
        expect(component.popUpInfo.length).toEqual(1);
        expect(component.popUpInfo[0].title).toEqual('VOULEZ-VOUS VRAIMENT QUITTER ?');
        expect(component.popUpInfo[0].option1).toEqual('OUI');
        expect(component.popUpInfo[0].option2).toEqual('NON');
        expect(component.popUpInfo[0].isConfirmation).toBeTruthy();
        expect(component.popUpInfo[0].isGameOver).toBeFalsy();
        expect(component.modal.nativeElement.style.display).toEqual('flex');
    });

    it('should show game over pop-up according to isWinByDefault and isSoloMode values (pt.1)', () => {
        component.showGameOverPopUp(true, true, MatchType.Solo, null, 'hello', 'world');
        expect(component.popUpInfo.length).toEqual(1);
        expect(component.popUpInfo[0].title).toContain('Félicitations vous avez remporté la partie !');
        expect(component.popUpInfo[0].option1).toEqual('Menu Principal');
        expect(component.popUpInfo[0].option2).toEqual('Reprise Vidéo');
        expect(component.popUpInfo[0].isConfirmation).toBeFalsy();
        expect(component.popUpInfo[0].isGameOver).toBeTruthy();
        expect(component.modal.nativeElement.style.display).toEqual('flex');
    });

    it('should close pop-up correctly', () => {
        component.closePopUp();
        expect(component.modal.nativeElement.style.display).toEqual('none');
    });

    it('should set popUpInfo and call showPopUp', () => {
        const username1 = 'player1';
        const username2 = 'player2';
        const isWinByDefault = false;
        const isSoloMode = false;
        spyOn(component, 'showPopUp');

        component.showGameOverPopUpLimited(username1, username2, isWinByDefault, isSoloMode);

        expect(component.popUpInfo).toEqual([
            {
                title: `Félicitations ${username1.toUpperCase() + ' ' + username2.toUpperCase()} vous avez remporté !`,
                message: 'Excellente partie !',
                option1: 'Menu Principal',
                option2: '',
                isConfirmation: false,
                isGameOver: true,
                option2Action: null,
            },
        ]);
        expect(component.showPopUp).toHaveBeenCalled();
    });

    it('should set popUpInfo and call showPopUp when isWinByDefault', () => {
        const username1 = 'player1';
        const username2 = 'player2';
        const isWinByDefault = true;
        const isSoloMode = false;
        spyOn(component, 'showPopUp');

        component.showGameOverPopUpLimited(username1, username2, isWinByDefault, isSoloMode);

        expect(component.popUpInfo).toEqual([
            {
                title: `Félicitations ${username1.toUpperCase()} vous avez remporté !`,
                message: 'Votre partenaire a quitté la partie...',
                option1: 'Menu Principal',
                option2: '',
                isConfirmation: false,
                isGameOver: true,
                option2Action: null,
            },
        ]);
        expect(component.showPopUp).toHaveBeenCalled();
    });

    it('should set popUpInfo and call showPopUp when !isWinByDefault', () => {
        const username1 = 'player1';
        const username2 = 'player2';
        const isWinByDefault = false;
        const isSoloMode = true;
        spyOn(component, 'showPopUp');

        component.showGameOverPopUpLimited(username1, username2, isWinByDefault, isSoloMode);

        expect(component.popUpInfo).toEqual([
            {
                title: `Félicitations ${username1.toUpperCase()} vous avez remporté !`,
                message: 'Excellente partie !',
                option1: 'Menu Principal',
                option2: '',
                isConfirmation: false,
                isGameOver: true,
                option2Action: null,
            },
        ]);
        expect(component.showPopUp).toHaveBeenCalled();
    });

    it('should set up the game over popup with the correct messages and options', () => {
        // Set up mock data
        const isWinByDefault = true;
        const isTimerDepleted = false;
        const matchType = MatchType.LimitedCoop;
        const startReplayAction = null; // Create a mock function

        const username1 = 'John';
        const username2 = 'Doe';

        // Call the method being tested
        component.showGameOverPopUp(isWinByDefault, isTimerDepleted, matchType, startReplayAction, username1, username2);

        // Assert that the popup info was set up correctly
        expect(component.popUpInfo.length).toBe(1);

        const popUp = component.popUpInfo[0];
        expect(popUp.title).toBe('Félicitations John et DOE vous avez remporté la partie !');
        expect(popUp.message).toBe('Votre adversaire a quitté la partie...');
        expect(popUp.option1).toBe('Menu Principal');
        expect(popUp.option2).toBe('');
        expect(popUp.isConfirmation).toBe(false);
        expect(popUp.isGameOver).toBe(true);
        expect(popUp.option2Action).toBe(startReplayAction);
    });

    it('should set popUpInfo and call showPopUp', () => {
        const username1 = 'player1';
        const username2 = 'player2';
        const isWinByDefault = false;
        const isTimerDepleted = true;
        spyOn(component, 'showPopUp');

        component.showGameOverPopUp(isWinByDefault, isTimerDepleted, MatchType.LimitedSolo, null, username1, username2);

        expect(component.popUpInfo).toEqual([
            {
                title: 'Le temps est écoulé!',
                message: 'Dommage...',
                option1: 'Menu Principal',
                option2: '',
                isConfirmation: false,
                isGameOver: true,
                option2Action: null,
            },
        ]);
        expect(component.showPopUp).toHaveBeenCalled();
    });
});
