import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StructureDisableService {
  private _disableStructure = new BehaviorSubject<boolean>(false);

  get disableStructure$(): Observable<boolean> {
    return this._disableStructure.asObservable();
  }

  toDisable(disable: boolean) {
    this._disableStructure.next(disable);
  }
}
