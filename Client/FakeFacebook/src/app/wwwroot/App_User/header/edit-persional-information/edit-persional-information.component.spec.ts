import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPersionalInformationComponent } from './edit-persional-information.component';

describe('EditPersionalInformationComponent', () => {
  let component: EditPersionalInformationComponent;
  let fixture: ComponentFixture<EditPersionalInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditPersionalInformationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditPersionalInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
