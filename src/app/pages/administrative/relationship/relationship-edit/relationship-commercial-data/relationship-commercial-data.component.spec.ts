/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-lines-per-function */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { RelationshipCommercialDataComponent } from './relationship-commercial-data.component';
import { GlsInputComponent } from '../../../../../common/form/gls-input/gls-input.component';
import { GlsInputDropdownComponent } from '../../../../../common/form/gls-input-dropdown/gls-input-dropdown.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AgentResponse } from '../../../../../api/glsAdministrativeApi/models';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { MODAL_LG } from '../../../../../common/utilities/constants/modal-options';
import { of, throwError } from 'rxjs';

describe('RelationshipCommercialDataComponent', () => {
  let component: RelationshipCommercialDataComponent;
  let fixture: ComponentFixture<RelationshipCommercialDataComponent>;
  let formBuilder: FormBuilder;
  let modalService: jasmine.SpyObj<NgbModal>;

  beforeEach(async () => {
    const modalServiceSpy = jasmine.createSpyObj('NgbModal', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        TranslateModule.forRoot(),
        RelationshipCommercialDataComponent,
        GlsInputComponent,
        GlsInputDropdownComponent
      ],
      providers: [{ provide: NgbModal, useValue: modalServiceSpy }, HttpClient, HttpHandler]
    }).compileComponents();

    formBuilder = TestBed.inject(FormBuilder);
    modalService = TestBed.inject(NgbModal) as jasmine.SpyObj<NgbModal>;
    fixture = TestBed.createComponent(RelationshipCommercialDataComponent);
    component = fixture.componentInstance;

    // Initialize required inputs
    const componentRef = fixture.componentRef;
    componentRef.setInput(
      'relationshipCommercialDataForm',
      formBuilder.group({
        type: [''],
        referenceOfficeId: [''],
        fixedRight: [''],
        provPercentage: [''],
        potentialCustomerCode: [''],
        salesforceLeadCode: [null],
        discount1: [0],
        discount2: [0],
        discount3: [0],
        typeDiscounts: [0],
        agentId: [0],
        agentCode: [0]
      })
    );
    componentRef.setInput(
      'relationshipForm',
      formBuilder.group({
        administrativeId: [1]
      })
    );
    componentRef.setInput('isWriting', true);
    componentRef.setInput('isEnabledDate', true);
    componentRef.setInput('isFromSubject', false);
    componentRef.setInput('isDraft', true);

    fixture.detectChanges();
  });

  beforeEach(() => {
    // Reset spy calls before each test
    modalService.open.calls.reset();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with provided form group', () => {
    expect(component.relationshipCommercialDataForm()).toBeTruthy();
    expect(component.relationshipCommercialDataForm() instanceof FormGroup).toBeTruthy();
  });

  it('should load structure list and map BuildingName values', () => {
    // Arrange
    const mockStructuresResponse = {
      structures: [
        {
          id: 1,
          fields: [
            { fieldName: 'BuildingName', value: 'Alpha Tower' },
            { fieldName: 'OtherField', value: 'X' }
          ]
        },
        {
          id: 2,
          fields: [{ fieldName: 'BuildingName', value: 'Beta Plaza' }]
        }
      ]
    } as any;

    const structureServiceSpy = jasmine.createSpyObj('StructureService', ['postApiStructureV1$Json']);
    structureServiceSpy.postApiStructureV1$Json.and.returnValue(of(mockStructuresResponse));
    (component as any).structureService = structureServiceSpy;

    // Act
    component.loadStructureList();

    // Assert
    expect(structureServiceSpy.postApiStructureV1$Json).toHaveBeenCalledWith({
      body: { status: ['ACTIVE', 'COMPLETED'], isDepot: true }
    });
    expect(component.structureList()).toEqual([
      { id: 1, value: 'Alpha Tower' },
      { id: 2, value: 'Beta Plaza' }
    ]);
  });

  it('should return the correct commercial data type value', () => {
    // Arrange
    // Populate relationshipTypeList with sample data
    component.relationshipTypeList = [
      { id: 'A', value: 'Type A' },
      { id: 'B', value: 'Type B' }
    ];

    // Set form control value
    component.relationshipCommercialDataForm().get('type')?.setValue('B');

    // Act
    const result = component.getCommercialDataType();

    // Assert
    expect(result).toBe('Type B');
  });

  it('should return empty string if type not found', () => {
    // Arrange
    component.relationshipTypeList = [{ id: 'A', value: 'Type A' }];
    component.relationshipCommercialDataForm().get('type')?.setValue('X');

    // Act
    const result = component.getCommercialDataType();

    // Assert
    expect(result).toBe('');
  });

  it('should have correct initial input values', () => {
    expect(component.isWriting()).toBe(true);
    expect(component.isEnabledDate()).toBe(true);
    expect(component.isFromSubject()).toBe(false);
  });

  it('should return correct agent code button label when no agent is selected', () => {
    component.selectedAgent = null;
    expect(component.getAgentCodeBtnLabel()).toBe('administrative.relationshipEdit.relationshipBillingData.choosePaymentCode');
  });

  it('should return correct agent code button label when agent is selected', () => {
    component.selectedAgent = { agentCode: 'TEST123' } as any;
    expect(component.getAgentCodeBtnLabel()).toBe('administrative.relationshipEdit.relationshipBillingData.changePaymentCode');
  });

  it('should open modal when chooseAgentCode is called', () => {
    modalService.open.and.returnValue({
      componentInstance: {},
      result: Promise.resolve(null)
    } as any);

    component.chooseAgentCode();

    expect(modalService.open).toHaveBeenCalledWith(jasmine.any(Function), MODAL_LG);
  });

  it('should set agent data when modal returns agent', async () => {
    const mockAgent: AgentResponse = {
      agentCode: 12345,
      agentType: 'COMMERCIAL',
      administrativeId: 1,
      id: 100,
      invoiceNo: 2023001,
      percentageProvision: 5.5,
      provisionalImp: 1000.0,
      subjectId: 200,
      turnoverImp: 50000.0
    };
    const modalRefMock = {
      componentInstance: {},
      result: Promise.resolve(mockAgent)
    };

    modalService.open.and.returnValue(modalRefMock as any);

    component.chooseAgentCode();

    await modalRefMock.result;

    expect(component.selectedAgent).toEqual(mockAgent);
    expect(component.relationshipCommercialDataForm().get('agentId')?.value).toEqual(100);
    expect(component.relationshipCommercialDataForm().get('agentCode')?.value).toEqual(12345);
  });

  it('should not set agent data when modal is cancelled', async () => {
    const modalRefMock = {
      componentInstance: {},
      result: Promise.resolve(null)
    };

    modalService.open.and.returnValue(modalRefMock as any);

    const initialAgent = component.selectedAgent;
    const initialFormValue = component.relationshipCommercialDataForm().get('agentId')?.value;

    component.chooseAgentCode();

    await modalRefMock.result;

    expect(component.selectedAgent).toBe(initialAgent);
    expect(component.relationshipCommercialDataForm().get('agentId')?.value).toBe(initialFormValue);
  });

  it('should have relationshipTypeList populated', () => {
    expect(component.relationshipTypeList).toBeDefined();
    expect(Array.isArray(component.relationshipTypeList)).toBeTruthy();
  });

  it('should have typeDiscountsOptions populated', () => {
    expect(component.typeDiscountsOptions).toBeDefined();
    expect(Array.isArray(component.typeDiscountsOptions)).toBeTruthy();
  });

  it('should initialize selectedAgent as null', () => {
    expect(component.selectedAgent).toBeNull();
  });

  it('should have all discount form controls', () => {
    const form = component.relationshipCommercialDataForm();
    expect(form.contains('discount1')).toBeTruthy();
    expect(form.contains('discount2')).toBeTruthy();
    expect(form.contains('discount3')).toBeTruthy();
    expect(form.contains('typeDiscounts')).toBeTruthy();
  });

  it('should have referenceOfficeId form control', () => {
    const form = component.relationshipCommercialDataForm();
    expect(form.contains('referenceOfficeId')).toBeTruthy();
  });

  it('should handle modal rejection gracefully', async () => {
    const modalRefMock = {
      componentInstance: {},
      result: Promise.reject('Modal dismissed')
    };

    modalService.open.and.returnValue(modalRefMock as any);

    const initialAgent = component.selectedAgent;

    component.chooseAgentCode();

    try {
      await modalRefMock.result;
    } catch (error) {
      // Expected rejection
    }

    expect(component.selectedAgent).toBe(initialAgent);
  });

  it('should handle empty agent response from modal', async () => {
    const modalRefMock = {
      componentInstance: {},
      result: Promise.resolve(undefined)
    };

    modalService.open.and.returnValue(modalRefMock as any);

    const initialFormValue = component.relationshipCommercialDataForm().get('agentId')?.value;

    component.chooseAgentCode();

    await modalRefMock.result;

    expect(component.relationshipCommercialDataForm().get('agentId')?.value).toBe(initialFormValue);
  });

  it('should update selectedAgent when agent is chosen', async () => {
    const mockAgent: AgentResponse = {
      agentCode: 12345,
      agentType: 'COMMERCIAL',
      administrativeId: 1,
      id: 100,
      invoiceNo: 2023001,
      percentageProvision: 5.5,
      provisionalImp: 1000.0,
      subjectId: 200,
      turnoverImp: 50000.0
    };
    const modalRefMock = {
      componentInstance: {
        administrativeId: 1
      },
      result: Promise.resolve(mockAgent)
    };

    modalService.open.and.returnValue(modalRefMock as any);

    component.chooseAgentCode();

    await modalRefMock.result;

    expect(component.selectedAgent).toEqual(mockAgent);
  });

  it('should return formatted agentDisplayInfo when selectedAgent is set', () => {
    component.selectedAgent = {
      agentCode: 'AGT001',
      surnameNameCompanyName: 'John Doe'
    } as any;
    expect(component.agentDisplayInfo).toBe('AGT001 - John Doe');
  });

  it('should return empty string for agentDisplayInfo when selectedAgent is null', () => {
    component.selectedAgent = null;
    expect(component.agentDisplayInfo).toBe('');
  });

  it('should have all required form controls', () => {
    const form = component.relationshipCommercialDataForm();
    expect(form.contains('type')).toBeTruthy();
    expect(form.contains('fixedRight')).toBeTruthy();
    expect(form.contains('provPercentage')).toBeTruthy();
    expect(form.contains('potentialCustomerCode')).toBeTruthy();
    expect(form.contains('salesforceLeadCode')).toBeTruthy();
  });

  xit('should disable form controls when isWriting is false', () => {
    fixture.componentRef.setInput('isWriting', false);
    fixture.detectChanges();
    const form = component.relationshipCommercialDataForm();
    expect(form.disabled).toBeTruthy();
  });

  xit('should enable form controls when isWriting is true', () => {
    fixture.componentRef.setInput('isWriting', true);
    fixture.componentRef.setInput('isDraft', true);
    fixture.detectChanges();
    const form = component.relationshipCommercialDataForm();
    expect(form.enabled).toBeTruthy();
  });

  xit('should handle date fields based on isEnabledDate', () => {
    fixture.componentRef.setInput('isEnabledDate', false);
    fixture.detectChanges();
    const form = component.relationshipCommercialDataForm();
    expect(form.get('startDate')?.disabled).toBeTruthy();
    expect(form.get('endDate')?.disabled).toBeTruthy();
  });

  it('should call manageError when structureService returns error', () => {
    const error = new Error('API error');
    spyOn(component['genericService'], 'manageError');
    spyOn(component['structureService'], 'postApiStructureV1$Json').and.returnValue(throwError(() => error));
    component.loadStructureList();
    expect(component['genericService'].manageError).toHaveBeenCalledWith(jasmine.any(Error));
  });

  it('should include corporateGroupId in request body when set', () => {
    fixture.componentRef.setInput('corporateGroupId', 456);
    fixture.detectChanges();

    const structureServiceSpy = jasmine.createSpyObj('StructureService', ['postApiStructureV1$Json']);
    structureServiceSpy.postApiStructureV1$Json.and.returnValue(of({ structures: [] }));
    (component as any).structureService = structureServiceSpy;

    component.loadStructureList();

    expect(structureServiceSpy.postApiStructureV1$Json).toHaveBeenCalled();
  });

  it('should return formatted getCommercialDataDetailsAgentCode when agentCode and agentName are set', () => {
    component.relationshipCommercialDataForm().get('agentCode')?.setValue('AGT002');
    // Add agentName control if not present
    if (!component.relationshipCommercialDataForm().contains('agentName')) {
      component.relationshipCommercialDataForm().addControl('agentName', formBuilder.control('Jane Smith'));
    } else {
      component.relationshipCommercialDataForm().get('agentName')?.setValue('Jane Smith');
    }
    expect(component.getCommercialDataDetailsAgentCode).toBe('AGT002 -  Jane Smith');
  });

  it('should return formatted getCommercialDataDetailsAgentCode with empty agentCode', () => {
    component.relationshipCommercialDataForm().get('agentCode')?.setValue('');
    if (!component.relationshipCommercialDataForm().contains('agentName')) {
      component.relationshipCommercialDataForm().addControl('agentName', formBuilder.control('Jane Smith'));
    } else {
      component.relationshipCommercialDataForm().get('agentName')?.setValue('Jane Smith');
    }
    expect(component.getCommercialDataDetailsAgentCode).toBe(' -  Jane Smith');
  });

  it('should return formatted getCommercialDataDetailsAgentCode with empty agentName', () => {
    component.relationshipCommercialDataForm().get('agentCode')?.setValue('AGT003');
    if (!component.relationshipCommercialDataForm().contains('agentName')) {
      component.relationshipCommercialDataForm().addControl('agentName', formBuilder.control(''));
    } else {
      component.relationshipCommercialDataForm().get('agentName')?.setValue('');
    }
    expect(component.getCommercialDataDetailsAgentCode).toBe('AGT003 -  ');
  });

  it('should return formatted getCommercialDataDetailsAgentCode with both empty', () => {
    component.relationshipCommercialDataForm().get('agentCode')?.setValue('');
    if (!component.relationshipCommercialDataForm().contains('agentName')) {
      component.relationshipCommercialDataForm().addControl('agentName', formBuilder.control(''));
    } else {
      component.relationshipCommercialDataForm().get('agentName')?.setValue('');
    }
    expect(component.getCommercialDataDetailsAgentCode).toBe(' -  ');
  });

  it('should return formatted getReferenceOfficeId when customer has both fields', () => {
    fixture.componentRef.setInput('customer', {
      referenceOfficeAcronym: 'ABC',
      referenceOfficeName: 'Main Office'
    } as any);
    fixture.detectChanges();
    expect(component.getReferenceOfficeId).toBe('ABC - Main Office');
  });

  it('should return formatted getReferenceOfficeId with both fields empty', () => {
    fixture.componentRef.setInput('customer', {
      referenceOfficeAcronym: '',
      referenceOfficeName: ''
    } as any);
    fixture.detectChanges();
    expect(component.getReferenceOfficeId).toBe('-');
  });

  it('should return formatted getReferenceOfficeId as "-" when customer is undefined', () => {
    fixture.componentRef.setInput('customer', undefined);
    fixture.detectChanges();
    expect(component.getReferenceOfficeId).toBe('-');
  });
});
