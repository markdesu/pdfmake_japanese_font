import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WeighingPage } from './weighing.page';

describe('WeighingPage', () => {
  let component: WeighingPage;
  let fixture: ComponentFixture<WeighingPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WeighingPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WeighingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
