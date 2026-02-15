export interface SortFiledUserList {
    field:
      | 'Profile'
      | 'State'
      | 'NameSurname'
      | 'SocietyGroup'
      | 'Email'
      | 'Action';
    direction: 'asc' | 'desc';
}