import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TotalresultPage } from './totalresult.page';

describe('TotalresultPage', () => {
  let component: TotalresultPage;
  let fixture: ComponentFixture<TotalresultPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TotalresultPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TotalresultPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
