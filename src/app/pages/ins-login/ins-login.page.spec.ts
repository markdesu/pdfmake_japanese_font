import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InsLoginPage } from './ins-login.page';

describe('InsLoginPage', () => {
  let component: InsLoginPage;
  let fixture: ComponentFixture<InsLoginPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InsLoginPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InsLoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
