import { FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ErrorMessage } from '../models/error-message';
import { HttpContext, HttpErrorResponse } from '@angular/common/http';

import { environment } from '../../../environments/environment';
import { Carousel } from '../models/carousel';
import { ICONS } from './constants/icon';
import { StrictHttpResponse } from '../../api/glsNetworkApi/strict-http-response';
import { VIEW_MODE } from '../app.constants';
import { X_PERMISSION, X_PERMISSION_TYPE } from './constants/profile';
import { MODAL_XL } from './constants/modal-options';
import { FieldValueHistoryModel } from '../../api/glsAdministrativeApi/models';
import { HistoryModalModel } from '../../pages/administrative/models/history-modal-model';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

export class Utility {
  static readonly DELIMITER = '/';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static translate(text: string, translate: TranslateService, param?: any): string {
    if (translate) {
      return translate.instant(text, param);
    } else {
      return text;
    }
  }

  static sliceOverX(text: string, x: number): string {
    return text?.length > x ? text.slice(0, x) : text;
  }

  static requiredFieldControl(form: FormGroup, controlName: string): string {
    return form.get(controlName)?.hasValidator(Validators.required) ? '*' : '';
  }

  static isrRquiredFieldControl(form: FormGroup, controlName: string): boolean {
    return form.get(controlName)?.hasValidator(Validators.required) ? true : false;
  }

  static getErrorMessage(errors: ValidationErrors | null, errorMessage?: ErrorMessage): string {
    if (errors) {
      if (errors['numeric']) {
        return errorMessage?.required || 'generic.error.pattern';
      } else if (errors['required']) {
        return errorMessage?.required || 'generic.error.required';
      } else if (errors['pattern']) {
        return errorMessage?.pattern || 'generic.error.pattern';
      } else if (errors['minLength'] || errors['minlength'] || errors['min']) {
        return errorMessage?.minLength || 'generic.error.minLength';
      } else if (errors['maxLength'] || errors['maxlength'] || errors['max']) {
        return errorMessage?.maxLength || 'generic.error.maxLength';
      } else if (errors['email']) {
        return errorMessage?.email || 'generic.error.email';
      } else if (errors['ngbDate']?.invalid) {
        return errorMessage?.pattern || 'generic.error.pattern';
      } else if (errors['endBeforeStart']) {
        return 'generic.error.endBeforeStart';
      } else {
        return errorMessage?.custom || 'generic.error.generic';
      }
    }

    return '';
  }

  static getHttpErrorStatus(error: HttpErrorResponse): number {
    const errorStatus: number = error.status;

    return errorStatus;
  }

  static getHttpErrorMessage(error: HttpErrorResponse): string {
    const errorHttpMessage: string = error.error.message;
    let errorMessageStringToFormat = errorHttpMessage.substring(errorHttpMessage.indexOf('{'));
    errorMessageStringToFormat = errorMessageStringToFormat.substring(0, errorMessageStringToFormat.lastIndexOf('}') + 1);
    const errorMessagObj = JSON.parse(errorMessageStringToFormat);

    return errorMessagObj.message;
  }

  static getHttpErrorAdditionalMessage(error: HttpErrorResponse): string[] {
    const errorHttpMessage: string = error.error.message;
    let errorMessageStringToFormat = errorHttpMessage.substring(errorHttpMessage.indexOf('{'));
    errorMessageStringToFormat = errorMessageStringToFormat.substring(0, errorMessageStringToFormat.lastIndexOf('}') + 1);
    const errorMessagObj = JSON.parse(errorMessageStringToFormat);

    return errorMessagObj.additionalMessages;
  }

  /**
   * method to handle export data response shared between different components
   * @param response response from the export API
   * @param fileName filename of the CSV export
   */
  static handleExportDataResponse(response: StrictHttpResponse<Blob | void>, fileName: string): void {
    const now = new Date();
    const pad = (n: number): string => n.toString().padStart(2, '0');
    const year = now.getUTCFullYear();
    const month = pad(now.getUTCMonth() + 1);
    const day = pad(now.getUTCDate());
    const formattedDate = `${year}${month}${day}`;
    const filenameTemp = `${fileName}_${formattedDate}.csv`;
    const contentType = response.headers?.get('content-type') || 'text/csv';
    const filename = filenameTemp;
    Utility.openFile(response.body, contentType, filename);
  }

