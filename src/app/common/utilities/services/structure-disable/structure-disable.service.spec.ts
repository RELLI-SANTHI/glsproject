import { TestBed } from '@angular/core/testing';

import { StructureDisableService } from './structure-disable.service';

describe('StructureDisableService', () => {
  let service: StructureDisableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StructureDisableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
