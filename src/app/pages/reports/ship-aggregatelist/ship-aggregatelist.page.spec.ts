import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipAggregatelistPage } from './ship-aggregatelist.page';

describe('ShipAggregatelistPage', () => {
  let component: ShipAggregatelistPage;
  let fixture: ComponentFixture<ShipAggregatelistPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShipAggregatelistPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShipAggregatelistPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
