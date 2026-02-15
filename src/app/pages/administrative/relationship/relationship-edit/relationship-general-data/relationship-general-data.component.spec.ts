/* eslint-disable max-lines-per-function */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RelationshipGeneralDataComponent } from './relationship-general-data.component';
import { CategoryService } from '../../../../../api/glsAdministrativeApi/services';
import { TranslateModule } from '@ngx-translate/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { TypeCustomer } from '../../enum/type-customer';
import { GenericService } from '../../../../../common/utilities/services/generic.service';

describe('RelationshipGeneralDataComponent', () => {
  let component: RelationshipGeneralDataComponent;
  let fixture: ComponentFixture<RelationshipGeneralDataComponent>;
  let mockCategoryService: jasmine.SpyObj<CategoryService>;
  let mockGenericService: jasmine.SpyObj<GenericService>;
  let formBuilder: FormBuilder;

  beforeEach(async () => {
    mockCategoryService = jasmine.createSpyObj('CategoryService', ['postApiCategoryV1$Json']);
    mockGenericService = jasmine.createSpyObj('GenericService', ['manageError']);

    await TestBed.configureTestingModule({
      imports: [RelationshipGeneralDataComponent, TranslateModule.forRoot(), ReactiveFormsModule],
      providers: [
        { provide: CategoryService, useValue: mockCategoryService },
        { provide: GenericService, useValue: mockGenericService }
      ]
    }).compileComponents();

    formBuilder = TestBed.inject(FormBuilder);
    fixture = TestBed.createComponent(RelationshipGeneralDataComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should filter items with categoryCode "802" for ClientLac', () => {
    const mockResponse = {
      items: [
        { id: 1, categoryDescription: 'Desc1', categoryCode: '802' },
        { id: 2, categoryDescription: 'Desc2', categoryCode: '803' }
      ],
      totalItems: 2,
      totalPages: 1
    };
    mockCategoryService.postApiCategoryV1$Json.and.returnValue(of(mockResponse));
    fixture.componentRef.setInput(
      'relationshipGeneralDataForm',
      formBuilder.group({
        categoryId: [''],
        typeRelationship: [TypeCustomer.ClientLac]
      })
    );
    fixture.componentRef.setInput('isWriting', true);
    fixture.componentRef.setInput('isDraft', true);
    component.ngOnInit();
    expect(component.categoryClientList()).toEqual([{ id: 1, value: '802 - Desc1' }]);
  });

  it('should filter items with categoryCode not "802" for other customers', () => {
    const mockResponse = {
      items: [
        { id: 1, categoryDescription: 'Desc1', categoryCode: '802' },
        { id: 2, categoryDescription: 'Desc2', categoryCode: '803' }
      ],
      totalItems: 2,
      totalPages: 1
    };
    mockCategoryService.postApiCategoryV1$Json.and.returnValue(of(mockResponse));
    fixture.componentRef.setInput(
      'relationshipGeneralDataForm',
      formBuilder.group({
        categoryId: [''],
        typeRelationship: ['OtherType']
      })
    );
    fixture.componentRef.setInput('isWriting', true);
    fixture.componentRef.setInput('isDraft', true);
    component.ngOnInit();
    expect(component.categoryClientList()).toEqual([{ id: 2, value: '803 - Desc2' }]);
  });

  it('should handle error in getCategoryClientList', () => {
    mockCategoryService.postApiCategoryV1$Json.and.returnValue(throwError(() => new Error('API Error')));
    fixture.componentRef.setInput(
      'relationshipGeneralDataForm',
      formBuilder.group({
        categoryId: [''],
        typeRelationship: [TypeCustomer.ClientLac]
      })
    );
    fixture.componentRef.setInput('isWriting', true);
    fixture.componentRef.setInput('isDraft', true);
    component.ngOnInit();
    expect(mockGenericService.manageError).toHaveBeenCalled();
  });

  it('should handle empty response', () => {
    const mockResponse = { items: [], totalItems: 0, totalPages: 0 };
    mockCategoryService.postApiCategoryV1$Json.and.returnValue(of(mockResponse));
    fixture.componentRef.setInput(
      'relationshipGeneralDataForm',
      formBuilder.group({
        categoryId: [''],
        typeRelationship: [TypeCustomer.ClientLac]
      })
    );
    fixture.componentRef.setInput('isWriting', true);
    fixture.componentRef.setInput('isDraft', true);
    component.ngOnInit();
    expect(component.categoryClientList()).toEqual([]);
  });

  it('should not filter if typeCustomer is undefined', () => {
    const mockResponse = {
      items: [
        { id: 1, categoryDescription: 'Desc1', categoryCode: '802' },
        { id: 2, categoryDescription: 'Desc2', categoryCode: '803' }
      ],
      totalItems: 2,
      totalPages: 1
    };
    mockCategoryService.postApiCategoryV1$Json.and.returnValue(of(mockResponse));
    fixture.componentRef.setInput(
      'relationshipGeneralDataForm',
      formBuilder.group({
        categoryId: [''],
        typeRelationship: [undefined]
      })
    );
    fixture.componentRef.setInput('isWriting', true);
    fixture.componentRef.setInput('isDraft', true);
    component['typeCustomer'] = undefined;
    component['getCategoryClientList']();
    expect(component.categoryClientList()).toEqual([{ id: 2, value: '803 - Desc2' }]);
  });

  it('should handle multiple items with the same categoryCode', () => {
    const mockResponse = {
      items: [
        { id: 1, categoryDescription: 'Desc1', categoryCode: '802' },
        { id: 2, categoryDescription: 'Desc2', categoryCode: '802' },
        { id: 3, categoryDescription: 'Desc3', categoryCode: '803' }
      ],
      totalItems: 3,
      totalPages: 1
    };
    mockCategoryService.postApiCategoryV1$Json.and.returnValue(of(mockResponse));
    fixture.componentRef.setInput(
      'relationshipGeneralDataForm',
      formBuilder.group({
        categoryId: [''],
        typeRelationship: [TypeCustomer.ClientLac]
      })
    );
    fixture.componentRef.setInput('isWriting', true);
    fixture.componentRef.setInput('isDraft', true);
    component.ngOnInit();
    expect(component.categoryClientList()).toEqual([
      { id: 1, value: '802 - Desc1' },
      { id: 2, value: '802 - Desc2' }
    ]);
  });

  it('should return correct label for existing category', () => {
    component['listCategoryClient'] = [
      { id: 1, categoryCode: '802', categoryDescription: 'Desc1' },
      { id: 2, categoryCode: '803', categoryDescription: 'Desc2' }
    ];
    const label = component.getCategoryCustomerLabel('802');
    expect(label).toBe('802 - Desc1');
  });

  it('should return "--" for non-existing category', () => {
    component['listCategoryClient'] = [
      { id: 1, categoryCode: '802', categoryDescription: 'Desc1' }
    ];
    const label = component.getCategoryCustomerLabel('999');
    expect(label).toBe('--');
  });
});
