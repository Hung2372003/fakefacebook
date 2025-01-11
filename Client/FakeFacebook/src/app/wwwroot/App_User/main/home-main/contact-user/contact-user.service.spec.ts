import { TestBed } from '@angular/core/testing';

import { ContactUserService } from './contact-user.service';

describe('ContactUserService', () => {
  let service: ContactUserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContactUserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
