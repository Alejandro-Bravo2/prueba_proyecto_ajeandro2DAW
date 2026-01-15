import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadioButton } from './radio-button';

describe('RadioButton', () => {
  let component: RadioButton;
  let fixture: ComponentFixture<RadioButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadioButton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RadioButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
