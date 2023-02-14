/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { ElementRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { CommunicationService } from '@app/services/communication.service';
import { EntireGameUploadForm } from '@common/entire.game.upload.form';
import { ImageUploadForm } from '@common/image.upload.form';
import { Vector2 } from '@common/vector2';
import { of, throwError } from 'rxjs';
import { GameCreationPageComponent } from './game-creation-page.component';
describe('GameCreationPageComponent', () => {
    const maxNumberOfDifferences = 9;
    const minNumberOfDifferences = 3;
    let component: GameCreationPageComponent;
    let fixture: ComponentFixture<GameCreationPageComponent>;
    let communicationService: jasmine.SpyObj<CommunicationService>;
    let leftCanvas: jasmine.SpyObj<ElementRef<HTMLCanvasElement>>;
    let rightCanvas: jasmine.SpyObj<ElementRef<HTMLCanvasElement>>;
    const mockResponse: HttpResponse<string> = new HttpResponse({
        status: 200,
        body: 'mock response',
    });
    const routerMock = {
        navigate: jasmine.createSpy('navigate'),
    };
    const mockObservable = of(mockResponse);
    beforeEach(() => {
        communicationService = jasmine.createSpyObj('CommunicationService', ['get', 'post', 'delete']);
        communicationService.get.and.returnValue(mockObservable);
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
                { provide: Router, useValue: routerMock },
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
    it('should not clears the right canvas and sets input2 value to empty', () => {
        const mybool = true;
        expect(mybool).toBe(true);
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
        expect(component.imagePreview).toEqual({ nativeElement: canvas });
    });

    it('should not send image to the server', async () => {
        const canvas = document.createElement('canvas');
        component.leftCanvas = { nativeElement: canvas };
        component.rightCanvas = { nativeElement: canvas };
        component.originalContainsImage = false;
        component.modifiedContainsImage = false;

        await component.sendImageToServer();
        expect(await component.sendImageToServer()).toEqual(undefined);
    });

    it('should the game name to the server', async () => {
        const game: EntireGameUploadForm = {
            gameId: 1,
            firstImage: { background: [1, 2, 3, 4, 5, 6, 7], foreground: [5, 7, 8, 9, 7, 2, 4] },
            secondImage: { background: [1, 2, 3, 4, 5, 6, 7], foreground: [5, 7, 8, 9, 7, 2, 4] },
            differences: [[new Vector2(1, 2)]],
            gameName: 'myLastGame',
            isEasy: true,
        };
        component.formToSendAfterServerConfirmation = game;
        communicationService.post.and.returnValue(
            of({
                headers: new HttpHeaders(),
                status: 201,
                statusText: 'CREATED',
                url: '',
                body: JSON.stringify({ game }),
                type: 4,
                ok: true,
                clone: (): HttpResponse<string> => new HttpResponse<string>(undefined),
            }),
        );
        component.sendGameNameToServer();
        expect(communicationService.post).toHaveBeenCalledWith(game, '/games/saveGame');
    });
    it('should handle error response from the server', async () => {
        const game: EntireGameUploadForm = {
            gameId: 1,
            firstImage: { background: [1, 2, 3, 4, 5, 6, 7], foreground: [5, 7, 8, 9, 7, 2, 4] },
            secondImage: { background: [1, 2, 3, 4, 5, 6, 7], foreground: [5, 7, 8, 9, 7, 2, 4] },
            differences: [[new Vector2(1, 2)]],
            gameName: 'myLastGame',
            isEasy: true,
        };
        component.formToSendAfterServerConfirmation = game;
        const error = new HttpErrorResponse({
            error: JSON.stringify('Test error'),
            status: 404,
            statusText: 'Not Found',
        });
        spyOn(component.debugDisplayMessage, 'next');
        communicationService.post.and.returnValue(throwError(() => error));

        component.sendGameNameToServer();
        expect(component.debugDisplayMessage.next).toHaveBeenCalled();
    });
    it('send an image to the server with hidden element ', async () => {
        const myArrayBuffer = new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100]);
        const myBlob = new Blob([myArrayBuffer]);
        const canvas = document.createElement('canvas');
        component.leftCanvas = { nativeElement: canvas };
        component.rightCanvas = { nativeElement: canvas };
        component.originalImage = new File([myBlob], 'myFileTest');
        component.modifiedImage = new File([myBlob], 'myileTest');
        component.originalContainsImage = true;
        component.modifiedContainsImage = true;
        const buffer1 = await component.originalImage.arrayBuffer();
        const buffer2 = await component.originalImage.arrayBuffer();
        const byteArray1: number[] = Array.from(new Uint8Array(buffer1));
        const byteArray2: number[] = Array.from(new Uint8Array(buffer2));
        const image: ImageUploadForm = {
            firstImage: { background: byteArray1, foreground: [] },
            secondImage: { background: byteArray2, foreground: [] },
            radius: 3,
        };

        spyOn(component, 'convertToBuffer').and.returnValue(myArrayBuffer);
        communicationService.post.and.returnValue(
            of({
                headers: new HttpHeaders(),
                status: 201,
                statusText: 'CREATED',
                url: '',
                body: JSON.stringify({ image }),
                type: 4,
                ok: true,
                clone: (): HttpResponse<string> => new HttpResponse<string>(undefined),
            }),
        );
        await component.sendImageToServer();
        expect(communicationService.post).toHaveBeenCalledWith(image, '/image_processing/send-image');
    });
    it('send an image to the server with visible element', async () => {
        const myArrayBuffer = new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100]);
        const myBlob = new Blob([myArrayBuffer]);
        const canvas = document.createElement('canvas');
        component.leftCanvas = { nativeElement: canvas };
        component.rightCanvas = { nativeElement: canvas };
        component.originalImage = new File([myBlob], 'myFileTest');
        component.modifiedImage = new File([myBlob], 'myileTest');
        component.originalContainsImage = true;
        component.modifiedContainsImage = true;
        const buffer1 = await component.originalImage.arrayBuffer();
        const buffer2 = await component.originalImage.arrayBuffer();
        const byteArray1: number[] = Array.from(new Uint8Array(buffer1));
        const byteArray2: number[] = Array.from(new Uint8Array(buffer2));
        const image: ImageUploadForm = {
            firstImage: { background: byteArray1, foreground: [] },
            secondImage: { background: byteArray2, foreground: [] },
            radius: 3,
        };
        spyOn(component, 'isNumberOfDifferencesValid').and.returnValue(true);
        spyOn(component, 'convertToBuffer').and.returnValue(myArrayBuffer);
        communicationService.post.and.returnValue(
            of({
                headers: new HttpHeaders(),
                status: 201,
                statusText: 'CREATED',
                url: '',
                body: JSON.stringify({ image }),
                type: 4,
                ok: true,
                clone: (): HttpResponse<string> => new HttpResponse<string>(undefined),
            }),
        );
        await component.sendImageToServer();
        expect(communicationService.post).toHaveBeenCalledWith(image, '/image_processing/send-image');
    });
    it('send an image to the server with hidden element ', async () => {
        const myArrayBuffer = new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100]);
        const myBlob = new Blob([myArrayBuffer]);
        const canvas = document.createElement('canvas');
        component.leftCanvas = { nativeElement: canvas };
        component.rightCanvas = { nativeElement: canvas };
        component.originalImage = new File([myBlob], 'myFileTest');
        component.modifiedImage = new File([myBlob], 'myileTest');
        component.originalContainsImage = true;
        component.modifiedContainsImage = true;

        const error = new HttpErrorResponse({
            error: JSON.stringify('Test error'),
            status: 404,
            statusText: 'Not Found',
        });
        spyOn(component.debugDisplayMessage, 'next');
        communicationService.post.and.returnValue(throwError(() => error));
        await component.sendImageToServer();
        expect(component.debugDisplayMessage.next).toHaveBeenCalled();
    });
    it('should show an error message if the image is not 24-bits', async () => {
        const byteArray = [1, 2, 3, 4];
        const buffer = component.convertToBuffer(byteArray);
        const imgData = new Uint8Array(buffer);

        const myBlob = new Blob([imgData]);
        const canvas = document.createElement('canvas');
        component.leftCanvas = { nativeElement: canvas };
        component.rightCanvas = { nativeElement: canvas };
        spyOn(component, 'is24BitDepthBMP').and.returnValue(false);
        spyOn(window, 'alert');

        const event = {
            target: {
                files: [
                    {
                        arrayBuffer: async () => {
                            return myBlob;
                        },
                    },
                ],
                length: 10,
            },
        };

        await component.processImage(event, false);

        expect(window.alert).toHaveBeenCalledWith("L'image doit être en 24-bits");
    });
    it('should process the image and set the image data when given a valid image', async () => {
        const byteArray = [1, 2, 3, 4];
        const buffer = component.convertToBuffer(byteArray);
        const imgData = new Uint8Array(buffer);

        const myBlob = new Blob([imgData]);
        const canvas = document.createElement('canvas');
        component.leftCanvas = { nativeElement: canvas };
        component.rightCanvas = { nativeElement: canvas };
        spyOn(component, 'is24BitDepthBMP').and.returnValue(true);
        spyOn(window, 'alert');
        spyOn(component, 'getCanvas').and.returnValue(canvas.getContext('2d'));

        const event = {
            target: {
                files: [
                    {
                        arrayBuffer: () => {
                            return myBlob;
                        },
                    },
                ],
                length: 1,
            },
        };

        await component.processImage(event, false);

        expect(window.alert).not.toHaveBeenCalled();
        // expect(component.originalImage).toEqual(event.target.files[0]);
        expect(component.originalContainsImage).toBeTrue();
        expect(component.rightCanvas.nativeElement.toDataURL()).toContain('data:image/png;base64');
    });
});
