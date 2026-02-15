import { Routes } from '@angular/router';
import { AuthGuardService } from '../../common/utilities/services/auth/auth-guard.service';
import { FUNCTIONALITY, PERMISSION, PROFILE } from '../../common/utilities/constants/profile';

export default [
  {
    path: '',
    children: [
      {
        path: 'user-list',
        loadComponent: () => import('./user-list/user-list.component').then((m) => m.UserListComponent),
        canActivate: [AuthGuardService],

        // This property allows custom data to be associated with the route.
        data: { profile: [PROFILE.EVA_ADMIN, PROFILE.EVA_FIELD], functionality: FUNCTIONALITY.any, permission: PERMISSION.any }
      },
      {
        path: 'role-list',
        loadComponent: () => import('./role-list/role-list.component').then((m) => m.RoleListComponent),
        canActivate: [AuthGuardService],

        // This property allows custom data to be associated with the route.
        data: { profile: [PROFILE.EVA_ADMIN, PROFILE.EVA_FIELD], functionality: FUNCTIONALITY.any, permission: PERMISSION.any }
      },
      {
        path: 'user-detail' + '/:id',
        loadComponent: () => import('./user-detail/user-detail.component').then((m) => m.UserDetailComponent),
        canActivate: [AuthGuardService],

        // This property allows custom data to be associated with the route.
        data: { profile: [PROFILE.EVA_ADMIN, PROFILE.EVA_FIELD], functionality: FUNCTIONALITY.any, permission: PERMISSION.any }
      },
      {
        path: 'user-edit' + '/:id',
        loadComponent: () => import('./user-edit/user-edit.component').then((m) => m.UserEditComponent),
        canActivate: [AuthGuardService],

        // This property allows custom data to be associated with the route.
        data: { profile: [PROFILE.EVA_ADMIN, PROFILE.EVA_FIELD], functionality: FUNCTIONALITY.any, permission: PERMISSION.any }
      },
      {
        path: 'role-edit',
        loadComponent: () => import('./role-edit/role-edit.component').then((m) => m.RoleEditComponent),
        canActivate: [AuthGuardService],
        // This property allows custom data to be associated with the route.
        data: { profile: PROFILE.EVA_ADMIN, functionality: FUNCTIONALITY.any, permission: PERMISSION.any }
      },
      {
        path: 'role-edit' + '/:id',
        loadComponent: () => import('./role-edit/role-edit.component').then((m) => m.RoleEditComponent),
        canActivate: [AuthGuardService],

        // This property allows custom data to be associated with the route.
        data: { profile: PROFILE.EVA_ADMIN, functionality: FUNCTIONALITY.any, permission: PERMISSION.any }
      },
      {
        path: 'role-edit-table',
        loadComponent: () => import('./role-edit-table/role-edit-table.component').then((m) => m.RoleEditTableComponent)
      }
    ]
  }
] as Routes;
