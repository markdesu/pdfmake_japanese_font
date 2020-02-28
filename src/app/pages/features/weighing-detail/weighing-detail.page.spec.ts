import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WeighingDetailPage } from './weighing-detail.page';

describe('WeighingDetailPage', () => {
  let component: WeighingDetailPage;
  let fixture: ComponentFixture<WeighingDetailPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WeighingDetailPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WeighingDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
