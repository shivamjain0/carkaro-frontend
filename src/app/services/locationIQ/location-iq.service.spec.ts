import { TestBed } from '@angular/core/testing';

import { LocationIQService } from './location-iq.service';

describe('LocationIQService', () => {
  let service: LocationIQService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocationIQService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
