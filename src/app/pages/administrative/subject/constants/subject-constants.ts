import { SubjectField } from '../../../../api/glsAdministrativeApi/models/subject-field';

export const MAPPING_EXPORT_FIELDS_LABEL_SUBJECT: Record<string, string> = {
  SurnameNameCompanyName: 'SurnameNameCompanyName',
  VATNumber: 'vatNumber',
  TaxCode: 'fiscalCode',
  Status: 'state',
  Nation: 'countryRegisteredOffice',
  Warning: 'warning',
  Surname: 'surname',
  IsPhysicalPerson: 'isPhysicalPerson',
  Name: 'name',
  CompanyName: 'companyName',
  AdditionalCompanyName: 'additionalCompanyName',
  CorporateGroupName: 'corporateGroupName',
  Address: 'address',
  PostCode: 'postCode',
  City: 'city',
  Province: 'province',
  Region: 'region',
  VATGroup: 'vatGroup',
  NonProfitAssociation: 'nonProfitAssociation',
  AtecoCode: 'atecoCode',
  Language: 'language',
  Litigation: 'litigation',
  IsPrivate: 'isPrivate',
  DateAdded: 'dateAdded',
  CustomSubjectIct10: 'customSubjectIct10',
  WarningOrError: 'warningOrError',
  ContactDetailEmail: 'contactDetailEmail',
  ContactDetailTelephone: 'contactDetailTelephone',
  ContactDetailFax: 'contactDetailFax',
  ContactDetailMobilePhone: 'contactDetailMobilePhone',
  ContactDetailContact: 'contactDetailContact',
  PermanentEstablishmentDetailNation: 'permanentEstablishmentDetailNation',
  PermanentEstablishmentDetailAddress: 'permanentEstablishmentDetailAddress',
  PermanentEstablishmentDetailPostCode: 'permanentEstablishmentDetailPostCode',
  PermanentEstablishmentDetailCity: 'permanentEstablishmentDetailCity',
  PermanentEstablishmentDetailProvince: 'permanentEstablishmentDetailProvince',
  InvoiceDetailRecipientCustomerCode: 'invoiceDetailRecipientCustomerCode',
  InvoiceDetailPEC: 'invoiceDetailPEC',
  InvoiceDetailInvoiceDeliveryAddress: 'invoiceDetailInvoiceDeliveryAddress',
  InvoiceDetailPostcodeForInvoiceDelivery: 'invoiceDetailPostcodeForInvoiceDelivery',
  InvoiceDetailInvoiceDeliveryLocation: 'invoiceDetailInvoiceDeliveryLocation',
  InvoiceDetailProvinceForInvoiceDelivery: 'invoiceDetailProvinceForInvoiceDelivery',
  TaxRepresentativeDetailCountryID: 'taxRepresentativeDetailCountryID',
  TaxRepresentativeDetailCodeId: 'taxRepresentativeDetailCodeId',
  TaxRepresentativeDetailTaxCode: 'taxRepresentativeDetailTaxCode',
  TaxRepresentativeDetailTaxCodeSecondLine: 'taxRepresentativeDetailTaxCodeSecondLine',
  TaxRepresentativeDetailCompanyName: 'taxRepresentativeDetailCompanyName',
  TaxRepresentativeDetailCompanyNameSecondLine: 'taxRepresentativeDetailCompanyNameSecondLine',
  TaxRepresentativeDetailSurname: 'taxRepresentativeDetailSurname',
  TaxRepresentativeDetailName: 'taxRepresentativeDetailName',
  EstablishmentOrganization: 'establishmentOrganization',
  CustomerTaxRepresentative: 'customerTaxRepresentative',
  CustomerType: 'customerType'
};

export const ADMINISTRATIVE_SUBJECT_EXPORT_FIELDS = {
  EXPORT_FILE_NAME: 'Company'
};

