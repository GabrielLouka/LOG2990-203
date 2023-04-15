// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { MatchType } from '@common/enums/match-type';
// import { PopUpComponent } from './pop-up.component';

// describe('PopUpComponent', () => {
//     let component: PopUpComponent;
//     let fixture: ComponentFixture<PopUpComponent>;

//     beforeEach(async () => {
//         await TestBed.configureTestingModule({
//             declarations: [PopUpComponent],
//         }).compileComponents();
//     });

//     beforeEach(() => {
//         fixture = TestBed.createComponent(PopUpComponent);
//         component = fixture.componentInstance;
//         fixture.detectChanges();
//     });

//     it('should create the component', () => {
//         expect(component).toBeTruthy();
//     });

//     it('should show confirmation pop-up correctly', () => {
//         component.showConfirmationPopUp();
//         expect(component.popUpInfo.length).toEqual(1);
//         expect(component.popUpInfo[0].title).toEqual('VOULEZ-VOUS VRAIMENT QUITTER ?');
//         expect(component.popUpInfo[0].option1).toEqual('OUI');
//         expect(component.popUpInfo[0].option2).toEqual('NON');
//         expect(component.popUpInfo[0].isConfirmation).toBeTruthy();
//         expect(component.popUpInfo[0].isGameOver).toBeFalsy();
//         expect(component.modal.nativeElement.style.display).toEqual('flex');
//     });

//     it('should show game over pop-up according to isWinByDefault and isSoloMode values (pt.1)', () => {
//         component.showGameOverPopUp(true, true, MatchType.Solo, null, 'hello', 'world');
//         expect(component.popUpInfo.length).toEqual(1);
//         expect(component.popUpInfo[0].title).toContain('Félicitations TEST USER vous avez remporté !');
//         expect(component.popUpInfo[0].option1).toEqual('Menu Principal');
//         expect(component.popUpInfo[0].option2).toEqual('Reprise Vidéo');
//         expect(component.popUpInfo[0].isConfirmation).toBeFalsy();
//         expect(component.popUpInfo[0].isGameOver).toBeTruthy();
//         expect(component.modal.nativeElement.style.display).toEqual('flex');
//     });

//     it('should show game over pop-up according to isWinByDefault and isSoloMode values (pt.2)', () => {
//         component.showGameOverPopUp(true, true, MatchType.Solo, null, 'hello', 'world');
//         expect(component.popUpInfo.length).toEqual(1);
//         expect(component.popUpInfo[0].title).toContain('Félicitations TEST USER vous avez remporté !');
//         expect(component.popUpInfo[0].option1).toEqual('Menu Principal');
//         expect(component.popUpInfo[0].option2).toEqual('Reprise Vidéo');
//         expect(component.popUpInfo[0].isConfirmation).toBeFalsy();
//         expect(component.popUpInfo[0].isGameOver).toBeTruthy();
//         expect(component.modal.nativeElement.style.display).toEqual('flex');
//     });

//     it('should close pop-up correctly', () => {
//         component.closePopUp();
//         expect(component.modal.nativeElement.style.display).toEqual('none');
//     });
// });
