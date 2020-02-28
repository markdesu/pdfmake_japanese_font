import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SysLoginPage } from './sys-login.page';

describe('SysLoginPage', () => {
  let component: SysLoginPage;
  let fixture: ComponentFixture<SysLoginPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SysLoginPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SysLoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
