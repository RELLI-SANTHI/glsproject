import { ColTableInterface } from '../../../common/models/col-table-interface';

export const USER_PROFILE_CONSTANTS = {
  EDIT: 'edit',
  CREATE: 'create',
  EXPORT_FILE_NAME_USER: 'User_Management',
  EXPORT_FILE_NAME_ROLE: 'Role_Management'
};

export const USER_LIST_COLUMNS: ColTableInterface[] = [
  {
    columnVisible: true,
    block: true,
    field: 'Profile',
    label: 'userProfile.userList.columnList.Profile',
    sortable: true,
    width: 105
  }, // warning
  {
    columnVisible: true,
    block: true,
    field: 'State',
    label: 'userProfile.userList.columnList.State',
    sortable: true,
    width: 130
  }, // stato
  {
    columnVisible: true,
    block: true,
    field: 'NameSurname',
    label: 'userProfile.userList.columnList.NameSurname',
    sortable: true,
    width: 150
  }, // NameSurname
  {
    columnVisible: true,
    block: true,
    field: 'corporateGroupName',
    label: 'userProfile.userList.columnList.corporateGroupName',
    sortable: true,
    width: 220
  }, // denominazione
  {
    columnVisible: true,
    block: true,
    field: 'incomingCorporateGroup',
    label: 'userProfile.userList.columnList.corporateGroupNameAD',
    sortable: true,
    width: 250
  },
  {
    columnVisible: true,
    block: false,
    field: 'Email',
    label: 'userProfile.userList.columnList.Email',
    sortable: false
  }, // template
  {
    columnVisible: true,
    block: false,
    field: 'Action',
    label: 'userProfile.userList.columnList.Action',
    sortable: false
  } // ragione sociale
];

export const USER_FILTER_TYPE_LIST = [
  { id: 'BuildingAcronym', value: 'userProfile.userList.filterDropdown.buildingAcronym' },
  { id: 'corporateGroupName', value: 'userProfile.userList.filterDropdown.companyGroup' },
  { id: 'Username', value: 'userProfile.userList.filterDropdown.username' },
  { id: 'Role', value: 'userProfile.userList.filterDropdown.role' },
  { id: 'Name', value: 'userProfile.userList.filterDropdown.name' },
  { id: 'Surname', value: 'userProfile.userList.filterDropdown.surname' },
  { id: 'BuildingName', value: 'userProfile.userList.filterDropdown.buildingName' },
  { id: 'Email', value: 'userProfile.userList.filterDropdown.email' }
];

export const ROLE_FILTER_TYPE_LIST = [
  { id: 'Role', value: 'userProfile.roleList.filterDropdown.role' },
  { id: 'Permission', value: 'userProfile.roleList.filterDropdown.permission' }
];
