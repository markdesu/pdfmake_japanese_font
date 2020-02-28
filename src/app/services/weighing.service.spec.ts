import { TestBed } from '@angular/core/testing';

import { WeighingService } from './weighing.service';

describe('WeighingService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WeighingService = TestBed.get(WeighingService);
    expect(service).toBeTruthy();
  });
});
