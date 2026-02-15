import { Routes } from '@angular/router';
import { AuthGuardService } from '../../common/utilities/services/auth/auth-guard.service';
import { AdministrativePermissionList } from './constants/administrative-constant';

export default [
  {
    path: '',
    children: [
      {
        path: 'company-list',
        loadComponent: () => import('./company/company-list/company-list.component').then((m) => m.CompanyListComponent),
        canActivate: [AuthGuardService],
        // This property allows custom data to be associated with the route.
        data: AdministrativePermissionList.networkAdministrativeCompanyAny
      },
      {
        path: 'company-create',
        loadComponent: () => import('./company/company-edit/company-edit.component').then((m) => m.CompanyEditComponent),
        canActivate: [AuthGuardService],
        // This property allows custom data to be associated with the route.
        data: AdministrativePermissionList.networkAdministrativeCompanyWrite
      },
      {
        path: 'company-edit/:idCompany/:isType',
        loadComponent: () => import('./company/company-edit/company-edit.component').then((m) => m.CompanyEditComponent),
        canActivate: [AuthGuardService],
        // This property allows custom data to be associated with the route.
        data: AdministrativePermissionList.networkAdministrativeCompanyWrite
      },

      {
        path: 'company-edit/:idCompany',
        loadComponent: () => import('./company/company-edit/company-edit.component').then((m) => m.CompanyEditComponent),
        canActivate: [AuthGuardService],
        // This property allows custom data to be associated with the route.
        data: AdministrativePermissionList.networkAdministrativeCompanyWrite
      },
      {
        path: 'company-detail/:idCompany',
        loadComponent: () => import('./company/company-edit/company-edit.component').then((m) => m.CompanyEditComponent),
        canActivate: [AuthGuardService],
        // This property allows custom data to be associated with the route.
        data: AdministrativePermissionList.networkAdministrativeCompanyAny
      },
      {
        path: 'company-group-detail/:groupId',
        loadComponent: () => import('./company/company-list/company-list.component').then((m) => m.CompanyListComponent),
        canActivate: [AuthGuardService],
        // This property allows custom data to be associated with the route.
        data: AdministrativePermissionList.networkAdministrativeCompanyAny
      },
      {
        path: 'company-group-create',
        loadComponent: () =>
          import('./company/company-group-create/company-group-create.component').then((m) => m.CompanyGroupCreateComponent),
        canActivate: [AuthGuardService],
        // This property allows custom data to be associated with the route.
        data: AdministrativePermissionList.companyGroupAdminWrite
      },
      {
        path: 'subject-list',
        loadComponent: () => import('./subject/subject-list/subject-list.component').then((m) => m.SubjectListComponent),
        canActivate: [AuthGuardService],
        // This property allows custom data to be associated with the route.
        data: AdministrativePermissionList.networkAdministrativeSubjectAny
      },
      {
        path: 'subject-new',
        loadComponent: () => import('./subject/subject-edit/subject-edit.component').then((m) => m.SubjectEditComponent),
        canActivate: [AuthGuardService],
        // This property allows custom data to be associated with the route.
        data: AdministrativePermissionList.networkAdministrativeSubjectWrite
      },
      {
        path: 'subject-edit/:idSubject/:fromDetail',
        loadComponent: () => import('./subject/subject-edit/subject-edit.component').then((m) => m.SubjectEditComponent),
        canActivate: [AuthGuardService],
        // This property allows custom data to be associated with the route.
        data: AdministrativePermissionList.networkAdministrativeSubjectWrite
      },
      {
        path: 'subject-detail/:idSubject',
        loadComponent: () => import('./subject/subject-detail/subject-detail.component').then((m) => m.SubjectDetailComponent),
        canActivate: [AuthGuardService],
        // This property allows custom data to be associated with the route.
        data: AdministrativePermissionList.networkAdministrativeSubjectAny
      },
      {
        path: 'relationship-customers-list',
        loadComponent: () =>
          import('./relationship/relationship-customers-list/relationship-customers-list.component').then(
            (m) => m.RelationshipCustomersListComponent
          ),
        canActivate: [AuthGuardService],
        // This property allows custom data to be associated with the route.
        data: AdministrativePermissionList.networkAdministrativeRelationshipCustomerAny
      },
      {
        path: 'relationship-customers-list-lac',
        loadComponent: () =>
          import('./relationship/relationship-customers-list/relationship-customers-list.component').then(
            (m) => m.RelationshipCustomersListComponent
          ),
        canActivate: [AuthGuardService],
        // This property allows custom data to be associated with the route.
        data: AdministrativePermissionList.networkAdministrativeRelationshipCustomerLACAny
      },
      {
        path: 'relationship-customer-new',
        loadComponent: () =>
          import('./relationship/relationship-edit/relationship-edit.component').then((m) => m.RelationshipEditComponent),
        canActivate: [AuthGuardService],
        // This property allows custom data to be associated with the route.
        data: AdministrativePermissionList.networkAdministrativeCustomerWrite
      },
      {
        path: 'relationship-edit/:idRelationship/:fromType',
        loadComponent: () =>
          import('./relationship/relationship-edit/relationship-edit.component').then((m) => m.RelationshipEditComponent),
        canActivate: [AuthGuardService],
        // This property allows custom data to be associated with the route.
        data: AdministrativePermissionList.networkAdministrativeCustomerWrite
      },
      {
        path: 'relationship-detail-agent/:idRelationship/:fromType',
        loadComponent: () =>
          import('./relationship/relationship-detail/relationship-detail.component').then((m) => m.RelationshipDetailComponent),
        canActivate: [AuthGuardService],
        // This property allows custom data to be associated with the route.
        data: AdministrativePermissionList.networkAdministrativeAgentAny
      },
      {
        path: 'relationship-detail-customer/:idRelationship/:fromType',
        loadComponent: () =>
          import('./relationship/relationship-detail/relationship-detail.component').then((m) => m.RelationshipDetailComponent),
        canActivate: [AuthGuardService],
        // This property allows custom data to be associated with the route.
        data: AdministrativePermissionList.networkAdministrativeCustomerAny
      },
      {
        path: 'relationship-customer-edit/:idRelationship',
        loadComponent: () =>
          import('./relationship/relationship-edit/relationship-edit.component').then((m) => m.RelationshipEditComponent),
        canActivate: [AuthGuardService],
        // This property allows custom data to be associated with the route.
        data: AdministrativePermissionList.networkAdministrativeCustomerWrite
      },
      {
        path: 'relationship-customer-lac-new',
        loadComponent: () =>
          import('./relationship/relationship-edit/relationship-edit.component').then((m) => m.RelationshipEditComponent),
        canActivate: [AuthGuardService],
        // This property allows custom data to be associated with the route.
        data: AdministrativePermissionList.networkAdministrativeCustomerLACWrite
      },
      {
        path: 'relationship-customer-lac-edit/:idRelationship',
        loadComponent: () =>
          import('./relationship/relationship-edit/relationship-edit.component').then((m) => m.RelationshipEditComponent),
        canActivate: [AuthGuardService],
        // This property allows custom data to be associated with the route.
        data: AdministrativePermissionList.networkAdministrativeCustomerLACWrite
      },
      {
        path: 'relationship-agents-list',
        loadComponent: () =>
          import('./relationship/relationship-agents-list/relationship-agents-list.component').then(
            (m) => m.RelationshipAgentsListComponent
          ),
        canActivate: [AuthGuardService],
        // This property allows custom data to be associated with the route.
        data: AdministrativePermissionList.networkAdministrativeAgentAny
      },
      {
        path: 'relationship-new/:idRelationship/:fromType',
        loadComponent: () =>
          import('./relationship/relationship-edit/relationship-edit.component').then((m) => m.RelationshipEditComponent),
        canActivate: [AuthGuardService],
        // This property allows custom data to be associated with the route.
        data: AdministrativePermissionList.networkRelationshipWrite
      },
      {
        path: 'relationship-agents-edit/:idRelationship',
        loadComponent: () =>
          import('./relationship/relationship-edit/relationship-edit.component').then((m) => m.RelationshipEditComponent),
        canActivate: [AuthGuardService],
        // This property allows custom data to be associated with the route.
        data: AdministrativePermissionList.networkAdministrativeAgentWrite
      }
    ]
  }
] as Routes;
