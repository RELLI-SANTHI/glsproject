import { HttpContextToken } from '@angular/common/http';

// Definisci questi token una sola volta, ad esempio in un file shared o in cima all'interceptor:
export const X_PERMISSION = new HttpContextToken<string | null>(() => null);
export const X_PERMISSION_TYPE = new HttpContextToken<string | null>(() => null);

export enum FUNCTIONALITY {
  networkStructure = 'networkStructure',
  networkStructureBreak = 'networkStructureBreak',
  networkTemplate = 'networkTemplate',
  networkAdministrativeCompany = 'networkAdministrative',
  networkAdministrativeBreak = 'networkAdministrativeBreak',
  networkAdministrativeSubject = 'networkSubject',
  networkAdministrativeCustomer = 'networkCustomer',
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
  networkAdministrativeCustomerLAC = 'networkCustomer', // there is not difference BE side
  networkAdministrativeAgent = 'networkAgent',
  networkAdministrativeReplaceBank = 'networkReplaceBank',
  any = 'any'
}

export enum PERMISSION {
  read = 'Read',
  write = 'Write',
  any = 'any'
}

export enum PROFILE {
  EVA_ADMIN = 'EVA_ADMIN',
  EVA_FIELD = 'EVA_FIELD',
  EVA_USER = 'EVA_USER',
  any = 'any'
}

export enum USER_STATUS {
  wip = 'WIP',
  active = 'ACTIVE',
  disabled = 'DISABLED'
}
