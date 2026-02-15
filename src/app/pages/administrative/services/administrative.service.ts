import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SubjectResponse } from '../../../api/glsAdministrativeApi/models/subject-response';
import { CompanyDetailResponse, CreateCompanyRequest, CustomerResponse } from '../../../api/glsAdministrativeApi/models';
import { AgentCreateModel } from '../../../api/glsAdministrativeApi/models/agent-create-model';
import { RelationshipType } from '../relationship/enum/relationship-type';
import { TypeCustomer } from '../relationship/enum/type-customer';
import { SubjectValidator } from '../subject/validators/subject-validator';
import { UserProfileService } from '../../../common/utilities/services/profile/user-profile.service';
import { UserDetailsModel } from '../../../api/glsUserApi/models';
import { FUNCTIONALITY, PERMISSION, PROFILE } from '../../../common/utilities/constants/profile';
import { CompanyValidator } from '../company/validators/company-validator';
import {
  AT_LEAST_ONE_ALPHANUMERIC_REGEX,
  DECIMAL_2_1_REGEX,
  DECIMAL_5_2_REGEX,
  DECIMAL_8_2_REGEX,
  EMAIL_REGEX,
  IBAN_REGEX,
  NO_SPECIAL_CHARACTER_REGEX,
  ONLY_NUMBERS_REGEX,
  POSTAL_CODE_IT_REGEX,
  VAT_NUMBER_REGEX
} from '../../../common/utilities/constants/constant-validator';
import { RelationshipValidator } from '../relationship/validators/relationship-validator';
import { maxTwoDecimalsValidator } from '../../../common/utilities/validators/numeric.validator';
import { UtilityProfile } from '../../../common/utilities/utility-profile';
import { Utility } from '../../../common/utilities/utility';

@Injectable()
export class AdministrativeCommonService {
  protected readonly userProfileService = inject(UserProfileService);
  private readonly formattedDate = new Date().toLocaleDateString('it-IT');
  private readonly fb = inject(FormBuilder);