  static async countCsvRecordsFromBlob(blob: Blob): Promise<number> {
    if (!blob || blob.size === 0) {
      return 0;
    }

    const blobCopy = blob.slice(0, blob.size, blob.type);
    const csvText = await blobCopy.text();
    const lines = csvText.trim().split('\n');

    return lines.length > 1 ? lines.length - 1 : 0;
  }

  /**
   * method that generates and displays the file using Blob, passing the file, format type and filename
   * @param file file to generate
   * @param typeFile file format type
   * @param nameFile file name
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static openFile(file: any, typeFile: string, nameFile: string): void {
    const typeF = this.getTypeFile(typeFile);
    const blob = new Blob([file], { type: typeF });
    const fileURL = URL.createObjectURL(blob);
    const atr = document.createElement('a');
    atr.href = fileURL;
    atr.download = nameFile ?? '';
    atr.click(); // Scarica il file
  }

  static logErrorForDevEnvironment(err: HttpErrorResponse | unknown): void {
    const env = environment.environment;
    if (env && env === 'development') {
      console.error('Error', err);
    }
  }

  /**
   * get Icon associate at this value
   * @param carousel {Carousel<T>}
   */
  static getDraftCardIcon<T>(carousel: Carousel<T>): string | undefined {
    return carousel.icon && Object.keys(ICONS).includes(carousel.icon) ? ICONS[carousel.icon] : undefined;
  }

  /**
   *
   * @param typeViewMode
   * @param listToSplit
   */
  static buildCarouselArray<T>(typeViewMode: VIEW_MODE, listToSplit: T[]): T[][] {
    let itemForPages = 0;

    switch (typeViewMode) {
      case VIEW_MODE.DESKTOP:
        itemForPages = 3;
        break;
      case VIEW_MODE.TABLET:
        itemForPages = 2;
        break;
      case VIEW_MODE.MOBILE:
        itemForPages = 1;
        break;
    }

    const slides: T[][] = [];

    for (let i = 0; i < listToSplit.length; i += itemForPages) {
      slides.push(listToSplit.slice(i, i + itemForPages));
    }

    return slides;
  }

  /**
   * Function to prepare a payload for a PATCH request from a FormGroup.
   * It traverses the FormGroup and constructs an object where each control's value is included
   * along with a flag indicating whether the control has been modified (dirty or touched).
   * Nested FormGroups are handled recursively.
   * @param value
   * @returns
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static preparePayloadForPatch(value: FormGroup): Record<string, any> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: Record<string, any> = {};
    if (value && value.controls) {
      Object.keys(value.controls).forEach((key) => {
        if (value.get(key) instanceof FormGroup) {
          const subPayload = Utility.preparePayloadForPatch(value.get(key) as FormGroup);
          if (Object.keys(subPayload).length > 0) {
            payload[key] = subPayload;
          }
        } else {
          // if (value.get(key)?.dirty || value.get(key)?.touched) {
          const controlValue = value.get(key)?.value;
          let formattedValue = controlValue;
          // Check if value is a string matching d/m/y or dd/mm/yyyy
          if (Utility.isDateGenericFormat(controlValue)) {
            formattedValue = Utility.convertFromGenericDataToIsoString(controlValue);
          }
          payload[key] = {
            isModified: true,
            value: formattedValue === '' || formattedValue === undefined || formattedValue === null ? null : formattedValue
          };
          // }
        }
      });
    }

    return payload;
  }

  /**
   * Recursively checks if any form controls are invalid in the subject form,
   * excluding permanentEstablishmentDetail and invoiceDetail groups
   * @param form The form to validate
   * @returns True if any field is invalid, false otherwise
   */
  static checkFormValidity(form: FormGroup, excludedGroups: string[] = []): boolean {
    // List of form control groups to exclude

    // Recursive function to check controls
    const checkControls = (group: FormGroup): boolean => {
      for (const controlName in group.controls) {
        if (excludedGroups.includes(controlName)) {
          continue;
        }
        const control = group.controls[controlName];
        // eslint-disable-next-line no-extra-boolean-cast
        if (!!control.invalid) {
          return true;
        }
        if (control instanceof FormGroup) {
          const hasInvalidNested = checkControls(control as FormGroup);
          if (hasInvalidNested) {
            return true;
          }
        }
      }

      return false;
    };

    return checkControls(form);
  }

