import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateFilePostComponent } from './create-file-post.component';

describe('CreateFilePostComponent', () => {
  let component: CreateFilePostComponent;
  let fixture: ComponentFixture<CreateFilePostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateFilePostComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateFilePostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
