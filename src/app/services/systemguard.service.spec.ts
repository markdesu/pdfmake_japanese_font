import { TestBed } from '@angular/core/testing';

import { SystemguardService } from './systemguard.service';

describe('SystemguardService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SystemguardService = TestBed.get(SystemguardService);
    expect(service).toBeTruthy();
  });
});
