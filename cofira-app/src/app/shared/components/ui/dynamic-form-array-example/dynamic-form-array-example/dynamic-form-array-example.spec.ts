import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicFormArrayExample } from './dynamic-form-array-example';

describe('DynamicFormArrayExample', () => {
  let component: DynamicFormArrayExample;
  let fixture: ComponentFixture<DynamicFormArrayExample>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicFormArrayExample]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DynamicFormArrayExample);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
