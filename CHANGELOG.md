# Changelog

## [2025-09-26]

- [fix - Standardized postal code validation patterns across administrative forms]
- [fix/17321 - Fixed nation-specific validation rules for address fields - xmlStampContribution]
- [fix/17356 - Enhanced nation handling and form validation in administrative module]
- [fix/17355 - Fixed registered office address validation when changing countries]
- [fix/17353 - Improved form label logic and validation in company and relationship components]
- [fix/17354 - Improved postal code validation and address handling]

## [2025-09-25]

- [fix - Fixed tax code validation based on country selection in company forms]
- [fix - Fixed nation default handling in subject components]
- [fix - Fixed Italian subject detection in relationship edit]
- [fix - Enhanced form validation across administrative components]
- [fix - Refactored nation handling in relationship components]
- [fix/17318 - Fixed parseDateValues to handle declarationOfIntentDate in financialDetail]
- [fix/17317 - 17316 - 17331 - Enhanced nationality validation for bank account handling]
- [fix - Improved form validation for subject address and billing data managing ISO CODE]
- [fix/17268 - Refactored address validation for international companies]
- [fix/17314 - Fixed relationship subject selection and validation in container component]
- [fix/17303 - Fixed relationship draft validation and save logic in relationship edit component]

## [2025-09-24]

- [fix/17303 - Fixed relationship draft validation and save logic in relationship edit component]
- [fix/17320 - Fixed subject accordion selection and state handling in SubjectAccordionsComponent]
- [fix/17316 - Fixed banking data validation and error state handling in relationship components]
- [fix/17161 - Fixed tax code validation in fiscal representative form]
- [fix/17315 - Fixed payment code selection and radio button state in billing data form]
- [fix - Fix agenCode param]
- [fix/17313 - Fixed permission logic for addRelation button in subject detail]
- [fix/17305 - Province required validation for both IT and IT_FULL nations in permanent establishment details]
- [fix/17302 - Manage provinces for Italy countri in subject general data]
- [fix/17308 - Fixed tax code validation based on selected country in subject edit form]
- [fix/17307 - Refactored nation handling in subject billing data forms]
- [fix/17302 - Manage provinces for Italy in subject general data]

## [2025-09-23]

- [fix - Refactored relationship edit logic and improved validation for commercial and data forms]
- [fix - Fixed permission in relationship detail agent route]
- [fix/17282 - Added Society column for non-agent commercial relations and improved table clarity]

## [2025-09-22]

- [fix - Improved error icon alignment and dynamic class binding for ABI and CAB fields in banking data form]
- [fix/17261 - Manage access on draft carousel]
- [fix - Default nation]

## [2025-09-19]

- [fix - Added error 311 for concurrency message for role lock handling]
- [fix - Updated session timeout configuration]

## [2025-09-18]

- [fix - Improved navigation handling and refactored imports in main app component]
- [fix - Migrated subject edit body component to use getDateAdded() functions and manage date format for datepiker]
- [fix - Removed draft display and WIP status handling in relationship components]
- [fix - Added error 310 for concurrency message for role lock handling]
- [fix - Enhanced relationship component test coverage and corporate group handling]
- [fix - Improved error icon alignment and dynamic class binding for ABI and CAB fields in banking data form]
- [fix/17162 - Fixed subject navigation and concurrency timeout handling]
- [fix/17160 - Fixed country name display in fiscal representative form]
- [fix/17153 - Cahnge labelTaxRepCountryId from ID to Name]
- [fix - Enhanced role permissions handling for special visibility and admin access]
- [fix - Added translation for concurrency modal title]
- [fix/17159 - Added interval-based concurrency handling with session timeout]
- [fix - Width Company column]

## [2025-09-17]

- [feature - Mobile layout for paginator and accessibility]
- [fix - Bug fixes and cross-functional improvements to components, services, and tests in the administrative, registry, and user profile areas]
- [feature - Enhanced banking data validation with conditional remittance handling]
- [fix/17132 - Enhanced validation and error handling in relationship edit component]

## [2025-09-16]

- [fix/17057 - Improved banking data management and validation in relationships]
- [fix - Unified pagination component across table views for consistent user experience]
- [fix - Enhanced responsive design and navigation for mobile users]
- [fix - Enhanced role permissions and form management in user profiles and relationships]
- [feature/17100 - Enhanced address field handling for non-Italian addresses]
- [fix - Improved visualization, pagination, and sorting of commercial relations tables in administrative modules]

## [2025-09-12]

