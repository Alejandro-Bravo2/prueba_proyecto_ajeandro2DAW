import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchableTags } from './searchable-tags';

describe('SearchableTags', () => {
  let component: SearchableTags;
  let fixture: ComponentFixture<SearchableTags>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchableTags]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchableTags);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
