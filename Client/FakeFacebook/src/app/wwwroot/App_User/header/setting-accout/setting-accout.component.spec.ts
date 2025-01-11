import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingAccoutComponent } from './setting-accout.component';

describe('SettingAccoutComponent', () => {
  let component: SettingAccoutComponent;
  let fixture: ComponentFixture<SettingAccoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingAccoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingAccoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