- [fix - Improved responsiveness of information columns in administrative entity forms]
- [fix/17080 - Typo correction and best practice improvements in FiscalDataComponent]
- [fix/16950 - removed limit row from commercial-relations of society]
- [fix - Improved structure selection persistence in modal dialog]
- [fix/17053 - Improved banking data form validation and translation messages]
- [fix/17056 - Enhanced structure selection state management in user profile]
- [fix - Fixed pagination and column display in commercial relations tables]

## [2025-09-11]

- [fix - Refactored user profile to use string-based identifiers and updated related UI components]
- [fix/17074 - Improved subject modal translation and dynamic form validation]
- [fix - Adjusted column widths in subject list table]
- [fix - Fixed bug in subject edit modal by cloning form data]
- [fix - Refactored and fixed various parts of the administrative module]
- [feature/17054 - Change generate code]

## [2025-09-10]

- [fix/17075 - Add search by CF]
- [fix - Improved UI and table usability for agents, payments, and structure details]
- [fix - Refactored API endpoint paths and updated environment configurations]
- [fix/17057 - Show error for ABII CAB deleted]

## [2025-09-09]

- [fix - Enhanced VAT exemption code display in relationship fiscal data component]
- [fix - Improved UI layout and date handling in administrative subject edit and commercial relations components]
- [fix - Enhanced table title styling with bold font weight in structure list]
- [fix - Fixed placeholder text inconsistencies in user profile modals]
- [fix/17050 - Increased company name field max length from 35 to 40 characters]
- [fix/16242 - Added bank remittance fields]
- [feature/17034 - Updated OpenAPI administrative schema to replace customerCode with isCustomerLac boolean field]

## [2025-09-08]

- [fix - Fixed multiple UI, logic, and test issues across administrative, anagrafica, and user-profile modules, including service mocks and mobile display improvements]
- [fix - Removed unused label properties from modal form components]

## [2025-09-05]

- [fix/16242 - Updated constants, components, and translations for administrative company, relationship, and subject management]
- [fix - Added Admin profile support to user list component filter and display logic]
- [fix - Enhanced profile utility to support array-type functionality parameters for better permission handling]
- [fix - Fixed validation, history modal, and detail components]
- [fix - Fixed search button validation and form error handling in relationship subject container]
- [fix - Removed unused imports and standardized export file naming in administrative components]
- [fix - Added permission-based access control for relationship type selection and API calls]
- [fix - Fixed ESLint warnings and standardized export field ordering in administrative components]

## [2025-09-04]

- [fix/16908 - Set initial sort and active sort indicator on first column in administrative history modal]
- [fix/16993 - Enhanced administrative components with translation support and permission handling]
- [fix - Fixed status filtering in replace agents modal component]
- [fix/16944 - Change label for massive export]
- [fix/16242 - Added language translation support and RelationshipType field to export functionalities]
- [fix/16983 - Added permission for massive Agent and ABI-CAB]

## [2025-09-03]

- [fix/16979 - Fixed dynamic bank field selection and refactored validator logic in relationship banking data component]
- [fix/16984 - Fixed inconsistent text format in Italian translation]
- [fix - Changed error code 151]
- [fix/16908 - Improved search and history display in administrative history modal]
- [fix/16975 - Improved logic and tests for administrative relationship edit]
- [fix/16409 - Fix column width of user list]

## [2025-09-02]

- [fix/16976 - Fixed form validation behavior and improved date parsing in relationship edit components]
- [fix/16872 - Refactored and consolidated date handling in components and utility, Refactored date handling utilities and consolidated date conversion methods]
- [fix/16910 - Fixed capitalized boolean values translation in administrative history modal]

## [2025-09-01]

- [fix/16954 - Update label internal error code 151]
- [fix/16950 - Removed row display limit from commercial relations datatable]
- [fix/16944 - Fixed field ordering and translation for AdministrativeName in bank replacement functionality]
- [fix/16929 - Fixed validation error display in company general data form]
- [fix/16236 - Fixed Italian translations for business register province and certified email labels]
- [fix/16458 - Removed unnecessary isFromSubject dependency from relationship fiscal data]
- [fix/16242 - Update label translations and add missing columns for customer export, Fixed Update label translations and add missing columns for customer export]
- [fix/16940 - Improved ReplaceBankTableComponent: fixed input/output bindings, enhanced pagination and filtering logic, updated tests and HTML structure]
- [fix/16928 - Add fields to export]

## [2025-08-29]

