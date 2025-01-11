import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersionalInformationComponent } from './persional-information.component';

describe('PersionalInformationComponent', () => {
  let component: PersionalInformationComponent;
  let fixture: ComponentFixture<PersionalInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersionalInformationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersionalInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
