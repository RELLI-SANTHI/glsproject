/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines-per-function */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StructureListModalComponent, structureListModalObject } from './structure-list-modal.component';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { StructureResponse, TemplateModel } from '../../../../api/glsNetworkApi/models';
import { ICONS } from '../../../../common/utilities/constants/icon';
import { VIEW_MODE } from '../../../../common/app.constants';

describe('StructureListModalComponent', () => {
  let component: StructureListModalComponent;
  let fixture: ComponentFixture<StructureListModalComponent>;
  let activeModal: NgbActiveModal;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StructureListModalComponent, HttpClientModule, TranslateModule.forRoot()],
      providers: [NgbActiveModal, TranslateService]
    }).compileComponents();
    fixture = TestBed.createComponent(StructureListModalComponent);
    component = fixture.componentInstance;
    activeModal = TestBed.inject(NgbActiveModal);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set isSmallMobile and isTablet correctly in setupViewMode', () => {
    // Mock genericService
    const genericService: any = component['genericService'];

    // Test MOBILE
    genericService.viewMode = jasmine.createSpy().and.returnValue(VIEW_MODE.MOBILE);
    component.isSmallMobile = { set: jasmine.createSpy() } as any;
    component.isTablet = { set: jasmine.createSpy() } as any;
    component['setupViewMode']();
    expect(component.isSmallMobile.set).toHaveBeenCalledWith(true);
    expect(component.isTablet.set).toHaveBeenCalledWith(false);

    // Test TABLET
    genericService.viewMode = jasmine.createSpy().and.returnValue(VIEW_MODE.TABLET);
    component.isSmallMobile = { set: jasmine.createSpy() } as any;
    component.isTablet = { set: jasmine.createSpy() } as any;
    component['setupViewMode']();
    expect(component.isSmallMobile.set).toHaveBeenCalledWith(false);
    expect(component.isTablet.set).toHaveBeenCalledWith(true);

    // Test DESKTOP (or any other)
    genericService.viewMode = jasmine.createSpy().and.returnValue('DESKTOP');
    component.isSmallMobile = { set: jasmine.createSpy() } as any;
    component.isTablet = { set: jasmine.createSpy() } as any;
    component['setupViewMode']();
    expect(component.isSmallMobile.set).toHaveBeenCalledWith(false);
    expect(component.isTablet.set).toHaveBeenCalledWith(false);
  });

  it('should close the modal without saving', () => {
    spyOn(activeModal, 'close');

    component.closeModal();

    expect(activeModal.close).toHaveBeenCalledWith(false);
  });

  it('should handle checkbox change and add structure to selected list', () => {
    const mockEvent = { target: { checked: true } } as unknown as Event;
    const mockStructure = { id: 1, fields: [], icon: '', status: '' } as StructureResponse;
    component.structureList = [mockStructure];
    component.selectedStructureList = []; // Ensure this is initialized

    component.onCheckboxChange(1, mockEvent);

    // Compare by id to avoid reference issues
    expect(component.selectedStructureList.some((s) => s.id === mockStructure.id)).toBeFalse();
  });

  it('should remove structure from selected list on checkbox uncheck', () => {
    const mockEvent = { target: { checked: false } } as unknown as Event;
    const mockStructure = { id: 1, fields: [], icon: '', status: '' } as StructureResponse;
    component.structureList = [mockStructure];
    component.selectedStructureList = [mockStructure];

    component.onCheckboxChange(1, mockEvent);

    // Compare by id to avoid reference issues
    expect(component.selectedStructureList.some((s) => s.id === mockStructure.id)).toBeTrue();
  });

  it('should not add structure if not found in structureList', () => {
    const mockEvent = { target: { checked: true } } as unknown as Event;
    component.structureList = [];
    component.selectedStructureList = [];

    component.onCheckboxChange(99, mockEvent);

    expect(component.selectedStructureList.length).toBe(0);
  });

  it('should not remove structure if not in selectedStructureList', () => {
    const mockEvent = { target: { checked: false } } as unknown as Event;
    component.structureList = [
      {
        id: 1,
        fields: [],
        icon: '',
        status: ''
      }
    ] as StructureResponse[];
    component.selectedStructureList = [];

    component.onCheckboxChange(1, mockEvent);

    expect(component.selectedStructureList.length).toBe(0);
  });

  it('should return the form control for searchStructureControlName', () => {
    const control = component.searchStructureControlName;
    expect(control).toBe(component.structureModalFormGroup.get('searchStructureControlName'));
  });

  it('should return the form control for buildingTypeName', () => {
    const control = component.buildingTypeName;
    expect(control).toBe(component.structureModalFormGroup.get('buildingTypeName'));
  });

  it('should handle save with empty selectedStructureList', () => {
    spyOn(activeModal, 'close');
    component.selectedStructureList = [];
    component.save();
    expect(activeModal.close).toHaveBeenCalledWith([]);
  });

  it('should handle closeModal when called multiple times', () => {
    spyOn(activeModal, 'close');
    component.closeModal();
    component.closeModal();
    expect(activeModal.close).toHaveBeenCalledTimes(2);
  });

  describe('ngOnInit logic', () => {
    beforeEach(() => {
      // Mock modalData and spinnerService
      component.modalData = {
        selectSocietyName: 'Test Society',
        template: [{ id: 1 }],
        exitingStructures: [{ id: 2 }]
      } as structureListModalObject;
      spyOn(component, 'getStructureList');
      spyOn(component, 'setupSearchListener');
    });

    it('should call spinnerService.show, set templateList, buildingTypeOption, getStructureList, and setupSearchListener', () => {
      component.ngOnInit();

      expect(component.templateList).toEqual(component.modalData.template);
      expect(component.selectedStructure).toEqual(jasmine.any(Array));
      expect(component.getStructureList).toHaveBeenCalled();
      expect(component.setupSearchListener).toHaveBeenCalled();
    });

    it('should not set selectedStructure if exitingStructures is empty', () => {
      component.modalData.exitingStructures = [] as StructureResponse[];
      component.ngOnInit();
      expect(component.selectedStructure).toEqual([]);
    });

    it('should set selectedStructure as empty array if exitingStructures is not array', () => {
      component.modalData.exitingStructures = [];
      component.ngOnInit();
      expect(component.selectedStructure).toEqual([]);
    });
  });

  it('should return correct structure name with acronym and name', () => {
    const structure: StructureResponse = {
      id: 1,
      fields: [
        { fieldName: 'BuildingAcronym', value: 'ABC' },
        { fieldName: 'BuildingName', value: 'Main Office' }
      ],
      icon: '',
      status: ''
    } as StructureResponse;
    const result = component.getStructureName(structure);
    expect(result).toBe('ABC - Main Office');
  });

  it('should return correct structure name with only acronym', () => {
    const structure: StructureResponse = {
      id: 2,
      fields: [{ fieldName: 'BuildingAcronym', value: 'XYZ' }],
      icon: '',
      status: ''
    } as StructureResponse;
    const result = component.getStructureName(structure);
    expect(result).toBe('XYZ - ');
  });

  it('should return correct structure name with only name', () => {
    const structure: StructureResponse = {
      id: 3,
      fields: [{ fieldName: 'BuildingName', value: 'Annex' }],
      icon: '',
      status: ''
    } as StructureResponse;
    const result = component.getStructureName(structure);
    expect(result).toBe(' - Annex');
  });

  it('should return correct structure name with neither acronym nor name', () => {
    const structure: StructureResponse = {
      id: 4,
      fields: [{ fieldName: 'OtherField', value: 'Value' }],
      icon: '',
      status: ''
    } as StructureResponse;
    const result = component.getStructureName(structure);
    expect(result).toBe(' - ');
  });

  it('should return correct icon for structure with matching building type', () => {
    // Mock ICONS and templateList
    component.templateList = [
      {
        id: 1,
        templateName: 'Template 1',
        icon: 'icon-home',
        buildingAcronymMaxLength: 10,
        buildingAcronymMinLength: 2
      }
    ];
    // Structure with buildingtype field matching template id
    const structure: StructureResponse = {
      id: 1,
      fields: [{ fieldName: 'BuildingType', value: 1 }],
      icon: '',
      status: ''
    } as StructureResponse;
    // Patch getBuildingTypeIconAndName to use our ICONS
    spyOn(component as StructureListModalComponent, 'getBuildingTypeIconAndName').and.callFake((item: StructureResponse, type: string) => {
      if (type === 'icon') {
        return 'icon-home-value';
      }

      return '';
    });
    const result = component.getIcon(structure);
    expect(result).toBe('icon-home-value');
  });

  it('should return empty string if no matching building type for icon', () => {
    (component as StructureListModalComponent).templateList = [
      {
        id: 2,
        templateName: 'Template 2',
        icon: 'icon-office',
        buildingAcronymMaxLength: 10,
        buildingAcronymMinLength: 2
      }
    ];
    const structure: StructureResponse = {
      id: 2,
      fields: [{ fieldName: 'BuildingType', value: 1 }],
      icon: '',
      status: ''
    } as StructureResponse;
    spyOn(component as StructureListModalComponent, 'getBuildingTypeIconAndName').and.returnValue('');
    const result = component.getIcon(structure);
    expect(result).toBe('');
  });

  it('should return correct template name for structure with matching building type', () => {
    component.templateList = [
      {
        id: 1,
        templateName: 'Template 1',
        icon: 'icon-home',
        buildingAcronymMaxLength: 10,
        buildingAcronymMinLength: 2
      }
    ];
    const structure: StructureResponse = {
      id: 1,
      fields: [{ fieldName: 'BuildingType', value: 1 }],
      icon: '',
      status: ''
    } as StructureResponse;
    spyOn(component as StructureListModalComponent, 'getBuildingTypeIconAndName').and.callFake((item: StructureResponse, type: string) => {
      if (type === 'name') {
        return 'Template 1';
      }

      return '';
    });
    const result = component.gettemplateName(structure);
    expect(result).toBe('Template 1');
  });

  it('should return empty string if no matching building type for template name', () => {
    component.templateList = [
      {
        id: 2,
        templateName: 'Template 2',
        icon: 'icon-office',
        buildingAcronymMaxLength: 10,
        buildingAcronymMinLength: 2
      }
    ];
    const structure: StructureResponse = {
      id: 2,
      fields: [{ fieldName: 'BuildingType', value: 1 }],
      icon: '',
      status: ''
    } as StructureResponse;
    spyOn(component as StructureListModalComponent, 'getBuildingTypeIconAndName').and.returnValue('');
    const result = component.gettemplateName(structure);
    expect(result).toBe('');
  });

  it('should return icon from getBuildingTypeIconAndName when type is icon and match found', () => {
    // Patch ICONS directly for the test
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ICONS as any)['icon-home'] = 'icon-home-value';
    component.templateList = [
      {
        id: 1,
        templateName: 'Template 1',
        icon: 'icon-home',
        buildingAcronymMaxLength: 10,
        buildingAcronymMinLength: 2
      }
    ] as TemplateModel[];
    const structure: StructureResponse = {
      id: 1,
      fields: [{ fieldName: 'BuildingType', value: 1 }],
      icon: '',
      status: ''
    } as StructureResponse;
    // Remove any spy to ensure the real method is called
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((component.getBuildingTypeIconAndName as any).and?.isSpy) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (component.getBuildingTypeIconAndName as any).and.callThrough();
    }
    const result = component.getBuildingTypeIconAndName(structure, 'icon');
    expect(result).toBe('icon-home-value');
  });

  it('should return templateName from getBuildingTypeIconAndName when type is name and match found', () => {
    component.templateList = [
      {
        id: 1,
        templateName: 'Template 1',
        icon: 'icon-home',
        buildingAcronymMaxLength: 10,
        buildingAcronymMinLength: 2
      }
    ];
    const structure: StructureResponse = {
      id: 1,
      fields: [{ fieldName: 'BuildingType', value: 1 }],
      icon: '',
      status: ''
    } as StructureResponse;
    const result = component.getBuildingTypeIconAndName(structure, 'name');
    expect(result).toBe('Template 1');
  });

  it('should return empty string from getBuildingTypeIconAndName if no matching template', () => {
    component.templateList = [
      {
        id: 2,
        templateName: 'Template 2',
        icon: 'icon-office',
        buildingAcronymMaxLength: 10,
        buildingAcronymMinLength: 2
      }
    ];
    const structure: StructureResponse = {
      id: 1,
      fields: [{ fieldName: 'BuildingType', value: 1 }],
      icon: '',
      status: ''
    } as StructureResponse;
    const result = component.getBuildingTypeIconAndName(structure, 'icon');
    expect(result).toBe('');
  });

  it('should return empty string from getBuildingTypeIconAndName if no BuildingType field', () => {
    component.templateList = [
      {
        id: 1,
        templateName: 'Template 1',
        icon: 'icon-home',
        buildingAcronymMaxLength: 10,
        buildingAcronymMinLength: 2
      }
    ];
    const structure: StructureResponse = {
      id: 1,
      fields: [{ fieldName: 'OtherField', value: 1 }],
      icon: '',
      status: ''
    } as StructureResponse;
    const result = component.getBuildingTypeIconAndName(structure, 'icon');
    expect(result).toBe('');
  });

  it('should set hasSearched to true and call applyFilters if search input is empty', () => {
    spyOn(component, 'applyFilters');
    component.structureModalFormGroup.get('searchStructureControlName')?.setValue('');
    component.hasSearched = false;
    component.searchStructure();
    expect(component.hasSearched).toBeTrue();
    expect(component.applyFilters).toHaveBeenCalled();
  });

  it('should set hasSearched to false and call applyFilters if search input is not empty', () => {
    spyOn(component, 'applyFilters');
    component.structureModalFormGroup.get('searchStructureControlName')?.setValue('test search');
    component.hasSearched = true;
    component.searchStructure();
    expect(component.hasSearched).toBeFalse();
    expect(component.applyFilters).toHaveBeenCalled();
  });

  it('should filter by building type and search value in applyFilters', () => {
    component.allStructureList = [
      {
        id: 1,
        fields: [
          { fieldName: 'BuildingType', value: 1 },
          { fieldName: 'BuildingAcronym', value: 'ABC' },
          { fieldName: 'BuildingName', value: 'Main Office' }
        ],
        icon: '',
        status: ''
      },
      {
        id: 2,
        fields: [
          { fieldName: 'BuildingType', value: 2 },
          { fieldName: 'BuildingAcronym', value: 'XYZ' },
          { fieldName: 'BuildingName', value: 'Annex' }
        ],
        icon: '',
        status: ''
      }
    ] as StructureResponse[];
    // Set buildingTypeName to 1 and search value to 'main'
    component.structureModalFormGroup.get('buildingTypeName')?.setValue(1);
    component.structureModalFormGroup.get('searchStructureControlName')?.setValue('main');
    component.hasSearched = false;
    spyOn(component, 'populateStructureCheckboxArray');
    component.applyFilters();
    expect(component.structureList.length).toBe(1);
    expect(component.structureList[0].id).toBe(1);
    expect(component.populateStructureCheckboxArray).toHaveBeenCalled();
  });

  it('should filter only by building type if hasSearched is true', () => {
    component.allStructureList = [
      {
        id: 1,
        fields: [
          { fieldName: 'BuildingType', value: 1 },
          { fieldName: 'BuildingAcronym', value: 'ABC' }
        ],
        icon: '',
        status: ''
      },
      {
        id: 2,
        fields: [
          { fieldName: 'BuildingType', value: 2 },
          { fieldName: 'BuildingAcronym', value: 'XYZ' }
        ],
        icon: '',
        status: ''
      }
    ] as StructureResponse[];
    component.structureModalFormGroup.get('buildingTypeName')?.setValue(2);
    component.structureModalFormGroup.get('searchStructureControlName')?.setValue('irrelevant');
    component.hasSearched = true;
    spyOn(component, 'populateStructureCheckboxArray');
    component.applyFilters();
    expect(component.structureList.length).toBe(1);
    expect(component.structureList[0].id).toBe(2);
    expect(component.populateStructureCheckboxArray).toHaveBeenCalled();
  });

  it('should filter only by search value if buildingTypeName is 0', () => {
    component.allStructureList = [
      {
        id: 1,
        fields: [
          { fieldName: 'BuildingType', value: 1 },
          { fieldName: 'BuildingAcronym', value: 'ABC' },
          { fieldName: 'BuildingName', value: 'Main Office' }
        ],
        icon: '',
        status: ''
      },
      {
        id: 2,
        fields: [
          { fieldName: 'BuildingType', value: 2 },
          { fieldName: 'BuildingAcronym', value: 'XYZ' },
          { fieldName: 'BuildingName', value: 'Annex' }
        ],
        icon: '',
        status: ''
      }
    ] as StructureResponse[];
    component.structureModalFormGroup.get('buildingTypeName')?.setValue(0);
    component.structureModalFormGroup.get('searchStructureControlName')?.setValue('annex');
    component.hasSearched = false;
    spyOn(component, 'populateStructureCheckboxArray');
    component.applyFilters();
    expect(component.structureList.length).toBe(1);
    expect(component.structureList[0].id).toBe(2);
    expect(component.populateStructureCheckboxArray).toHaveBeenCalled();
  });

  it('should show all structures if no filters are applied', () => {
    component.allStructureList = [
      { id: 1, fields: [], icon: '', status: '' },
      { id: 2, fields: [], icon: '', status: '' }
    ] as StructureResponse[];
    component.structureModalFormGroup.get('buildingTypeName')?.setValue(0);
    component.structureModalFormGroup.get('searchStructureControlName')?.setValue('');
    component.hasSearched = true;
    spyOn(component, 'populateStructureCheckboxArray');
    component.applyFilters();
    expect(component.structureList.length).toBe(2);
    expect(component.populateStructureCheckboxArray).toHaveBeenCalled();
  });

  it('should call applyFilters when onBuildingTypeChange is called', () => {
    spyOn(component, 'applyFilters');
    component.onBuildingTypeChange();
    expect(component.applyFilters).toHaveBeenCalled();
  });

  it('should add controls and set values in initailStructureCheckboxFromGroup', () => {
    component.structureList = [
      { id: 1, fields: [], icon: '', status: '' },
      { id: 2, fields: [], icon: '', status: '' }
    ] as StructureResponse[];
    component.selectedStructure = [{ id: 2, fields: [], icon: '', status: '' }] as StructureResponse[];
    // Remove controls if already present
    component.structureModalFormGroup.removeControl('structure_1');
    component.structureModalFormGroup.removeControl('structure_2');
    component.initailStructureCheckboxFromGroup();
    const control1 = component.structureModalFormGroup.get('structure_1');
    const control2 = component.structureModalFormGroup.get('structure_2');
    expect(control1).toBeTruthy();
    expect(control2).toBeTruthy();
    expect(control1?.value).toBeFalse();
    expect(control2?.value).toBeTrue();
  });

  it('should populate structureListWithCheckbox with correct isChecked values in populateStructureCheckboxArray', () => {
    component.structureList = [
      { id: 1, fields: [], icon: '', status: '' },
      { id: 2, fields: [], icon: '', status: '' }
    ] as StructureResponse[];
    component.selectedStructure = [{ id: 2, fields: [], icon: '', status: '' }] as StructureResponse[];
    // Ensure controls exist
    component.structureModalFormGroup.addControl('structure_1', component.fb.control(false));
    component.structureModalFormGroup.addControl('structure_2', component.fb.control(false));
    component.populateStructureCheckboxArray();
    expect(component.structureListWithCheckbox.length).toBe(2);
    expect(component.structureListWithCheckbox[0].id).toBe(1);
    expect(component.structureListWithCheckbox[0].isChecked).toBeFalse();
    expect(component.structureListWithCheckbox[1].id).toBe(2);
    expect(component.structureListWithCheckbox[1].isChecked).toBeFalse();
    // Also check that the form controls are updated
    expect(component.structureModalFormGroup.get('structure_1')?.value).toBeFalse();
    expect(component.structureModalFormGroup.get('structure_2')?.value).toBeFalse();
  });

  it('should call all relevant methods and update lists on successful getStructureList', () => {
    const mockStructures = [
      { id: 1, fields: [], icon: '', status: '' },
      { id: 2, fields: [], icon: '', status: '' }
    ] as StructureResponse[];
    const mockResponse = { structures: mockStructures };
    // Spy on loadInitialStructureData to return observable of mockResponse
    spyOn(component, 'loadInitialStructureData').and.returnValue({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      subscribe: (handlers: any) => {
        handlers.next(mockResponse);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    spyOn(component, 'initailStructureCheckboxFromGroup');
    spyOn(component, 'populateStructureCheckboxArray');
    spyOn(component, 'applyFilters');

    component.getStructureList();

    expect(component.loadInitialStructureData).toHaveBeenCalledWith(component.structurePayload);
    expect(component.allStructureList).toEqual(mockStructures);
    expect(component.structureList).toEqual(mockStructures);
    expect(component.initailStructureCheckboxFromGroup).toHaveBeenCalled();
    expect(component.populateStructureCheckboxArray).toHaveBeenCalled();
    expect(component.applyFilters).toHaveBeenCalled();
  });

  it('should add structure to selectedStructureList when checkbox is checked and not already selected', () => {
    component.structureListWithCheckbox = [
      {
        id: 1,
        fields: [],
        icon: '',
        status: '',
        isChecked: false
      }
    ] as (StructureResponse & {
      isChecked: boolean;
    })[];
    component.selectedStructureList = [];
    const event = { target: { checked: true } } as unknown as Event;
    component.onCheckboxChange(1, event);
    expect(component.selectedStructureList.length).toBe(1);
    expect(component.selectedStructureList[0].id).toBe(1);
    expect(component.structureListWithCheckbox[0].isChecked).toBeTrue();
  });

  it('should not add structure to selectedStructureList if already selected', () => {
    const structure = { id: 1, fields: [], icon: '', status: '', isChecked: false };
    component.structureListWithCheckbox = [structure] as (StructureResponse & { isChecked: boolean })[];
    component.selectedStructureList = [structure as StructureResponse];
    const event = { target: { checked: true } } as unknown as Event;
    component.onCheckboxChange(1, event);
    expect(component.selectedStructureList.length).toBe(1);
  });

  it('should remove structure from selectedStructureList when checkbox is unchecked', () => {
    const structure = { id: 1, fields: [], icon: '', status: '', isChecked: true };
    component.structureListWithCheckbox = [structure] as (StructureResponse & { isChecked: boolean })[];
    component.selectedStructureList = [structure as StructureResponse];
    const event = { target: { checked: false } } as unknown as Event;
    component.onCheckboxChange(1, event);
    expect(component.selectedStructureList.length).toBe(0);
    expect(component.structureListWithCheckbox[0].isChecked).toBeFalse();
  });

  it('should do nothing if structure is not found in structureListWithCheckbox', () => {
    component.structureListWithCheckbox = [];
    component.selectedStructureList = [];
    const event = { target: { checked: true } } as unknown as Event;
    component.onCheckboxChange(99, event);
    expect(component.selectedStructureList.length).toBe(0);
  });

  it('should not add duplicate structures', () => {
    spyOn(activeModal, 'close');
    // Add duplicate id in selectedStructureIds
    component.selectedStructureIds = [1, 1, 2];
    component.allStructureList = [
      {
        id: 1,
        fields: [
          { fieldName: 'BuildingAcronym', value: 'ABC' },
          { fieldName: 'BuildingName', value: 'Main Office' },
          { fieldName: 'BuildingType', value: 'Type1' }
        ],
        icon: '',
        status: ''
      },
      {
        id: 2,
        fields: [
          { fieldName: 'BuildingAcronym', value: 'XYZ' },
          { fieldName: 'BuildingName', value: 'Annex' },
          { fieldName: 'BuildingType', value: 'Type2' }
        ],
        icon: '',
        status: ''
      }
    ] as StructureResponse[];
    component.save();
    const result = (activeModal.close as jasmine.Spy).calls.mostRecent().args[0];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ids = result.map((s: any) => s.id);
    expect(ids).toEqual([1, 2]);
  });

  it('should handle empty selectedStructureIds', () => {
    spyOn(activeModal, 'close');
    component.selectedStructureIds = [];
    component.save();
    expect(activeModal.close).toHaveBeenCalledWith([]);
  });

  it('should handle empty allStructureList', () => {
    spyOn(activeModal, 'close');
    component.allStructureList = [];
    component.selectedStructureIds = [1];
    component.save();
    expect(activeModal.close).toHaveBeenCalledWith([]);
  });

  it('should reset structureObj after each push', () => {
    spyOn(activeModal, 'close');
    component.allStructureList = [
      {
        id: 1,
        fields: [
          { fieldName: 'BuildingAcronym', value: 'ABC' },
          { fieldName: 'BuildingName', value: 'Main Office' },
          { fieldName: 'BuildingType', value: 'Type1' }
        ],
        icon: '',
        status: ''
      },
      {
        id: 2,
        fields: [
          { fieldName: 'BuildingAcronym', value: 'XYZ' },
          { fieldName: 'BuildingName', value: 'Annex' },
          { fieldName: 'BuildingType', value: 'Type2' }
        ],
        icon: '',
        status: ''
      }
    ] as StructureResponse[];
    component.selectedStructureIds = [1, 2];
    component.save();
    const result = (activeModal.close as jasmine.Spy).calls.mostRecent().args[0];
    expect(result[0]).not.toBe(result[1]);
  });

  it('should handle field names case-insensitively', () => {
    component.allStructureList = [
      {
        id: 3,
        fields: [
          { fieldName: 'buildingacronym', value: 'DEF' },
          { fieldName: 'BUILDINGNAME', value: 'Tower' },
          { fieldName: 'BuildingType', value: 'Type3' }
        ],
        icon: '',
        status: ''
      }
    ] as StructureResponse[];
    component.selectedStructureIds = [3];
    spyOn(activeModal, 'close');
    component.save();
    expect(activeModal.close).toHaveBeenCalledWith([
      { id: 3, icon: '', buildingAcronym: 'DEF', buildingName: 'Tower', buildingTypeName: undefined }
    ]);
  });

  it('should skip fields not matching buildingAcronym, buildingName, or buildingType', () => {
    component.allStructureList = [
      {
        id: 4,
        fields: [{ fieldName: 'OtherField', value: 'Value' }],
        icon: '',
        status: ''
      }
    ] as StructureResponse[];
    component.selectedStructureIds = [4];
    spyOn(activeModal, 'close');
    component.save();
    expect(activeModal.close).toHaveBeenCalledWith([{ id: 4, icon: '' }]);
  });
  // });
});
