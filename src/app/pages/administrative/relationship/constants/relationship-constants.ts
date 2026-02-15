import { AgentField, CustomerField } from '../../../../api/glsAdministrativeApi/models';

export const RELATIONSHIP_TYPE_LIST_COMMERCIAL = [
  { id: 'D', value: 'administrative.relationshipEdit.relationshipType.directCustomer' },
  { id: 'S', value: 'administrative.relationshipEdit.relationshipType.branchOffice' },
  { id: 'A', value: 'administrative.relationshipEdit.relationshipType.otherCustomer' }
];

export const TYPE_DISCOUNTS_LIST = [
  { id: 'Fine Fattura', value: 'administrative.relationshipEdit.typeDiscounts.endInvoice' },
  { id: 'Riga-merce', value: 'administrative.relationshipEdit.typeDiscounts.rowMerchandise' }
];

export const FILTER_CUSTOMERS_TYPE_LIST = [
  { id: 'customerCode', value: 'administrative.relationshipCustomerList.filter.customerCode' },
  { id: 'surnameNameCompanyName', value: 'administrative.relationshipCustomerList.filter.surnameNameCompanyName' },
  { id: 'taxCode', value: 'administrative.relationshipCustomerList.filter.taxCode' },
  { id: 'vatNumber', value: 'administrative.relationshipCustomerList.filter.vatNumber' },
  { id: 'codPay', value: 'administrative.relationshipCustomerList.filter.paymentCode' },
  { id: 'vatRateValue', value: 'administrative.relationshipCustomerList.filter.VATcode/Exemptioncode' }
];

export const PAYMENT_MODAL_COLUMNS = [
  { prop: 'codPay', name: 'administrative.relationshipEdit.relationshipBillingData.paymentCode' },
  { prop: 'description', name: 'administrative.relationshipEdit.relationshipBillingData.paymentDescription' },
  { prop: 'gestDtScaRate', name: 'administrative.relationshipEdit.relationshipBillingData.paymentExpireDateHandle' }
];

export const FILTER_AGENTS_TYPE_LIST = [
  { id: 'agentCode', value: 'administrative.relationshipCustomerList.filter.agentCode' },
  { id: 'surnameNameCompanyName', value: 'administrative.relationshipCustomerList.filter.surnameNameCompanyName' },
  { id: 'administrativeName', value: 'administrative.relationshipCustomerList.filter.society' },
  { id: 'taxCode', value: 'administrative.relationshipCustomerList.filter.taxCode' },
  { id: 'vatNumber', value: 'administrative.relationshipCustomerList.filter.vatNumber' }
];

export const PAYMENT_OPTIONS_SEARCH = [
  { id: 'codPay', value: 'administrative.relationshipEdit.relationshipBillingData.paymentCode' },
  { id: 'description', value: 'administrative.relationshipEdit.relationshipBillingData.paymentDescription' }
];

export const REMINDER_TYPE_LIST = [
  { id: 'S', value: 'S' },
  { id: 'P', value: 'P' },
  { id: 'T', value: 'T' }
];

export const AGENT_MODAL_COLUMNS = [
  { prop: 'agentCode', name: 'administrative.relationshipEdit.relationshipCommercialData.agentCode' },
  {
    prop: 'surnameNameCompanyName',
    name: 'administrative.relationshipEdit.relationshipCommercialData.agentSurnameNameCompanyName'
  },
  { prop: 'vatNumber', name: 'administrative.relationshipEdit.relationshipCommercialData.agentVatNumber' },
  { prop: 'taxCode', name: 'administrative.relationshipCustomerList.filter.taxCode' }
];

export const AGENT_OPTIONS_SEARCH = [
  { id: 'agentCode', value: 'administrative.relationshipEdit.relationshipCommercialData.agentCode' },
  {
    id: 'surnameNameCompanyName',
    value: 'administrative.relationshipEdit.relationshipCommercialData.agentSurnameNameCompanyName'
  },
  { id: 'vatNumber', value: 'administrative.relationshipEdit.relationshipCommercialData.agentVatNumber' },
  { id: 'country', value: 'administrative.relationshipEdit.relationshipCommercialData.agentCountry' },
  { id: 'taxCode', value: 'administrative.relationshipCustomerList.filter.taxCode' }
];

export const MAPPING_EXPORT_FIELDS_LABEL_RELATIONSHIPS_CUSTOMER: Record<CustomerField | AgentField | string, string> = {
  CustomerCode: 'clientCode',
  AgentCode: 'agentCode',
  SurnameNameCompanyName: 'surnameNameCompanyName',
  VATNumber: 'vatNumber',
  TaxCode: 'taxCode',
  AdministrativeName: 'society',
  AgentType: 'agentType',
  PercentageProvision: 'percentageProvision',
  InvoiceNo: 'invoiceNo',
  TurnoverImp: 'turnoverImport',
  ProvisionalImp: 'provisionalImport',
  EndOfRelationshipValidity: 'endOfRelationshipValidity',
  WarningOrError: 'warningOrError',
  RelationshipType: 'RelationshipType'
};

