import { TestBed } from '@angular/core/testing';

import { TimerService } from './timer.service';

describe('TimerService', () => {
    let service: TimerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(TimerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return the correct format for given score in seconds', () => {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        const result = service.convertScoreToString(60);
        expect(result).toEqual('01:00');
    });
});
