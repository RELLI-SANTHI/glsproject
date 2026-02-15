/* eslint-disable max-lines-per-function */
import { UtilityConcurrency } from './utility-concurrency';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { CONCURRENCY } from './constants/concurrency';

describe('UtilityConcurrency', () => {
  const mockEntityId = 123;
  let lockEntitySpy: jasmine.Spy;
  let openErrorModalSpy: jasmine.Spy;
  let redirectSpy: jasmine.Spy;

  const fixedNow = new Date(2025, 6, 18, 12, 0, 0).getTime(); // July 18, 2025, 12:00:00

  beforeEach(() => {
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date(fixedNow));

    lockEntitySpy = jasmine.createSpy().and.returnValue(of({}));
    openErrorModalSpy = jasmine.createSpy();
    redirectSpy = jasmine.createSpy();
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('should call lockEntity if session is active and entityId is not null', () => {
    const recentInteraction = fixedNow - (CONCURRENCY.sessionMaxTimeMs - 1000);

    UtilityConcurrency.handleInterval(mockEntityId, recentInteraction, lockEntitySpy, openErrorModalSpy, redirectSpy);

    expect(lockEntitySpy).toHaveBeenCalledWith(mockEntityId);
    expect(openErrorModalSpy).not.toHaveBeenCalled();
    expect(redirectSpy).not.toHaveBeenCalled();
  });

  it('should show session expired modal and redirect if session is expired', (done) => {
    const oldInteraction = fixedNow - (CONCURRENCY.sessionMaxTimeMs + 1000);

    UtilityConcurrency.handleInterval(mockEntityId, oldInteraction, lockEntitySpy, openErrorModalSpy, redirectSpy);

    expect(openErrorModalSpy).toHaveBeenCalledWith('concurrency.modalTitle', 'concurrency.sessionExpired');

    jasmine.clock().tick(CONCURRENCY.redirectDelayMs + 10);

    expect(redirectSpy).toHaveBeenCalled();
    done();
  });

  it('should not call lockEntity if entityId is null', () => {
    const recentInteraction = fixedNow - (CONCURRENCY.sessionMaxTimeMs - 1000);

    UtilityConcurrency.handleInterval(null, recentInteraction, lockEntitySpy, openErrorModalSpy, redirectSpy);

    expect(lockEntitySpy).not.toHaveBeenCalled();
    expect(openErrorModalSpy).not.toHaveBeenCalled();
    expect(redirectSpy).not.toHaveBeenCalled();
  });

  it('should show error modal if lockEntity fails', () => {
    const errorResponse = new HttpErrorResponse({
      error: 'Error',
      status: 500,
      statusText: 'Server Error',
      url: 'http://fake-url.com'
    });

    lockEntitySpy.and.returnValue(throwError(() => errorResponse));

    const recentInteraction = fixedNow - (CONCURRENCY.sessionMaxTimeMs - 1000);

    UtilityConcurrency.handleInterval(mockEntityId, recentInteraction, lockEntitySpy, openErrorModalSpy, redirectSpy);

    expect(lockEntitySpy).toHaveBeenCalledWith(mockEntityId);
    expect(openErrorModalSpy).toHaveBeenCalledWith('genericError', errorResponse.message);
    expect(redirectSpy).not.toHaveBeenCalled();
  });
});
