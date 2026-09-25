import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisionMission } from './vision-mission';

describe('VisionMission', () => {
  let component: VisionMission;
  let fixture: ComponentFixture<VisionMission>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisionMission],
    }).compileComponents();

    fixture = TestBed.createComponent(VisionMission);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
