import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MngInspectorsPage } from './mng-inspectors.page';

describe('MngInspectorsPage', () => {
  let component: MngInspectorsPage;
  let fixture: ComponentFixture<MngInspectorsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MngInspectorsPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MngInspectorsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
