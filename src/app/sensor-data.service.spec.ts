import { TestBed, inject } from '@angular/core/testing';

import { SensorDataService } from './sensor-data.service';

describe('SensorDataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SensorDataService]
    });
  });

  it('should be created', inject([SensorDataService], (service: SensorDataService) => {
    expect(service).toBeTruthy();
  }));
});