  static setPermissionHeaders(permission: string, permissionType: string): HttpContext {
    const httpContext = new HttpContext().set(X_PERMISSION, permission).set(X_PERMISSION_TYPE, permissionType);

    return httpContext;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static openGenericModal(modalService: any, modalComponent: any, model: any): any {
    const modalRef = modalService.open(modalComponent, MODAL_XL);
    modalRef.componentInstance.model = model;

    return modalRef;
  }

  /**
   * Map the API response to the HistoryModalModel structure.
   * @returns An array of HistoryModalModel objects.
   * @param apiItem {any} - The API response object containing field history data.
   * @param prefix {string} - A prefix string to be added to each field name.
   * @param currentLang {string} - The current language code ('en' for English, 'it' for Italian).
   */
  static mapHistoryApiResponseToModel(apiItem: any, prefix: string, currentLang: string): HistoryModalModel[] {
    const result: HistoryModalModel[] = [];

    Object.keys(apiItem).forEach((fieldName) => {
      const itemsArray = apiItem[fieldName] as FieldValueHistoryModel[]; // [array link by name]
      let lastUpdate = '';
      if (Array.isArray(itemsArray) && itemsArray.length > 0) {
        lastUpdate = Utility.getMostRecentDateString(itemsArray, currentLang);
        result.push({
          fieldName,
          prefixLabel: prefix,
          lastUpdate,
          items: itemsArray.map((el: FieldValueHistoryModel) => ({
            value: el.value || '',
            date: el.referenceDateTime ? this.getDateWithTime(el.referenceDateTime, currentLang) : ''
          }))
        });
      }
    });

    return result;
  }

  /**
   * Get the most recent date from an array of FieldValueHistoryModel objects and return it as a formatted string.
   * @returns A string representing the most recent date in the local format, or an empty string if no valid dates are found.
   * @param itemsArray {FieldValueHistoryModel[]} - An array of FieldValueHistoryModel objects.
   * @param currentLang {string} - The current language code ('en' for English, 'it' for Italian).
   */
  static getMostRecentDateString(itemsArray: FieldValueHistoryModel[], currentLang: string): string {
    // Filters only values that are defined and not empty (eliminates undefined/null).
    const dates = itemsArray.map((el) => el.referenceDateTime).filter((d): d is string => !!d);
    if (dates.length === 0) {
      return '';
    }
    const dateObjs = dates.map((d) => new Date(d));
    const maxDate = new Date(Math.max(...dateObjs.map((d) => d.getTime())));

    return this.getDateWithTime(maxDate, currentLang);
  }

  /**
   * Convert a date string to a localized date and time string.
   * @returns A string representing the date and time in the local format, or an empty string if the input date is null or undefined.
   * @param date {string | Date | null} - The date to be converted, can be a string, Date object, or null.
   * @param currentLang {string} - The current language code ('en' for English, 'it' for Italian).
   */
  static getDateWithTime(date: string | Date | null, currentLang: string): string {
    const lang = currentLang && currentLang === 'en' ? 'en-US' : 'it-IT';
    if (!date) {
      return '';
    } else if (typeof date === 'string') {
      return new Date(date).toLocaleString(lang).replace(',', '');
    } else {
      return date.toLocaleString(lang).replace(',', '');
    }
  }

  // DATE utilities

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static isDateGenericFormat(genericData: any): boolean {
    return (
      Utility.isDateFormatIsoString(genericData) ||
      Utility.isDateFormatString(genericData) ||
      Utility.isDateFormatDate(genericData) ||
      Utility.isDateFormatDatepicker(genericData)
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static isDateFormatIsoString(genericData: any): boolean {
    return genericData && typeof genericData === 'string' && genericData.includes('T') && !isNaN(Date.parse(genericData));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static isDateFormatString(genericData: any): boolean {
    return genericData && typeof genericData === 'string' && /^\d{1,2}\/\d{1,2}\/\d{1,4}$/.test(genericData);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static isDateFormatDate(genericData: any): boolean {
    return genericData && genericData instanceof Date;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static isDateFormatDatepicker(genericData: any): boolean {
    return genericData && typeof genericData === 'object' && 'day' in genericData && 'month' in genericData && 'year' in genericData;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static convertFromGenericDataToString(genericData: any): string {
    if (Utility.isDateFormatIsoString(genericData)) {
      return Utility.fromIsoStringToString(genericData);
    }
    if (Utility.isDateFormatString(genericData)) {
      return genericData;
    }
    if (Utility.isDateFormatDate(genericData)) {
      return Utility.fromDateToString(genericData);
    }
    if (Utility.isDateFormatDatepicker(genericData)) {
      return Utility.fromDatepickerToString(genericData);
    }

    return '';
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static convertFromGenericDataToIsoString(genericData: any): string {
    if (Utility.isDateFormatIsoString(genericData)) {
      return genericData;
    }
    if (Utility.isDateFormatString(genericData)) {
      return Utility.fromStringToIsoString(genericData);
    }
    if (Utility.isDateFormatDate(genericData)) {
      return Utility.fromDateToIsoString(genericData);
    }
    if (Utility.isDateFormatDatepicker(genericData)) {
      return Utility.fromDatepickerToIsoString(genericData);
    }

    return '';
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static convertFromGenericDataToDate(genericData: any): Date | null {
    if (Utility.isDateFormatIsoString(genericData)) {
      return Utility.fromIsoStringToDate(genericData);
    }
    if (Utility.isDateFormatString(genericData)) {
      return Utility.fromStringToDate(genericData);
    }
    if (Utility.isDateFormatDate(genericData)) {
      return genericData;
    }
    if (Utility.isDateFormatDatepicker(genericData)) {
      return Utility.fromDatepickerToDate(genericData);
    }

    return new Date();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static convertFromGenericDataToDatepicker(genericData: any): NgbDateStruct | null {
    if (Utility.isDateFormatIsoString(genericData)) {
      return Utility.fromIsoStringToDatepicker(genericData);
    }
    if (Utility.isDateFormatString(genericData)) {
      return Utility.fromStringToDatepicker(genericData);
    }
    if (Utility.isDateFormatDate(genericData)) {
      return Utility.fromDateToDatepicker(genericData);
    }
    if (Utility.isDateFormatDatepicker(genericData)) {
      return genericData;
    }

    return null;
  }

  /**
   * Convert a string in the format dd/MM/yyyy to an NgbDateStruct.
   * @returns An NgbDateStruct representing the date, or null if the input string is null, undefined, or invalid.
   * @param dateString
   */
  static fromStringToDatepicker(dateString: string | null): NgbDateStruct | null {
    if (dateString) {
      const date = dateString.split(Utility.DELIMITER);

      return {
        day: parseInt(date[0], 10),
        month: parseInt(date[1], 10),
        year: parseInt(date[2], 10)
      };
    }

    return null;
  }

  /**
   * Convert a string in the format dd/MM/yyyy to a string in ISO 8601 format.
   * @returns A string representing the date in ISO 8601 format, or an empty string if the input string is null, undefined, or invalid.
   * @param dateString
   */
  static fromStringToIsoString(dateString: string): string {
    const value = Utility.fromStringToDatepicker(dateString);

    if (!value) {
      return '';
    }

    try {
      return this.fromDatepickerToIsoString(value);
    } catch (e) {
      Utility.logErrorForDevEnvironment(e);

      return '';
    }
  }

  /**
   * Convert a string in the format dd/MM/yyyy to a Date object.
   * @returns A Date object representing the date, or null if the input string is null, undefined, or invalid.
   * @param dateString
   */
  static fromStringToDate(dateString: string): Date | null {
    if (!dateString) {
      return null;
    }

    const value = Utility.fromStringToDatepicker(dateString);

    return value ? Utility.fromDatepickerToDate(value) : null;
  }

  /**
   * Convert an NgbDateStruct to a string in ISO 8601 format.
   * @returns A string representing the date in ISO 8601 format, or an empty string if the input is invalid.
   * @param datepicker
   */
  static fromDatepickerToIsoString(datepicker: NgbDateStruct): string {
    if (!datepicker.day || !datepicker.month || !datepicker.year) {
      return '';
    }

    const date = Utility.fromDatepickerToDate(datepicker);

    return date ? date.toISOString() : '';
  }

  /**
   * Convert an NgbDateStruct to a string in the format dd/MM/yyyy.
   * @returns A string representing the date in the format dd/MM/yyyy, or an empty string if the input is null.
   * @param datepicker
   */
  static fromDatepickerToString(datepicker: NgbDateStruct | null): string {
    if (!datepicker) {
      return '';
    }
    const day = datepicker?.day?.toString()?.slice(0, 2)?.padStart(2, '0');
    const month = datepicker?.month?.toString()?.slice(0, 2)?.padStart(2, '0');
    const year = datepicker?.year?.toString()?.slice(0, 4)?.padStart(4, '0');

    return `${day}${this.DELIMITER}${month}${this.DELIMITER}${year}`;
  }

  /**
   * Convert an NgbDateStruct to a Date object.
   * @returns A Date object representing the date.
   * @param datepicker
   */
  static fromDatepickerToDate(datepicker: NgbDateStruct): Date {
    return new Date(Date.UTC(datepicker.year, datepicker.month - 1, datepicker.day));
  }

  /**
   * Convert an ISO 8601 date string to a Date object.
   * @returns A Date object representing the date, or null if the input string is null, undefined, or invalid.
   * @param dateIsoString
   */
  static fromIsoStringToDate(dateIsoString: string): Date | null {
    if (!dateIsoString) {
      return null;
    }
    try {
      return new Date(dateIsoString);
    } catch (e) {
      Utility.logErrorForDevEnvironment(e);

      return null;
    }
  }

  /**
   * Convert an ISO 8601 date string to a string in the format dd/MM/yyyy.
   * @returns A string representing the date in the format dd/MM/yyyy, or an empty string if the input string is null, undefined, or invalid.
   * @param dateIsoString
   */
  static fromIsoStringToString(dateIsoString: string): string {
    const date = Utility.fromIsoStringToDate(dateIsoString);

    if (!date) {
      return '';
    }

    try {
      return this.fromDateToString(date);
    } catch (e) {
      Utility.logErrorForDevEnvironment(e);

      return '';
    }
  }

  /**
   * Convert an ISO 8601 date string to an NgbDateStruct.
   * @returns An NgbDateStruct representing the date, or null if the input string is null, undefined, or invalid.
   * @param dateIsoString
   */
  static fromIsoStringToDatepicker(dateIsoString: string): NgbDateStruct | null {
    if (!dateIsoString) {
      return null;
    }

    const date = Utility.fromIsoStringToDate(dateIsoString);

    return date ? Utility.fromDateToDatepicker(date) : null;
  }

  /**
   * Convert a Date object to a string in ISO 8601 format.
   * @returns A string representing the date in ISO 8601 format.
   * If the input date is null or undefined, an empty string is returned.
   * @param date
   */
  static fromDateToIsoString(date: Date): string {
    return date.toISOString();
  }

  /**
   * Convert a Date object to a string in the format dd/MM/yyyy.
   * @returns A string representing the date in the format dd/MM/yyyy, or an empty string if the input date is null or undefined.
   * @param date
   */
  static fromDateToString(date: Date): string {
    if (!date) {
      return '';
    }
    const day = date.getDate().toString().slice(0, 2).padStart(2, '0');
    const month = (date.getMonth() + 1).toString().slice(0, 2).padStart(2, '0');
    const year = date.getFullYear().toString().slice(0, 4).padStart(4, '0');

    return `${day}${this.DELIMITER}${month}${this.DELIMITER}${year}`;
  }

  /**
   * Convert a Date object to an NgbDateStruct.
   * @returns An NgbDateStruct representing the date, or null if the input date is null or undefined.
   * @param date
   */
  static fromDateToDatepicker(date: Date): NgbDateStruct | null {
    if (!date) {
      return null;
    }

    return {
      day: date.getDate(),
      month: date.getMonth() + 1,
      year: date.getFullYear()
    };
  }

  /**
   * return extension type file
   * @param type type to convert
   * @private
   */
  private static getTypeFile(type: string): string {
    switch (type) {
      case 'PDF':
        return 'application/pdf';
      case 'CSV':
        return 'text/csv';
      case 'EXC':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      default:
        return '';
    }
  }

  /**
   * Parse a date string in format "dd/MM/yyyy HH:mm:ss" to a Date object.
   * @param dateStr The date string to parse.
   * @returns Date object or null if invalid.
   */
  static parseDateTimeString(dateStr: string): Date | null {
    if (!dateStr) {
      return null;
    }
    const [datePart, timePart] = dateStr.split(' ');
    if (!datePart || !timePart) {
      return null;
    }
    const [day, month, year] = datePart.split('/').map(Number);
    const [hour, minute, second] = timePart.split(':').map(Number);
    if (
      isNaN(day) || isNaN(month) || isNaN(year) ||
      isNaN(hour) || isNaN(minute) || isNaN(second)
    ) {
      return null;
    }

    return new Date(year, month - 1, day, hour, minute, second);
  }
}
