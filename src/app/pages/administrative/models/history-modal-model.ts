export interface HistoryModalModel {
  fieldName: string;
  prefixLabel?: string; // Optional field for better UI representation
  lastUpdate: string;
  treeStatus?: 'collapsed' | 'expanded' | 'disabled';
  items?: HistoryModalModelItem[];
  id?: string;
  parentId?: string;
}

export interface HistoryModalModelItem {
  value: string;
  date: string;
}