- [fix/16934 - Fixed CSS selector specificity for datatable tree button icon]
- [fix/16903 - Fixed typo in Italian error message translation]
- [fix/16233 - Fixed navigation menu labels capitalization consistency]
- [fix/16243 - Fixed typo in Italian translation for CategoryCode field]

## [2025-08-28]

- [fix/16930 - Updated Italian translation for CompanyName field consistency]
- [fix/16914 - Improved UI consistency and user experience in replace modals]
- [feature/16189 - Identification methods for SEDE type structures]
- [fix/16910 - Edit translation code for Vat Group]
- [fix/16918 - Added ESLint exception and new error message translations for duplicate validation]
- [fix/16914 - Fixed agent and bank replacement API integration with updated endpoints and parameter names]

## [2025-08-27]

- [fix/16904 - Updated translations for btn modal]
- [fix/16902 - Fixed mapping and display of fields "AdministrativeName" and "WarningOrError" in the agents list]
- [fix/16242 - Update translations for Invoice Rate]
- [fix/16915 - Sintax dropdown error]
- [fix/16912 - Sintax label error]
- [fix/16439 - Map new translation error 151 and change 061]
- [fix/16907 - Fixed UI layout and styling issues in administrative history modal]

## [2025-08-26]

- [fix/16737 - Replacing code snippets with the get method]
- [fix/16242 - Added InvoiceVatRate field to CustomerField enum in OpenAPI schema]
- [fix/16871 - Enhanced TrimInputDirective to prevent invalid characters in number inputs]
- [fix/16233 - Standardized capitalization in role management functionality labels]
- [fix/16898 - Added missing export fields and translations for category and VAT exemption descriptions]
- [fix/16444 - Fixed issue with saving the Subject from modal and reload the detail for check is doganale fore create relationship]
- [fix/16433 - Disabled company name length validation and updated customer field schemas]
- [fix/16236 - Add new fields to export and translations for society export]
- [fix/16239 - Remove duplication from subject export: The "Tipo committente" field appears twice ]
- [fix/16738 - Update company status constants and refactor related components, moved reused constants into generic constants file]

## [2025-08-25]

- [feature/16189 - Added isDepot field to StructureModel schema and disabled company name validation]

## [2025-08-19]

- [fix - Fix auto close message in relationship edit component]
- [fix - Fix save relationship button in relationship edit component when is not on draft]

## [2025-08-18]

- [fix - Fix label translations for history modal]

## [2025-08-11]

- [feature/popup_deactivation: Changed deactivation-modal.component as reusable component, moved variables into company.edit component for translations, added message warning into relationship-detail.component inf have end relationship date valued, added the control into relationship-edit.component edit end od relationship and lunch the modal of confirm]

## [2025-08-09]

- [feature/15890 - Manage error message for duplicated VAT number]

## [2025-08-07]

- [feature - Default filter selected]
- [fix - Manage disable on save subject button in relationship page]
- [fix/16438 - Add CorporateGroupName to subject export]
- [fix/16358 - Populate invoiceVatRate with vatRateValue if invoiceVatRateToggle is true]
- [feature/16334 - Added expandable structure list functionality to user detail component]
- [feature - Add Company Group AD column to user list]
- [fix - Fixed permission headers and test cleanup]
- [fix/123 - Fixed relationship edit component header title display and code cleanup]
- [regression - missing method implementation in general-data.component]
- [sonar - sonar qube fix]

## [2025-08-06]

- [feature/14312 - Enhanced banking data functionality with automatic CIN/IBAN generation]
- [feature/13226 - Add column status and warning]
- [feature/13630 - 14732 - Massive replace Agent and Bank]
- [update/sw - Update swagger and customer detail types in commercial relations component]
- [fix/loop14 - Add CategotyCode column on Company relationship list]
- [fix/16355 - Updated error messages 049 and 082 to provide more detailed information]
- [fix/loop13 - add Disabled Date column on Company Structure list]
- [fix/16434 - Removed conditional disable logic for additionalCompanyName field]
- [fix/16379 - Fixed spacing in IVA code label formatting]
- [fix/loop8 - Fixed infinite loop in relationship commercial data component]
- [fix/loop6 - change label]
- [fix/loop12 - red alert position on subject]

## [2025-08-05]

- [fix - Updated tax code validation to support both tax codes and VAT numbers]
- [fix/16403 - add column to company export]
- [fix/16410 - Fix draft button validation to check all required fields in company edit]
- [fix/16406 - Add conditional rendering for stepper component in relationship edit]
- [fix/16233 - fix]
- [fix - Add agentName to relationship detail and swagger]
