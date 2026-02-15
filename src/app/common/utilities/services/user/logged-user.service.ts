import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoggedUserService {
  private _accessToken = new BehaviorSubject<unknown | null>(null);

  get accessToken$(): Observable<unknown | null> {
    return this._accessToken.asObservable();
  }

  update(userData: unknown) {
    this._accessToken.next(userData);
  }
}

export class LoggedUser {
  authorityType?: string; // MSSTS
  environment?: string; // login.windows.net
  homeAccountId?: string; // oid.tid
  idToken!: string; // eyJ0eX...
  idTokenClaims?: {
    aud?: string; // 36xxxxxx-xxxx-xxxx-xxxx-xxxxxxxx0fd0
    auth_time?: unknown; // 1700000737
    exp?: unknown; // 1700000748
    iat?: unknown; // 1700000848
    iss?: string; // https://login.microsoftonline.com/tid/v2.0
    name?: string; // Nome Cognome.EXT(EXT) // name
    nbf?: unknown; // 1700000848
    nonce?: string; // 01xxxxxx-xxxx-xxxx-xxxx-xxxxxxxx4535
    oid?: string; // 8axxxxxx-xxxx-xxxx-xxxx-xxxxxxxx500f // localAccountId
    preferred_username?: string; // upn
    rh?: string; // 1.ATxxxxxxxxxxxxxxxxxxxxx_xxxxxxxxxxxxxxxxxxxxxxxxU8AA.
    sid?: string; // 00xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxa1570
    sub?: string; // GOxxxxxxxxxxxxxxxxxxxxxxxxxxxxxOtiV_xxxxx9o
    tid?: string; // e6xxxxxx-xxxx-xxxx-xxxx-xxxxxxxx3f3b // tenantID
    upn?: string; // exITxxxxx@gls-global.com // username
    uti?: string; // mV_xxxxxxxxxxx-xxxwqAA
    ver?: string; // 2.0
  }; //
  localAccountId?: string; // oid
  name?: string; // name
  nativeAccountId?: unknown; // undefined
  tenantId?: string; // tid
  tenantProfiles?: unknown; // map key/value [tid; {tenantId: tid, localAccountId: oid, name: name, isHomeTenant: true}]
  username?: string; // upn
}
