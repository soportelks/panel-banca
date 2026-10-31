import { TestBed } from '@angular/core/testing';

import { DispersionesMasivasService } from './dispersiones-masivas.service';

describe('DispersionesMasivasService', () => {
  let service: DispersionesMasivasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DispersionesMasivasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
