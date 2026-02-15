import { Routes } from '@angular/router';
import { AuthGuardService } from '../../common/utilities/services/auth/auth-guard.service';
import { AdministrativePermissionList } from './constants/structure-constant';

export default [
  {
    path: '',
    children: [
      {
        path: 'structure-list',
        loadComponent: () => import('./structure/structure-list/structure-list.component').then((m) => m.StructureListComponent),
        canActivate: [AuthGuardService],
        data: AdministrativePermissionList.networkStructureAny
      },
      {
        path: 'structure-detail/:idStructure',
        loadComponent: () => import('./structure/structure-detail/structure-detail.component').then((m) => m.StructureDetailComponent),
        canActivate: [AuthGuardService],
        data: AdministrativePermissionList.networkStructureAny
      },
      {
        path: 'structure-edit',
        loadComponent: () => import('./structure/structure-edit/structure-edit.component').then((m) => m.StructureEditComponent),
        canActivate: [AuthGuardService],
        data: AdministrativePermissionList.networkStructureWrite
      },
      {
        path: 'structure-new',
        loadComponent: () => import('./structure/structure-edit/structure-edit.component').then((m) => m.StructureEditComponent),
        canActivate: [AuthGuardService],
        data: AdministrativePermissionList.networkStructureWrite
      },
      {
        path: 'structure-edit/:idStructure',
        loadComponent: () => import('./structure/structure-edit/structure-edit.component').then((m) => m.StructureEditComponent),
        canActivate: [AuthGuardService],
        data: AdministrativePermissionList.networkStructureWrite
      },
      {
        path: 'template-list',
        loadComponent: () => import('./template/template-list/template-list.component').then((m) => m.TemplateListComponent),
        canActivate: [AuthGuardService],
        data: AdministrativePermissionList.networkTemplateAny
      },
      {
        path: 'template-detail/:idTemplate',
        loadComponent: () => import('./template/template-detail/template-detail.component').then((m) => m.TemplateDetailComponent),
        canActivate: [AuthGuardService],
        data: AdministrativePermissionList.networkTemplateAny
      },
      {
        path: 'template-edit',
        loadComponent: () => import('./template/template-edit/template-edit.component').then((m) => m.TemplateEditComponent),
        canActivate: [AuthGuardService],
        data: AdministrativePermissionList.networkTemplateWrite
      },
      {
        path: 'template-new',
        loadComponent: () => import('./template/template-edit/template-edit.component').then((m) => m.TemplateEditComponent),
        canActivate: [AuthGuardService],
        data: AdministrativePermissionList.networkTemplateWrite
      },
      {
        path: 'template-edit/:idTemplate',
        loadComponent: () => import('./template/template-edit/template-edit.component').then((m) => m.TemplateEditComponent),
        canActivate: [AuthGuardService],
        data: AdministrativePermissionList.networkTemplateWrite
      }
    ]
  }
] as Routes;
