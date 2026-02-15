export const VAT_NUMBER_REGEX = '^\\d{11}$'; // '^[1-9]\\d{10}$';
export const TAX_CODE_OR_VAT_NUMBER_REGEX = '^([A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]|\\d{11})$'; // Italian Tax Code or VAT Number regex
export const DECIMAL_REGEX = '^[0-9]+(\\,[0-9]{1,2})?$';
export const DECIMAL_2_1_REGEX = '^[0-9]{1,2}(\\.[0-9])?$';
export const DECIMAL_8_2_REGEX = '^[0-9]{1,8}(\\.[0-9]{1,2})?$';
export const DECIMAL_5_2_REGEX = '^[0-9]{1,5}(\\.[0-9]{1,2})?$';
export const AT_LEAST_ONE_ALPHANUMERIC_REGEX = '^(?=.*[a-zA-Z]).*$';
export const ONLY_NUMBERS_REGEX = '^[0-9]*$';
export const POSTAL_CODE_IT_REGEX = '^[0-9]{5}$'; // Italian Postal Code regex
export const NO_SPECIAL_CHARACTER_REGEX = '^[a-zA-Z0-9 ]*$'; // Allows letters, numbers, and spaces only
export const CF_IT_REGEX = '^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$'; // Italian Codice Fiscale regex
export const EMAIL_REGEX = '^[^@\\s]+@[a-zA-Z0-9._%+-]+\\.[a-zA-Z.-]{2,}$'; // Regex for validating email addresses
// export const PHONE_NUMBER_REGEX = '^(?=(?:[^\\d]*\\d){0,15}[^\\d]*$)[\\d\\s\\-()+]+$';
// export const MOBILE_PHONE_NUMBER_REGEX = '^(?=(?:[^\\d]*\\d){0,20}[^\\d]*$)[\\d\\s\\-()+]+$';
export const IBAN_REGEX = '^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$'; // Regex for validating IBANs
