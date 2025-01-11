import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListSearchFriendComponent } from './list-search-friend.component';

describe('ListSearchFriendComponent', () => {
  let component: ListSearchFriendComponent;
  let fixture: ComponentFixture<ListSearchFriendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListSearchFriendComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListSearchFriendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