  // eslint-disable-next-line max-lines-per-function
  setSubjectForm(user: UserDetailsModel, subject?: SubjectResponse): FormGroup {
    let corporateGroupId: number | undefined | null = null;
    corporateGroupId = user?.corporateGroup?.id;

    return this.fb.group(
      {
        id: subject?.id ?? null,
        corporateGroupId: [
          { value: subject?.corporateGroupId ?? corporateGroupId, disabled: subject?.id ? true : false },
          Validators.required
        ],
        isPhysicalPerson: [subject?.isPhysicalPerson ?? false, Validators.required],
        surname: [subject?.surname ?? null, Validators.maxLength(35)],
        name: [subject?.name ?? null, Validators.maxLength(35)],
        // Rag Soc
        companyName: [subject?.companyName ?? null, [Validators.required, Validators.maxLength(35)]],
        additionalCompanyName: [subject?.additionalCompanyName ?? null, Validators.maxLength(35)],
        surnameNameCompanyName: [subject?.surnameNameCompanyName ?? null],
        nationId: [subject?.nationId ?? null, Validators.required], // default by BE
        nationName: [subject?.nationName ?? null], // default by BE
        address: [
          subject?.address ?? null,
          [Validators.required, Validators.pattern(AT_LEAST_ONE_ALPHANUMERIC_REGEX), Validators.maxLength(30)]
        ],
        postCode: [subject?.postCode ?? null, [Validators.required, Validators.pattern(POSTAL_CODE_IT_REGEX), Validators.maxLength(5)]],
        city: [subject?.city ?? null, [Validators.required, Validators.pattern(NO_SPECIAL_CHARACTER_REGEX), Validators.maxLength(35)]],
        provinceId: [subject?.provinceId ?? null, Validators.required],
        regionId: [subject?.regionId ?? null, Validators.required],
        vatGroup: [subject?.vatGroup ?? false],
        nonProfitAssociation: [subject?.nonProfitAssociation ?? false],
        // 11 characters for Italian VAT number. the other countries have different rules.
        // if vatGroup is true, this field vatNumber is required
        vatNumber: [subject?.vatNumber ?? null, [Validators.pattern(VAT_NUMBER_REGEX), Validators.minLength(11), Validators.maxLength(11)]],
        // if nonProfitAssociation is true, this field taxCode is NOT required
        taxCode: [subject?.taxCode ?? null, [Validators.required, Validators.maxLength(16)]], // CF
        atecoCodeId: [subject?.atecoCodeId ?? null],
        languageId: [subject?.languageId ?? null, Validators.required], // Default from BE
        currencyId: [subject?.currencyId ?? null], // Valuta default from BE
        isPrivate: [subject?.isPrivate ?? false, Validators.required],
        dateAdded: [
          {
            value: subject?.dateAdded ?? new Date(),
            disabled: true
          }
        ],
        customSubjectIct10: [subject?.customSubjectIct10 ?? false], // Soggetto doganale ICT 10
        contactDetail: this.fb.group({
          email: [subject?.contactDetail?.email ?? null, [Validators.maxLength(50), Validators.email, Validators.pattern(EMAIL_REGEX)]],
          telephone: [subject?.contactDetail?.telephone ?? null, [Validators.maxLength(15)]],
          fax: [subject?.contactDetail?.fax ?? null, [Validators.maxLength(15)]],
          mobilePhone: [subject?.contactDetail?.mobilePhone ?? null, [Validators.maxLength(20)]],
          contact: [subject?.contactDetail?.contact ?? null, Validators.maxLength(35)]
        }),
        invoiceDetail: this.fb.group({
          recipientCustomerCode: [
            subject?.invoiceDetail?.recipientCustomerCode ?? null,
            [Validators.minLength(6), Validators.maxLength(7)]
          ],
          pec: [subject?.invoiceDetail?.pec ?? null, [Validators.maxLength(70), Validators.email, Validators.pattern(EMAIL_REGEX)]],
          invoiceDeliveryAddress: [subject?.invoiceDetail?.invoiceDeliveryAddress ?? null, Validators.maxLength(30)],
          postcodeForInvoiceDelivery: [
            subject?.invoiceDetail?.postcodeForInvoiceDelivery ?? null,
            [Validators.pattern(POSTAL_CODE_IT_REGEX), Validators.maxLength(5)]
          ],
          invoiceDeliveryLocation: [subject?.invoiceDetail?.invoiceDeliveryLocation ?? null, Validators.maxLength(30)],
          provinceForInvoiceDelivery: [subject?.invoiceDetail?.provinceForInvoiceDeliveryName ?? null, Validators.maxLength(4)],
          provinceForInvoiceDeliveryId: [subject?.invoiceDetail?.provinceForInvoiceDeliveryId ?? null]
        }),
        permanentEstablishmentDetail: this.fb.group(
          {
            subjectType: [!!subject?.permanentEstablishmentDetail?.nationId],
            nationId: [subject?.permanentEstablishmentDetail?.nationId ?? null],
            nationName: [subject?.permanentEstablishmentDetail?.nationName ?? null],
            address: [subject?.permanentEstablishmentDetail?.address ?? null, Validators.maxLength(60)],
            postCode: [
              subject?.permanentEstablishmentDetail?.postCode ?? null,
              [Validators.pattern(POSTAL_CODE_IT_REGEX), Validators.maxLength(5)]
            ],
            city: [subject?.permanentEstablishmentDetail?.city ?? null, Validators.maxLength(60)],
            provinceId: [subject?.permanentEstablishmentDetail?.provinceId ?? null]
          },
          {
            validators: [
              (formGroup: FormGroup) => {
                SubjectValidator.updatePermanentEstablishmentDetailValidators(formGroup);

                return null;
              }
            ]
          }
        ),
        taxRepresentativeDetail: this.fb.group({
          selectRadioFiscalRapp: [subject?.taxRepresentativeDetail?.countryID ? true : false],
          countryID: [subject?.taxRepresentativeDetail?.countryID ?? null],
          countryName: [subject?.taxRepresentativeDetail?.countryName ?? null],
          codeId: [subject?.taxRepresentativeDetail?.codeId ?? null, Validators.maxLength(28)],
          taxCode: [subject?.taxRepresentativeDetail?.taxCode ?? null, Validators.maxLength(40)],
          taxCodeSecondLine: [subject?.taxRepresentativeDetail?.taxCodeSecondLine ?? null, Validators.maxLength(40)],
          companyName: [subject?.taxRepresentativeDetail?.companyName ?? null, Validators.maxLength(40)],
          companyNameSecondLine: [subject?.taxRepresentativeDetail?.companyNameSecondLine ?? null, Validators.maxLength(40)],
          surname: [subject?.taxRepresentativeDetail?.surname ?? null, Validators.maxLength(35)],
          name: [subject?.taxRepresentativeDetail?.name ?? null, Validators.maxLength(35)]
        })
      },
      {
        validators: [
          (formGroup: FormGroup) => {
            SubjectValidator.updatePersonValidators(formGroup);
            SubjectValidator.updateVatGroupValidators(formGroup);
            SubjectValidator.updateTaxRepresentativeDetailValidators(formGroup);

            return null;
          }
        ]
      }
    );
  }

