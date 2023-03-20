/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { HttpClientTestingModule } from '@angular/common/http/testing';
// import { ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SpinnerComponent } from '@app/components/spinner/spinner.component';
import { GameCreationPageComponent } from '@app/pages/game-creation-page/game-creation-page.component';
import { EntireGameUploadForm } from '@common/entire.game.upload.form';
import { Vector2 } from '@common/vector2';
import { CreationResultModalComponent } from './creation-result-modal.component';

describe('CreationResultModalComponent', () => {
    let component: CreationResultModalComponent;
    let fixture: ComponentFixture<CreationResultModalComponent>;
    // let imagePreview: jasmine.SpyObj<ElementRef<HTMLCanvasElement>>;
    const maxNumberOfDifferences = 9;
    const minNumberOfDifferences = 3;

    // let onloadRef: Function | undefined;
    // Object.defineProperty(Image.prototype, 'onload', {
    //     get() {
    //         return this.onload;
    //     },
    //     set(onload: Function) {
    //         onloadRef = onload;
    //         this.onload = onload;
    //     },
    // });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule],
            declarations: [CreationResultModalComponent, SpinnerComponent, GameCreationPageComponent],
            // providers: [{ provide: ElementRef, useValue: imagePreview }],
        }).compileComponents();

        fixture = TestBed.createComponent(CreationResultModalComponent);
        component = fixture.componentInstance;
        component.modal = jasmine.createSpyObj('ElementRef', ['nativeElement']);
        component.errorPopupText = jasmine.createSpyObj('ElementRef', ['nativeElement']);

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should show the pop-up', () => {
        component.modal = { nativeElement: { style: { display: 'none' } } };
        component.showPopUp();
        expect(component.modal.nativeElement.style.display).toBe('flex');
        expect(component.errorPopupText.nativeElement.style.display).toBe('none');
    });

    it('should show the error pop-up', () => {
        component.modal = { nativeElement: { style: { display: 'none' } } };
        component.errorPopupText = { nativeElement: { style: { display: 'none' } } };
        component.showPopUp();
        expect(component.modal.nativeElement.style.display).toBe('flex');
        expect(component.errorPopupText.nativeElement.style.display).toBe('none');
    });

    it('should close the pop-up', () => {
        component.modal = { nativeElement: { style: { display: 'flex' } } };
        component.closePopUp();
        expect(component.modal.nativeElement.style.display).toBe('none');
    });

    it('should show the game name form', () => {
        const game: EntireGameUploadForm = {
            gameId: 1,
            firstImage: { background: [1, 2, 3, 4, 5, 6, 7], foreground: [5, 7, 8, 9, 7, 2, 4] },
            secondImage: { background: [1, 2, 3, 4, 5, 6, 7], foreground: [5, 7, 8, 9, 7, 2, 4] },
            differences: [[new Vector2(1, 2)], [new Vector2(1, 2)], [new Vector2(1, 2)]],
            gameName: 'myLastGame',
            isEasy: true,
        };
        component.gameNameForm = { nativeElement: { style: { display: 'none' } } };
        component.showGameNameForm(4, game);
        expect(component.gameNameForm.nativeElement.style.display).toBe('flex');
    });

    it('should returns false if totalDifferences is less than minNumberOfDifferences', () => {
        component.totalDifferences = minNumberOfDifferences - 1;
        expect(component.isNumberOfDifferencesValid(component.totalDifferences)).toBe(false);
    });

    it('should returns false if totalDifferences is greater than maxNumberOfDifferences', () => {
        component.totalDifferences = maxNumberOfDifferences + 1;
        expect(component.isNumberOfDifferencesValid(component.totalDifferences)).toBe(false);
    });

    // it('updates the image display on the canvas', () => {
    //     const byteArray = [1, 2];
    //     const buffer = new ArrayBuffer(byteArray.length);
    //     const imgData = new Uint8Array(buffer);
    //     const canvas = document.createElement('canvas');
    //     imagePreview = { nativeElement: canvas };

    //     const img = new Image();
    //     img.src = URL.createObjectURL(new Blob([imgData]));
    //     component.updateImageDisplay(imgData);
    //     onloadRef?.();
    //     expect(imagePreview).toEqual({ nativeElement: canvas });
    // });
});
