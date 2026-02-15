import { CONCURRENCY } from './constants/concurrency';
import { Observable } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

export class UtilityConcurrency {
  /**
   * Handles the session concurrency logic.
   * @param entityId - The ID of the entity being interacted with, or null if no entity is selected.
   * @param lastInteractionTime - The timestamp of the last interaction with the entity.
   * @param lockEntity - Function to call the lock API for the entity.
   * @param showMessage - Function to show message when session is expired.
   * @param redirect - Function to redirect the user.
   */
  static handleInterval(
    entityId: number | null,
    lastInteractionTime: number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    lockEntity: (entityId: number) => Observable<any>,
    openErrorModal: (title: string, message: string) => void,
    redirect: () => void
  ): void {
    const now = new Date().getTime();
    // If there was an interaction in the last n minutes, call LOCK API
    if (now - lastInteractionTime < CONCURRENCY.sessionMaxTimeMs && entityId !== null) {
      lockEntity(entityId).subscribe({
        // Optionally handle lock response
        error: (err: HttpErrorResponse) => {
          openErrorModal('genericError', err.message);
        }
      });
    } else if (now - lastInteractionTime >= CONCURRENCY.sessionMaxTimeMs) {
      // If no interaction, show session expired modal and exit
      openErrorModal('concurrency.modalTitle', 'concurrency.sessionExpired');
      setTimeout(() => {
        redirect();
      }, CONCURRENCY.redirectDelayMs);
    }
  }
}