  // eslint-disable-next-line max-lines-per-function
  setCompanySocietyForm(user?: UserDetailsModel, company?: CompanyDetailResponse): FormGroup {
    let corporateGroupId: number | undefined | null = null;
    const isAdmin = UtilityProfile.checkAccessProfile(this.userProfileService, PROFILE.EVA_ADMIN, FUNCTIONALITY.any, PERMISSION.any);
    corporateGroupId = user?.corporateGroup?.id;

    return this.fb.group({
      generalData: this.fb.group(
        {
          companyname: [company?.name ?? null, [Validators.required, Validators.maxLength(40)]], // Rag Soc
          vatGr: [company?.vatGroup ?? false],
          vatNo: [company?.vatNumber ?? null, [Validators.required, Validators.pattern(VAT_NUMBER_REGEX)]],
          taxIdcode: [company?.taxCode ?? '', [Validators.required, Validators.maxLength(16)]], // CF
          languageId: [company?.languageId ?? null, Validators.required]
        }
        /* {
          validators: [
            (formGroup: FormGroup) => {
              CompanyValidator.updateVatGroupValidators(formGroup);
            }
          ]
        } */
      ),
      contactInformation: this.fb.group({
        email: [company?.email ?? '', [Validators.maxLength(50), Validators.email, Validators.pattern(EMAIL_REGEX)]],
        phone: [company?.telephone ?? null, Validators.maxLength(15)],
        fax: [company?.fax ?? null, Validators.maxLength(15)]
      }),
      registeredOfficeAddress: this.fb.group({
        legalAddressCountry: [company?.nationId ?? null, Validators.required],
        legalAddress: [
          company?.officeAddress ?? null,
          [Validators.required, Validators.pattern(AT_LEAST_ONE_ALPHANUMERIC_REGEX), Validators.maxLength(30)]
        ],
        postalCode: [
          company?.officePostCode ?? '',
          [Validators.required, Validators.pattern(POSTAL_CODE_IT_REGEX), Validators.maxLength(5)]
        ], // '^[0-9]{5}$'
        city: [company?.officeCity ?? '', [Validators.required, Validators.pattern(NO_SPECIAL_CHARACTER_REGEX), Validators.maxLength(35)]],
        province: [company?.provinceId ?? null, Validators.required],
        regione: [company?.regionId ?? null, Validators.required]
      }),
      activityEndDate: this.fb.group({
        activityEndDate: [{ value: company?.companyEndDate ? company.companyEndDate : null, disabled: false }]
      }),
      administrativeRelations: this.fb.group({
        referenceCorporateGroup: [
          {
            value: company?.corporateGroupId ?? (!isAdmin ? corporateGroupId : null),
            disabled: company?.id ? true : false
          },
          Validators.required
        ],
        typeofRelationshipwithGLS: [company?.relationshipType ?? '']
      }),
      billingData: this.fb.group(
        {
          custCodeRec: [company?.recipientTaxCode ?? '', [Validators.minLength(6), Validators.maxLength(7)]],
          pec: [company?.certifiedEmail ?? '', [Validators.maxLength(70), Validators.email, Validators.pattern(EMAIL_REGEX)]]
        },
        {
          validators: [
            (formGroup: FormGroup) => {
              CompanyValidator.updateBillingDataValidators(formGroup);
            }
          ]
        }
      ),
      companyData: this.fb.group({
        shareCapital: [
          company?.shareCapital ?? null,
          [Validators.required, Validators.min(0), Validators.max(99999999.99), maxTwoDecimalsValidator]
        ],
        stateSocialCapital: [company?.shareCapitalStatus ?? '', [Validators.required, Validators.maxLength(5)]],
        reaNumber: [company?.rea ?? '', [Validators.required, Validators.maxLength(8)]],
        businessRegister: [company?.businessRegisterOf ?? '', [Validators.required, Validators.maxLength(20)]],
        provinceofcRegister: [company?.businessRegisterProvinceId ?? null, Validators.required],
        registrationNumber: [company?.registrationNumberRegisterHauliers ?? '', [Validators.required, Validators.maxLength(20)]],
        singleMultipleMember: [company?.isSingleMember ?? '', Validators.required]
      })
    });
  }