export const SUBJECT_CONSTANTS = {
  EDIT: 'edit',
  CREATE: 'create',
  EXPORT_FILE_NAME: 'Subjects',
  MAPPING_EXPORT_FIELDS_LABEL: MAPPING_EXPORT_FIELDS_LABEL_SUBJECT,
  DELETE_SUCCESS: 'administrative.subjectEdit.messages.deleteSuccess'
};

export const SUBJECT_FILTER_TYPE_LIST = [
  { id: 'surnameNameCompanyName', value: 'administrative.subjectList.filterDropdown.companyName' },
  { id: 'vatNumber', value: 'administrative.subjectList.filterDropdown.vatNumber' },
  { id: 'taxCode', value: 'administrative.subjectList.filterDropdown.taxIDCode' },
  { id: 'nation', value: 'administrative.subjectList.filterDropdown.nation' }
];

export const CURRECY_COLUMN_LIST = [
  { name: 'administrative.subjectList.currencyModal.acronym', prop: 'acronym' },
  { name: 'administrative.subjectList.currencyModal.name', prop: 'name' },
  { name: 'administrative.subjectList.currencyModal.decimal', prop: 'decimal' },
  { name: 'administrative.subjectList.currencyModal.change', prop: 'change' },
  { name: 'administrative.subjectList.currencyModal.divXChange', prop: 'divXChange' },
  { name: 'administrative.subjectList.currencyModal.n', prop: 'n' }
];

export const ATECO_COLUMN_LIST = [
  { name: 'administrative.subjectList.atecoModal.code', prop: 'code' },
  { name: 'administrative.subjectList.atecoModal.description', prop: 'description' }
];

export const ATECO_OPTIONS_SEARCH = [
  { id: 'code', value: 'administrative.subjectList.atecoModal.code' },
  { id: 'description', value: 'administrative.subjectList.atecoModal.description' }
];

export const EXEMPTION_COLUMN_LIST = [
  { name: 'Codice', prop: 'code' },
  { name: 'Descrizione', prop: 'description' }
];

export const SUBJECT_MESSAGES = {
  DRAFT: 'draft',
  SUCCESS: 'success',
  SUCCESS_EDIT: 'successEdit',
  SUCCESS_CREATE: 'successCreate'
};

export const LIST_COL_EXPORT_SUBJECT: SubjectField[] = [
  'WarningOrError',
  'Status',
  'SurnameNameCompanyName',
  'VATNumber',
  'TaxCode',
  'Nation',
  'IsPhysicalPerson',
  'CorporateGroupName',
  'AdditionalCompanyName',
  'VATGroup',
  'NonProfitAssociation',
  'Address',
  'PostCode',
  'City',
  'Province',
  'Region',
  'AtecoCode',
  'Language',
  'Litigation',
  'CustomSubjectIct10',
  'ContactDetailEmail',
  'ContactDetailTelephone',
  'ContactDetailFax',
  'ContactDetailMobilePhone',
  'ContactDetailContact',
  'DateAdded',
  'IsPrivate',
  'PermanentEstablishmentDetailAddress',
  'PermanentEstablishmentDetailCity',
  'PermanentEstablishmentDetailProvince',
  'PermanentEstablishmentDetailPostCode',
  'PermanentEstablishmentDetailNation',
  'TaxRepresentativeDetailCountryID',
  'TaxRepresentativeDetailCodeId',
  'TaxRepresentativeDetailTaxCode',
  'TaxRepresentativeDetailTaxCodeSecondLine',
  'TaxRepresentativeDetailCompanyName',
  'TaxRepresentativeDetailCompanyNameSecondLine',
  'TaxRepresentativeDetailSurname',
  'TaxRepresentativeDetailName',
  'InvoiceDetailRecipientCustomerCode',
  'InvoiceDetailPEC',
  'InvoiceDetailInvoiceDeliveryAddress',
  'InvoiceDetailPostcodeForInvoiceDelivery',
  'InvoiceDetailInvoiceDeliveryLocation',
  'InvoiceDetailProvinceForInvoiceDelivery'
];
