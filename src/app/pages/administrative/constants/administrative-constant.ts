import { FUNCTIONALITY, PERMISSION, PROFILE } from '../../../common/utilities/constants/profile';
import { RELATIONSHIP_CUSTOMER_TYPE } from '../relationship/constants/relationship-constants';
import { ColTableInterface } from '../../../common/models/col-table-interface';

export const AdministrativePermissionList = {
  companyGroupAdminWrite: {
    profile: PROFILE.EVA_ADMIN,
    functionality: FUNCTIONALITY.any,
    permission: PERMISSION.any
  },
  networkAdministrativeCompanyAny: {
    profile: PROFILE.any,
    functionality: FUNCTIONALITY.networkAdministrativeCompany,
    permission: PERMISSION.any
  },
  networkAdministrativeCompanyWrite: {
    profile: PROFILE.any,
    functionality: FUNCTIONALITY.networkAdministrativeCompany,
    permission: PERMISSION.write
  },
  networkAdministrativeSubjectAny: {
    profile: PROFILE.any,
    functionality: FUNCTIONALITY.networkAdministrativeSubject,
    permission: PERMISSION.any
  },
  networkAdministrativeSubjectWrite: {
    profile: PROFILE.any,
    functionality: FUNCTIONALITY.networkAdministrativeSubject,
    permission: PERMISSION.write
  },
  networkAdministrativeCustomerAny: {
    profile: PROFILE.any,
    functionality: FUNCTIONALITY.networkAdministrativeCustomer,
    permission: PERMISSION.any
  },
  networkAdministrativeCustomerWrite: {
    profile: PROFILE.any,
    functionality: FUNCTIONALITY.networkAdministrativeCustomer,
    permission: PERMISSION.write
  },
  networkAdministrativeCustomerLACAny: {
    profile: PROFILE.any,
    functionality: FUNCTIONALITY.networkAdministrativeCustomerLAC,
    permission: PERMISSION.any
  },
  networkAdministrativeCustomerLACWrite: {
    profile: PROFILE.any,
    functionality: FUNCTIONALITY.networkAdministrativeCustomerLAC,
    permission: PERMISSION.write
  },
  networkAdministrativeAgentAny: {
    profile: PROFILE.any,
    functionality: FUNCTIONALITY.networkAdministrativeAgent,
    permission: PERMISSION.any
  },
  networkAdministrativeAgentWrite: {
    profile: PROFILE.any,
    functionality: FUNCTIONALITY.networkAdministrativeAgent,
    permission: PERMISSION.write
  },
  networkRelationshipWrite: {
    profile: PROFILE.any,
    functionality: [
      FUNCTIONALITY.networkAdministrativeCustomerLAC,
      FUNCTIONALITY.networkAdministrativeCustomerLAC,
      FUNCTIONALITY.networkAdministrativeAgent
    ],
    permission: PERMISSION.write
  },
  companyGroupAdminAny: { profile: PROFILE.EVA_ADMIN, functionality: FUNCTIONALITY.any, permission: PERMISSION.any },
  networkAdministrativeRelationshipCustomerAny: {
    profile: PROFILE.any,
    functionality: FUNCTIONALITY.networkAdministrativeCustomer,
    permission: PERMISSION.any,
    customerType: RELATIONSHIP_CUSTOMER_TYPE.customer
  },
  networkAdministrativeRelationshipCustomerLACAny: {
    profile: PROFILE.any,
    functionality: FUNCTIONALITY.networkAdministrativeCustomer,
    permission: PERMISSION.any,
    customerType: RELATIONSHIP_CUSTOMER_TYPE.customerLAC
  }
};

export const ADMINISTRATIVE_COMPANY_LIST_COLUMNS: ColTableInterface[] = [
  {
    columnVisible: true,
    block: true,
    field: 'Status',
    label: 'administrative.columnList.Status',
    sortable: true,
    width: 70
  },
  {
    columnVisible: true,
    block: true,
    field: 'Name',
    label: 'administrative.columnList.Name',
    sortable: true,
    width: 140
  },
  {
    columnVisible: true,
    block: true,
    field: 'GroupName',
    label: 'administrative.columnList.GroupName',
    sortable: true,
    width: 160
  },
  {
    columnVisible: true,
    block: true,
    field: 'VatNumber',
    label: 'administrative.columnList.VatNumber',
    sortable: true,
    width: 140
  },
  {
    columnVisible: true,
    block: true,
    field: 'TaxCode',
    label: 'administrative.columnList.TaxCode',
    sortable: true,
    width: 140
  }
];

export const SOCIETY_FILTER_TYPE_LIST = [
  { id: 'buildingAcronym', value: 'administrative.companyList.filterDropdown.buildingAcronym' },
  { id: 'Name', value: 'administrative.companyList.filterDropdown.Name' },
  { id: 'VatNumber', value: 'administrative.companyList.filterDropdown.VatNumber' },
  { id: 'TaxCode', value: 'administrative.companyList.filterDropdown.TaxCode' },
  { id: 'CarporateGroup', value: 'administrative.companyList.filterDropdown.CorporateGroup' }
];

export const ADMINISTRATIVE_COMPANY_CONSTANTS = {
  EDIT: 'edit',
  CREATE: 'create'
};

export const ADMINISTRATIVE_COMPANY_BUTTONS = {
  GROUP_SOCIETY: 'Corporate group',
  SOCIETY: 'Society'
};

export const EXPORT_FILE_NAME = {
  GROUP_SOCIETY: 'Corporate_Group',
  COMPANY_SOCIETY: 'Company_Society'
};