  // eslint-disable-next-line max-lines-per-function
  setDetailRelationshipCustomer(typeClient: TypeCustomer, relationship?: CustomerResponse): FormGroup {
    return this.fb.group({
      administrationReference: [relationship?.administrationReference ?? '', Validators.maxLength(20)],
      endOfRelationshipValidity: [
        { value: relationship?.endOfRelationshipValidity ?? null, disabled: !relationship || relationship.status === 'DRAFT' }
      ],
      fixedRight: [relationship?.fixedRight ?? null, Validators.pattern(DECIMAL_5_2_REGEX)],
      agentId: [relationship?.agentId ?? null],
      agentCode: [relationship?.agentCode ?? null],
      agentName: [relationship?.agentName ?? null],
      provPercentage: [relationship?.provPercentage ?? null, Validators.pattern(DECIMAL_2_1_REGEX)],
      potentialCustomerCode: [relationship?.potentialCustomerCode ?? null, Validators.maxLength(10)],
      salesforceLeadCode: [relationship?.salesforceLeadCode ?? null, Validators.maxLength(10)],
      discount1: [relationship?.discount1 ?? null, Validators.pattern(DECIMAL_2_1_REGEX)],
      discount2: [relationship?.discount2 ?? null, Validators.pattern(DECIMAL_2_1_REGEX)],
      discount3: [relationship?.discount3 ?? null, Validators.pattern(DECIMAL_2_1_REGEX)],
      typeDiscounts: [relationship?.typeDiscounts ?? 'Fine Fattura'],
      chargeForStampDutyExpenses: [relationship?.chargeForStampDutyExpenses ?? false],
      bankChargesBilling: [relationship?.bankChargesBilling ?? false],
      chargeForStampingFeesReceipt: [relationship?.chargeForStampingFeesReceipt ?? false],
      expired: [{ value: relationship?.expired ?? false, disabled: true }],
      blocked: [{ value: relationship?.blocked ?? false, disabled: true }],
      sendingAccountStatement: [relationship?.sendingAccountStatement ?? false],
      reminder: [relationship?.reminder ?? ''],
      genericCustomer: [relationship?.genericCustomer ?? false],
      status: [relationship?.status ?? null],
      subjectId: [relationship?.subjectId ?? null, Validators.required],
      customerCode: [
        relationship?.customerCode ?? null
        // [Validators.required, Validators.pattern(ONLY_NUMBERS_REGEX), Validators.maxLength(6)]
      ],
      categoryId: [relationship?.categoryId ?? null, Validators.required],
      categoryCode: [relationship?.categoryCode ?? null],
      administrativeId: [relationship?.administrativeId ?? null, Validators.required],
      typeRelationship: [typeClient],
      type: [relationship?.type ?? ''],
      referenceOfficeId: [relationship?.referenceOfficeId ?? null],
      financialDetail: this.fb.group(
        {
          vatSubjection: [relationship?.financialDetail?.vatSubjection ?? null, Validators.required],
          vatRateValue: [relationship?.financialDetail?.vatRateValue ?? null, Validators.required],
          exemptionReference: [relationship?.financialDetail?.exemptionReference ?? null, Validators.maxLength(65)],
          exemptionReferenceSecondLine: [relationship?.financialDetail?.exemptionReferenceSecondLine ?? null, Validators.maxLength(65)],
          invoiceVatRate: [
            relationship?.financialDetail?.invoiceVatRate ?? null,
            [Validators.maxLength(2), Validators.pattern(ONLY_NUMBERS_REGEX)]
          ],
          declarationOfIntentProtocol: [
            relationship?.financialDetail?.declarationOfIntentProtocol ?? null,
            [Validators.pattern(ONLY_NUMBERS_REGEX), Validators.maxLength(17)]
          ],
          declarationOfIntentProtocolProgressive: [
            relationship?.financialDetail?.declarationOfIntentProtocolProgressive ?? null,
            [Validators.pattern(ONLY_NUMBERS_REGEX), Validators.maxLength(6)]
          ],
          declarationOfIntentDate: [Utility.convertFromGenericDataToDatepicker(relationship?.financialDetail?.declarationOfIntentDate)],
          description: [{ value: relationship?.financialDetail?.exemptionDescription ?? null, disabled: true }],
          vatExemptionId: [relationship?.financialDetail?.vatExemptionId ?? null],
          vatXmlNewCode: [{ value: relationship?.financialDetail?.vatXmlNewCode ?? null, disabled: true }],
          vatExemptionCode: [relationship?.financialDetail?.vatExemptionCode ?? null],
          invoiceVatRateToggle: [false]
        },
        {
          validators: [
            (formGroup: FormGroup) => {
              RelationshipValidator.updateFinancialDetailValidators(formGroup);
            }
          ]
        }
      ),
      invoiceDetail: this.fb.group(
        {
          startOfAccountingActivity: [relationship?.invoiceDetail?.startOfAccountingActivity ?? null, Validators.required],
          endOfAccountingActivity: [relationship?.invoiceDetail?.endOfAccountingActivity ?? null],
          paymentId: [relationship?.invoiceDetail?.paymentId ?? null, Validators.required],
          xmlInvoiceStamp: [relationship?.invoiceDetail?.xmlInvoiceStamp ?? false],
          invoiceInPDF: [relationship?.invoiceDetail?.invoiceInPDF ?? false],
          invoiceEmail: [
            relationship?.invoiceDetail?.invoiceEmail ?? null,
            [Validators.maxLength(70), Validators.email, Validators.pattern(EMAIL_REGEX)]
          ],
          invoiceDelivery: [relationship?.invoiceDetail?.invoiceDelivery ?? false]
        },
        {
          validators: [
            (formGroup: FormGroup) => {
              RelationshipValidator.updateInvoiceDetailValidators(formGroup);
            }
          ]
        }
      ),
      bankDetail: this.fb.group({
        bankId: [relationship?.bankDetail?.bankId ?? null],
        remittanceBankId: [relationship?.bankDetail?.remittanceBankId ?? null],
        accountNumber: [relationship?.bankDetail?.accountNumber ?? null, [Validators.maxLength(12)]],
        abiCode: [
          relationship?.bankDetail?.abiCode ?? null,
          [Validators.pattern('^[0-9]{5}$'), Validators.minLength(5), Validators.maxLength(5)]
        ],
        cabCode: [
          relationship?.bankDetail?.cabCode ?? null,
          [Validators.pattern('^[0-9]{5}$'), Validators.minLength(5), Validators.maxLength(5)]
        ],
        remittanceAbiCode: [
          relationship?.bankDetail?.remittanceAbiCode ?? null,
          [Validators.pattern('^[0-9]{5}$'), Validators.minLength(5), Validators.maxLength(5)]
        ],
        remittanceCabCode: [
          relationship?.bankDetail?.remittanceCabCode ?? null,
          [Validators.pattern('^[0-9]{5}$'), Validators.minLength(5), Validators.maxLength(5)]
        ],
        cin: [relationship?.bankDetail?.cin ?? null, Validators.maxLength(1)], // TODO: BE autogeneration 3 characters for NO italian bank account
        iban: [relationship?.bankDetail?.iban ?? null, Validators.pattern(IBAN_REGEX)],
        bic: [relationship?.bankDetail?.bic ?? null, [Validators.pattern(NO_SPECIAL_CHARACTER_REGEX), Validators.maxLength(11)]],
        bankCredit: [relationship?.bankDetail?.bankCredit ?? null, Validators.pattern(DECIMAL_8_2_REGEX)],
        remittanceAccountNumber: [relationship?.bankDetail?.remittanceAccountNumber ?? null, Validators.maxLength(12)],
        // TODO: BE autogeneration 3 characters for NO italian bank account
        remittanceCin: [relationship?.bankDetail?.remittanceCin ?? null, Validators.maxLength(1)],
        remittanceIban: [relationship?.bankDetail?.remittanceIban ?? null, Validators.pattern(IBAN_REGEX)],
        remittanceBic: [
          relationship?.bankDetail?.remittanceBic ?? null,
          [Validators.pattern(NO_SPECIAL_CHARACTER_REGEX), Validators.maxLength(11)]
        ]
      })
    });
  }

