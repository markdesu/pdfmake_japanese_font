import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipyardPage } from './shipyard.page';

describe('ShipyardPage', () => {
  let component: ShipyardPage;
  let fixture: ComponentFixture<ShipyardPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShipyardPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShipyardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
