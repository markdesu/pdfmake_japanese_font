import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MngCompanyPage } from './mng-company.page';

describe('MngCompanyPage', () => {
  let component: MngCompanyPage;
  let fixture: ComponentFixture<MngCompanyPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MngCompanyPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MngCompanyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
