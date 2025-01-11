import { TestBed } from '@angular/core/testing';

import { ComeChatService } from './come-chat.service';

describe('ComeChatService', () => {
  let service: ComeChatService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ComeChatService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
