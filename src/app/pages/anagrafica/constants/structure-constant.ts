import { ColTableInterface } from '../../../common/models/col-table-interface';
import { FUNCTIONALITY, PERMISSION, PROFILE } from '../../../common/utilities/constants/profile';

export const STRUCTURE_CONSTANTS = {
  EDIT: 'edit',
  CREATE: 'create',
  EXPORT_FILE_NAME: 'Structures'
};

export const FILTER_TYPE_LIST = [
  { id: 'BuildingAcronym', value: 'anagrafica.structure.field.BuildingAcronym' },
  { id: 'BuildingName', value: 'anagrafica.structure.field.BuildingName' },
  {id: 'companyName', value: 'anagrafica.structure.field.companyName'},
];

export const DEFAULT_COLUMNS: ColTableInterface[] = [
  {
    columnVisible: true,
    block: true,
    field: 'Warning',
    label: 'structureList.columnList.Warning',
    sortable: true,
    width: 100
  }, // warning
  {
    columnVisible: true,
    block: true,
    field: 'status',
    label: 'structureList.columnList.status',
    sortable: true,
    width: 130
  }, // stato
  {
    columnVisible: true,
    block: true,
    field: 'BuildingAcronym',
    label: 'structureList.columnList.BuildingAcronym',
    sortable: true,
    width: 70
  }, // sigla
  {
    columnVisible: true,
    block: true,
    field: 'BuildingName',
    label: 'structureList.columnList.BuildingName',
    sortable: true
  }, // denominazione
  {
    columnVisible: true,
    block: false,
    field: 'BuildingType',
    label: 'structureList.columnList.BuildingType',
    sortable: true
  }, // template
  { columnVisible: true, block: false, field: 'Name', label: 'structureList.columnList.Name', sortable: true }, // ragione sociale
  { columnVisible: true, block: false, field: 'Region', label: 'structureList.columnList.Region', sortable: true }, // regione
  { columnVisible: true, block: false, field: 'Area', label: 'structureList.columnList.Area', sortable: true }, // Area
  {
    columnVisible: true,
    block: false,
    field: 'StartOfOperationalActivity',
    label: 'structureList.columnList.ActivationDate',
    sortable: true
  }, // data apertura
  {
    columnVisible: true,
    block: false,
    field: 'EndOfOperationalActivity',
    label: 'structureList.columnList.DisableDate',
    sortable: true
  } // data chiusura
];

export const AdministrativePermissionList = {
  networkStructureAny: { profile: PROFILE.any, functionality: FUNCTIONALITY.networkStructure, permission: PERMISSION.any },
  networkStructureWrite: { profile: PROFILE.any, functionality: FUNCTIONALITY.networkStructure, permission: PERMISSION.write },
  networkTemplateAny: { profile: PROFILE.any, functionality: FUNCTIONALITY.networkTemplate, permission: PERMISSION.any },
  networkTemplateWrite: { profile: PROFILE.any, functionality: FUNCTIONALITY.networkTemplate, permission: PERMISSION.write }
};
