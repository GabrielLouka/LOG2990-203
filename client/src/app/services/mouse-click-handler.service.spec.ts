import { TestBed } from '@angular/core/testing';

import { MouseClickHandlerService } from './mouse-click-handler.service';

describe('MouseClickHandlerService', () => {
  let service: MouseClickHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MouseClickHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
