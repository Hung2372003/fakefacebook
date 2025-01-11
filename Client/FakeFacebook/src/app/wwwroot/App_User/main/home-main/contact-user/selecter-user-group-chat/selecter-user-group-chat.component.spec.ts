import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelecterUserGroupChatComponent } from './selecter-user-group-chat.component';

describe('SelecterUserGroupChatComponent', () => {
  let component: SelecterUserGroupChatComponent;
  let fixture: ComponentFixture<SelecterUserGroupChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelecterUserGroupChatComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelecterUserGroupChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
