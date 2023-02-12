import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { CommunicationService } from './communication.service';

import { UploadImagesService } from './upload-images.service';

describe('UploadImageService', () => {
    let service: UploadImagesService;
    // let commService: CommunicationService;
    // let httpService: HttpClient;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClient],
            providers: [CommunicationService]
        });
        service = TestBed.inject(UploadImagesService);
        // commService = TestBed.inject(CommunicationService);
        // httpService = TestBed.inject(HttpClient);
    });

    beforeEach(() => {

    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it("service should be constructed with communication service", () => {
        expect(service['communicationService']).toBeInstanceOf(CommunicationService);

    });
});
