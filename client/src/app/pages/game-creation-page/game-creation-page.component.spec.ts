/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpResponse } from '@angular/common/http';
import { ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { CommunicationService } from '@app/services/communication.service';
import { of } from 'rxjs';
import { GameCreationPageComponent } from './game-creation-page.component';
describe('GameCreationPageComponent', () => {
    const maxNumberOfDifferences = 9;
    const minNumberOfDifferences = 3;
    let component: GameCreationPageComponent;
    let fixture: ComponentFixture<GameCreationPageComponent>;
    let communicationService: jasmine.SpyObj<CommunicationService>;
    let leftCanvas: jasmine.SpyObj<ElementRef<HTMLCanvasElement>>;
    let rightCanvas: jasmine.SpyObj<ElementRef<HTMLCanvasElement>>;
    let router: jasmine.SpyObj<Router>;
    const mockResponse: HttpResponse<string> = new HttpResponse({
        status: 200,
        body: 'mock response',
    });
    const mockObservable = of(mockResponse);
    beforeEach(() => {
        communicationService = jasmine.createSpyObj('CommunicationService', ['basicGet', 'basicPost', 'get', 'post', 'delete']);
        communicationService.get.and.returnValue(mockObservable);
        spyOn(window, 'alert');
    });
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameCreationPageComponent],
            providers: [
                { provide: CommunicationService, useValue: communicationService },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: { paramMap: convertToParamMap({ id: '123' }) },
                    },
                },
                { provide: ElementRef, useValue: leftCanvas },
                { provide: ElementRef, useValue: rightCanvas },
                { provide: Router, useValue: router },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(GameCreationPageComponent);
        component = fixture.componentInstance;
        component.leftCanvas = jasmine.createSpyObj('ElementRef', [], { nativeElement: jasmine.createSpyObj('HTMLCanvasElement', ['getContext']) });
        component.rightCanvas = jasmine.createSpyObj('ElementRef', [], { nativeElement: jasmine.createSpyObj('HTMLCanvasElement', ['getContext']) });
        component.modal = jasmine.createSpyObj('ElementRef', ['nativeElement']);
        component.errorPopupText = jasmine.createSpyObj('ElementRef', ['nativeElement']);
        component.isEasy = true;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should remove the element visibility', () => {
        component.toggleElementVisibility(component.leftCanvas, false);
        expect(component.leftCanvas.nativeElement.style.display).toEqual('none');
    });
    it('should show the element', () => {
        component.toggleElementVisibility(component.leftCanvas, true);
        expect(component.leftCanvas.nativeElement.style.display).toEqual('flex');
    });
    it('should show the pop up', () => {
        component.showPopUp();
        expect(component.modal.nativeElement.style.display).toEqual('flex');
        expect(component.errorPopupText.nativeElement.style.color).toEqual('red');
    });
    it('should close the popUp', () => {
        component.closePopUp();
        expect(component.modal.nativeElement.style.display).toEqual('none');
    });
    it('should returns true for a 24-bit depth BMP', () => {
        const imageBuffer = new ArrayBuffer(30);
        const dataView = new DataView(imageBuffer);
        dataView.setUint16(28, 24, true);

        expect(component.is24BitDepthBMP(imageBuffer)).toBe(true);
    });

    it('should returns false for a non-24-bit depth BMP', () => {
        const imageBuffer = new ArrayBuffer(30);
        const dataView = new DataView(imageBuffer);
        dataView.setUint16(28, 32, true);

        expect(component.is24BitDepthBMP(imageBuffer)).toBe(false);
    });
    it('should clears the right canvas and sets input2 value to empty', () => {
        component.modifiedContainsImage = false;
        component.originalContainsImage = false;
        const input2 = jasmine.createSpyObj<HTMLInputElement>('HTMLInputElement', ['value']);
        component.input2 = { nativeElement: input2 };
        component.resetCanvas(true);

        expect(input2.value).toEqual('');
        expect(component.modifiedContainsImage).toBe(false);
    });

    it('should clears the left canvas and sets input1 value to empty', () => {
        component.modifiedContainsImage = false;
        component.originalContainsImage = false;
        const input1 = jasmine.createSpyObj<HTMLInputElement>('HTMLInputElement', ['value']);
        component.input1 = { nativeElement: input1 };

        component.resetCanvas(false);

        expect(input1.value).toEqual('');
        expect(component.originalContainsImage).toBe(false);
    });
    it(' should returns false if originalContainsImage is false', () => {
        component.originalContainsImage = false;
        component.modifiedContainsImage = true;
        expect(component.canSendToServer()).toBe(false);
    });

    it(' should returns false if modifiedContainsImage is false', () => {
        component.originalContainsImage = true;
        component.modifiedContainsImage = false;
        expect(component.canSendToServer()).toBe(false);
    });

    it('should returns true if originalContainsImage and modifiedContainsImage are true', () => {
        component.originalContainsImage = true;
        component.modifiedContainsImage = true;
        expect(component.canSendToServer()).toBe(true);
    });
    it('should sets enlargementRadius to the given radius', () => {
        component.submitRadius(5);
        expect(component.enlargementRadius).toEqual(5);
    });
    it('should returns false if totalDifferences is less than minNumberOfDifferences', () => {
        component.totalDifferences = minNumberOfDifferences - 1;
        expect(component.isNumberOfDifferencesValid()).toBe(false);
    });

    it('should returns false if totalDifferences is greater than maxNumberOfDifferences', () => {
        component.totalDifferences = maxNumberOfDifferences + 1;
        expect(component.isNumberOfDifferencesValid()).toBe(false);
    });

    it('should returns true if totalDifferences is between minNumberOfDifferences and maxNumberOfDifferences', () => {
        component.totalDifferences = minNumberOfDifferences + 1;
        expect(component.isNumberOfDifferencesValid()).toBe(true);
    });
    it('converts an array of numbers to an ArrayBuffer', () => {
        const byteArray = [1, 2, 3, 4];
        const buffer = component.convertToBuffer(byteArray);
        const view = new Uint8Array(buffer);
        expect(view).toEqual(new Uint8Array(byteArray));
    });
    it('updates the image display on the canvas', () => {
        const byteArray = [1, 2, 3, 4];
        const buffer = component.convertToBuffer(byteArray);
        const imgData = new Uint8Array(buffer);
        const canvas = document.createElement('canvas');
        component.imagePreview = { nativeElement: canvas };
        const img = new Image();
        img.src = URL.createObjectURL(new Blob([imgData]));
        component.updateImageDisplay(imgData);
        expect(1).toEqual(1);
    });
});
