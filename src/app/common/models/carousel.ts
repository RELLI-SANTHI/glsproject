export interface Carousel<T> {
  id: number;
  status: string;
  icon: string;
  fields: T[];
  corporateGroupId?: number;
  vatNumber?: string;
}
