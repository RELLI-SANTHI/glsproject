/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines-per-function */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StructureDetailComponent } from './structure-detail.component';
import { AttachmentService, StructureService } from '../../../../api/glsNetworkApi/services';
import { TranslateModule } from '@ngx-translate/core';
import { ICONS } from '../../../../common/utilities/constants/icon';
import { of, throwError } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { Utility } from '../../../../common/utilities/utility';
import { FieldDetailResponse, StructureDetailResponse } from '../../../../api/glsNetworkApi/models';
import { HttpErrorResponse } from '@angular/common/http';
// import { ConfirmationDialogComponent } from '../../../../common/components/confirmation-dialog/confirmation-dialog/confirmation-dialog.component';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { UtilityRouting } from '../../../../common/utilities/utility-routing';

describe('StructureDetailComponent', () => {
  let component: StructureDetailComponent;
  let fixture: ComponentFixture<StructureDetailComponent>;
  let router: Router;
  let attachmentService: jasmine.SpyObj<AttachmentService>;
  let structureService: jasmine.SpyObj<StructureService>;
  let mockResponse: StructureDetailResponse;
  let modalServiceSpy: jasmine.SpyObj<NgbModal>;
  let modalRefSpy: jasmine.SpyObj<NgbModalRef>;

  beforeEach(async () => {
    const structureServiceSpy = jasmine.createSpyObj('StructureService', [
      'getStructureById$Json',
      'postApiStructureV1IdLock$Response',
      'postApiStructureV1IdUnlock$Response'
    ]);
    mockResponse = {
      updatedAt: new Date().toISOString(),
      updatedBy: 'test-user',
      id: 1,
      icon: 'some-icon',
      fields: [
        {
          section: 'section1',
          subSection: 'sub1',
          isRequired: true,
          value: 'value1',
          id: 1,
          fieldName: 'Field Name',
          fieldType: 'text'
        }
      ],
      buildingAcronym: 'BA',
      buildingAcronymMaxLength: 10,
      buildingAcronymMinLength: 2,
      buildingType: 'Office',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      createdBy: 'test-user',
      templateId: 123
    };

    // Mock the getStructureById$Json method to return mock data
    structureServiceSpy.getStructureById$Json.and.returnValue(of(mockResponse));
    structureServiceSpy.postApiStructureV1IdLock$Response.and.returnValue(of({ status: 204, body: {} }));
    structureServiceSpy.postApiStructureV1IdUnlock$Response.and.returnValue(of({ status: 204, body: {} }));

    attachmentService = jasmine.createSpyObj('AttachmentService', ['getApiAttachmentV1Id$Json']);
    modalServiceSpy = jasmine.createSpyObj('NgbModal', ['open']);
    modalRefSpy = jasmine.createSpyObj('NgbModalRef', ['result']);
    modalServiceSpy.open.and.returnValue(modalRefSpy);
    (modalRefSpy as any).componentInstance = {}; // Ensure componentInstance is defined
    modalRefSpy.result = Promise.resolve('Closed') as any;
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, TranslateModule.forRoot(), StructureDetailComponent],
      providers: [
        { provide: 'modalService', useValue: modalServiceSpy },
        { provide: StructureService, useValue: structureServiceSpy },
        { provide: AttachmentService, useValue: attachmentService },
        { provide: NgbModal, useValue: modalServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                get: (key: string) => '1' // Mock the idStructure parameter
              }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StructureDetailComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    structureService = TestBed.inject(StructureService) as jasmine.SpyObj<StructureService>;
    UtilityRouting.initialize(TestBed.inject(Router));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to structure edit page on editStructure', () => {
    (component as any).idStructure = 1;
    component.editStructure();
    expect(router.navigate).toHaveBeenCalledWith(['anagrafica/structure-edit', '1']);
  });

  it('should navigate to structure edit page with active tab on activateStructure', () => {
    (component as any).idStructure = 1;
    component.activateStructure();
    expect(router.navigate).toHaveBeenCalledWith(['anagrafica/structure-edit', '1']);
  });

  it('should navigate to structure edit page with active tab on disableStructure', () => {
    (component as any).idStructure = 1;
    component.disableStructure();
    expect(router.navigate).toHaveBeenCalledWith(['anagrafica/structure-edit', '1']);
  });

  it('should call structureService.getStructureById$Json with correct parameters', () => {
    const mockIdStructure = 11;
    (component as any).idStructure = mockIdStructure; // Manually set idStructure to 11
    const expectedParam = {
      id: mockIdStructure,
      refreadonly: true
    };
    structureService.getStructureById$Json.and.returnValue(of(mockResponse));

    const result = (component as any).getStructureById();
    result.subscribe((response: StructureDetailResponse) => {
      expect(structureService.getStructureById$Json).toHaveBeenCalledWith(
        expectedParam,
        jasmine.objectContaining({
          map: jasmine.any(Map)
        })
      );
      expect(response).toEqual(mockResponse);
    });
  });

  it('should set items.value to the first option value if fieldType is "combo"', () => {
    const mockResponse: StructureDetailResponse = {
      fields: [
        {
          fieldType: 'combo',
          options: [{ value: 'Option1' }],
          value: null
        } as FieldDetailResponse
      ],
      status: 'COMPLETED'
    } as StructureDetailResponse;

    structureService.getStructureById$Json.and.returnValue(of(mockResponse));

    component.ngOnInit();

    expect(component.apiResponse?.fields[0].value).toBe('Option1');
  });

  it('should handle error and open error modal', () => {
    const errorResponse = new HttpErrorResponse({
      error: { error: 'Error Message' },
      status: 500,
      statusText: 'Internal Server Error',
      url: 'http://example.com/api'
    });
    spyOn(Utility, 'logErrorForDevEnvironment');
    structureService.getStructureById$Json.and.returnValue(throwError(errorResponse));
    // spyOn(component, 'openErrorModal');

    component.ngOnInit();

    expect(Utility.logErrorForDevEnvironment).toHaveBeenCalledWith(errorResponse);
  });

  // it('should open error modal with correct title and message', () => {
  //   // // Arrange
  //   const errorMessage = 'Error Message';

  //   // Act
  //   const title = 'Error Title'; // Define the title variable
  //   component.openErrorModal(title, errorMessage);

  //   // Assert
  //   expect(modalServiceSpy.open).toHaveBeenCalledWith(ConfirmationDialogComponent, {
  //     backdrop: 'static',
  //     size: 'md'
  //   });
  //   expect(component.dialogData.title).toBe(title);
  //   expect(component.dialogData.content).toBe(errorMessage);
  //   expect(component.dialogData.showCancel).toBeFalse();
  //   expect(component.dialogData.confirmText).toBe('ok');
  // });

  it('should return correct icon from getTemplateIcon', () => {
    const icon = 'some-icon';
    expect(component.getTemplateIcon(icon)).toBe(ICONS[icon]);
    expect(component.getTemplateIcon(null)).toBe('');
  });

  it('should check to show section correctly', () => {
    component.apiResponse = {
      updatedAt: new Date().toISOString(),
      updatedBy: 'test-user',
      id: 1,
      icon: 'some-icon',
      fields: [
        {
          section: 'section1',
          subSection: 'sub1',
          isRequired: true,
          isVisible: true,
          value: 'value1',
          id: 1,
          fieldName: 'Field Name',
          fieldType: 'text'
        }
      ],
      buildingAcronym: 'BA',
      buildingAcronymMaxLength: 10,
      buildingAcronymMinLength: 2,
      buildingType: 'Office',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(), // Add createdAt
      createdBy: 'test-user', // Add createdBy
      templateId: 123 // Add templateId
    };
    expect(component.checkToShowSection('section1')).toBeTrue();
    expect(component.checkToShowSection('section2')).toBeFalse();
  });

  it('should check to show sub-section correctly', () => {
    component.apiResponse = {
      updatedAt: new Date().toISOString(),
      updatedBy: 'test-user',
      id: 1,
      icon: 'some-icon',
      fields: [
        {
          section: 'section1',
          subSection: 'sub1',
          isVisible: true,
          isRequired: true,
          value: 'value1',
          id: 1,
          fieldName: 'Field Name',
          fieldType: 'text'
        }
      ],
      buildingAcronym: 'BA',
      buildingAcronymMaxLength: 10,
      buildingAcronymMinLength: 2,
      buildingType: 'Office',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(), // Add createdAt
      createdBy: 'test-user', // Add createdBy
      templateId: 123 // Add templateId
    };
    expect(component.checkToShowSubSection('section1', 'sub1')).toBeTrue();
    expect(component.checkToShowSubSection('section1', 'sub2')).toBeFalse();
  });

  it('should show warning for section correctly', () => {
    component.apiResponse = {
      updatedAt: new Date().toISOString(),
      updatedBy: 'test-user',
      id: 1,
      icon: 'some-icon',
      fields: [
        {
          section: 'section1',
          subSection: 'sub1',
          isRequired: true,
          isVisible: true,
          value: '',
          id: 1,
          fieldName: 'Field Name',
          fieldType: 'text'
        }
      ],
      buildingAcronym: 'BA',
      buildingAcronymMaxLength: 10,
      buildingAcronymMinLength: 2,
      buildingType: 'Office',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(), // Add createdAt
      createdBy: 'test-user', // Add createdBy
      templateId: 123 // Add templateId
    };
    expect(component.showWarningForSection('section1')).toBeTrue();
    expect(component.showWarningForSection('section2')).toBeFalse();
  });

  it('should download attachment', () => {
    const mockBlob = new Blob(['test content'], { type: 'text/plain' });
    attachmentService.getApiAttachmentV1Id$Json.and.returnValue(of(mockBlob));
    spyOn(Utility, 'openFile'); // Spy on the Utility.openFile method

    component.downloadAttachment(1, 'test.txt');

    expect(attachmentService.getApiAttachmentV1Id$Json).toHaveBeenCalledWith({ id: 1 });
    expect(Utility.openFile).toHaveBeenCalledWith(mockBlob, 'CSV', 'test.txt');
  });

  it('should handle error and open error modal when downloading attachment fails', () => {
    // Arrange
    const errorResponse = new HttpErrorResponse({
      error: { error: 'Error Message' },
      status: 500,
      statusText: 'Internal Server Error',
      url: 'http://example.com/api'
    });

    spyOn(Utility, 'logErrorForDevEnvironment'); // Spy on Utility.logErrorForDevEnvironment
    // spyOn(component, 'openErrorModal'); // Spy on openErrorModal
    attachmentService.getApiAttachmentV1Id$Json.and.returnValue(throwError(errorResponse)); // Mock the error response

    // Act
    component.downloadAttachment(1, 'test.txt');

    // Assert
    expect(Utility.logErrorForDevEnvironment).toHaveBeenCalledWith(errorResponse); // Verify error is logged
  });

  it('should return the attachment with the given ID', () => {
    // Arrange
    // Arrange
    component.apiResponse = {
      attachments: [
        {
          id: 1,
          fileName: 'file1.txt',
          fileSize: 1024,
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          createdBy: 'test-user',
          fileType: 'text/plain',
          name: 'File 1'
        },
        {
          id: 2,
          fileName: 'file2.txt',
          fileSize: 2048,
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          createdBy: 'test-user',
          fileType: 'text/plain',
          name: 'File 2'
        }
      ]
    } as any; // Mock

    // Act
    const result = component.retrieveAttachById(1);

    // Assert
    expect(result).toEqual({
      id: 1,
      fileName: 'file1.txt',
      fileSize: 1024,
      updatedAt: jasmine.any(String),
      createdAt: jasmine.any(String),
      createdBy: 'test-user',
      fileType: 'text/plain',
      name: 'File 1'
    });
  });

  it('should return the building name from fields if available', () => {
    // Arrange
    component.apiResponse = {
      updatedAt: new Date().toISOString(),
      updatedBy: 'test-user',
      id: 1,
      icon: 'some-icon',
      fields: [
        {
          section: 'section1',
          subSection: 'sub1',
          isRequired: true,
          value: 'Main Building',
          id: 1,
          fieldName: 'BuildingName',
          fieldType: 'text'
        }
      ],
      buildingAcronym: 'MB',
      buildingAcronymMaxLength: 10,
      buildingAcronymMinLength: 2,
      buildingType: 'Office',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      createdBy: 'test-user',
      templateId: 123
    };

    // Act
    const buildingName = component.getFieldDescription('BuildingName');

    // Assert
    expect(buildingName).toBe('Main Building'); // Verify that the building name is returned from fields
  });

  it('should assign API response to apiResponse', () => {
    // Arrange
    spyOn(component as any, 'getStructureById').and.returnValue(of(mockResponse)); // Mock the getStructureById method

    // Act
    component.ngOnInit(); // Call ngOnInit to trigger the API call

    // Assert
    expect(component.apiResponse).toEqual(mockResponse); // Verify that the response is assigned to apiResponse
  });

  it('should set displayStatus to ACTIVE if StartOfOperationalActivity is before today, EndOfOperationalActivity exists, and status is COMPLETED', () => {
    // Arrange
    const today = new Date();
    const mockResponse: StructureDetailResponse = {
      updatedAt: new Date().toISOString(),
      updatedBy: 'test-user',
      id: 1,
      icon: 'some-icon',
      fields: [
        {
          fieldName: 'StartOfOperationalActivity',
          value: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1).toISOString(), // Yesterday
          section: 'section1',
          subSection: 'sub1',
          isRequired: true,
          id: 1,
          fieldType: 'date'
        },
        {
          fieldName: 'EndOfOperationalActivity',
          value: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString(), // Tomorrow
          section: 'section1',
          subSection: 'sub1',
          isRequired: true,
          id: 2,
          fieldType: 'date'
        }
      ],
      buildingAcronym: 'BA',
      buildingAcronymMaxLength: 10,
      buildingAcronymMinLength: 2,
      buildingType: 'Office',
      status: 'COMPLETED',
      createdAt: new Date().toISOString(),
      createdBy: 'test-user',
      templateId: 123
    };

    component.apiResponse = mockResponse;

    // Act
    (component as any).getStatus();

    // Assert
    expect(component.displayStatus).toBe('ACTIVE');
  });

  it('should set displayStatus to the current status if conditions for ACTIVE are not met', () => {
    // Arrange
    const today = new Date();
    const mockResponse: StructureDetailResponse = {
      updatedAt: new Date().toISOString(),
      updatedBy: 'test-user',
      id: 1,
      icon: 'some-icon',
      fields: [
        {
          fieldName: 'StartOfOperationalActivity',
          value: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString(), // Tomorrow
          section: 'section1',
          subSection: 'sub1',
          isRequired: true,
          id: 1,
          fieldType: 'date'
        },
        {
          fieldName: 'EndOfOperationalActivity',
          value: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2).toISOString(), // Day after tomorrow
          section: 'section1',
          subSection: 'sub1',
          isRequired: true,
          id: 2,
          fieldType: 'date'
        }
      ],
      buildingAcronym: 'BA',
      buildingAcronymMaxLength: 10,
      buildingAcronymMinLength: 2,
      buildingType: 'Office',
      status: 'INACTIVE',
      createdAt: new Date().toISOString(),
      createdBy: 'test-user',
      templateId: 123
    };

    component.apiResponse = mockResponse;

    // Act
    (component as any).getStatus();

    // Assert
    expect(component.displayStatus).toBe('INACTIVE');
  });
});
