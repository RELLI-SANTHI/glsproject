import { Router } from '@angular/router';
import { RelationshipType } from '../../pages/administrative/relationship/enum/relationship-type';

export class UtilityRouting {
  private static router: Router;

  static initialize(router: Router): void {
    UtilityRouting.router = router;
  }

  // GENERIC ROUTING
  static navigateTo(link: string, param?: unknown): void {
    if (!UtilityRouting.router) {
      throw new Error('UtilityRouting is not initialized. Call UtilityRouting.initialize(router) first.');
    }

    if (param) {
      UtilityRouting.router.navigate([link, param]);
    } else {
      UtilityRouting.router.navigate([link]);
    }
  }

  static navigateByUrl(url: string): void {
    if (!UtilityRouting.router) {
      throw new Error('UtilityRouting is not initialized. Call UtilityRouting.initialize(router) first.');
    }
    UtilityRouting.router.navigateByUrl(url);
  }

  static navigateToHome(): void {
    UtilityRouting.navigateTo('home');
  }

  static relocateToUrl(url: string): void {
    window.location.href = url;
  }

  static relocateToHome(): void {
    UtilityRouting.relocateToUrl('/home');
  }

  // STRUCTURE ROUTING

  static navigateToStructureList(): void {
    this.router.navigate(['anagrafica/structure-list']);
  }

  static navigateToStructureDetailByStructureId(id: string): void {
    this.router.navigate(['anagrafica/structure-detail', id]);
  }

  static navigateToStructureEditByStructureId(id: string): void {
    UtilityRouting.navigateTo('anagrafica/structure-edit', id);
  }

  static navigateToStructureCreate(): void {
    UtilityRouting.navigateTo('anagrafica/structure-new');
  }

  // TEMPLATE ROUTING

  static navigateToTemplateList(): void {
    this.router.navigate(['anagrafica/template-list']);
  }

  static navigateToTemplateDetailByTemplateId(id: string): void {
    this.router.navigate(['anagrafica/template-detail', id]);
  }

  static navigateToTemplateEditByTemplateId(id: string): void {
    UtilityRouting.navigateTo('anagrafica/template-edit', id);
  }

  static navigateToTemplateCreate(): void {
    UtilityRouting.navigateTo('anagrafica/template-new');
  }

  // USER ROUTING

  static navigateToUserList(): void {
    this.router.navigate(['/user-profile/user-list']);
  }

  static navigateToUserDetailByUserId(id: string): void {
    this.router.navigate(['/user-profile/user-detail', id]);
  }

  static navigateToUserEditByUserId(id: string): void {
    UtilityRouting.navigateTo('/user-profile/user-edit', id);
  }

  // ROLE ROUTING

  static navigateToRoleList(): void {
    this.router.navigate(['/user-profile/role-list']);
  }

  static navigateToRoleEditByRoleId(id: string): void {
    UtilityRouting.navigateTo('/user-profile/role-edit', id);
  }

  static navigateToRoleCreate(): void {
    UtilityRouting.navigateTo('user-profile/role-edit');
  }

  // ADMINISTRATIVE ROUTING
  static navigateToComapnySocietyCreate(): void {
    UtilityRouting.navigateTo('administrative/company-create');
  }

  static navigateToCompanyGroupCreate(): void {
    UtilityRouting.navigateTo('administrative/company-group-create');
  }

  static navigateToCarporateGroupDetail(id: string): void {
    UtilityRouting.navigateTo('administrative/company-group-detail', id);
  }

  static navigateToCompanyList(): void {
    UtilityRouting.navigateTo('administrative/company-list');
  }

  static navigateToSocietyEditById(id: number): void {
    UtilityRouting.router.navigate(['administrative/company-edit', id], {
      queryParams: { isEditable: true }
    });
  }

  static navigateToSocietyDetailById(id: number): void {
    UtilityRouting.router.navigate(['administrative/company-detail', id], {
      queryParams: { isEditable: false }
    });
  }

  static navigateToRelationshipExit(fromType: RelationshipType | string, idRelationship?: number): void {
    if (fromType === RelationshipType.Agent) {
      UtilityRouting.navigateTo('administrative/relationship-agents-list');
    } else if (fromType === RelationshipType.Customer) {
      UtilityRouting.navigateTo('administrative/relationship-customers-list');
    } else if (fromType === RelationshipType.CustomerLac) {
      UtilityRouting.navigateTo('administrative/relationship-customers-list-lac');
    } else {
      console.warn('Unknown relationship type, navigating to subject detail', idRelationship);
      UtilityRouting.navigateTo('administrative/subject-detail', idRelationship);
    }
  }

  static navigateToRelationshipNew(idRelaship: number, type: RelationshipType): void {
    if (!UtilityRouting.router) {
      throw new Error('UtilityRouting is not initialized. Call UtilityRouting.initialize(router) first.');
    }
    UtilityRouting.router.navigate(['administrative/relationship-new', idRelaship, type]);
  }

  static navigateToRelationshipCreate(idSubject: number): void {
    if (!UtilityRouting.router) {
      throw new Error('UtilityRouting is not initialized. Call UtilityRouting.initialize(router) first.');
    }
    UtilityRouting.router.navigate(['administrative/relationship-new', 0, RelationshipType.Subject], {
      queryParams: { idSubject }
    });
  }

  static navigateToAgentRelationshipCreate(idRelationship = 0): void {
    if (!UtilityRouting.router) {
      throw new Error('UtilityRouting is not initialized. Call UtilityRouting.initialize(router) first.');
    }
    UtilityRouting.router.navigate(['administrative/relationship-new', idRelationship, RelationshipType.Agent]);
  }

  static navigateToRelationshipDetailById(id: string, type: RelationshipType): void {
    const path = type === RelationshipType.Agent ? 'agent' : 'customer';
    this.router.navigate(['administrative/relationship-detail-' + path, id, type]);
  }

  static navigateToRelationshipEditById(id: string, type: RelationshipType): void {
    this.router.navigate(['administrative/relationship-edit', id, type]);
  }

  // SUBJECT ROUTING
  static navigateToSubjectCreate(): void {
    this.router.navigate(['administrative/subject-new']);
  }

  static navigateToSubjectEdit(id: string, fromDetail: boolean): void {
    this.router.navigate(['administrative/subject-edit', id, fromDetail]);
  }

  static navigateToSubjectList(): void {
    this.router.navigate(['administrative/subject-list']);
  }

  static navigateToSubjectDetailById(id?: number): void {
    this.router.navigate(['administrative/subject-detail', id]);
  }
}
