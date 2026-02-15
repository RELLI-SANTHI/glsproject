export class IstructureDetail {
  id?: number;
  templateId?: number;
  buildingAcronym?: string;
  buildingName?: string;
  buildingType?: string;
  icon?: string;
  buildingAcronymMinLength?: number;
  buildingAcronymMaxLength?: number;
  status?: string;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
  lock_status?: string;
  lockedBy?: string;
  warning?: boolean;
  lockTimestamp?: string;
  fields: IstructureDetailField[] = [];
  DisableDate?: string;
}

export class IstructureDetailField {
  fieldId?: number;
  fieldName?: string;
  fieldType?: string;
  value?: string;
  isVisible?: boolean;
  isRequired?: boolean;
  section?: string;
  subSection?: string;
  length?: number;
  decimal?: number;
  lookupdtable?: string;
  simplelookupgroup?: string;
  mandatory?: boolean;
}

export class IstructureCreateTemplateField {
    fieldName?: string;
    fieldType?: string;
    value?: string | null;
    isVisible?: boolean;
    isRequired?: boolean;
    buildingType?: number;
    buildingAcronym?: string;
    buildingName?: string;
    constraint?: IstructureConstraint;
  }
export class IstructureConstraint {
  min?: number;
  max?: number;
}