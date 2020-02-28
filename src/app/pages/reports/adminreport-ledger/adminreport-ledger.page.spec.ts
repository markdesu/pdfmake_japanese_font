import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminreportLedgerPage } from './adminreport-ledger.page';

describe('AdminreportLedgerPage', () => {
  let component: AdminreportLedgerPage;
  let fixture: ComponentFixture<AdminreportLedgerPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminreportLedgerPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminreportLedgerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
