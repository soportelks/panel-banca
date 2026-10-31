import { TestBed } from '@angular/core/testing';

import { SpeiService } from './spei.service';

describe('SpeiService', () => {
  let service: SpeiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpeiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
