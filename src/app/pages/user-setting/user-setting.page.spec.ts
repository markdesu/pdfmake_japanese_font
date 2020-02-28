import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserSettingPage } from './user-setting.page';

describe('UserSettingPage', () => {
  let component: UserSettingPage;
  let fixture: ComponentFixture<UserSettingPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserSettingPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserSettingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
