import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MngContractsPage } from './mng-contracts.page';

describe('MngContractsPage', () => {
  let component: MngContractsPage;
  let fixture: ComponentFixture<MngContractsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MngContractsPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MngContractsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
