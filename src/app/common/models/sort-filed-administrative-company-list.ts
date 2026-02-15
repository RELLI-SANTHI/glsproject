export interface administrativeCompanyListSort {
    field:
      | 'status'
      | 'name'
      | 'GroupName'
      | 'vatNumber'
      | 'taxCode';
    direction: 'asc' | 'desc';
}