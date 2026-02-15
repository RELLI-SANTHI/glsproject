/* eslint-disable max-lines-per-function */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { SIGNAL, signalSetFn } from '@angular/core/primitives/signals';
import { FormBuilder, Validators } from '@angular/forms';

import { StructureListTableComponent } from './structure-list-table.component';
import { StructureResponse } from '../../../../../api/glsNetworkApi/models/structure-response';
import { UtilityRouting } from '../../../../../common/utilities/utility-routing';
import { Router } from '@angular/router';

describe('StructureListTableComponent', () => {
  let component: StructureListTableComponent;
  let fixture: ComponentFixture<StructureListTableComponent>;
  let router: jasmine.SpyObj<Router>;

  const form = new FormBuilder().group({
    filterType: ['', Validators.required],
    filterValue: ['']
  });

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    await TestBed.configureTestingModule({
      imports: [StructureListTableComponent, TranslateModule.forRoot()],
      providers: [{ provide: Router, useValue: routerSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(StructureListTableComponent);
    component = fixture.componentInstance;

    // Set up signals
    signalSetFn(component.structureFilterFg[SIGNAL], form);
    signalSetFn(component.structuresList[SIGNAL], []);
    signalSetFn(component.columns[SIGNAL], [
      { field: 'status', label: 'Status', block: true, columnVisible: true, sortable: true },
      { field: 'BuildingAcronym', label: 'Building Acronym', block: true, columnVisible: false, sortable: true },
      { field: 'Region', label: 'Region', block: false, columnVisible: true, sortable: true }
    ]);

    fixture.detectChanges();
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    UtilityRouting.initialize(router);
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('Column Visibility', () => {
    it('should return correct visibility for known and unknown columns', () => {
      expect(component.showColumn('status')).toBeTrue();
      expect(component.showColumn('BuildingAcronym')).toBeFalse();
      expect(component.showColumn('Region')).toBeTrue();
      expect(component.showColumn('NonExistentColumn')).toBeFalse();
    });
  });

  describe('Field Value Extraction', () => {
    const mockStructure: StructureResponse = {
      fields: [
        { fieldName: 'Field1', description: 'Description1', value: 'Value1' },
        { fieldName: 'Field2', value: 'Value2' },
        { fieldName: 'Field3' }
      ]
    } as StructureResponse;

    it('should return description if present, else value, else undefined', () => {
      expect(component.getFieldValue(mockStructure, 'Field1')).toBe('Description1');
      expect(component.getFieldValue(mockStructure, 'Field2')).toBe('Value2');
      expect(component.getFieldValue(mockStructure, 'Field3')).toBeUndefined();
      expect(component.getFieldValue(mockStructure, 'Unknown')).toBeUndefined();
    });
  });

  describe('Date Extraction from Fields', () => {
    it('should return valid Date object for valid value', () => {
      const structure: StructureResponse = {
        fields: [
          { fieldName: 'StartDate', value: '2025-03-24T10:00:00Z' },
          { fieldName: 'EndDate', value: '2025-03-25T15:30:00Z' }
        ]
      } as StructureResponse;

      expect(component.getFieldDate(structure, 'StartDate')).toEqual(new Date('2025-03-24T10:00:00Z'));
      expect(component.getFieldDate(structure, 'EndDate')).toEqual(new Date('2025-03-25T15:30:00Z'));
    });

    it('should return undefined for missing or null date values', () => {
      const structure: StructureResponse = {
        fields: [
          { fieldName: 'StartDate', value: null },
          { fieldName: 'EndDate', value: undefined }
        ]
      } as StructureResponse;

      expect(component.getFieldDate(structure, 'StartDate')).toBeUndefined();
      expect(component.getFieldDate(structure, 'EndDate')).toBeUndefined();
    });

    it('should return undefined for a non-existent field', () => {
      const structure: StructureResponse = {
        fields: [{ fieldName: 'StartDate', value: '2025-03-24T10:00:00Z' }]
      } as StructureResponse;

      expect(component.getFieldDate(structure, 'NonExistentField')).toBeUndefined();
    });
  });

  describe('Status-based Display Logic', () => {
    it('should return correct status icon', () => {
      const mock = (status: string) => ({ status, fields: [], icon: '', id: 0 }) as StructureResponse;

      expect(component.getStatusIcon(mock('COMPLETED'))).toBe('bi-calendar-check primary');
      expect(component.getStatusIcon(mock('DISABLED'))).toBe('bi-ban');
      expect(component.getStatusIcon(mock('DRAFT'))).toBe('');
    });

    it('should return correct status label tooltip', () => {
      const mock = (status: string) => ({ status, fields: [], icon: '', id: 0 }) as StructureResponse;

      expect(component.getStatusLabel(mock('COMPLETED'))).toBe('structureList.status.completed');
      expect(component.getStatusLabel(mock('DISABLED'))).toBe('structureList.status.disabled');
      expect(component.getStatusLabel(mock('DRAFT'))).toBe('structureList.status.draft');
    });
  });

  it('should navigate to structure detail page', () => {
    component.goToStructureDetail(1);
    expect(router.navigate).toHaveBeenCalledWith(['anagrafica/structure-detail', '1']);
  });

  describe('Pagination Calculations', () => {
    it('should calculate correct first and last result indices', () => {
      signalSetFn(component.currentPage[SIGNAL], 2);
      signalSetFn(component.pageSize[SIGNAL], 10);
      signalSetFn(component.totalItems[SIGNAL], 25);

      expect(component.getFirstResult()).toBe(11);
      expect(component.getLastResult()).toBe(20);
    });
  });

  it('should return correct status translation code', () => {
    // Act & Assert
    expect(component.getStatusTranslationCode('COMPLETED')).toBe('structureList.status.completed');
    expect(component.getStatusTranslationCode('ACTIVE')).toBe('structureList.status.active');
    expect(component.getStatusTranslationCode('DISABLED')).toBe('structureList.status.disabled');
    expect(component.getStatusTranslationCode('WARNING')).toBe('structureList.status.warning');
    expect(component.getStatusTranslationCode('UNKNOWN')).toBe('UNKNOWN'); // not in the list
  });
  describe('getStatusClass', () => {
    it('should return "text-success" when status is ACTIVE', () => {
      spyOn(component, 'getStatus').and.returnValue('ACTIVE');
      const structure = { status: 'ACTIVE' } as StructureResponse;
      expect(component.getStatusClass(structure)).toBe('text-success');
    });

    it('should return "warning" when status is COMPLETED', () => {
      spyOn(component, 'getStatus').and.returnValue('COMPLETED');
      const structure = { status: 'COMPLETED' } as StructureResponse;
      expect(component.getStatusClass(structure)).toBe('status-warning');
    });

    it('should return "disabled" when structure.status is DISABLED and status is not ACTIVE/COMPLETED', () => {
      spyOn(component, 'getStatus').and.returnValue('DRAFT');
      const structure = { status: 'DISABLED' } as StructureResponse;
      expect(component.getStatusClass(structure)).toBe('status-disabled');
    });

    it('should return empty string when no matching conditions', () => {
      spyOn(component, 'getStatus').and.returnValue('DRAFT');
      const structure = { status: 'DRAFT' } as StructureResponse;
      expect(component.getStatusClass(structure)).toBe('');
    });
  });
  describe('showRowType', () => {
    it('should return "status" when the field is "status"', () => {
      expect(component.showRowType('status')).toBe('status');
    });
    it('should return "Warning" when the field is "Warning"', () => {
      expect(component.showRowType('Warning')).toBe('Warning');
    });
    it('should return "date" when the field is "StartOfOperationalActivity"', () => {
      expect(component.showRowType('StartOfOperationalActivity')).toBe('date');
    });
    it('should return "date" when the field is "EndOfOperationalActivity"', () => {
      expect(component.showRowType('EndOfOperationalActivity')).toBe('date');
    });
    it('should return "link" when the field is "BuildingName"', () => {
      expect(component.showRowType('BuildingName')).toBe('link');
    });

    it('should return "string" for other fields', () => {
      expect(component.showRowType('SomeOtherField')).toBe('string');
    });
  });

  describe('isWarningStructure', () => {
    it('should return true when the "Warning" field exists and its value is true', () => {
      const structure: StructureResponse = {
        fields: [{ fieldName: 'Warning', value: true }]
      } as StructureResponse;

      expect(component.isWarningStructure(structure)).toBeTrue();
    });

    it('should return false when the "Warning" field exists but its value is false', () => {
      const structure: StructureResponse = {
        fields: [{ fieldName: 'Warning', value: false }]
      } as StructureResponse;

      expect(component.isWarningStructure(structure)).toBeFalse();
    });

    it('should return false when the "Warning" field does not exist', () => {
      const structure: StructureResponse = {
        fields: [{ fieldName: 'SomeOtherField', value: true }]
      } as StructureResponse;

      expect(component.isWarningStructure(structure)).toBeFalse();
    });
  });
});
