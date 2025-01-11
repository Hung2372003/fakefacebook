import { TestBed } from '@angular/core/testing';

import { ConectSinglRService } from './conect-singl-r.service';

describe('ConectSinglRService', () => {
  let service: ConectSinglRService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConectSinglRService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
