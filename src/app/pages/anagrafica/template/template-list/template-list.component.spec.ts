/* eslint-disable max-lines-per-function */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { TemplateListComponent } from './template-list.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TemplateService } from '../../../../api/glsNetworkApi/services';
import { TemplateModel } from '../../../../api/glsNetworkApi/models';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpErrorResponse } from '@angular/common/http';
import { ICONS } from '../../../../common/utilities/constants/icon';
import { UtilityRouting } from '../../../../common/utilities/utility-routing';

describe('TemplateListComponent', () => {
  let component: TemplateListComponent;
  let fixture: ComponentFixture<TemplateListComponent>;
  let templateService: jasmine.SpyObj<TemplateService>;
  let router: jasmine.SpyObj<Router>;
  let mockTemplates: TemplateModel[];

  const activatedRoute = {
    snapshot: {
      paramMap: { get: () => 'mock-param' }
    },
    queryParams: of({})
  };

  beforeEach(async () => {
    const templateServiceSpy = jasmine.createSpyObj('TemplateService', ['getApiTemplateV1$Json']);
    mockTemplates = [
      {
        id: 1,
        templateName: 'Template 1',
        icon: 'icon1',
        buildingAcronymMaxLength: 10,
        buildingAcronymMinLength: 2,
        updatedAt: '2023-01-01T00:00:00Z',
        updatedBy: 'User1',
        createdAt: '2023-01-01T00:00:00Z',
        createdBy: 'Creator1'
      },
      {
        id: 2,
        templateName: 'Template 2',
        icon: 'icon2',
        buildingAcronymMaxLength: 10,
        buildingAcronymMinLength: 2,
        updatedAt: '2023-01-02T00:00:00Z',
        updatedBy: 'User2',
        createdAt: '2023-01-02T00:00:00Z',
        createdBy: 'Creator2'
      }
    ];

    // Mock the apiTemplateV1Get$Json method to return an observable
    templateServiceSpy.getApiTemplateV1$Json.and.returnValue(of(mockTemplates));
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const modalServiceSpy = jasmine.createSpyObj('NgbModal', ['open']);
    await TestBed.configureTestingModule({
      imports: [TemplateListComponent, TranslateModule.forRoot(), HttpClientTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: TemplateService, useValue: templateServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: NgbModal, useValue: modalServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TemplateListComponent);
    component = fixture.componentInstance;
    templateService = TestBed.inject(TemplateService) as jasmine.SpyObj<TemplateService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
    UtilityRouting.initialize(router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should retrieve templates and assign them to templateResponseList', () => {
    // Arrange
    const mockTemplates = [
      { id: 1, templateName: 'Template 1', icon: 'icon1' } as TemplateModel,
      { id: 2, templateName: 'Template 2', icon: 'icon2' } as TemplateModel
    ];
    templateService.getApiTemplateV1$Json.and.returnValue(of(mockTemplates));

    // Act
    component.ngOnInit();

    // Assert
    expect(templateService.getApiTemplateV1$Json).toHaveBeenCalled();
    expect(component.templateResponseList).toEqual(mockTemplates);
  });

  it('should handle error when retrieving templates', () => {
    // Arrange
    const mockError = new HttpErrorResponse({ error: { error: 'Error occurred' } });
    templateService.getApiTemplateV1$Json.and.returnValue(throwError(() => mockError));

    // Act
    component.ngOnInit();

    // Assert
    expect(templateService.getApiTemplateV1$Json).toHaveBeenCalled();
  });

  it('should navigate to template detail page on goToTemplateDetail', () => {
    // Act
    component.goToTemplateDetail(1);

    // Assert
    expect(router.navigate).toHaveBeenCalledWith(['anagrafica/template-detail', '1']);
  });

  it('should retrieve the correct icon for a template', () => {
    // Arrange
    const mockIcon = 'icon1';
    ICONS[mockIcon] = 'mock-icon-path';

    // Act
    const result = component.getTemplateIcon(mockIcon);

    // Assert
    expect(result).toBe('mock-icon-path');
  });

  it('should navigate to template creation page on newTemplate', () => {
    component.newTemplate();
    expect(router.navigate).toHaveBeenCalledWith(['anagrafica/template-new']);
  });
});
