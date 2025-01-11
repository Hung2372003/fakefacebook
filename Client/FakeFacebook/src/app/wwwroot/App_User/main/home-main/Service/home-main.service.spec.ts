import { TestBed } from '@angular/core/testing';

import { HomeMainService } from './home-main.service';

describe('HomeMainService', () => {
  let service: HomeMainService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HomeMainService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
