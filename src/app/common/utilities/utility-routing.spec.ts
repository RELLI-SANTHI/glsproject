/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines-per-function */
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { UtilityRouting } from './utility-routing';
import { RelationshipType } from '../../pages/administrative/relationship/enum/relationship-type';
import { RouterTestingModule } from '@angular/router/testing';

describe('UtilityRouting', () => {
  let router: Router;
  let navigateSpy: jasmine.Spy;
  let navigateByUrlSpy: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule]
    });

    router = TestBed.inject(Router);
    navigateSpy = spyOn(router, 'navigate');
    navigateByUrlSpy = spyOn(router, 'navigateByUrl');

    UtilityRouting.initialize(router);
  });

  it('should navigate to a link with param', () => {
    UtilityRouting.navigateTo('test-path', '123');
    expect(navigateSpy).toHaveBeenCalledWith(['test-path', '123']);
  });

  it('should navigate to a link without param', () => {
    UtilityRouting.navigateTo('test-path');
    expect(navigateSpy).toHaveBeenCalledWith(['test-path']);
  });

  it('should navigate by URL', () => {
    UtilityRouting.navigateByUrl('/some-url');
    expect(navigateByUrlSpy).toHaveBeenCalledWith('/some-url');
  });

  it('should navigate to home', () => {
    UtilityRouting.navigateToHome();
    expect(navigateSpy).toHaveBeenCalledWith(['home']);
  });

  xit('should relocate to home using setLocationHref', () => {
    const setHrefSpy = spyOn<any>(UtilityRouting, 'setLocationHref');
    UtilityRouting.relocateToHome();
    expect(setHrefSpy).toHaveBeenCalledWith('/home');
  });

  it('should navigate to structure detail by ID', () => {
    UtilityRouting.navigateToStructureDetailByStructureId('abc');
    expect(navigateSpy).toHaveBeenCalledWith(['anagrafica/structure-detail', 'abc']);
  });

  it('should navigate to society edit with query param', () => {
    UtilityRouting.navigateToSocietyEditById(101);
    expect(navigateSpy).toHaveBeenCalledWith(['administrative/company-edit', 101], {
      queryParams: { isEditable: true }
    });
  });

  it('should navigate to relationship detail for Agent', () => {
    UtilityRouting.navigateToRelationshipDetailById('rel123', RelationshipType.Agent);
    expect(navigateSpy).toHaveBeenCalledWith(['administrative/relationship-detail-agent', 'rel123', RelationshipType.Agent]);
  });

  it('should navigate to subject create', () => {
    UtilityRouting.navigateToSubjectCreate();
    expect(navigateSpy).toHaveBeenCalledWith(['administrative/subject-new']);
  });

  it('should navigate to subject edit with id and fromDetail', () => {
    UtilityRouting.navigateToSubjectEdit('subj123', true);
    expect(navigateSpy).toHaveBeenCalledWith(['administrative/subject-edit', 'subj123', true]);
  });

  it('should navigate to subject list', () => {
    UtilityRouting.navigateToSubjectList();
    expect(navigateSpy).toHaveBeenCalledWith(['administrative/subject-list']);
  });

  it('should navigate to subject detail by id', () => {
    UtilityRouting.navigateToSubjectDetailById(42);
    expect(navigateSpy).toHaveBeenCalledWith(['administrative/subject-detail', 42]);
  });

  it('should navigate to company society create', () => {
    UtilityRouting.navigateToComapnySocietyCreate();
    expect(navigateSpy).toHaveBeenCalledWith(['administrative/company-create']);
  });

  it('should navigate to company group create', () => {
    UtilityRouting.navigateToCompanyGroupCreate();
    expect(navigateSpy).toHaveBeenCalledWith(['administrative/company-group-create']);
  });

  it('should navigate to corporate group detail by id', () => {
    UtilityRouting.navigateToCarporateGroupDetail('group123');
    expect(navigateSpy).toHaveBeenCalledWith(['administrative/company-group-detail', 'group123']);
  });

  it('should throw error if router is not initialized', () => {
    (UtilityRouting as any).router = null;
    expect(() => UtilityRouting.navigateTo('test')).toThrowError(
      'UtilityRouting is not initialized. Call UtilityRouting.initialize(router) first.'
    );
  });
});
