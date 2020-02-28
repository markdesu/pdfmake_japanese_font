import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MngUsersPage } from './mng-users.page';

describe('MngUsersPage', () => {
  let component: MngUsersPage;
  let fixture: ComponentFixture<MngUsersPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MngUsersPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MngUsersPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
