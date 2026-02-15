/**
 * * Interface representing a generic dropdown item.
 * * It is used to define the structure of dropdown items in forms.
 * * It includes an `id` and a `value` property.
 */
export interface GenericDropdown {
  id: string | number | null | undefined;
  value: string | null | undefined;
  isDefault?: boolean; // Optional property to indicate if this is the default item
  code?: string | null | undefined; // Optional property for additional code information (e.g. for nation is ISO code)
}
