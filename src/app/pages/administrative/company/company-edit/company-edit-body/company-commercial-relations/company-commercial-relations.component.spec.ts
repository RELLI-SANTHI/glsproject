/* eslint-disable max-lines-per-function */
/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyCommercialRelationsComponent } from './company-commercial-relations.component';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { AdministrativeService } from '../../../../../../api/glsAdministrativeApi/services';

describe('CompanyCommercialRelationsComponent', () => {
  let component: CompanyCommercialRelationsComponent;
  let fixture: ComponentFixture<CompanyCommercialRelationsComponent>;
  let administrativeServiceSpy: jasmine.SpyObj<AdministrativeService>;

  const activatedRoute = {
    snapshot: {
      paramMap: { get: () => 'mock-param' }
    },
    queryParams: of({})
  };

  beforeEach(async () => {
    administrativeServiceSpy = jasmine.createSpyObj('AdministrativeService', [
      'getApiAdministrativeV1IdCustomers$Json',
      'getApiAdministrativeV1IdAgents$Json'
    ]);
    administrativeServiceSpy.getApiAdministrativeV1IdCustomers$Json.and.returnValue(
      of({
        customers: [],
        currentPage: 1,
        pageSize: 10,
        totalItems: 0,
        totalPages: 0
      })
    );
    administrativeServiceSpy.getApiAdministrativeV1IdAgents$Json.and.returnValue(
      of({
        agents: [],
        currentPage: 1,
        pageSize: 10,
        totalItems: 0,
        totalPages: 0
      })
    );
    await TestBed.configureTestingModule({
      imports: [CompanyCommercialRelationsComponent, TranslateModule.forRoot(), HttpClientTestingModule],
      providers: [
        {
          provide: AdministrativeService,
          useValue: administrativeServiceSpy
        },
        { provide: ActivatedRoute, useValue: activatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CompanyCommercialRelationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
