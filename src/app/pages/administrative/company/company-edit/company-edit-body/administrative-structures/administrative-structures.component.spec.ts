/* eslint-disable max-lines-per-function */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdministrativeStructuresComponent } from './administrative-structures.component';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { AdministrativeService } from '../../../../../../api/glsAdministrativeApi/services';
import { TranslateModule } from '@ngx-translate/core';
import { GenericService } from '../../../../../../common/utilities/services/generic.service';
import { of, throwError } from 'rxjs';
import { GetAdministrativeStructuresResponse } from '../../../../../../api/glsAdministrativeApi/models';

describe('AdministrativeStructuresComponent', () => {
  let component: AdministrativeStructuresComponent;
  let fixture: ComponentFixture<AdministrativeStructuresComponent>;
  let administrativeServiceSpy: jasmine.SpyObj<AdministrativeService>;
  let genericServiceSpy: jasmine.SpyObj<GenericService>;

  beforeEach(async () => {
    // Create spies for services
    const adminSpy = jasmine.createSpyObj('AdministrativeService', ['getApiAdministrativeV1IdStructures$Json']);
    const genSpy = jasmine.createSpyObj('GenericService', ['manageError']);

    await TestBed.configureTestingModule({
      imports: [AdministrativeStructuresComponent, HttpClientModule, TranslateModule.forRoot()],
      providers: [
        { provide: AdministrativeService, useValue: adminSpy },
        { provide: GenericService, useValue: genSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdministrativeStructuresComponent);
    component = fixture.componentInstance;
    administrativeServiceSpy = TestBed.inject(AdministrativeService) as jasmine.SpyObj<AdministrativeService>;
    genericServiceSpy = TestBed.inject(GenericService) as jasmine.SpyObj<GenericService>;

    // Configure default mock response
    const mockResponse: GetAdministrativeStructuresResponse = {
      currentPage: 1,
      pageSize: 10,
      structures: [
        {
          id: 1,
          areaName: 'North Italy',
          buildingAcronym: 'MI-HQ',
          buildingName: 'Milan Headquarters',
          buildingTypeName: 'OFFICE',
          regionName: 'Lombardy',
          startOfOperationalActivity: '2020-03-15'
        },
        {
          id: 2,
          areaName: 'Central Italy',
          buildingAcronym: 'RM-DC',
          buildingName: 'Rome Distribution Center',
          buildingTypeName: 'WAREHOUSE',
          regionName: 'Lazio',
          startOfOperationalActivity: '2019-07-22'
        }
      ],
      totalItems: 5,
      totalPages: 1
    };
    administrativeServiceSpy.getApiAdministrativeV1IdStructures$Json.and.returnValue(of(mockResponse));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getAdministrativeStrucuture on initialization', () => {
    // Arrange
    const getStructureSpy = spyOn(component, 'getAdministrativeStrucuture');

    // Act
    component.ngOnInit();

    // Assert
    expect(getStructureSpy).toHaveBeenCalled();
  });

  it('should retrieve and set structure list when API call succeeds', () => {
    // Arrange
    component.companyId = 123;

    // Act
    component.getAdministrativeStrucuture();

    // Assert
    expect(administrativeServiceSpy.getApiAdministrativeV1IdStructures$Json).toHaveBeenCalledWith({ id: 123 });
    expect(component.structureList.length).toBe(2);
  });

  it('should handle API error correctly', () => {
    // Arrange
    const errorResponse = new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
    administrativeServiceSpy.getApiAdministrativeV1IdStructures$Json.and.returnValue(throwError(() => errorResponse));

    // Act
    component.getAdministrativeStrucuture();

    // Assert
    expect(genericServiceSpy.manageError).toHaveBeenCalledWith(errorResponse);
  });

  it('should use default id 0 when companyId is null', () => {
    // Arrange
    component.companyId = null;

    // Act
    component.getAdministrativeStrucuture();

    // Assert
    expect(administrativeServiceSpy.getApiAdministrativeV1IdStructures$Json).toHaveBeenCalledWith({ id: 0 });
  });

  it('should correctly validate dates with isValidDate', () => {
    // Arrange & Act & Assert
    expect(component.isValidDate('2023-01-01')).toBeTrue();
    expect(component.isValidDate('invalid-date')).toBeFalse();
    expect(component.isValidDate('')).toBeFalse();
  });

  it('should handle empty structure response', () => {
    // Arrange
    const emptyResponse: GetAdministrativeStructuresResponse = { structures: [], totalItems: 0, totalPages: 0 };
    administrativeServiceSpy.getApiAdministrativeV1IdStructures$Json.and.returnValue(of(emptyResponse));

    // Act
    component.getAdministrativeStrucuture();

    // Assert
    expect(component.structureList).toEqual([]);
  });

  it('should handle undefined structure response', () => {
    // Arrange
    const undefinedResponse: GetAdministrativeStructuresResponse = {
      structures: undefined,
      totalItems: 0,
      totalPages: 0
    };
    administrativeServiceSpy.getApiAdministrativeV1IdStructures$Json.and.returnValue(of(undefinedResponse));

    // Act
    component.getAdministrativeStrucuture();

    // Assert
    expect(component.structureList).toEqual([]);
  });
});