  setDetailRelationshipAgent(agent?: AgentCreateModel): FormGroup {
    return this.fb.group({
      subjectId: [agent?.subjectId ?? null, Validators.required],
      agentCode: [agent?.agentCode ?? null, [Validators.required, Validators.pattern(ONLY_NUMBERS_REGEX), Validators.maxLength(4)]],
      administrativeId: [agent?.administrativeId ?? null, Validators.required],
      agentType: [agent?.agentType ?? null, Validators.maxLength(1)],
      percentageProvision: [agent?.percentageProvision ?? null, Validators.pattern(DECIMAL_2_1_REGEX)],
      invoiceNo: [agent?.invoiceNo ?? null, [Validators.maxLength(4), Validators.pattern(ONLY_NUMBERS_REGEX)]],
      turnoverImp: [agent?.turnoverImp ?? null, Validators.pattern(DECIMAL_8_2_REGEX)],
      provisionalImp: [agent?.provisionalImp ?? null, Validators.pattern(DECIMAL_8_2_REGEX)],
      typeRelationship: [RelationshipType.Agent],
      endOfRelationshipValidity: [{ value: agent?.endOfRelationshipValidity ?? null, disabled: !agent }],
      status: [agent?.status ?? null]
    });
  }

  companySocietyToCreateCompanyRequest(): CreateCompanyRequest {
    return {
      businessRegisterOf: '',
      businessRegisterProvinceId: undefined,
      businessRegisterProvinceName: '',
      certifiedEmail: null,
      corporateGroupId: 0,
      email: null,
      fax: null,
      isSingleMember: null,
      languageId: null,
      lastOperation: null,
      lastUpdated: null,
      name: '',
      nationId: null,
      officeAddress: null,
      officeCity: null,
      officePostCode: null,
      provinceId: null,
      rea: null,
      recipientTaxCode: '',
      regionId: null,
      registrationNumberRegisterHauliers: '',
      relationshipType: null,
      shareCapital: 0,
      shareCapitalStatus: '',
      status: null,
      taxCode: '',
      telephone: null,
      vatGroup: true,
      vatNumber: ''
    } as CreateCompanyRequest;
  }
}
