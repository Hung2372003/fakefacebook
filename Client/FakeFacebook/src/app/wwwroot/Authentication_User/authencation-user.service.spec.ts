import { TestBed } from '@angular/core/testing';

import { AuthencationUserService } from './authencation-user.service';

describe('AuthencationUserService', () => {
  let service: AuthencationUserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthencationUserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
