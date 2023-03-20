import { TestBed } from '@angular/core/testing';

import { DrawingService } from '@app/services/drawing-service/drawing.service';

describe('DrawingService', () => {
    let service: DrawingService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(DrawingService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