export const RELATIONSHIP_CONSTANTS = {
  EXPORT_FILE_NAME_AGENT: 'Agents',
  EXPORT_FILE_NAME_CUSTOMER: 'Customers',
  MAPPING_EXPORT_FIELDS_LABEL: MAPPING_EXPORT_FIELDS_LABEL_RELATIONSHIPS_CUSTOMER,
  REPORT_ABI_CAB: 'Report ABI/CAB',
  REPORT_AGENT_REPLACEMENT: 'Report agents replacement'
};

export const RELATIONSHIP_CUSTOMER_TYPE = {
  customer: 'Customer',
  customerLAC: 'CustomerLAC'
};

export const CHOISE_SEARCH = [
  { label: 'administrative.relationshipCustomerList.filter.agentCode', value: 'filterSearchAgent' },
  { label: 'administrative.relationshipCustomerList.filter.surnameNameCompanyName', value: 'filterSearchCompany' }
];

export const FORM_TYPE = {
  typeRelationship: 'typeRelationship'
};

export const RELATIONSHIP_MESSAGES = {
  ELATIONSHIP_DEACTIVATED: 'administrative.relationshipDetail.endRelationship',
  LABEL_TITLE_DEACTIVATION: 'administrative.relationshipEdit.endRelationship.title',
  LABEL_BODY_DEACTIVATION: 'administrative.relationshipEdit.endRelationship.body',
  LABEL_SUB_BODY_CLIENT: 'administrative.relationshipEdit.endRelationship.clientSurname',
  LABEL_SUB_BODY_CLIENT_LAC: 'administrative.relationshipEdit.endRelationship.clientLACSurname',
  LABEL_SUB_BODY_AGENT: 'administrative.relationshipEdit.endRelationship.agentSurname',
  LABEL_TITLE_AGENT: 'administrative.relationshipEdit.relationshipData.agent',
  LABEL_TITLE_CLIENT: 'administrative.relationshipEdit.relationshipData.client',
  LABEL_TITLE_CLIENT_LAC: 'administrative.relationshipEdit.relationshipData.clientLac'
};

export const LIST_COL_EXPORT_CUSTOMER: CustomerField[] = [
  'WarningOrError',
  'CustomerCode',
  'SurnameNameCompanyName',
  'VATNumber',
  'TaxCode',
  'AdministrativeName',
  'RelationshipType',
  'EndOfRelationshipValidity',
  'CategoryCode',
  'AdministrationReference',
  'FinancialDetailVatSubjection',
  'FinancialDetailVatExemptionCode',
  'FinancialDetailInvoiceVatRate',
  'FinancialDetailVatExemptionDescription',
  'FinancialDetailExemptionReference',
  'FinancialDetailExemptionReferenceSecondLine',
  'FinancialDetailVatExemptionXmlInvoicesCode',
  'FinancialDetailDeclarationOfIntentProtocol',
  'FinancialDetailDeclarationOfIntentProtocolProgressive',
  'FinancialDetailDeclarationOfIntentDate',
  'InvoiceDetailStartOfAccountingActivity',
  'InvoiceDetailEndOfAccountingActivity',
  'InvoiceDetailPaymentCode',
  'InvoiceDetailXmlInvoiceStamp',
  'InvoiceDetailInvoiceInPdf',
  'InvoiceDetailInvoiceEmail',
  'InvoiceDetailInvoiceDelivery',
  'BankDetailAbi',
  'BankDescription',
  'BankDetailCab',
  'BankAgencyDescription',
  'BankDetailAccountNumber',
  'BankDetailCin',
  'BankDetailIban',
  'BankDetailBic',
  'BankDetailBankCredit',
  'BankDetailRemittanceAbi',
  'BankRemittanceDescription',
  'BankDetailRemittanceCab',
  'BankRemittanceAgencyDescription',
  'BankDetailRemittanceAccountNumber',
  'BankDetailRemittanceCin',
  'BankDetailRemittanceIban',
  'BankDetailRemittanceBic',
  'Type',
  'ReferenceOfficeId',
  'FixedRight',
  'AgentCode',
  'ProvPercentage',
  'PotentialCustomerCode',
  'SalesforceLeadCode',
  'Discount1',
  'Discount2',
  'Discount3',
  'TypeDiscounts',
  'ChargeForStampDutyExpenses',
  'BankChargesBilling',
  'ChargeForStampingFeesReceipt',
  'Expired',
  'Blocked',
  'SendingAccountStatement',
  'Reminder',
  'GenericCustomer'
];

export const LIST_COL_EXPORT_AGENT: AgentField[] = [
  'AgentCode',
  'SurnameNameCompanyName',
  'VATNumber',
  'TaxCode',
  'AdministrativeName',
  'EndOfRelationshipValidity',
  'AgentType',
  'PercentageProvision',
  'InvoiceNo',
  'TurnoverImp',
  'ProvisionalImp'
];
