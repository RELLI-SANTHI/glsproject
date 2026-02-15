import { AdministrativeFields } from '../../../../api/glsAdministrativeApi/models/administrative-fields';

export const COMPANY_MESSAGES = {
  DRAFT_SUCCESS: 'message.company.draft.success',
  UPDATE_SUCCESS: 'message.company.update.success',
  CREATE_SUCCESS: 'message.company.create.success',
  COMPANY_DEACTIVATED: 'message.company.deactivated',
  DELETE_SUCCESS: 'message.company.deleteSuccess',
  LABEL_TITLE_DEACTIVATION : 'administrative.companyEdit.deactivation.title',
  LABEL_BODY_DEACTIVATION: 'administrative.companyEdit.deactivation.message'
};

export const DEFAULT_COMPANY_ID = 0;

export const LIST_COL_EXPORT_LIST_COMPANY: AdministrativeFields[] = [
  'Status',
  'Name',
  'GroupName',
  'VatNumber',
  'TaxCode',
  'VatGroup',
  'Language',
  'Nation',
  'OfficeAddress',
  'OfficePostCode',
  'OfficeCity',
  'Province',
  'Region',
  'Telephone',
  'Fax',
  'Email',
  'CompanyEndDate',
  'RecipientTaxCode',
  'CertifiedEmail',
  'ShareCapital',
  'ShareCapitalStatus',
  'Rea',
  'BusinessRegisterOf',
  'BusinessRegisterProvince',
  'RegistrationNumberRegisterHauliers',
  'IsSingleMember',
  'RelationshipType'
];
