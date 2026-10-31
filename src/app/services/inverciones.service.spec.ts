import { TestBed } from '@angular/core/testing';

import { InvercionesService } from './inverciones.service';

describe('InvercionesService', () => {
  let service: InvercionesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InvercionesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
