/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines-per-function */
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Utility } from './utility';
import { UserDetailsModel } from '../../api/glsUserApi/models';
import { BehaviorSubject } from 'rxjs';
import { FUNCTIONALITY, PERMISSION, PROFILE } from './constants/profile';
import { UserProfileService } from './services/profile/user-profile.service';
import { environment } from '../../../environments/environment';
import { UtilityProfile } from './utility-profile';
import { ICONS } from './constants/icon';
import { VIEW_MODE } from '../app.constants';

describe('Utility', () => {
  let translateServiceSpy: jasmine.SpyObj<TranslateService>;
  let originalEnv: any;
  let userProfileService: jasmine.SpyObj<UserProfileService>;
  let profile$: BehaviorSubject<UserDetailsModel | null>;
  let impersonatedUser$: BehaviorSubject<UserDetailsModel | null>;

  beforeEach(() => {
    profile$ = new BehaviorSubject<UserDetailsModel | null>(null);
    impersonatedUser$ = new BehaviorSubject<UserDetailsModel | null>(null);
    translateServiceSpy = jasmine.createSpyObj('TranslateService', ['instant']);
    originalEnv = { ...environment };
    userProfileService = jasmine.createSpyObj('UserProfileService', [], {
      profile$,
      impersonatedUser$
    });
  });

  afterEach(() => {
    // Restore the original environment
    environment.environment = originalEnv.environment;
  });

  it('should return true if user is EVA_ADMIN', () => {
    profile$.next({ profile: PROFILE.EVA_ADMIN, roles: [] });

    const result = UtilityProfile.checkAccessProfile(userProfileService, PROFILE.any, FUNCTIONALITY.any, PERMISSION.any);

    expect(result).toBeTrue();
  });

  it('should translate text', () => {
    const text = 'hello';
    const translatedText = 'ciao';
    translateServiceSpy.instant.and.returnValue(translatedText);

    const result = Utility.translate(text, translateServiceSpy);

    expect(result).toBe(translatedText);
    expect(translateServiceSpy.instant).toHaveBeenCalledWith(text, undefined);
  });

  it('should log error in development environment', () => {
    environment.environment = 'development';
    const error = new HttpErrorResponse({ status: 500, statusText: 'Server Error' });
    spyOn(console, 'error');

    Utility.logErrorForDevEnvironment(error);

    expect(console.error).toHaveBeenCalledWith('Error', error);
  });

  it('should not log error in non-development environment', () => {
    environment.environment = 'production';
    const error = new HttpErrorResponse({ status: 500, statusText: 'Server Error' });
    spyOn(console, 'error');

    Utility.logErrorForDevEnvironment(error);

    expect(console.error).not.toHaveBeenCalled();
  });

  it('should set atr.download to empty string if nameFile is undefined', () => {
    // Arrange
    spyOn(Utility as any, 'getTypeFile').and.returnValue('application/pdf');
    spyOn(URL, 'createObjectURL').and.returnValue('blob:http://localhost/fake-url');
    const clickSpy = jasmine.createSpy('click');
    const anchorMock = { href: '', download: '', click: clickSpy } as any;
    spyOn(document, 'createElement').and.returnValue(anchorMock);

    // Act
    Utility.openFile('test content', 'PDF', undefined as any);

    // Assert
    expect(anchorMock.download).toBe('');
    expect(clickSpy).toHaveBeenCalled();
  });

  it('should return application/pdf for PDF', () => {
    const result = (Utility as any).getTypeFile('PDF');
    expect(result).toBe('application/pdf');
  });

  it('should return text/csv for CSV', () => {
    const result = (Utility as any).getTypeFile('CSV');
    expect(result).toBe('text/csv');
  });

  it('should return Excel MIME type for EXC', () => {
    const result = (Utility as any).getTypeFile('EXC');
    expect(result).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  });

  it('should return empty string for unknown type', () => {
    const result = (Utility as any).getTypeFile('TXT');
    expect(result).toBe('');
  });

  it('should return required field indicator', () => {
    const form = new FormGroup({
      name: new FormControl('', Validators.required)
    });

    const result = Utility.requiredFieldControl(form, 'name');

    expect(result).toBe('*');
  });

  it('should return sliced text if length is greater than x', () => {
    const text = 'HelloWorld';
    const result = Utility.sliceOverX(text, 5);
    expect(result).toBe('Hello');
  });

  it('should return original text if length is equal to x', () => {
    const text = 'Hello';
    const result = Utility.sliceOverX(text, 5);
    expect(result).toBe('Hello');
  });

  it('should return original text if length is less than x', () => {
    const text = 'Hi';
    const result = Utility.sliceOverX(text, 5);
    expect(result).toBe('Hi');
  });

  it('should return undefined if text is undefined', () => {
    const result = Utility.sliceOverX(undefined as any, 5);
    expect(result).toBeUndefined();
  });

  it('should return true if the control is required', () => {
    const form = new FormGroup({
      name: new FormControl('', Validators.required)
    });

    const result = Utility.isrRquiredFieldControl(form, 'name');

    expect(result).toBeTrue();
  });

  it('should return false if the control is not required', () => {
    const form = new FormGroup({
      name: new FormControl('')
    });

    const result = Utility.isrRquiredFieldControl(form, 'name');

    expect(result).toBeFalse();
  });

  it('should return empty string if field is not required', () => {
    const form = new FormGroup({
      name: new FormControl('')
    });

    const result = Utility.requiredFieldControl(form, 'name');

    expect(result).toBe('');
  });

  it('should return errorMessage.required if errors.numeric is present and errorMessage.required is provided', () => {
    const errors = { numeric: true };
    const errorMessage = { required: 'Numeric required' };

    const result = Utility.getErrorMessage(errors, errorMessage);

    expect(result).toBe('Numeric required');
  });

  it('should return generic.error.pattern if errors.numeric is present and errorMessage.required is not provided', () => {
    const errors = { numeric: true };
    const errorMessage = {};

    const result = Utility.getErrorMessage(errors, errorMessage);

    expect(result).toBe('generic.error.pattern');
  });

  it('should return errorMessage.pattern if errors.ngbDate.invalid is true and errorMessage.pattern is provided', () => {
    const errors = { ngbDate: { invalid: true } };
    const errorMessage = { pattern: 'Invalid date pattern' };

    const result = Utility.getErrorMessage(errors, errorMessage);

    expect(result).toBe('Invalid date pattern');
  });

  it('should return generic.error.pattern if errors.ngbDate.invalid is true and errorMessage.pattern is not provided', () => {
    const errors = { ngbDate: { invalid: true } };
    const errorMessage = {};

    const result = Utility.getErrorMessage(errors, errorMessage);

    expect(result).toBe('generic.error.pattern');
  });

  it('should handle export data response and generate file with formatted date', () => {
    // Arrange
    const mockBlob = new Blob(['test data'], { type: 'text/csv' });
    const mockHeaders = new Map();
    mockHeaders.set('content-type', 'text/csv');
    const mockResponse = {
      body: mockBlob,
      headers: {
        get: jasmine.createSpy('get').and.returnValue('text/csv')
      }
    } as any;
    spyOn(Utility, 'openFile');
    // Mock Date to ensure consistent filename
    const mockDate = new Date('2023-12-25T10:30:00Z');
    spyOn(window, 'Date').and.returnValue(mockDate as any);
    // Act
    Utility.handleExportDataResponse(mockResponse, 'test-export');
    // Assert
    expect(Utility.openFile).toHaveBeenCalledWith(mockBlob, 'text/csv', 'test-export_20231225.csv');
  });

  it('should create a blob, set up a download link, and trigger click', () => {
    // Arrange
    const fileContent = 'test content';
    const typeFile = 'PDF';
    const nameFile = 'test.pdf';
    const fakeUrl = 'blob:http://localhost/fake-url';

    spyOn(Utility as any, 'getTypeFile').and.returnValue('application/pdf');
    spyOn(URL, 'createObjectURL').and.returnValue(fakeUrl);

    const clickSpy = jasmine.createSpy('click');
    const setAttributeSpy = jasmine.createSpy('setAttribute');
    const anchorMock = {
      href: '',
      download: '',
      click: clickSpy,
      setAttribute: setAttributeSpy
    } as any;

    spyOn(document, 'createElement').and.returnValue(anchorMock);

    // Act
    Utility.openFile(fileContent, typeFile, nameFile);

    // Assert
    expect((Utility as any).getTypeFile).toHaveBeenCalledWith(typeFile);
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(anchorMock.href).toBe(fakeUrl);
    expect(anchorMock.download).toBe(nameFile);
    expect(clickSpy).toHaveBeenCalled();
  });

  it('should return error message for required field', () => {
    const errors = { required: true };
    const errorMessage = { required: 'Field is required' };

    const result = Utility.getErrorMessage(errors, errorMessage);

    expect(result).toBe('Field is required');
  });

  it('should return default error message for required field', () => {
    const errors = { required: true };

    const result = Utility.getErrorMessage(errors);

    expect(result).toBe('generic.error.required');
  });

  it('should return HTTP error status', () => {
    const error = new HttpErrorResponse({ status: 404 });

    const result = Utility.getHttpErrorStatus(error);

    expect(result).toBe(404);
  });

  it('should return HTTP error message', () => {
    const errorResponse = new HttpErrorResponse({
      error: { message: '{"message":"Not Found"}' },
      status: 404,
      statusText: 'Not Found'
    });

    const result = Utility.getHttpErrorMessage(errorResponse);

    expect(result).toBe('Not Found');
  });

  it('should return HTTP error additional messages', () => {
    const errorResponse = new HttpErrorResponse({
      error: { message: '{"additionalMessages":["Error 1", "Error 2"]}' },
      status: 400,
      statusText: 'Bad Request'
    });

    const result = Utility.getHttpErrorAdditionalMessage(errorResponse);

    expect(result).toEqual(['Error 1', 'Error 2']);
  });

  it('should return pattern error message', () => {
    const errors = { pattern: true };
    const errorMessage = { pattern: 'Invalid pattern' };

    const result = Utility.getErrorMessage(errors, errorMessage);

    expect(result).toBe('Invalid pattern');
  });

  it('should return default pattern error message', () => {
    const errors = { pattern: true };

    const result = Utility.getErrorMessage(errors);

    expect(result).toBe('generic.error.pattern');
  });

  it('should return minLength error message', () => {
    const errors = { minLength: true };
    const errorMessage = { minLength: 'Too short' };

    const result = Utility.getErrorMessage(errors, errorMessage);

    expect(result).toBe('Too short');
  });

  it('should return default minLength error message', () => {
    const errors = { minLength: true };

    const result = Utility.getErrorMessage(errors);

    expect(result).toBe('generic.error.minLength');
  });

  it('should return maxLength error message', () => {
    const errors = { maxLength: true };
    const errorMessage = { maxLength: 'Too long' };

    const result = Utility.getErrorMessage(errors, errorMessage);

    expect(result).toBe('Too long');
  });

  it('should return default maxLength error message', () => {
    const errors = { maxLength: true };

    const result = Utility.getErrorMessage(errors);

    expect(result).toBe('generic.error.maxLength');
  });

  it('should return email error message', () => {
    const errors = { email: true };
    const errorMessage = { email: 'Invalid email' };

    const result = Utility.getErrorMessage(errors, errorMessage);

    expect(result).toBe('Invalid email');
  });

  it('should return default email error message', () => {
    const errors = { email: true };

    const result = Utility.getErrorMessage(errors);

    expect(result).toBe('generic.error.email');
  });

  it('should return custom error message', () => {
    const errors = { custom: true };
    const errorMessage = { custom: 'Custom error' };

    const result = Utility.getErrorMessage(errors, errorMessage);

    expect(result).toBe('Custom error');
  });

  it('should return default custom error message', () => {
    const errors = { custom: true };

    const result = Utility.getErrorMessage(errors);

    expect(result).toBe('generic.error.generic');
  });
  it('should return empty string if errors is null', () => {
    const result = Utility.getErrorMessage(null);

    expect(result).toBe('');
  });

  it('should return empty string if errors is an empty object', () => {
    const result = Utility.getErrorMessage(null);

    expect(result).toBe('');
  });
  it('should return the original text if translate is false', () => {
    const text = 'hello';
    const result = Utility.translate(text, null as any);

    expect(result).toBe(text);
  });

  it('should return the original text if translate is undefined', () => {
    const text = 'hello';
    const result = Utility.translate(text, undefined as any);

    expect(result).toBe(text);
  });

  it('should return the correct icon for a given slide', () => {
    const mockSlideWithIcon = { icon: 'building' } as any;
    const mockSlideWithoutIcon = { icon: 'invalidIcon' } as any;
    const mockSlideNullIcon = {} as any;

    const resultWithIcon = Utility.getDraftCardIcon(mockSlideWithIcon);
    expect(resultWithIcon).toBe(ICONS['building']);

    const resultWithoutIcon = Utility.getDraftCardIcon(mockSlideWithoutIcon);
    expect(resultWithoutIcon).toBeUndefined();

    const resultNullIcon = Utility.getDraftCardIcon(mockSlideNullIcon);
    expect(resultNullIcon).toBeUndefined();
  });

  it('should split the array correctly for each VIEW_MODE', () => {
    const list = [1, 2, 3, 4, 5, 6, 7];

    let result = Utility.buildCarouselArray(VIEW_MODE.DESKTOP, list);
    expect(result).toEqual([[1, 2, 3], [4, 5, 6], [7]]);

    result = Utility.buildCarouselArray(VIEW_MODE.TABLET, list);
    expect(result).toEqual([[1, 2], [3, 4], [5, 6], [7]]);

    result = Utility.buildCarouselArray(VIEW_MODE.MOBILE, list);
    expect(result).toEqual([[1], [2], [3], [4], [5], [6], [7]]);
  });

  it('should return 0 for an empty blob', async () => {
    const blob = new Blob([''], { type: 'text/csv' });
    const count = await Utility.countCsvRecordsFromBlob(blob);
    expect(count).toBe(0);
  });

  it('should return 0 for a blob with only header', async () => {
    const blob = new Blob(['name,age'], { type: 'text/csv' });
    const count = await Utility.countCsvRecordsFromBlob(blob);
    expect(count).toBe(0);
  });

  it('should return correct count for blob with header and data', async () => {
    const blob = new Blob(['name,age\nAlice,30\nBob,25'], { type: 'text/csv' });
    const count = await Utility.countCsvRecordsFromBlob(blob);
    expect(count).toBe(2);
  });

  it('should ignore trailing newline', async () => {
    const blob = new Blob(['name,age\nAlice,30\nBob,25\n'], { type: 'text/csv' });
    const count = await Utility.countCsvRecordsFromBlob(blob);
    expect(count).toBe(2);
  });

  it('should handle blob with empty lines', async () => {
    const blob = new Blob(['name,age\nAlice,30\n\nBob,25'], { type: 'text/csv' });
    const count = await Utility.countCsvRecordsFromBlob(blob);
    expect(count).toBe(3);
  });

  describe('getDateWithTime', () => {
    it('should format ISO string date and remove comma (it-IT)', () => {
      const isoString = '2024-06-01T15:30:00.000Z';
      const result = Utility.getDateWithTime(isoString, 'it');
      expect(result).not.toContain(',');
      expect(result).toContain('2024');
    });

    it('should format Date object and remove comma (en-US)', () => {
      const dateObj = new Date('2024-06-01T15:30:00.000Z');
      const result = Utility.getDateWithTime(dateObj, 'en');
      expect(result).not.toContain(',');
      expect(result).toContain('2024');
    });

    it('should return empty string for null', () => {
      const result = Utility.getDateWithTime(null, 'it');
      expect(result).toBe('');
    });

    it('should return empty string for undefined', () => {
      const result = Utility.getDateWithTime(undefined as any, 'it');
      expect(result).toBe('');
    });

    it('should return empty string for empty string', () => {
      const result = Utility.getDateWithTime('', 'it');
      expect(result).toBe('');
    });
  });

  describe('getMostRecentDateString', () => {
    it('should return the most recent date formatted (it-IT)', () => {
      const itemsArray: { referenceDateTime?: string; value: string }[] = [
        { referenceDateTime: '2024-06-01T10:00:00.000Z', value: 'A' },
        { referenceDateTime: '2024-06-02T10:00:00.000Z', value: 'B' }
      ];
      const result = Utility.getMostRecentDateString(itemsArray, 'it');
      expect(result).toContain('2024');
      expect(result).not.toContain(',');
    });

    it('should return empty string if no valid dates', () => {
      const itemsArray: { referenceDateTime?: string; value: string }[] = [
        { referenceDateTime: '', value: 'A' },
        { value: 'B' } // referenceDateTime omitted (undefined)
      ];
      const result = Utility.getMostRecentDateString(itemsArray, 'it');
      expect(result).toBe('');
    });
  });

  describe('mapHistoryApiResponseToModel', () => {
    it('should map API response to HistoryModalModel array (it-IT)', () => {
      const apiItem = {
        field1: [
          { value: 'A', referenceDateTime: '2024-06-01T10:00:00.000Z' },
          { value: 'B', referenceDateTime: '2024-06-02T10:00:00.000Z' }
        ],
        field2: [{ value: 'C', referenceDateTime: '2024-06-03T10:00:00.000Z' }]
      };
      const prefix = 'PRE';
      const currentLang = 'it';
      const result = Utility.mapHistoryApiResponseToModel(apiItem, prefix, currentLang);

      expect(result.length).toBe(2);
      expect(result[0].fieldName).toBe('field1');
      expect(result[0].prefixLabel).toBe(prefix);
      expect(result[0].lastUpdate).toContain('2024');
      expect(result[0].items?.length).toBe(2);
      expect(result[0].items?.[0].value).toBe('A');
      expect(result[0].items?.[0].date).toContain('2024');
      expect(result[1].fieldName).toBe('field2');
      expect(result[1].items?.length).toBe(1);
    });

    it('should return empty array if apiItem is empty', () => {
      const apiItem = {};
      const result = Utility.mapHistoryApiResponseToModel(apiItem, 'PRE', 'it');
      expect(result).toEqual([]);
    });

    it('should skip fields with empty itemsArray', () => {
      const apiItem = {
        field1: []
      };
      const result = Utility.mapHistoryApiResponseToModel(apiItem, 'PRE', 'it');
      expect(result).toEqual([]);
    });
  });

  describe('parseDateTimeString', () => {
    it('should parse a valid "dd/MM/yyyy HH:mm:ss" string', () => {
      const dateStr = '19/08/2025 09:50:23';
      const result = Utility.parseDateTimeString(dateStr);
      expect(result).toEqual(new Date(2025, 7, 19, 9, 50, 23)); // month is 0-based
    });

    it('should return null for invalid format', () => {
      expect(Utility.parseDateTimeString('2025-08-19T09:50:23')).toBeNull();
      expect(Utility.parseDateTimeString('19-08-2025 09:50:23')).toBeNull();
      expect(Utility.parseDateTimeString('')).toBeNull();
      expect(Utility.parseDateTimeString(undefined as any)).toBeNull();
    });

    it('should return null if time part is missing', () => {
      expect(Utility.parseDateTimeString('19/08/2025')).toBeNull();
    });

    it('should return null if date part is missing', () => {
      expect(Utility.parseDateTimeString('09:50:23')).toBeNull();
    });

    it('should return null if any part is NaN', () => {
      expect(Utility.parseDateTimeString('aa/bb/cccc dd:ee:ff')).toBeNull();
    });
  });
});
