import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorPagePage } from './error-page.page';

describe('ErrorPagePage', () => {
  let component: ErrorPagePage;
  let fixture: ComponentFixture<ErrorPagePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ErrorPagePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrorPagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
